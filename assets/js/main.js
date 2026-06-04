/* =====================================================================
   Bobur Zokirov — Personal Portfolio · main.js
   ---------------------------------------------------------------------
   Everything you'll want to edit later lives in the DATA section below:
     • PORTFOLIO  — portfolio cards + their case-study content
     • PROTOTYPES — prototype library cards (internal & external links)
   Add or edit objects in those arrays; the page re-renders automatically.
   ===================================================================== */

/* =========================== DATA =================================== */

/* ---- Portfolio projects ----
   prototypeUrl : optional — set to a path/URL to show an "Open Prototype" button.
   caseStudy    : optional — set to show "View Case Study" (opens a modal).        */
const PORTFOLIO = [
  {
    title: "Trastpay",
    category: "Fintech / Digital Banking",
    role: "Chief Product Officer",
    description: "Online banking transformation focused on scalability, user growth, payment-flow optimization, deposits, P2P transactions, KPI monitoring, and product governance.",
    image: "assets/img/portfolio/trastpay.jpg",
    caseStudy: {
      overview: "End-to-end transformation of Trastbank's retail online-banking product (Trastpay) — moving from a feature-led backlog to a strategy-led roadmap with clear KPIs and governance.",
      problem: "Fragmented payment flows, slow growth, and no shared view of product performance across the bank. Acquisition costs were high and engagement plateaued.",
      users: "Retail banking customers across Uzbekistan — everyday payments, transfers, deposits, and savings.",
      features: ["Redesigned P2P & payment UX", "Deposits and savings products", "Executive KPI dashboard", "Product governance & PRD process", "Tribe-based delivery model"],
      process: "Established product strategy and roadmap, introduced PRDs and user stories, set up KPI monitoring and executive reporting, and restructured delivery around a tribe-based operating model.",
      metrics: [
        { v: "+36%", k: "Daily active users" },
        { v: "−51%", k: "Blended CAC" },
        { v: "2.0M→3.4M", k: "P2P transactions" },
        { v: "223B→721B", k: "UZS deposit portfolio" }
      ],
      lessons: "Aligning the org around a few shared KPIs unlocked faster decisions than any single feature. Governance is a growth lever, not overhead."
    }
  },
  {
    title: "Trast Business",
    category: "SME Banking",
    role: "Chief Product Officer",
    description: "Corporate & SME banking platform with onboarding, roles & permissions, maker-checker flows, payment UX, statements, exports, and reliability improvements.",
    image: "assets/img/portfolio/trast-business.jpg",
    caseStudy: {
      overview: "A corporate and SME online-banking platform built for reliability, multi-user control, and efficient day-to-day treasury operations.",
      problem: "SME clients needed multi-user access with proper controls, faster payments, and dependable statements/exports — without enterprise complexity.",
      users: "SME owners, accountants, and finance teams operating company accounts.",
      features: ["Company onboarding", "Roles & permissions", "Maker-checker approval flows", "Payment UX & batch payments", "Statements & exports", "Reliability hardening"],
      process: "Mapped SME treasury workflows, prioritized control + reliability, and shipped iteratively with close partner feedback.",
      metrics: [
        { v: "Maker-checker", k: "Approval controls" },
        { v: "Multi-role", k: "Access model" }
      ],
      lessons: "For SME banking, trust and control beat flashy features — reliability is the product."
    }
  },
  {
    title: "Islamic Banking Initiative",
    category: "Islamic Banking / Fintech",
    role: "Product & Strategy Lead",
    description: "Islamic Window concept: business case, P&L model, investor-ready pitch, organizational structure, technical infrastructure analysis, and product prototypes.",
    image: "assets/img/portfolio/islamic-banking.jpg",
    caseStudy: {
      overview: "Strategy and product foundation for a Shariah-compliant 'Islamic Window' — from business case to investor-ready pitch and early prototypes.",
      problem: "Significant unmet demand for Shariah-compliant products, but no validated business case, operating model, or technical path.",
      users: "Retail and SME customers seeking Shariah-compliant banking and financing.",
      features: ["Islamic Window concept", "P&L and unit-economics model", "Investor-ready pitch", "Org structure design", "Tech infrastructure analysis", "Product prototypes"],
      process: "Built the business case and P&L model, designed the operating/org structure, assessed core-banking integration paths, and prototyped key customer journeys.",
      metrics: [
        { v: "Investor-ready", k: "Pitch & P&L" },
        { v: "0→1", k: "Operating model" }
      ],
      lessons: "A credible P&L and operating model earn executive trust faster than UI — strategy first, screens second."
    }
  },
  {
    title: "BNPL Broker — Mediapark",
    category: "BNPL / Retail Fintech",
    role: "Senior Product Manager",
    description: "Unified BNPL processing platform for client onboarding, identification, credit-limit allocation, and installment-plan execution across financial partners.",
    image: "assets/img/portfolio/bnpl-broker.jpg",
    caseStudy: {
      overview: "A single BNPL 'broker' layer connecting retailers with multiple banks and microfinance organizations through one unified processing flow.",
      problem: "Each financial partner had different onboarding, scoring, and installment rules — creating friction for retailers and customers.",
      users: "Retail customers at point of sale, plus partner banks and MFOs.",
      features: ["Client onboarding & identification", "Credit-limit allocation", "Installment-plan execution", "Multi-partner routing", "Conversion & limit tracking"],
      process: "Defined the unified processing model, planned and launched the MVP, and collaborated with banks and MFOs on scoring and limits.",
      metrics: [
        { v: "Multi-partner", k: "Unified processing" },
        { v: "MVP", k: "Planned & launched" }
      ],
      lessons: "Abstracting partner differences into one flow was the whole value — complexity hidden from the customer."
    }
  },
  {
    title: "OneUP Pro",
    category: "Retail Tech / B2B Mobile",
    role: "Senior Product Manager",
    description: "Mobile CRM for retail employees covering client creation, lead conversion, training, promotions, KPI tracking, and planning.",
    image: "assets/img/portfolio/oneup.jpg",
    caseStudy: {
      overview: "A mobile-first CRM for field sales agents — turning daily retail activity into structured leads, conversions, and measurable KPIs.",
      problem: "Sales agents lacked tooling to capture clients, track conversion, and stay trained and aligned on promotions.",
      users: "Retail sales agents and their team leads.",
      features: ["Client creation", "Lead → conversion flow", "In-app training", "Promotions", "KPI tracking & planning"],
      process: "Defined agent workflows, planned and launched the MVP, and iterated on KPI tracking with field feedback.",
      metrics: [
        { v: "Mobile-first", k: "Field CRM" },
        { v: "KPI", k: "Agent tracking" }
      ],
      lessons: "Designing for one-handed field use changed every screen decision — context of use is everything."
    }
  },
  {
    title: "Geomotive DSP",
    category: "AdTech / DOOH",
    role: "Product Manager",
    description: "Programmatic advertising platform for digital out-of-home media buying with location, audience, inventory, and campaign-planning features.",
    image: "assets/img/portfolio/geomotive.jpg",
    caseStudy: {
      overview: "A demand-side platform for programmatic Digital-Out-Of-Home (DOOH) advertising — letting buyers plan campaigns by location, audience, and inventory.",
      problem: "DOOH buying was manual and opaque; advertisers needed programmatic targeting and transparent inventory.",
      users: "Media buyers, agencies, and DOOH inventory partners.",
      features: ["Location & audience targeting", "Inventory marketplace", "Campaign planning", "Budget management", "Reporting"],
      process: "Ran product strategy, research, and roadmap; delivered the MVP; managed budgets; and incorporated client/partner feedback.",
      metrics: [
        { v: "$300K", k: "Investment raised" },
        { v: "$3M", k: "Valuation" }
      ],
      lessons: "Investor conviction followed a sharp MVP + a clear market story — focus the demo on the wedge."
    }
  },
  {
    title: "Paynet BNPL",
    category: "BNPL / Fintech",
    role: "Product Manager",
    description: "Platform connecting retail networks and financial institutions to streamline installment processing, scoring, and agent operations.",
    image: "assets/img/portfolio/paynet.jpg",
    cjmUrl: "https://www.figma.com/board/gO7guh26s58CXbbOVuX2rX/Future-Sprint--Onboarding-process?node-id=0-1&t=8QYlBqoA1Z1HC1jx-1",
    caseStudy: {
      overview: "A BNPL platform linking retail networks with financial institutions — streamlining installment processing, scoring, and agent operations.",
      problem: "Installment processing was slow and inconsistent across retail networks, with weak incentives for agents.",
      users: "Retail customers, store agents, and partner financial institutions.",
      features: ["Customer Journey Map", "Installment processing", "Scoring integration", "Agent bonus system", "Product-market-fit validation"],
      process: "Led a team of 10 engineers, built the Customer Journey Map, validated product-market fit, launched the MVP, and shipped an agent bonus system.",
      metrics: [
        { v: "Team of 10", k: "Engineers led" },
        { v: "MVP", k: "Launched" }
      ],
      lessons: "Agent incentives moved the metric more than any feature — align the people closest to the customer."
    }
  }
];

