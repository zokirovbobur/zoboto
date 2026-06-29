const fs = require('fs');

// ===== JIRA NAME → Employee shortName mapping =====
const JIRA_TO_EMP = {
  'Damir Mirzabaev':       'Mirzabayev Damir',
  'Mukhammadrasul':        "Akramxo'jayev Muhammadrasul",
  'Farrux Xolikulov':      'Xolikulov Farrux',
  'Ulugbek Rasulov':       'Rasulov Ulugbek',
  'Sarvar Tohirov':        'Toxirov Sarvar',
  'Baxtiyor Valixonov':    'Valixonov Baxtiyor',
  'Mohirjon':              'Alimov Mohirjon',
  'Pulatov Nozim':         'Pulatov Nozimjon',
  'Yaxyo Sunnatov':        'Sunnatov Yaxyo',
  'Ulugbek Umarov':        "Umarov Ulug'bek",
  'Ravshan Sattarov':      'Sattarov Ravshan',
  'Шерзод Ахмадов':        'Axmadov Sherzod',
  'Jaloliddin Xabibjonov': 'Xabibjonov Jaloliddin',
  'Dilmurod Axmadov':      'Axmadov Dilmurod',
  'Ismoil Gayratov':       'Gayratov Ismoil',
  'Doniyorbek Komilov':    'Komilov Doniyorbek',
  'Jahongir Inatullaev':   'Inatullayev Jaxongir',
  'Almazbek':              'Davranbekov Almazbek',
  'Самадбек':              'Yuldashev Samatbek',
  'Abdulaziz':             'Aliakbarov Abdulaziz',
  'aziztrastpay':          'Mirzaolimov Azizbek',
};

// ===== EPIC ASSIGNEES =====
const EPIC_ASSIGNEE = {
  'SL-253': 'Mirzabayev Damir',
  'SL-252': 'Mirzabayev Damir',
  'SL-243': 'Mirzabayev Damir',
  'SL-222': 'Mirzabayev Damir',
  'SL-218': 'Mirzabayev Damir',
  'SL-194': 'Mirzabayev Damir',
  'SL-174': 'Inatullayev Jaxongir',
  'SL-151': "Akramxo'jayev Muhammadrasul",
  'SL-144': "Akramxo'jayev Muhammadrasul",
  'SL-138': 'Mirzabayev Damir',
  'SL-134': 'Mirzabayev Damir',
  'SL-128': 'Mirzabayev Damir',
  'SL-119': 'Mirzabayev Damir',
  'SL-107': 'Mirzabayev Damir',
  'SL-104': 'Mirzabayev Damir',
  'SL-103': 'Mirzabayev Damir',
  'SL-100': 'Mirzabayev Damir',
  'SL-16':  'Mirzabayev Damir',
  'SL-15':  'Mirzabayev Damir',
  'SL-9':   'Mirzabayev Damir',
  'SL-7':   'Mirzabayev Damir',
  'SL-6':   'Mirzabayev Damir',
  'SL-5':   'Mirzabayev Damir',
  'MW-5':   'Axmadov Sherzod',
  'MW-3':   'Axmadov Sherzod',
  'MW-2':   'Axmadov Sherzod',
  'FC-12':  'Xolikulov Farrux',
  'FC-10':  'Xolikulov Farrux',
  'FC-9':   'Xolikulov Farrux',
  'FC-3':   'Xolikulov Farrux',
};

