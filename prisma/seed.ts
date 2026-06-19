import { PrismaClient, ProjectStatus, Role, Priority, RiskLevel, TaskStatus } from '@prisma/client'

const db = new PrismaClient()

const DEPT_COLOR: Record<string, string> = {
  DCTI:  '#2563EB',
  DBO:   '#138A5E',
  RISK:  '#C2410C',
  IT:    '#6D5CD6',
  PROD:  '#0E7490',
  CORP:  '#D97706',
}

async function main() {
  console.log('🌱  Seeding Trastbank PMO database…')

  // ── Departments ──────────────────────────────────────────────────────────────
  const depts = await Promise.all([
    db.department.upsert({ where: { code: 'DCTI' }, update: {}, create: { name: 'Digital Transformation & Innovation', code: 'DCTI', color: DEPT_COLOR.DCTI } }),
    db.department.upsert({ where: { code: 'DBO' },  update: {}, create: { name: 'Digital Banking Operations',           code: 'DBO',  color: DEPT_COLOR.DBO  } }),
    db.department.upsert({ where: { code: 'RISK' }, update: {}, create: { name: 'Risk & Compliance',                    code: 'RISK', color: DEPT_COLOR.RISK  } }),
    db.department.upsert({ where: { code: 'IT' },   update: {}, create: { name: 'IT Infrastructure',                    code: 'IT',   color: DEPT_COLOR.IT   } }),
    db.department.upsert({ where: { code: 'PROD' }, update: {}, create: { name: 'Product Management',                   code: 'PROD', color: DEPT_COLOR.PROD  } }),
    db.department.upsert({ where: { code: 'CORP' }, update: {}, create: { name: 'Corporate Banking',                    code: 'CORP', color: DEPT_COLOR.CORP  } }),
  ])
  const [dcti, dbo, risk, it, prod, corp] = depts
  console.log(`  ✓  ${depts.length} departments`)

  // ── Users ─────────────────────────────────────────────────────────────────────
  const AV = ['#0E2A52','#2563EB','#138A5E','#6D5CD6','#C2410C','#0E7490','#9333EA','#B45309']
  const av = (i: number) => AV[i % AV.length]

  const usersData = [
    { shortName: 'Mirzabayev D.', name: 'Mirzabayev Damir',          email: 'damir@trastbank.uz',     role: Role.PROJECT_MANAGER, departmentId: dcti.id, stack: 'Product',   grade: 'Senior', avatarColor: av(0) },
    { shortName: 'Toxirov S.',     name: 'Toxirov Sarvar',             email: 'sarvar@trastbank.uz',    role: Role.TEAM_MEMBER,     departmentId: dcti.id, stack: 'Back-End',  grade: 'Mid',    avatarColor: av(1) },
    { shortName: 'Rasulov U.',     name: 'Rasulov Ulugbek',            email: 'ulugbek@trastbank.uz',   role: Role.TEAM_MEMBER,     departmentId: dcti.id, stack: 'Back-End',  grade: 'Senior', avatarColor: av(2) },
    { shortName: 'Karimov J.',     name: 'Karimov Jahongir',           email: 'jahongir@trastbank.uz',  role: Role.PROJECT_MANAGER, departmentId: dbo.id,  stack: 'Product',   grade: 'Lead',   avatarColor: av(3) },
    { shortName: 'Yusupova M.',    name: 'Yusupova Malika',            email: 'malika@trastbank.uz',    role: Role.PMO,             departmentId: prod.id, stack: 'PMO',       grade: 'Senior', avatarColor: av(4) },
    { shortName: 'Akbarov T.',     name: 'Akbarov Timur',              email: 'timur@trastbank.uz',     role: Role.TEAM_MEMBER,     departmentId: it.id,   stack: 'DevOps',    grade: 'Senior', avatarColor: av(5) },
    { shortName: 'Nazarov B.',     name: 'Nazarov Behzod',             email: 'behzod@trastbank.uz',    role: Role.TEAM_MEMBER,     departmentId: dcti.id, stack: 'Front-End', grade: 'Mid',    avatarColor: av(6) },
    { shortName: 'Umarov U.',      name: 'Umarov Ulugbek',             email: 'umarov@trastbank.uz',    role: Role.TEAM_MEMBER,     departmentId: dcti.id, stack: 'Mobile',    grade: 'Senior', avatarColor: av(7) },
    { shortName: 'Xoliqov F.',     name: 'Xoliqov Farrux',             email: 'farrux@trastbank.uz',    role: Role.TEAM_MEMBER,     departmentId: dbo.id,  stack: 'QA',        grade: 'Mid',    avatarColor: av(0) },
    { shortName: 'Ismoilov A.',    name: 'Ismoilov Alisher',           email: 'alisher@trastbank.uz',   role: Role.TEAM_MEMBER,     departmentId: it.id,   stack: 'Back-End',  grade: 'Junior', avatarColor: av(1) },
    { shortName: 'Sobirov S.',     name: 'Sobirov Sherzod',            email: 'sherzod@trastbank.uz',   role: Role.PROJECT_MANAGER, departmentId: risk.id, stack: 'Product',   grade: 'Lead',   avatarColor: av(2) },
    { shortName: 'Tursunov N.',    name: 'Tursunov Nodir',             email: 'nodir@trastbank.uz',     role: Role.TEAM_MEMBER,     departmentId: corp.id, stack: 'Analytics', grade: 'Mid',    avatarColor: av(3) },
    { shortName: 'Mahmudov K.',    name: 'Mahmudov Kamol',             email: 'kamol@trastbank.uz',     role: Role.TOP_MANAGER,     departmentId: prod.id, stack: null,        grade: null,     avatarColor: av(4) },
    { shortName: 'Admin',          name: 'PMO Admin',                  email: 'admin@trastbank.uz',     role: Role.ADMIN,           departmentId: prod.id, stack: null,        grade: null,     avatarColor: av(5) },
    { shortName: 'Rakhimov A.',    name: 'Rakhimov Anvar',             email: 'anvar@trastbank.uz',     role: Role.TEAM_MEMBER,     departmentId: dcti.id, stack: 'Front-End', grade: 'Senior', avatarColor: av(6) },
    { shortName: 'Toshmatov D.',   name: 'Toshmatov Dilshod',          email: 'dilshod@trastbank.uz',   role: Role.TEAM_MEMBER,     departmentId: dbo.id,  stack: 'Back-End',  grade: 'Mid',    avatarColor: av(7) },
    { shortName: 'Yuldashev S.',   name: 'Yuldashev Samatbek',         email: 'samatbek@trastbank.uz',  role: Role.TEAM_MEMBER,     departmentId: dcti.id, stack: 'Mobile',    grade: 'Mid',    avatarColor: av(0) },
    { shortName: 'Ortiqov B.',     name: 'Ortiqov Baxtiyor',           email: 'baxtiyor@trastbank.uz',  role: Role.TEAM_MEMBER,     departmentId: it.id,   stack: 'DevOps',    grade: 'Mid',    avatarColor: av(1) },
  ]

  const users = await Promise.all(
    usersData.map(u =>
      db.user.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      }),
    ),
  )

  const [damir, sarvar, ulugbek, jahongir, malika, timur, behzod, umarov, farrux, alisher, sherzod, nodir, kamol, admin, anvar, dilshod, samatbek, ortiqov] = users
  console.log(`  ✓  ${users.length} users`)

  // ── Projects ──────────────────────────────────────────────────────────────────
  type ProjectSeed = {
    externalId: string; name: string; product: string; goal?: string; basis?: string
    status: ProjectStatus; priority: Priority; riskLevel: RiskLevel; progress: number
    startDate: Date; endDate?: Date; customer?: string; supplier?: string; budget?: string
    departmentId: string; managerId: string; demoReady: boolean; jiraEpicKey?: string
    origin?: string; info?: string
  }

  const projectsData: ProjectSeed[] = [
    {
      externalId: 'P001', name: 'Moneysend Transfers Integration', product: 'Trastpay',
      goal: 'Implement incoming and outgoing transfers via Moneysend technology',
      basis: 'Expanding international transfer capabilities and card top-up for clients',
      status: 'COMPLETED', priority: 'HIGH', riskLevel: 'LOW', progress: 100,
      startDate: new Date('2026-02-25'), endDate: new Date('2026-05-22'),
      customer: 'Trastbank', supplier: 'OFB',
      departmentId: dcti.id, managerId: damir.id, demoReady: true,
      jiraEpicKey: 'SL-9', origin: 'Jira Epic',
    },
    {
      externalId: 'P002', name: 'Unified QR Code Online Payment', product: 'Trastpay',
      goal: 'Enable QR code payments online via mobile application',
      basis: 'Developing cashless infrastructure and payment convenience for customers',
      status: 'COMPLETED', priority: 'HIGH', riskLevel: 'LOW', progress: 100,
      startDate: new Date('2026-05-08'), endDate: new Date('2026-05-10'),
      customer: 'Trastbank',
      departmentId: dcti.id, managerId: jahongir.id, demoReady: true,
      jiraEpicKey: 'SL-71', origin: 'Jira Epic',
    },
    {
      externalId: 'P003', name: 'MyID Digital Identity Integration', product: 'Trastpay',
      goal: 'Integration with national digital identification system MyID',
      basis: 'Regulator requirements for customer identity verification in digital channels',
      status: 'COMPLETED', priority: 'CRITICAL', riskLevel: 'MEDIUM', progress: 100,
      startDate: new Date('2026-02-17'), endDate: new Date('2026-03-27'),
      customer: 'Trastbank IB', supplier: 'Uzinfocom',
      departmentId: dcti.id, managerId: damir.id, demoReady: true,
      jiraEpicKey: 'SL-107', origin: 'Jira Epic',
    },
    {
      externalId: 'P004', name: 'P2P Transfers Enhancement', product: 'Trastpay',
      goal: 'Enhance P2P transfer flow with new validation and limits',
      basis: 'CBU requirements and customer demand for faster transfers',
      status: 'IN_PROGRESS', priority: 'HIGH', riskLevel: 'LOW', progress: 55,
      startDate: new Date('2026-04-01'), endDate: new Date('2026-07-15'),
      customer: 'Trastbank',
      departmentId: dcti.id, managerId: damir.id, demoReady: false,
      jiraEpicKey: 'SL-120', origin: 'Jira Epic',
    },
    {
      externalId: 'P005', name: 'DBO Mobile App v3.0', product: 'DBO',
      goal: 'Release major version 3.0 of the Digital Banking App with redesigned UI and new features',
      basis: 'Strategic digital banking transformation initiative',
      status: 'IN_PROGRESS', priority: 'CRITICAL', riskLevel: 'HIGH', progress: 45,
      startDate: new Date('2026-01-15'), endDate: new Date('2026-08-30'),
      customer: 'Trastbank Retail', supplier: 'Internal',
      departmentId: dbo.id, managerId: jahongir.id, demoReady: false,
      jiraEpicKey: 'KT-45', origin: 'Jira Epic',
    },
    {
      externalId: 'P006', name: 'Food City Loyalty Program', product: 'Food City',
      goal: 'Implement loyalty points program for Food City marketplace',
      basis: 'Increase customer retention and repeat purchases',
      status: 'IN_PROGRESS', priority: 'MEDIUM', riskLevel: 'LOW', progress: 60,
      startDate: new Date('2026-03-01'), endDate: new Date('2026-06-30'),
      customer: 'Food City LLC',
      departmentId: prod.id, managerId: malika.id, demoReady: false,
      jiraEpicKey: 'FC-12', origin: 'Jira Epic',
    },
    {
      externalId: 'P007', name: 'AI Credit Scoring Module', product: 'AI products',
      goal: 'Develop ML-based credit scoring to replace legacy rule-based system',
      basis: 'Reduce NPL ratio and speed up loan decisions',
      status: 'PLANNED', priority: 'HIGH', riskLevel: 'HIGH', progress: 8,
      startDate: new Date('2026-07-01'), endDate: new Date('2026-12-31'),
      customer: 'Risk Dept',
      departmentId: risk.id, managerId: sherzod.id, demoReady: false,
      origin: 'Manual',
    },
    {
      externalId: 'P008', name: 'Core Banking ABS Upgrade', product: 'ABS',
      goal: 'Upgrade AutoBank System to latest version with improved performance',
      basis: 'End-of-life for current ABS version; vendor support ending',
      status: 'PLANNED', priority: 'CRITICAL', riskLevel: 'CRITICAL', progress: 5,
      startDate: new Date('2026-09-01'), endDate: new Date('2027-03-31'),
      customer: 'IT Dept', supplier: 'AutoBank',
      departmentId: it.id, managerId: sherzod.id, demoReady: false,
      budget: '2500000000',
      origin: 'Manual',
    },
    {
      externalId: 'P009', name: 'Islamic Banking Module', product: 'Исламский банкинг',
      goal: 'Launch Sharia-compliant banking products: Murabaha, Ijara, Musharaka',
      basis: 'New business line targeting Islamic finance segment',
      status: 'IN_PROGRESS', priority: 'HIGH', riskLevel: 'MEDIUM', progress: 35,
      startDate: new Date('2026-02-01'), endDate: new Date('2026-09-30'),
      customer: 'CBU', supplier: 'Consulting firm',
      departmentId: corp.id, managerId: damir.id, demoReady: false,
      origin: 'Manual',
    },
    {
      externalId: 'P010', name: 'Payment Gateway API v2', product: 'Middleware',
      goal: 'Redesign payment gateway API for PCI-DSS compliance and higher throughput',
      basis: 'Current gateway reaching capacity limits; PCI-DSS audit requirements',
      status: 'IN_PROGRESS', priority: 'HIGH', riskLevel: 'MEDIUM', progress: 50,
      startDate: new Date('2026-03-15'), endDate: new Date('2026-07-31'),
      customer: 'IT Dept',
      departmentId: it.id, managerId: sherzod.id, demoReady: false,
      jiraEpicKey: 'MW-8', origin: 'Jira Epic',
    },
    {
      externalId: 'P011', name: 'Biometric Authentication', product: 'DBO',
      goal: 'Add face ID and fingerprint authentication to mobile banking',
      basis: 'Customer demand for passwordless login; security improvement',
      status: 'COMPLETED', priority: 'MEDIUM', riskLevel: 'LOW', progress: 100,
      startDate: new Date('2026-01-10'), endDate: new Date('2026-04-15'),
      customer: 'Trastbank Retail',
      departmentId: dbo.id, managerId: jahongir.id, demoReady: true,
      jiraEpicKey: 'KT-29', origin: 'Jira Epic',
    },
    {
      externalId: 'P012', name: 'Push Notification Service', product: 'Trastpay',
      goal: 'Unified push notification service for all Trastbank apps',
      basis: 'Current fragmented approach causing missed notifications',
      status: 'COMPLETED', priority: 'MEDIUM', riskLevel: 'LOW', progress: 100,
      startDate: new Date('2025-11-01'), endDate: new Date('2026-02-28'),
      customer: 'Trastbank',
      departmentId: dcti.id, managerId: damir.id, demoReady: true,
      origin: 'Manual',
    },
    {
      externalId: 'P013', name: 'Anti-Fraud ML System', product: 'AI products',
      goal: 'Real-time fraud detection using machine learning',
      basis: 'Increase in fraudulent transactions in Q1 2026',
      status: 'IN_PROGRESS', priority: 'CRITICAL', riskLevel: 'HIGH', progress: 30,
      startDate: new Date('2026-04-01'), endDate: new Date('2026-10-31'),
      customer: 'Risk Dept',
      departmentId: risk.id, managerId: sherzod.id, demoReady: false,
      origin: 'Manual',
    },
    {
      externalId: 'P014', name: 'Currency Exchange Rates Widget', product: 'DBO',
      goal: 'Add live currency rates widget to mobile and web banking',
      basis: 'Customer request; competitive feature parity',
      status: 'COMPLETED', priority: 'LOW', riskLevel: 'LOW', progress: 100,
      startDate: new Date('2026-04-01'), endDate: new Date('2026-05-31'),
      customer: 'Trastbank Retail',
      departmentId: dbo.id, managerId: jahongir.id, demoReady: true,
      origin: 'Jira Story',
    },
    {
      externalId: 'P015', name: 'SME Loan Origination System', product: 'ABS',
      goal: 'Digital loan origination for SME clients, end-to-end digital journey',
      basis: 'Strategic SME lending growth initiative',
      status: 'PLANNED', priority: 'HIGH', riskLevel: 'MEDIUM', progress: 5,
      startDate: new Date('2026-08-01'), endDate: new Date('2026-12-15'),
      customer: 'Corporate Banking',
      departmentId: corp.id, managerId: sherzod.id, demoReady: false,
      budget: '800000000',
      origin: 'Manual',
    },
    {
      externalId: 'P016', name: 'Data Warehouse Migration', product: 'Прочее',
      goal: 'Migrate on-premise data warehouse to cloud infrastructure',
      basis: 'Cost reduction and scalability requirements',
      status: 'PAUSED', priority: 'MEDIUM', riskLevel: 'HIGH', progress: 20,
      startDate: new Date('2026-01-01'), endDate: new Date('2026-06-30'),
      customer: 'IT Dept',
      departmentId: it.id, managerId: sherzod.id, demoReady: false,
      origin: 'Manual',
    },
    {
      externalId: 'P017', name: 'Regulatory Reporting Automation', product: 'Прочее',
      goal: 'Automate CBU regulatory reports (forms 1-20)',
      basis: 'Reduce manual effort and reporting errors',
      status: 'IN_PROGRESS', priority: 'HIGH', riskLevel: 'MEDIUM', progress: 65,
      startDate: new Date('2026-02-15'), endDate: new Date('2026-07-31'),
      customer: 'Risk & Compliance',
      departmentId: risk.id, managerId: malika.id, demoReady: false,
      origin: 'Manual',
    },
    {
      externalId: 'P018', name: 'Mobile Deposit (Cheque Scan)', product: 'DBO',
      goal: 'Enable cheque deposit via smartphone camera in mobile app',
      basis: 'Reduce branch traffic; customer convenience',
      status: 'PLANNED', priority: 'LOW', riskLevel: 'LOW', progress: 0,
      startDate: new Date('2026-10-01'), endDate: new Date('2026-12-31'),
      customer: 'Trastbank Retail',
      departmentId: dbo.id, managerId: jahongir.id, demoReady: false,
      origin: 'Manual',
    },
    {
      externalId: 'P019', name: 'BNPL Installment Feature', product: 'Trastpay',
      goal: 'Buy-Now-Pay-Later installment payment option in Trastpay app',
      basis: 'Growing BNPL market; partnership with retailers',
      status: 'IN_PROGRESS', priority: 'HIGH', riskLevel: 'MEDIUM', progress: 40,
      startDate: new Date('2026-04-15'), endDate: new Date('2026-09-30'),
      customer: 'Trastbank Retail', supplier: 'FinTech Partner',
      departmentId: dcti.id, managerId: damir.id, demoReady: false,
      origin: 'Manual',
    },
    {
      externalId: 'P020', name: 'Staff Mobile App (HR)', product: 'Прочее',
      goal: 'Internal HR mobile app for leave requests, payslips, and announcements',
      basis: 'Employee experience improvement initiative',
      status: 'PLANNED', priority: 'LOW', riskLevel: 'LOW', progress: 0,
      startDate: new Date('2026-09-01'), endDate: new Date('2026-11-30'),
      customer: 'HR Dept',
      departmentId: prod.id, managerId: malika.id, demoReady: false,
      origin: 'Manual',
    },
  ]

  const projects: Record<string, { id: string }> = {}
  for (const p of projectsData) {
    const created = await db.project.upsert({
      where: { externalId: p.externalId },
      update: {},
      create: p,
    })
    projects[p.externalId] = created
  }
  console.log(`  ✓  ${projectsData.length} projects`)

  // ── Tasks ─────────────────────────────────────────────────────────────────────
  type TaskSeed = { title: string; description?: string; status: TaskStatus; priority: Priority; projectId: string; assigneeIds: string[] }
  const tasksData: TaskSeed[] = [
    { title: 'API integration with Moneysend sandbox', status: 'DONE', priority: 'HIGH', projectId: projects['P001'].id, assigneeIds: [sarvar.id, ulugbek.id] },
    { title: 'CBU approval documentation', status: 'DONE', priority: 'CRITICAL', projectId: projects['P001'].id, assigneeIds: [damir.id] },
    { title: 'End-to-end testing (outgoing)', status: 'DONE', priority: 'HIGH', projectId: projects['P001'].id, assigneeIds: [farrux.id] },
    { title: 'Production deployment', status: 'DONE', priority: 'CRITICAL', projectId: projects['P001'].id, assigneeIds: [timur.id] },

    { title: 'QR code scanner SDK integration', status: 'DONE', priority: 'HIGH', projectId: projects['P002'].id, assigneeIds: [sarvar.id] },
    { title: 'UX design for QR payment flow', status: 'DONE', priority: 'MEDIUM', projectId: projects['P002'].id, assigneeIds: [behzod.id] },

    { title: 'MyID SDK integration', status: 'DONE', priority: 'CRITICAL', projectId: projects['P003'].id, assigneeIds: [sarvar.id, ulugbek.id] },
    { title: 'Biometric data handling compliance', status: 'DONE', priority: 'CRITICAL', projectId: projects['P003'].id, assigneeIds: [sherzod.id] },

    { title: 'P2P transfer limits configuration', status: 'IN_PROGRESS', priority: 'HIGH', projectId: projects['P004'].id, assigneeIds: [sarvar.id] },
    { title: 'New validation rules implementation', status: 'IN_PROGRESS', priority: 'HIGH', projectId: projects['P004'].id, assigneeIds: [ulugbek.id] },
    { title: 'Performance load testing', status: 'BACKLOG', priority: 'MEDIUM', projectId: projects['P004'].id, assigneeIds: [farrux.id] },
    { title: 'CBU reporting for new P2P flows', status: 'BACKLOG', priority: 'HIGH', projectId: projects['P004'].id, assigneeIds: [sherzod.id] },

    { title: 'UI redesign — home screen', status: 'IN_PROGRESS', priority: 'HIGH', projectId: projects['P005'].id, assigneeIds: [behzod.id, anvar.id] },
    { title: 'Push notification rework', status: 'REVIEW', priority: 'MEDIUM', projectId: projects['P005'].id, assigneeIds: [sarvar.id] },
    { title: 'Accounts overview widget', status: 'IN_PROGRESS', priority: 'HIGH', projectId: projects['P005'].id, assigneeIds: [anvar.id] },
    { title: 'iOS performance optimization', status: 'BLOCKED', priority: 'CRITICAL', projectId: projects['P005'].id, assigneeIds: [umarov.id] },
    { title: 'Android deep-linking setup', status: 'BACKLOG', priority: 'MEDIUM', projectId: projects['P005'].id, assigneeIds: [umarov.id] },
    { title: 'QA smoke tests suite', status: 'BACKLOG', priority: 'MEDIUM', projectId: projects['P005'].id, assigneeIds: [farrux.id] },

    { title: 'Loyalty points accrual engine', status: 'IN_PROGRESS', priority: 'HIGH', projectId: projects['P006'].id, assigneeIds: [dilshod.id] },
    { title: 'Partner merchant API integration', status: 'REVIEW', priority: 'MEDIUM', projectId: projects['P006'].id, assigneeIds: [sarvar.id] },
    { title: 'Admin panel for points management', status: 'BACKLOG', priority: 'LOW', projectId: projects['P006'].id, assigneeIds: [behzod.id] },

    { title: 'Data pipeline for training dataset', status: 'IN_PROGRESS', priority: 'HIGH', projectId: projects['P013'].id, assigneeIds: [nodir.id] },
    { title: 'Model training — XGBoost baseline', status: 'BACKLOG', priority: 'HIGH', projectId: projects['P013'].id, assigneeIds: [nodir.id] },
    { title: 'Real-time scoring API endpoint', status: 'BACKLOG', priority: 'CRITICAL', projectId: projects['P013'].id, assigneeIds: [ulugbek.id] },
    { title: 'Rule-engine decommission plan', status: 'BACKLOG', priority: 'MEDIUM', projectId: projects['P013'].id, assigneeIds: [sherzod.id] },

    { title: 'CBU report forms analysis', status: 'DONE', priority: 'HIGH', projectId: projects['P017'].id, assigneeIds: [malika.id] },
    { title: 'Automation scripts for forms 1–5', status: 'DONE', priority: 'HIGH', projectId: projects['P017'].id, assigneeIds: [nodir.id] },
    { title: 'Automation scripts for forms 6–12', status: 'IN_PROGRESS', priority: 'HIGH', projectId: projects['P017'].id, assigneeIds: [nodir.id] },
    { title: 'Validation layer for report data', status: 'REVIEW', priority: 'MEDIUM', projectId: projects['P017'].id, assigneeIds: [alisher.id] },
    { title: 'Scheduler setup for nightly runs', status: 'BACKLOG', priority: 'MEDIUM', projectId: projects['P017'].id, assigneeIds: [timur.id] },
  ]

  for (const { assigneeIds, ...t } of tasksData) {
    await db.task.create({
      data: {
        ...t,
        assignees: { create: assigneeIds.map(userId => ({ userId })) },
      },
    })
  }
  console.log(`  ✓  ${tasksData.length} tasks`)

  // ── Team memberships ──────────────────────────────────────────────────────────
  const memberships: Array<{ projectId: string; userId: string }> = [
    // P001
    { projectId: projects['P001'].id, userId: sarvar.id },
    { projectId: projects['P001'].id, userId: ulugbek.id },
    { projectId: projects['P001'].id, userId: umarov.id },
    { projectId: projects['P001'].id, userId: farrux.id },
    // P002
    { projectId: projects['P002'].id, userId: sarvar.id },
    // P003
    { projectId: projects['P003'].id, userId: sarvar.id },
    { projectId: projects['P003'].id, userId: ulugbek.id },
    { projectId: projects['P003'].id, userId: samatbek.id },
    // P004
    { projectId: projects['P004'].id, userId: sarvar.id },
    { projectId: projects['P004'].id, userId: ulugbek.id },
    { projectId: projects['P004'].id, userId: farrux.id },
    // P005
    { projectId: projects['P005'].id, userId: behzod.id },
    { projectId: projects['P005'].id, userId: umarov.id },
    { projectId: projects['P005'].id, userId: anvar.id },
    { projectId: projects['P005'].id, userId: farrux.id },
    // P006
    { projectId: projects['P006'].id, userId: dilshod.id },
    // P009
    { projectId: projects['P009'].id, userId: ulugbek.id },
    { projectId: projects['P009'].id, userId: alisher.id },
    // P010
    { projectId: projects['P010'].id, userId: ulugbek.id },
    { projectId: projects['P010'].id, userId: ortiqov.id },
    // P013
    { projectId: projects['P013'].id, userId: nodir.id },
    { projectId: projects['P013'].id, userId: alisher.id },
    // P017
    { projectId: projects['P017'].id, userId: nodir.id },
    { projectId: projects['P017'].id, userId: alisher.id },
    { projectId: projects['P017'].id, userId: timur.id },
    // P019
    { projectId: projects['P019'].id, userId: sarvar.id },
    { projectId: projects['P019'].id, userId: samatbek.id },
  ]

  for (const m of memberships) {
    await db.teamMember.upsert({
      where: { projectId_userId: m },
      update: {},
      create: m,
    })
  }
  console.log(`  ✓  ${memberships.length} team memberships`)

  // ── Project Updates ────────────────────────────────────────────────────────────
  const updates = [
    { projectId: projects['P004'].id, content: 'P2P transfer limits configured in staging. QA in progress.', authorId: damir.id },
    { projectId: projects['P005'].id, content: 'iOS performance issue identified — memory leak in notification service. Assigned to Umarov.', authorId: jahongir.id },
    { projectId: projects['P005'].id, content: 'Home screen redesign approved by stakeholders. Moving to development.', authorId: jahongir.id },
    { projectId: projects['P005'].id, content: 'Sprint 4 completed: login flow, biometric auth, onboarding.', authorId: behzod.id },
    { projectId: projects['P013'].id, content: 'Initial dataset collected: 180K transactions from 2025-2026.', authorId: sherzod.id },
    { projectId: projects['P013'].id, content: 'Kick-off meeting held. Architecture decision: real-time scoring via Kafka stream.', authorId: malika.id },
    { projectId: projects['P017'].id, content: 'Forms 1–5 automation complete and tested. Moving to forms 6–12.', authorId: malika.id },
    { projectId: projects['P009'].id, content: 'Sharia board consultations completed. Product documentation approved.', authorId: damir.id },
    { projectId: projects['P006'].id, content: 'Partner API integrated with 3 merchants. Testing loyalty flow.', authorId: malika.id },
    { projectId: projects['P010'].id, content: 'PCI-DSS scoping document submitted to auditors.', authorId: sherzod.id },
  ]

  for (const u of updates) {
    await db.projectUpdate.create({ data: u })
  }
  console.log(`  ✓  ${updates.length} project updates`)

  // ── Workload records ──────────────────────────────────────────────────────────
  type WLSeed = { projectId: string; userId: string; allocation: number }
  const workloadData: WLSeed[] = [
    { projectId: projects['P004'].id, userId: damir.id,  allocation: 30 },
    { projectId: projects['P004'].id, userId: sarvar.id, allocation: 60 },
    { projectId: projects['P004'].id, userId: ulugbek.id, allocation: 50 },
    { projectId: projects['P005'].id, userId: jahongir.id, allocation: 60 },
    { projectId: projects['P005'].id, userId: behzod.id,  allocation: 80 },
    { projectId: projects['P005'].id, userId: umarov.id,  allocation: 90 },
    { projectId: projects['P005'].id, userId: anvar.id,   allocation: 70 },
    { projectId: projects['P005'].id, userId: farrux.id,  allocation: 40 },
    { projectId: projects['P006'].id, userId: malika.id,  allocation: 30 },
    { projectId: projects['P006'].id, userId: dilshod.id, allocation: 70 },
    { projectId: projects['P009'].id, userId: damir.id,   allocation: 20 },
    { projectId: projects['P009'].id, userId: ulugbek.id, allocation: 30 },
    { projectId: projects['P010'].id, userId: sherzod.id, allocation: 40 },
    { projectId: projects['P010'].id, userId: ulugbek.id, allocation: 30 },
    { projectId: projects['P013'].id, userId: sherzod.id, allocation: 30 },
    { projectId: projects['P013'].id, userId: nodir.id,   allocation: 80 },
    { projectId: projects['P017'].id, userId: malika.id,  allocation: 40 },
    { projectId: projects['P017'].id, userId: nodir.id,   allocation: 40 },
    { projectId: projects['P019'].id, userId: damir.id,   allocation: 25 },
    { projectId: projects['P019'].id, userId: sarvar.id,  allocation: 30 },
  ]

  for (const w of workloadData) {
    await db.workloadRecord.upsert({
      where: { projectId_userId: { projectId: w.projectId, userId: w.userId } },
      update: {},
      create: w,
    })
  }
  console.log(`  ✓  ${workloadData.length} workload records`)

  console.log('\n✅  Seed complete!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
