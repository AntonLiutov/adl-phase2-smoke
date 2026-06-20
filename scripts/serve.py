from __future__ import annotations

import http.server
import os
import socketserver
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    os.chdir(root)

    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))
    handler = http.server.SimpleHTTPRequestHandler

    class ReusableTCPServer(socketserver.TCPServer):
        allow_reuse_address = True

    with ReusableTCPServer((host, port), handler) as httpd:
        print(f"Serving task list prototype at http://{host}:{port}")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
