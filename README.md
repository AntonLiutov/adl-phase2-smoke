# Small App

`F1` delivers a frontend-only to-do list prototype with add, remove, status updates, browser-local persistence, and a scrollable task list. Reordering is intentionally not implemented here because it is assigned to `F2`.

## Features

- Add a task with a title-only form.
- Remove any task.
- Change status only between `To Do`, `In Progress`, `Blocked`, and `Done`.
- Persist tasks in browser local storage across refreshes in the same browser.
- Keep the list usable inside a fixed-height scroll container.

## Run locally

1. Create `.env` from `.env.example` if you want to override the port.
2. Start the app:

```bash
uv run todo-app
```

Then open `http://localhost:8000`.

If you do not use `uv`, create a Python 3.12 environment, install the package, and run:

```bash
pip install -e .
python -m todo_app.server
```

## Docker

```bash
copy .env.example .env
docker compose up --build
```

Then open `http://localhost:8000`.
