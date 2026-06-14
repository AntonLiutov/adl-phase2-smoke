(function () {
  const STORAGE_KEY = "task-list-prototype.tasks";
  const STATUSES = ["To Do", "In Progress", "Blocked", "Done"];

  const elements = {
    form: document.getElementById("task-form"),
    input: document.getElementById("task-input"),
    message: document.getElementById("form-message"),
    list: document.getElementById("task-list"),
    emptyState: document.getElementById("empty-state"),
    totalCount: document.getElementById("total-count"),
    doneCount: document.getElementById("done-count"),
  };

  function createStorageAdapter(storage) {
    return {
      load() {
        try {
          const raw = storage.getItem(STORAGE_KEY);
          if (!raw) {
            return [];
          }

          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed)) {
            return [];
          }

          return parsed
            .map(normalizeTask)
            .filter(Boolean)
            .sort((left, right) => left.order - right.order);
        } catch (_error) {
          return [];
        }
      },
      save(tasks) {
        storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      },
    };
  }

  function normalizeTask(task, index) {
    if (!task || typeof task !== "object") {
      return null;
    }

    const title = typeof task.title === "string" ? task.title.trim() : "";
    const status = STATUSES.includes(task.status) ? task.status : "To Do";
    const order = Number.isInteger(task.order) ? task.order : index ?? 0;

    if (!title) {
      return null;
    }

    return {
      id: typeof task.id === "string" && task.id ? task.id : crypto.randomUUID(),
      title,
      status,
      order,
    };
  }

  function createTaskStore(adapter) {
    let tasks = adapter.load();

    function persist() {
      tasks = tasks.map((task, index) => ({ ...task, order: index }));
      adapter.save(tasks);
    }

    return {
      getTasks() {
        return tasks.slice();
      },
      addTask(title) {
        const trimmed = title.trim();
        if (!trimmed) {
          return { ok: false, error: "Enter a task title before adding it." };
        }

        tasks = tasks.concat({
          id: crypto.randomUUID(),
          title: trimmed,
          status: "To Do",
          order: tasks.length,
        });
        persist();
        return { ok: true };
      },
      removeTask(id) {
        tasks = tasks.filter((task) => task.id !== id);
        persist();
      },
      updateStatus(id, status) {
        if (!STATUSES.includes(status)) {
          return;
        }

        tasks = tasks.map((task) =>
          task.id === id ? { ...task, status } : task,
        );
        persist();
      },
    };
  }

  const store = createTaskStore(createStorageAdapter(window.localStorage));

  function render() {
    const tasks = store.getTasks();
    elements.list.innerHTML = "";
    elements.totalCount.textContent = String(tasks.length);
    elements.doneCount.textContent = String(
      tasks.filter((task) => task.status === "Done").length,
    );

    elements.emptyState.classList.toggle("is-hidden", tasks.length > 0);

    for (const task of tasks) {
      const item = document.createElement("li");
      item.className = "task-item";

      const topRow = document.createElement("div");
      topRow.className = "task-row";

      const titleWrap = document.createElement("div");
      const title = document.createElement("p");
      title.className = "task-title";
      title.textContent = task.title;

      const meta = document.createElement("div");
      meta.className = "task-meta";

      const order = document.createElement("span");
      order.className = "eyebrow nums";
      order.textContent = `Task ${task.order + 1}`;

      const pill = document.createElement("span");
      pill.className = "status-pill";
      pill.dataset.status = task.status;
      pill.textContent = task.status;

      meta.append(order, pill);
      titleWrap.append(title, meta);

      const removeButton = document.createElement("button");
      removeButton.className = "btn-ghost";
      removeButton.type = "button";
      removeButton.textContent = "Remove";
      removeButton.setAttribute("aria-label", `Remove ${task.title}`);
      removeButton.addEventListener("click", function () {
        store.removeTask(task.id);
        render();
      });

      topRow.append(titleWrap, removeButton);

      const controls = document.createElement("div");
      controls.className = "task-controls";

      const statusField = document.createElement("label");
      statusField.className = "field";

      const statusLabel = document.createElement("span");
      statusLabel.className = "eyebrow";
      statusLabel.textContent = "Status";

      const select = document.createElement("select");
      select.className = "status-select";
      select.setAttribute("aria-label", `Status for ${task.title}`);

      for (const status of STATUSES) {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        option.selected = status === task.status;
        select.append(option);
      }

      select.addEventListener("change", function (event) {
        store.updateStatus(task.id, event.target.value);
        render();
      });

      statusField.append(statusLabel, select);
      controls.append(statusField);

      item.append(topRow, controls);
      elements.list.append(item);
    }
  }

  elements.form.addEventListener("submit", function (event) {
    event.preventDefault();

    const result = store.addTask(elements.input.value);
    elements.message.textContent = result.ok ? "" : result.error;

    if (!result.ok) {
      render();
      return;
    }

    elements.form.reset();
    elements.input.focus();
    render();
  });

  render();
})();
