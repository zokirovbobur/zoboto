/* ============================================================
   New Funding Request — 7-step wizard + Request detail
   ============================================================ */
(function () {
const { useState, useEffect } = React;
const { PageHead, Stat, Card, CardHead, Btn, Badge, StatusBadge, Icon,
  Steps, CheckRow, Field, Confidence, RiskGauge, KV, DocThumb, useToast } = window;
const D = window.HFF_DATA;
const f = D.featured;

const WIZ = ["Load Details", "Documents", "Extraction", "Verification", "Halal Offer", "Agreement", "Done"];

function FundingWizard({ nav }) {
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
      <PageHead title="New Funding Request"
        crumb={<div className="crumb"><span className="lnk" onClick={() => nav("carrier/dashboard")}>Dashboard</span><span className="sep">/</span><span>New Funding Request</span></div>}
        actions={step < 6 && <Btn kind="quiet" icon="x" onClick={() => nav("carrier/dashboard")}>Cancel</Btn>} />

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
              <Btn kind="ghost" icon="arrowLeft" disabled={step === 0} onClick={back}>Back</Btn>
              {step === 4
                ? <Btn kind="primary" size="lg" icon="check" onClick={next}>Accept Halal Offer</Btn>
                : step === 5
                ? <Btn kind="primary" size="lg" icon="sign" disabled={!signed} onClick={() => { toast("Request submitted for funding"); next(); }}>E-sign and Submit for Funding</Btn>
                : <Btn kind="primary" iconRight="arrowRight" disabled={!canContinue} onClick={next}>Continue</Btn>}
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
        <div className="small strong" style={{ marginBottom: 12 }}>Request summary</div>
        <KV k="Broker" v={f.broker.split(" ")[0]} />
        <KV k="Lane" v={<span className="small">{f.pickup} → {f.delivery}</span>} />
        <KV k="Invoice" v={<span className="mono num strong">{D.fmt(f.invoice)}</span>} />
        <KV k="Documents" v={`${docCount}/5 uploaded`} />
        {step >= 4 && <KV k="Advance" v={<span className="mono num strong" style={{ color: "var(--green-strong)" }}>{D.fmt(f.advance)}</span>} />}
      </Card>
      <Card pad style={{ background: "var(--green-soft)", borderColor: "var(--green-line)" }}>
        <div className="row" style={{ gap: 8 }}><Icon name="shieldCheck" size={16} style={{ color: "var(--green-strong)" }} /><span className="small strong" style={{ color: "var(--green-deep)" }}>Halal by design</span></div>
        <p className="tiny" style={{ marginTop: 8, lineHeight: 1.6, color: "var(--green-deep)" }}>No interest. No discount rate. Just a fixed Wakalah fee disclosed before you sign.</p>
      </Card>
    </div>
  );
}

/* ---- Step 1: Load Details ---- */
function LoadDetails() {
  return (
    <Card pad>
      <h3 style={{ fontSize: 18, marginBottom: 4 }}>Load details</h3>
      <p className="muted small" style={{ marginBottom: 18 }}>Enter the details of your completed load.</p>
      <div className="stack" style={{ gap: 16 }}>
        <div className="grid g-2">
          <Field label="Load number" req><input className="input mono" defaultValue="LD-77-3920" /></Field>
          <Field label="Broker / shipper name" req><input className="input" defaultValue="NorthBridge Freight Brokers" /></Field>
        </div>
        <div className="grid g-2">
          <Field label="Pickup location" req><input className="input" defaultValue="Dallas, TX" /></Field>
          <Field label="Delivery location" req><input className="input" defaultValue="Memphis, TN" /></Field>
        </div>
        <div className="grid g-2">
          <Field label="Pickup date" req><input className="input" type="date" defaultValue="2026-06-02" /></Field>
          <Field label="Delivery date" req><input className="input" type="date" defaultValue="2026-06-05" /></Field>
        </div>
        <div className="grid g-2">
          <Field label="Invoice amount" req prefix="$"><input className="input mono" defaultValue="5,000.00" /></Field>
          <Field label="Payment terms" req><select className="select" defaultValue="Net 30"><option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option></select></Field>
        </div>
      </div>
    </Card>
  );
}

/* ---- Step 2: Upload Documents ---- */
const DOC_DEFS = [
  ["invoice", "Invoice", "doc", true], ["rate", "Rate Confirmation", "receipt", true],
  ["bol", "Bill of Lading", "file", true], ["pod", "Proof of Delivery", "sign", true],
  ["gps", "GPS / ELD route data", "route", false],
];
function UploadDocs({ docs, setDocs }) {
  return (
    <Card pad>
      <h3 style={{ fontSize: 18, marginBottom: 4 }}>Upload documents</h3>
      <p className="muted small" style={{ marginBottom: 18 }}>Required documents marked with <span style={{ color: "var(--danger)" }}>*</span>. Click to simulate upload.</p>
      <div className="grid g-2">
        {DOC_DEFS.map(([k, label, ic, req]) => (
          <div key={k} className={"upload " + (docs[k] ? "done" : "")} onClick={() => setDocs(d => ({ ...d, [k]: !d[k] }))} style={{ padding: 18 }}>
            {docs[k] ? (
              <div className="row" style={{ gap: 12 }}>
                <div className="check-ico ok" style={{ width: 34, height: 34 }}><Icon name="check" size={17} /></div>
                <div style={{ flex: 1 }}><div className="small strong">{label}</div><div className="tiny muted mono">{k}-LD773920.pdf</div></div>
                <Badge tone="green" dot>Uploaded</Badge>
              </div>
            ) : (
              <div className="row" style={{ gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--surface)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", color: "var(--green-strong)" }}><Icon name={ic} size={17} /></div>
                <div style={{ flex: 1 }}><div className="small strong">{label} {req ? <span style={{ color: "var(--danger)" }}>*</span> : <span className="tiny muted">(optional)</span>}</div><div className="tiny muted">Click to upload</div></div>
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
      <CardHead icon="sparkle" title="Automated document extraction" sub="OCR reading your uploaded documents"
        right={finished ? <Badge tone="green" icon="check">Complete</Badge> : <Badge tone="blue" dot>Scanning…</Badge>} />
      <div className="card-pad">
        <table className="tbl" style={{ marginTop: -8 }}>
          <thead><tr><th>Field</th><th>Extracted value</th><th className="right">Confidence</th></tr></thead>
          <tbody>
            {D.docExtract.map((row, i) => (
              <tr key={row.field} style={{ opacity: i < done ? 1 : 0.35, transition: "opacity .3s" }}>
                <td className="muted">{row.field}</td>
                <td className="strong">{i < done ? row.value : <span className="muted">reading…</span>}</td>
                <td className="right">{i < done ? <Confidence value={row.conf} /> : <span className="tiny muted">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {finished && (
          <div className="row fade-in" style={{ gap: 10, padding: "12px 14px", background: "var(--ok-soft)", borderRadius: "var(--r-sm)", border: "1px solid var(--green-line)", marginTop: 16 }}>
            <Icon name="checkCircle" size={18} style={{ color: "var(--green-strong)" }} />
            <span className="small">All fields extracted. Average confidence <strong>95%</strong> — proceeding to verification.</span>
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
      <CardHead icon="shieldCheck" title="Verification result" sub="Cross-checking documents, carrier, broker and route"
        right={finished ? <Badge tone="green" icon="check">All checks passed</Badge> : <Badge tone="blue" dot>Verifying…</Badge>} />
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
          <div style={{ flex: 1 }}><span className="strong">Risk score: 84 / 100</span> <span className="muted small">· Low risk — eligible for instant halal offer</span></div>
          <Badge tone="green" dot>Approved for offer</Badge>
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
          <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 16 }}>Your Halal Offer</div><div className="tiny" style={{ color: "oklch(0.8 0.02 248)" }}>Wakalah + Qard Hasan structure · {f.id}</div></div>
          <Badge tone="green" icon="check">No interest</Badge>
        </div>
        <div style={{ padding: "8px 24px 4px" }}>
          <div className="offer-line"><span className="ol-label muted">Invoice amount</span><span className="ol-val num" style={{ fontSize: 18 }}>{D.fmt(f.invoice)}</span></div>
          <div className="offer-line" style={{ background: "var(--green-soft)", margin: "0 -24px", padding: "18px 24px", borderRadius: 0 }}>
            <div><div className="ol-label strong" style={{ color: "var(--green-deep)" }}>Qard Hasan Advance</div><div className="tiny muted">Benevolent advance — paid to you now, no markup</div></div>
            <span className="ol-val num" style={{ fontSize: 30, color: "var(--green-strong)" }}>{D.fmt(f.advance)}</span>
          </div>
          <div className="offer-line"><div><span className="ol-label">Fixed Wakalah fee</span><div className="tiny muted">Flat agency service fee — agreed up front</div></div><span className="ol-val num">{D.fmt(f.fee)}</span></div>
          <div className="offer-line"><div><span className="ol-label">Reserve balance</span><div className="tiny muted">Released to you after broker settlement</div></div><span className="ol-val num">{D.fmt(f.reserve)}</span></div>
          <div className="offer-line"><span className="ol-label strong">Estimated settlement to you after broker pays</span><span className="ol-val num strong" style={{ color: "var(--green-strong)" }}>{D.fmt(f.reserve)}</span></div>
        </div>
        <div className="row wrap" style={{ gap: 18, padding: "16px 24px", borderTop: "1px solid var(--line)", background: "var(--surface-sunken)" }}>
          {["No interest", "No daily compounding", "No hidden discount rate"].map(t => (
            <div key={t} className="row" style={{ gap: 7 }}><div className="check-ico ok" style={{ width: 20, height: 20 }}><Icon name="check" size={12} /></div><span className="small strong">{t}</span></div>
          ))}
        </div>
      </Card>
      <div className="row" style={{ gap: 10, padding: "12px 16px", background: "var(--info-soft)", borderRadius: "var(--r-sm)", border: "1px solid color-mix(in oklch, var(--info) 25%, var(--line))" }}>
        <Icon name="info" size={17} style={{ color: "oklch(0.5 0.11 245)" }} />
        <span className="small">You receive <strong>{D.fmt(f.advance)}</strong> today. When {f.broker} pays the <strong>{D.fmt(f.invoice)}</strong> invoice, we keep the <strong>{D.fmt(f.fee)}</strong> Wakalah fee and release the <strong>{D.fmt(f.reserve)}</strong> reserve to you.</span>
      </div>
    </div>
  );
}

/* ---- Step 6: Agreement ---- */
const AGREEMENTS = [
  ["Wakalah Agency Agreement", "Appoints the platform as your agent (Wakil) to administer and collect the invoice.", "scale"],
  ["Qard Hasan Advance Agreement", "Benevolent advance terms — repayable from broker payment, no markup or interest.", "handshake"],
  ["Payment Assignment Instruction", "Directs the broker to remit payment to the platform settlement account.", "route"],
  ["Fee Disclosure", "Itemizes the fixed Wakalah service fee of $150 — no other charges.", "receipt"],
  ["Shariah Compliance Summary", "Confirms the structure has been reviewed and approved by the Shariah board.", "shieldCheck"],
];
function Agreement({ signed, setSigned }) {
  const [open, setOpen] = useState(null);
  return (
    <Card pad>
      <h3 style={{ fontSize: 18, marginBottom: 4 }}>Agreement & e-sign</h3>
      <p className="muted small" style={{ marginBottom: 18 }}>Review each document, then sign to submit for funding.</p>
      <div className="stack" style={{ gap: 10 }}>
        {AGREEMENTS.map(([t, d, ic], i) => (
          <div key={t} className="card" style={{ borderColor: "var(--line-2)" }}>
            <div className="row" style={{ gap: 13, padding: 15, cursor: "pointer" }} onClick={() => setOpen(open === i ? null : i)}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--green-soft)", color: "var(--green-strong)", display: "grid", placeItems: "center", flex: "0 0 auto" }}><Icon name={ic} size={18} /></div>
              <div style={{ flex: 1 }}><div className="strong" style={{ fontSize: 14 }}>{t}</div><div className="tiny muted">{d}</div></div>
              <Badge tone="gray" dot>Ready</Badge>
              <Icon name="chevronDown" size={16} style={{ color: "var(--ink-4)", transform: open === i ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
            </div>
            {open === i && <div className="fade-in" style={{ padding: "0 15px 15px 66px" }}><DocThumb label={"document preview · " + t} h={90} /></div>}
          </div>
        ))}
      </div>
      <div className="row" style={{ gap: 12, marginTop: 18, padding: 16, border: "1.5px solid " + (signed ? "var(--green)" : "var(--line-2)"), borderRadius: "var(--r-md)", background: signed ? "var(--green-soft)" : "var(--surface)", cursor: "pointer" }} onClick={() => setSigned(s => !s)}>
        <div style={{ width: 22, height: 22, borderRadius: 6, border: "2px solid " + (signed ? "var(--green-strong)" : "var(--line-strong)"), background: signed ? "var(--green-strong)" : "transparent", display: "grid", placeItems: "center", flex: "0 0 auto" }}>{signed && <Icon name="check" size={14} style={{ color: "#fff" }} />}</div>
        <div><div className="small strong">I, Ali Karimov, agree to and electronically sign all five documents above.</div><div className="tiny muted">Signed with a legally binding e-signature · {new Date().toLocaleDateString()}</div></div>
      </div>
    </Card>
  );
}

/* ---- Step 7: Confirmation ---- */
function Confirmation({ nav }) {
  return (
    <div className="center fade-up" style={{ maxWidth: 620, margin: "20px auto", textAlign: "center" }}>
      <div style={{ width: 86, height: 86, borderRadius: 99, background: "var(--green-soft)", border: "1px solid var(--green-line)", display: "grid", placeItems: "center", margin: "0 auto 8px" }}>
        <div style={{ width: 58, height: 58, borderRadius: 99, background: "var(--green-strong)", display: "grid", placeItems: "center" }}><Icon name="check" size={30} style={{ color: "#fff" }} /></div>
      </div>
      <h1 style={{ fontSize: 30, marginTop: 18 }}>Request approved & funding scheduled</h1>
      <p className="lead" style={{ margin: "12px auto 0", maxWidth: 460 }}>Your Qard Hasan advance of <strong style={{ color: "var(--green-strong)" }}>{D.fmt(f.advance)}</strong> is on its way.</p>
      <Card style={{ margin: "28px 0", textAlign: "left", overflow: "hidden" }}>
        {[["check", "Request approved", "Risk score 84/100 — Low risk"], ["wallet", "Advance scheduled", "Same-Day ACH to •••• 4821 · arrives by 5pm ET"], ["route", "Broker payment instruction sent", "NorthBridge directed to remit to settlement account"], ["chart", "Track status in your dashboard", "Follow this request from funded through settlement"]].map(([ic, t, d], i, arr) => (
          <div key={t} className="row" style={{ gap: 13, padding: "15px 22px", borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : "none" }}>
            <div className="check-ico ok" style={{ width: 30, height: 30 }}><Icon name={ic} size={15} /></div>
            <div><div className="strong" style={{ fontSize: 14 }}>{t}</div><div className="tiny muted">{d}</div></div>
          </div>
        ))}
      </Card>
      <div className="row" style={{ gap: 12, justifyContent: "center" }}>
        <Btn kind="ghost" icon="dashboard" onClick={() => nav("carrier/dashboard")}>Back to dashboard</Btn>
        <Btn kind="primary" iconRight="arrowRight" onClick={() => nav("carrier/request-detail", { id: f.id })}>View request detail</Btn>
      </div>
    </div>
  );
}

/* ============================================================
   Request Detail
   ============================================================ */
const TIMELINE = ["Submitted", "Verified", "Approved", "Agreement Signed", "Funded", "Broker Paid", "Settled"];
function RequestDetail({ nav, params }) {
  const cur = 4; // Funded
  const b = D.brokers[f.brokerKey];
  return (
    <div>
      <PageHead title={f.id}
        crumb={<div className="crumb"><span className="lnk" onClick={() => nav("carrier/dashboard")}>Dashboard</span><span className="sep">/</span><span>{params?.id || f.id}</span></div>}
        sub={`${f.pickup} → ${f.delivery} · ${f.broker}`}
        actions={<><StatusBadge status="Funded" /><Btn kind="ghost" icon="download">Documents</Btn></>} />

      {/* timeline */}
      <Card pad style={{ marginBottom: 18 }}>
        <div className="row wrap" style={{ justifyContent: "space-between", gap: 8 }}>
          {TIMELINE.map((t, i) => (
            <div key={t} className="stack" style={{ alignItems: "center", gap: 8, flex: 1, minWidth: 90, position: "relative" }}>
              {i < TIMELINE.length - 1 && <div style={{ position: "absolute", top: 15, left: "calc(50% + 18px)", right: "calc(-50% + 18px)", height: 2, background: i < cur ? "var(--green-strong)" : "var(--line-2)" }} />}
              <div className="step-dot" style={{ position: "relative", zIndex: 1, ...(i < cur ? { background: "var(--green-strong)", borderColor: "var(--green-strong)", color: "#fff" } : i === cur ? { borderColor: "var(--green-strong)", color: "var(--green-deep)", boxShadow: "0 0 0 4px var(--green-soft)" } : {}) }}>
                {i < cur ? <Icon name="check" size={15} /> : i + 1}
              </div>
              <div className="tiny center" style={{ fontWeight: 600, color: i <= cur ? "var(--ink)" : "var(--ink-4)" }}>{t}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid" style={{ gridTemplateColumns: "1fr 340px" }}>
        <div className="stack" style={{ gap: 18 }}>
          {/* invoice summary */}
          <Card>
            <CardHead icon="receipt" title="Invoice summary" right={<Badge tone="green" dot>Score {f.score}/100</Badge>} />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <div className="grid g-2" style={{ gap: 0, columnGap: 28 }}>
                <div><KV k="Load number" v={<span className="mono">{f.load}</span>} /><KV k="Pickup" v={`${f.pickup} · ${f.pickupDate}`} /><KV k="Delivery" v={`${f.delivery} · ${f.deliveryDate}`} /><KV k="Payment terms" v={f.terms} /></div>
                <div><KV k="Invoice amount" v={<span className="mono num strong">{D.fmt(f.invoice)}</span>} /><KV k="BOL number" v={<span className="mono">{f.bol}</span>} /><KV k="POD" v={<Badge tone="green" icon="check">Detected</Badge>} /><KV k="Submitted" v={f.submitted} /></div>
              </div>
            </div>
          </Card>

          {/* verification checklist */}
          <Card>
            <CardHead icon="shieldCheck" title="Verification checklist" right={<Badge tone="green" icon="check">All passed</Badge>} />
            <div className="card-pad" style={{ paddingTop: 4, paddingBottom: 8 }}>
              {D.verifyChecks.map(c => <CheckRow key={c.label} {...c} />)}
            </div>
          </Card>

          {/* documents */}
          <Card>
            <CardHead icon="layers" title="Uploaded documents" />
            <div className="card-pad">
              <div className="grid g-4" style={{ gap: 12 }}>
                {["Invoice", "Rate Conf", "Bill of Lading", "Proof of Delivery"].map(t => (
                  <div key={t}><DocThumb label="PDF" h={84} /><div className="tiny strong center" style={{ marginTop: 6 }}>{t}</div></div>
                ))}
              </div>
            </div>
          </Card>

          {/* halal contract summary */}
          <Card style={{ borderColor: "var(--green-line)" }}>
            <CardHead icon="scale" title="Halal contract summary" sub="Wakalah + Qard Hasan" />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <div className="offer-line"><span className="ol-label muted">Invoice amount</span><span className="ol-val num">{D.fmt(f.invoice)}</span></div>
              <div className="offer-line"><span className="ol-label">Qard Hasan advance</span><span className="ol-val num strong" style={{ color: "var(--green-strong)" }}>{D.fmt(f.advance)}</span></div>
              <div className="offer-line"><span className="ol-label">Fixed Wakalah fee</span><span className="ol-val num">{D.fmt(f.fee)}</span></div>
              <div className="offer-line"><span className="ol-label">Reserve (released at settlement)</span><span className="ol-val num">{D.fmt(f.reserve)}</span></div>
            </div>
          </Card>
        </div>

        {/* right column */}
        <div className="stack" style={{ gap: 18 }}>
          <Card pad><div className="center"><RiskGauge score={f.score} /></div></Card>

          <Card>
            <CardHead icon="building" title="Broker profile" />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <div className="strong" style={{ fontSize: 14 }}>{b.name}</div>
              <div className="tiny muted mono" style={{ marginBottom: 8 }}>{b.mc}</div>
              <KV k="Avg days to pay" v={b.avgDays + " days"} />
              <KV k="On-time rate" v={b.onTime + "%"} />
              <KV k="Credit risk" v={<Badge tone={b.creditTone} dot>{b.credit}</Badge>} />
            </div>
          </Card>

          <Card>
            <CardHead icon="wallet" title="Payout details" />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <KV k="Method" v="Same-Day ACH" />
              <KV k="Account" v={<span className="mono">•••• 4821</span>} />
              <KV k="Amount" v={<span className="mono num strong" style={{ color: "var(--green-strong)" }}>{D.fmt(f.advance)}</span>} />
              <KV k="Status" v={<Badge tone="blue" dot>Funded Jun 06</Badge>} />
            </div>
          </Card>

          <Card>
            <CardHead icon="handshake" title="Settlement" />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <KV k="Broker due" v={f.terms + " · Jul 05"} />
              <KV k="Reserve to release" v={<span className="mono num">{D.fmt(f.reserve)}</span>} />
              <KV k="Status" v={<Badge tone="gray" dot>Awaiting broker</Badge>} />
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
