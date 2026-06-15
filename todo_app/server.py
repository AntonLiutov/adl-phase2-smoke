"""Serve the static web app for local review."""

from __future__ import annotations

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class StaticAppHandler(SimpleHTTPRequestHandler):
    """Serve ES modules with a browser-valid MIME type on Windows."""

    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".mjs": "application/javascript",
    }


def main() -> None:
    web_root = Path(__file__).resolve().parent.parent / "web"
    handler = lambda *args, **kwargs: StaticAppHandler(
        *args,
        directory=str(web_root),
        **kwargs,
    )
    server = ThreadingHTTPServer(("127.0.0.1", 8000), handler)
    print("Serving on http://127.0.0.1:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
