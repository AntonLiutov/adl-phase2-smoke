# Task List Prototype

`F1` delivers the core task management slice for a small single-page to-do app:
add tasks, remove tasks, update status across the four allowed values, and
persist the ordered list in browser-local storage so it survives refreshes in
the same browser.

Reordering is intentionally not implemented here. It is planned for `F2`.

## Stack

- Static HTML, CSS, and JavaScript SPA
- Small Python static server for local development and container/runtime parity
- Browser `localStorage` persistence behind a client adapter

## Run locally

1. Install dependencies with `uv sync`.
2. Start the app with `uv run task-list-app`.
3. Open `http://127.0.0.1:8000`.

You can also use `python -m todo_app.server` after syncing if you prefer.
If port `8000` is already in use, run with `PORT=8765 uv run task-list-app`.

## Browser-local persistence

Tasks are stored in the current browser's `localStorage`. Refreshing the page in
the same browser rehydrates the list. Tasks do not sync across browsers,
devices, or users.

## Environment

Copy `.env.example` to `.env` if you want to override defaults.

- `PORT`: local server port. Default: `8000`
- `HOST`: local bind host. Default: `127.0.0.1`

## Docker

1. Copy `.env.example` to `.env` only if you want to override defaults.
2. Run `docker compose up --build`.
3. Open `http://127.0.0.1:8000`.

## Project layout

- `index.html`: SPA shell
- `styles.css`: Quiet Console-inspired UI styling
- `app.js`: client-side task store, storage adapter, and rendering
- `src/todo_app/server.py`: local static server
- `execution-summary.md`: work-item delivery notes
