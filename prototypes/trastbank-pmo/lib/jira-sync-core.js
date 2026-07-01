// ===================================================================
// jira-sync-core.js
//
// Deterministic Jira -> PMO board sync pipeline (no LLM involved).
// Reimplements the rules that used to live in the manual "PMO sync"
// chat prompt as plain code, so a button/cron can run this for free.
//
// Pure functions only (network + GitHub commit logic lives in
// api/pmo-sync.js) so this module can be unit-tested with fixtures.
// ===================================================================

const { JIRA_STATUS_MAP, jiraNorm } = require("../jira_status_map.js");
const { normalizeJiraName } = require("../jira_name_map.js");

const MAHSULOT_BOARDS = ["SL", "KT", "FC", "ABS", "AI", "MW", "MDI", "PH", "TB"];
const OPERATIONS_BOARDS = ["BSA", "TD"];

const EPIC_FIELDS = ["summary", "status", "assignee", "reporter", "created", "project"];
const TICKET_FIELDS = ["summary", "status", "issuetype", "assignee", "created", "priority"];

// ---------- Jira REST client ----------

function authHeader(email, apiToken) {
  return "Basic " + Buffer.from(`${email}:${apiToken}`).toString("base64");
}

/**
 * Runs a JQL search and returns ALL matching issues (handles pagination).
 * Tries the current /search/jql endpoint first, falls back to the
 * classic /search endpoint for older/self-hosted-style instances.
 */
