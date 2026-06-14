const STORAGE_KEY = "small-app.tasks";
const STATUSES = ["To Do", "In Progress", "Blocked", "Done"];

const elements = {
  taskForm: document.querySelector("#task-form"),
  taskTitle: document.querySelector("#task-title"),
  taskList: document.querySelector("#task-list"),
  emptyState: document.querySelector("#empty-state"),
  taskCount: document.querySelector("#task-count"),
  doneCount: document.querySelector("#done-count"),
};

function safeParseTasks(rawValue) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (task) =>
        typeof task?.id === "string" &&
        typeof task?.title === "string" &&
        STATUSES.includes(task?.status),
    );
  } catch {
    return [];
  }
}

function loadTasks() {
  return safeParseTasks(window.localStorage.getItem(STORAGE_KEY));
}

function persistTasks(tasks) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatTimestamp(isoValue) {
  const value = new Date(isoValue);
  if (Number.isNaN(value.getTime())) {
    return "Saved just now";
  }

  return `Updated ${value.toLocaleDateString()} ${value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function statusClass(status) {
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

const state = {
  tasks: loadTasks(),
};

function updateSummary() {
  elements.taskCount.textContent = String(state.tasks.length);
  elements.doneCount.textContent = String(
    state.tasks.filter((task) => task.status === "Done").length,
  );
}

function renderTasks() {
  elements.taskList.innerHTML = "";
  elements.emptyState.hidden = state.tasks.length > 0;
  elements.taskList.hidden = state.tasks.length === 0;

  state.tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task-item";
    item.dataset.taskId = task.id;

    const topRow = document.createElement("div");
    topRow.className = "task-row";

    const titleBlock = document.createElement("div");
    titleBlock.className = "section-heading";

    const title = document.createElement("p");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const statusPill = document.createElement("span");
    statusPill.className = `status-pill ${statusClass(task.status)}`;
    statusPill.textContent = task.status;

    const updatedAt = document.createElement("span");
    updatedAt.textContent = formatTimestamp(task.updatedAt);

    meta.append(statusPill, updatedAt);
    titleBlock.append(title, meta);

    const removeButton = document.createElement("button");
    removeButton.className = "icon-button";
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `Remove ${task.title}`);
    removeButton.textContent = "X";
    removeButton.addEventListener("click", () => {
      state.tasks = state.tasks.filter((entry) => entry.id !== task.id);
      persistTasks(state.tasks);
      render();
    });

    topRow.append(titleBlock, removeButton);

    const statusGroup = document.createElement("div");
    statusGroup.className = "status-group";

    const statusLabel = document.createElement("label");
    statusLabel.className = "status-label";
    statusLabel.setAttribute("for", `status-${task.id}`);
    statusLabel.textContent = "Status";

    const select = document.createElement("select");
    select.className = "status-select";
    select.id = `status-${task.id}`;

    STATUSES.forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = task.status === status;
      select.append(option);
    });

    select.addEventListener("change", (event) => {
      const nextStatus = event.target.value;
      if (!STATUSES.includes(nextStatus)) {
        event.target.value = task.status;
        return;
      }

      state.tasks = state.tasks.map((entry) =>
        entry.id === task.id
          ? {
              ...entry,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : entry,
      );
      persistTasks(state.tasks);
      render();
    });

    statusGroup.append(statusLabel, select);
    item.append(topRow, statusGroup);
    elements.taskList.append(item);
  });

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
  persistTasks(state.tasks);
  elements.taskForm.reset();
  render();
  elements.taskTitle.focus();
});

render();
