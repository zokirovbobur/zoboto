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

// OPERATIONS_BOARDS: the only two boards that are NOT "Mahsulot" (product)
// boards. Every other Jira project is fetched as Mahsulot automatically
// (see fetchMahsulotBoardKeys) — if a genuinely new Operations-type board
// ever appears, add its key here AND to data.js's boardTypes map.
const OPERATIONS_BOARDS = ["BSA", "TD"];
// Fallback only, used if the live project-list fetch fails. Kept up to
// date opportunistically; not load-bearing when Jira is reachable.
const MAHSULOT_BOARDS_FALLBACK = ["SL", "KT", "FC", "ABS", "AI", "MW", "MDI", "PH", "TB", "MP", "WTB"];

const EPIC_FIELDS = ["summary", "status", "assignee", "reporter", "created", "project"];
// customfield_10016 = "Story point estimate" on this Jira Cloud site (verified via
// issue type field metadata; the field ID is global to the site, not per-project).
const STORY_POINTS_FIELD = "customfield_10016";
const TICKET_FIELDS = ["summary", "status", "issuetype", "assignee", "created", "priority", STORY_POINTS_FIELD];

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
  // Different boards name their Epic issue type in different languages
  // (e.g. KT/DBO uses "Эпик") — match both instead of guessing per board key.
  const jql = `project = ${boardKey} AND issuetype in ("Epic", "Эпик") ORDER BY created ASC`;
  const issues = await jqlSearchAll(cfg, jql, EPIC_FIELDS);
  return issues.map(i => ({
    key: i.key,
    summary: i.fields.summary,
    status: i.fields.status?.name || "",
    assignee: i.fields.assignee?.displayName || null,
    reporter: i.fields.reporter?.displayName || null,
    created: i.fields.created,
    projectKey: i.fields.project?.key || boardKey,
    projectName: i.fields.project?.name || boardKey,
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
    storyPoints: i.fields[STORY_POINTS_FIELD] ?? null,
    done: jiraNorm(i.fields.status?.name) === "completed",
  }));
}

/**
 * Discovers Mahsulot board keys straight from Jira instead of a hardcoded
 * list — every project on the site is a Mahsulot board except the two
 * Operations ones. Falls back to MAHSULOT_BOARDS_FALLBACK if the project
 * list can't be fetched, so a transient error doesn't stall the whole sync;
 * the fallback is flagged on the report so it never happens silently.
 */
