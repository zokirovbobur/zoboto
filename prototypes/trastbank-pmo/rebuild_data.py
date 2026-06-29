import json, re

JIRA_TO_EMP = {
  'Damir Mirzabaev':           'Mirzabayev Damir',
  'Mukhammadrasul':            "Akramxo'jayev Muhammadrasul",
  'Farrux Xolikulov':          'Xolikulov Farrux',
  'Ulugbek Rasulov':           'Rasulov Ulugbek',
  'Sarvar Tohirov':            'Toxirov Sarvar',
  'Baxtiyor Valixonov':        'Valixonov Baxtiyor',
  'Mohirjon':                  'Alimov Mohirjon',
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
  'Abdulaziz':                 'Aliakbarov Abdulaziz',
  'aziztrastpay':              'Mirzaolimov Azizbek',
  'JAHONGIR SAIDIY':           'Saidiy Jahongir',
  'Акрамхужаев Мухаммадрасул': "Akramxo'jayev Muhammadrasul",
  'Akramhujaev Muhammadrasul': "Akramxo'jayev Muhammadrasul",
  'Mohirjon Alimov':           'Alimov Mohirjon',
  'Самадбек  Юлдашев':         'Yuldashev Samatbek',
  'Abdulaziz Babajanov':       'Babajanov Abdulaziz',
  'Abdulazim muhammadrafiqov': 'Mirzaolimov Azizbek',
  'jamshid.trastpay':          'Saidov Jamshid',
  'Diyorbek':                  'Jabbarov Diyorbek',
  'Ali Yadgarov':              'Yodgorov Alibek',
  "Ahmadillo Jo'raboyev":      "Jo'raboyev Axmadillo",
  'Yakubjonov Azizjon':        'Yokubjonov Azizjon',
  'Pavel Pankin':              'Pankin Pavel',
}

# Load jira_issues.js using Node-style trailing comma fix
ji_src = open('jira_issues.js', encoding='utf-8-sig').read()
ji_src = re.sub(r',(\s*\])', lambda m: m.group(1), ji_src)
ji_src = re.sub(r',(\s*\})', lambda m: m.group(1), ji_src)
# Extract the JS object literal
m = re.search(r'window\.TB_JIRA_ISSUES\s*=\s*(\{[\s\S]+\});?\s*$', ji_src)
ji_src = m.group(1) if m else ji_src.replace('window.TB_JIRA_ISSUES = ', '').rstrip().rstrip(';')
jira_issues = json.loads(ji_src)
print(f"Loaded {len(jira_issues)} epics from jira_issues.js")

# Load data.js
raw = open('data.js', encoding='utf-8-sig').read()
raw = re.sub(r',(\s*\])', lambda m: m.group(1), raw)
raw = re.sub(r',(\s*\})', lambda m: m.group(1), raw)
m2 = re.search(r'window\.TB_DATA\s*=\s*(\{[\s\S]+\});?\s*$', raw)
raw = m2.group(1) if m2 else raw.replace('window.TB_DATA = ', '').rstrip().rstrip(';')
data = json.loads(raw)
print(f"Loaded {len(data['projects'])} projects, {len(data['employees'])} employees")

def build_team(epic_key, existing_team):
    team = set()
    # Normalize existing team members through JIRA_TO_EMP to avoid duplicates
    for name in (existing_team or []):
        canonical = JIRA_TO_EMP.get(name, name)
        known = any(e['shortName'] == canonical for e in data['employees'])
        if known:
            team.add(canonical)
    tickets = jira_issues.get(epic_key, [])
    for tk in tickets:
        assignee = tk.get('assignee')
        if not assignee: continue
        emp_name = JIRA_TO_EMP.get(assignee, assignee)
        known = any(e['shortName'] == emp_name for e in data['employees'])
        if known:
            team.add(emp_name)
    return sorted(team)

# Update project teams
updated = 0
for proj in data['projects']:
    ek = proj.get('jiraEpicKey')
    if not ek:
        continue
    new_team = build_team(ek, proj.get('team', []))
    if new_team != sorted(proj.get('team', [])):
        print(f"  {proj['id']} ({ek}): {len(proj.get('team',[]))} -> {len(new_team)} members")
        proj['team'] = new_team
        updated += 1

print(f'\nProjects updated: {updated}')

# Rebuild employee projectIds from scratch
for e in data['employees']:
    e['projectIds'] = []
    e['statusCounts'] = {'completed': 0, 'progress': 0, 'planned': 0, 'paused': 0}

for proj in data['projects']:
    for member in (proj.get('team') or []):
        emp = next((e for e in data['employees'] if e['shortName'] == member), None)
        if emp and proj['id'] not in emp['projectIds']:
            emp['projectIds'].append(proj['id'])
            norm = proj.get('norm', '')
            if norm in emp['statusCounts']:
                emp['statusCounts'][norm] += 1

for e in data['employees']:
    e['totalMatched'] = len(e['projectIds'])
    t = e['totalMatched']
    e['loadLevel'] = 'critical' if t >= 20 else 'high' if t >= 12 else 'normal' if t >= 6 else 'low'

print('\nTop 15 by workload:')
for e in sorted(data['employees'], key=lambda x: -x['totalMatched'])[:15]:
    print(f"  {e['shortName']}: {e['totalMatched']} ({e['loadLevel']})")

open('data.js', 'w', encoding='utf-8').write('window.TB_DATA = ' + json.dumps(data, ensure_ascii=False, indent=6) + ';\n')
print('\ndata.js saved.')
