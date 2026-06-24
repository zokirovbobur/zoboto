import json, os

SL_FILES = [
    r'C:\Users\user\.claude\projects\C--Users-user-Projects-zoboto\4c52e615-37fd-4da9-bc68-4ca771d79fb5\tool-results\mcp-69e712ba-fbcb-4dff-a9f3-129666c2ce4e-searchJiraIssuesUsingJql-1781686783090.txt',
    r'C:\Users\user\.claude\projects\C--Users-user-Projects-zoboto\4c52e615-37fd-4da9-bc68-4ca771d79fb5\tool-results\mcp-69e712ba-fbcb-4dff-a9f3-129666c2ce4e-searchJiraIssuesUsingJql-1781686829226.txt',
]

INLINE = [
  {"key":"KT-11","parent":"KT-27","summary":"Back: Push уведомления для платежных операции","type":"История","status":"in dev","done":False},
  {"key":"KT-35","parent":"KT-29","summary":"Mobile: Android da User ID yuborilmayapti","type":"Баг","status":"Blocked","done":False},
  {"key":"KT-36","parent":"KT-29","summary":"Back: API реализация для 2 метода malware","type":"История","status":"qa","done":False},
  {"key":"KT-37","parent":"KT-29","summary":"Mobile: Malware API Integration","type":"История","status":"Documentation","done":False},
  {"key":"KT-135","parent":"KT-29","summary":"Front: Session_Id не отправляется","type":"Баг","status":"Blocked","done":False},
  {"key":"KT-136","parent":"KT-29","summary":"Mobile: Добавить тестовое приложение для проверки blacklist API","type":"История","status":"Готово","done":True},
  {"key":"KT-6","parent":"KT-30","summary":"FACEID ЦБ-ГЦИ","type":"История","status":"Blocked","done":False},
  {"key":"KT-10","parent":"KT-34","summary":"Back: В случае если проводка удалена нужно синхронизировать статус","type":"История","status":"Backlog","done":False},
  {"key":"FC-1","parent":"FC-29","summary":"Соликга хисобод кетиши хар бир толов бойича","type":"Задание","status":"Готово","done":True},
  {"key":"FC-2","parent":"FC-30","summary":"Add Категория (арава, хожат хона...)","type":"История","status":"in dev","done":False},
  {"key":"FC-6","parent":"FC-30","summary":"Auto Fill - толов вактида","type":"История","status":"in dev","done":False},
  {"key":"FC-17","parent":"FC-30","summary":"Company кушиш (динамик килиш бошка бозорла кошиш учун)","type":"Задание","status":"in dev","done":False},
  {"key":"FC-18","parent":"FC-30","summary":"Tax-settings table кошилди","type":"Задание","status":"in dev","done":False},
  {"key":"FC-19","parent":"FC-30","summary":"Role Base (permissions)","type":"Задание","status":"Ready for dev","done":False},
  {"key":"FC-24","parent":"FC-31","summary":"Анализ DSQ учун","type":"История","status":"Готово","done":True},
  {"key":"MW-4","parent":"MW-3","summary":"Разработка API для перевода со счета на карту в рамках флоу X-GO (BM)","type":"Задание","status":"Тестирование","done":False},
  {"key":"MW-6","parent":"MW-3","summary":"X-GO: Интеграция с Uzcard/Humo для добавления карт (OTP/Verify)","type":"Задание","status":"В работе","done":False},
]

by_epic = {}

for filepath in SL_FILES:
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.loads(f.read())
    for n in data['issues']['nodes']:
        pk = n['fields']['parent']['key']
        if pk not in by_epic:
            by_epic[pk] = []
        done = n['fields']['status']['statusCategory']['key'] == 'done'
        s = n['fields']['summary']
        if len(s) > 90: s = s[:89] + '…'
        by_epic[pk].append({"key": n['key'], "summary": s, "type": n['fields']['issuetype']['name'], "status": n['fields']['status']['name'], "done": done})

for node in INLINE:
    p = node['parent']
    if p not in by_epic:
        by_epic[p] = []
    by_epic[p].append({"key": node['key'], "summary": node['summary'], "type": node['type'], "status": node['status'], "done": node['done']})

# Build JS
out = ['// Jira issues pre-fetched per epic — generated 2026-06-17', 'window.TB_JIRA_ISSUES = {']
for epic in sorted(by_epic.keys()):
    issues = by_epic[epic]
    out.append('  "' + epic + '": [')
    for iss in issues:
        out.append('    ' + json.dumps(iss, ensure_ascii=False) + ',')
    out.append('  ],')
out.append('};')

content = '\n'.join(out)
out_path = r'C:\Users\user\Projects\zoboto\prototypes\trastbank-pmo\jira_issues.js'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Written {len(by_epic)} epics, {sum(len(v) for v in by_epic.values())} issues to jira_issues.js")
