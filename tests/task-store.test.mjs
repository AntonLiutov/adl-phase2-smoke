import test from "node:test";
import assert from "node:assert/strict";

import {
  createTaskStore,
  isValidStatus,
  sanitizeStoredTasks,
} from "../web/task-store.mjs";

function createMemoryStorage(seed = []) {
  let storedTasks = structuredClone(seed);
  return {
    loadTasks() {
      return structuredClone(storedTasks);
    },
    saveTasks(tasks) {
      storedTasks = structuredClone(tasks);
    },
    snapshot() {
      return structuredClone(storedTasks);
    },
  };
}

test("new tasks are created as To Do and persisted", () => {
  const storage = createMemoryStorage();
  const store = createTaskStore(storage);

  const task = store.addTask("Review F1");

  assert.equal(task.status, "To Do");
  assert.equal(storage.snapshot()[0].title, "Review F1");
});

test("invalid statuses are rejected in state logic", () => {
  const storage = createMemoryStorage();
  const store = createTaskStore(storage);
  const task = store.addTask("Guard task states");

  assert.equal(isValidStatus("Archived"), false);
  assert.throws(() => store.updateTaskStatus(task.id, "Archived"), {
    message: "Unsupported status: Archived",
  });
});

test("stored task payload is sanitized and filtered", () => {
  const tasks = sanitizeStoredTasks([
    { id: "2", title: "  Keep me  ", status: "Done", orderIndex: 3 },
    { id: "bad", title: "", status: "Done", orderIndex: 1 },
    { id: "1", title: "Check storage", status: "In Progress", orderIndex: 2 },
    { id: "3", title: "Bad status", status: "Archived", orderIndex: 0 },
  ]);

  assert.deepEqual(tasks, [
    { id: "1", title: "Check storage", status: "In Progress", orderIndex: 0 },
    { id: "2", title: "Keep me", status: "Done", orderIndex: 1 },
  ]);
});

test("removing a task reindexes persisted order", () => {
  const storage = createMemoryStorage([
    { id: "a", title: "First", status: "To Do", orderIndex: 0 },
    { id: "b", title: "Second", status: "Blocked", orderIndex: 1 },
  ]);
  const store = createTaskStore(storage);

  store.removeTask("a");

  assert.deepEqual(storage.snapshot(), [
    { id: "b", title: "Second", status: "Blocked", orderIndex: 0 },
  ]);
});

