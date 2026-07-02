// Run with: npm test (node --test)
const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  priorityNorm,
  mostFrequent,
  nextProjectId,
  buildDevopsIssues,
  updateProjects,
} = require("../lib/jira-sync-core.js");

function emptyReport() {
  return { updated: [], unchanged: [], emptyEpics: [], epicNotFound: [], newNames: [], newBoards: [], newProjects: [], staleTeamMembers: [], diffs: [], fallbackUsed: false, _seenNewNames: new Set() };
}

// ---------- priorityNorm ----------

test("priorityNorm: empty list is planned", () => {
  assert.equal(priorityNorm([]), "planned");
});

test("priorityNorm: any paused wins", () => {
  assert.equal(priorityNorm(["completed", "progress", "paused"]), "paused");
});

test("priorityNorm: progress beats completed/planned", () => {
  assert.equal(priorityNorm(["completed", "progress", "planned"]), "progress");
});

test("priorityNorm: all completed is completed", () => {
  assert.equal(priorityNorm(["completed", "completed"]), "completed");
});

test("priorityNorm: completed + planned mix is planned", () => {
  assert.equal(priorityNorm(["completed", "planned"]), "planned");
});

// ---------- mostFrequent ----------

test("mostFrequent: empty list returns empty string", () => {
  assert.equal(mostFrequent([]), "");
});

test("mostFrequent: picks the majority value", () => {
  assert.equal(mostFrequent(["Done", "In Progress", "Done"]), "Done");
});

test("mostFrequent: tie keeps first-counted value", () => {
  assert.equal(mostFrequent(["A", "B"]), "A");
});

// ---------- nextProjectId ----------

test("nextProjectId: empty portfolio starts at P001", () => {
  assert.equal(nextProjectId([]), "P001");
});

test("nextProjectId: increments the highest existing id", () => {
  assert.equal(nextProjectId([{ id: "P002" }, { id: "P010" }, { id: "P003" }]), "P011");
});

test("nextProjectId: ignores malformed ids", () => {
  assert.equal(nextProjectId([{ id: "PX" }, { id: "P007" }, { id: "" }]), "P008");
});

// ---------- buildDevopsIssues ----------

test("buildDevopsIssues: maps TD tickets to rows with normalized assignees", () => {
  const employees = [{ id: "E1", shortName: "Pankin Pavel", fullName: "Pankin Pavel Sergeyevich" }];
  const report = { newNames: [], _seenNewNames: new Set() };
  const opsTickets = {
    TD: [
      {
        key: "TD-1", summary: "Deploy pipeline", status: "Done", type: "Task",
        assignee: "Pavel Pankin", created: "2026-06-01T10:00:00.000+0500",
        priority: "High", storyPoints: 3, done: true,
      },
      {
        key: "TD-2", summary: "Monitoring", status: "To Do", type: "Task",
        assignee: null, created: "2026-06-02T10:00:00.000+0500",
        priority: "Medium", storyPoints: null, done: false,
      },
    ],
    BSA: [{ key: "BSA-1", summary: "ignored", status: "Done", type: "Task", assignee: null, created: "", priority: "Low", storyPoints: null, done: true }],
  };

  const rows = buildDevopsIssues(opsTickets, employees, report);
  assert.deepEqual(rows, [
    ["TD-1", "Deploy pipeline", "Done", "Task", "Pankin Pavel", "2026-06-01", "High", 3],
    ["TD-2", "Monitoring", "To Do", "Task", "", "2026-06-02", "Medium", null],
  ]);
  assert.equal(report.newNames.length, 0);
});

test("buildDevopsIssues: unmapped assignee is reported once as a new name", () => {
  const report = { newNames: [], _seenNewNames: new Set() };
  const opsTickets = {
    TD: [
      { key: "TD-3", summary: "A", status: "To Do", type: "Task", assignee: "Totally Unknown", created: "2026-06-03", priority: "Low", storyPoints: null, done: false },
      { key: "TD-4", summary: "B", status: "To Do", type: "Task", assignee: "Totally Unknown", created: "2026-06-04", priority: "Low", storyPoints: null, done: false },
    ],
  };

  const rows = buildDevopsIssues(opsTickets, [], report);
  assert.equal(rows.length, 2);
  assert.equal(rows[0][4], "Totally Unknown");
  assert.deepEqual(report.newNames, [{ displayName: "Totally Unknown", project: "TD-BOARD" }]);
});

