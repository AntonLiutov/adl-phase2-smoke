# Small App

Frontend-only to-do prototype for work item `F1` in `sprint-01`.

This slice implements:
- add a task
- remove a task
- change task status only between `To Do`, `In Progress`, `Blocked`, and `Done`
- persist tasks in browser local storage and hydrate them after refresh in the same browser

This slice intentionally does not implement task reordering. That work remains scoped to `F2`.

## Tech shape

- Static HTML, CSS, and JavaScript under `web/`
- Tiny Python static server under `src/todo_app/`
- No API, auth, database, or collaboration features

## Run locally

With `uv`:

```bash
uv run todo-app
```

Then open `http://127.0.0.1:8000`.

Without `uv`:

```bash
pip install -e .
python -m todo_app.server
```

## Environment

Copy `.env.example` to `.env` only if you want to override the port.

## Docker

```bash
docker compose up --build
```

Then open `http://127.0.0.1:8000`.
