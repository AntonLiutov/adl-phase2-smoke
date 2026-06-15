# Persisted Task Workflow

Small single-page to-do app for work item `F1`. This slice implements task creation, task removal, strict four-state status updates, and same-browser persistence through `localStorage`.

## Run

With `uv`:

```bash
uv run python -m todo_app.server
```

Then open `http://127.0.0.1:8000`.

Without `uv`:

```bash
python -m todo_app.server
```

## Test

```bash
node --test tests/task-store.test.mjs
```

## Scope

Included in `F1`:
- Add tasks
- Remove tasks
- Change status only among `To Do`, `In Progress`, `Blocked`, and `Done`
- Persist tasks after refresh in the same browser

Intentionally deferred to `F2`:
- Reordering
- Scroll-specific overflow treatment as an acceptance target
- Final review-grade polish/deployment work