/* ---- Prototype library ----
   type   : "Internal" (hosted on this domain) | "External" (Figma/Framer/etc.)
   status : "Demo" | "Public" | "Private"
   url    : internal path (e.g. "prototypes/x/index.html") or external https link  */
const PROTOTYPES = [
  {
    title: "Enterprise Banking IT Infrastructure",
    product: "Trastbank",
    type: "Internal",
    status: "Demo",
    url: "prototypes/banking-infra/index.html",
    description: "Interactive AS-IS / TO-BE architecture explorer: Core Banking ABS, Middleware layer, client channels, compliance modules and external integrations — with multilingual support (UZ/RU/EN)."
  },
  {
    title: "Islamic Banking Web App",
    product: "Trastbank",
    type: "Internal",
    status: "Demo",
    url: "prototypes/banking-infra/islamic-bank-dbo.html",
    description: "Corporate internet banking web application — accounts, payments, transfers and client management."
  },
  {
    title: "Banking Bonus Management",
    product: "Trastbank",
    type: "Internal",
    status: "Demo",
    url: "prototypes/banking-infra/bonus-proto.html",
    description: "Front office bonus calculation app — daily accruals, anti-bonus rules, formula breakdown per operation."
  },
  {
    title: "Banking Loan Management System",
    product: "Trastbank",
    type: "Internal",
    status: "Demo",
    url: "prototypes/banking-infra/kredit-konveyer.html",
    description: "End-to-end loan conveyor — application intake, scoring, approval workflow and disbursement tracking."
  },
  {
    title: "Islamic Banking Mobile Concept",
    product: "Islamic Banking",
    type: "Internal",
    status: "Coming Soon",
    url: "prototypes/islamic-banking/index.html",
    description: "Concept prototype for a Shariah-compliant digital-banking customer journey."
  },
  {
    title: "Finport — Investment Portfolio",
    product: "Finport",
    type: "External",
    status: "Demo",
    url: "https://finport.uz/",
    description: "Investment portfolio management platform — public demo prototype."
  },
];

