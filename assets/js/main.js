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
    prototypeUrl: "prototypes/trastpay-dashboard/index.html",
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
    prototypeUrl: "prototypes/islamic-banking/index.html",
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
    prototypeUrl: "prototypes/bnpl-broker/index.html",
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
    prototypeUrl: "prototypes/oneup-pro/index.html",
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
    prototypeUrl: "prototypes/geomotive-dsp/index.html",
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
    title: "Islamic Banking IT Infrastructure",
    product: "Trastbank",
    type: "Internal",
    status: "Demo",
    url: "prototypes/banking-infra/index.html",
    description: "Interactive AS-IS / TO-BE architecture explorer: Core Banking ABS, Middleware layer, client channels, compliance modules and external integrations — with multilingual support (UZ/RU/EN)."
  },
  {
    title: "Finport — Investment Portfolio",
    product: "Finport",
    type: "External",
    status: "Public",
    url: "https://finport.uz/",
    description: "Investment portfolio management platform — live product."
  },
  {
    title: "Trastpay Product Dashboard",
    product: "Trastpay",
    type: "Internal",
    status: "Coming Soon",
    url: "prototypes/trastpay-dashboard/index.html",
    description: "Interactive prototype for product KPI monitoring and the executive dashboard."
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
    title: "BNPL Broker Flow",
    product: "Mediapark",
    type: "Internal",
    status: "Coming Soon",
    url: "prototypes/bnpl-broker/index.html",
    description: "Onboarding, identification, and installment-plan execution across financial partners."
  },
  {
    title: "OneUP Pro — Agent CRM",
    product: "Mediapark",
    type: "Internal",
    status: "Coming Soon",
    url: "prototypes/oneup-pro/index.html",
    description: "Mobile CRM flow: client creation, lead conversion, and KPI tracking for sales agents."
  },
  {
    title: "Geomotive DSP Planner",
    product: "Geomotive",
    type: "Internal",
    status: "Coming Soon",
    url: "prototypes/geomotive-dsp/index.html",
    description: "DOOH campaign planning by location, audience, and inventory."
  }
];

/* ====================== RENDER & INTERACTIONS ======================= */
(function () {
  "use strict";

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
  const pfWrap = document.getElementById("portfolioGrid");
  if (pfWrap) {
    pfWrap.innerHTML = PORTFOLIO.map(function (p, i) {
      const caseBtn = p.caseStudy
        ? '<button class="btn btn--ghost btn--sm" data-case="' + i + '">View Case Study</button>' : "";
      const protoBtn = p.prototypeUrl
        ? '<a class="btn btn--text btn--sm" href="' + p.prototypeUrl + '">Open Prototype →</a>' : "";
      return '' +
        '<article class="pf-card reveal">' +
          '<div class="pf-thumb"><span class="pf-cat">' + p.category + '</span><span>project visual</span></div>' +
          '<div class="pf-body">' +
            '<h3>' + p.title + '</h3>' +
            '<p class="pf-role"><b>Role:</b> ' + p.role + '</p>' +
            '<p class="pf-desc">' + p.description + '</p>' +
            '<div class="pf-actions">' + caseBtn + protoBtn + '</div>' +
          '</div>' +
        '</article>';
    }).join("");

    pfWrap.querySelectorAll("[data-case]").forEach(function (btn) {
      btn.addEventListener("click", function () { openCase(PORTFOLIO[+btn.dataset.case]); });
    });
  }

  /* ---------- Render prototype library (with filters) ---------- */
  const protoWrap = document.getElementById("protoGrid");
  function renderProtos(filter) {
    const list = filter && filter !== "All"
      ? PROTOTYPES.filter(function (p) { return p.type === filter; })
      : PROTOTYPES;
    protoWrap.innerHTML = list.map(function (p) {
      const isInternal = p.type === "Internal";
      const isSoon = p.status === "Coming Soon";
      const stClass = p.status === "Demo" ? "badge--demo"
        : p.status === "Public" ? "badge--public"
        : p.status === "Coming Soon" ? "badge--soon"
        : "badge--private";
      const action = isSoon
        ? '<span class="btn btn--primary btn--sm" style="opacity:.4;cursor:not-allowed">Coming Soon</span>'
        : isInternal
          ? '<a class="btn btn--primary btn--sm" href="' + p.url + '">Open Prototype</a>' +
            '<a class="btn btn--text btn--sm" href="' + p.url + '">View Details →</a>'
          : '<a class="btn btn--primary btn--sm" href="' + p.url + '" target="_blank" rel="noopener">Open Link ↗</a>';
      return '' +
        '<article class="proto-card reveal' + (isSoon ? ' proto-card--soon' : '') + '">' +
          '<div class="proto-top">' +
            '<div>' +
              '<h3>' + p.title + '</h3>' +
              '<p class="proto-product">' + p.product + '</p>' +
            '</div>' +
            '<div class="proto-badges">' +
              '<span class="badge ' + (isInternal ? "badge--int" : "badge--ext") + '">' + p.type + '</span>' +
              '<span class="badge ' + stClass + '">' + p.status + '</span>' +
            '</div>' +
          '</div>' +
          '<p class="proto-desc">' + p.description + '</p>' +
          '<div class="pf-actions">' + action + '</div>' +
        '</article>';
    }).join("");
    revealObserve(protoWrap.querySelectorAll(".reveal"));
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

  /* ---------- Case-study modal ---------- */
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modalBody");
  function openCase(p) {
    const cs = p.caseStudy;
    const metrics = (cs.metrics || []).map(function (m) {
      return '<div class="cs-metric"><div class="v">' + m.v + '</div><div class="k">' + m.k + '</div></div>';
    }).join("");
    const features = (cs.features || []).map(function (f) { return "<li>" + f + "</li>"; }).join("");
    const protoFoot = p.prototypeUrl
      ? '<a class="btn btn--primary" href="' + p.prototypeUrl + '">Open Prototype →</a>' : "";
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

  /* ---------- Footer year ---------- */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
