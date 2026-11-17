"""Per-IP rate limits on the submission routes, checked before the body is read."""

import logging
import math
import time
from collections import OrderedDict, deque
from collections.abc import Callable
from dataclasses import dataclass

from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Receive, Scope, Send

logger = logging.getLogger("kiaratech.ratelimit")

MAX_TRACKED_CLIENTS = 50_000  # bounds memory under a flood from many addresses; oldest are forgotten first


@dataclass(frozen=True)
class Limit:
    requests: int
    window_seconds: float


def client_ip(scope: Scope, trusted_proxy_hops: int) -> str:
    """The visitor's address. Behind N trusted proxies, each appends to X-Forwarded-For, so the Nth entry from
    the right is the last one a proxy wrote. Entries further left come from the client and can be forged."""
    peer = (scope.get("client") or ("unknown", 0))[0]
    if trusted_proxy_hops <= 0:
        return peer
    header = dict(scope["headers"]).get(b"x-forwarded-for", b"").decode("latin-1")
    hops = [entry.strip() for entry in header.split(",") if entry.strip()]
    return hops[-trusted_proxy_hops] if len(hops) >= trusted_proxy_hops else peer


class RateLimit:
    """Sliding-window limit per client IP and path, for POST requests to the listed paths.

    shortcut: counts live in this process, so each replica enforces its own limit. Upgrade to a shared store
    (for example Azure Cache for Redis) if the app runs more than a couple of replicas.
    """

    def __init__(
        self,
        app: ASGIApp,
        limits: dict[str, Limit],
        trusted_proxy_hops: int,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self.app = app
        self.limits = limits
        self.trusted_proxy_hops = trusted_proxy_hops
        self.clock = clock
        self.hits: OrderedDict[tuple[str, str], deque[float]] = OrderedDict()

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        limit = self.limits.get(scope["path"]) if scope["type"] == "http" and scope["method"] == "POST" else None
        if limit is not None:
            retry_after = self._hit((client_ip(scope, self.trusted_proxy_hops), scope["path"]), limit)
            if retry_after:
                logger.warning("rate limited path=%s", scope["path"])  # no IP: it is personal data
                response = JSONResponse(
                    {"title": "Too many attempts. Please wait a few minutes and try again."},
                    status_code=429,
                    headers={"Retry-After": str(retry_after)},
                )
                await response(scope, receive, send)
                return
        await self.app(scope, receive, send)

    def _hit(self, key: tuple[str, str], limit: Limit) -> int:
        """Records an attempt. Returns 0 when allowed, else the seconds until the oldest attempt expires."""
        now = self.clock()
        hits = self.hits.pop(key, None) or deque()
        while hits and hits[0] <= now - limit.window_seconds:
            hits.popleft()
        self.hits[key] = hits  # re-inserted last: most recently seen
        if len(self.hits) > MAX_TRACKED_CLIENTS:
            self.hits.popitem(last=False)
        if len(hits) >= limit.requests:
            return max(1, math.ceil(hits[0] + limit.window_seconds - now))
        hits.append(now)
        return 0