/* =========================== I18N ================================== */
var LANG = localStorage.getItem("lang") || "en";

const I18N = {
  en: {
    nav_about:"About", nav_expertise:"Expertise", nav_experience:"Experience",
    nav_portfolio:"Portfolio", nav_prototypes:"Prototypes", nav_resume:"Résumé", nav_contact:"Contact",
    hero_eyebrow:"Chief Product Officer",
    hero_title:"Product Manager · Fintech & Digital Banking",
    hero_loc:"Tashkent, Uzbekistan",
    hero_lede:"I help fintech, banking, retail, and digital products move from idea to scalable execution — through product strategy, MVP delivery, cross-functional leadership, and data-driven growth.",
    hero_btn_resume:"Download Résumé", hero_btn_portfolio:"View Portfolio", hero_btn_contact:"Contact me →",
    about_eyebrow:"About",
    about_lead:"Product leadership built on an engineer's foundation — turning strategy into shipped products and measurable growth.",
    about_p1:"Bobur Zokirov is an experienced Product Manager and Chief Product Officer with a background in software engineering, fintech, digital banking, BNPL, retail technology, AdTech, and product transformation.",
    about_p2:"He has led MVP launches, product roadmaps, cross-functional teams, process transformation, and investor-ready initiatives — pairing executive clarity with hands-on delivery.",
    exp_eyebrow:"Key expertise", exp_h2:"Where I create leverage",
    tl_eyebrow:"Experience", tl_h2:"A decade across banking, fintech & engineering",
    tl_expand:"Show previous experience · 7 positions", tl_collapse:"Hide previous experience",
    pf_eyebrow:"Portfolio", pf_h2:"Selected products & initiatives",
    pf_desc:"Click any project for the full case study — overview, problem, role, features, process, and outcomes.",
    pf_btn_case:"View Case Study", pf_btn_cjm:"Open CJM ↗",
    proto_eyebrow:"Prototype library", proto_h2:"Interactive prototypes & demos",
    proto_desc:"Internal prototypes hosted on this domain, plus links to external Figma / Framer / Canva flows.",
    filter_all:"All", filter_internal:"Internal", filter_external:"External",
    proto_btn_open:"Open Prototype", proto_btn_link:"Open Link ↗", proto_btn_soon:"Coming Soon",
    resume_eyebrow:"Résumé", resume_h2:"Education, certifications & languages",
    resume_edu:"Education", resume_lang_h:"Languages", resume_cert:"Certifications",
    resume_cta_h3:"Full résumé & work history",
    resume_cta_p:"Download the complete CV with detailed roles, scope, and outcomes.",
    resume_btn:"Download CV",
    contact_eyebrow:"Contact", contact_h2:"Let's build something durable",
    contact_desc:"Open to product leadership, fintech transformation, advisory, mentoring, and strategic product opportunities.",
    form_name:"Name", form_name_ph:"Your name",
    form_email:"Email", form_email_ph:"you@company.com",
    form_msg:"Message", form_msg_ph:"Tell me a little about what you have in mind…",
    form_submit:"Send message", form_sending:"Sending…",
    form_success:"✓ Message sent! I'll get back to you soon.",
    form_error:"⚠ Something went wrong. Please email me directly at zokirovbobur93@gmail.com",
    footer_loc:"Tashkent",
  },
  ru: {
    nav_about:"Обо мне", nav_expertise:"Экспертиза", nav_experience:"Опыт",
    nav_portfolio:"Портфолио", nav_prototypes:"Прототипы", nav_resume:"Резюме", nav_contact:"Контакт",
    hero_eyebrow:"Chief Product Officer",
    hero_title:"Product Manager · Финтех и Цифровой банкинг",
    hero_loc:"Ташкент, Узбекистан",
    hero_lede:"Помогаю финтех-, банковским, ритейл- и цифровым продуктам двигаться от идеи к масштабируемому исполнению — через продуктовую стратегию, MVP-запуск, кросс-функциональное лидерство и рост на основе данных.",
    hero_btn_resume:"Скачать резюме", hero_btn_portfolio:"Портфолио", hero_btn_contact:"Написать →",
    about_eyebrow:"Обо мне",
    about_lead:"Продуктовое лидерство на инженерном фундаменте — превращение стратегии в готовые продукты и измеримый рост.",
    about_p1:"Бобур Зокиров — опытный Product Manager и Chief Product Officer с опытом в разработке ПО, финтехе, цифровом банкинге, BNPL, ритейл-технологиях, AdTech и продуктовой трансформации.",
    about_p2:"Руководил запусками MVP, продуктовыми роадмапами, кросс-функциональными командами, трансформацией процессов и инвестиционными инициативами — сочетая стратегическое видение с практической реализацией.",
    exp_eyebrow:"Ключевая экспертиза", exp_h2:"Где я создаю ценность",
    tl_eyebrow:"Опыт работы", tl_h2:"Десятилетие в банкинге, финтехе и инженерии",
    tl_expand:"Показать предыдущий опыт · 7 позиций", tl_collapse:"Скрыть предыдущий опыт",
    pf_eyebrow:"Портфолио", pf_h2:"Избранные продукты и инициативы",
    pf_desc:"Нажмите на проект для полного кейса — обзор, проблема, роль, функции, процесс и результаты.",
    pf_btn_case:"Кейс-стади", pf_btn_cjm:"Открыть CJM ↗",
    proto_eyebrow:"Библиотека прототипов", proto_h2:"Интерактивные прототипы и демо",
    proto_desc:"Внутренние прототипы на этом домене, а также ссылки на внешние Figma / Framer / Canva потоки.",
    filter_all:"Все", filter_internal:"Внутренние", filter_external:"Внешние",
    proto_btn_open:"Открыть прототип", proto_btn_link:"Открыть ↗", proto_btn_soon:"Скоро",
    resume_eyebrow:"Резюме", resume_h2:"Образование, сертификаты и языки",
    resume_edu:"Образование", resume_lang_h:"Языки", resume_cert:"Сертификаты",
    resume_cta_h3:"Полное резюме и история работы",
    resume_cta_p:"Скачайте полное CV с подробными ролями, масштабом и результатами.",
    resume_btn:"Скачать CV",
    contact_eyebrow:"Контакт", contact_h2:"Давайте создадим что-то долговечное",
    contact_desc:"Открыт к продуктовому лидерству, финтех-трансформации, консультациям, менторингу и стратегическим продуктовым возможностям.",
    form_name:"Имя", form_name_ph:"Ваше имя",
    form_email:"Email", form_email_ph:"you@company.com",
    form_msg:"Сообщение", form_msg_ph:"Расскажите немного о том, что вас интересует…",
    form_submit:"Отправить", form_sending:"Отправка…",
    form_success:"✓ Сообщение отправлено! Свяжусь с вами в ближайшее время.",
    form_error:"⚠ Ошибка. Напишите напрямую: zokirovbobur93@gmail.com",
    footer_loc:"Ташкент",
  },
  uz: {
    nav_about:"Men haqimda", nav_expertise:"Tajriba", nav_experience:"Ish tajribasi",
    nav_portfolio:"Portfolio", nav_prototypes:"Prototiplar", nav_resume:"Rezyume", nav_contact:"Aloqa",
    hero_eyebrow:"Chief Product Officer",
    hero_title:"Product Manager · Fintech va Raqamli Banking",
    hero_loc:"Toshkent, O'zbekiston",
    hero_lede:"Fintech, banking, retail va raqamli mahsulotlarni g'oyadan kengaytiriladigan amalga oshirishga olib borishga yordam beraman — mahsulot strategiyasi, MVP yetkazib berish, funksiyalararo yetakchilik va ma'lumotlarga asoslangan o'sish orqali.",
    hero_btn_resume:"Rezyume yuklab olish", hero_btn_portfolio:"Portfolioga o'tish", hero_btn_contact:"Bog'lanish →",
    about_eyebrow:"Men haqimda",
    about_lead:"Muhandis asosida qurilgan mahsulot yetakchiligi — strategiyani tayyor mahsulotlar va o'lchanadigan o'sishga aylantirish.",
    about_p1:"Bobur Zokirov — dasturiy ta'minot muhandisligi, fintech, raqamli banking, BNPL, chakana savdo texnologiyalari, AdTech va mahsulot transformatsiyasi sohasida tajribaga ega Product Manager va Chief Product Officer.",
    about_p2:"MVP ishga tushirish, mahsulot yo'l xaritalari, funksiyalararo jamoalar, jarayon transformatsiyasi va investorlar uchun tashabbuslarga rahbarlik qilgan — ijrochi ravshanligi va amaliy yetkazib berishni birlashtirgan holda.",
    exp_eyebrow:"Asosiy tajriba", exp_h2:"Men qayerda ta'sir yarataman",
    tl_eyebrow:"Ish tajribasi", tl_h2:"Banking, fintech va muhandilikda o'n yillik tajriba",
    tl_expand:"Avvalgi tajribani ko'rsatish · 7 ta lavozim", tl_collapse:"Avvalgi tajribani yashirish",
    pf_eyebrow:"Portfolio", pf_h2:"Tanlangan mahsulotlar va tashabbuslar",
    pf_desc:"To'liq keys-stadi uchun har qanday loyihani bosing — umumiy ko'rinish, muammo, rol, xususiyatlar, jarayon va natijalar.",
    pf_btn_case:"Keys-stadi", pf_btn_cjm:"CJM ni ochish ↗",
    proto_eyebrow:"Prototiplar kutubxonasi", proto_h2:"Interaktiv prototiplar va demolar",
    proto_desc:"Ushbu domenida joylashtirilgan ichki prototiplar, shuningdek tashqi Figma / Framer / Canva oqimlariga havolalar.",
    filter_all:"Hammasi", filter_internal:"Ichki", filter_external:"Tashqi",
    proto_btn_open:"Prototipni ochish", proto_btn_link:"Ochish ↗", proto_btn_soon:"Tez kunda",
    resume_eyebrow:"Rezyume", resume_h2:"Ta'lim, sertifikatlar va tillar",
    resume_edu:"Ta'lim", resume_lang_h:"Tillar", resume_cert:"Sertifikatlar",
    resume_cta_h3:"To'liq rezyume va ish tarixi",
    resume_cta_p:"Batafsil lavozimlar, ko'lam va natijalar bilan to'liq CV ni yuklab oling.",
    resume_btn:"CV yuklab olish",
    contact_eyebrow:"Aloqa", contact_h2:"Keling, biror mustahkam narsa yarataylik",
    contact_desc:"Mahsulot yetakchiligi, fintech transformatsiyasi, maslahat, mentorlik va strategik mahsulot imkoniyatlariga ochiqman.",
    form_name:"Ism", form_name_ph:"Ismingiz",
    form_email:"Email", form_email_ph:"siz@kompaniya.com",
    form_msg:"Xabar", form_msg_ph:"Niyatingiz haqida biroz aytib bering…",
    form_submit:"Xabar yuborish", form_sending:"Yuborilmoqda…",
    form_success:"✓ Xabar yuborildi! Tez orada javob beraman.",
    form_error:"⚠ Xatolik yuz berdi. Menga bevosita yozing: zokirovbobur93@gmail.com",
    footer_loc:"Toshkent",
  }
};

