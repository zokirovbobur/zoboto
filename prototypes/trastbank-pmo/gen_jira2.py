import json

TOOL_FILES = [
    # SL page 1
    r'C:\Users\user\.claude\projects\C--Users-user-Projects-pmo-board\5f42c0de-0972-4240-b711-202ecf818c2b\tool-results\mcp-69e712ba-fbcb-4dff-a9f3-129666c2ce4e-searchJiraIssuesUsingJql-1782731008616.txt',
    # SL page 2
    r'C:\Users\user\.claude\projects\C--Users-user-Projects-pmo-board\5f42c0de-0972-4240-b711-202ecf818c2b\tool-results\mcp-69e712ba-fbcb-4dff-a9f3-129666c2ce4e-searchJiraIssuesUsingJql-1782731102588.txt',
    # KT
    r'C:\Users\user\.claude\projects\C--Users-user-Projects-pmo-board\5f42c0de-0972-4240-b711-202ecf818c2b\tool-results\mcp-69e712ba-fbcb-4dff-a9f3-129666c2ce4e-searchJiraIssuesUsingJql-1782731010390.txt',
    # FC
    r'C:\Users\user\.claude\projects\C--Users-user-Projects-pmo-board\5f42c0de-0972-4240-b711-202ecf818c2b\tool-results\mcp-69e712ba-fbcb-4dff-a9f3-129666c2ce4e-searchJiraIssuesUsingJql-1782731012584.txt',
    # MDI page 1
    r'C:\Users\user\.claude\projects\C--Users-user-Projects-pmo-board\5f42c0de-0972-4240-b711-202ecf818c2b\tool-results\mcp-69e712ba-fbcb-4dff-a9f3-129666c2ce4e-searchJiraIssuesUsingJql-1782731016253.txt',
    # TB
    r'C:\Users\user\.claude\projects\C--Users-user-Projects-pmo-board\5f42c0de-0972-4240-b711-202ecf818c2b\tool-results\mcp-69e712ba-fbcb-4dff-a9f3-129666c2ce4e-searchJiraIssuesUsingJql-1782731019233.txt',
]

# Direct results from MW and PH queries (inline)
INLINE_NODES = [
    # MW
    {"key":"MW-6","parent":"MW-3","summary":"X-GO: Интеграция с Uzcard/Humo для добавления карт (OTP/Verify)","type":"История","status":"В работе","done":False,"assignee":"Jaloliddin Xabibjonov"},
    {"key":"MW-4","parent":"MW-3","summary":"Разработка API для перевода со счета на карту в рамках флоу разделения платежей / X-GO (BM)","type":"История","status":"Готово","done":True,"assignee":"Шерзод Ахмадов"},
    # MDI page 2 (inline)
    {"key":"MDI-108","parent":"MDI-9","summary":"P8-INT-2 — Data-plane to control-plane reconcile wiring","type":"История","status":"В работе","done":False,"assignee":None},
    {"key":"MDI-107","parent":"MDI-9","summary":"P8-INT-1 — Live UI to control-plane integratsiya","type":"История","status":"В работе","done":False,"assignee":None},
    {"key":"MDI-106","parent":"MDI-9","summary":"P8-UI-1 — UI hardening/cleanup","type":"История","status":"Готово","done":True,"assignee":None},
    {"key":"MDI-105","parent":"MDI-9","summary":"CLI-1 — CLI buyruq sirti (Port gap)","type":"История","status":"В работе","done":False,"assignee":None},
    {"key":"MDI-117","parent":"MDI-10","summary":"B7 — Flow Tap uchma-uch","type":"История","status":"Backlog","done":False,"assignee":None},
    {"key":"MDI-116","parent":"MDI-10","summary":"B6 — Kafka/Rabbit haqiqiy adapterlar","type":"История","status":"Backlog","done":False,"assignee":None},
    {"key":"MDI-115","parent":"MDI-10","summary":"B5 — GitOps live","type":"История","status":"В работе","done":False,"assignee":None},
    {"key":"MDI-114","parent":"MDI-10","summary":"B4 — Live build/runner drayverlar","type":"История","status":"Backlog","done":False,"assignee":None},
    {"key":"MDI-113","parent":"MDI-10","summary":"B3 — NestJS build mijoz","type":"История","status":"Готово","done":True,"assignee":None},
    {"key":"MDI-112","parent":"MDI-10","summary":"A2 — Stage-5 review qoldighi","type":"История","status":"Готово","done":True,"assignee":None},
    {"key":"MDI-111","parent":"MDI-10","summary":"A1 — Stage-6 QA Linuxda","type":"История","status":"Готово","done":True,"assignee":None},
    # PH
    {"key":"PH-2","parent":"PH-1","summary":"HUMO P2P интеграцияси","type":"История","status":"Ready for Test","done":False,"assignee":"Jaloliddin Xabibjonov"},
    {"key":"PH-3","parent":"PH-1","summary":"OFD (Солиқ) тизими билан интеграция","type":"История","status":"Ready for Test","done":False,"assignee":"Jaloliddin Xabibjonov"},
    {"key":"PH-4","parent":"PH-1","summary":"HUMO терминаллари бўйича Reconciliation интеграцияси","type":"История","status":"В работе","done":False,"assignee":"Diyorbek"},
    {"key":"PH-5","parent":"PH-1","summary":"Uzcard Terminal API (Check/Add/Remove) интеграциясини ишлаб чиқиш","type":"История","status":"Ready for Test","done":False,"assignee":"Jaloliddin Xabibjonov"},
    {"key":"PH-6","parent":"PH-1","summary":"UZCARD P2P интеграцияси","type":"История","status":"В работе","done":False,"assignee":"Diyorbek"},
]

