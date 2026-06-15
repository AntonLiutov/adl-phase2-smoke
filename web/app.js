const STORAGE_KEY = "small-app.tasks";
const ALLOWED_STATUSES = ["To Do", "In Progress", "Blocked", "Done"];

const elements = {
  taskForm: document.querySelector("#task-form"),
  taskTitle: document.querySelector("#task-title"),
  taskList: document.querySelector("#task-list"),
  emptyState: document.querySelector("#empty-state"),
  taskCount: document.querySelector("#task-count"),
  doneCount: document.querySelector("#done-count"),
};

function normalizeTask(task) {
  if (
    typeof task?.id !== "string" ||
    typeof task?.title !== "string" ||
    !ALLOWED_STATUSES.includes(task?.status)
  ) {
    return null;
  }

  return {
    id: task.id,
    title: task.title.trim(),
    status: task.status,
    createdAt: typeof task.createdAt === "string" ? task.createdAt : new Date().toISOString(),
    updatedAt: typeof task.updatedAt === "string" ? task.updatedAt : new Date().toISOString(),
  };
}

const storage = {
  loadTasks() {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(rawValue);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map(normalizeTask)
        .filter((task) => task && task.title.length > 0);
    } catch {
      return [];
    }
  },

  saveTasks(tasks) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },
};

const state = {
  tasks: storage.loadTasks(),
};

function createTask(title) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title,
    status: "To Do",
    createdAt: now,
    updatedAt: now,
  };
}

function formatTimestamp(isoValue) {
  const value = new Date(isoValue);
  if (Number.isNaN(value.getTime())) {
    return "Updated recently";
  }

  return `Updated ${value.toLocaleDateString()} ${value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function getStatusClass(status) {
  switch (status) {
    case "To Do":
      return "status-todo";
    case "In Progress":
      return "status-progress";
    case "Blocked":
      return "status-blocked";
    case "Done":
      return "status-done";
    default:
      return "";
  }
}

function persistAndRender() {
  storage.saveTasks(state.tasks);
  render();
}

function removeTask(taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);
  persistAndRender();
}

function updateTaskStatus(taskId, nextStatus) {
  if (!ALLOWED_STATUSES.includes(nextStatus)) {
    return;
  }

  state.tasks = state.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        }
      : task,
  );

  persistAndRender();
}

function updateSummary() {
  elements.taskCount.textContent = String(state.tasks.length);
  elements.doneCount.textContent = String(
    state.tasks.filter((task) => task.status === "Done").length,
  );
}

function renderTasks() {
  elements.taskList.innerHTML = "";
  const hasTasks = state.tasks.length > 0;
  elements.emptyState.hidden = hasTasks;
  elements.taskList.hidden = !hasTasks;

  for (const task of state.tasks) {
    const item = document.createElement("li");
    item.className = "task-item";

    const header = document.createElement("div");
    header.className = "task-row";

    const copy = document.createElement("div");
    copy.className = "task-copy";

    const title = document.createElement("p");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const statusPill = document.createElement("span");
    statusPill.className = `status-pill ${getStatusClass(task.status)}`;
    statusPill.textContent = task.status;

    const updatedAt = document.createElement("span");
    updatedAt.textContent = formatTimestamp(task.updatedAt);

    meta.append(statusPill, updatedAt);
    copy.append(title, meta);

    const removeButton = document.createElement("button");
    removeButton.className = "icon-button";
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `Remove ${task.title}`);
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeTask(task.id));

    header.append(copy, removeButton);

    const statusGroup = document.createElement("div");
    statusGroup.className = "status-group";

    const label = document.createElement("label");
    label.className = "status-label";
    label.setAttribute("for", `status-${task.id}`);
    label.textContent = "Status";

    const select = document.createElement("select");
    select.className = "status-select";
    select.id = `status-${task.id}`;

    for (const status of ALLOWED_STATUSES) {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = task.status === status;
      select.append(option);
    }

    select.addEventListener("change", (event) => {
      updateTaskStatus(task.id, event.target.value);
    });

    statusGroup.append(label, select);
    item.append(header, statusGroup);
    elements.taskList.append(item);
  }

  updateSummary();
}

function render() {
  renderTasks();
}

elements.taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = elements.taskTitle.value.trim();
  if (!title) {
    elements.taskTitle.focus();
    return;
  }

  state.tasks = [createTask(title), ...state.tasks];
  elements.taskForm.reset();
  persistAndRender();
  elements.taskTitle.focus();
});

render();
