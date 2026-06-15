/* ============================================================
   New Funding Request — 7-step wizard + Request detail
   ============================================================ */
(function () {
const { useState, useEffect } = React;
const { PageHead, Stat, Card, CardHead, Btn, Badge, StatusBadge, Icon,
  Steps, CheckRow, Field, Confidence, RiskGauge, KV, DocThumb, useToast } = window;
const D = window.HFF_DATA;
const f = D.featured;

function FundingWizard({ nav }) {
  const WIZ = [
    window.t('wiz_step1'), window.t('wiz_step2'), window.t('wiz_step3'),
    window.t('wiz_step4'), window.t('wiz_step5'), window.t('wiz_step6'), window.t('wiz_step7'),
  ];
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [docs, setDocs] = useState({ invoice: false, rate: false, bol: false, pod: false, gps: false });
  const [signed, setSigned] = useState(false);
  const next = () => setStep(s => Math.min(s + 1, WIZ.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));
  const reqDocsDone = docs.invoice && docs.rate && docs.bol && docs.pod;

  const canContinue = step === 0 ? true : step === 1 ? reqDocsDone : true;

  return (
    <div>
      <PageHead title={window.t('wiz_title')}
        crumb={<div className="crumb"><span className="lnk" onClick={() => nav("carrier/dashboard")}>Dashboard</span><span className="sep">/</span><span>{window.t('wiz_crumb')}</span></div>}
        actions={step < 6 && <Btn kind="quiet" icon="x" onClick={() => nav("carrier/dashboard")}>{window.t('btn_cancel_wiz')}</Btn>} />

      {step < 6 && <div style={{ marginBottom: 24 }}><Steps steps={WIZ.slice(0, 6)} current={step} /></div>}

      <div className="grid" style={{ gridTemplateColumns: step >= 6 ? "1fr" : "1fr 308px" }}>
        <div key={step} className="fade-in">
          {step === 0 && <LoadDetails />}
          {step === 1 && <UploadDocs docs={docs} setDocs={setDocs} />}
          {step === 2 && <Extraction />}
          {step === 3 && <Verification />}
          {step === 4 && <HalalOffer />}
          {step === 5 && <Agreement signed={signed} setSigned={setSigned} />}
          {step === 6 && <Confirmation nav={nav} />}

          {step < 6 && (
            <div className="row between" style={{ marginTop: 20 }}>
              <Btn kind="ghost" icon="arrowLeft" disabled={step === 0} onClick={back}>{window.t('btn_back')}</Btn>
              {step === 4
                ? <Btn kind="primary" size="lg" icon="check" onClick={next}>{window.t('btn_accept_offer')}</Btn>
                : step === 5
                ? <Btn kind="primary" size="lg" icon="sign" disabled={!signed} onClick={() => { toast(window.t('toast_submitted')); next(); }}>{window.t('btn_sign_submit')}</Btn>
                : <Btn kind="primary" iconRight="arrowRight" disabled={!canContinue} onClick={next}>{window.t('btn_continue')}</Btn>}
            </div>
          )}
        </div>

        {step < 6 && <WizSidebar step={step} docs={docs} />}
      </div>
      <style>{`@media(max-width:980px){ .portal-body .grid[style*="308px"]{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}

function WizSidebar({ step, docs }) {
  const docCount = Object.values(docs).filter(Boolean).length;
  return (
    <div className="stack" style={{ gap: 18 }}>
      <Card pad>
        <div className="small strong" style={{ marginBottom: 12 }}>{window.t('wiz_summary')}</div>
        <KV k="Broker" v={f.broker.split(" ")[0]} />
        <KV k="Lane" v={<span className="small">{f.pickup} → {f.delivery}</span>} />
        <KV k={window.t('offer_invoice')} v={<span className="mono num strong">{D.fmt(f.invoice)}</span>} />
        <KV k="Documents" v={window.t('wiz_docs_count').replace('{0}', docCount)} />
        {step >= 4 && <KV k={window.t('tbl_advance')} v={<span className="mono num strong" style={{ color: "var(--green-strong)" }}>{D.fmt(f.advance)}</span>} />}
      </Card>
      <Card pad style={{ background: "var(--green-soft)", borderColor: "var(--green-line)" }}>
        <div className="row" style={{ gap: 8 }}><Icon name="shieldCheck" size={16} style={{ color: "var(--green-strong)" }} /><span className="small strong" style={{ color: "var(--green-deep)" }}>{window.t('wiz_halal_note')}</span></div>
        <p className="tiny" style={{ marginTop: 8, lineHeight: 1.6, color: "var(--green-deep)" }}>{window.t('wiz_halal_sub')}</p>
      </Card>
    </div>
  );
}

/* ---- Step 1: Load Details ---- */
function LoadDetails() {
  return (
    <Card pad>
      <h3 style={{ fontSize: 18, marginBottom: 4 }}>{window.t('load_title')}</h3>
      <p className="muted small" style={{ marginBottom: 18 }}>{window.t('load_sub')}</p>
      <div className="stack" style={{ gap: 16 }}>
        <div className="grid g-2">
          <Field label={window.t('load_number')} req><input className="input mono" defaultValue="LD-77-3920" /></Field>
          <Field label={window.t('load_broker')} req><input className="input" defaultValue="NorthBridge Freight Brokers" /></Field>
        </div>
        <div className="grid g-2">
          <Field label={window.t('load_pickup')} req><input className="input" defaultValue="Dallas, TX" /></Field>
          <Field label={window.t('load_delivery')} req><input className="input" defaultValue="Memphis, TN" /></Field>
        </div>
        <div className="grid g-2">
          <Field label={window.t('load_pickup_date')} req><input className="input" type="date" defaultValue="2026-06-02" /></Field>
          <Field label={window.t('load_delivery_date')} req><input className="input" type="date" defaultValue="2026-06-05" /></Field>
        </div>
        <div className="grid g-2">
          <Field label={window.t('load_invoice_amt')} req prefix="$"><input className="input mono" defaultValue="5,000.00" /></Field>
          <Field label={window.t('load_terms')} req><select className="select" defaultValue="Net 30"><option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option></select></Field>
        </div>
      </div>
    </Card>
  );
}

/* ---- Step 2: Upload Documents ---- */
function UploadDocs({ docs, setDocs }) {
  const DOC_DEFS = [
    ["invoice", window.t('doc_invoice'), "doc", true],
    ["rate", window.t('doc_rate'), "receipt", true],
    ["bol", window.t('doc_bol'), "file", true],
    ["pod", window.t('doc_pod'), "sign", true],
    ["gps", window.t('doc_gps'), "route", false],
  ];
  return (
    <Card pad>
      <h3 style={{ fontSize: 18, marginBottom: 4 }}>{window.t('doc_title')}</h3>
      <p className="muted small" style={{ marginBottom: 18 }}>{window.t('doc_sub')}</p>
      <div className="grid g-2">
        {DOC_DEFS.map(([k, label, ic, req]) => (
          <div key={k} className={"upload " + (docs[k] ? "done" : "")} onClick={() => setDocs(d => ({ ...d, [k]: !d[k] }))} style={{ padding: 18 }}>
            {docs[k] ? (
              <div className="row" style={{ gap: 12 }}>
                <div className="check-ico ok" style={{ width: 34, height: 34 }}><Icon name="check" size={17} /></div>
                <div style={{ flex: 1 }}><div className="small strong">{label}</div><div className="tiny muted mono">{k}-LD773920.pdf</div></div>
                <Badge tone="green" dot>{window.t('doc_uploaded')}</Badge>
              </div>
            ) : (
              <div className="row" style={{ gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--surface)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", color: "var(--green-strong)" }}><Icon name={ic} size={17} /></div>
                <div style={{ flex: 1 }}><div className="small strong">{label} {req ? <span style={{ color: "var(--danger)" }}>*</span> : <span className="tiny muted">{window.t('doc_optional')}</span>}</div><div className="tiny muted">{window.t('doc_click')}</div></div>
                <Icon name="upload" size={17} style={{ color: "var(--ink-4)" }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---- Step 3: Extraction (animated) ---- */
function Extraction() {
  const [done, setDone] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDone(d => d < D.docExtract.length ? d + 1 : d), 280);
    return () => clearInterval(t);
  }, []);
  const finished = done >= D.docExtract.length;
  return (
    <Card style={{ overflow: "hidden" }}>
      <CardHead icon="sparkle" title={window.t('ext_title')} sub={window.t('ext_sub')}
        right={finished ? <Badge tone="green" icon="check">{window.t('ext_complete')}</Badge> : <Badge tone="blue" dot>{window.t('ext_scanning')}</Badge>} />
      <div className="card-pad">
        <table className="tbl" style={{ marginTop: -8 }}>
          <thead><tr><th>{window.t('tbl_field')}</th><th>{window.t('tbl_extracted')}</th><th className="right">{window.t('tbl_confidence')}</th></tr></thead>
          <tbody>
            {D.docExtract.map((row, i) => (
              <tr key={row.field} style={{ opacity: i < done ? 1 : 0.35, transition: "opacity .3s" }}>
                <td className="muted">{row.field}</td>
                <td className="strong">{i < done ? row.value : <span className="muted">{window.t('ext_reading')}</span>}</td>
                <td className="right">{i < done ? <Confidence value={row.conf} /> : <span className="tiny muted">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {finished && (
          <div className="row fade-in" style={{ gap: 10, padding: "12px 14px", background: "var(--ok-soft)", borderRadius: "var(--r-sm)", border: "1px solid var(--green-line)", marginTop: 16 }}>
            <Icon name="checkCircle" size={18} style={{ color: "var(--green-strong)" }} />
            <span className="small">{window.t('ext_done')}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ---- Step 4: Verification ---- */
function Verification() {
  const [done, setDone] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDone(d => d < D.verifyChecks.length ? d + 1 : d), 320);
    return () => clearInterval(t);
  }, []);
  const finished = done >= D.verifyChecks.length;
  return (
    <Card style={{ overflow: "hidden" }}>
      <CardHead icon="shieldCheck" title={window.t('ver_title')} sub={window.t('ver_sub')}
        right={finished ? <Badge tone="green" icon="check">{window.t('ver_done')}</Badge> : <Badge tone="blue" dot>{window.t('ver_verifying')}</Badge>} />
      <div className="card-pad" style={{ paddingTop: 8 }}>
        {D.verifyChecks.map((c, i) => (
          <div key={c.label} style={{ opacity: i < done ? 1 : 0.4, transition: "opacity .3s" }}>
            <CheckRow status={i < done ? "ok" : "pend"} label={c.label} meta={i < done ? c.meta : "…"} />
          </div>
        ))}
      </div>
      {finished && (
        <div className="card-head fade-in" style={{ borderTop: "1px solid var(--line)", borderBottom: "none", background: "var(--ok-soft)" }}>
          <Icon name="gauge" size={20} style={{ color: "var(--green-strong)" }} />
          <div style={{ flex: 1 }}><span className="strong">{window.t('ver_score')}</span> <span className="muted small">· {window.t('ver_score_sub')}</span></div>
          <Badge tone="green" dot>{window.t('ver_approved')}</Badge>
        </div>
      )}
    </Card>
  );
}

/* ---- Step 5: Halal Offer ---- */
function HalalOffer() {
  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 18 }}>
      <Card style={{ overflow: "hidden", boxShadow: "var(--sh-md)" }}>
        <div style={{ padding: "18px 24px", background: "var(--ink)", color: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
          <Icon name="shieldCheck" size={22} style={{ color: "var(--green)" }} />
          <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 16 }}>{window.t('offer_title')}</div><div className="tiny" style={{ color: "oklch(0.8 0.02 248)" }}>{window.t('offer_struct')} · {f.id}</div></div>
          <Badge tone="green" icon="check">{window.t('offer_no_interest')}</Badge>
        </div>
        <div style={{ padding: "8px 24px 4px" }}>
          <div className="offer-line"><span className="ol-label muted">{window.t('offer_invoice')}</span><span className="ol-val num" style={{ fontSize: 18 }}>{D.fmt(f.invoice)}</span></div>
          <div className="offer-line" style={{ background: "var(--green-soft)", margin: "0 -24px", padding: "18px 24px", borderRadius: 0 }}>
            <div><div className="ol-label strong" style={{ color: "var(--green-deep)" }}>{window.t('offer_qard')}</div><div className="tiny muted">{window.t('offer_qard_sub')}</div></div>
            <span className="ol-val num" style={{ fontSize: 30, color: "var(--green-strong)" }}>{D.fmt(f.advance)}</span>
          </div>
          <div className="offer-line"><div><span className="ol-label">{window.t('offer_fee_label')}</span><div className="tiny muted">{window.t('offer_fee_sub')}</div></div><span className="ol-val num">{D.fmt(f.fee)}</span></div>
          <div className="offer-line"><div><span className="ol-label">{window.t('offer_reserve_label')}</span><div className="tiny muted">{window.t('offer_reserve_sub')}</div></div><span className="ol-val num">{D.fmt(f.reserve)}</span></div>
          <div className="offer-line"><span className="ol-label strong">{window.t('offer_settlement')}</span><span className="ol-val num strong" style={{ color: "var(--green-strong)" }}>{D.fmt(f.reserve)}</span></div>
        </div>
        <div className="row wrap" style={{ gap: 18, padding: "16px 24px", borderTop: "1px solid var(--line)", background: "var(--surface-sunken)" }}>
          {[window.t('offer_no_interest'), window.t('offer_no_compound'), window.t('offer_no_discount')].map(feat => (
            <div key={feat} className="row" style={{ gap: 7 }}><div className="check-ico ok" style={{ width: 20, height: 20 }}><Icon name="check" size={12} /></div><span className="small strong">{feat}</span></div>
          ))}
        </div>
      </Card>
      <div className="row" style={{ gap: 10, padding: "12px 16px", background: "var(--info-soft)", borderRadius: "var(--r-sm)", border: "1px solid color-mix(in oklch, var(--info) 25%, var(--line))" }}>
        <Icon name="info" size={17} style={{ color: "oklch(0.5 0.11 245)" }} />
        <span className="small">{window.t('offer_info').replace('{0}', D.fmt(f.advance)).replace('{1}', f.broker).replace('{2}', D.fmt(f.invoice)).replace('{3}', D.fmt(f.fee)).replace('{4}', D.fmt(f.reserve))}</span>
      </div>
    </div>
  );
}

/* ---- Step 6: Agreement ---- */
function Agreement({ signed, setSigned }) {
  const AGREEMENTS = [
    ["Wakalah Agency Agreement", "Appoints the platform as your agent (Wakil) to administer and collect the invoice.", "scale"],
    ["Qard Hasan Advance Agreement", "Benevolent advance terms — repayable from broker payment, no markup or interest.", "handshake"],
    ["Payment Assignment Instruction", "Directs the broker to remit payment to the platform settlement account.", "route"],
    ["Fee Disclosure", "Itemizes the fixed Wakalah service fee of $150 — no other charges.", "receipt"],
    ["Shariah Compliance Summary", "Confirms the structure has been reviewed and approved by the Shariah board.", "shieldCheck"],
  ];
  const [open, setOpen] = useState(null);
  return (
    <Card pad>
      <h3 style={{ fontSize: 18, marginBottom: 4 }}>{window.t('agr_title')}</h3>
      <p className="muted small" style={{ marginBottom: 18 }}>{window.t('agr_sub')}</p>
      <div className="stack" style={{ gap: 10 }}>
        {AGREEMENTS.map(([agrTitle, d, ic], i) => (
          <div key={agrTitle} className="card" style={{ borderColor: "var(--line-2)" }}>
            <div className="row" style={{ gap: 13, padding: 15, cursor: "pointer" }} onClick={() => setOpen(open === i ? null : i)}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--green-soft)", color: "var(--green-strong)", display: "grid", placeItems: "center", flex: "0 0 auto" }}><Icon name={ic} size={18} /></div>
              <div style={{ flex: 1 }}><div className="strong" style={{ fontSize: 14 }}>{agrTitle}</div><div className="tiny muted">{d}</div></div>
              <Badge tone="gray" dot>{window.t('agr_ready')}</Badge>
              <Icon name="chevronDown" size={16} style={{ color: "var(--ink-4)", transform: open === i ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
            </div>
            {open === i && <div className="fade-in" style={{ padding: "0 15px 15px 66px" }}><DocThumb label={"document preview · " + agrTitle} h={90} /></div>}
          </div>
        ))}
      </div>
      <div className="row" style={{ gap: 12, marginTop: 18, padding: 16, border: "1.5px solid " + (signed ? "var(--green)" : "var(--line-2)"), borderRadius: "var(--r-md)", background: signed ? "var(--green-soft)" : "var(--surface)", cursor: "pointer" }} onClick={() => setSigned(s => !s)}>
        <div style={{ width: 22, height: 22, borderRadius: 6, border: "2px solid " + (signed ? "var(--green-strong)" : "var(--line-strong)"), background: signed ? "var(--green-strong)" : "transparent", display: "grid", placeItems: "center", flex: "0 0 auto" }}>{signed && <Icon name="check" size={14} style={{ color: "#fff" }} />}</div>
        <div><div className="small strong">{window.t('agr_sign')}</div><div className="tiny muted">{window.t('agr_sign_sub').replace('{0}', new Date().toLocaleDateString())}</div></div>
      </div>
    </Card>
  );
}

/* ---- Step 7: Confirmation ---- */
function Confirmation({ nav }) {
  const steps = [
    ["check", window.t('conf_s1'), window.t('conf_s1d')],
    ["wallet", window.t('conf_s2'), window.t('conf_s2d')],
    ["route", window.t('conf_s3'), window.t('conf_s3d')],
    ["chart", window.t('conf_s4'), window.t('conf_s4d')],
  ];
  return (
    <div className="center fade-up" style={{ maxWidth: 620, margin: "20px auto", textAlign: "center" }}>
      <div style={{ width: 86, height: 86, borderRadius: 99, background: "var(--green-soft)", border: "1px solid var(--green-line)", display: "grid", placeItems: "center", margin: "0 auto 8px" }}>
        <div style={{ width: 58, height: 58, borderRadius: 99, background: "var(--green-strong)", display: "grid", placeItems: "center" }}><Icon name="check" size={30} style={{ color: "#fff" }} /></div>
      </div>
      <h1 style={{ fontSize: 30, marginTop: 18 }}>{window.t('conf_title')}</h1>
      <p className="lead" style={{ margin: "12px auto 0", maxWidth: 460 }}>{window.t('conf_sub').replace('{0}', D.fmt(f.advance))}</p>
      <Card style={{ margin: "28px 0", textAlign: "left", overflow: "hidden" }}>
        {steps.map(([ic, confTitle, d], i, arr) => (
          <div key={confTitle} className="row" style={{ gap: 13, padding: "15px 22px", borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : "none" }}>
            <div className="check-ico ok" style={{ width: 30, height: 30 }}><Icon name={ic} size={15} /></div>
            <div><div className="strong" style={{ fontSize: 14 }}>{confTitle}</div><div className="tiny muted">{d}</div></div>
          </div>
        ))}
      </Card>
      <div className="row" style={{ gap: 12, justifyContent: "center" }}>
        <Btn kind="ghost" icon="dashboard" onClick={() => nav("carrier/dashboard")}>{window.t('btn_back_dash')}</Btn>
        <Btn kind="primary" iconRight="arrowRight" onClick={() => nav("carrier/request-detail", { id: f.id })}>{window.t('btn_view_detail')}</Btn>
      </div>
    </div>
  );
}

/* ============================================================
   Request Detail
   ============================================================ */
function RequestDetail({ nav, params }) {
  const TIMELINE = [
    window.t('rd_tl1'), window.t('rd_tl2'), window.t('rd_tl3'),
    window.t('rd_tl4'), window.t('rd_tl5'), window.t('rd_tl6'), window.t('rd_tl7'),
  ];
  const cur = 4; // Funded
  const b = D.brokers[f.brokerKey];
  return (
    <div>
      <PageHead title={f.id}
        crumb={<div className="crumb"><span className="lnk" onClick={() => nav("carrier/dashboard")}>Dashboard</span><span className="sep">/</span><span>{params?.id || f.id}</span></div>}
        sub={`${f.pickup} → ${f.delivery} · ${f.broker}`}
        actions={<><StatusBadge status="Funded" /><Btn kind="ghost" icon="download">{window.t('btn_documents')}</Btn></>} />

      {/* timeline */}
      <Card pad style={{ marginBottom: 18 }}>
        <div className="row wrap" style={{ justifyContent: "space-between", gap: 8 }}>
          {TIMELINE.map((tlLabel, i) => (
            <div key={tlLabel} className="stack" style={{ alignItems: "center", gap: 8, flex: 1, minWidth: 90, position: "relative" }}>
              {i < TIMELINE.length - 1 && <div style={{ position: "absolute", top: 15, left: "calc(50% + 18px)", right: "calc(-50% + 18px)", height: 2, background: i < cur ? "var(--green-strong)" : "var(--line-2)" }} />}
              <div className="step-dot" style={{ position: "relative", zIndex: 1, ...(i < cur ? { background: "var(--green-strong)", borderColor: "var(--green-strong)", color: "#fff" } : i === cur ? { borderColor: "var(--green-strong)", color: "var(--green-deep)", boxShadow: "0 0 0 4px var(--green-soft)" } : {}) }}>
                {i < cur ? <Icon name="check" size={15} /> : i + 1}
              </div>
              <div className="tiny center" style={{ fontWeight: 600, color: i <= cur ? "var(--ink)" : "var(--ink-4)" }}>{tlLabel}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid" style={{ gridTemplateColumns: "1fr 340px" }}>
        <div className="stack" style={{ gap: 18 }}>
          {/* invoice summary */}
          <Card>
            <CardHead icon="receipt" title={window.t('rd_invoice_sum')} right={<Badge tone="green" dot>Score {f.score}/100</Badge>} />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <div className="grid g-2" style={{ gap: 0, columnGap: 28 }}>
                <div><KV k={window.t('kv_load')} v={<span className="mono">{f.load}</span>} /><KV k={window.t('kv_pickup')} v={`${f.pickup} · ${f.pickupDate}`} /><KV k={window.t('kv_delivery')} v={`${f.delivery} · ${f.deliveryDate}`} /><KV k={window.t('kv_terms')} v={f.terms} /></div>
                <div><KV k={window.t('kv_invoice_amt')} v={<span className="mono num strong">{D.fmt(f.invoice)}</span>} /><KV k={window.t('kv_bol')} v={<span className="mono">{f.bol}</span>} /><KV k={window.t('kv_pod')} v={<Badge tone="green" icon="check">{window.t('pod_detected')}</Badge>} /><KV k={window.t('kv_submitted')} v={f.submitted} /></div>
              </div>
            </div>
          </Card>

          {/* verification checklist */}
          <Card>
            <CardHead icon="shieldCheck" title={window.t('rd_verify')} right={<Badge tone="green" icon="check">{window.t('rd_verify_all')}</Badge>} />
            <div className="card-pad" style={{ paddingTop: 4, paddingBottom: 8 }}>
              {D.verifyChecks.map(c => <CheckRow key={c.label} {...c} />)}
            </div>
          </Card>

          {/* documents */}
          <Card>
            <CardHead icon="layers" title={window.t('rd_docs')} />
            <div className="card-pad">
              <div className="grid g-4" style={{ gap: 12 }}>
                {["Invoice", "Rate Conf", "Bill of Lading", "Proof of Delivery"].map(docLabel => (
                  <div key={docLabel}><DocThumb label="PDF" h={84} /><div className="tiny strong center" style={{ marginTop: 6 }}>{docLabel}</div></div>
                ))}
              </div>
            </div>
          </Card>

          {/* halal contract summary */}
          <Card style={{ borderColor: "var(--green-line)" }}>
            <CardHead icon="scale" title={window.t('rd_halal')} sub={window.t('rd_halal_sub')} />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <div className="offer-line"><span className="ol-label muted">{window.t('kv_invoice_amt')}</span><span className="ol-val num">{D.fmt(f.invoice)}</span></div>
              <div className="offer-line"><span className="ol-label">{window.t('kv_qard')}</span><span className="ol-val num strong" style={{ color: "var(--green-strong)" }}>{D.fmt(f.advance)}</span></div>
              <div className="offer-line"><span className="ol-label">{window.t('kv_wakalah_fee')}</span><span className="ol-val num">{D.fmt(f.fee)}</span></div>
              <div className="offer-line"><span className="ol-label">{window.t('kv_reserve')}</span><span className="ol-val num">{D.fmt(f.reserve)}</span></div>
            </div>
          </Card>
        </div>

        {/* right column */}
        <div className="stack" style={{ gap: 18 }}>
          <Card pad><div className="center"><RiskGauge score={f.score} /></div></Card>

          <Card>
            <CardHead icon="building" title={window.t('rd_broker')} />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <div className="strong" style={{ fontSize: 14 }}>{b.name}</div>
              <div className="tiny muted mono" style={{ marginBottom: 8 }}>{b.mc}</div>
              <KV k={window.t('kv_avg_days')} v={b.avgDays + " days"} />
              <KV k={window.t('kv_on_time')} v={b.onTime + "%"} />
              <KV k={window.t('kv_credit')} v={<Badge tone={b.creditTone} dot>{b.credit}</Badge>} />
            </div>
          </Card>

          <Card>
            <CardHead icon="wallet" title={window.t('rd_payout')} />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <KV k={window.t('kv_method')} v="Same-Day ACH" />
              <KV k={window.t('kv_account_kv')} v={<span className="mono">•••• 4821</span>} />
              <KV k={window.t('kv_amount')} v={<span className="mono num strong" style={{ color: "var(--green-strong)" }}>{D.fmt(f.advance)}</span>} />
              <KV k={window.t('tbl_status')} v={<Badge tone="blue" dot>Funded Jun 06</Badge>} />
            </div>
          </Card>

          <Card>
            <CardHead icon="handshake" title={window.t('rd_settle')} />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <KV k={window.t('kv_broker_due')} v={f.terms + " · Jul 05"} />
              <KV k={window.t('kv_reserve_to')} v={<span className="mono num">{D.fmt(f.reserve)}</span>} />
              <KV k={window.t('tbl_status')} v={<Badge tone="gray" dot>{window.t('awaiting_broker')}</Badge>} />
            </div>
          </Card>
        </div>
      </div>
      <style>{`@media(max-width:980px){ .portal-body .grid[style*="340px"]{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}

window.FundingWizard = FundingWizard;
window.RequestDetail = RequestDetail;
})();
