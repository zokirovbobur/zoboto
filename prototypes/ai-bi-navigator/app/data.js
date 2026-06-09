/* ============================================================
   AI BI Navigator — Mock data + i18n
   Attached to window.DATA / window.I18N
   ============================================================ */
(function () {
  const REGIONS = [
    { id: 'tashkent',  name: 'Tashkent',  rev: 184.2, plan: 178.0, growth: 8.4,  share: 31 },
    { id: 'samarkand', name: 'Samarkand', rev: 92.6,  plan: 95.0,  growth: 3.1,  share: 16 },
    { id: 'fergana',   name: 'Fergana',   rev: 61.3,  plan: 74.8,  growth: -18.0, share: 10 },
    { id: 'andijan',   name: 'Andijan',   rev: 70.1,  plan: 68.0,  growth: 5.7,  share: 12 },
    { id: 'bukhara',   name: 'Bukhara',   rev: 54.8,  plan: 52.0,  growth: 6.2,  share: 9 },
    { id: 'namangan',  name: 'Namangan',  rev: 63.9,  plan: 60.5,  growth: 4.4,  share: 11 },
    { id: 'khorezm',   name: 'Khorezm',   rev: 41.2,  plan: 43.0,  growth: -2.1, share: 7 },
  ];

  // 12 months revenue (UZS bn) actual + plan
  const MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'];
  const REV_TREND  = [402, 418, 435, 441, 466, 522, 470, 458, 489, 512, 548, 568];
  const PLAN_TREND = [410, 420, 430, 445, 460, 500, 480, 470, 485, 505, 530, 560];

  const KPIS = [
    { id:'revenue', label:'Revenue',         value:'568.1', unit:'bn UZS', delta:+6.8, spark:[440,458,489,512,548,568], icon:'cash', trend:'up', target:560 },
    { id:'profit',  label:'Net profit',      value:'132.4', unit:'bn UZS', delta:+4.2, spark:[112,118,121,126,129,132], icon:'trending', trend:'up', target:128 },
    { id:'volume',  label:'Sales volume',    value:'1.84',  unit:'M units',delta:+2.1, spark:[1.71,1.74,1.77,1.79,1.82,1.84], icon:'box', trend:'up', target:1.9 },
    { id:'plan',    label:'Plan vs Fact',    value:'101.4', unit:'%',      delta:+1.4, spark:[97,98,99,100,101,101.4], icon:'target', trend:'up', target:100 },
    { id:'conv',    label:'Conversion',      value:'4.62',  unit:'%',      delta:-0.5, spark:[5.1,5.0,4.9,4.8,4.7,4.62], icon:'funnel', trend:'down', target:5.0 },
    { id:'growth',  label:'Customer growth', value:'+18.2', unit:'K',      delta:+12.0,spark:[9,11,12,14,16,18.2], icon:'users', trend:'up', target:16 },
    { id:'risk',    label:'Risk alerts',     value:'7',     unit:'active', delta:+3,   spark:[2,3,3,4,5,7], icon:'alert', trend:'down', target:3, danger:true },
    { id:'eff',     label:'Op. efficiency',  value:'87.5',  unit:'%',      delta:+0.9, spark:[84,85,85,86,87,87.5], icon:'gauge', trend:'up', target:90 },
  ];

  const PRODUCTS = [
    { name:'Consumer loans',     rev:148, plan:140, growth:9.1 },
    { name:'POS terminals',      rev:96,  plan:102, growth:-4.2 },
    { name:'Card issuance',      rev:124, plan:118, growth:7.4 },
    { name:'Merchant acquiring', rev:88,  plan:84,  growth:5.3 },
    { name:'Mobile transfers',   rev:112, plan:96,  growth:14.6 },
  ];

  const INSIGHTS = [
    { tone:'neg', text:'Fergana revenue is 18% below plan, driven mainly by a 22% traffic decline and stock-outs in 3 flagship branches.', action:'Run factor analysis' },
    { tone:'pos', text:'Mobile transfers grew 14.6% MoM — the fastest of any product line and 17% ahead of plan.', action:'View product report' },
    { tone:'warn',text:'Conversion slipped to 4.62% (−0.5pp). 12 branches show abnormal drops concentrated in the Fergana valley.', action:'Open alert' },
  ];

  const METRICS = [
    { id:1, name:'Net Revenue', def:'Total recognized revenue net of returns and discounts.', formula:'Σ(gross_sales) − returns − discounts', owner:'Finance', source:'Banking core', freq:'Hourly', trust:98, industry:'Banking', dept:'Finance', fav:true },
    { id:2, name:'Net Promoter Score', def:'Likelihood of customers to recommend, surveyed monthly.', formula:'%promoters − %detractors', owner:'CX', source:'CRM', freq:'Monthly', trust:84, industry:'Retail', dept:'Marketing' },
    { id:3, name:'Conversion Rate', def:'Share of visits resulting in a completed transaction.', formula:'transactions / unique_visits × 100', owner:'Analytics', source:'Retail POS', freq:'Hourly', trust:91, industry:'Retail', dept:'Sales' },
    { id:4, name:'Cost of Risk', def:'Provisions for credit losses as a share of the loan book.', formula:'provisions / avg_loan_portfolio', owner:'Risk', source:'Banking core', freq:'Daily', trust:95, industry:'Banking', dept:'Risk' },
    { id:5, name:'Average Ticket', def:'Mean transaction value per completed sale.', formula:'revenue / transaction_count', owner:'Analytics', source:'Retail POS', freq:'Hourly', trust:93, industry:'Retail', dept:'Sales' },
    { id:6, name:'Active Merchants', def:'Merchants with ≥1 transaction in trailing 30 days.', formula:'distinct(merchant_id) where txn_30d ≥ 1', owner:'Product', source:'Payment processing', freq:'Daily', trust:89, industry:'Fintech', dept:'Product' },
    { id:7, name:'Loan Approval Time', def:'Median hours from application to credit decision.', formula:'median(decision_ts − apply_ts)', owner:'Operations', source:'Banking core', freq:'Daily', trust:90, industry:'Banking', dept:'Operations' },
    { id:8, name:'Plan Fulfillment', def:'Actual revenue vs the approved monthly plan.', formula:'actual / plan × 100', owner:'Finance', source:'1C', freq:'Daily', trust:96, industry:'All', dept:'Finance', fav:true },
    { id:9, name:'Cash Conversion Cycle', def:'Days to convert inventory and receivables into cash.', formula:'DIO + DSO − DPO', owner:'Finance', source:'1C', freq:'Weekly', trust:88, industry:'Construction', dept:'Finance' },
    { id:10, name:'Table Turnover', def:'Average number of guest seatings per table per day.', formula:'covers / (tables × open_days)', owner:'Operations', source:'POS', freq:'Daily', trust:82, industry:'HoReCa', dept:'Operations' },
    { id:11, name:'Churn Rate', def:'Share of customers lost over the period.', formula:'lost_customers / start_customers', owner:'CX', source:'CRM', freq:'Weekly', trust:86, industry:'Fintech', dept:'Marketing' },
    { id:12, name:'Gross Margin', def:'Gross profit as a percentage of net revenue.', formula:'(revenue − COGS) / revenue', owner:'Finance', source:'1C', freq:'Daily', trust:94, industry:'Retail', dept:'Finance' },
  ];

  const DASHBOARDS = [
    { id:'ceo', name:'CEO Cockpit', owner:'Aziz Karimov', updated:'12 min ago', widgets:14, access:'Executive', accent:'#3b82f6', tag:'Executive' },
    { id:'retail', name:'Retail Sales Dashboard', owner:'Nodira Yusupova', updated:'1 hour ago', widgets:18, access:'Department', accent:'#22d3ee', tag:'Retail' },
    { id:'bank', name:'Bank Portfolio Dashboard', owner:'Risk Office', updated:'34 min ago', widgets:22, access:'Restricted', accent:'#a78bfa', tag:'Banking' },
    { id:'fintech', name:'Fintech Transactions', owner:'Sardor Aliyev', updated:'4 min ago', widgets:16, access:'Department', accent:'#34d399', tag:'Fintech' },
    { id:'region', name:'Regional Performance', owner:'Aziz Karimov', updated:'22 min ago', widgets:11, access:'Company', accent:'#f59e0b', tag:'Regional' },
    { id:'construction', name:'Construction Projects', owner:'Jasur Toshev', updated:'2 hours ago', widgets:9, access:'Department', accent:'#fb7185', tag:'Construction' },
    { id:'horeca', name:'HoReCa Operations', owner:'Kamola Rashidova', updated:'48 min ago', widgets:13, access:'Department', accent:'#60a5fa', tag:'HoReCa' },
  ];

  const ALERTS = [
    { id:1, title:'Fergana sales dropped by 18%', sev:'High', impact:'−13.5 bn UZS', cause:'Traffic decline + stock-outs in 3 branches', owner:'Nodira Yusupova', status:'New', when:'2h ago', metric:'Net Revenue', region:'Fergana' },
    { id:2, title:'Conversion decreased in 12 branches', sev:'High', impact:'−2.1 bn UZS', cause:'Checkout abandonment spike on mobile', owner:'Analytics', status:'In progress', when:'5h ago', metric:'Conversion Rate', region:'Multiple' },
    { id:3, title:'Cash flow plan is below target', sev:'Medium', impact:'−8.0 bn UZS', cause:'Delayed receivables from 2 large merchants', owner:'Finance', status:'In progress', when:'1d ago', metric:'Plan Fulfillment', region:'Tashkent' },
    { id:4, title:'Loan approval time increased', sev:'Medium', impact:'+9 hrs median', cause:'Manual review queue backlog', owner:'Operations', status:'New', when:'1d ago', metric:'Loan Approval Time', region:'All' },
    { id:5, title:'POS terminal revenue 4% under plan', sev:'Low', impact:'−6.0 bn UZS', cause:'Slower merchant onboarding', owner:'Sardor Aliyev', status:'Resolved', when:'3d ago', metric:'Active Merchants', region:'Samarkand' },
    { id:6, title:'Cost of risk above threshold', sev:'High', impact:'+0.6pp', cause:'Rising delinquency in consumer loans', owner:'Risk Office', status:'New', when:'6h ago', metric:'Cost of Risk', region:'Andijan' },
  ];

  const FACTORS = [
    { id:'traffic', name:'Lower foot traffic', contrib:38, delta:-22, trend:'down', note:'Visits fell 22% YoY across valley branches.' },
    { id:'stock',   name:'Product stock-outs', contrib:27, delta:-31, trend:'down', note:'3 flagship branches out of top-5 SKUs for 9 days.' },
    { id:'conv',    name:'Lower conversion',   contrib:18, delta:-0.7, trend:'down', note:'Checkout completion dropped 0.7pp on mobile.' },
    { id:'comp',    name:'Competitor campaign',contrib:11, delta:-9,  trend:'down', note:'New rival promo launched in Fergana on Apr 14.' },
    { id:'staff',   name:'Staff performance',  contrib:6,  delta:-4,  trend:'down', note:'Two senior reps on leave; ramp gap on floor.' },
  ];

  const DOCS = [
    { id:1, name:'Q2 Board Report 2026', type:'pdf', size:'4.2 MB', folder:'Board', date:'Jun 5', pages:38 },
    { id:2, name:'Retail Strategy Deck', type:'ppt', size:'12.8 MB', folder:'Strategy', date:'Jun 2', pages:42 },
    { id:3, name:'Fergana Branch Audit', type:'pdf', size:'1.9 MB', folder:'Audit', date:'May 28', pages:16 },
    { id:4, name:'Loan Portfolio Model', type:'xls', size:'8.1 MB', folder:'Finance', date:'May 26', pages:null },
    { id:5, name:'Merchant Onboarding SLA', type:'pdf', size:'820 KB', folder:'Operations', date:'May 22', pages:9 },
    { id:6, name:'2026 Annual Plan', type:'xls', size:'5.4 MB', folder:'Finance', date:'May 19', pages:null },
    { id:7, name:'Risk Committee Minutes', type:'pdf', size:'640 KB', folder:'Board', date:'May 15', pages:6 },
    { id:8, name:'POS Network Map', type:'ppt', size:'9.3 MB', folder:'Operations', date:'May 12', pages:24 },
  ];

  const CONNECTORS = [
    { id:'postgres', name:'PostgreSQL', cat:'Database', status:'connected', sync:'2 min ago', vol:'1.4 TB', owner:'Data Eng', sec:'High' },
    { id:'clickhouse', name:'ClickHouse', cat:'Database', status:'connected', sync:'1 min ago', vol:'6.2 TB', owner:'Data Eng', sec:'High' },
    { id:'mssql', name:'MS SQL Server', cat:'Database', status:'connected', sync:'8 min ago', vol:'920 GB', owner:'IT Admin', sec:'High' },
    { id:'mysql', name:'MySQL', cat:'Database', status:'syncing', sync:'now', vol:'340 GB', owner:'Data Eng', sec:'Medium' },
    { id:'oracle', name:'Oracle', cat:'Database', status:'connected', sync:'15 min ago', vol:'2.1 TB', owner:'IT Admin', sec:'High' },
    { id:'excel', name:'Excel', cat:'File', status:'connected', sync:'1 day ago', vol:'48 MB', owner:'Finance', sec:'Low' },
    { id:'csv', name:'CSV', cat:'File', status:'connected', sync:'3 hrs ago', vol:'120 MB', owner:'Analytics', sec:'Low' },
    { id:'json', name:'JSON', cat:'File', status:'idle', sync:'2 days ago', vol:'8 MB', owner:'Data Eng', sec:'Low' },
    { id:'xml', name:'XML', cat:'File', status:'idle', sync:'5 days ago', vol:'14 MB', owner:'IT Admin', sec:'Low' },
    { id:'gsheets', name:'Google Sheets', cat:'Cloud', status:'connected', sync:'20 min ago', vol:'22 MB', owner:'Marketing', sec:'Medium' },
    { id:'1c', name:'1C:Enterprise', cat:'ERP', status:'connected', sync:'12 min ago', vol:'410 GB', owner:'Finance', sec:'High' },
    { id:'bitrix', name:'Bitrix24', cat:'CRM', status:'connected', sync:'30 min ago', vol:'180 GB', owner:'Sales', sec:'Medium' },
    { id:'crm', name:'CRM System', cat:'CRM', status:'error', sync:'failed', vol:'260 GB', owner:'Sales', sec:'Medium' },
    { id:'core', name:'Banking Core', cat:'Core', status:'connected', sync:'1 min ago', vol:'9.8 TB', owner:'IT Admin', sec:'Critical' },
    { id:'payments', name:'Payment Processing', cat:'Core', status:'connected', sync:'1 min ago', vol:'3.3 TB', owner:'IT Admin', sec:'Critical' },
    { id:'pos', name:'Retail POS', cat:'Core', status:'connected', sync:'4 min ago', vol:'1.1 TB', owner:'Retail', sec:'High' },
  ];

  const TEMPLATES = [
    { id:'bank', name:'Bank', accent:'#3b82f6', kpis:['Cost of Risk','Net Interest Margin','Loan Approval Time','Capital Adequacy'], dashboards:['Portfolio','Risk Cockpit','Branch Network'], sources:['Banking Core','1C','CRM'], alerts:['Delinquency spike','NIM compression'] },
    { id:'fintech', name:'Payment / Fintech', accent:'#34d399', kpis:['Active Merchants','TPV','Auth Rate','Churn Rate'], dashboards:['Transactions','Merchant Health','Fraud Monitor'], sources:['Payment Processing','PostgreSQL','ClickHouse'], alerts:['Auth-rate drop','Fraud anomaly'] },
    { id:'retail', name:'Retail Electronics', accent:'#22d3ee', kpis:['Conversion Rate','Average Ticket','Gross Margin','Stock Cover'], dashboards:['Sales','Inventory','Store Performance'], sources:['Retail POS','1C','Google Sheets'], alerts:['Stock-out risk','Conversion drop'] },
    { id:'construction', name:'Construction', accent:'#f59e0b', kpis:['Cash Conversion Cycle','Project Margin','Schedule Variance','Cost Variance'], dashboards:['Project Control','Cash Flow','Procurement'], sources:['1C','Excel','MS SQL'], alerts:['Budget overrun','Schedule slip'] },
    { id:'gov', name:'Government Org', accent:'#a78bfa', kpis:['Service SLA','Budget Execution','Citizen Requests','Resolution Time'], dashboards:['Service Delivery','Budget','Regional KPIs'], sources:['PostgreSQL','Oracle','XML'], alerts:['SLA breach','Budget underuse'] },
    { id:'horeca', name:'HoReCa', accent:'#60a5fa', kpis:['Table Turnover','Average Check','Food Cost %','Labor Cost %'], dashboards:['Operations','Menu Performance','Staffing'], sources:['POS','Excel','Google Sheets'], alerts:['Food cost spike','Low turnover'] },
    { id:'edu', name:'Education', accent:'#f472b6', kpis:['Enrollment','Retention','Completion Rate','Revenue per Student'], dashboards:['Admissions','Academic','Finance'], sources:['MySQL','CSV','Google Sheets'], alerts:['Dropout risk','Enrollment dip'] },
    { id:'logistics', name:'Logistics', accent:'#2dd4bf', kpis:['On-time Delivery','Cost per KM','Fleet Utilization','Order Cycle Time'], dashboards:['Fleet','Delivery','Warehouse'], sources:['PostgreSQL','1C','Bitrix24'], alerts:['Delivery delay','Idle fleet'] },
  ];

  const USERS = [
    { id:1, name:'Aziz Karimov', email:'a.karimov@navigator.uz', role:'CEO', dept:'Executive', status:'Active', color:'#3b82f6', mfa:true },
    { id:2, name:'Nodira Yusupova', email:'n.yusupova@navigator.uz', role:'Department Head', dept:'Retail', status:'Active', color:'#22d3ee', mfa:true },
    { id:3, name:'Sardor Aliyev', email:'s.aliyev@navigator.uz', role:'Business Analyst', dept:'Fintech', status:'Active', color:'#34d399', mfa:false },
    { id:4, name:'Kamola Rashidova', email:'k.rashidova@navigator.uz', role:'Data Analyst', dept:'Analytics', status:'Active', color:'#a78bfa', mfa:true },
    { id:5, name:'Jasur Toshev', email:'j.toshev@navigator.uz', role:'Regional Manager', dept:'Construction', status:'Active', color:'#f59e0b', mfa:true },
    { id:6, name:'Dilshod Umarov', email:'d.umarov@navigator.uz', role:'Data Admin', dept:'IT', status:'Active', color:'#fb7185', mfa:true },
    { id:7, name:'Malika Tursunova', email:'m.tursunova@navigator.uz', role:'Finance Manager', dept:'Finance', status:'Invited', color:'#60a5fa', mfa:false },
  ];

  const PERMISSIONS = ['View dashboards','Build widgets','Manage connectors','Export reports','Admin access','Row-level data'];
  const ROLE_MATRIX = {
    'CEO':            [true,true,false,true,false,true],
    'Department Head':[true,true,false,true,false,true],
    'Business Analyst':[true,true,false,true,false,false],
    'Data Analyst':   [true,true,true,true,false,false],
    'Data Admin':     [true,true,true,true,true,true],
    'Regional Manager':[true,false,false,true,false,true],
    'Finance Manager':[true,true,false,true,false,true],
  };

  const AUDIT = [
    { id:1, user:'Dilshod Umarov', action:'Granted admin role', target:'Malika Tursunova', when:'Today 14:22', type:'security', ip:'10.4.2.18' },
    { id:2, user:'Aziz Karimov', action:'Exported report', target:'Q2 Board Report', when:'Today 11:08', type:'export', ip:'10.4.1.4' },
    { id:3, user:'Sardor Aliyev', action:'Connected source', target:'ClickHouse', when:'Today 09:41', type:'data', ip:'10.4.3.22' },
    { id:4, user:'System', action:'Sync completed', target:'Banking Core', when:'Today 09:40', type:'system', ip:'—' },
    { id:5, user:'Nodira Yusupova', action:'Shared dashboard', target:'Retail Sales', when:'Yesterday 17:55', type:'access', ip:'10.4.2.7' },
    { id:6, user:'Kamola Rashidova', action:'Edited metric', target:'Conversion Rate', when:'Yesterday 16:30', type:'data', ip:'10.4.3.19' },
    { id:7, user:'CRM System', action:'Sync failed', target:'CRM System', when:'Yesterday 15:12', type:'error', ip:'—' },
    { id:8, user:'Dilshod Umarov', action:'Updated RLS policy', target:'Regional data', when:'Yesterday 10:02', type:'security', ip:'10.4.2.18' },
  ];

  const REPORTS = [
    { id:'weekly', name:'Weekly CEO Summary', cadence:'Every Monday 08:00', recipients:6, format:'PDF', last:'Jun 3', icon:'crown' },
    { id:'board', name:'Monthly Board Report', cadence:'1st of month', recipients:12, format:'PDF', last:'Jun 1', icon:'building' },
    { id:'dept', name:'Department Report', cadence:'Weekly', recipients:18, format:'PDF + XLS', last:'Jun 5', icon:'layers' },
    { id:'risk', name:'Risk Report', cadence:'Daily', recipients:8, format:'PDF', last:'Today', icon:'alert' },
    { id:'sales', name:'Sales Report', cadence:'Daily', recipients:22, format:'XLS', last:'Today', icon:'cash' },
  ];

  const AI_PROMPTS = [
    'Show sales decline reasons in Fergana',
    'Compare revenue by region for the last 6 months',
    'Find products below plan',
    'Generate CEO summary for this week',
    'Which branches have abnormal conversion drop?',
  ];

  // role configs
  const ROLES = {
    CEO:           { title:'Chief Executive', greeting:'Executive overview', color:'#3b82f6', home:'dashboard' },
    Analyst:       { title:'Business Analyst', greeting:'Analytics workspace', color:'#22d3ee', home:'ai' },
    'Department Head': { title:'Department Head', greeting:'Department performance', color:'#34d399', home:'dashboard' },
    'Data Admin':  { title:'Data Administrator', greeting:'Platform administration', color:'#a78bfa', home:'connectors' },
  };

  window.DATA = { REGIONS, MONTHS, REV_TREND, PLAN_TREND, KPIS, PRODUCTS, INSIGHTS, METRICS,
    DASHBOARDS, ALERTS, FACTORS, DOCS, CONNECTORS, TEMPLATES, USERS, PERMISSIONS, ROLE_MATRIX,
    AUDIT, REPORTS, AI_PROMPTS, ROLES };

  /* ---------------- i18n ---------------- */
  const I18N = {
    en: {
      nav_dashboard:'Executive Dashboard', nav_ai:'AI Analyst', nav_metrics:'Metrics Catalog',
      nav_library:'Dashboard Library', nav_widget:'Widget Builder', nav_alerts:'Alerts & Deviations',
      nav_factor:'Factor Analysis', nav_docs:'Document Library', nav_connectors:'Data Sources',
      nav_templates:'Industry Templates', nav_reports:'Reports', nav_admin:'Admin & Access',
      nav_audit:'Audit Log', nav_settings:'Settings',
      search:'Search metrics, dashboards, documents…', ask_ai:'Ask AI', enter_demo:'Enter demo',
      grp_analyze:'Analyze', grp_build:'Build', grp_govern:'Govern',
    },
    ru: {
      nav_dashboard:'Дашборд руководителя', nav_ai:'AI-аналитик', nav_metrics:'Каталог метрик',
      nav_library:'Библиотека дашбордов', nav_widget:'Конструктор виджетов', nav_alerts:'Оповещения',
      nav_factor:'Факторный анализ', nav_docs:'Библиотека документов', nav_connectors:'Источники данных',
      nav_templates:'Отраслевые шаблоны', nav_reports:'Отчёты', nav_admin:'Администрирование',
      nav_audit:'Журнал аудита', nav_settings:'Настройки',
      search:'Поиск метрик, дашбордов, документов…', ask_ai:'Спросить ИИ', enter_demo:'Войти в демо',
      grp_analyze:'Анализ', grp_build:'Создание', grp_govern:'Управление',
    },
    uz: {
      nav_dashboard:'Rahbar paneli', nav_ai:'AI tahlilchi', nav_metrics:'Metrikalar katalogi',
      nav_library:'Dashboard kutubxonasi', nav_widget:'Vidjet konstruktori', nav_alerts:'Ogohlantirishlar',
      nav_factor:'Omil tahlili', nav_docs:'Hujjatlar kutubxonasi', nav_connectors:'Maʼlumot manbalari',
      nav_templates:'Soha shablonlari', nav_reports:'Hisobotlar', nav_admin:'Boshqaruv va kirish',
      nav_audit:'Audit jurnali', nav_settings:'Sozlamalar',
      search:'Metrikalar, dashboardlar, hujjatlarni qidirish…', ask_ai:'AI dan soʻrash', enter_demo:'Demoga kirish',
      grp_analyze:'Tahlil', grp_build:'Yaratish', grp_govern:'Boshqaruv',
    },
  };
  window.I18N = I18N;
})();
