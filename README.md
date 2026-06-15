# Small App

`F1` delivers the core task management slice for the prototype: add tasks, remove tasks, update status using the approved four-state model, and persist the ordered list in browser local storage.

Reordering, dedicated scroll-container behavior, and final visual polish are intentionally deferred to `F2`.

## Run locally

```bash
uv run --no-project scripts/serve.py
```

Open `http://localhost:8000`.

This `F1` slice is a static SPA under `web/`, so local serving does not require `uv sync`.
If port `8000` is already in use, set `PORT` first, for example `set PORT=8010` in PowerShell before running the command.

If `uv` is not available:

```bash
python scripts/serve.py
```

## Docker

```bash
copy .env.example .env
docker compose up --build
```

Open `http://localhost:8000`.

## Notes

- Persistence is browser-local only in this slice.
- Tasks are title-only by design to avoid expanding product scope.
- Allowed statuses are exactly `To Do`, `In Progress`, `Blocked`, and `Done`.
- `uv sync` remains available for package-oriented workflows, but it is not required for the documented local browser run path.
