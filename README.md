# Small App

`F1` delivers the first usable slice of the to-do SPA: add tasks, remove tasks, change status using the required four-state workflow, and persist the single ordered list in browser local storage.

## Scope delivered in `F1`

- Add a task and render it immediately.
- Remove a task from the list.
- Change status only between `To Do`, `In Progress`, `Blocked`, and `Done`.
- Restore the saved ordered list after refresh in the same browser profile.
- Keep the app frontend-only with no backend, auth, or extra task fields beyond the minimal task model.

## Intentionally not in `F1`

- Task reordering. That work is reserved for `F2`.

## Run locally

```bash
copy .env.example .env
uv run todo-app
```

Open `http://127.0.0.1:8000`.

If you do not use `uv`:

```bash
pip install -e .
python -m todo_app.server
```

## Docker

```bash
copy .env.example .env
docker compose up --build
```
