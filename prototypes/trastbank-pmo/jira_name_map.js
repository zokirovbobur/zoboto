/**
 * Jira displayName -> Employee canonical shortName
 *
 * Jira account names are usually "Ism Familiya" while data.js employees
 * use "Familiya Ism" (shortName). This table normalizes known Jira
 * display names to the canonical shortName used across data.js/jira_issues.js.
 *
 * Single source of truth for sync tooling (api/pmo-sync.js, lib/jira-sync-core.js,
 * gen_jira*.py, sync_teams.js). Update here when a new unmapped Jira name
 * is discovered (see "YANGI JIRA ISMLARI" section of sync reports).
 */

const JIRA_TO_EMP = {
  'Damir Mirzabaev':           'Mirzabayev Damir',
  'Mukhammadrasul':            "Akramxo'jayev Muhammadrasul",
  'Farrux Xolikulov':          'Xolikulov Farrux',
  'Ulugbek Rasulov':           'Rasulov Ulugbek',
  'Sarvar Tohirov':            'Toxirov Sarvar',
  'Baxtiyor Valixonov':        'Valixonov Baxtiyor',
  'Mohirjon':                  'Alimov Mohirjon',
  'Mohirjon Alimov':           'Alimov Mohirjon',
  'Pulatov Nozim':             'Pulatov Nozimjon',
  'Yaxyo Sunnatov':            'Sunnatov Yaxyo',
  'Ulugbek Umarov':            "Umarov Ulug'bek",
  'Ravshan Sattarov':          'Sattarov Ravshan',
  'Шерзод Ахмадов':            'Axmadov Sherzod',
  'Jaloliddin Xabibjonov':     'Xabibjonov Jaloliddin',
  'Dilmurod Axmadov':          'Axmadov Dilmurod',
  'Ismoil Gayratov':           "G'ayratov Ismoil",
  'Doniyorbek Komilov':        'Komilov Doniyorbek',
  'Jahongir Inatullaev':       'Inatullayev Jaxongir',
  'Almazbek':                  'Davranbekov Almazbek',
  'Самадбек':                  'Yuldashev Samatbek',
  'Самадбек  Юлдашев':         'Yuldashev Samatbek',
  'Abdulaziz':                 'Aliakbarov Abdulaziz',
  'Abdulaziz Babajanov':       'Babajanov Abdulaziz',
  'aziztrastpay':               'Mirzaolimov Azizbek',
  'Abdulazim muhammadrafiqov': 'Mirzaolimov Azizbek',
  'JAHONGIR SAIDIY':           'Saidiy Jahongir',
  'Акрамхужаев Мухаммадрасул': "Akramxo'jayev Muhammadrasul",
  'Akramhujaev Muhammadrasul': "Akramxo'jayev Muhammadrasul",
  'jamshid.trastpay':          'Saidov Jamshid',
  'Diyorbek':                  'Jabbarov Diyorbek',
  'Diyorbek Jabborov':         'Jabbarov Diyorbek',
  'Ikhtiyar Abdukhashimov':    'Abduxoshimov Ixtiyor',
  'Ali Yadgarov':               'Yodgorov Alibek',
  "Ahmadillo Jo'raboyev":      "Jo'raboyev Axmadillo",
  'Yakubjonov Azizjon':        'Yokubjonov Azizjon',
  'Pavel Pankin':              'Pankin Pavel',
};

/**
 * Normalizes a Jira displayName to the canonical employee shortName.
 * Falls back to: match against known employees (shortName/fullName,
 * case-insensitive), then the raw Jira name as-is if nothing matches.
 *
 * @param {string} jiraName
 * @param {Array<{shortName:string, fullName:string}>} employees
 * @returns {{ name: string, isNew: boolean }}
 */
function normalizeJiraName(jiraName, employees) {
  if (!jiraName) return { name: null, isNew: false };
  const trimmed = jiraName.trim();
  if (JIRA_TO_EMP[trimmed]) return { name: JIRA_TO_EMP[trimmed], isNew: false };

  const lower = trimmed.toLowerCase();
  const emp = (employees || []).find(e =>
    (e.shortName && e.shortName.toLowerCase() === lower) ||
    (e.fullName && e.fullName.toLowerCase() === lower)
  );
  if (emp) return { name: emp.shortName, isNew: false };

  return { name: trimmed, isNew: true };
}

if (typeof window !== "undefined") {
  window.JIRA_TO_EMP = JIRA_TO_EMP;
  window.normalizeJiraName = normalizeJiraName;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports.JIRA_TO_EMP = JIRA_TO_EMP;
  module.exports.normalizeJiraName = normalizeJiraName;
}
