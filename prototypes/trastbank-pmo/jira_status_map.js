/**
 * Jira epic status → PMO board norm mapping
 *
 * norm values: "completed" | "progress" | "planned" | "paused"
 *
 * Used by sync scripts (gen_jira.py, sync_teams.js) and any
 * future routines that pull Jira and write data.js.
 */

window.JIRA_STATUS_MAP = {

  completed: [
    "Готово",
    "Done",
    "In Prod",
    "В продакшне",
    "Closed",
  ],

  progress: [
    "IN DEV",
    "in dev",
    "В разработке",
    "В работе",
    "In Progress",
    "IN ANALYSIS",
  ],

  planned: [
    "К выполнению",
    "To Do",
    "Discovery",
    "Backlog",
    "Анализ",
    "Open",
  ],

  paused: [
    "Blocked",
    "В ожидании",
    "Отменён",
    "Cancelled",
    "On Hold",
  ],

};

/**
 * Returns the PMO norm for a given Jira status string.
 * Falls back to "planned" for unknown statuses.
 *
 * @param {string} jiraStatus
 * @returns {"completed"|"progress"|"planned"|"paused"}
 */
window.jiraNorm = function jiraNorm(jiraStatus) {
  if (!jiraStatus) return "planned";
  const s = jiraStatus.trim();
  for (const [norm, list] of Object.entries(window.JIRA_STATUS_MAP)) {
    if (list.some(v => v.toLowerCase() === s.toLowerCase())) return norm;
  }
  console.warn("[jira_status_map] Unknown Jira status:", s, "→ defaulting to 'planned'");
  return "planned";
};
