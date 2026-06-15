import {
  TASK_STATUSES,
  createBrowserTaskStorage,
  createTaskStore,
} from "./task-store.mjs";

const taskForm = document.querySelector("[data-task-form]");
const feedback = document.querySelector("[data-feedback]");
const taskList = document.querySelector("[data-task-list]");
const emptyState = document.querySelector("[data-empty-state]");
const taskCount = document.querySelector("[data-task-count]");

const store = createTaskStore(createBrowserTaskStorage());

const statusClassMap = {
  "To Do": "status-todo",
  "In Progress": "status-in-progress",
  Blocked: "status-blocked",
  Done: "status-done",
};

function setFeedback(message) {
  feedback.textContent = message;
}

function render() {
  const tasks = store.getTasks();
  taskCount.textContent = `${tasks.length} task${tasks.length === 1 ? "" : "s"}`;
  emptyState.classList.toggle("is-hidden", tasks.length > 0);
  taskList.replaceChildren(
    ...tasks.map((task) => {
      const item = document.createElement("li");
      item.className = "task-row";

      const main = document.createElement("div");
      main.className = "task-main";

      const title = document.createElement("p");
      title.className = "task-title";
      title.textContent = task.title;

      const meta = document.createElement("div");
      meta.className = "task-meta";

      const badge = document.createElement("span");
      badge.className = `status-badge ${statusClassMap[task.status]}`;
      badge.textContent = task.status;

      meta.appendChild(badge);
      main.append(title, meta);

      const actions = document.createElement("div");
      actions.className = "task-actions";

      const statusSelect = document.createElement("select");
      statusSelect.className = "status-select";
      statusSelect.setAttribute("aria-label", `Change status for ${task.title}`);
      for (const status of TASK_STATUSES) {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        option.selected = task.status === status;
        statusSelect.appendChild(option);
      }

      statusSelect.addEventListener("change", () => {
        try {
          store.updateTaskStatus(task.id, statusSelect.value);
          setFeedback(`Updated "${task.title}" to ${statusSelect.value}.`);
          render();
        } catch (error) {
          setFeedback(error.message);
          statusSelect.value = task.status;
        }
      });

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "btn-ghost";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => {
        store.removeTask(task.id);
        setFeedback(`Removed "${task.title}".`);
        render();
      });

      actions.append(statusSelect, removeButton);
      item.append(main, actions);
      return item;
    }),
  );
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(taskForm);
  const title = formData.get("title");

  try {
    const task = store.addTask(title);
    taskForm.reset();
    setFeedback(`Added "${task.title}".`);
    render();
  } catch (error) {
    setFeedback(error.message);
  }
});

render();

