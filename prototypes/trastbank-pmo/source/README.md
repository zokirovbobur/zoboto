# Trastbank PMO source workbook

Canonical Excel source for the PMO board:

- `Stakeholder interests by products - Trastbank.xlsx`

Update workflow:

1. Replace this workbook with the newest version from the business source.
2. Compare it against the previous committed workbook.
3. Update `../data.js` so project names, statuses, dates, owners, teams, and workload counts match the latest workbook.
4. Commit both the workbook change and generated PMO data change together.

This keeps the Git workbook as the audit source for future AI-assisted PMO board updates.
