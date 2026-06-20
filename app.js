const ALLOWED_STATUSES = ["To Do", "In Progress", "Blocked", "Done"];

const taskForm = document.querySelector("#task-form");
const taskTitleInput = document.querySelector("#task-title");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const taskCount = document.querySelector("#task-count");

let tasks = [];

function createTask(title) {
  return {
    id: crypto.randomUUID(),
    title,
    status: "To Do",
    order: tasks.length + 1,
  };
}

function normalizeOrder() {
  tasks = tasks.map((task, index) => ({
    ...task,
    order: index + 1,
  }));
}

function updateTaskCount() {
  const count = tasks.length;
  taskCount.textContent = `${count} task${count === 1 ? "" : "s"}`;
}

function render() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    emptyState.hidden = false;
    updateTaskCount();
    return;
  }

  emptyState.hidden = true;

  for (const task of tasks) {
    const item = document.createElement("li");
    item.className = "task-item";
    item.dataset.status = task.status;

    const order = document.createElement("div");
    order.className = "task-order";
    order.textContent = task.order;

    const title = document.createElement("p");
    title.className = "task-title";
    title.textContent = task.title;

    const statusField = document.createElement("label");
    statusField.className = "task-status";

    const statusSelect = document.createElement("select");
    statusSelect.setAttribute("aria-label", `Update status for ${task.title}`);

    for (const status of ALLOWED_STATUSES) {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = task.status === status;
      statusSelect.append(option);
    }

    statusSelect.addEventListener("change", (event) => {
      const nextStatus = event.target.value;
      if (!ALLOWED_STATUSES.includes(nextStatus)) {
        return;
      }

      tasks = tasks.map((currentTask) =>
        currentTask.id === task.id ? { ...currentTask, status: nextStatus } : currentTask,
      );
      render();
    });

    statusField.append(statusSelect);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", `Remove ${task.title}`);
    removeButton.addEventListener("click", () => {
      tasks = tasks.filter((currentTask) => currentTask.id !== task.id);
      normalizeOrder();
      render();
    });

    item.append(order, title, statusField, removeButton);
    taskList.append(item);
  }

  updateTaskCount();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskTitleInput.value.trim();
  if (!title) {
    taskTitleInput.focus();
    return;
  }

  tasks = [...tasks, createTask(title)];
  taskTitleInput.value = "";
  render();
  taskTitleInput.focus();
});

render();