async function jqlSearchAll(cfg, jql, fields) {
  const headers = {
    Authorization: authHeader(cfg.jiraEmail, cfg.jiraApiToken),
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // 1) New cursor-based endpoint (current Jira Cloud standard)
  try {
    const issues = [];
    let nextPageToken;
    for (;;) {
      const res = await fetch(`${cfg.jiraBaseUrl}/rest/api/3/search/jql`, {
        method: "POST",
        headers,
        body: JSON.stringify({ jql, maxResults: 100, fields, nextPageToken }),
      });
      if (!res.ok) {
        if (res.status === 404) throw Object.assign(new Error("no /search/jql"), { fallback: true });
        throw new Error(`Jira /search/jql ${res.status}: ${await res.text()}`);
      }
      const body = await res.json();
      issues.push(...(body.issues || []));
      if (body.isLast || !body.nextPageToken) break;
      nextPageToken = body.nextPageToken;
    }
    return issues;
  } catch (e) {
    if (!e.fallback) throw e;
  }

  // 2) Classic offset-based endpoint (fallback)
  const issues = [];
  let startAt = 0;
  for (;;) {
    const res = await fetch(`${cfg.jiraBaseUrl}/rest/api/3/search`, {
      method: "POST",
      headers,
      body: JSON.stringify({ jql, startAt, maxResults: 100, fields }),
    });
    if (!res.ok) throw new Error(`Jira /search ${res.status}: ${await res.text()}`);
    const body = await res.json();
    issues.push(...(body.issues || []));
    startAt += body.issues.length;
    if (!body.issues.length || startAt >= body.total) break;
  }
  return issues;
}

function fmtDate(isoOrJiraDate) {
  if (!isoOrJiraDate) return "";
  const d = new Date(isoOrJiraDate);
  if (isNaN(d)) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

// ---------- Fetchers ----------

async function fetchMahsulotEpics(cfg, boardKey) {
  const issuetype = boardKey === "KT" ? "Эпик" : "Epic";
  const jql = `project = ${boardKey} AND issuetype = "${issuetype}" ORDER BY created ASC`;
  const issues = await jqlSearchAll(cfg, jql, EPIC_FIELDS);
  return issues.map(i => ({
    key: i.key,
    summary: i.fields.summary,
    status: i.fields.status?.name || "",
    assignee: i.fields.assignee?.displayName || null,
    reporter: i.fields.reporter?.displayName || null,
    created: i.fields.created,
    projectKey: i.fields.project?.key || boardKey,
  }));
}

async function fetchChildren(cfg, epicKey) {
  const jql = `parent = ${epicKey} ORDER BY created ASC`;
  const issues = await jqlSearchAll(cfg, jql, TICKET_FIELDS);
  return issues.map(i => ({
    key: i.key,
    summary: i.fields.summary,
    status: i.fields.status?.name || "",
    type: i.fields.issuetype?.name || "",
    assignee: i.fields.assignee?.displayName || null,
    created: i.fields.created,
    done: jiraNorm(i.fields.status?.name) === "completed",
  }));
}

async function fetchOperationsTickets(cfg, boardKey) {
  const jql = `project = ${boardKey} ORDER BY created DESC`;
  const issues = await jqlSearchAll(cfg, jql, TICKET_FIELDS);
  return issues.map(i => ({
    key: i.key,
    summary: i.fields.summary,
    status: i.fields.status?.name || "",
    type: i.fields.issuetype?.name || "",
    assignee: i.fields.assignee?.displayName || null,
    created: i.fields.created,
    priority: i.fields.priority?.name || "Medium",
    done: jiraNorm(i.fields.status?.name) === "completed",
  }));
}

/**
 * Runs async `fn` over `items` with at most `limit` in flight at once.
 * A serverless function has a hard wall-clock budget, and a sync run can
 * involve 80+ Jira calls (9 boards + ~70 epics) — doing them one at a time
 * blows past that; firing all of them at once risks Jira's rate limiter.
 */
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/** Fetches everything from Jira needed for a full sync run. */
async function fetchAllJiraData(cfg, report) {
  const epicsByBoard = {};
  const childrenByEpic = {};

  const epicLists = await mapWithConcurrency(MAHSULOT_BOARDS, MAHSULOT_BOARDS.length, board =>
    fetchMahsulotEpics(cfg, board)
  );
  MAHSULOT_BOARDS.forEach((board, i) => { epicsByBoard[board] = epicLists[i]; });

  const allEpics = epicLists.flat();
  const childLists = await mapWithConcurrency(allEpics, 8, epic => fetchChildren(cfg, epic.key));
  allEpics.forEach((epic, i) => { childrenByEpic[epic.key] = childLists[i]; });

  const opsTickets = {};
  const opsLists = await mapWithConcurrency(OPERATIONS_BOARDS, OPERATIONS_BOARDS.length, board =>
    fetchOperationsTickets(cfg, board)
  );
  OPERATIONS_BOARDS.forEach((board, i) => { opsTickets[board] = opsLists[i]; });

  return { epicsByBoard, childrenByEpic, opsTickets };
}

// ---------- Norm computation ----------

function priorityNorm(norms) {
  if (!norms.length) return "planned";
  if (norms.includes("paused")) return "paused";
  if (norms.includes("progress")) return "progress";
  if (norms.every(n => n === "completed")) return "completed";
  return "planned";
}

function mostFrequent(list) {
  if (!list.length) return "";
  const counts = new Map();
  for (const v of list) counts.set(v, (counts.get(v) || 0) + 1);
  let best = list[0], bestCount = 0;
  for (const [v, c] of counts) if (c > bestCount) { best = v; bestCount = c; }
  return best;
}

// ---------- jira_issues.js / devops_issues.js rebuild ----------

function ticketRecord(t, employees, report, projectLabel) {
  const { name, isNew } = normalizeJiraName(t.assignee, employees);
  if (isNew) report.newNames.push({ displayName: t.assignee, project: projectLabel });
  return {
    key: t.key,
    summary: t.summary,
    type: t.type,
    status: t.status,
    done: t.done,
    assignee: t.assignee ? name : null,
  };
}

function buildJiraIssues(childrenByEpic, opsTickets, employees, report) {
  const out = {};
  for (const epicKey of Object.keys(childrenByEpic).sort()) {
    out[epicKey] = childrenByEpic[epicKey].map(t => ticketRecord(t, employees, report, epicKey));
  }
  out["BSA-BOARD"] = (opsTickets.BSA || []).map(t => ticketRecord(t, employees, report, "BSA-BOARD"));
  out["TD-BOARD"] = (opsTickets.TD || []).map(t => ticketRecord(t, employees, report, "TD-BOARD"));
  return out;
}

function buildDevopsIssues(opsTickets, employees, report) {
  return (opsTickets.TD || []).map(t => {
    const { name, isNew } = normalizeJiraName(t.assignee, employees);
    if (isNew) report.newNames.push({ displayName: t.assignee, project: "TD-BOARD" });
    return [t.key, t.summary, t.status, t.type, t.assignee ? name : "", (t.created || "").slice(0, 10), t.priority];
  });
}

// ---------- data.js projects update (step 5/7) ----------

/**
 * For each non-completed project, recompute norm/team/startDate/originalStatus
 * from the freshly-fetched Jira data. Mutates `dataObj.projects` in place.
 * Returns the report additions (updated/unchanged/emptyEpics ids).
 */
function updateProjects(dataObj, jira, report) {
  const { epicsByBoard, childrenByEpic, opsTickets } = jira;
  const allEpics = {};
  for (const list of Object.values(epicsByBoard)) for (const e of list) allEpics[e.key] = e;

  const employees = dataObj.employees;
  const boardTypes = dataObj.boardTypes || {};

  for (const p of dataObj.projects) {
    if (p.norm === "completed") continue;
    if (!p.jiraEpicKey) continue;

    const bt = boardTypes[p.product] || "Mahsulot";
    let pseudoChildren; // [{status, assignee, created}]

    if (bt === "Operations") {
      const boardKey = p.jiraEpicKey === "BSA-BOARD" ? "BSA" : p.jiraEpicKey === "TD-BOARD" ? "TD" : null;
      if (!boardKey) continue;
      pseudoChildren = opsTickets[boardKey] || [];
    } else {
      const epic = allEpics[p.jiraEpicKey];
      if (!epic) {
        report.epicNotFound.push(p.jiraEpicKey + " (" + p.id + ")");
        continue;
      }
      const children = childrenByEpic[p.jiraEpicKey] || [];
      if (children.length === 0) {
        report.emptyEpics.push(p.jiraEpicKey);
        pseudoChildren = [{ status: epic.status, assignee: epic.assignee, created: epic.created }];
      } else {
        pseudoChildren = children;
      }
    }

    const diffs = [];

    // norm
    const norms = pseudoChildren.map(c => jiraNorm(c.status));
    const newNorm = priorityNorm(norms);
    if (newNorm !== p.norm) { diffs.push(["norm", p.norm, newNorm]); p.norm = newNorm; }

    // originalStatus
    const newOriginalStatus = mostFrequent(pseudoChildren.map(c => c.status).filter(Boolean));
    if (newOriginalStatus && newOriginalStatus !== p.originalStatus) {
      diffs.push(["originalStatus", p.originalStatus, newOriginalStatus]);
      p.originalStatus = newOriginalStatus;
    }

    // team: normalize existing + new names, union, dedupe
    const existingNormalized = (p.team || []).map(n => normalizeJiraName(n, employees).name);
    const newNames = pseudoChildren
      .map(c => c.assignee)
      .filter(Boolean)
      .map(n => {
        const { name, isNew } = normalizeJiraName(n, employees);
        if (isNew) report.newNames.push({ displayName: n, project: p.id + " " + p.name });
        return name;
      });
    const mergedTeam = [...new Set([...existingNormalized, ...newNames])];
    const teamChanged = mergedTeam.length !== (p.team || []).length ||
      mergedTeam.some(n => !(p.team || []).includes(n));
    if (teamChanged) { diffs.push(["team", (p.team || []).join(", "), mergedTeam.join(", ")]); p.team = mergedTeam; }

    // startDate: only fill if currently empty
    if (!p.startDate) {
      const dates = pseudoChildren.map(c => c.created).filter(Boolean).sort();
      if (dates.length) {
        const oldest = fmtDate(dates[0]);
        diffs.push(["startDate", "", oldest]);
        p.startDate = oldest;
      }
    }

    if (diffs.length) {
      report.updated.push(p.id);
      report.diffs.push({ id: p.id, name: p.name, diffs });
    } else {
      report.unchanged.push(p.id);
    }
  }
}

// ---------- workload recompute (step 8) ----------

function recomputeWorkload(dataObj) {
  const employees = dataObj.employees;
  const byId = new Map(employees.map(e => [e.id, e]));
  const byShort = new Map(employees.map(e => [e.shortName, e]));

  employees.forEach(e => {
    e.projectIds = [];
    e.statusCounts = { completed: 0, progress: 0, planned: 0, paused: 0 };
  });

  for (const p of dataObj.projects) {
    const matched = new Set();
    if (p.pmId && byId.has(p.pmId)) matched.add(p.pmId);
    for (const name of p.team || []) {
      const e = byShort.get(name);
      if (e) matched.add(e.id);
    }
    for (const id of matched) {
      const e = byId.get(id);
      if (!e.projectIds.includes(p.id)) e.projectIds.push(p.id);
      if (p.norm && e.statusCounts[p.norm] !== undefined) e.statusCounts[p.norm]++;
    }
  }

  employees.forEach(e => {
    e.totalMatched = e.projectIds.length;
    e.loadLevel = e.totalMatched >= 20 ? "critical"
      : e.totalMatched >= 12 ? "high"
      : e.totalMatched >= 6 ? "normal"
      : "low";
  });
}

// ---------- report text ----------

function renderReportText(report, dateStr) {
  const lines = [];
  lines.push("=== PMO ↔ JIRA DAILY SYNC HISOBOTI ===");
  lines.push("Sana: " + dateStr);
  lines.push("");
  lines.push("FARQLAR TOPILDI:");
  lines.push("| PMO ID | Loyiha nomi | Maydon | Eski qiymat | Yangi qiymat |");
  lines.push("|--------|-------------|--------|-------------|--------------|");
  for (const d of report.diffs) {
    for (const [field, oldV, newV] of d.diffs) {
      lines.push(`| ${d.id} | ${d.name} | ${field} | ${oldV} | ${newV} |`);
    }
  }
  lines.push("");
  lines.push("YANGILANGAN LOYIHALAR: " + (report.updated.join(", ") || "—"));
  lines.push("YANGILANMAGAN LOYIHALAR (farq yo'q): " + (report.unchanged.join(", ") || "—"));
  lines.push("CHILD TICKET YO'Q EPICLAR: " + ([...new Set(report.emptyEpics)].join(", ") || "—"));
  if (report.epicNotFound.length) lines.push("TOPILMAGAN EPIC KEYLAR: " + report.epicNotFound.join(", "));
  lines.push("YANGI JIRA ISMLARI (JIRA_TO_EMP da yo'q): " +
    (report.newNames.map(n => `${n.displayName} → ${n.project}`).join("; ") || "—"));
  lines.push("===================================");
  return lines.join("\n");
}

// ---------- orchestrator ----------

/**
 * @param {object} cfg { jiraBaseUrl, jiraEmail, jiraApiToken }
 * @param {object} currentData { dataObj, jiraIssuesObj, devopsIssuesArr } already-parsed JSON
 * @returns {object} { dataObj, jiraIssuesObj, devopsIssuesArr, report, reportText, changed }
 */
async function runSync(cfg, currentData) {
  const report = { updated: [], unchanged: [], emptyEpics: [], epicNotFound: [], newNames: [], diffs: [] };

  const jira = await fetchAllJiraData(cfg, report);

  const dataObj = currentData.dataObj;
  updateProjects(dataObj, jira, report);
  recomputeWorkload(dataObj);

  const jiraIssuesObj = buildJiraIssues(jira.childrenByEpic, jira.opsTickets, dataObj.employees, report);
  const devopsIssuesArr = buildDevopsIssues(jira.opsTickets, dataObj.employees, report);

  const dateStr = new Date().toISOString().slice(0, 10);
  const reportText = renderReportText(report, dateStr);

  return {
    dataObj,
    jiraIssuesObj,
    devopsIssuesArr,
    report,
    reportText,
    dateStr,
    changed: report.updated.length > 0,
  };
}

module.exports = {
  MAHSULOT_BOARDS,
  OPERATIONS_BOARDS,
  jqlSearchAll,
  fetchAllJiraData,
  priorityNorm,
  updateProjects,
  recomputeWorkload,
  buildJiraIssues,
  buildDevopsIssues,
  renderReportText,
  runSync,
};
