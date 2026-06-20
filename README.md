# Task List Prototype

A small frontend-only to-do list prototype for sprint work item `F1`.

## Scope in this run

Implemented:
- add tasks
- remove tasks
- update task status across `To Do`, `In Progress`, `Blocked`, and `Done`
- scrollable task list layout
- intentional modern styling

Intentionally not implemented in this run:
- task reordering (`F2`)
- backend services
- persistence across refresh
- extra task metadata

## Run locally

With `uv`:

```bash
uv run python scripts/serve.py
```

Without `uv`:

```bash
python scripts/serve.py
```

Then open `http://127.0.0.1:8000`.

## Run with Docker

Optionally copy `.env.example` to `.env` and adjust the port values.

```bash
docker compose up --build
```

Then open `http://127.0.0.1:8000`.

## Project files

- `index.html` contains the app shell.
- `styles.css` contains the visual design and responsive layout.
- `app.js` contains the client-side task state and UI behavior.
- `scripts/serve.py` serves the static app for local and container runs.
