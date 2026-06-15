const STATUSES = ["To Do", "In Progress", "Blocked", "Done"];

const elements = {
  form: document.querySelector("#task-form"),
  title: document.querySelector("#task-title"),
  feedback: document.querySelector("#form-feedback"),
  taskList: document.querySelector("#task-list"),
  emptyState: document.querySelector("#empty-state"),
  errorBanner: document.querySelector("#error-banner"),
  openCount: document.querySelector("#open-count"),
  doneCount: document.querySelector("#done-count"),
};

const state = {
  tasks: [],
  busyIds: new Set(),
};

function formatTimestamp(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Updated recently";
  }

  return parsed.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status) {
  return `status-${status.toLowerCase().replaceAll(" ", "-")}`;
}

function setError(message = "") {
  elements.errorBanner.hidden = message.length === 0;
  elements.errorBanner.textContent = message;
}

function setFeedback(message = "") {
  elements.feedback.textContent = message;
}

function setTaskBusy(taskId, isBusy) {
  if (isBusy) {
    state.busyIds.add(taskId);
  } else {
    state.busyIds.delete(taskId);
  }
  render();
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let detail = "Request failed.";
    try {
      const payload = await response.json();
      if (typeof payload?.detail === "string") {
        detail = payload.detail;
      }
    } catch {
      detail = response.statusText || detail;
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function loadTasks() {
  const tasks = await request("/api/tasks");
  state.tasks = tasks;
}

function updateSummary() {
  const doneCount = state.tasks.filter((task) => task.status === "Done").length;
  elements.doneCount.textContent = String(doneCount);
  elements.openCount.textContent = String(state.tasks.length - doneCount);
}

function buildTaskItem(task) {
  const item = document.createElement("li");
  item.className = "task-item";

  const topRow = document.createElement("div");
  topRow.className = "task-row";

  const heading = document.createElement("div");
  heading.className = "task-copy";

  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const statusPill = document.createElement("span");
  statusPill.className = `status-pill ${statusClass(task.status)}`;
  statusPill.textContent = task.status;

  const savedAt = document.createElement("span");
  savedAt.textContent = `Updated ${formatTimestamp(task.updated_at)}`;

  meta.append(statusPill, savedAt);
  heading.append(title, meta);

  const removeButton = document.createElement("button");
  removeButton.className = "icon-button";
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.disabled = state.busyIds.has(task.id);
  removeButton.addEventListener("click", async () => {
    setError();
    setTaskBusy(task.id, true);
    try {
      await request(`/api/tasks/${task.id}`, { method: "DELETE" });
      state.tasks = state.tasks.filter((entry) => entry.id !== task.id);
    } catch (error) {
      setError(error.message);
    } finally {
      setTaskBusy(task.id, false);
      render();
    }
  });

  topRow.append(heading, removeButton);

  const controls = document.createElement("div");
  controls.className = "status-control";

  const label = document.createElement("label");
  label.className = "status-label";
  label.textContent = "Status";
  label.setAttribute("for", `status-${task.id}`);

  const select = document.createElement("select");
  select.className = "input status-select";
  select.id = `status-${task.id}`;
  select.disabled = state.busyIds.has(task.id);

  for (const status of STATUSES) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    option.selected = task.status === status;
    select.append(option);
  }

  select.addEventListener("change", async (event) => {
    const nextStatus = event.target.value;
    setError();
    setTaskBusy(task.id, true);
    try {
      const updatedTask = await request(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      state.tasks = state.tasks.map((entry) => (entry.id === task.id ? updatedTask : entry));
    } catch (error) {
      event.target.value = task.status;
      setError(error.message);
    } finally {
      setTaskBusy(task.id, false);
      render();
    }
  });

  controls.append(label, select);
  item.append(topRow, controls);
  return item;
}

function render() {
  elements.taskList.innerHTML = "";
  elements.emptyState.hidden = state.tasks.length !== 0;

  for (const task of state.tasks) {
    elements.taskList.append(buildTaskItem(task));
  }

  updateSummary();
}

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setError();
  setFeedback();

  const title = elements.title.value.trim();
  if (!title) {
    elements.title.focus();
    return;
  }

  const submitButton = elements.form.querySelector("button[type='submit']");
  submitButton.disabled = true;

  try {
    const createdTask = await request("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    state.tasks.push(createdTask);
    elements.form.reset();
    setFeedback("Task saved.");
    render();
    elements.title.focus();
  } catch (error) {
    setError(error.message);
  } finally {
    submitButton.disabled = false;
  }
});

async function initialize() {
  try {
    await loadTasks();
    render();
  } catch (error) {
    setError(error.message);
  }
}

initialize();
