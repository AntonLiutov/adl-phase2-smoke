# Small App

`F1` delivers the core task lifecycle slice for the prototype: add tasks, remove tasks, list persisted tasks, and update status using only the four approved values. Reordering is intentionally not implemented here because it belongs to `F2`.

## Delivered in `F1`

- Single deployable FastAPI app serving both the UI and JSON API.
- SQLite-backed task persistence through the application layer and task store.
- Browser UI for creating, deleting, and status-updating tasks.
- API validation that rejects statuses outside `To Do`, `In Progress`, `Blocked`, and `Done`.

## Intentionally skipped

- Task reordering.
- Reviewer-facing overflow/scroll-specific refinement work from `F2`.
- Any extra task metadata, auth, collaboration, analytics, or integrations.

## Run locally

1. Copy `.env.example` to `.env` if you want to override defaults.
2. Install dependencies and start the app:

```bash
uv sync
uv run todo-app --host 0.0.0.0 --port 8000
```

Then open `http://localhost:8000`.

If `uv` is unavailable, create a Python 3.12 environment and run:

```bash
pip install -e .
python -m todo_app.app --host 0.0.0.0 --port 8000
```

## Test

```bash
uv run pytest
```

## Docker

```bash
copy .env.example .env
docker compose up --build
```

Then open `http://localhost:8000`.
