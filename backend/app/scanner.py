"""Malware scanning with ClamAV (clamd INSTREAM protocol), run as a sidecar container next to the API.

Files are scanned before they reach SharePoint. Any doubt (scanner down, timeout, odd reply) fails closed.
"""

import logging
import struct
from typing import Protocol

import anyio

logger = logging.getLogger("kiaratech.scanner")

_CHUNK = 64 * 1024


class ScanUnavailable(Exception):
    """The scan did not complete, so the file must not be accepted."""


class Scanner(Protocol):
    async def is_clean(self, content: bytes) -> bool: ...


class ClamAvScanner:
    def __init__(self, host: str, port: int, timeout: float = 30) -> None:
        self.host = host
        self.port = port
        self.timeout = timeout

    async def is_clean(self, content: bytes) -> bool:
        try:
            with anyio.fail_after(self.timeout):
                stream = await anyio.connect_tcp(self.host, self.port)
                async with stream:
                    await stream.send(b"zINSTREAM\0")
                    for start in range(0, len(content), _CHUNK):
                        chunk = content[start : start + _CHUNK]
                        await stream.send(struct.pack(">I", len(chunk)) + chunk)
                    await stream.send(struct.pack(">I", 0))
                    reply = await _read_reply(stream)
        except (OSError, TimeoutError, anyio.EndOfStream, anyio.BrokenResourceError) as error:
            logger.error("scanner unavailable error=%s", type(error).__name__)
            raise ScanUnavailable from error

        if reply.endswith("OK"):
            return True
        if reply.endswith("FOUND"):
            logger.warning("malware detected signature=%s", reply.removeprefix("stream:").removesuffix("FOUND").strip())
            return False
        logger.error("scanner returned an unexpected reply")  # e.g. "INSTREAM size limit exceeded ERROR"
        raise ScanUnavailable


async def _read_reply(stream) -> str:
    reply = b""
    while not reply.endswith(b"\0"):
        reply += await stream.receive()
        if len(reply) > 4096:
            break
    return reply.rstrip(b"\0").decode("utf-8", "replace").strip()
