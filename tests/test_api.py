from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from todo_app.app import create_app


def build_client(tmp_path: Path) -> TestClient:
    app = create_app(tmp_path / "tasks.db")
    return TestClient(app)


def test_create_list_update_and_delete_task(tmp_path: Path) -> None:
    client = build_client(tmp_path)

    created = client.post("/api/tasks", json={"title": "Ship F1"}).json()
    assert created["title"] == "Ship F1"
    assert created["status"] == "To Do"

    listed = client.get("/api/tasks")
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    updated = client.patch(f"/api/tasks/{created['id']}", json={"status": "Done"})
    assert updated.status_code == 200
    assert updated.json()["status"] == "Done"

    deleted = client.delete(f"/api/tasks/{created['id']}")
    assert deleted.status_code == 204
    assert client.get("/api/tasks").json() == []


def test_invalid_status_is_rejected(tmp_path: Path) -> None:
    client = build_client(tmp_path)
    created = client.post("/api/tasks", json={"title": "Reject bad status"}).json()

    response = client.patch(f"/api/tasks/{created['id']}", json={"status": "Archived"})
    assert response.status_code == 422


def test_tasks_persist_when_app_restarts(tmp_path: Path) -> None:
    db_path = tmp_path / "tasks.db"

    first_app = create_app(db_path)
    with TestClient(first_app) as client:
        created = client.post("/api/tasks", json={"title": "Persist me"}).json()
        assert created["id"]

    second_app = create_app(db_path)
    with TestClient(second_app) as client:
        tasks = client.get("/api/tasks")
        assert tasks.status_code == 200
        payload = tasks.json()
        assert len(payload) == 1
        assert payload[0]["title"] == "Persist me"
