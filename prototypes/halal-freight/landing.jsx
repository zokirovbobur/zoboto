/* ============================================================
   Landing page + Login / Role selection
   ============================================================ */
(function () {
const { useState } = React;
const { Brand, Btn, Badge, Icon, Card, LangSwitcher } = window;
const D = window.HFF_DATA;

/* ---------- Public top nav ---------- */
function PublicNav({ nav }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const NAV_LINKS = [
    [window.t('nav_how'), "Howitworks"],
    [window.t('nav_why'), "Whyhalal"],
    [window.t('nav_trucking'), "Fortrucking"],
    [window.t('nav_compliance'), "Compliance"],
  ];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, background: "oklch(1 0 0 / 0.82)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 70, display: "flex", alignItems: "center", gap: 16 }}>
        <Brand />
        <nav className="pub-nav-links row" style={{ gap: 26, marginLeft: 28, flex: 1 }}>
          {NAV_LINKS.map(([label, id]) => (
            <a key={id} href={"#" + id} className="small" style={{ fontWeight: 600, color: "var(--ink-2)" }}>{label}</a>
          ))}
        </nav>
        <div className="pub-nav-ctas row" style={{ gap: 8 }}>
          <LangSwitcher />
          <Btn kind="ghost" size="sm" onClick={() => nav("login")}>{window.t('nav_signin')}</Btn>
          <Btn kind="primary" size="sm" icon="arrowRight" onClick={() => nav("login", { intent: "carrier" })}>{window.t('nav_start')}</Btn>
        </div>
        <button className="btn btn-quiet btn-sm pub-nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu" style={{ padding: 0, width: 38 }}>
          <Icon name={menuOpen ? "x" : "menu"} size={20} />
        </button>
      </div>
      {menuOpen && (
        <div style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", padding: "8px 20px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {NAV_LINKS.map(([label, id]) => (
              <a key={id} href={"#" + id} style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-2)", padding: "12px 0", borderBottom: "1px solid var(--line)" }} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, paddingBottom: 4 }}>
            <LangSwitcher />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            <Btn kind="ghost" block onClick={() => { nav("login"); setMenuOpen(false); }}>{window.t('nav_signin')}</Btn>
            <Btn kind="primary" block icon="arrowRight" onClick={() => { nav("login", { intent: "carrier" }); setMenuOpen(false); }}>{window.t('nav_start')}</Btn>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- Hero ---------- */
function Hero({ nav }) {
  return (
    <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(900px 380px at 78% -10%, var(--green-soft) 0%, transparent 60%)", pointerEvents: "none" }} />
      <svg aria-hidden width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.5, maskImage: "linear-gradient(120deg, transparent 40%, black 100%)" }}>
        <defs>
          <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M34 0H0V34" fill="none" stroke="var(--line)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 20px 64px", position: "relative", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center" }} className="hero-grid">
        <div className="fade-up">
          <Badge tone="green" icon="shieldCheck">{window.t('hero_badge')}</Badge>
          <h1 className="hero-h1" style={{ fontSize: 50, lineHeight: 1.04, margin: "20px 0 0", letterSpacing: "-0.035em" }}>
            {window.t('hero_h1a')} <span style={{ color: "var(--green-strong)" }}>{window.t('hero_h1b')}</span>
          </h1>
          <p className="lead" style={{ marginTop: 20, maxWidth: 540 }}>
            {window.t('hero_lead')}
          </p>
          <div className="row" style={{ gap: 12, marginTop: 30 }}>
            <Btn kind="primary" size="lg" icon="plus" onClick={() => nav("login", { intent: "carrier" })}>{window.t('hero_cta_primary')}</Btn>
            <Btn kind="ghost" size="lg" icon="eye" onClick={() => nav("login")}>{window.t('hero_cta_demo')}</Btn>
          </div>
          <div className="row wrap" style={{ gap: 22, marginTop: 34 }}>
            {[window.t('hero_feat1'), window.t('hero_feat2'), window.t('hero_feat3')].map(feat => (
              <div key={feat} className="row" style={{ gap: 8 }}>
                <div className="check-ico ok" style={{ width: 24, height: 24 }}><Icon name="check" size={14} /></div>
                <span className="small strong">{feat}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="fade-up" style={{ animationDelay: ".08s" }}>
          <OfferPreview />
        </div>
      </div>
    </section>
  );
}

/* mini offer card for hero */
function OfferPreview() {
  const f = D.featured;
  return (
    <div className="card" style={{ boxShadow: "var(--sh-lg)", overflow: "hidden", maxWidth: 420, marginLeft: "auto" }}>
      <div style={{ padding: "16px 20px", background: "var(--ink)", color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name="shieldCheck" size={18} style={{ color: "var(--green)" }} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Halal Offer · {f.id}</span>
        <span className="badge badge-green" style={{ marginLeft: "auto" }}>{window.t('offer_no_interest')}</span>
      </div>
      <div style={{ padding: 20 }}>
        <div className="row between" style={{ marginBottom: 4 }}>
          <span className="small muted">{window.t('offer_invoice')}</span>
          <span className="mono strong num">{D.fmt(f.invoice)}</span>
        </div>
        <div className="row between" style={{ padding: "14px 0", borderTop: "1px dashed var(--line)", borderBottom: "1px dashed var(--line)", margin: "10px 0" }}>
          <div>
            <div className="small muted">{window.t('offer_advance_label')}</div>
            <div className="tiny muted">{window.t('offer_advance_sub')}</div>
          </div>
          <span className="num" style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, color: "var(--green-strong)" }}>{D.fmt(f.advance)}</span>
        </div>
        <div className="row between"><span className="small muted">{window.t('offer_fee')}</span><span className="mono num">{D.fmt(f.fee)}</span></div>
        <div className="row between" style={{ marginTop: 6 }}><span className="small muted">{window.t('offer_reserve')}</span><span className="mono num">{D.fmt(f.reserve)}</span></div>
      </div>
    </div>
  );
}

/* ---------- How it works ---------- */
function HowItWorks() {
  const STEPS = [
    [window.t('how_step1'), "file", window.t('how_step1d')],
    [window.t('how_step2'), "shieldCheck", window.t('how_step2d')],
    [window.t('how_step3'), "receipt", window.t('how_step3d')],
    [window.t('how_step4'), "sign", window.t('how_step4d')],
    [window.t('how_step5'), "wallet", window.t('how_step5d')],
    [window.t('how_step6'), "building", window.t('how_step6d')],
    [window.t('how_step7'), "handshake", window.t('how_step7d')],
  ];
  return (
    <section id="Howitworks" style={{ maxWidth: 1200, margin: "0 auto", padding: "84px 28px" }} className="section-inner section-pad">
      <SectionHead eyebrow={window.t('how_eyebrow')} title={window.t('how_title')} sub={window.t('how_sub')} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0, marginTop: 40 }} className="how-grid">
        {STEPS.map(([stepLabel, ic, d], i) => (
          <div key={i} style={{ position: "relative", padding: "0 12px" }}>
            {i < STEPS.length - 1 && <div style={{ position: "absolute", top: 26, left: "60%", right: "-40%", height: 2, background: "var(--green-line)", zIndex: 0 }} className="how-connector" />}
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ width: 54, height: 54, borderRadius: 15, background: "var(--surface)", border: "1px solid var(--green-line)", display: "grid", placeItems: "center", color: "var(--green-strong)", boxShadow: "var(--sh-sm)" }}>
                <Icon name={ic} size={22} />
              </div>
              <div className="tiny mono" style={{ color: "var(--green-strong)", marginTop: 14, fontWeight: 600 }}>STEP {i + 1}</div>
              <div style={{ fontWeight: 600, fontSize: 14.5, marginTop: 4 }}>{stepLabel}</div>
              <div className="tiny muted" style={{ marginTop: 5, lineHeight: 1.5 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Why halal: comparison ---------- */
function WhyHalal() {
  const halal = [window.t('why_h1'), window.t('why_h2'), window.t('why_h3'), window.t('why_h4'), window.t('why_h5'), window.t('why_h6')];
  const trad = [window.t('why_t1'), window.t('why_t2'), window.t('why_t3'), window.t('why_t4'), window.t('why_t5'), window.t('why_t6')];
  return (
    <section id="Whyhalal" style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "84px 28px" }} className="section-inner section-pad">
        <SectionHead eyebrow={window.t('why_eyebrow')} title={window.t('why_title')} sub={window.t('why_sub')} />
        <div className="grid g-2" style={{ marginTop: 40 }}>
          <Card style={{ borderColor: "var(--green-line)", overflow: "hidden" }}>
            <div style={{ padding: "16px 22px", background: "var(--green-soft)", borderBottom: "1px solid var(--green-line)" }}>
              <div className="row" style={{ gap: 9 }}><Icon name="shieldCheck" size={18} style={{ color: "var(--green-strong)" }} /><span style={{ fontWeight: 700, color: "var(--green-deep)" }}>{window.t('why_hff')}</span></div>
            </div>
            <div style={{ padding: "8px 22px 18px" }}>
              {halal.map((label, i) => <div key={i} className="check-row"><div className="check-ico ok"><Icon name="check" size={13} /></div><span className="check-label">{label}</span></div>)}
            </div>
          </Card>
          <Card style={{ overflow: "hidden", opacity: 0.92 }}>
            <div style={{ padding: "16px 22px", background: "var(--surface-sunken)", borderBottom: "1px solid var(--line)" }}>
              <div className="row" style={{ gap: 9 }}><Icon name="receipt" size={18} style={{ color: "var(--ink-3)" }} /><span style={{ fontWeight: 700, color: "var(--ink-2)" }}>{window.t('why_trad')}</span></div>
            </div>
            <div style={{ padding: "8px 22px 18px" }}>
              {trad.map((label, i) => <div key={i} className="check-row"><div className="check-ico bad"><Icon name="x" size={13} /></div><span className="check-label" style={{ color: "var(--ink-2)" }}>{label}</span></div>)}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ---------- Built for trucking ---------- */
function ForTrucking() {
  const feats = [
    [window.t('truck_f1'), "truck", window.t('truck_f1d')],
    [window.t('truck_f2'), "doc", window.t('truck_f2d')],
    [window.t('truck_f3'), "gauge", window.t('truck_f3d')],
    [window.t('truck_f4'), "route", window.t('truck_f4d')],
  ];
  return (
    <section id="Fortrucking" style={{ maxWidth: 1200, margin: "0 auto", padding: "84px 28px" }} className="section-inner section-pad">
      <SectionHead eyebrow={window.t('truck_eyebrow')} title={window.t('truck_title')} sub={window.t('truck_sub')} />
      <div className="grid g-4" style={{ marginTop: 40 }}>
        {feats.map(([featLabel, ic, d]) => (
          <Card key={featLabel} pad style={{ transition: "box-shadow .15s, transform .15s" }} className="lift">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--green-soft)", color: "var(--green-strong)", display: "grid", placeItems: "center" }}><Icon name={ic} size={21} /></div>
            <div style={{ fontWeight: 600, fontSize: 16, marginTop: 16 }}>{featLabel}</div>
            <div className="small muted" style={{ marginTop: 7, lineHeight: 1.55 }}>{d}</div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ---------- Target users + trust ---------- */
function Audience() {
  const users = [
    [window.t('aud_u1'), "user", window.t('aud_u1d')],
    [window.t('aud_u2'), "truck", window.t('aud_u2d')],
    [window.t('aud_u3'), "building", window.t('aud_u3d')],
  ];
  const trust = [
    [window.t('aud_trust1'), "shieldCheck"],
    [window.t('aud_trust2'), "lock"],
    [window.t('aud_trust3'), "gauge"],
    [window.t('aud_trust4'), "scale"],
  ];
  return (
    <section style={{ background: "var(--ink)", color: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 20px" }} className="section-pad">
        <div className="grid g-3">
          {users.map(([userLabel, ic, d]) => (
            <div key={userLabel}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "oklch(1 0 0 / 0.08)", color: "var(--green)", display: "grid", placeItems: "center" }}><Icon name={ic} size={21} /></div>
              <div style={{ fontWeight: 600, fontSize: 18, marginTop: 16, color: "#fff" }}>{userLabel}</div>
              <div className="small" style={{ marginTop: 7, color: "oklch(0.8 0.02 248)", lineHeight: 1.55 }}>{d}</div>
            </div>
          ))}
        </div>
        <div className="hr" style={{ background: "oklch(1 0 0 / 0.1)", margin: "48px 0 36px" }} />
        <div className="row wrap audience-row" style={{ gap: 40, justifyContent: "space-between" }}>
          {trust.map(([trustLabel, ic]) => (
            <div key={trustLabel} className="row" style={{ gap: 10 }}><Icon name={ic} size={20} style={{ color: "var(--green)" }} /><span style={{ fontWeight: 500, color: "oklch(0.92 0.01 248)" }}>{trustLabel}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ nav }) {
  return (
    <section id="Compliance" style={{ maxWidth: 1200, margin: "0 auto", padding: "84px 20px" }} className="section-pad">
      <div className="card cta-card" style={{ padding: "56px 48px", textAlign: "center", background: "var(--green-soft)", borderColor: "var(--green-line)", position: "relative", overflow: "hidden" }}>
        <h2 style={{ fontSize: 34, letterSpacing: "-0.03em" }}>{window.t('cta_title')}</h2>
        <p className="lead" style={{ maxWidth: 560, margin: "14px auto 28px" }}>{window.t('cta_sub')}</p>
        <div className="row" style={{ gap: 12, justifyContent: "center" }}>
          <Btn kind="primary" size="lg" icon="plus" onClick={() => nav("login", { intent: "carrier" })}>{window.t('hero_cta_primary')}</Btn>
          <Btn kind="ghost" size="lg" icon="eye" onClick={() => nav("login")}>{window.t('hero_cta_demo')}</Btn>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", background: "var(--surface)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <Brand />
        <span className="tiny muted" style={{ marginLeft: "auto", textAlign: "right" }}>
          {window.t('footer_copy')}
        </span>
      </div>
    </footer>
  );
}

function SectionHead({ eyebrow, title, sub }) {
  return (
    <div style={{ maxWidth: 720 }}>
      <div className="eyebrow">{eyebrow}</div>
      <h2 style={{ fontSize: 32, marginTop: 10, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{title}</h2>
      {sub && <p className="lead" style={{ marginTop: 14, fontSize: 16 }}>{sub}</p>}
    </div>
  );
}

function Landing({ nav, lang }) {
  return (
    <div>
      <PublicNav nav={nav} />
      <Hero nav={nav} />
      <HowItWorks />
      <WhyHalal />
      <ForTrucking />
      <Audience />
      <CTA nav={nav} />
      <Footer />
      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .how-grid { grid-template-columns: repeat(2,1fr) !important; gap: 28px 12px !important; }
          .how-connector { display: none; }
        }
        @media (max-width: 768px) {
          .hero-h1 { font-size: 32px !important; }
          .hero-grid { padding-top: 40px !important; padding-bottom: 44px !important; }
          .section-pad { padding-top: 52px !important; padding-bottom: 52px !important; }
          .section-inner { padding-left: 20px !important; padding-right: 20px !important; }
          .cta-card { padding: 36px 22px !important; }
          .cta-card h2 { font-size: 24px !important; }
          .audience-row { gap: 20px !important; flex-direction: column !important; }
        }
        .lift:hover { box-shadow: var(--sh-md); transform: translateY(-2px); }
      `}</style>
    </div>
  );
}

/* ============================================================
   Login / Role selection
   ============================================================ */
function Login({ nav, params, lang }) {
  const ROLES = [
    { id: "carrier", route: "carrier/dashboard", icon: "truck", title: window.t('role_carrier'), desc: window.t('role_carrier_desc'), who: window.t('role_carrier_who'), tone: "green" },
    { id: "admin", route: "admin/dashboard", icon: "shield", title: window.t('role_admin'), desc: window.t('role_admin_desc'), who: window.t('role_admin_who'), tone: "blue" },
    { id: "broker", route: "broker/confirm", icon: "building", title: window.t('role_broker'), desc: window.t('role_broker_desc'), who: window.t('role_broker_who'), tone: "violet" },
  ];
  const [sel, setSel] = useState(params?.intent || "carrier");
  const toneBg = { green: "var(--green-soft)", blue: "var(--info-soft)", violet: "var(--violet-soft)" };
  const toneFg = { green: "var(--green-strong)", blue: "oklch(0.5 0.11 245)", violet: "oklch(0.5 0.12 295)" };
  const selRole = ROLES.find(r => r.id === sel) || ROLES[0];
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }} className="login-grid">
      {/* left brand panel */}
      <div style={{ background: "var(--ink)", color: "#fff", padding: "48px 56px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }} className="login-aside">
        <div style={{ cursor: "pointer" }} onClick={() => nav("landing")}><Brand /></div>
        <div style={{ margin: "auto 0", maxWidth: 420 }}>
          <Badge tone="green" icon="shieldCheck">{window.t('login_badge')}</Badge>
          <h1 style={{ color: "#fff", fontSize: 36, lineHeight: 1.1, marginTop: 18, letterSpacing: "-0.03em" }}>{window.t('login_h1')}</h1>
          <p style={{ color: "oklch(0.82 0.02 248)", marginTop: 16, fontSize: 16, lineHeight: 1.6 }}>
            {window.t('login_lead')}
          </p>
          <div className="stack" style={{ gap: 14, marginTop: 32 }}>
            {[[window.t('login_feat1'), "coins"], [window.t('login_feat2'), "handshake"], [window.t('login_feat3'), "scale"]].map(([feat, ic]) => (
              <div key={feat} className="row" style={{ gap: 11 }}><div style={{ width: 30, height: 30, borderRadius: 8, background: "oklch(1 0 0 / 0.08)", color: "var(--green)", display: "grid", placeItems: "center" }}><Icon name={ic} size={16} /></div><span style={{ color: "oklch(0.9 0.01 248)" }}>{feat}</span></div>
            ))}
          </div>
        </div>
        <div className="tiny" style={{ color: "oklch(0.65 0.02 248)" }}>© 2026 Tijara</div>
      </div>
      {/* right role select */}
      <div style={{ display: "grid", placeItems: "center", padding: 40 }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div className="row between" style={{ marginBottom: 4 }}>
            <h2 style={{ fontSize: 24 }}>{window.t('login_h2')}</h2>
            <LangSwitcher />
          </div>
          <p className="muted" style={{ marginTop: 6 }}>{window.t('login_sub')}</p>
          <div className="stack" style={{ gap: 12, margin: "26px 0" }}>
            {ROLES.map(r => (
              <div key={r.id} className={"radio-card " + (sel === r.id ? "sel" : "")} onClick={() => setSel(r.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 16px" }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: toneBg[r.tone], color: toneFg[r.tone], display: "grid", placeItems: "center", flex: "0 0 auto" }}><Icon name={r.icon} size={20} /></div>
                <div style={{ flex: 1 }}>
                  <div className="rc-title">{r.title}</div>
                  <div className="rc-sub">{r.desc}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: 99, border: "2px solid " + (sel === r.id ? "var(--green-strong)" : "var(--line-strong)"), display: "grid", placeItems: "center" }}>
                  {sel === r.id && <div style={{ width: 10, height: 10, borderRadius: 99, background: "var(--green-strong)" }} />}
                </div>
              </div>
            ))}
          </div>
          <Field label={window.t('login_email')} value="">
            <input className="input" defaultValue={sel === "carrier" ? "ali@barakalogistics.com" : sel === "admin" ? "underwriting@hff.com" : "ap@northbridgefreight.com"} />
          </Field>
          <div style={{ height: 12 }} />
          <Field label={window.t('login_password')}>
            <input className="input" type="password" defaultValue="demo-access" />
          </Field>
          <div style={{ height: 20 }} />
          <Btn kind="primary" size="lg" block iconRight="arrowRight" onClick={() => nav(selRole.route)}>
            {window.t('login_continue')} {selRole.title}
          </Btn>
          <div className="row" style={{ gap: 8, justifyContent: "center", marginTop: 18 }}>
            <Icon name="lock" size={13} style={{ color: "var(--ink-3)" }} />
            <span className="tiny muted">{window.t('login_demo_note')}</span>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 860px){ .login-grid{ grid-template-columns:1fr !important;} .login-aside{ display:none !important;} }`}</style>
    </div>
  );
}

// Field shim (uses window.Field if available, else basic)
const Field = window.Field;

window.Landing = Landing;
window.Login = Login;
})();