by_epic = {}

def add_issue(key, parent_key, summary, itype, status, done, assignee):
    if parent_key not in by_epic:
        by_epic[parent_key] = {}
    s = summary if len(summary) <= 90 else summary[:89] + '…'
    by_epic[parent_key][key] = {"key": key, "summary": s, "type": itype, "status": status, "done": done, "assignee": assignee}

# Parse tool result files
for filepath in TOOL_FILES:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.loads(f.read())
        nodes = data['issues']['nodes']
        print(f"  {filepath.split(chr(92))[-1]}: {len(nodes)} issues")
        for n in nodes:
            f = n['fields']
            parent_key = f['parent']['key']
            done = f['status']['statusCategory']['key'] == 'done'
            assignee = None
            if f.get('assignee'):
                assignee = f['assignee'].get('displayName') or f['assignee'].get('name')
            add_issue(n['key'], parent_key, f['summary'], f['issuetype']['name'], f['status']['name'], done, assignee)
    except Exception as e:
        print(f"  ERROR reading {filepath}: {e}")

# Add inline nodes
for node in INLINE_NODES:
    # Don't overwrite if already fetched from file
    if node['parent'] not in by_epic or node['key'] not in by_epic[node['parent']]:
        add_issue(node['key'], node['parent'], node['summary'], node['type'], node['status'], node['done'], node.get('assignee'))

# Build JS output
out = [f'// Jira issues pre-fetched per epic — generated 2026-06-29 (sync updated 2026-06-29)', 'window.TB_JIRA_ISSUES = {']
total_issues = 0
for epic in sorted(by_epic.keys()):
    issues = list(by_epic[epic].values())
    total_issues += len(issues)
    out.append(f'  "{epic}": [')
    for iss in issues:
        out.append('    ' + json.dumps(iss, ensure_ascii=False) + ',')
    out.append('  ],')
out.append('};')

content = '\n'.join(out)
out_path = r'C:\Users\user\Projects\pmo_board\jira_issues.js'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nWritten {len(by_epic)} epics, {total_issues} issues to jira_issues.js")
print("\nEpics by project:")
from collections import Counter
proj_counts = Counter(k.split('-')[0] for k in by_epic.keys())
for proj, cnt in sorted(proj_counts.items()):
    print(f"  {proj}: {cnt} epics")
