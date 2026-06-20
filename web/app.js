const STORAGE_KEY = "small-app.tasks";
const STATUSES = ["To Do", "In Progress", "Blocked", "Done"];

const elements = {
  taskForm: document.querySelector("#task-form"),
  taskTitle: document.querySelector("#task-title"),
  taskList: document.querySelector("#task-list"),
  emptyState: document.querySelector("#empty-state"),
  taskCount: document.querySelector("#task-count"),
  doneCount: document.querySelector("#done-count"),
  blockedCount: document.querySelector("#blocked-count"),
};

function isTaskLike(task) {
  return (
    typeof task?.id === "string" &&
    typeof task?.title === "string" &&
    task.title.trim().length > 0 &&
    STATUSES.includes(task?.status)
  );
}

function normalizeTask(task, index) {
  const now = new Date().toISOString();
  return {
    id: task.id,
    title: task.title.trim(),
    status: task.status,
    order: Number.isFinite(task.order) ? task.order : index,
    createdAt: typeof task.createdAt === "string" ? task.createdAt : now,
    updatedAt: typeof task.updatedAt === "string" ? task.updatedAt : now,
  };
}

function safeParseTasks(rawValue) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(isTaskLike)
      .map(normalizeTask)
      .sort((left, right) => left.order - right.order);
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
    return "Updated recently";
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
    order: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function reindexTasks(tasks) {
  return tasks.map((task, index) => ({
    ...task,
    order: index,
  }));
}

const state = {
  tasks: loadTasks(),
};

function updateSummary() {
  elements.taskCount.textContent = String(state.tasks.length);
  elements.doneCount.textContent = String(
    state.tasks.filter((task) => task.status === "Done").length,
  );
  elements.blockedCount.textContent = String(
    state.tasks.filter((task) => task.status === "Blocked").length,
  );
}

function removeTask(taskId) {
  state.tasks = reindexTasks(state.tasks.filter((task) => task.id !== taskId));
  persistTasks(state.tasks);
  render();
}

function updateTaskStatus(taskId, nextStatus) {
  if (!STATUSES.includes(nextStatus)) {
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
  persistTasks(state.tasks);
  render();
}

function moveTask(taskId, direction) {
  const currentIndex = state.tasks.findIndex((task) => task.id === taskId);
  if (currentIndex < 0) {
    return;
  }

  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= state.tasks.length) {
    return;
  }

  const reordered = [...state.tasks];
  const [movedTask] = reordered.splice(currentIndex, 1);
  reordered.splice(nextIndex, 0, movedTask);
  state.tasks = reindexTasks(reordered);
  persistTasks(state.tasks);
  render();
}

function renderTasks() {
  elements.taskList.innerHTML = "";

  const hasTasks = state.tasks.length > 0;
  elements.emptyState.hidden = hasTasks;
  elements.taskList.hidden = !hasTasks;

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

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const moveUpButton = document.createElement("button");
    moveUpButton.className = "icon-button";
    moveUpButton.type = "button";
    moveUpButton.textContent = "Up";
    moveUpButton.disabled = task.order === 0;
    moveUpButton.setAttribute("aria-label", `Move ${task.title} up`);
    moveUpButton.addEventListener("click", () => moveTask(task.id, -1));

    const moveDownButton = document.createElement("button");
    moveDownButton.className = "icon-button";
    moveDownButton.type = "button";
    moveDownButton.textContent = "Down";
    moveDownButton.disabled = task.order === state.tasks.length - 1;
    moveDownButton.setAttribute("aria-label", `Move ${task.title} down`);
    moveDownButton.addEventListener("click", () => moveTask(task.id, 1));

    const removeButton = document.createElement("button");
    removeButton.className = "icon-button";
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `Remove ${task.title}`);
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeTask(task.id));

    actions.append(moveUpButton, moveDownButton, removeButton);
    topRow.append(titleBlock, actions);

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
      updateTaskStatus(task.id, event.target.value);
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

  state.tasks = reindexTasks([createTask(title), ...state.tasks]);
  persistTasks(state.tasks);
  elements.taskForm.reset();
  render();
  elements.taskTitle.focus();
});

render();
