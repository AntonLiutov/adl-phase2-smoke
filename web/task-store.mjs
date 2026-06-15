export const TASK_STATUSES = Object.freeze([
  "To Do",
  "In Progress",
  "Blocked",
  "Done",
]);

export function isValidStatus(status) {
  return TASK_STATUSES.includes(status);
}

export function sanitizeStoredTasks(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((task) => {
      return (
        task &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        task.title.trim().length > 0 &&
        isValidStatus(task.status)
      );
    })
    .map((task, index) => ({
      id: task.id,
      title: task.title.trim(),
      status: task.status,
      orderIndex: Number.isInteger(task.orderIndex) ? task.orderIndex : index,
    }))
    .sort((left, right) => left.orderIndex - right.orderIndex)
    .map((task, index) => ({ ...task, orderIndex: index }));
}

export function createTaskStore(storage) {
  let tasks = sanitizeStoredTasks(storage.loadTasks());

  function persist() {
    storage.saveTasks(tasks);
  }

  return {
    getTasks() {
      return tasks.map((task) => ({ ...task }));
    },

    addTask(title) {
      const normalizedTitle = String(title ?? "").trim();
      if (!normalizedTitle) {
        throw new Error("Task title is required.");
      }

      const task = {
        id: globalThis.crypto?.randomUUID?.() ?? `task-${Date.now()}`,
        title: normalizedTitle,
        status: "To Do",
        orderIndex: tasks.length,
      };

      tasks = [...tasks, task];
      persist();
      return { ...task };
    },

    removeTask(taskId) {
      const nextTasks = tasks.filter((task) => task.id !== taskId);
      tasks = nextTasks.map((task, index) => ({ ...task, orderIndex: index }));
      persist();
    },

    updateTaskStatus(taskId, status) {
      if (!isValidStatus(status)) {
        throw new Error(`Unsupported status: ${status}`);
      }

      let taskFound = false;
      tasks = tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        taskFound = true;
        return { ...task, status };
      });

      if (!taskFound) {
        throw new Error(`Task not found: ${taskId}`);
      }

      persist();
    },
  };
}

export function createBrowserTaskStorage(key = "task-workflow:f1") {
  return {
    loadTasks() {
      try {
        const rawValue = window.localStorage.getItem(key);
        return rawValue ? JSON.parse(rawValue) : [];
      } catch {
        return [];
      }
    },

    saveTasks(tasks) {
      window.localStorage.setItem(key, JSON.stringify(tasks));
    },
  };
}

