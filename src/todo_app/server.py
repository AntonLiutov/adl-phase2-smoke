from __future__ import annotations

import argparse
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Serve the Small App frontend.")
    parser.add_argument("--host", default=os.environ.get("HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8000")))
    return parser


def main() -> None:
    args = build_parser().parse_args()
    web_root = Path(__file__).resolve().parents[2] / "web"
    handler = partial(SimpleHTTPRequestHandler, directory=str(web_root))
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"Serving Small App at http://{args.host}:{args.port}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