// ===== CHILD ASSIGNEES per epic =====
const CHILDREN_RAW = {
  'FC-29': [],
  'FC-30': ['Farrux Xolikulov'],
  'FC-31': ['Farrux Xolikulov'],
  'KT-27': ['Almazbek'],
  'KT-29': ['Ulugbek Umarov', 'Dilmurod Axmadov', 'Ismoil Gayratov'],
  'KT-30': [],
  'KT-34': [],
  'MW-3':  ['Шерзод Ахмадов', 'Jaloliddin Xabibjonov'],
  'SL-100':['Ulugbek Rasulov', 'Mohirjon', 'Baxtiyor Valixonov', 'Sarvar Tohirov', 'Jahongir Inatullaev', 'Abdulaziz'],
  'SL-103':['Mohirjon', 'Mukhammadrasul', 'Baxtiyor Valixonov', 'Ulugbek Rasulov', 'Sarvar Tohirov', 'Ulugbek Umarov', 'Damir Mirzabaev'],
  'SL-104':['Damir Mirzabaev'],
  'SL-107':['Sarvar Tohirov', 'Ulugbek Rasulov', 'Самадбек'],
  'SL-119':['Mukhammadrasul', 'Baxtiyor Valixonov', 'Ulugbek Rasulov'],
  'SL-128':['Baxtiyor Valixonov'],
  'SL-134':['Самадбек', 'Mohirjon', 'Farrux Xolikulov'],
  'SL-144':['Pulatov Nozim', 'Ulugbek Rasulov', 'Doniyorbek Komilov', 'aziztrastpay', 'Damir Mirzabaev', 'Mukhammadrasul'],
  'SL-15': ['Sarvar Tohirov', 'Mohirjon', 'Damir Mirzabaev'],
  'SL-151':['Ravshan Sattarov', 'Baxtiyor Valixonov', 'Pulatov Nozim', 'Ulugbek Rasulov', 'Yaxyo Sunnatov', 'Mukhammadrasul'],
  'SL-16': ['Ulugbek Rasulov', 'Farrux Xolikulov'],
  'SL-194':['Abdulaziz', 'Farrux Xolikulov'],
  'SL-222':['Самадбек'],
  'SL-5':  [],
  'SL-6':  ['Mukhammadrasul', 'Ulugbek Rasulov'],
  'SL-7':  ['Mukhammadrasul'],
  'SL-71': ['Sarvar Tohirov'],
  'SL-9':  ['Farrux Xolikulov', 'Ulugbek Umarov', 'Mukhammadrasul'],
};

// Load jira_issues.js assignees if available
let JIRA_ISSUES = {};
try {
  const jiSrc = fs.readFileSync('prototypes/trastbank-pmo/jira_issues.js', 'utf8');
  eval(jiSrc.replace('window.TB_JIRA_ISSUES', 'JIRA_ISSUES'));
} catch(e) {}

function buildTeam(epicKey) {
  const team = new Set();
  const ea = EPIC_ASSIGNEE[epicKey];
  if (ea) team.add(ea);
  // Manual children assignees
  const children = (CHILDREN_RAW[epicKey] || []);
  children.forEach(jiraName => {
    const empName = JIRA_TO_EMP[jiraName];
    if (empName) team.add(empName);
  });
  // Auto-add assignees from jira_issues.js tickets
  const tickets = JIRA_ISSUES[epicKey] || [];
  tickets.forEach(tk => {
    if (!tk.assignee) return;
    const empName = JIRA_TO_EMP[tk.assignee] || tk.assignee;
    team.add(empName);
  });
  return [...team].sort();
}

const content = fs.readFileSync('prototypes/trastbank-pmo/data.js', 'utf8');
const dataStr = content.replace(/^window\.TB_DATA\s*=\s*/, '').replace(/;\s*$/, '');
const data = JSON.parse(dataStr);

let updatedCount = 0;

// Update project teams
data.projects.forEach(proj => {
  if (!proj.jiraEpicKey) return;
  const newTeam = buildTeam(proj.jiraEpicKey);
  const oldStr = (proj.team || []).join(',');
  const newStr = newTeam.join(',');
  if (oldStr !== newStr) {
    console.log(proj.id + ' (' + proj.jiraEpicKey + '): ' + (proj.team||[]).length + ' -> ' + newTeam.length + ' members');
    proj.team = newTeam;
    updatedCount++;
  }
});
console.log('\nProjects updated: ' + updatedCount);

// Rebuild ALL employee projectIds from scratch
data.employees.forEach(e => {
  e.projectIds = [];
  e.statusCounts = { completed: 0, progress: 0, planned: 0, paused: 0 };
});

data.projects.forEach(proj => {
  (proj.team || []).forEach(memberName => {
    const emp = data.employees.find(e => e.shortName === memberName);
    if (emp && !emp.projectIds.includes(proj.id)) {
      emp.projectIds.push(proj.id);
      if (emp.statusCounts[proj.norm] !== undefined) emp.statusCounts[proj.norm]++;
    }
  });
});

data.employees.forEach(e => {
  e.totalMatched = e.projectIds.length;
  const t = e.totalMatched;
  e.loadLevel = t >= 20 ? 'critical' : t >= 12 ? 'high' : t >= 6 ? 'normal' : 'low';
});

console.log('\n=== Top 15 by workload ===');
[...data.employees].sort((a,b) => b.totalMatched - a.totalMatched).slice(0,15).forEach(e => {
  console.log(e.id + ' ' + e.shortName + ': ' + e.totalMatched + ' (' + e.loadLevel + ')');
});

fs.writeFileSync('prototypes/trastbank-pmo/data.js', 'window.TB_DATA = ' + JSON.stringify(data, null, 6) + ';\n', 'utf8');
console.log('\nDone! data.js saved.');
