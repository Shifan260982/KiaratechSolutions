import struct

import anyio
import pytest

from app.scanner import ClamAvScanner, ScanUnavailable

pytestmark = pytest.mark.anyio


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


async def fake_clamd(reply: bytes, received: list[bytes]):
    """Minimal clamd: reads one INSTREAM request and answers with `reply`."""

    async def handle(stream):
        async with stream:
            data = b""
            while not data.endswith(struct.pack(">I", 0)) or len(data) < 14:
                data += await stream.receive()
            received.append(data)
            if reply:
                await stream.send(reply)

    listener = await anyio.create_tcp_listener(local_host="127.0.0.1")
    port = listener.extra(anyio.abc.SocketAttribute.local_port)  # noqa: S610 - anyio, not Django
    return listener, handle, port


async def scan(reply: bytes, content: bytes = b"%PDF-1.7 hello") -> tuple[bool, list[bytes]]:
    received: list[bytes] = []
    listener, handle, port = await fake_clamd(reply, received)
    outcome: list = []
    async with anyio.create_task_group() as tg:
        tg.start_soon(listener.serve, handle)
        try:
            outcome.append(await ClamAvScanner("127.0.0.1", port, timeout=2).is_clean(content))
        except ScanUnavailable as error:
            outcome.append(error)  # re-raised below, outside the task group, so it is not wrapped
        tg.cancel_scope.cancel()
    if isinstance(outcome[0], ScanUnavailable):
        raise outcome[0]
    return outcome[0], received


async def test_clean_file():
    clean, received = await scan(b"stream: OK\0")
    assert clean
    request = received[0]
    assert request.startswith(b"zINSTREAM\0" + struct.pack(">I", 14) + b"%PDF-1.7 hello")
    assert request.endswith(struct.pack(">I", 0))


async def test_infected_file():
    clean, _ = await scan(b"stream: Eicar-Test-Signature FOUND\0")
    assert not clean


async def test_error_reply_fails_closed():
    with pytest.raises(ScanUnavailable):
        await scan(b"INSTREAM size limit exceeded. ERROR\0")


async def test_unreachable_scanner_fails_closed():
    with pytest.raises(ScanUnavailable):
        await ClamAvScanner("127.0.0.1", 1, timeout=2).is_clean(b"x")


async def test_silent_scanner_times_out():
    received: list[bytes] = []
    listener, _, port = await fake_clamd(b"", received)

    async def never_reply(stream):
        await anyio.sleep(10)

    async with anyio.create_task_group() as tg:
        tg.start_soon(listener.serve, never_reply)
        with pytest.raises(ScanUnavailable):
            await ClamAvScanner("127.0.0.1", port, timeout=0.5).is_clean(b"x")
        tg.cancel_scope.cancel()
