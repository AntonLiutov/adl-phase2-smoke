# Small App

`F1` delivers the core task management slice for the prototype: add tasks, remove tasks, update status using the approved four-state model, and persist the ordered list in browser local storage.

Reordering, dedicated scroll-container behavior, and final visual polish are intentionally deferred to `F2`.

## Run locally

```bash
uv sync
uv run todo-app
```

Open `http://localhost:8000`.

If `uv` is not available:

```bash
pip install -e .
python -m todo_app.server
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