async function fetchMahsulotBoardKeys(cfg, report) {
  try {
    const res = await fetch(`${cfg.jiraBaseUrl}/rest/api/3/project/search?maxResults=200`, {
      headers: {
        Authorization: authHeader(cfg.jiraEmail, cfg.jiraApiToken),
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error(`Jira project search ${res.status}: ${await res.text()}`);
    const body = await res.json();
    return (body.values || [])
      .map(p => p.key)
      .filter(key => !OPERATIONS_BOARDS.includes(key));
  } catch (err) {
    console.error("fetchMahsulotBoardKeys fell back to the static list:", err);
    if (report) report.fallbackUsed = true;
    return MAHSULOT_BOARDS_FALLBACK;
  }
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
    storyPoints: i.fields[STORY_POINTS_FIELD] ?? null,
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

  const mahsulotBoards = await fetchMahsulotBoardKeys(cfg, report);
  report.newBoards = mahsulotBoards.filter(b => !MAHSULOT_BOARDS_FALLBACK.includes(b));

  const epicLists = await mapWithConcurrency(mahsulotBoards, mahsulotBoards.length, board =>
    fetchMahsulotEpics(cfg, board)
  );
  mahsulotBoards.forEach((board, i) => { epicsByBoard[board] = epicLists[i]; });

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

/** Records a not-yet-mapped Jira name at most once per (name, project) pair. */
function addNewName(report, displayName, project) {
  const key = displayName + " " + project;
  if (report._seenNewNames.has(key)) return;
  report._seenNewNames.add(key);
  report.newNames.push({ displayName, project });
}

function ticketRecord(t, employees, report, projectLabel) {
  const { name, isNew } = normalizeJiraName(t.assignee, employees);
  if (isNew) addNewName(report, t.assignee, projectLabel);
  return {
    key: t.key,
    summary: t.summary,
    type: t.type,
    status: t.status,
    done: t.done,
    assignee: t.assignee ? name : null,
    storyPoints: t.storyPoints ?? null,
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
    if (isNew) addNewName(report, t.assignee, "TD-BOARD");
    return [t.key, t.summary, t.status, t.type, t.assignee ? name : "", (t.created || "").slice(0, 10), t.priority, t.storyPoints ?? null];
  });
}

// ---------- data.js projects update (step 5/7) ----------

/** Next "Pnnn" id after the highest currently in use. */
function nextProjectId(projects) {
  const nums = projects.map(p => parseInt((p.id || "").replace(/^P/, ""), 10)).filter(n => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return "P" + String(next).padStart(3, "0");
}

/**
 * Creates a minimal skeleton project row for every Mahsulot epic that has
 * no existing PMO project pointing at it (e.g. a board created in Jira
 * after the last manual data.js curation — MuamalatPay/MP, website trust
 * bank/WTB were missing entirely until this existed). Fields Jira can't
 * supply (goal, budget, customer, dates) are left blank for someone to
 * fill in manually; norm/team/dates get computed on the same sync run by
 * the normal per-project loop below since these rows are added to
 * dataObj.projects BEFORE that loop starts.
 */
function createMissingProjects(dataObj, allEpics, report) {
  const existingKeys = new Set(dataObj.projects.map(p => p.jiraEpicKey).filter(Boolean));
  for (const epic of Object.values(allEpics)) {
    if (existingKeys.has(epic.key)) continue;
    const id = nextProjectId(dataObj.projects);
    const product = epic.projectName || epic.projectKey;
    if (!dataObj.products.includes(product)) dataObj.products.push(product);
    const { name: pmName } = normalizeJiraName(epic.reporter, dataObj.employees);
    const { name: executorName } = normalizeJiraName(epic.assignee, dataObj.employees);
    dataObj.projects.push({
      id, name: epic.summary, product,
      goal: "", basis: "", department: "", customer: "", supplier: "",
      startDate: "", endDate: "", sum: "", paidFact: "",
      norm: "planned", originalStatus: epic.status,
      pm: epic.reporter ? pmName : "", demoReady: false, info: "",
      executor: epic.assignee ? executorName : "",
      team: [], pmId: "",
      jiraEpicKey: epic.key, origin: "Jira Epic",
    });
    existingKeys.add(epic.key);
    report.newProjects.push({ id, name: epic.summary, product, jiraEpicKey: epic.key });
  }
}

/**
 * For every project with a jiraEpicKey (completed or not — Jira is the
 * source of truth, so a completed project's team/pm data shouldn't be
 * allowed to drift stale forever), recompute norm/team/startDate/
 * originalStatus from the freshly-fetched Jira data. Mutates
 * `dataObj.projects` in place. Returns the report additions
 * (updated/unchanged/emptyEpics ids).
 */
function updateProjects(dataObj, jira, report) {
  const { epicsByBoard, childrenByEpic, opsTickets } = jira;
  const allEpics = {};
  for (const list of Object.values(epicsByBoard)) for (const e of list) allEpics[e.key] = e;

  createMissingProjects(dataObj, allEpics, report);

  report.staleTeamMembers = report.staleTeamMembers || [];
  const employees = dataObj.employees;
  const boardTypes = dataObj.boardTypes || {};

  for (const p of dataObj.projects) {
    if (!p.jiraEpicKey) continue;

    const bt = boardTypes[p.product] || "Mahsulot";
    let pseudoChildren; // [{status, assignee, created}]
    // true when pseudoChildren are real Jira tickets — stale-member detection
    // is only meaningful then (an empty epic's single stand-in row would
    // otherwise flag the whole team as stale).
    let fromRealTickets = true;

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
        fromRealTickets = false;
      } else {
        pseudoChildren = children;
      }
    }

    const diffs = [];

    // epic's own created date (Mahsulot only — Operations boards have no single epic)
    if (bt !== "Operations") {
      const epic = allEpics[p.jiraEpicKey];
      const newEpicCreated = epic ? fmtDate(epic.created) : "";
      if (newEpicCreated && newEpicCreated !== p.epicCreatedDate) {
        diffs.push(["epicCreatedDate", p.epicCreatedDate || "", newEpicCreated]);
        p.epicCreatedDate = newEpicCreated;
      }
    }

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

    // team: normalize existing + new names, union, dedupe. Some historical
    // team[] entries are raw employee IDs (e.g. "E14") that leaked in before
    // this pipeline existed — resolve those to the real shortName instead of
    // perpetuating them forever (normalizeJiraName alone won't catch these,
    // since "E14" isn't a Jira displayName and matches no employee by name).
    const existingNormalized = (p.team || []).map(n => {
      const idMatch = /^E\d+$/.test(n) && employees.find(e => e.id === n);
      return idMatch ? idMatch.shortName : normalizeJiraName(n, employees).name;
    });
    const newNames = pseudoChildren
      .map(c => c.assignee)
      .filter(Boolean)
      .map(n => {
        const { name, isNew } = normalizeJiraName(n, employees);
        if (isNew) addNewName(report, n, p.id + " " + p.name);
        return name;
      });
    const mergedTeam = [...new Set([...existingNormalized, ...newNames])];
    const teamChanged = mergedTeam.length !== (p.team || []).length ||
      mergedTeam.some(n => !(p.team || []).includes(n));
    if (teamChanged) { diffs.push(["team", (p.team || []).join(", "), mergedTeam.join(", ")]); p.team = mergedTeam; }

    // Members no longer visible on any Jira ticket are kept on the team
    // (never auto-deleted) but reported for manual review.
    if (fromRealTickets) {
      const currentNames = new Set(newNames);
      const stale = [...new Set(existingNormalized.filter(n => n && !currentNames.has(n)))];
      if (stale.length) report.staleTeamMembers.push({ projectId: p.id, names: stale });
    }

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

/**
 * Sums each employee's story points across every ticket assigned to them
 * (jiraIssuesObj already has assignees normalized to canonical shortName),
 * split into active (not done) vs completed. Sets e.storyPoints = {active,completed}.
 */
function computeEmployeeStoryPoints(dataObj, jiraIssuesObj) {
  const byShort = new Map(dataObj.employees.map(e => [e.shortName, e]));
  dataObj.employees.forEach(e => { e.storyPoints = { active: 0, completed: 0 }; });

  for (const tickets of Object.values(jiraIssuesObj)) {
    for (const t of tickets) {
      if (!t.assignee || !t.storyPoints) continue;
      const e = byShort.get(t.assignee);
      if (!e) continue;
      e.storyPoints[t.done ? "completed" : "active"] += t.storyPoints;
    }
  }
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
  if (report.fallbackUsed) {
    lines.push("OGOHLANTIRISH: Jira project ro'yxati olinmadi — zaxira ro'yxat ishlatildi " +
      "(yangi doskalar bu runda ko'rinmaydi).");
  }
  if (report.newBoards && report.newBoards.length) {
    lines.push("YANGI DOSKALAR TOPILDI (Mahsulot deb qabul qilindi — agar bu Operations bo'lsa, " +
      "OPERATIONS_BOARDS va data.js boardTypes'ni qo'lda yangilang): " + report.newBoards.join(", "));
  }
  if (report.newProjects && report.newProjects.length) {
    lines.push("YANGI LOYIHALAR YARATILDI (goal/budget/customer qo'lda to'ldirilishi kerak): " +
      report.newProjects.map(p => `${p.id} ${p.name} (${p.jiraEpicKey})`).join("; "));
  }
  if (report.staleTeamMembers && report.staleTeamMembers.length) {
    lines.push("JIRADA ENDI KO'RINMAYDIGAN TEAM A'ZOLARI (avtomatik o'chirilmaydi — qo'lda ko'rib chiqing): " +
      report.staleTeamMembers.map(s => `${s.projectId}: ${s.names.join(", ")}`).join(" | "));
  }
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
  const report = { updated: [], unchanged: [], emptyEpics: [], epicNotFound: [], newNames: [], newBoards: [], newProjects: [], staleTeamMembers: [], diffs: [], fallbackUsed: false, _seenNewNames: new Set() };

  const jira = await fetchAllJiraData(cfg, report);

  const dataObj = currentData.dataObj;
  updateProjects(dataObj, jira, report);
  recomputeWorkload(dataObj);

  const jiraIssuesObj = buildJiraIssues(jira.childrenByEpic, jira.opsTickets, dataObj.employees, report);
  const devopsIssuesArr = buildDevopsIssues(jira.opsTickets, dataObj.employees, report);
  computeEmployeeStoryPoints(dataObj, jiraIssuesObj);

  const dateStr = new Date().toISOString().slice(0, 10);
  const reportText = renderReportText(report, dateStr);
  delete report._seenNewNames;

  return {
    dataObj,
    jiraIssuesObj,
    devopsIssuesArr,
    report,
    reportText,
    dateStr,
    changed: report.updated.length > 0 || report.newProjects.length > 0,
  };
}

module.exports = {
  MAHSULOT_BOARDS_FALLBACK,
  OPERATIONS_BOARDS,
  jqlSearchAll,
  fetchMahsulotBoardKeys,
  fetchAllJiraData,
  priorityNorm,
  mostFrequent,
  nextProjectId,
  updateProjects,
  recomputeWorkload,
  computeEmployeeStoryPoints,
  buildJiraIssues,
  buildDevopsIssues,
  renderReportText,
  runSync,
};
