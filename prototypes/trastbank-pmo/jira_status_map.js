/**
 * Jira epic status → PMO board norm mapping
 *
 * norm values: "completed" | "progress" | "planned" | "paused"
 *
 * Used by sync scripts (gen_jira.py, sync_teams.js) and any
 * future routines that pull Jira and write data.js.
 */

const JIRA_STATUS_MAP = {

  completed: [
    "Готово",
    "Done",
    "DONE",
    "In Prod",
    "В продакшне",
    "Closed",
  ],

  progress: [
    "IN DEV",
    "in dev",
    "IN PROGRESS",
    "В разработке",
    "В работе",
    "In Progress",
    "IN ANALYSIS",
    "Ready for dev",
    "Ready for prod",
    "Documentation",
    "API Integrations",
    "UseCase & User Story",
    "Проверка",
  ],

  planned: [
    "К выполнению",
    "To Do",
    "TO DO",
    "Discovery",
    "Backlog",
    "backlog",
    "Анализ",
    "Open",
    "Selected for Development",
  ],

  paused: [
    "Blocked",
    "В ожидании",
    "Отменён",
    "Cancelled",
    "On Hold",
  ],

};

// Browser global (existing usage)
if (typeof window !== "undefined") window.JIRA_STATUS_MAP = JIRA_STATUS_MAP;
// Node/CommonJS (for serverless sync function)
if (typeof module !== "undefined" && module.exports) module.exports.JIRA_STATUS_MAP = JIRA_STATUS_MAP;

/**
 * Returns the PMO norm for a given Jira status string.
 * Falls back to "planned" for unknown statuses.
 *
 * @param {string} jiraStatus
 * @returns {"completed"|"progress"|"planned"|"paused"}
 */
function jiraNorm(jiraStatus) {
  if (!jiraStatus) return "planned";
  const s = jiraStatus.trim();
  for (const [norm, list] of Object.entries(JIRA_STATUS_MAP)) {
    if (list.some(v => v.toLowerCase() === s.toLowerCase())) return norm;
  }
  console.warn("[jira_status_map] Unknown Jira status:", s, "→ defaulting to 'planned'");
  return "planned";
}

if (typeof window !== "undefined") window.jiraNorm = jiraNorm;
if (typeof module !== "undefined" && module.exports) module.exports.jiraNorm = jiraNorm;
