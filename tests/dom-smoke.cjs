const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const script = fs.readFileSync(path.join(root, "app.js"), "utf8");

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "http://localhost/",
});

const { window } = dom;
window.eval(script);

const document = window.document;
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-title");
const list = document.querySelector("#task-list");
const count = document.querySelector("#task-count");

const submitTask = (title) => {
  input.value = title;
  form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
};

submitTask("Plan sprint UI");
submitTask("Review blocked work");

if (list.children.length !== 2) {
  throw new Error(`Expected 2 tasks, got ${list.children.length}`);
}

const firstSelect = list.querySelector("select");
firstSelect.value = "Blocked";
firstSelect.dispatchEvent(new window.Event("change", { bubbles: true }));

const firstItem = document.querySelector(".task-item");
if (firstItem.dataset.status !== "Blocked") {
  throw new Error(`Expected Blocked, got ${firstItem.dataset.status}`);
}

firstItem.querySelector("button").click();
if (list.children.length !== 1) {
  throw new Error(`Expected 1 task, got ${list.children.length}`);
}

const uniqueOptions = [
  ...new Set([...document.querySelectorAll("option")].map((option) => option.value)),
];
const expected = ["To Do", "In Progress", "Blocked", "Done"];

if (JSON.stringify(uniqueOptions) !== JSON.stringify(expected)) {
  throw new Error(`Unexpected statuses: ${JSON.stringify(uniqueOptions)}`);
}

if (!css.includes("overflow: auto")) {
  throw new Error("Scrollable styling not found");
}

if (!count.textContent.includes("1 task")) {
  throw new Error(`Unexpected task count label: ${count.textContent}`);
}

console.log("DOM smoke passed");