/* ====================== RENDER & INTERACTIONS ======================= */
(function () {
  "use strict";

  /* ---------- Gate (entry screen) ---------- */
  var gate = document.getElementById("gate");
  function hideGate(targetHash) {
    if (!gate) return;
    gate.classList.add("hidden");
    if (targetHash) {
      setTimeout(function () {
        var el = document.getElementById(targetHash.replace("#", ""));
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 120);
    }
  }

  if (gate) {
    // Skip gate if URL already has a hash (direct link e.g. zoboto.uz/#prototypes)
    var hash = window.location.hash;
    if (hash && hash !== "#top") {
      gate.classList.add("hidden");
      setTimeout(function () {
        var el = document.getElementById(hash.replace("#", ""));
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }

    var gateAbout  = document.getElementById("gateAbout");
    var gateProtos = document.getElementById("gateProtos");

    if (gateAbout) {
      gateAbout.addEventListener("click", function (e) {
        e.preventDefault();
        hideGate("#about");
      });
    }
    if (gateProtos) {
      gateProtos.addEventListener("click", function (e) {
        e.preventDefault();
        hideGate("#prototypes");
      });
    }

    // Escape key also dismisses gate
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") hideGate();
    });
  }

  /* ---------- Theme (system default + manual toggle) ---------- */
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved) {
    root.setAttribute("data-theme", saved);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    root.setAttribute("data-theme", "dark");
  }
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }

  /* ---------- Sticky-nav border + mobile menu ---------- */
  const nav = document.getElementById("nav");
  const onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const hamburger = document.getElementById("hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", function () { nav.classList.toggle("open"); });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }

  /* ---------- Render portfolio ---------- */
  function renderPortfolio(wrap) {
    var tr = I18N[LANG] || I18N.en;
    wrap.innerHTML = PORTFOLIO.map(function (p, i) {
      const caseBtn = p.caseStudy
        ? '<button class="btn btn--ghost btn--sm" data-case="' + i + '">' + tr.pf_btn_case + '</button>' : "";
      const cjmBtn = p.cjmUrl
        ? '<a class="btn btn--text btn--sm" href="' + p.cjmUrl + '" target="_blank" rel="noopener">' + tr.pf_btn_cjm + '</a>' : "";
      return '' +
        '<article class="pf-card reveal">' +
          '<div class="pf-body">' +
            '<span class="pf-cat">' + p.category + '</span>' +
            '<h3>' + p.title + '</h3>' +
            '<p class="pf-role"><b>Role:</b> ' + p.role + '</p>' +
            '<p class="pf-desc">' + p.description + '</p>' +
            '<div class="pf-actions">' + caseBtn + cjmBtn + '</div>' +
          '</div>' +
        '</article>';
    }).join("");
    wrap.querySelectorAll("[data-case]").forEach(function (btn) {
      btn.addEventListener("click", function () { openCase(PORTFOLIO[+btn.dataset.case]); });
    });
    revealObserve(wrap.querySelectorAll(".reveal"));
  }
  const pfWrap = document.getElementById("portfolioGrid");
  if (pfWrap) renderPortfolio(pfWrap);

  /* ---------- Render prototype library (with filters) ---------- */
  const protoWrap = document.getElementById("protoGrid");
  var currentFilter = "All";
  function renderProtos(filter, wrap) {
    var w = wrap || protoWrap;
    if (!w) return;
    if (filter) currentFilter = filter;
    var tr = I18N[LANG] || I18N.en;
    const list = currentFilter && currentFilter !== "All"
      ? PROTOTYPES.filter(function (p) { return p.type === currentFilter; })
      : PROTOTYPES;
    w.innerHTML = list.map(function (p) {
      const isInternal = p.type === "Internal";
      const isSoon = p.status === "Coming Soon";
      const stClass = p.status === "Demo" ? "badge--demo"
        : p.status === "Public" ? "badge--public"
        : p.status === "Coming Soon" ? "badge--soon"
        : "badge--private";
      const typeLabel = isInternal ? tr.filter_internal : tr.filter_external;
      const statusLabel = isSoon ? tr.proto_btn_soon : p.status;
      const action = isSoon
        ? '<span class="btn btn--primary btn--sm" style="opacity:.4;cursor:not-allowed">' + tr.proto_btn_soon + '</span>'
        : isInternal
          ? '<a class="btn btn--primary btn--sm" href="' + p.url + '">' + tr.proto_btn_open + '</a>'
          : '<a class="btn btn--primary btn--sm" href="' + p.url + '" target="_blank" rel="noopener">' + tr.proto_btn_link + '</a>';
      return '' +
        '<article class="proto-card reveal' + (isSoon ? ' proto-card--soon' : '') + '">' +
          '<div class="proto-top">' +
            '<div><h3>' + p.title + '</h3></div>' +
            '<div class="proto-badges">' +
              '<span class="badge ' + (isInternal ? "badge--int" : "badge--ext") + '">' + typeLabel + '</span>' +
              '<span class="badge ' + stClass + '">' + statusLabel + '</span>' +
            '</div>' +
          '</div>' +
          '<p class="proto-desc">' + p.description + '</p>' +
          '<div class="pf-actions">' + action + '</div>' +
        '</article>';
    }).join("");
    revealObserve(w.querySelectorAll(".reveal"));
  }
  if (protoWrap) {
    renderProtos("All");
    document.querySelectorAll(".filter").forEach(function (f) {
      f.addEventListener("click", function () {
        document.querySelectorAll(".filter").forEach(function (x) { x.classList.remove("active"); });
        f.classList.add("active");
        renderProtos(f.dataset.filter);
      });
    });
  }

  /* ---------- applyLang (defined here to access renderPortfolio/renderProtos) ---------- */
  function applyLang(lang) {
    LANG = lang;
    localStorage.setItem("lang", lang);
    var tr = I18N[lang] || I18N.en;
    // Static elements
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.dataset.i18n;
      if (tr[key] !== undefined) el.textContent = tr[key];
    });
    // Placeholders
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var key = el.dataset.i18nPh;
      if (tr[key] !== undefined) el.placeholder = tr[key];
    });
    // Lang select value
    var sel = document.getElementById("langSelect");
    if (sel) sel.value = lang;
    // Expand button text
    var tlBtn = document.getElementById("tlExpandBtn");
    if (tlBtn) {
      var isOpen = tlBtn.classList.contains("open");
      var arrowD = isOpen ? "M12 10l-4-4-4 4" : "M4 6l4 4 4-4";
      tlBtn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="' + arrowD + '"/></svg> '
        + (isOpen ? tr.tl_collapse : tr.tl_expand);
    }
    // Re-render dynamic sections with new lang
    if (pfWrap) renderPortfolio(pfWrap);
    if (protoWrap) renderProtos(currentFilter);
    document.documentElement.lang = lang;
  }

  /* ---------- Lang select ---------- */
  var langSelect = document.getElementById("langSelect");
  if (langSelect) {
    langSelect.addEventListener("change", function () {
      applyLang(langSelect.value);
    });
  }
  // Apply saved/default lang on load
  applyLang(LANG);

  /* ---------- Case-study modal ---------- */
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modalBody");
  function openCase(p) {
    const cs = p.caseStudy;
    const metrics = (cs.metrics || []).map(function (m) {
      return '<div class="cs-metric"><div class="v">' + m.v + '</div><div class="k">' + m.k + '</div></div>';
    }).join("");
    const features = (cs.features || []).map(function (f) { return "<li>" + f + "</li>"; }).join("");
    const protoFoot = p.cjmUrl
      ? '<a class="btn btn--primary" href="' + p.cjmUrl + '" target="_blank" rel="noopener">Open CJM ↗</a>' : "";
    modalBody.innerHTML = '' +
      '<div class="cs-hero">' +
        '<span class="pf-cat">' + p.category + '</span>' +
        '<h2>' + p.title + '</h2>' +
        '<p class="cs-role">Role · ' + p.role + '</p>' +
      '</div>' +
      '<div class="cs-body">' +
        '<div class="cs-thumb"><span>case-study visual / screenshots</span></div>' +
        sec("Overview", "<p>" + cs.overview + "</p>") +
        sec("Problem", "<p>" + cs.problem + "</p>") +
        sec("Target users", "<p>" + cs.users + "</p>") +
        sec("Key features", "<ul>" + features + "</ul>") +
        sec("Process", "<p>" + cs.process + "</p>") +
        sec("Metrics &amp; outcome", '<div class="cs-metrics">' + metrics + "</div>") +
        sec("Lessons learned", "<p>" + cs.lessons + "</p>") +
        '<div class="cs-foot">' + protoFoot +
          '<button class="btn btn--ghost" data-close>Close</button>' +
        '</div>' +
      '</div>';
    modalBody.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", closeModal); });
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function sec(title, html) {
    return '<div class="cs-section"><h4>' + title + "</h4>" + html + "</div>";
  }
  function closeModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
  if (modal) {
    modal.querySelector(".modal__overlay").addEventListener("click", closeModal);
    modal.querySelector(".modal__close").addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  }

  /* ---------- Scroll reveal ---------- */
  function revealObserve(nodes) {
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("in"); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    nodes.forEach(function (n) { io.observe(n); });
  }
  revealObserve(document.querySelectorAll(".reveal"));

  /* ---------- Contact form — EmailJS ---------- */
  // EmailJS credentials — replace with your real values from https://www.emailjs.com/
  var EMAILJS_PUBLIC_KEY  = "p-hAzWwHzIuIxS3Wt";
  var EMAILJS_SERVICE_ID  = "service_zoboto_mail";
  var EMAILJS_TEMPLATE_ID = "template_01oel1r";

  if (typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const status  = document.getElementById("formStatus");
      const btn     = document.getElementById("formSubmit");
      const name    = document.getElementById("cf-name").value.trim();
      const email   = document.getElementById("cf-email").value.trim();
      const message = document.getElementById("cf-msg").value.trim();

      if (typeof emailjs === "undefined") {
        status.textContent = "EmailJS SDK yuklanmadi. Sahifani qayta yuklang.";
        status.classList.add("show");
        return;
      }

      btn.disabled = true;
      btn.textContent = "Sending…";
      status.classList.remove("show");

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name:    name,
        from_email:   email,
        message:      message,
        to_email:     "zokirovbobur93@gmail.com"
      }).then(function () {
        status.textContent = "✓ Message sent! I'll get back to you soon.";
        status.style.color = "var(--accent)";
        status.classList.add("show");
        form.reset();
        btn.disabled = false;
        btn.textContent = "Send message";
      }, function (err) {
        status.textContent = "⚠ Something went wrong. Please email me directly at zokirovbobur93@gmail.com";
        status.style.color = "#e05a5a";
        status.classList.add("show");
        btn.disabled = false;
        btn.textContent = "Send message";
        console.error("EmailJS error:", err);
      });
    });
  }

  /* ---------- Experience expand ---------- */
  var tlBtn  = document.getElementById("tlExpandBtn");
  var tlMore = document.getElementById("tlMore");
  if (tlBtn && tlMore) {
    tlBtn.addEventListener("click", function () {
      var isOpen = tlMore.classList.toggle("open");
      tlBtn.classList.toggle("open", isOpen);
      tlBtn.setAttribute("aria-expanded", String(isOpen));
      tlBtn.innerHTML = isOpen
        ? '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 10l-4-4-4 4"/></svg> Hide previous experience'
        : '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6l4 4 4-4"/></svg> Show previous experience · 7 positions';
    });
  }

  /* ---------- Footer year ---------- */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
