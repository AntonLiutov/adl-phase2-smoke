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

function normalizeTasks(tasks) {
  return tasks
    .filter(
      (task) =>
        typeof task?.id === "string" &&
        typeof task?.title === "string" &&
        task.title.trim().length > 0 &&
        STATUSES.includes(task?.status) &&
        Number.isInteger(task?.sortOrder),
    )
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((task, index) => ({
      id: task.id,
      title: task.title.trim(),
      status: task.status,
      sortOrder: index,
    }));
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

    return normalizeTasks(parsed);
  } catch {
    return [];
  }
}

function loadTasks() {
  return safeParseTasks(window.localStorage.getItem(STORAGE_KEY));
}

function persistTasks(tasks) {
  const normalized = normalizeTasks(tasks);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

function createTask(title, sortOrder) {
  return {
    id: crypto.randomUUID(),
    title,
    status: "To Do",
    sortOrder,
  };
}

const state = {
  tasks: loadTasks(),
};

function removeTask(taskId) {
  state.tasks = persistTasks(state.tasks.filter((task) => task.id !== taskId));
  render();
}

function updateTaskStatus(taskId, nextStatus) {
  if (!STATUSES.includes(nextStatus)) {
    return;
  }

  state.tasks = persistTasks(
    state.tasks.map((task) =>
      task.id === taskId ? { ...task, status: nextStatus } : task,
    ),
  );
  render();
}

function updateSummary() {
  elements.taskCount.textContent = String(state.tasks.length);
  elements.doneCount.textContent = String(
    state.tasks.filter((task) => task.status === "Done").length,
  );
  elements.blockedCount.textContent = String(
    state.tasks.filter((task) => task.status === "Blocked").length,
  );
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

    const content = document.createElement("div");
    content.className = "task-content";

    const title = document.createElement("p");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const orderChip = document.createElement("span");
    orderChip.className = "task-order nums";
    orderChip.textContent = `#${task.sortOrder + 1}`;

    const statusPill = document.createElement("span");
    statusPill.className = `status-pill ${statusClass(task.status)}`;
    statusPill.textContent = task.status;

    meta.append(orderChip, statusPill);
    content.append(title, meta);

    const removeButton = document.createElement("button");
    removeButton.className = "icon-button";
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `Remove ${task.title}`);
    removeButton.textContent = "X";
    removeButton.addEventListener("click", () => removeTask(task.id));

    topRow.append(content, removeButton);

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

  state.tasks = persistTasks([...state.tasks, createTask(title, state.tasks.length)]);
  elements.taskForm.reset();
  render();
  elements.taskTitle.focus();
});

render();
