from __future__ import annotations

import argparse
import os
from datetime import UTC, datetime
from pathlib import Path
from typing import Annotated, Literal
from uuid import uuid4

import uvicorn
from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, StringConstraints

from todo_app.storage import ensure_database, get_connection

BASE_DIR = Path(__file__).resolve().parents[2]
WEB_DIR = BASE_DIR / "web"
DEFAULT_DB_PATH = BASE_DIR / "data" / "tasks.db"
StatusValue = Literal["To Do", "In Progress", "Blocked", "Done"]


class Task(BaseModel):
    id: str
    title: str
    status: StatusValue
    sort_order: int
    created_at: str
    updated_at: str


class TaskCreate(BaseModel):
    title: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]


class TaskUpdate(BaseModel):
    status: StatusValue


def current_timestamp() -> str:
    return datetime.now(UTC).isoformat()


def resolve_db_path() -> Path:
    configured = os.environ.get("TASK_DB_PATH")
    if configured:
        return Path(configured)
    return DEFAULT_DB_PATH


def create_app(db_path: Path | None = None) -> FastAPI:
    app = FastAPI(title="Small App", version="0.1.0")
    db_path = db_path or resolve_db_path()
    ensure_database(db_path)
    app.state.db_path = db_path
    app.mount("/assets", StaticFiles(directory=WEB_DIR), name="assets")

    def database_path() -> Path:
        return app.state.db_path

    @app.get("/healthz")
    def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/", response_class=FileResponse)
    def read_index() -> Path:
        return WEB_DIR / "index.html"

    @app.get("/api/tasks", response_model=list[Task])
    def list_tasks(db_path: Path = Depends(database_path)) -> list[Task]:
        with get_connection(db_path) as connection:
            rows = connection.execute(
                """
                SELECT id, title, status, sort_order, created_at, updated_at
                FROM tasks
                ORDER BY sort_order ASC, created_at ASC
                """
            ).fetchall()
        return [Task.model_validate(dict(row)) for row in rows]

    @app.post("/api/tasks", response_model=Task, status_code=status.HTTP_201_CREATED)
    def create_task(
        payload: TaskCreate,
        db_path: Path = Depends(database_path),
    ) -> Task:
        timestamp = current_timestamp()

        with get_connection(db_path) as connection:
            next_sort_order = connection.execute(
                "SELECT COALESCE(MAX(sort_order), -1) + 1 FROM tasks"
            ).fetchone()[0]
            task = Task(
                id=str(uuid4()),
                title=payload.title,
                status="To Do",
                sort_order=next_sort_order,
                created_at=timestamp,
                updated_at=timestamp,
            )
            connection.execute(
                """
                INSERT INTO tasks (id, title, status, sort_order, created_at, updated_at)
                VALUES (:id, :title, :status, :sort_order, :created_at, :updated_at)
                """,
                task.model_dump(),
            )
        return task

    @app.patch("/api/tasks/{task_id}", response_model=Task)
    def update_task(
        task_id: str,
        payload: TaskUpdate,
        db_path: Path = Depends(database_path),
    ) -> Task:
        with get_connection(db_path) as connection:
            existing = connection.execute(
                """
                SELECT id, title, status, sort_order, created_at, updated_at
                FROM tasks
                WHERE id = ?
                """,
                (task_id,),
            ).fetchone()

            if existing is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

            updated_payload = dict(existing)
            updated_payload["status"] = payload.status
            updated_payload["updated_at"] = current_timestamp()
            updated = Task(**updated_payload)
            connection.execute(
                "UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?",
                (updated.status, updated.updated_at, task_id),
            )
        return updated

    @app.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_task(
        task_id: str,
        db_path: Path = Depends(database_path),
    ) -> Response:
        with get_connection(db_path) as connection:
            deleted = connection.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
            if deleted.rowcount == 0:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return app


app = create_app()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run the Small App server.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8000")))
    return parser


def main() -> None:
    args = build_parser().parse_args()
    uvicorn.run("todo_app.app:app", host=args.host, port=args.port, reload=False)


if __name__ == "__main__":
    main()