test("buildDevopsIssues: no TD board yields empty array", () => {
  const report = { newNames: [], _seenNewNames: new Set() };
  assert.deepEqual(buildDevopsIssues({}, [], report), []);
});

// ---------- updateProjects: PM / executor re-sync ----------

test("updateProjects: refreshes stale PM (author) and executor (assignee) from the epic on a completed project", () => {
  const dataObj = {
    products: ["Trastpay"],
    boardTypes: {},
    employees: [
      { id: "E15", shortName: "Mirzabayev Damir", fullName: "Mirzabayev Damir Baxador Uli" },
      { id: "E20", shortName: "Inatullayev Jaxongir", fullName: "Jahongir Inatullaev" },
    ],
    projects: [{
      id: "P101", name: "UzEx ESMA", product: "Trastpay", jiraEpicKey: "SL-6",
      pm: "Mirzabayev Damir", pmId: "E15", executor: "", team: [], norm: "completed",
      startDate: "22.09.2025", epicCreatedDate: "22.09.2025", originalStatus: "Done",
    }],
  };
  const epic = {
    key: "SL-6", summary: "UzEx ESMA", status: "Done",
    assignee: "Jahongir Inatullaev", reporter: "Jahongir Inatullaev",
    created: "2025-09-22T10:00:00.000+0500", projectKey: "SL", projectName: "Trastpay",
  };
  const jira = {
    epicsByBoard: { SL: [epic] },
    childrenByEpic: { "SL-6": [{ status: "Done", assignee: "Jahongir Inatullaev", created: "2025-09-22T10:00:00.000+0500" }] },
    opsTickets: {},
  };
  const report = emptyReport();

  updateProjects(dataObj, jira, report);

  const p = dataObj.projects[0];
  assert.equal(p.pm, "Inatullayev Jaxongir");
  assert.equal(p.pmId, "E20"); // pmId realigned so the board (prefers pmId) shows the Jira author
  assert.equal(p.executor, "Inatullayev Jaxongir");
  assert.ok(report.updated.includes("P101"));
  const fields = report.diffs.find(d => d.id === "P101").diffs.map(x => x[0]);
  assert.ok(fields.includes("pm"));
  assert.ok(fields.includes("executor"));
});

test("updateProjects: leaves PM/executor untouched when the epic already matches", () => {
  const dataObj = {
    products: ["Trastpay"],
    boardTypes: {},
    employees: [{ id: "E20", shortName: "Inatullayev Jaxongir", fullName: "Jahongir Inatullaev" }],
    projects: [{
      id: "P101", name: "UzEx ESMA", product: "Trastpay", jiraEpicKey: "SL-6",
      pm: "Inatullayev Jaxongir", pmId: "E20", executor: "Inatullayev Jaxongir",
      team: ["Inatullayev Jaxongir"], norm: "completed",
      startDate: "22.09.2025", epicCreatedDate: "22.09.2025", originalStatus: "Done",
    }],
  };
  const epic = {
    key: "SL-6", summary: "UzEx ESMA", status: "Done",
    assignee: "Jahongir Inatullaev", reporter: "Jahongir Inatullaev",
    created: "2025-09-22T10:00:00.000+0500", projectKey: "SL", projectName: "Trastpay",
  };
  const jira = {
    epicsByBoard: { SL: [epic] },
    childrenByEpic: { "SL-6": [{ status: "Done", assignee: "Jahongir Inatullaev", created: "2025-09-22T10:00:00.000+0500" }] },
    opsTickets: {},
  };
  const report = emptyReport();

  updateProjects(dataObj, jira, report);

  assert.ok(report.unchanged.includes("P101"));
  assert.equal(report.diffs.length, 0);
});
