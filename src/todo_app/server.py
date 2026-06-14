from __future__ import annotations

import contextlib
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]


class StaticAppHandler(SimpleHTTPRequestHandler):
    """Serve the static SPA from the project root."""

    def __init__(self, *args, directory: str | None = None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, format: str, *args) -> None:  # noqa: A003
        return

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/":
            return super().do_GET()

        target = Path(self.translate_path(self.path))
        if target.exists() and target.is_file():
            return super().do_GET()

        self.path = "/index.html"
        return super().do_GET()


def main() -> None:
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    handler = partial(StaticAppHandler, directory=str(PROJECT_ROOT))
    server = ThreadingHTTPServer((host, port), handler)

    print(f"Serving task list prototype at http://{host}:{port}")
    with contextlib.suppress(KeyboardInterrupt):
        server.serve_forever()


if __name__ == "__main__":
    main()
