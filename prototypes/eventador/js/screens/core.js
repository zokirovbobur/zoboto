/* ======================= src/screens/core.jsx ======================= */
/* CodeStudio bundles CodeMirror — load only when the modal is actually opened */

/* ---------------- Login ---------------- */
function Login() {
  const { setAuthed, toast } = useApp();
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const signIn = () => { setLoading(true); setTimeout(() => { setAuthed(true); toast('Welcome back, Ada'); }, 250); };
  return (
    <>
      <div className="demobar">Interactive mock prototype — mock API + localStorage, no backend (Vite + React)</div>
      <div className="login">
        <div className="loginbox">
          <div className="brand"><span className="dot" /> eventador</div>
          <p>Visual serverless platform — sign in to your workspace</p>
          <div className="sso">
            <Btn onClick={signIn}>Continue with SSO / OIDC</Btn>
            <Btn onClick={signIn}>Continue with SAML</Btn>
          </div>
          <div className="divider">or email</div>
          <div className="field"><label htmlFor="em">Email</label><input id="em" defaultValue="ada@acme.io" /></div>
          <div className="field">
            <label htmlFor="pw" style={{ display: 'flex' }}>
              Password <a href="#" onClick={(e) => { e.preventDefault(); toast('Reset email sent (mock)'); }} style={{ marginLeft: 'auto', fontSize: 12 }}>Forgot?</a>
            </label>
            <input id="pw" type="password" defaultValue="••••••••" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Toggle on={remember} onChange={setRemember} label="Remember me" />
            <span style={{ fontSize: 11, color: 'var(--faint)' }}>MFA enforced (TOTP/WebAuthn)</span>
          </div>
          <Btn kind="pri" disabled={loading} style={{ width: '100%', justifyContent: 'center', display: 'flex' }} onClick={signIn}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </Btn>
          <p style={{ marginTop: 16, fontSize: 11 }}>SSO/OIDC/SAML + email + MFA · workspace-scoped (dashboard §2 · ADR-0012/0013)</p>
        </div>
      </div>
    </>
  );
}

/* ---------------- Dashboard — live workspace overview ---------------- */
const RANGE = { '1h': 60, '24h': 1440, '7d': 10080, '30d': 43200, All: Infinity };
const greetingFor = (h) => h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

/* Lightweight deterministic mock so live numbers feel stable across refresh. */
const flowInvocationsToday = (flow) => {
  let h = 0;
  for (let i = 0; i < (flow.Flow || '').length; i++) h = ((h << 5) - h + flow.Flow.charCodeAt(i)) | 0;
  return Math.abs(h) % 30000 + (flow.State === 'live' ? 8000 : 200);
};

function Dashboard() {
  const nav = useNavigate();
  const { scope, db, openDrawer, setWorkspaceReadme, recentlyVisited } = useApp();
  const [range, setRange] = useState('24h');
  const [tab, setTab] = useState('over');
  /* First-time user: open the welcome tour. Banner can be dismissed and persists.
     We keep two flags: 'evd_onboarded' (tour was opened) and 'evd_onb_banner_dismissed'
     (the banner row itself was X'd out). */
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem('evd_onboarded'); } catch { return false; }
  });
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try { return !!localStorage.getItem('evd_onb_banner_dismissed'); } catch { return false; }
  });
  const dismissBanner = () => {
    try { localStorage.setItem('evd_onb_banner_dismissed', '1'); } catch { /* ignore */ }
    setBannerDismissed(true);
  };

  const ws = db.workspaces.find((w) => w.Workspace === scope.ws && w.Org === scope.org)
    || db.workspaces.find((w) => w.Workspace === scope.ws)
    || null;
  const editReadme = () => openDrawer({
    title: 'Edit workspace docs', sub: 'workspace ' + scope.ws,
    fields: [{ label: 'Readme', value: (ws && ws.readme) || '', type: 'textarea',
      help: 'Plain-text or markdown — describes the purpose, on-call, and conventions of this workspace.' }],
    saveLabel: 'Save docs',
    onSave: (v) => ws && setWorkspaceReadme(ws.id, v.Readme, 'Docs updated'),
  });

  /* ─── Derived workspace state ─── */
  const wsFlows = db.flows.filter((f) => f.Workspace === scope.ws);
  const live = wsFlows.filter((f) => f.State === 'live');
  const degraded = wsFlows.filter((f) => f.State === 'degraded');
  const dlq = db.dlq.filter((d) => d.Workspace === scope.ws);
  const deployments = db.deployments.filter((d) => d.Workspace === scope.ws);
  const rollingOut = deployments.filter((d) => d.Status === 'rolling out');
  const pendingInv = db.invitations.filter((i) => i.Status === 'invited');
  const pendingApproval = deployments.filter((d) => d.Status === 'pending approval');
  const inRange = db.audit.filter((a) => (a.agoMin ?? 0) <= RANGE[range]);
  const recent = inRange.slice(0, 7);
  const wsAudit = db.audit.filter((a) =>
    !scope.ws || (a.Target && String(a.Target).toLowerCase().includes(scope.ws.toLowerCase()))
    || !!wsFlows.find((f) => a.Target === f.Flow));

  /* ─── Live numbers (DB2): invocations today + active executions ─── */
  const invocationsToday = wsFlows.reduce((n, f) => n + flowInvocationsToday(f), 0);
  /* Active executions oscillate with the second hand so the dashboard feels alive. */
  const activeExecs = Math.max(0, Math.round(live.length * (1 + Math.sin(Date.now() / 5000) * 0.6)));
  /* ─── Context-aware quick actions (DB5) ─── */
  const quick = (() => {
    const out = [];
    if (degraded.length) out.push({ ic: '⚠', t: 'Investigate ' + degraded.length + ' degraded flow' + (degraded.length === 1 ? '' : 's'),
      d: 'Open Monitoring to inspect p95 + DLQ', go: '/monitoring', danger: true });
    if (dlq.length)      out.push({ ic: '↺', t: 'Replay ' + dlq.length + ' DLQ message' + (dlq.length === 1 ? '' : 's'),
      d: 'Inspect, batch replay, or discard', go: '/dlq', danger: true });
    if (pendingApproval.length) out.push({ ic: '✓', t: 'Approve ' + pendingApproval.length + ' deploy',
      d: 'Production deploys waiting for human approval', go: '/deployments', danger: true });
    if (pendingInv.length) out.push({ ic: '✉', t: pendingInv.length + ' invitation' + (pendingInv.length === 1 ? '' : 's'),
      d: 'Pending teammate join', go: '/users' });
    /* Fill with defaults to keep the grid balanced. */
    const defaults = [
      { ic: '⌗', t: 'New flow', d: 'Design a DAG in the visual editor', go: '/flows' },
      { ic: '▤', t: 'Deployments', d: 'Promote, roll back, reconcile', go: '/deployments' },
      { ic: '☰', t: 'Invite teammate', d: 'Add a user with a scoped role', go: '/users' },
      { ic: '⚿', t: 'Issue API key', d: 'Workspace key with rate limits', go: '/apikeys' },
    ];
    return [...out, ...defaults].slice(0, 4);
  })();

  /* ─── Needs-attention items ─── */
  const attention = [];
  degraded.forEach((f) => attention.push({
    dot: 'var(--danger)', t: `${f.Flow} is degraded`, s: `p95 ${f.p95} — check monitoring & DLQ`, cta: 'Investigate', go: '/monitoring',
  }));
  if (dlq.length) attention.push({
    dot: 'var(--warn)', t: 'DLQ backlog building', s: `${dlq.length} message${dlq.length === 1 ? '' : 's'} parked — replay needed`, cta: 'Replay', go: '/dlq',
  });
  rollingOut.forEach((d) => attention.push({
    dot: 'var(--info)', t: `${d.Flow} ${d.Version} is rolling out`, s: 'awaiting promote to 100%', cta: 'Review', go: '/deployments',
  }));
  if (pendingInv.length) attention.push({
    dot: 'var(--info)', t: `${pendingInv.length} invitation${pendingInv.length === 1 ? '' : 's'} pending`,
    s: pendingInv.slice(0, 3).map((i) => i.Email).join(' · '), cta: 'View', go: '/users',
  });

  /* ─── Top performers / problem flows (DB8) ─── */
  const flowsByInvocations = [...wsFlows]
    .map((f) => ({ ...f, invocations: flowInvocationsToday(f) }))
    .sort((a, b) => b.invocations - a.invocations);
  const topPerformers = flowsByInvocations.slice(0, 3);
  const p95Num = (f) => Number((f.p95 || '0').match(/\d+/)?.[0] || 0);
  const problemFlows = [...wsFlows]
    .filter((f) => f.State === 'degraded' || p95Num(f) > 200)
    .sort((a, b) => p95Num(b) - p95Num(a))
    .slice(0, 3);

  /* ─── Health summary chip (DB10) ─── */
  const healthIssues = degraded.length + dlq.length + pendingApproval.length;
  const healthChip = healthIssues === 0
    ? { color: 'var(--ok)',     bg: 'rgba(63,185,80,.12)',  txt: '✓ All systems healthy' }
    : healthIssues <= 2
    ? { color: 'var(--warn)',   bg: 'rgba(240,160,32,.12)', txt: '⚠ ' + healthIssues + ' issue' + (healthIssues === 1 ? '' : 's') + ' need attention' }
    : { color: 'var(--danger)', bg: 'rgba(220,80,80,.15)',  txt: '⚠ ' + healthIssues + ' active issues' };

  /* ─── Mock sparkline data — deterministic per workspace ─── */
  const seed = scope.ws.charCodeAt(0) || 0;
  const sparkLatency    = Array.from({ length: 14 }, (_, i) => 60 + Math.round(Math.sin((seed + i) * 0.7) * 20 + i * 1.5));
  const sparkThroughput = Array.from({ length: 14 }, (_, i) => 180 + Math.round(Math.cos((seed + i) * 0.5) * 60 + i * 8));
  const sparkInvocations= Array.from({ length: 14 }, (_, i) => 12000 + Math.round(Math.sin((seed + i) * 0.4) * 4000 + i * 200));

  /* ─── Greeting (DB1) ─── */
  const user = db.users.find((u) => u.Email === 'ada@acme.io') || db.users[0];
  const firstName = user ? (user.User || '').split(' ')[0] : 'there';
  const greeting = greetingFor(new Date().getHours()) + ', ' + (firstName || 'there');

  /* ─── Empty workspace hero (DB12) ─── */
  const isEmptyWorkspace = wsFlows.length === 0;

  return (
    <div>
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      {!bannerDismissed && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 8, fontSize: 12, color: 'var(--muted)',
        }}>
          <span>👋 New here?</span>
          <button type="button" onClick={() => setShowOnboarding(true)}
            style={{ background: 'transparent', border: 0, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
            Take the tour →
          </button>
          <span style={{ flex: 1 }} />
          <button type="button" onClick={dismissBanner} aria-label="Dismiss"
            style={{ background: 'transparent', border: 0, color: 'var(--faint)', cursor: 'pointer', padding: 2 }}>✕</button>
        </div>
      )}
      <PageHead crumb={<Crumb extra="Dashboard" />} title={greeting}
        desc={`Here's what's happening in ${scope.org} · ${scope.ws}.`}
        docref="dashboard §7 · arch §6 · MASTER-PLAN §13"
        actions={<>
          <select className="select" value={range} onChange={(e) => setRange(e.target.value)}
            aria-label="Activity range" title="Affects the Recent activity card only">
            {['1h', '24h', '7d', '30d', 'All'].map((r) => <option key={r} value={r}>{r === 'All' ? 'All time' : 'Last ' + r}</option>)}
          </select>
          <Btn kind="pri" onClick={() => nav('/flows')}>+ New Flow</Btn>
        </>} />
      <Tabs active={tab} onChange={setTab} tabs={[
        { k: 'over', t: 'Overview' },
        { k: 'docs', t: 'Docs' },
        { k: 'upd', t: `Updates (${wsAudit.length})` },
        /* Settings tab removed (DB6) — workspace Settings lives on its own page */
      ]} />

      {tab === 'docs' && (
        <Card title="Workspace docs" sub={ws ? ('owned by ' + ws.Owner) : 'no workspace selected'}>
          {ws && ws.readme
            ? <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit', fontSize: 13, lineHeight: 1.55 }}>{ws.readme}</pre>
            : <EmptyState icon="📄" title="No docs yet"
                sub="Describe the purpose, on-call rotation, conventions and runbooks of this workspace." />}
          <div style={{ marginTop: 14 }}>
            <Btn sm onClick={editReadme} disabled={!ws}>{ws && ws.readme ? 'Edit docs' : '+ Add docs'}</Btn>
          </div>
        </Card>
      )}
      {tab === 'upd' && (
        <Card title="Workspace updates" sub={`${wsAudit.length} event${wsAudit.length === 1 ? '' : 's'} touching ${scope.ws} · append-only (§16.9)`}>
          {wsAudit.length === 0
            ? <EmptyState icon="▦" title="No updates yet" sub="No audited events reference this workspace." />
            : wsAudit.slice(0, 50).map((r) => (
              <div className="attn" key={r.id}>
                <span className="a-main"><div className="a-t">{r.Action} · {r.Target}</div><div className="a-s">{r.Actor}</div></span>
                <span style={{ color: 'var(--faint)', fontSize: 12 }}>{r.Time}</span>
              </div>
            ))}
          <div style={{ marginTop: 12 }}><Btn sm onClick={() => nav('/audit')}>Full audit log →</Btn></div>
        </Card>
      )}

      {tab !== 'over' ? null : isEmptyWorkspace ? (
        /* DB12 — empty-workspace hero. A new workspace deserves a single big CTA,
           not a wall of zero metrics. */
        <Card title={'Welcome to ' + scope.ws + '!'} sub="this workspace has no flows yet">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 8px' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>≡</div>
            <h3 style={{ margin: 0 }}>Start with a flow</h3>
            <p style={{ marginTop: 8, color: 'var(--muted)', textAlign: 'center', maxWidth: 480 }}>
              A flow is a DAG of steps wired to a trigger. Pick a template (HTTP API, Kafka pipeline, Cron job, Webhook receiver) or start from a blank canvas.
            </p>
            <div className="flex" style={{ gap: 8, marginTop: 14 }}>
              <Btn kind="pri" onClick={() => nav('/flows')}>+ New Flow</Btn>
              <Btn onClick={() => setShowOnboarding(true)}>Take the tour</Btn>
            </div>
          </div>
        </Card>
      ) : (<>
        {/* DB10 — Health summary chip. Clickable when there are issues:
            scrolls down to the Needs-attention Card which has per-issue actions. */}
        {(() => {
          const clickable = healthIssues > 0;
          const onClick = () => {
            const el = document.getElementById('dash-needs-attention');
            if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          };
          const baseStyle = {
            padding: '10px 14px', marginBottom: 14, borderRadius: 8,
            background: healthChip.bg, border: '1px solid ' + healthChip.color,
            color: healthChip.color, fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', textAlign: 'left',
            cursor: clickable ? 'pointer' : 'default',
            transition: 'background .15s',
          };
          const Inner = (
            <>
              {healthChip.txt}
              {healthIssues > 0 && (
                <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontWeight: 400, fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {degraded.length > 0 && degraded.length + ' degraded'}
                  {degraded.length > 0 && (dlq.length || pendingApproval.length) ? ' · ' : ''}
                  {dlq.length > 0 && dlq.length + ' DLQ'}
                  {dlq.length > 0 && pendingApproval.length ? ' · ' : ''}
                  {pendingApproval.length > 0 && pendingApproval.length + ' awaiting approval'}
                  <span style={{ color: healthChip.color, fontWeight: 700 }}>→</span>
                </span>
              )}
            </>
          );
          return clickable
            ? <button type="button" onClick={onClick} style={baseStyle}
                title="Jump to the breakdown below">{Inner}</button>
            : <div style={baseStyle}>{Inner}</div>;
        })()}

        {/* DB5 — Context-aware quick actions */}
        <div className="qa-grid mb">
          {quick.map((q, i) => (
            <button className="qa" key={q.t + i} onClick={() => nav(q.go)}
              style={q.danger ? { borderLeft: '3px solid var(--danger)' } : null}>
              <span className="qa-ic" style={q.danger ? { color: 'var(--danger)' } : null}>{q.ic}</span>
              <span><span className="qa-t">{q.t}</span><div className="qa-d">{q.d}</div></span>
            </button>
          ))}
        </div>

        {/* DB2 — Live metrics row */}
        <div className="grid g4 mb">
          <Metric k="Active executions" v={String(activeExecs)} d="running right now" dk="up" />
          <Metric k="Invocations today" v={invocationsToday.toLocaleString()} d={live.length + ' live flow' + (live.length === 1 ? '' : 's')} dk="up" />
          <Metric k="DLQ depth" v={String(dlq.length)} d={dlq.length ? 'needs replay' : 'all clear'} dk={dlq.length ? 'flat' : 'up'} />
          <Metric k="Deployments" v={String(deployments.length)} d={rollingOut.length + ' rolling out'} dk="flat" />
        </div>

        {/* DB4 — Trend sparklines */}
        <div className="grid g3 mb">
          <Card title="Latency p95" sub="last 14d">
            <Spark data={sparkLatency} />
            <KV k="current">{sparkLatency[sparkLatency.length - 1]} ms</KV>
          </Card>
          <Card title="Throughput" sub="requests / second">
            <Spark data={sparkThroughput} />
            <KV k="current">{sparkThroughput[sparkThroughput.length - 1]} rps</KV>
          </Card>
          <Card title="Invocations" sub="daily volume">
            <Spark data={sparkInvocations} />
            <KV k="today">{invocationsToday.toLocaleString()}</KV>
          </Card>
        </div>

        {/* Needs attention + Active deployments */}
        <div className="grid g2 mb">
          <Card id="dash-needs-attention" title="Needs attention" sub={attention.length ? `${attention.length} item${attention.length === 1 ? '' : 's'} in ${scope.ws}` : 'workspace ' + scope.ws}>
            {attention.length === 0
              ? <EmptyState icon="✓" title="All clear" sub="No degraded flows, DLQ backlog or pending work in this workspace." />
              : attention.map((a, i) => (
                <div className="attn" key={a.t + i}>
                  <span className="a-dot" style={{ background: a.dot }} />
                  <span className="a-main"><div className="a-t">{a.t}</div><div className="a-s">{a.s}</div></span>
                  <Btn sm onClick={() => nav(a.go)}>{a.cta} →</Btn>
                </div>
              ))}
          </Card>
          <Card title="Active deployments" sub={`${scope.ws} · newest first`}>
            {deployments.length === 0
              ? <EmptyState icon="▤" title="No deployments yet" sub="Deploy a flow from the Designer to see it here." />
              : deployments.slice(0, 5).map((d) => (
                <div className="attn" key={d.id}>
                  <span className="a-main">
                    <div className="a-t">{d.Flow} <span className="mono" style={{ color: 'var(--muted)', fontWeight: 400 }}>{d.Version}</span></div>
                    <div className="a-s">{d.Trigger} · {d.Started}</div>
                  </span>
                  <Badge>{d.Status}</Badge>
                </div>
              ))}
            <div style={{ marginTop: 12 }}><Btn sm onClick={() => nav('/deployments')}>View pipeline →</Btn></div>
          </Card>
        </div>

        {/* DB8 — Top performers + Problem flows */}
        <div className="grid g2 mb">
          <Card title="Top performers" sub="ranked by invocations today">
            {topPerformers.length === 0
              ? <EmptyState icon="↑" title="No data yet" sub="Performance will surface once flows start receiving traffic." />
              : topPerformers.map((f) => (
                <div className="attn" key={f.id} onClick={() => nav('/designer/' + f.id)} style={{ cursor: 'pointer' }}>
                  <span className="a-main">
                    <div className="a-t">{f.Flow}</div>
                    <div className="a-s">{f.Trigger} · p95 {f.p95}</div>
                  </span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {f.invocations.toLocaleString()}
                  </span>
                </div>
              ))}
          </Card>
          <Card title="Needs investigation" sub="degraded or high p95">
            {problemFlows.length === 0
              ? <EmptyState icon="✓" title="No flows in trouble" sub="All flows in this workspace are within SLO." />
              : problemFlows.map((f) => (
                <div className="attn" key={f.id} onClick={() => nav('/monitoring')} style={{ cursor: 'pointer' }}>
                  <span className="a-dot" style={{ background: f.State === 'degraded' ? 'var(--danger)' : 'var(--warn)' }} />
                  <span className="a-main">
                    <div className="a-t">{f.Flow}</div>
                    <div className="a-s">{f.State} · p95 {f.p95}</div>
                  </span>
                  <Btn sm>View →</Btn>
                </div>
              ))}
          </Card>
        </div>

        {/* DB9 — Recently visited */}
        {recentlyVisited.length > 0 && (
          <Card title="Recently visited" sub="last 5 pages you opened" style={{ marginBottom: 16 }}>
            {recentlyVisited.slice(0, 5).map((v) => (
              <div className="attn" key={v.p} onClick={() => nav(v.p)} style={{ cursor: 'pointer' }}>
                <span className="a-main">
                  <div className="a-t">{v.t}</div>
                  <div className="a-s mono" style={{ fontSize: 11 }}>{v.p}</div>
                </span>
                <span style={{ color: 'var(--faint)', fontSize: 11 }}>
                  {v.ts ? new Date(v.ts).toLocaleTimeString() : ''}
                </span>
              </div>
            ))}
          </Card>
        )}

        <Card title="Recent activity"
          sub={`${range === 'All' ? 'all time' : 'last ' + range} · ${inRange.length} event${inRange.length === 1 ? '' : 's'} · range applies to this card only`}>
          {recent.length === 0
            ? <EmptyState icon="▦" title="No activity in this range"
                sub="Nothing audited in the selected window — widen the range or perform an action." />
            : recent.map((r) => (
              <div className="attn" key={r.id}>
                <span className="a-main"><div className="a-t">{r.Action} · {r.Target}</div><div className="a-s">{r.Actor}</div></span>
                <span style={{ color: 'var(--faint)', fontSize: 12 }}>{r.Time}</span>
              </div>
            ))}
          <div style={{ marginTop: 12 }}><Btn sm onClick={() => nav('/audit')}>Full audit log →</Btn></div>
        </Card>
      </>)}
    </div>
  );
}

/* ---------------- Flow Designer (orchestration editor) ---------------- */
const KIND = {
  httptrigger: { c: '#8b5cf6', i: 'H', t: 'HTTP Trigger', cat: 'Trigger' },
  grpc: { c: '#8b5cf6', i: '⇉', t: 'gRPC Trigger', cat: 'Trigger' },
  kafkatrig: { c: '#8b5cf6', i: 'K', t: 'Kafka Consumer', cat: 'Trigger' },
  webhook: { c: '#8b5cf6', i: 'W', t: 'Webhook / SSE', cat: 'Trigger' },
  cron: { c: '#8b5cf6', i: 'C', t: 'Cron Trigger', cat: 'Trigger' },
  manual: { c: '#8b5cf6', i: 'M', t: 'Manual Trigger', cat: 'Trigger' },
  httpreq: { c: '#3b82f6', i: '↗', t: 'HTTP Request', cat: 'HTTP' },
  filter: { c: '#f0a020', i: '▾', t: 'Filter', cat: 'Logic' },
  ifelse: { c: '#e0b341', i: '?', t: 'If / Else', cat: 'Logic' },
  switch: { c: '#e0b341', i: '⇄', t: 'Switch', cat: 'Logic' },
  loop: { c: '#3fb950', i: '↻', t: 'Loop', cat: 'Logic' },
  split: { c: '#56a6ff', i: '⑃', t: 'Split', cat: 'Logic' },
  merge: { c: '#18c2a6', i: '⊙', t: 'Merge / Join', cat: 'Logic' },
  delay: { c: '#06b6d4', i: '⏱', t: 'Delay', cat: 'Timing', paused: true },
  waituntil: { c: '#06b6d4', i: '⌛', t: 'Wait Until', cat: 'Timing', paused: true },
  crongate: { c: '#06b6d4', i: '⊞', t: 'Cron Gate', cat: 'Timing' },
  jsontransform: { c: '#22b8cf', i: '{}', t: 'JSON Transform', cat: 'Data' },
  setvar: { c: '#5b6b86', i: 'S', t: 'Set Variable', cat: 'Data' },
  getvar: { c: '#5b6b86', i: 'G', t: 'Get Variable', cat: 'Data' },
  code: { c: '#0d1117', i: 'ƒ', t: 'Function', cat: 'Code', container: true },
  httpresp: { c: '#f0506e', i: '←', t: 'HTTP Response', cat: 'Output' },
  kafkapub: { c: '#3b82f6', i: '↪', t: 'Kafka Publish', cat: 'Output' },
  notify: { c: '#f0a020', i: '◔', t: 'Notification', cat: 'Output' },
  return: { c: '#f0506e', i: '⤺', t: 'Return', cat: 'Output' },
  schedfuture: { c: '#0891b2', i: '↗⏱', t: 'Schedule Future Run', cat: 'Timing' },
};
const PAL_GROUPS = ['Trigger', 'HTTP', 'Logic', 'Timing', 'Data', 'Code', 'Output'];

function Designer() {
  const nav = useNavigate();
  const { id } = useParams();
  const { toast, db, saveFlowGraph, restoreFlowVersion, deployFlow, openDrawer, confirm, setFlowEnv, addFlowSecret, rotateFlowSecret, revokeFlowSecret, deleteFlowSecret, createFunction } = useApp();
  const flow = id ? db.flows.find((f) => f.id === id) : null;
  const seed = flow && flow.graph ? flow.graph : { nodes: db.designerFlow, wires: db.designerWires };
  const [nodes, setNodes] = useState(seed.nodes);
  const [edges, setEdges] = useState(seed.wires);
  const [sel, setSel] = useState(null);
  const [q, setQ] = useState('');
  const [dryRun, setDryRun] = useState(true);
  const [studio, setStudio] = useState(null);
  const [dirty, setDirty] = useState(false);
  /* context menu — { kind: 'node'|'wire'|'bg', x, y, payload } */
  const [ctxMenu, setCtxMenu] = useState(null);
  /* clipboard — copied/cut node (without id, regenerated on paste) */
  const [clipboard, setClipboard] = useState(null);
  /* imperative handle on the DesignerCanvas (fit/zoom/...) */
  const canvasApi = useRef(null);
  /* Inline proto editor — opened from the gRPC trigger config's "+ New proto"
     button. selectedNodeRef tracks which node triggered it so we can auto-fill
     protoRef once the new proto is saved. */
  const [protoEditor, setProtoEditor] = useState({ open: false, sourceNodeId: null });
  const openProtoEditor = (sourceNodeId = null) => setProtoEditor({ open: true, sourceNodeId });
  const closeProtoEditor = () => setProtoEditor({ open: false, sourceNodeId: null });
  /* Fullscreen mode — hides sidebar/topbar/breadcrumb so the canvas owns
     the whole viewport. ESC exits. */
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    document.body.classList.toggle('dz-fullscreen', fullscreen);
    return () => document.body.classList.remove('dz-fullscreen');
  }, [fullscreen]);
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e) => { if (e.key === 'Escape') setFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);
  /* Inspector width (drag-resized; persisted). null = follow the CSS default per breakpoint. */
  const [inspectorW, setInspectorW] = useState(() => {
    try {
      const v = localStorage.getItem('eventador.designer.inspectorW');
      const n = v ? Number(v) : 0;
      return n >= 320 && n <= 760 ? n : null;
    } catch { return null; }
  });
  const dzBodyRef = useRef(null);
  /* Apply width to the CSS var that drives grid-template-columns. */
  useEffect(() => {
    const el = dzBodyRef.current;
    if (!el) return;
    if (inspectorW) el.style.setProperty('--dz-inspector-w', inspectorW + 'px');
    else el.style.removeProperty('--dz-inspector-w');
  }, [inspectorW]);
  const startInspectorResize = (e) => {
    e.preventDefault();
    const el = dzBodyRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const startW = el.querySelector('.dz-inspector')?.getBoundingClientRect().width || 500;
    const startX = e.clientX;
    document.body.classList.add('dz-resizing');
    e.currentTarget.classList.add('dragging');
    const handle = e.currentTarget;
    const mv = (ev) => {
      const delta = startX - ev.clientX; /* drag left → wider */
      let next = startW + delta;
      /* Clamp: 320px min, never wider than 70% of dz-body */
      const maxW = Math.max(420, rect.width * 0.7);
      if (next < 320) next = 320;
      if (next > maxW) next = maxW;
      el.style.setProperty('--dz-inspector-w', next + 'px');
    };
    const up = () => {
      window.removeEventListener('mousemove', mv);
      window.removeEventListener('mouseup', up);
      document.body.classList.remove('dz-resizing');
      handle.classList.remove('dragging');
      /* Commit current width to state + localStorage. */
      const finalW = el.querySelector('.dz-inspector')?.getBoundingClientRect().width;
      if (finalW) {
        const n = Math.round(finalW);
        setInspectorW(n);
        try { localStorage.setItem('eventador.designer.inspectorW', String(n)); } catch {}
      }
    };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
  };
  const resetInspectorWidth = () => {
    setInspectorW(null);
    try { localStorage.removeItem('eventador.designer.inspectorW'); } catch {}
  };
  /* reload the canvas when the flow in the URL changes */
  useEffect(() => {
    const f = id ? db.flows.find((x) => x.id === id) : null;
    const g = f && f.graph ? f.graph : { nodes: db.designerFlow, wires: db.designerWires };
    setNodes(g.nodes); setEdges(g.wires); setSel(null); setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* no flow id → /flows is the canonical list, redirect there */
  if (!id || !flow) return <Navigate to="/flows" replace />;

  /* ADR-0024: env/secrets owned at Flow + Function only. Workspace/folder hold neither.
     Flow.env is the library for inline node ${KEY} interpolation; Function.Config overrides Flow on collision. */
  const flowEnv = Array.isArray(flow.env) ? flow.env : [];
  const flowSecrets = Array.isArray(flow.secrets) ? flow.secrets : [];

  /* References panel — derive ${KEY} usage from inline node config; cross-check against Flow.env */
  const REF_RE = /\$\{([A-Z][A-Z0-9_]*)\}/g;
  const flowRefs = (() => {
    const inlineRefs = new Map(); /* key -> Set(nodeTitle) */
    nodes.forEach((nd) => {
      if (nd.kind === 'code') return;
      let m; const text = String(nd.body || '');
      while ((m = REF_RE.exec(text))) {
        const k = m[1]; const s = inlineRefs.get(k) || new Set(); s.add(nd.title); inlineRefs.set(k, s);
      }
    });
    const envKeys = new Set(flowEnv.map((e) => e.k));
    const secKeys = new Set(flowSecrets.map((s) => s.Name));
    return { inlineRefs, envKeys, secKeys };
  })();

  /* ---- editor ---- */
  const n = nodes.find((x) => x.id === sel);
  /* studio holds a function id (linked function preview). */
  const move = (nid, x, y) => { setNodes((ns) => ns.map((z) => (z.id === nid ? { ...z, x, y } : z))); setDirty(true); };
  const upd = (patch) => { setNodes((ns) => ns.map((z) => (z.id === sel ? { ...z, ...patch } : z))); setDirty(true); };
  /* Full-node replace — used by NodeConfigForm which produces a fresh node object
     (typed `config` payload) rather than a partial patch. */
  const updNode = (next) => { setNodes((ns) => ns.map((z) => (z.id === sel ? next : z))); setDirty(true); };
  const add = (kind) => {
    const nid = 'n' + Date.now();
    const hasSchema = !!NODE_SCHEMA[kind];
    const base = {
      id: nid, kind, title: KIND[kind].t,
      /* Code node still uses `body` as a free-form label since it doesn't have
         a schema. Schema-driven kinds get their values from `config` defaults —
         never seed `body='configure…'` here, otherwise the migration logic in
         nodeWithDefaults treats it as a real user value (the cause of the
         "Topic = configure…" bug in Kafka Consumer). */
      ...(hasSchema ? {} : { body: 'configure…' }),
      x: 120 + (nodes.length % 4) * 70, y: 470,
      ...(kind === 'code' ? { fnId: null } : {}),
    };
    /* Hydrate config from the schema so the form opens with sensible defaults
       and every field starts validated (instead of every field reporting `required`). */
    let seeded = hasSchema ? nodeWithDefaults(base) : base;
    /* K02 — Auto-derive Kafka consumer group per-flow on creation so each
       consumer commits offsets in its own namespace (best-practice). */
    if (kind === 'kafkatrig' && seeded.config) {
      seeded = { ...seeded, config: { ...seeded.config,
        consumerGroup: `flow-${flow.Workspace}-${flow.Flow}` } };
    }
    setNodes((ns) => [...ns, seeded]);
    setSel(nid); setDirty(true); toast('Added ' + KIND[kind].t);
  };
  /* Hydrate selected node lazily so legacy flows (with `body`-only nodes) get
     a `config` object the first time the user clicks them. Pure derivation —
     does not call setNodes, so it doesn't trigger a render loop. */
  const selectedNode = (() => {
    const raw = nodes.find((x) => x.id === sel);
    if (!raw || !NODE_SCHEMA[raw.kind]) return raw;
    return raw.config ? raw : nodeWithDefaults(raw);
  })();
  /* Per-node status driver for the canvas dot/border. Drawn live from the same
     validation we use at deploy time, plus cross-references (Code → fnId,
     SchedFuture → targetFlow). Status objects: { kind, message }. */
  const nodeStatus = (() => {
    const out = {};
    nodes.forEach((nd) => {
      let kind = 'ok'; let message = 'healthy';
      /* Code node: must link to a function that still exists */
      if (nd.kind === 'code') {
        if (!nd.fnId) { kind = 'error'; message = 'Function not linked'; }
        else if (!db.functions.find((f) => f.id === nd.fnId)) { kind = 'error'; message = 'Linked function no longer exists'; }
      }
      /* Schema-driven nodes: required fields + pattern + cross checks */
      else if (NODE_SCHEMA[nd.kind]) {
        const hydrated = nd.config ? nd : nodeWithDefaults(nd);
        const errs = validateNode(hydrated);
        if (errs.length) {
          kind = 'error';
          message = errs.length === 1
            ? errs[0].label + ': ' + errs[0].error
            : errs.length + ' field errors — open this step';
        }
        /* schedfuture cross-ref: target flow must exist in workspace (warning if missing) */
        if (kind === 'ok' && nd.kind === 'schedfuture') {
          const target = (hydrated.config || {}).targetFlow;
          if (target && !db.flows.find((f) => f.Workspace === flow.Workspace && f.Flow === target)) {
            kind = 'error'; message = 'targetFlow "' + target + '" does not exist in workspace';
          }
        }
      }
      out[nd.id] = { kind, message };
    });
    return out;
  })();
  const del = () => {
    setNodes((ns) => ns.filter((z) => z.id !== sel));
    setEdges((es) => es.filter((e) => e[0] !== sel && e[1] !== sel));
    setSel(null); setDirty(true); toast('Step deleted', 'dng');
  };
  /* ─── Clipboard / context-menu actions ─── */
  const deleteNode = (nid) => {
    setNodes((ns) => ns.filter((z) => z.id !== nid));
    setEdges((es) => es.filter((e) => e[0] !== nid && e[1] !== nid));
    if (sel === nid) setSel(null);
    setDirty(true); toast('Step deleted', 'dng');
  };
  const disconnectAll = (nid) => {
    setEdges((es) => es.filter((e) => e[0] !== nid && e[1] !== nid));
    setDirty(true); toast('Disconnected all wires of this step');
  };
  const cloneNode = (src, atX, atY) => {
    const nid = 'n' + Date.now() + Math.floor(Math.random() * 99);
    const dup = { ...JSON.parse(JSON.stringify(src)), id: nid, x: atX, y: atY };
    setNodes((ns) => [...ns, dup]);
    setSel(nid); setDirty(true);
    return nid;
  };
  const copyNode = (nid) => {
    const src = nodes.find((z) => z.id === nid); if (!src) return;
    const { id: _id, ...rest } = src;
    setClipboard(rest);
    toast('Step copied');
  };
  const cutNode = (nid) => {
    const src = nodes.find((z) => z.id === nid); if (!src) return;
    const { id: _id, ...rest } = src;
    setClipboard(rest);
    deleteNode(nid);
    toast('Step cut');
  };
  const pasteNode = (atX, atY) => {
    if (!clipboard) return;
    const x = atX != null ? atX : (clipboard.x ?? 100) + 40;
    const y = atY != null ? atY : (clipboard.y ?? 100) + 40;
    cloneNode(clipboard, x, y);
    toast('Step pasted');
  };
  const duplicateNode = (nid) => {
    const src = nodes.find((z) => z.id === nid); if (!src) return;
    cloneNode(src, src.x + 40, src.y + 40);
    toast('Step duplicated');
  };
  const save = () => { saveFlowGraph(id, { nodes, wires: edges }); setDirty(false); toast('Flow saved'); };
  /* Compute a node-level diff between the last saved snapshot and the current
     canvas. Used by the Pre-deploy diff modal to surface what will change. */
  const computeDeployDiff = () => {
    const prev = (flow.versions && flow.versions[0] && flow.versions[0].graph) || null;
    const curNodes = nodes;
    const curEdges = edges;
    const prevNodes = prev ? (prev.nodes || []) : [];
    const prevEdges = prev ? (prev.wires || []) : [];
    const byIdPrev = new Map(prevNodes.map((n) => [n.id, n]));
    const byIdCur  = new Map(curNodes.map((n) => [n.id, n]));
    const added   = curNodes.filter((n) => !byIdPrev.has(n.id));
    const removed = prevNodes.filter((n) => !byIdCur.has(n.id));
    const changed = curNodes.filter((n) => {
      const old = byIdPrev.get(n.id); if (!old) return false;
      return JSON.stringify(old.config || old.body) !== JSON.stringify(n.config || n.body)
        || old.title !== n.title;
    });
    const edgesAdded   = curEdges.filter(([a, b]) => !prevEdges.some(([x, y]) => x === a && y === b));
    const edgesRemoved = prevEdges.filter(([a, b]) => !curEdges.some(([x, y]) => x === a && y === b));
    return { firstDeploy: !prev, added, removed, changed, edgesAdded, edgesRemoved };
  };
  const deploy = () => {
    /* Validation gate — same as before. Errors block, warnings prompt. */
    const { errors, warnings } = collectIssues();
    if (errors.length) { validate(); return; }
    const diff = computeDeployDiff();
    const totalChanges = diff.added.length + diff.removed.length + diff.changed.length
      + diff.edgesAdded.length + diff.edgesRemoved.length;
    /* Pre-deploy modal — combines diff + dry-run + schedule controls. */
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    const defaultScheduledFor = tomorrow.toISOString().slice(0, 16);
    /* Local state inside the drawer — closure-captured. */
    let chosenSchedule = '';
    let chosenDryRun = false;
    const summary = diff.firstDeploy
      ? `First deploy of "${flow.Flow}" — ${nodes.length} step${nodes.length === 1 ? '' : 's'}, ${edges.length} wire${edges.length === 1 ? '' : 's'}.`
      : totalChanges === 0
      ? `No graph changes since last save. Re-deploy will republish the same PlanSpec.`
      : [
          diff.added.length   > 0 && `+ ${diff.added.length} new step(s): ${diff.added.slice(0, 4).map((n) => n.title).join(', ')}`,
          diff.removed.length > 0 && `− ${diff.removed.length} removed: ${diff.removed.slice(0, 4).map((n) => n.title).join(', ')}`,
          diff.changed.length > 0 && `~ ${diff.changed.length} changed: ${diff.changed.slice(0, 4).map((n) => n.title).join(', ')}`,
          diff.edgesAdded.length   > 0 && `+ ${diff.edgesAdded.length} wire(s) added`,
          diff.edgesRemoved.length > 0 && `− ${diff.edgesRemoved.length} wire(s) removed`,
        ].filter(Boolean).join('\n');
    const open = () => openDrawer({
      title: 'Deploy ' + flow.Flow,
      sub: 'workspace ' + flow.Workspace + ' · ' + totalChanges + ' change' + (totalChanges === 1 ? '' : 's') + ' since last save',
      fields: [
        { section: 'Changes', label: 'Diff (preview)', value: summary, type: 'textarea', ro: true,
          help: 'Compared against the last saved snapshot of this flow.' },
        ...(warnings.length > 0 ? [{
          section: 'Warnings',
          label: warnings.length + ' warning' + (warnings.length === 1 ? '' : 's'),
          value: warnings.slice(0, 8).join('\n') + (warnings.length > 8 ? '\n…' : ''),
          type: 'textarea', ro: true,
        }] : []),
        { section: 'Mode',
          label: 'Dry-run only', value: chosenDryRun, type: 'toggle',
          help: 'On: pipeline runs but no traffic shifts, no replicas change, no side effects. Off: real deploy.' },
        { label: 'Schedule for later', value: chosenSchedule, type: 'select',
          options: [
            { value: '', label: 'Deploy now' },
            { value: defaultScheduledFor + ':00Z', label: 'Tomorrow ' + defaultScheduledFor.slice(11) + ' UTC' },
            { value: new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 19) + 'Z', label: 'In 4 hours' },
            { value: new Date(Date.now() + 12 * 3600 * 1000).toISOString().slice(0, 19) + 'Z', label: 'In 12 hours' },
          ],
          help: 'Off-hours releases. Scheduled deploys appear in the Deployments page until they fire.' },
      ],
      note: 'Save the canvas first if you want the diff to reflect the latest edits.',
      saveLabel: 'Deploy →',
      onSave: (v) => {
        /* Recompute current pick from drawer values (the drawer's local state
           isn't shared with the closure-captured vars here). */
        const dry = !!v['Dry-run only'];
        const sched = v['Schedule for later'] || null;
        saveFlowGraph(id, { nodes, wires: edges }); setDirty(false);
        deployFlow(id, { dryRun: dry, scheduledFor: sched });
        nav('/deployments');
      },
    });
    open();
  };
  /* ADR-0024: unified per-flow env & secrets editor.
     One drawer, two sections — Env (kvlist) + Secrets (secretslist with inline add/rotate/revoke/delete). */
  const showSecretOnce = (name, value) => openDrawer({
    title: 'Copy your secret — shown ONCE', sub: name + ' · never recoverable',
    fields: [{ label: 'Secret value', value, ro: true }],
    note: 'Stored as argon2id(+pepper); value never persisted. Lost it? Rotate the secret.',
    saveLabel: 'I have copied it',
  });
  const doRotateSecret = (s) => confirm({
    title: 'Rotate “' + s.Name + '”?',
    sub: 'A new value is generated. Old value briefly remains valid (dual-validity), then invalidated.',
    note: 'New value shown ONCE on rotate.', confirmLabel: 'Rotate',
    onConfirm: () => {
      rotateFlowSecret(id, s.Name);
      const value = 'rot_' + Math.random().toString(16).slice(2, 22);
      setTimeout(() => showSecretOnce(s.Name, value), 100);
    },
  });
  const doRevokeSecret = (s) => confirm({
    title: 'Revoke “' + s.Name + '”?',
    sub: 'Immediate: gateway cache TTL → 0. This flow will fail to authenticate until rotation.',
    confirmLabel: 'Revoke', onConfirm: () => revokeFlowSecret(id, s.Name),
  });
  const doDeleteSecret = (s) => confirm({
    title: 'Delete “' + s.Name + '”?', sub: 'Removes from this flow. Use Revoke first if any function still references it.',
    confirmLabel: 'Delete', onConfirm: () => deleteFlowSecret(id, s.Name),
  });
  const openFlowSettings = () => {
    const curEnv = Array.isArray(flow.env) && flow.env.length ? flow.env : [{ k: '', v: '' }];
    const curSecrets = Array.isArray(flow.secrets) ? flow.secrets : [];
    openDrawer({
      title: 'Env & Secrets · ' + flow.Flow,
      sub: 'workspace ' + flow.Workspace + ' · folder ' + (flow.Collection || '/') + ' · ADR-0024',
      
      fields: [
        { section: 'Env (Flow scope — inline nodes interpolate ${KEY}; functions auto-merge at deploy, Function.Config wins on collision)',
          label: 'Env', value: curEnv, type: 'kvlist',
          help: 'Per-workflow env. Read by all inline nodes via ${KEY}. Linked functions inherit and may override per-key in Function.Config.' },
        { section: 'Secrets (Flow scope — hashed at rest, ADR-0013; value shown ONCE on create/rotate; functions auto-merge, Function.secrets wins on name collision)',
          label: 'Secrets', value: curSecrets, type: 'secretslist',
          onAdd: (name) => {
            addFlowSecret(id, name);
            const value = 'sk_' + Math.random().toString(16).slice(2, 22);
            setTimeout(() => showSecretOnce(name, value), 100);
          },
          onRotate: doRotateSecret,
          onRevoke: doRevokeSecret,
          onDelete: doDeleteSecret,
        },
      ],
      note: 'Env is plaintext; Secrets are argon2id+pepper hashed (ADR-0013). Both are owned by this flow only (ADR-0024).',
      saveLabel: 'Save env',
      onSave: (v) => setFlowEnv(id, v.Env, 'Flow env saved'),
    });
  };
  /* Validation — collects all flow issues so deploy can gate on them.
     Layered: (1) graph-level invariants, (2) cross-references, (3) per-node schema. */
  const collectIssues = () => {
    const errors = []; const warnings = [];
    /* 1. trigger present */
    const triggers = nodes.filter((z) => KIND[z.kind] && KIND[z.kind].cat === 'Trigger').length;
    if (!triggers) errors.push('No trigger node — every flow needs a trigger');
    /* 2. Function nodes must link to an existing function */
    nodes.filter((z) => z.kind === 'code').forEach((z) => {
      if (!z.fnId) errors.push('Function step "' + z.title + '" is not linked to a function');
      else if (!db.functions.find((f) => f.id === z.fnId)) errors.push('Function step "' + z.title + '" links to a function that no longer exists');
    });
    /* 2b. Schedule Future Run target flow must exist (cross-reference — schema can't express this) */
    nodes.filter((z) => z.kind === 'schedfuture').forEach((z) => {
      const cfg = (z.config || {});
      const target = cfg.targetFlow || z.targetFlow;
      if (target && !db.flows.find((f) => f.Workspace === flow.Workspace && f.Flow === target)) {
        errors.push('Schedule Future Run step "' + z.title + '" targets unknown flow "' + target + '"');
      }
    });
    /* 3. Per-node schema validation — required fields, patterns, min/max, custom validators. */
    nodes.forEach((raw) => {
      if (!NODE_SCHEMA[raw.kind]) return;
      const hydrated = raw.config ? raw : nodeWithDefaults(raw);
      const fieldErrs = validateNode(hydrated);
      fieldErrs.forEach((e) => {
        errors.push(KIND[raw.kind].t + ' "' + (raw.title || raw.kind) + '" → ' + e.label + ': ' + e.error);
      });
    });
    /* 4. inline ${KEY} refs must resolve to Flow.env or Flow.secrets — walk legacy body + typed config strings */
    const envKeys = new Set(flowEnv.map((e) => e.k));
    const secKeys = new Set(flowSecrets.map((s) => s.Name));
    const undef = new Map(); /* key -> Set(nodeTitle) */
    const scanText = (text, nodeTitle) => {
      if (typeof text !== 'string') return;
      let m; REF_RE.lastIndex = 0;
      while ((m = REF_RE.exec(text))) {
        const k = m[1];
        if (!envKeys.has(k) && !secKeys.has(k)) {
          const s = undef.get(k) || new Set(); s.add(nodeTitle); undef.set(k, s);
        }
      }
    };
    nodes.forEach((nd) => {
      if (nd.kind === 'code') return;
      scanText(nd.body, nd.title);
      const cfg = nd.config || {};
      Object.values(cfg).forEach((v) => {
        if (typeof v === 'string') scanText(v, nd.title);
        else if (Array.isArray(v)) v.forEach((entry) => {
          if (typeof entry === 'string') scanText(entry, nd.title);
          else if (entry && typeof entry === 'object') {
            if (typeof entry.k === 'string') scanText(entry.k, nd.title);
            if (typeof entry.v === 'string') scanText(entry.v, nd.title);
          }
        });
      });
    });
    undef.forEach((nodeSet, key) => {
      errors.push('${' + key + '} referenced in [' + Array.from(nodeSet).join(', ') + '] but not in Flow.env / Flow.secrets');
    });
    /* 5. function-only warning: linked function's own Config shadows flow env (informational) */
    nodes.filter((z) => z.kind === 'code' && z.fnId).forEach((z) => {
      const fn = db.functions.find((f) => f.id === z.fnId); if (!fn) return;
      (fn.Config || []).forEach((c) => {
        if (envKeys.has(c.k)) warnings.push('"' + fn.Function + '" overrides Flow.env ' + c.k);
      });
    });
    return { errors, warnings, triggers };
  };
  const validate = () => {
    const { errors, warnings, triggers } = collectIssues();
    if (errors.length) {
      toast('Validation: ' + errors.length + ' error' + (errors.length === 1 ? '' : 's') + ' — see details', 'dng');
      openDrawer({
        title: 'Validation report · ' + flow.Flow, sub: 'Fix errors before deploy (ADR-0024)',
        fields: [
          { label: 'Errors (' + errors.length + ')', value: errors.join('\n') || '—', type: 'textarea', ro: true },
          { label: 'Warnings (' + warnings.length + ')', value: warnings.join('\n') || '—', type: 'textarea', ro: true },
        ],
        saveLabel: 'Close', onSave: () => {},
      });
      return false;
    }
    toast('Validated: ' + nodes.length + ' steps · ' + triggers + ' trigger(s) · ' + warnings.length + ' warning' + (warnings.length === 1 ? '' : 's'));
    return true;
  };
  const matched = Object.keys(KIND).filter((k) => !q || KIND[k].t.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="designer-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div className="crumb" style={{ margin: 0 }}><Crumb extra={flow.Flow} /></div>
        <span className="docref" style={{ marginTop: 0, marginLeft: 'auto' }}>
          flow-engine · interface-adapter · parallel · ADR-0003/0004/0008/0014/0015/0018
        </span>
      </div>
      <div className="dz">
        <div className="dz-toolbar">
          <button className="dz-back" onClick={() => nav('/flows')}>← Flows</button>
          <span className="dz-name">{flow.Flow}</span>
          <Badge>{flow.State}</Badge>
          <span className="dz-ver">{flow.Plan}</span>
          {dirty && <span className="dz-ver" style={{ color: 'var(--warn)' }}>● unsaved</span>}
          <span className="dz-div" />
          <Btn sm onClick={() => canvasApi.current && canvasApi.current.fit()}
            title="Fit all steps into view (F)">⊡ Fit</Btn>
          <Btn sm onClick={() => setFullscreen((v) => !v)}
            title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen — hide sidebar & header'}>
            {fullscreen ? '⛶ Exit' : '⛶ Full'}
          </Btn>
          <span className="dz-sp" />
          <Btn sm onClick={openFlowSettings} title="Flow env & secrets (ADR-0024)">⚙ Env ({(flow.env||[]).length}/{(flow.secrets||[]).length})</Btn>
          {(() => {
            const issues = collectIssues();
            if (issues.errors.length) return <Btn sm kind="dng" onClick={validate} title={issues.errors.slice(0, 3).join(' · ')}>⚠ {issues.errors.length} error{issues.errors.length === 1 ? '' : 's'}</Btn>;
            if (issues.warnings.length) return <Btn sm onClick={validate} title={issues.warnings.slice(0, 3).join(' · ')} style={{ color: 'var(--warn)' }}>⚠ {issues.warnings.length} warning{issues.warnings.length === 1 ? '' : 's'}</Btn>;
            return null;
          })()}
          <Btn sm onClick={validate}>Validate</Btn>
          <Btn sm onClick={() => {
            const versions = Array.isArray(flow.versions) ? flow.versions : [];
            if (versions.length === 0) {
              toast('No saved versions yet. Save the flow to start a history.');
              return;
            }
            const summary = versions.map((v, i) => {
              const tag = i === 0 ? ' (current)' : '';
              return `• ${v.ts}${tag}\n  ${v.v} · ${v.nodeCount} step${v.nodeCount === 1 ? '' : 's'} · by ${v.author}`;
            }).join('\n\n');
            openDrawer({
              title: 'Version history · ' + flow.Flow,
              sub: versions.length + ' saved snapshot' + (versions.length === 1 ? '' : 's') + ' · newest first',
              fields: [
                { section: 'History',
                  label: 'Saved versions', value: summary, type: 'textarea', ro: true,
                  help: 'Every save creates a snapshot. Use Restore below to revert to one.' },
                { section: 'Restore',
                  label: 'Restore to', value: versions.length > 1 ? versions[1].ts : versions[0].ts,
                  type: 'select',
                  options: versions.map((v, i) => ({
                    value: v.ts,
                    label: `${v.ts} — ${v.v} · ${v.nodeCount} steps${i === 0 ? ' (current)' : ''}`,
                  })),
                  help: 'Reverts the canvas to the selected snapshot. Save again to keep the change.' },
              ],
              note: 'Restoring does not delete newer versions — they stay in the history.',
              saveLabel: 'Restore',
              onSave: (v) => confirm({
                title: 'Restore to ' + v['Restore to'] + '?',
                sub: 'The canvas will be replaced with this snapshot. You can save again afterwards.',
                confirmLabel: 'Restore',
                onConfirm: () => restoreFlowVersion(flow.id, v['Restore to']),
              }),
            });
          }}>Versions</Btn>
          <Btn sm onClick={save}>Save</Btn>
          <Btn sm kind="pri" onClick={deploy}>Deploy →</Btn>
        </div>
        <div className="dz-body" ref={dzBodyRef}>
          <div className="dz-palette">
            <input className="dz-search" placeholder="Search steps…" value={q} onChange={(e) => setQ(e.target.value)} />
            {PAL_GROUPS.map((g) => {
              const items = matched.filter((k) => KIND[k].cat === g);
              if (!items.length) return null;
              return (
                <div key={g}>
                  <div className="dz-pal-grp">{g}</div>
                  {items.map((k) => (
                    <button key={k} className="dz-pal-item" onClick={() => add(k)}>
                      <span className="dz-pal-ic" style={{ background: KIND[k].c }}>{KIND[k].i}</span>
                      {KIND[k].t}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
          <DesignerCanvas ref={canvasApi} nodes={nodes} edges={edges} selected={sel}
            onSelect={setSel} onMove={move}
            onConnect={(from, to) => {
              if (from === to) return;
              setEdges((es) => es.some((e) => e[0] === from && e[1] === to) ? es : [...es, [from, to]]);
              setDirty(true); toast('Step connected');
            }}
            onDisconnect={(from, to) => {
              setEdges((es) => es.filter((e) => !(e[0] === from && e[1] === to)));
              setDirty(true); toast('Connection removed', 'dng');
            }}
            onNodeContext={(x, y, node) => setCtxMenu({ kind: 'node', x, y, payload: node })}
            onWireContext={(x, y, edge) => setCtxMenu({ kind: 'wire', x, y, payload: edge })}
            onBgContext={(x, y, cx, cy) => setCtxMenu({ kind: 'bg', x, y, payload: { cx, cy } })}
            KIND={KIND}
            fnLookup={(fid) => db.functions.find((f) => f.id === fid)}
            nodeStatus={nodeStatus} />
          <div className="dz-resizer"
            onMouseDown={startInspectorResize}
            onDoubleClick={resetInspectorWidth}
            title="Drag to resize · double-click to reset" />
          <div className="dz-inspector">
            {!n ? (() => {
              const { inlineRefs, envKeys, secKeys } = flowRefs;
              const allKeys = Array.from(inlineRefs.keys()).sort();
              const status = (k) => envKeys.has(k) ? 'env' : secKeys.has(k) ? 'secret' : 'missing';
              return (
                <>
                  <div className="section-h">Flow env <span style={{ color: 'var(--faint)', fontWeight: 400 }}>· {flowEnv.length} vars · {flowSecrets.length} secrets</span></div>
                  <p className="hint" style={{ marginTop: 0 }}>
                    Per-workflow env (ADR-0024). Inline nodes read with <code>${'${KEY}'}</code>; functions inherit + can override via own Config.
                  </p>
                  {flowEnv.length === 0 && flowSecrets.length === 0 ? (
                    <p className="hint" style={{ margin: 0 }}>No env or secrets on this flow yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {flowEnv.map((e) => (
                        <div key={'e_' + e.k} className="refrow">
                          <span className="mono"><b>{e.k}</b></span>
                          <span className="mono refrow-tail" title={e.v}>{e.v}</span>
                        </div>
                      ))}
                      {flowSecrets.map((s) => (
                        <div key={'s_' + s.Name} className="refrow">
                          <span className="mono"><b>{s.Name}</b></span>
                          <Badge>{s.Status === 'revoked' ? '⊘' : 'sec'}</Badge>
                          <span className="mono refrow-tail" title={s.Prefix}>{s.Prefix}</span>
                          {s.Status !== 'revoked'
                            ? <>
                                <button type="button" className="addf" onClick={() => doRotateSecret(s)} title="Rotate (new value shown once)">↻</button>
                                <button type="button" className="addf" onClick={() => doRevokeSecret(s)} title="Revoke">⊘</button>
                              </>
                            : <button type="button" className="addf" onClick={() => doDeleteSecret(s)} title="Delete">✕</button>}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex mt" style={{ gap: 6, flexWrap: 'wrap' }}>
                    <Btn sm kind="pri" onClick={openFlowSettings}>⚙ Manage env &amp; secrets</Btn>
                  </div>

                  <div className="section-h" style={{ marginTop: 14 }}>Inline node references <span style={{ color: 'var(--faint)', fontWeight: 400 }}>· {allKeys.length} used</span></div>
                  <p className="hint" style={{ marginTop: 0 }}>
                    Auto-derived from <code>${'${KEY}'}</code> in inline node config fields. Missing keys must be defined in Flow env before deploy.
                  </p>
                  {allKeys.length === 0 ? (
                    <p className="hint" style={{ margin: 0 }}>No <code>${'${KEY}'}</code> references yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {allKeys.map((k) => {
                        const st = status(k);
                        const inline = Array.from(inlineRefs.get(k) || []);
                        return (
                          <div key={k} className="refrow">
                            <span className="mono"><b>{k}</b></span>
                            {st === 'missing' ? <Badge>⚠ undef</Badge>
                              : st === 'secret' ? <Badge>secret</Badge> : <Badge>env</Badge>}
                            <span className="hint refrow-tail">{inline.length} node{inline.length === 1 ? '' : 's'}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="section-h" style={{ marginTop: 14 }}>How to add a step</div>
                  <p className="hint" style={{ margin: 0 }}>Select a step on the canvas, or add a new step from the palette on the left.</p>
                </>
              );
            })() : (
              <>
                <div className="section-h">{KIND[n.kind].t}</div>
                {n.kind === 'code' ? (() => {
                  /* Custom Code node = reference to a Function in the registry (ADR-0003 hybrid execution).
                     The function (image, runtime, config, secrets) lives in /functions — node only links to it. */
                  const wsFns = db.functions.filter((f) => f.Workspace === flow.Workspace);
                  const linkedFn = n.fnId ? wsFns.find((f) => f.id === n.fnId) : null;
                  const linkFn = (fnId) => {
                    const fn = wsFns.find((f) => f.id === fnId);
                    upd({ fnId, title: fn ? fn.Function : n.title, body: fn ? fn.Function + ' · ' + (fn.Image || '') : '⚠ pick a function' });
                  };
                  const unlinkFn = () => upd({ fnId: null, body: '⚠ pick a function' });
                  const openInRegistry = () => nav('/functions');
                  const createAndLink = () => openDrawer({
                    title: 'Create function for this node', sub: 'workspace · ' + flow.Workspace + ' · flow · ' + flow.Flow,
                    fields: [
                      { section: 'Identity',
                        label: 'Name', value: 'new-fn', placeholder: 'e.g. hello', help: 'Required · function identifier' },
                      { label: 'Image', value: '', placeholder: 'e.g. fnproject/hello', help: 'OCI image (signed at deploy)' },

                      { section: 'Resources',
                        label: 'Memory (MB)', value: 128, type: 'number', min: 32, max: 8192 },
                      { label: 'Timeout (sec)', value: 30, type: 'number', min: 1, max: 600 },
                      { label: 'Idle Timeout (sec)', value: 30, type: 'number', min: 1, max: 3600 },

                      { section: 'Scaling (KEDA · keda-autoscaling-spec §3.1)',
                        label: 'Min replicas', value: 0, type: 'number', min: 0, max: 100,
                        help: 'minReplicaCount — set 0 for scale-to-zero (only safe behind a broker).' },
                      { label: 'Max replicas', value: 8, type: 'number', min: 1, max: 1000,
                        help: 'maxReplicaCount — capped by tenant quota.' },
                      { label: 'Cooldown (s)', value: 120, type: 'number', min: 30, max: 3600,
                        help: 'cooldownPeriod — idle seconds before scaling down to min (or 0).' },
                      { label: 'Polling interval (s)', value: 5, type: 'number', min: 1, max: 300,
                        help: 'pollingInterval — how often KEDA samples triggers.' },
                      { label: 'Primary trigger', value: 'prometheus · concurrency', type: 'select',
                        options: [
                          { value: 'prometheus · concurrency', label: 'prometheus — concurrency saturation' },
                          { value: 'prometheus · pending',     label: 'prometheus — pending invocations' },
                          { value: 'prometheus · rps',         label: 'prometheus — requests / second' },
                          { value: 'kafka · lag',              label: 'kafka — broker lag' },
                          { value: 'cpu',                      label: 'cpu utilization' },
                          { value: 'memory',                   label: 'memory utilization' },
                          { value: 'cron',                     label: 'cron — scheduled scale-up' },
                        ],
                        help: 'Leading indicator (spec §1).' },
                      { label: 'Trigger threshold', value: '0.7',
                        help: 'Threshold the trigger compares against.' },
                      { label: 'Scale-up stabilization (s)', value: 0, type: 'number', min: 0, max: 600 },
                      { label: 'Scale-down stabilization (s)', value: 120, type: 'number', min: 0, max: 3600 },

                      { section: 'Configuration',
                        label: 'Config (own — function-scoped)', value: [{ k: '', v: '' }], type: 'kvlist',
                        help: 'Per-function k/v. Auto-merged with Flow.env at deploy; own wins on collision.' },
                    ],
                    note: 'Created in the Functions registry — this node will reference it. Edit later in /functions.',
                    saveLabel: 'Create &amp; link to node',
                    onSave: (v) => {
                      const id = createFunction({
                        workspace: flow.Workspace, flow: flow.Flow, name: v.Name, image: v.Image,
                        memory: v['Memory (MB)'], timeoutSec: v['Timeout (sec)'], idleTimeoutSec: v['Idle Timeout (sec)'],
                        config: v['Config (own — function-scoped)'],
                        scaling: buildScalingFromDrawer(v, flow.Flow + '/' + v.Name),
                      });
                      linkFn(id);
                    },
                  });
                  if (!linkedFn) {
                    return (
                      <div className="field">
                        <label>Function reference</label>
                        <p className="hint" style={{ marginTop: 0 }}>
                          This node invokes a function from the Functions registry (ADR-0003 hybrid execution).
                          Pick an existing function from this workspace, or create a new one.
                        </p>
                        {wsFns.length > 0 ? (
                          <>
                            <select value="" onChange={(e) => e.target.value && linkFn(e.target.value)}>
                              <option value="">— select a function —</option>
                              {wsFns.map((f) => (
                                <option key={f.id} value={f.id}>
                                  {f.Function} · {f.Image} ({f['Runtime/FDK']})
                                </option>
                              ))}
                            </select>
                            <div className="hint" style={{ marginTop: 6 }}>
                              {wsFns.length} function{wsFns.length === 1 ? '' : 's'} in workspace <b>{flow.Workspace}</b>.
                            </div>
                          </>
                        ) : (
                          <div className="hint" style={{ margin: 0 }}>
                            No functions in this workspace yet.
                          </div>
                        )}
                        <div className="flex mt" style={{ gap: 6, flexWrap: 'wrap' }}>
                          <Btn sm kind="pri" onClick={createAndLink}>+ Create new function</Btn>
                          <Btn sm onClick={() => nav('/functions')}>Open Functions registry →</Btn>
                        </div>
                      </div>
                    );
                  }

                  /* linked — show summary + inherited flow env preview + function's own config preview */
                  const fnConfig = Array.isArray(linkedFn.Config) ? linkedFn.Config : [];
                  const fnSecrets = Array.isArray(linkedFn.secrets) ? linkedFn.secrets : [];
                  const fnKeys = new Set(fnConfig.map((c) => c.k));
                  const fnSecNames = new Set(fnSecrets.map((s) => s.Name));
                  return (
                    <div className="field">
                      <label>Linked function</label>
                      <div className="fn-summary">
                        <div className="fn-summary-h">
                          <span className="mono"><b>{linkedFn.Function}</b></span>
                          <Badge>{linkedFn.Status}</Badge>
                        </div>
                        <KV k="Image"><span className="mono" style={{ fontSize: 11 }}>{linkedFn.Image}</span></KV>
                        <KV k="Runtime">{linkedFn['Runtime/FDK']}</KV>
                        <KV k="Resources">{linkedFn.Mem} · {linkedFn.Timeout} · idle {linkedFn.IdleTimeoutSec ?? '—'}s</KV>
                        {linkedFn.scaling && (
                          <>
                            <KV k="Scaling">
                              <span className="mono" style={{ fontSize: 11 }}>
                                {linkedFn.scaling.minReplicaCount ?? 0}→{linkedFn.scaling.maxReplicaCount ?? 8}
                              </span>
                              {linkedFn.scaling.minReplicaCount === 0 && <Badge>scale-to-zero</Badge>}
                            </KV>
                            <KV k="Trigger">
                              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                                {(linkedFn.scaling.triggers || []).map((t) => t.type + (t.name ? ' · ' + t.name : '')).join(' + ') || '—'}
                              </span>
                            </KV>
                          </>
                        )}
                      </div>
                      <div className="flex mt" style={{ gap: 6, flexWrap: 'wrap' }}>
                        <Btn sm kind="pri" onClick={() => setStudio(linkedFn.id)}>⤢ Preview code</Btn>
                        <Btn sm onClick={openInRegistry}>Open in registry →</Btn>
                      </div>
                      <div className="flex mt" style={{ gap: 6, flexWrap: 'wrap' }}>
                        <select value={linkedFn.id} onChange={(e) => linkFn(e.target.value)} style={{ flex: 1 }}>
                          {wsFns.map((f) => <option key={f.id} value={f.id}>{f.Function}</option>)}
                        </select>
                        <Btn sm onClick={unlinkFn} title="Detach from this node (function is not deleted)">✕ Unlink</Btn>
                      </div>

                      <div className="section-h" style={{ marginTop: 14 }}>Effective env at deploy <span style={{ color: 'var(--faint)', fontWeight: 400 }}>· read-only preview</span></div>
                      <p className="hint" style={{ marginTop: 0 }}>
                        At deploy: <code>Flow.env ∪ Function.Config</code> (Function wins on collision, ADR-0024).
                        Edit Flow env via <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => openFlowSettings()}>⚙ toolbar</a>;
                        edit Function via the ✎ button above.
                      </p>
                      {flowEnv.length === 0 && fnConfig.length === 0 && flowSecrets.length === 0 && fnSecrets.length === 0 ? (
                        <p className="hint" style={{ margin: 0 }}>No env or secrets defined at flow or function level.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {flowEnv.map((e) => {
                            const shadowed = fnKeys.has(e.k);
                            return (
                              <div key={'fe_' + e.k} className="refrow" style={shadowed ? { opacity: 0.5, textDecoration: 'line-through' } : null}>
                                <span className="mono"><b>{e.k}</b></span>
                                <Badge>flow</Badge>
                                {shadowed && <Badge>ovr</Badge>}
                                <span className="mono refrow-tail" title={e.v}>{e.v}</span>
                              </div>
                            );
                          })}
                          {fnConfig.map((c) => (
                            <div key={'fc_' + c.k} className="refrow">
                              <span className="mono"><b>{c.k}</b></span>
                              <Badge>fn cfg</Badge>
                              <span className="mono refrow-tail" title={c.v}>{c.v}</span>
                            </div>
                          ))}
                          {flowSecrets.map((s) => {
                            const shadowed = fnSecNames.has(s.Name);
                            return (
                              <div key={'fs_' + s.Name} className="refrow" style={shadowed ? { opacity: 0.5, textDecoration: 'line-through' } : null}>
                                <span className="mono"><b>{s.Name}</b></span>
                                <Badge>flow sec</Badge>
                                {shadowed && <Badge>ovr</Badge>}
                                <span className="mono refrow-tail" title={s.Prefix}>{s.Prefix}</span>
                              </div>
                            );
                          })}
                          {fnSecrets.map((s) => (
                            <div key={'fns_' + s.Name} className="refrow">
                              <span className="mono"><b>{s.Name}</b></span>
                              <Badge>fn sec</Badge>
                              <span className="mono refrow-tail" title={s.Prefix}>{s.Prefix}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  /* Every other kind renders via the schema-driven NodeConfigForm.
                     The form owns Step name, per-field validation, Execution section
                     and the Delete-step button. */
                  <NodeConfigForm
                    node={selectedNode}
                    onChange={updNode}
                    onDelete={del}
                    workspace={flow.Workspace}
                    ctx={{
                      protos: (db.protos || []).filter((p) => p.Workspace === flow.Workspace),
                      /* Workspace flows excluding the current one — for SchedFuture targetFlow */
                      flows: db.flows.filter((f) => f.Workspace === flow.Workspace && f.id !== flow.id),
                      /* Per-flow secrets (ADR-0024) — for webhook signing select */
                      flowSecrets: flowSecrets,
                      /* Known Kafka topics in this workspace — derived from triggers + publishes */
                      kafkaTopics: (() => {
                        const set = new Set();
                        db.flows.filter((f) => f.Workspace === flow.Workspace).forEach((fl) => {
                          const g = fl.graph || {};
                          (g.nodes || []).forEach((nd) => {
                            const c = nd.config || {};
                            if (nd.kind === 'kafkatrig' && c.topic) set.add(c.topic);
                            if (nd.kind === 'kafkapub'  && c.topic) set.add(c.topic);
                          });
                        });
                        return Array.from(set).sort();
                      })(),
                      /* Known variables — derived from setvar nodes in this flow */
                      knownVariables: nodes.filter((n) => n.kind === 'setvar')
                        .map((n) => (n.config || {}).name)
                        .filter(Boolean),
                      /* Whether this flow has an HTTP-shaped trigger (for return.statusCode showIf) */
                      hasHttpTrigger: nodes.some((n) => n.kind === 'httptrigger' || n.kind === 'webhook'),
                      /* Inline proto editor — used by gRPC trigger's "+ New proto" addAction */
                      openProtoEditor: () => openProtoEditor(selectedNode && selectedNode.id),
                    }}
                  />
                )}
                {n.kind === 'code' && (
                  <Btn kind="dng" sm onClick={del} style={{ marginTop: 12 }}>Delete step</Btn>
                )}
              </>
            )}
          </div>
        </div>
        <div className="dz-foot">
          <span className="dz-status"><span className="pulse" /> engine connected · backpressure nominal · inbox 12/512 · warm pool 8 · {nodes.length} steps</span>
          <span className="dz-sp" />
          <Toggle on={dryRun} onChange={setDryRun} label={dryRun ? 'Test mode (Dry-run) — no side effects' : 'Live mode'} />
          <Btn sm kind="pri" onClick={() => {
            /* Pick a sensible default payload from the trigger config. The Run-test
               drawer then lets the user edit it before invoking. */
            const trig = nodes.find((z) => KIND[z.kind] && KIND[z.kind].cat === 'Trigger');
            const c = (trig && trig.config) || {};
            const defaultPayload = c.bodySchema || c.payload || '{ "name": "eventador" }';
            const triggerLabel = trig ? KIND[trig.kind].t : 'no trigger';
            openDrawer({
              title: '▶ Run test — ' + flow.Flow,
              sub: triggerLabel + ' · ' + (dryRun ? 'dry-run (no side effects)' : 'LIVE — side effects fire'),
              fields: [
                { section: 'Input',
                  label: 'Payload (JSON)', value: defaultPayload, type: 'textarea',
                  help: 'Edit before running. JSON is parsed before invocation.' },
                { section: 'Result — preview',
                  label: 'Response (mock)', ro: true,
                  value: '{ "ok": true, "trace_id": "exec_' + Math.random().toString(16).slice(2, 10) + '" }' },
                { label: 'Duration', value: (40 + Math.floor(Math.random() * 80)) + ' ms', ro: true },
                { label: 'Steps executed', value: nodes.length + ' / ' + nodes.length + ' (no skip)', ro: true },
                { label: 'Mode', value: dryRun ? 'dry-run' : 'live', ro: true },
              ],
              note: dryRun
                ? 'Dry-run replays the flow in-memory: no Kafka publish, no HTTP request, no DB write. Audited as flow.testrun.'
                : '⚠ Live mode: all side effects fire (Kafka, HTTP, secrets). Audited.',
              saveLabel: '▶ Invoke',
              onSave: (v) => {
                let parsed = null;
                try { parsed = JSON.parse(v['Payload (JSON)']); }
                catch (e) { toast('Invalid JSON: ' + e.message, 'dng'); return; }
                toast((dryRun ? 'Dry-run' : 'Live run') + ' complete · ' + nodes.length + ' steps · '
                  + (40 + Math.floor(Math.random() * 80)) + ' ms');
                void parsed; /* mock — in real engine, body would post to gateway */
              },
            });
          }}>▶ Run test</Btn>
        </div>
      </div>
      {studio && (() => {
        /* studio holds a function id; render the linked function code in preview-only mode. */
        const fn = db.functions.find((f) => f.id === studio);
        if (!fn) return null;
        const langOf = (rt) => {
          const s = (rt || '').toLowerCase();
          if (s.includes('fdk-py')) return 'Python';
          if (s.includes('fdk-node')) return 'Node.js';
          if (s.includes('wasm')) return 'WASM';
          return 'Go';
        };
        return (
          <Suspense fallback={null}>
            <CodeStudio previewOnly node={{ title: fn.Function, lang: langOf(fn['Runtime/FDK']), image: fn.Image }}
              onClose={() => setStudio(null)} onSave={() => {}} />
          </Suspense>
        );
      })()}
      {ctxMenu && (() => {
        const items = (() => {
          if (ctxMenu.kind === 'node') {
            const node = ctxMenu.payload;
            const isCode = node.kind === 'code';
            return [
              { label: isCode ? 'Open in registry' : 'Edit step', icon: '✎',
                onClick: () => { setSel(node.id); if (isCode) nav('/functions'); } },
              { label: 'Duplicate', icon: '⎘', shortcut: '⌘D',
                onClick: () => duplicateNode(node.id) },
              { divider: true },
              { label: 'Cut',   icon: '✂', shortcut: '⌘X', onClick: () => cutNode(node.id) },
              { label: 'Copy',  icon: '⧉', shortcut: '⌘C', onClick: () => copyNode(node.id) },
              { label: 'Paste', icon: '⧪', shortcut: '⌘V',
                disabled: !clipboard,
                onClick: () => pasteNode(node.x + 40, node.y + 40) },
              { divider: true },
              { label: 'Disconnect all wires', icon: '⊘',
                onClick: () => disconnectAll(node.id) },
              { divider: true },
              { label: 'Delete step', icon: '🗑', shortcut: 'Del', danger: true,
                onClick: () => deleteNode(node.id) },
            ];
          }
          if (ctxMenu.kind === 'wire') {
            const edge = ctxMenu.payload;
            return [
              { label: 'Delete connection', icon: '🗑', shortcut: 'Del', danger: true,
                onClick: () => {
                  setEdges((es) => es.filter((e) => !(e[0] === edge[0] && e[1] === edge[1])));
                  setDirty(true); toast('Connection removed', 'dng');
                } },
            ];
          }
          /* background */
          const { cx, cy } = ctxMenu.payload;
          return [
            { label: 'Paste step', icon: '⧪', shortcut: '⌘V',
              disabled: !clipboard,
              onClick: () => pasteNode(cx, cy) },
            { divider: true },
            { label: 'Fit canvas', icon: '⊡', onClick: () => toast('Fit canvas (mock)') },
            { label: 'Deselect', icon: '✕', onClick: () => setSel(null) },
          ];
        })();
        return <ContextMenu x={ctxMenu.x} y={ctxMenu.y} items={items} onClose={() => setCtxMenu(null)} />;
      })()}
      <ProtoEditorModal open={protoEditor.open} existing={null}
        onClose={closeProtoEditor}
        onCreated={(created) => {
          /* If the proto editor was opened from a gRPC trigger node, auto-fill
             the new proto's Ref into that node's protoRef field. */
          if (protoEditor.sourceNodeId && created && created.Ref) {
            const src = nodes.find((nd) => nd.id === protoEditor.sourceNodeId);
            if (src && src.kind === 'grpc') {
              updNode({ ...src, config: { ...(src.config || {}), protoRef: created.Ref } });
            }
          }
          toast('Proto ' + (created && created.Ref ? created.Ref + ' ' : '') + 'registered');
        }} />
    </div>
  );
}

/* ---------------- Functions ---------------- */
/* Drawer-friendly "primary trigger" select values map to real KEDA triggers.
   keda-autoscaling-spec §3.1 supports multi-trigger; this demo edits only the first.
   readScalingForDrawer/buildScalingFromDrawer round-trip between the drawer's flat
   fields and the function record's nested KEDA shape. */
const TRIGGER_PRESETS = {
  'prometheus · concurrency': {
    type: 'prometheus', name: 'concurrency-saturation',
    queryFor: (_fn) => 'avg(runner_concurrency_used / runner_concurrency_max)',
    defaultThreshold: '0.7',
  },
  'prometheus · pending': {
    type: 'prometheus', name: 'pending-invocations',
    queryFor: (fn) => 'sum(flow_pending_invocations{fn="' + (fn || 'flow/node') + '"})',
    defaultThreshold: '20',
  },
  'prometheus · rps': {
    type: 'prometheus', name: 'rps',
    queryFor: (fn) => 'rate(http_requests_total{fn="' + (fn || 'flow/node') + '"}[1m])',
    defaultThreshold: '200',
  },
  'kafka · lag': {
    type: 'kafka', name: 'broker-lag',
    topicFor: (fn) => 'fn.' + (fn || 'flow.node'),
    defaultThreshold: '100',
  },
  cpu:    { type: 'cpu',    name: 'cpu-utilization',    defaultThreshold: '70' },
  memory: { type: 'memory', name: 'memory-utilization', defaultThreshold: '80' },
  cron:   { type: 'cron',   name: 'business-hours',     defaultThreshold: '1' },
};

function readScalingForDrawer(scaling) {
  const s = scaling || {};
  const t = (s.triggers && s.triggers[0]) || null;
  let key = 'prometheus · concurrency';
  let threshold = '0.7';
  if (t) {
    if (t.type === 'kafka') { key = 'kafka · lag'; threshold = t.lagThreshold || '100'; }
    else if (t.type === 'cpu') { key = 'cpu'; threshold = t.value || '70'; }
    else if (t.type === 'memory') { key = 'memory'; threshold = t.value || '80'; }
    else if (t.type === 'cron') { key = 'cron'; threshold = '1'; }
    else if (t.name === 'concurrency-saturation') { key = 'prometheus · concurrency'; threshold = t.threshold || '0.7'; }
    else if (t.name === 'pending-invocations')    { key = 'prometheus · pending';     threshold = t.threshold || '20'; }
    else if (t.name === 'rps')                    { key = 'prometheus · rps';         threshold = t.threshold || '200'; }
    else { key = 'prometheus · concurrency'; threshold = t.threshold || '0.7'; }
  }
  const sUp = (s.behavior && s.behavior.scaleUp)   || {};
  const sDn = (s.behavior && s.behavior.scaleDown) || {};
  return {
    min: s.minReplicaCount ?? 0,
    max: s.maxReplicaCount ?? 8,
    cooldown: s.cooldownPeriod ?? 120,
    polling: s.pollingInterval ?? 5,
    triggerKey: key,
    threshold,
    upStab: sUp.stabilizationWindowSeconds ?? 0,
    downStab: sDn.stabilizationWindowSeconds ?? 120,
  };
}

function buildScalingFromDrawer(v, fnPath) {
  const key = v['Primary trigger'] || 'prometheus · concurrency';
  const preset = TRIGGER_PRESETS[key] || TRIGGER_PRESETS['prometheus · concurrency'];
  const threshold = String(v['Trigger threshold'] ?? preset.defaultThreshold);
  let trigger;
  if (preset.type === 'kafka') {
    trigger = { type: 'kafka', name: preset.name, topic: preset.topicFor(fnPath), lagThreshold: threshold };
  } else if (preset.type === 'cpu' || preset.type === 'memory') {
    trigger = { type: preset.type, name: preset.name, value: threshold };
  } else if (preset.type === 'cron') {
    trigger = { type: 'cron', name: preset.name, desiredReplicas: threshold };
  } else {
    trigger = { type: 'prometheus', name: preset.name, query: preset.queryFor(fnPath), threshold };
  }
  return {
    minReplicaCount: Number(v['Min replicas']) || 0,
    maxReplicaCount: Math.max(1, Number(v['Max replicas']) || 8),
    cooldownPeriod: Number(v['Cooldown (s)']) || 120,
    pollingInterval: Number(v['Polling interval (s)']) || 5,
    triggers: [trigger],
    behavior: {
      scaleUp:   { stabilizationWindowSeconds: Number(v['Scale-up stabilization (s)']) || 0,   percent: 200, periodSeconds: 15 },
      scaleDown: { stabilizationWindowSeconds: Number(v['Scale-down stabilization (s)']) || 120, percent: 25,  periodSeconds: 60 },
    },
  };
}

function Functions() {
  const { scope, setScope, openDrawer, confirm, db, createFunction, updateFunction, deleteFunction, invokeFn } = useApp();
  const rows = db.functions.filter((f) => f.Workspace === scope.ws);
  const wsFlows = db.flows.filter((f) => f.Workspace === scope.ws);
  const [q, setQ] = useState('');
  const wsCounts = {};
  db.functions.forEach((f) => { wsCounts[f.Workspace] = (wsCounts[f.Workspace] || 0) + 1; });
  const [studio, setStudio] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editFn, setEditFn] = useState(null);
  const [yamlFn, setYamlFn] = useState(null);
  const langOf = (rt) => {
    const s = (rt || '').toLowerCase();
    if (s.includes('fdk-py')) return 'Python';
    if (s.includes('fdk-node')) return 'Node.js';
    if (s.includes('wasm')) return 'WASM';
    return 'Go';
  };
  const filtered = rows.filter((r) => !q || (r.Function + r.Flow + r.Image).toLowerCase().includes(q.toLowerCase()));
  /* Function CREATE uses a dedicated modal (FunctionCreateModal) because the
     generic Drawer can't express dependent fields, presets, cross-validation
     and live ScaledObject YAML preview that the strict design requires. EDIT
     still uses the generic Drawer via openRow below. */
  const create = () => setShowCreate(true);
  /* Secret management (add / rotate / revoke / delete) lives inside FunctionEditModal
     now — pulled out of Functions() since it's only reachable via the Edit drawer. */
  /* Edit uses FunctionEditModal (Variant B — Quick + Advanced + Summary + Secrets). */
  const openRow = (r) => setEditFn(r);
  const invoke = (fn) => openDrawer({
    title: 'Invoke — ' + fn.Function, sub: 'audited · fn-format invocation',
    fields: [
      { label: 'Payload (JSON)', value: '{"name":"eventador"}', type: 'textarea' },
      { label: 'Response (preview)', value: '{"message":"Hello eventador"}', ro: true },
      { label: 'Result (preview)', value: '200 · 41 ms · warm (no cold start)', ro: true }],
    note: 'Container function · signed image · fn-format/FDK ABI preserved (ADR-0014).',
    saveLabel: 'Send invocation', onSave: () => invokeFn(fn.id),
  });
  const del = (r) => confirm({
    title: 'Delete function “' + r.Function + '”?', sub: 'Removes the function from this workspace.',
    confirmLabel: 'Delete', onConfirm: () => deleteFunction(r.id),
  });
  return (
    <div>
      <PageHead crumb={<Crumb extra="Functions" />} title="Functions"
        desc="Container functions — signed images deployable independently (Lambda-style — invoke directly) or referenced from a flow's Function node. Workspace-scoped."
        docref="build · flow-engine §5 · fn-docs §2,§7 · ADR-0003/0009/0014 · CONCEPTS.md §4"
        actions={<Btn kind="pri" onClick={create}>+ New function</Btn>} />
      <p className="hint" style={{ marginTop: 0 }}>
        Functions in <b>{scope.ws}</b> — {rows.length} total · three usage modes: <b>standalone</b> (invoke directly),
        <b> referenced</b> from a flow's Custom Code, or <b>both</b>.
      </p>
      {rows.length > 0 && (
        <div className="field" style={{ maxWidth: 360 }}>
          <input placeholder="Filter functions by name, flow, image…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      )}
      {rows.length === 0 ? (
        <WsEmptyState icon="◰" scope={scope} title="No functions in"
          description={<>This workspace has no functions yet. Functions are container artifacts (signed, attested) — usable standalone (Lambda-style invoke), referenced from a flow's <b>Function</b> node, or both.</>}
          wsCounts={wsCounts}
          onSwitchWs={(ws) => setScope({ ...scope, ws, folder: '/' })}
          cta={<Btn kind="pri" onClick={create}>+ New function</Btn>}
          footerHint={<>fn-format ABI preserved (ADR-0014). At deploy: Flow.env ∪ Function.Config (Function wins on collision, ADR-0024).</>} />
      ) : (
      <div className="tablecard mb">
        <table>
          <thead><tr>{['Flow', 'Function', 'Image', 'Runtime/FDK', 'Mem', 'Timeout', 'Idle', 'Scaling', 'Env (own / inherited)', 'Status', ''].map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={11} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                No functions match "{q}".
              </td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="clickable" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') openRow(r); }}>
                <td onClick={() => openRow(r)}>{r.Flow}</td>
                <td onClick={() => openRow(r)}><b>{r.Function}</b></td>
                <td className="mono" onClick={() => openRow(r)}>
                  {r.Image || <Badge>pending build</Badge>}
                </td>
                <td onClick={() => openRow(r)}>{r['Runtime/FDK']}</td>
                <td onClick={() => openRow(r)}>{r.Mem}</td>
                <td onClick={() => openRow(r)}>{r.Timeout}</td>
                <td onClick={() => openRow(r)}>{(r.IdleTimeoutSec ?? '—')}{r.IdleTimeoutSec ? 's' : ''}</td>
                <td onClick={() => openRow(r)}>
                  {r.scaling ? (
                    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', whiteSpace: 'nowrap' }}
                      title={'KEDA · ' + (r.scaling.triggers || []).map((t) => t.type + (t.name ? ' (' + t.name + ')' : '')).join(' + ')}>
                      <span className="mono" style={{ fontSize: 11 }}>
                        {r.scaling.minReplicaCount ?? 0}→{r.scaling.maxReplicaCount ?? 8}
                      </span>
                      {r.scaling.minReplicaCount === 0 && <Badge>0↓</Badge>}
                      {(r.scaling.triggers || []).length > 1 && <Badge>{r.scaling.triggers.length}×</Badge>}
                    </span>
                  ) : <span style={{ color: 'var(--faint)' }}>—</span>}
                </td>
                <td onClick={() => openRow(r)}>
                  {(() => {
                    const parentFlow = db.flows.find((fl) => fl.Workspace === r.Workspace && fl.Flow === r.Flow);
                    const inh = (parentFlow && Array.isArray(parentFlow.env) ? parentFlow.env.length : 0)
                      + (parentFlow && Array.isArray(parentFlow.secrets) ? parentFlow.secrets.length : 0);
                    return (
                      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                        <Badge>{(r.Config?.length || 0)} own</Badge>
                        <Badge>{inh} flow</Badge>
                        {(r.secrets?.length || 0) > 0 && <Badge>{r.secrets.length} sec</Badge>}
                      </span>
                    );
                  })()}
                </td>
                <td onClick={() => openRow(r)}><Badge>{r.Status}</Badge></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <Btn sm onClick={(e) => { e.stopPropagation(); setStudio(r); }}>⤢ Code</Btn>{' '}
                  <Btn sm onClick={(e) => { e.stopPropagation(); setYamlFn(r); }} title="View ScaledObject YAML">🔧 YAML</Btn>{' '}
                  <Btn sm onClick={(e) => { e.stopPropagation(); invoke(r); }}>Invoke</Btn>{' '}
                  <Btn sm kind="dng" onClick={(e) => { e.stopPropagation(); del(r); }}>Delete</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      <div className="grid g3">
        <Card title="Build & sign" sub="flows.json → image (ADR-0009)">
          <KV k="BuildKit"><Badge>active</Badge></KV><KV k="cosign + SLSA"><Badge>attested</Badge></KV><KV k="verify-at-deploy"><Badge>active</Badge></KV>
        </Card>
        <Card title="ABI compatibility" sub="preserve Fn contract (ADR-0014)">
          <KV k="func.yaml"><Badge>active</Badge></KV><KV k="fn-format UDS"><Badge>active</Badge></KV><KV k="polyglot FDK">go · py · node · java</KV>
        </Card>
        <Card title="Runner pool" sub="tiered, sandboxed (ADR-0015)">
          <KV k="warm pool">8 · prewarm on</KV><KV k="per-container conc">1 (fn-format)</KV><KV k="privileged"><Badge>never</Badge></KV>
        </Card>
      </div>
      {studio && (
        <Suspense fallback={null}>
          <CodeStudio node={{ title: studio.Function, lang: langOf(studio['Runtime/FDK']), image: studio.Image }}
            onClose={() => setStudio(null)}
            onSave={(p) => updateFunction(studio.id, { Image: p.image }, 'Function recompiled & deployed')} />
        </Suspense>
      )}
      {showCreate && (
        <FunctionCreateModal
          workspace={scope.ws}
          onClose={() => setShowCreate(false)}
          onCreated={() => setShowCreate(false)} />
      )}
      {editFn && (
        <FunctionEditModal
          fn={editFn}
          onClose={() => setEditFn(null)}
          onDeleted={() => setEditFn(null)} />
      )}
      {yamlFn && (
        <YamlPreviewModal fn={yamlFn} onClose={() => setYamlFn(null)} />
      )}
    </div>
  );
}

/* ---------------- Users & RBAC (tabbed) ---------------- */
function Users() {
  const nav = useNavigate();
  const { scope, openDrawer, db, inviteUser, createUser, acceptInvitation, revokeInvitation } = useApp();
  const [tab, setTab] = useState('usr');
  const [svc, setSvc] = useState(db.serviceAccounts);
  const [q, setQ] = useState('');
  const users = db.users;
  const inv = db.invitations;
  const u = users.filter((x) => !q || (x.User + x.Email).toLowerCase().includes(q.toLowerCase()));
  const roleNames = (db.roles || []).map((r) => r.Name);
  const invite = () => openDrawer({
    title: 'Invite a user', sub: 'they receive an email; provisioned via SCIM/JIT on accept',
    fields: [
      { label: 'Email', value: 'new.user@acme.io' },
      { label: 'Scope', value: 'WS ' + scope.ws },
      { label: 'Role',
        value: roleNames.includes('Developer') ? 'Developer' : (roleNames[0] || 'Viewer'),
        type: 'select', options: roleNames.length ? roleNames : ['Viewer'],
        help: 'Pick from built-in or custom roles. Manage roles at /roles.' }],
    note: 'The invitation is audited; accepting it provisions the user with this scope + role.',
    onSave: (v) => inviteUser({ email: v.Email, scope: v.Scope, role: v.Role }),
  });
  /* Direct-create: admin enters identity + access + an IP allowlist, system generates a
     temp password that is shown ONCE in a follow-up drawer (Flow-secret pattern). The
     password is never persisted back — only its prefix lives on the user record for audit. */
  const showTempPasswordOnce = (userId, email, tempPassword) => openDrawer({
    title: 'Copy this temp password — shown ONCE',
    sub: email + ' · user must change it on first sign-in',
    fields: [
      { label: 'Email', value: email, ro: true },
      { label: 'Temporary password', value: tempPassword, ro: true,
        help: 'Send through a secure channel (1Password, signed Slack DM). It is not recoverable.' },
    ],
    note: 'Stored as bcrypt at rest (ADR-0013). The user is flagged "must reset" — first sign-in forces a password change and MFA enrollment.',
    saveLabel: 'I have copied it',
    onSave: () => { if (userId) nav('/users/' + userId); },
  });
  const create = () => openDrawer({
    title: 'Create user · direct',
    sub: 'admin-provisioned · temp password issued (no email invite)',
    fields: [
      { section: 'Identity',
        label: 'Name', value: 'New User',
        help: 'Full name as it should appear in the UI and audit.' },
      { label: 'Email', value: 'new.user@acme.io',
        help: 'Used as the sign-in identifier. Must be unique within the org.' },
      { label: 'Position', value: '',
        help: 'Job title / role description shown on the profile.' },
      { label: 'Phone', value: '',
        help: 'Optional. Used for SMS-based MFA recovery and on-call notifications.' },
      { section: 'Access',
        label: 'Role',
        value: roleNames.includes('Developer') ? 'Developer' : (roleNames[0] || 'Viewer'),
        type: 'select', options: roleNames.length ? roleNames : ['Viewer'],
        help: 'Pick from built-in or custom roles. Manage roles at /roles.' },
      { label: 'Scope', value: 'WS ' + scope.ws,
        help: 'Where the role is granted. Org / WS <name> / Collection <path>.' },
      { label: 'IP allowlist', value: [], type: 'stringlist',
        placeholder: 'e.g. 203.0.113.0/24',
        addLabel: 'Add IP / CIDR',
        help: 'Optional. Each entry is a single IP or CIDR — sign-in is rejected from any other IP. Leave empty to allow any.' },
    ],
    note: 'A temporary password is generated on save and shown ONCE in the next drawer. The user must change it on first sign-in and enroll MFA.',
    saveLabel: 'Create user',
    onSave: (v) => {
      const { userId, tempPassword } = createUser({
        name: v.Name, email: v.Email, phone: v.Phone, position: v.Position,
        ipAddress: v['IP allowlist'], role: v.Role, scope: v.Scope,
      });
      setTimeout(() => showTempPasswordOnce(userId, v.Email, tempPassword), 100);
    },
  });
  return (
    <div>
      <PageHead crumb={<Crumb extra="Users & RBAC" />} title="User Management"
        desc="SSO/OIDC/SAML + email + MFA · SCIM. Roles at org / workspace / collection, nearest-ancestor-wins. Every change audited."
        docref="dashboard §2–4 · ADR-0012/0013 · §16.9"
        actions={<>
          <Btn onClick={invite}>+ Invite user</Btn>
          <Btn kind="pri" onClick={create}>+ Create user</Btn>
        </>} />
      <Tabs active={tab} onChange={setTab} tabs={[
        { k: 'usr', t: `Users (${users.length})` }, { k: 'svc', t: 'Service accounts' },
        { k: 'rol', t: 'Roles' }, { k: 'inv', t: `Invitations (${inv.filter((x) => x.Status === 'invited').length})` }]} />
      {tab === 'usr' && (
        <>
          <div className="grid g4 mb">
            <Metric k="Active users" v={String(users.filter((x) => x.Status === 'active').length)} d="can sign in" dk="up" />
            <Metric k="Suspended" v={String(users.filter((x) => x.Status === 'suspended').length)} d="access revoked" dk="flat" />
            <Metric k="Service accounts" v={String(svc.length)} d="automation" dk="flat" />
            <Metric k="Pending invites" v={String(inv.filter((x) => x.Status === 'invited').length)} d="awaiting accept" dk="flat" />
          </div>
          <div className="field" style={{ maxWidth: 360 }}>
            <input placeholder="Filter by name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="tablecard">
            <table>
              <thead><tr>{['User', 'Email', 'Role', 'Scope', 'MFA', 'Status', ''].map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {u.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No users match.</td></tr>
                ) : u.map((r) => (
                  <tr key={r.id} className="clickable" onClick={() => nav('/users/' + r.id)}>
                    <td><b>{r.User}</b></td><td>{r.Email}</td>
                    <td><Badge>{r.Role}</Badge></td><td>{r.Scope}</td>
                    <td>{r.MFA}</td><td><Badge>{r.Status}</Badge></td>
                    <td style={{ textAlign: 'right' }}><Btn sm>Profile →</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint">Click a user → full profile (identity, MFA, role grants, sessions, activity).</p>
        </>
      )}
      {tab === 'svc' && (
        <>
          <DataTable rows={svc} setRows={setSvc} />
          <p className="hint">Service accounts authenticate via workspace API keys (ADR-0013/0020) — no SSO/MFA.</p>
        </>
      )}
      {tab === 'rol' && (
        <div className="tablecard"><table>
          <thead><tr><th>Role</th><th>Scope levels</th><th>Key permissions</th></tr></thead>
          <tbody>
            {[['Owner', 'Org', 'full control · delete org'], ['Admin', 'Org / Workspace', 'manage users, keys, route groups, deploy'],
            ['Developer', 'Workspace / Collection', 'author flows, deploy, view monitoring'], ['Operator', 'Workspace / Collection', 'deploy, rollback, DLQ replay, scale'],
            ['Viewer', 'any', 'read-only']].map((r) => (
              <tr key={r[0]}><td><Badge>{r[0]}</Badge></td><td>{r[1]}</td><td>{r[2]}</td></tr>
            ))}
          </tbody></table>
          <p className="hint">Resolution is nearest-ancestor-wins across Org→Workspace→Collection (ADR-0012).</p>
        </div>
      )}
      {tab === 'inv' && (
        <>
          <div className="tablecard">
            <table>
              <thead><tr>{['Email', 'Scope', 'Role', 'Invited by', 'Sent', 'Status', ''].map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {inv.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No invitations — use “+ Invite user”.</td></tr>
                ) : inv.map((r) => (
                  <tr key={r.id}>
                    <td><b>{r.Email}</b></td><td>{r.Scope}</td><td><Badge>{r.Role}</Badge></td>
                    <td>{r['Invited by']}</td><td>{r.Sent}</td><td><Badge>{r.Status}</Badge></td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {r.Status === 'invited' && <><Btn sm kind="pri" onClick={() => { const nid = acceptInvitation(r.id); if (nid) nav('/users/' + nid); }}>Accept</Btn>{' '}</>}
                      {r.Status === 'accepted'
                        ? <span style={{ color: 'var(--faint)', fontSize: 12 }}>joined</span>
                        : <Btn sm kind="dng" onClick={() => revokeInvitation(r.id)}>Revoke</Btn>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint">Accepting provisions the user via SCIM/JIT and lands them with their invited scope + role.</p>
        </>
      )}
    </div>
  );
}

/* ---------------- User Profile (tabbed) ---------------- */
function Profile() {
  const { id } = useParams();
  const { openDrawer, confirm, toast, db, updateUser, grantRole, revokeGrant } = useApp();
  const u = db.users.find((x) => x.id === id) || db.users[0];
  const [tab, setTab] = useState('over');
  const [sessions, setSessions] = useState([
    { id: 's1', Device: 'MacBook · Chrome', IP: '203.0.113.7', Location: 'London', 'Last seen': 'now (current)' },
    { id: 's2', Device: 'iPhone · Safari', IP: '203.0.113.40', Location: 'London', 'Last seen': '3h ago' },
    { id: 's3', Device: 'CI runner', IP: '10.0.4.12', Location: 'us-east-1', 'Last seen': '5m ago' },
  ]);
  const grants = db.grants.filter((g) => g.userId === u.id);
  const activity = db.audit.filter((a) => a.Actor === u.Email);
  const edit = () => openDrawer({
    title: 'Edit profile — ' + u.User,
    fields: [
      { section: 'Identity',
        label: 'User', value: u.User },
      { label: 'Email', value: u.Email },
      { label: 'Position', value: u.position || u.title || '' },
      { label: 'Phone', value: u.phone || '' },
      { section: 'Access',
        label: 'IP allowlist',
        value: Array.isArray(u.ipAddress)
          ? u.ipAddress
          : (u.ipAddress ? [u.ipAddress] : []),
        type: 'stringlist',
        placeholder: 'e.g. 203.0.113.0/24',
        addLabel: 'Add IP / CIDR',
        help: 'Optional. Each entry is a single IP or CIDR — sign-in is rejected from any other IP. Leave empty to allow any.' },
      { label: 'Status', value: u.Status, type: 'select', options: ['active', 'invited', 'suspended'] }],
    onSave: (v) => updateUser(u.id, {
      User: v.User, Email: v.Email,
      title: v.Position, position: v.Position,
      phone: v.Phone, ipAddress: v['IP allowlist'],
      Status: v.Status,
    }, 'Profile updated'),
  });
  const suspended = u.Status === 'suspended';
  const suspend = () => confirm({
    title: (suspended ? 'Re-activate ' : 'Suspend ') + u.User + '?',
    sub: suspended ? 'Restores the user’s access.' : 'They will be signed out of all sessions immediately.',
    note: 'Reversible. Audited (§16.9).', confirmLabel: suspended ? 'Re-activate' : 'Suspend',
    onConfirm: () => updateUser(u.id, { Status: suspended ? 'active' : 'suspended' }, 'User ' + (suspended ? 're-activated' : 'suspended')),
  });
  const roleNames = (db.roles || []).map((r) => r.Name);
  const grant = () => openDrawer({
    title: 'Grant a role — ' + u.User, sub: 'scoped grant · nearest-ancestor-wins (ADR-0012)',
    fields: [
      { label: 'Scope', value: 'WS: payments' },
      { label: 'Role',
        value: roleNames.includes('Developer') ? 'Developer' : (roleNames[0] || 'Viewer'),
        type: 'select', options: roleNames.length ? roleNames : ['Viewer'],
        help: 'Pick from built-in or custom roles. Manage roles at /roles.' }],
    onSave: (v) => grantRole(u.id, { scope: v.Scope, role: v.Role }),
  });
  return (
    <div>
      <div className="crumb"><Crumb extra={u.User} /></div>
      <div className="pfhead">
        <div className="avatar lg">{u.User[0]}</div>
        <div className="meta">
          <h1>{u.User}</h1>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>{u.Email} · {u.title}</div>
          <div className="row">
            <Badge>{u.Status}</Badge><Badge>{u.Role}</Badge>
            <span>scope <b>{u.Scope}</b></span><span style={{ color: 'var(--faint)' }}>·</span>
            <span>SSO <b>{u.SSO}</b></span><span style={{ color: 'var(--faint)' }}>·</span>
            <span>last <b>{u['Last active']}</b></span>
          </div>
        </div>
        <div className="actions">
          <Btn onClick={edit}>Edit profile</Btn>
          <Btn onClick={() => confirm({
            title: 'Reset MFA for ' + u.User + '?',
            sub: 'On next sign-in they must re-enroll their TOTP / WebAuthn factors. An email is sent with the enrollment link.',
            note: 'Audited (§16.9). Recovery codes are revoked.',
            confirmLabel: 'Reset MFA',
            onConfirm: () => updateUser(u.id, { MFA: 'pending' }, 'MFA reset — ' + u.Email + ' must re-enroll'),
          })}>Reset MFA</Btn>
          <Btn kind="dng" onClick={suspend}>{suspended ? 'Re-activate' : 'Suspend'}</Btn>
        </div>
      </div>
      <Tabs active={tab} onChange={setTab} tabs={[
        { k: 'over', t: 'Overview' }, { k: 'grnt', t: `Role grants (${grants.length})` },
        { k: 'perm', t: 'Permissions' },
        { k: 'sess', t: 'Sessions' }, { k: 'act', t: 'Activity' }]} />
      {tab === 'over' && (
        <div className="grid g2">
          <Card title="Identity" sub="profile & provisioning">
            <KV k="Full name"><b>{u.User}</b></KV>
            <KV k="Email">{u.Email}</KV>
            <KV k="Position">{u.position || u.title || <span style={{ color: 'var(--faint)' }}>—</span>}</KV>
            <KV k="Phone">{u.phone
              ? <span className="mono">{u.phone}</span>
              : <span style={{ color: 'var(--faint)' }}>—</span>}</KV>
            <KV k="IP allowlist">{(() => {
              const list = Array.isArray(u.ipAddress)
                ? u.ipAddress
                : (u.ipAddress ? [u.ipAddress] : []);
              if (list.length === 0) return <span style={{ color: 'var(--faint)' }}>any</span>;
              return (
                <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 4 }}>
                  {list.map((ip) => (
                    <span key={ip} className="badge" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{ip}</span>
                  ))}
                </span>
              );
            })()}</KV>
            <KV k="Timezone">Europe/London</KV>
            <KV k="Provisioned">{u.SSO === 'password'
              ? <Badge>direct · temp password</Badge>
              : 'SCIM · okta|00u3f'}</KV>
            {u.mustResetPassword && <KV k="Password"><Badge>must reset on first sign-in</Badge></KV>}
            {u.passwordPrefix && <KV k="Password prefix"><span className="mono" style={{ fontSize: 11 }}>{u.passwordPrefix}</span></KV>}
          </Card>
          <Card title="Security & MFA" sub="org enforces MFA (ADR-0013)">
            <KV k="MFA"><Badge>{u.MFA === 'on' ? 'enabled' : u.MFA === 'pending' ? 'pending' : 'none'}</Badge></KV>
            <KV k="Method">TOTP + WebAuthn</KV>
            <KV k="Password">SSO-managed</KV><KV k="Recovery codes">8 unused</KV>
            <KV k="Capability token TTL">5m (gateway)</KV>
          </Card>
        </div>
      )}
      {tab === 'grnt' && (
        <>
          <div className="tablecard">
            <table>
              <thead><tr>{['Scope', 'Role', 'Granted by', 'Granted', ''].map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {grants.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No role grants yet — use “+ Grant role”.</td></tr>
                ) : grants.map((g) => (
                  <tr key={g.id}>
                    <td><b>{g.Scope}</b></td><td><Badge>{g.Role}</Badge></td>
                    <td>{g['Granted by']}</td><td>{g.Granted}</td>
                    <td style={{ textAlign: 'right' }}><Btn sm kind="dng" onClick={() => revokeGrant(g.id)}>Revoke</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 10 }}><Btn kind="pri" sm onClick={grant}>+ Grant role</Btn></div>
          <p className="hint">Nearest-ancestor-wins (ADR-0012): a collection grant overrides broader grants above.</p>
        </>
      )}
      {tab === 'perm' && (() => {
        /* Effective permissions = union of permissions across every active grant's role.
           Group by Scope so admins can see "what can this user do where". */
        const catalog = db.permissions || [];
        const allRoles = db.roles || [];
        const activeGrants = grants.filter((g) => g.Status !== 'revoked');
        const byScope = new Map();
        activeGrants.forEach((g) => {
          const role = allRoles.find((r) => r.Name === g.Role);
          const perms = role ? (role.permissions || []) : [];
          if (!byScope.has(g.Scope)) byScope.set(g.Scope, { roles: new Set(), perms: new Set() });
          const bucket = byScope.get(g.Scope);
          bucket.roles.add(g.Role);
          perms.forEach((p) => bucket.perms.add(p));
        });
        const unionPerms = new Set();
        byScope.forEach((b) => b.perms.forEach((p) => unionPerms.add(p)));
        const byGroup = new Map();
        catalog.forEach((p) => {
          if (!byGroup.has(p.group)) byGroup.set(p.group, []);
          byGroup.get(p.group).push(p);
        });
        if (activeGrants.length === 0) {
          return <EmptyState icon="⛨" title="No effective permissions"
            sub="This user has no active role grants — they cannot perform any audited action." />;
        }
        return (
          <>
            <div className="grid g2 mb">
              <Card title="Effective permissions" sub={unionPerms.size + ' of ' + catalog.length + ' · union of all granted roles'}>
                {Array.from(byGroup.entries()).map(([g, perms]) => {
                  const onPerms = perms.filter((p) => unionPerms.has(p.id));
                  return (
                    <div key={g} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <b style={{ fontSize: 12 }}>{g}</b>
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--faint)' }}>{onPerms.length}/{perms.length}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px', paddingLeft: 8 }}>
                        {perms.map((p) => (
                          <span key={p.id} style={{ fontSize: 12, color: unionPerms.has(p.id) ? 'inherit' : 'var(--faint)' }}>
                            {unionPerms.has(p.id) ? '✓' : '·'} {p.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </Card>
              <Card title="Source grants" sub="how those permissions are earned">
                {Array.from(byScope.entries()).map(([s, b]) => (
                  <div className="attn" key={s}>
                    <span className="a-main">
                      <div className="a-t"><b>{s}</b></div>
                      <div className="a-s">{Array.from(b.roles).join(' · ')} — {b.perms.size} permission{b.perms.size === 1 ? '' : 's'}</div>
                    </span>
                  </div>
                ))}
                <p className="hint" style={{ marginTop: 8 }}>
                  Effective set is the union across all grants. Nearest-ancestor-wins applies only when checking access at a specific scope (ADR-0012).
                </p>
              </Card>
            </div>
          </>
        );
      })()}
      {tab === 'sess' && (
        <>
          <DataTable rows={sessions} setRows={setSessions} />
          <p className="hint">Revoke a session by clicking the row → Delete. NestJS authority (ADR-0013).</p>
        </>
      )}
      {tab === 'act' && (
        <Card title="Recent activity" sub="append-only · tamper-evident (§16.9) — audited actions by this user">
          {activity.length === 0
            ? <EmptyState icon="▦" title="No recorded activity" sub="Audited actions performed by this user will appear here." />
            : activity.slice(0, 14).map((a) => (
              <KV k={a.Action + ' · ' + a.Target} key={a.id}><span style={{ color: 'var(--faint)' }}>{a.Time}</span></KV>
            ))}
        </Card>
      )}
    </div>
  );
}

/* ---------------- Organization (tabbed admin console) ---------------- */
function Org() {
  const nav = useNavigate();
  const { scope, toast, confirm, db, openDrawer, updateOrg, addOrgDomain, removeOrgDomain } = useApp();
  const [tab, setTab] = useState('over');
  const org = db.orgs.find((o) => o.name === scope.org) || db.orgs[0];
  const ws = db.workspaces.filter((w) => w.Org === org.name);
  /* Policy lives on the org so it persists across reloads. Local UI state mirrors it
     until Save is pressed, so toggles feel snappy without writing on every flick. */
  const policy = org.policy || {};
  const [mfa, setMfa] = useState(policy.mfa !== false);
  const [scim, setScim] = useState(policy.scim !== false);
  const [oidc, setOidc] = useState(policy.oidc !== false);
  const [saml, setSaml] = useState(policy.saml !== false);
  const [sessionTtl, setSessionTtl] = useState(policy.sessionTtl || '8h');
  const [ipAllow, setIpAllow] = useState(policy.ipAllow || '203.0.113.0/24');
  /* D6 — Org-level deploy approval gate. When on, deploys to a workspace
     with Env='prod' are auto-tagged as 'pending approval' (deployFlow reads
     this from org.policy.requireProdApproval). */
  const [requireProdApproval, setRequireProdApproval] = useState(!!policy.requireProdApproval);
  useEffect(() => {
    const p = org.policy || {};
    setMfa(p.mfa !== false); setScim(p.scim !== false);
    setOidc(p.oidc !== false); setSaml(p.saml !== false);
    setSessionTtl(p.sessionTtl || '8h'); setIpAllow(p.ipAllow || '203.0.113.0/24');
    setRequireProdApproval(!!p.requireProdApproval);
  }, [org.name]); // eslint-disable-line react-hooks/exhaustive-deps
  const addDomain = () => openDrawer({
    title: 'Add verified domain', sub: 'org · ' + org.name,
    fields: [{ label: 'Domain', value: 'example.com',
      help: 'After save, DNS TXT verification starts. JIT provisioning honors verified domains.' }],
    saveLabel: 'Add domain',
    onSave: (v) => addOrgDomain(org.name, v.Domain),
  });
  const removeDomain = (d) => confirm({
    title: 'Remove domain "' + d + '"?',
    sub: 'JIT provisioning will stop honoring this domain. Existing users are unaffected.',
    confirmLabel: 'Remove', onConfirm: () => removeOrgDomain(org.name, d),
  });
  const savePolicy = () => updateOrg(org.name, {
    policy: { mfa, scim, oidc, saml, sessionTtl, ipAllow, requireProdApproval },
  }, 'Security policy saved (audited)');
  const num = (v) => Number(String(v).replace(/[^0-9]/g, '')) || 0;
  const members = ws.reduce((a, w) => a + num(w.Members), 0);
  const collections = ws.reduce((a, w) => a + num(w.Collections), 0);
  return (
    <div>
      <div className="crumb"><Crumb extra="Organization" /></div>
      <div className="pfhead">
        <div className="avatar lg">{org.initial}</div>
        <div className="meta">
          <h1>{org.name}</h1>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>
            Top-level tenant — identity & audit boundary. Owns workspaces; policies inherit downward.
          </div>
          <div className="row">
            <Badge>{org.plan}</Badge>
            <span>slug <b className="mono">{org.slug}</b></span><span style={{ color: 'var(--faint)' }}>·</span>
            <span><b>{ws.length}</b> workspaces</span><span style={{ color: 'var(--faint)' }}>·</span>
            <span><b>{members}</b> members</span><span style={{ color: 'var(--faint)' }}>·</span>
            <span>owner <b>{org.owner}</b></span>
          </div>
        </div>
        <div className="actions">
          <Btn onClick={() => nav('/audit')}>View audit</Btn>
          <Btn kind="pri" onClick={() => nav('/workspaces')}>Manage workspaces</Btn>
        </div>
      </div>
      <p className="hint" style={{ marginTop: 0 }}>
        Showing <b>{org.name}</b> — switch organization from the switcher at the top of the sidebar.
      </p>
      <Tabs active={tab} onChange={setTab} tabs={[
        { k: 'over', t: 'Overview' }, { k: 'idp', t: 'Identity & SSO' },
        { k: 'sec', t: 'Security' }]} />
      {tab === 'over' && (
        <>
          <div className="grid g3 mb">
            <Metric k="Workspaces" v={String(ws.length)} d="isolation boundaries" dk="flat" />
            <Metric k="Members" v={String(members)} d="across all workspaces" dk="up" />
            <Metric k="Collections" v={String(collections)} d="flow groupings" dk="flat" />
          </div>
          <div className="grid g2">
            <Card title="Workspaces" sub="click to manage — policies inherit down">
              {ws.map((w) => (
                <div className="attn" key={w.id}>
                  <span className="a-dot" style={{ background: 'var(--accent)' }} />
                  <span className="a-main">
                    <div className="a-t">{w.Workspace}</div>
                    <div className="a-s">{w.Env} · {w.Members} members · {w.Collections} collections</div>
                  </span>
                  <Btn sm onClick={() => nav('/workspaces')}>Open →</Btn>
                </div>
              ))}
            </Card>
            <Card title="Recent organization activity" sub="append-only · tamper-evident (§16.9)">
              {[['user.invite', org.owner, '10:11Z'],
              ['sso.config.update · ' + org.idp, org.owner, 'yesterday'],
              ['workspace.create · ' + (ws[ws.length - 1]?.Workspace || '—'), org.owner, '2d ago']].map((r) => (
                <div className="attn" key={r[0]}>
                  <span className="a-main"><div className="a-t">{r[0]}</div><div className="a-s">{r[1]}</div></span>
                  <span style={{ color: 'var(--faint)', fontSize: 12 }}>{r[2]}</span>
                </div>
              ))}
              <div style={{ marginTop: 12 }}><Btn sm onClick={() => nav('/audit')}>Full audit log →</Btn></div>
            </Card>
          </div>
        </>
      )}
      {tab === 'idp' && (
        <div className="grid g2">
          <Card title="Single sign-on" sub="org = identity boundary (ADR-0012)">
            <KV k="OIDC"><Toggle on={oidc} onChange={(v) => { setOidc(v); toast('OIDC ' + (v ? 'enabled' : 'disabled')); }} label={oidc ? 'enabled' : 'disabled'} /></KV>
            <KV k="SAML"><Toggle on={saml} onChange={(v) => { setSaml(v); toast('SAML ' + (v ? 'enabled' : 'disabled')); }} label={saml ? 'enabled' : 'disabled'} /></KV>
            <KV k="SCIM provisioning"><Toggle on={scim} onChange={(v) => { setScim(v); toast('SCIM ' + (v ? 'enabled' : 'disabled')); }} label={scim ? 'enabled' : 'disabled'} /></KV>
            <KV k="Identity provider">{org.idp}</KV>
          </Card>
          <Card title="Verified domains" sub="JIT provisioning honors these">
            {(org.domains || []).map((d) => (
              <div className="kv" key={d}>
                <span>{d}</span>
                <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <Badge>verified</Badge>
                  <Btn sm kind="dng" onClick={() => removeDomain(d)} title="Remove">✕</Btn>
                </span>
              </div>
            ))}
            <Btn sm style={{ marginTop: 8 }} onClick={addDomain}>+ Add domain</Btn>
          </Card>
        </div>
      )}
      {tab === 'sec' && (
        <>
          <div className="grid g2">
            <Card title="Authentication policy" sub="enforced org-wide">
              <KV k="MFA required"><Toggle on={mfa} onChange={(v) => { setMfa(v); toast('MFA ' + (v ? 'required' : 'optional')); }} label={mfa ? 'required' : 'optional'} /></KV>
              <div className="field"><label>Session TTL</label>
                <select value={sessionTtl} onChange={(e) => { setSessionTtl(e.target.value); toast('Session TTL ' + e.target.value); }}>
                  <option>1h</option><option>8h</option><option>24h</option>
                </select></div>
              <KV k="Capability token TTL">5m (gateway)</KV>
            </Card>
            <Card title="Network & audit" sub="admin-plane controls">
              <div className="field"><label>Admin IP allowlist (CIDR)</label>
                <input value={ipAllow} onChange={(e) => setIpAllow(e.target.value)} /></div>
              <KV k="Audit log"><Badge>active</Badge></KV>
              <KV k="Tamper-evidence">append-only hash chain</KV>
            </Card>
          </div>
          <Card title="Deploy policy" sub="when production deploys go straight live vs. require human review" style={{ marginTop: 16 }}>
            <KV k="Require approval for production deploys">
              <Toggle on={requireProdApproval}
                onChange={(v) => { setRequireProdApproval(v); toast('Prod approval ' + (v ? 'required' : 'off')); }}
                label={requireProdApproval ? 'required' : 'off'} />
            </KV>
            <p className="hint" style={{ marginTop: 8 }}>
              When on, any deploy to a workspace with <b>Env = prod</b> enters <Badge>pending approval</Badge> automatically. An Owner or Admin must click <b>✓ Approve</b> on the Deployments page before traffic shifts. Non-prod workspaces (dev / staging) deploy immediately.
            </p>
          </Card>
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Btn kind="pri" onClick={savePolicy}>Save all security settings</Btn>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Roles (built-in + custom) ---------------- */
function Roles() {
  const { db, openDrawer, confirm, createRole, updateRole, deleteRole } = useApp();
  const catalog = db.permissions || [];
  const roles = db.roles || [];
  const grantUseCount = (name) => (db.grants || []).filter((g) => g.Role === name).length;
  const newRole = () => openDrawer({
    title: 'New custom role', sub: 'org-scoped · audited (§16.9)',
    fields: [
      { section: 'Identity',
        label: 'Name', value: 'new-role',
        help: 'Org-unique. Used in grants, invitations and audit.' },
      { label: 'Description', value: '', type: 'textarea',
        help: 'What this role is for — shown to admins when granting.' },
      { section: 'Permissions',
        label: 'Permissions', value: [], type: 'permslist',
        catalog,
        help: 'Pick the actions this role can perform. Group checkbox toggles every permission in the group.' },
    ],
    note: 'Permissions are a flat catalog. A user’s effective set is the union of every granted role at every scope.',
    saveLabel: 'Create role',
    onSave: (v) => createRole({ name: v.Name, description: v.Description, permissions: v.Permissions }),
  });
  const editRole = (r) => openDrawer({
    title: 'Edit role · ' + r.Name, sub: r.builtin ? 'built-in · read-only' : 'custom · audited (§16.9)',
    fields: [
      { section: 'Identity',
        label: 'Name', value: r.Name, ro: r.builtin },
      { label: 'Description', value: r.Description || '', type: 'textarea', ro: r.builtin },
      { section: 'Permissions',
        label: 'Permissions', value: r.permissions || [], type: 'permslist',
        catalog, ro: r.builtin,
        help: r.builtin
          ? 'Built-in role — permissions cannot be edited.'
          : 'Adding / removing permissions takes effect immediately for everyone granted this role.' },
    ],
    note: r.builtin
      ? 'Built-in role. To customise, duplicate it into a custom role instead.'
      : 'Used in ' + grantUseCount(r.Name) + ' grant(s). Removing a permission affects every user granted this role.',
    saveLabel: r.builtin ? 'Close' : 'Save changes',
    onDelete: !r.builtin ? () => confirm({
      title: 'Delete role "' + r.Name + '"?',
      sub: grantUseCount(r.Name)
        ? 'Cannot delete — still granted to ' + grantUseCount(r.Name) + ' user(s). Revoke first.'
        : 'No users currently have this role.',
      confirmLabel: 'Delete', onConfirm: () => deleteRole(r.id),
    }) : undefined,
    onSave: (v) => {
      if (r.builtin) return;
      updateRole(r.id, { Name: v.Name, Description: v.Description, permissions: v.Permissions },
        'Role "' + v.Name + '" updated');
    },
  });
  return (
    <div>
      <PageHead crumb={<Crumb extra="Roles" />} title="Roles"
        desc="Built-in presets plus org-scoped custom roles. A role is a bag of permissions; grants attach a role to a user at a scope (org / workspace / collection)."
        docref="ADR-0012 · §16.8"
        actions={<Btn kind="pri" onClick={newRole}>+ New role</Btn>} />
      <p className="hint" style={{ marginTop: 0 }}>
        {roles.length} role{roles.length === 1 ? '' : 's'} · {roles.filter((r) => r.builtin).length} built-in · {roles.filter((r) => !r.builtin).length} custom · {catalog.length} permissions in catalog.
      </p>
      <div className="tablecard">
        <table>
          <thead><tr>{['Name', 'Type', 'Description', 'Permissions', 'Used by', ''].map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {roles.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                No roles. Use "+ New role" to create one.
              </td></tr>
            ) : roles.map((r) => {
              const used = grantUseCount(r.Name);
              return (
                <tr key={r.id} className="clickable" onClick={() => editRole(r)}>
                  <td><b>{r.Name}</b></td>
                  <td><Badge>{r.builtin ? 'built-in' : 'custom'}</Badge></td>
                  <td style={{ color: 'var(--muted)', fontSize: 12, maxWidth: 420 }}>{r.Description || '—'}</td>
                  <td>{(r.permissions || []).length} / {catalog.length}</td>
                  <td>{used > 0 ? used + ' user' + (used === 1 ? '' : 's') : <span style={{ color: 'var(--faint)' }}>—</span>}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                    <Btn sm onClick={() => editRole(r)} title={r.builtin ? 'View permissions' : 'Edit'}>{r.builtin ? '👁' : '✎'}</Btn>
                    {!r.builtin && <>{' '}<Btn sm kind="dng" onClick={() => confirm({
                      title: 'Delete role "' + r.Name + '"?',
                      sub: used ? 'Cannot delete — still granted to ' + used + ' user(s). Revoke first.' : 'No users currently have this role.',
                      confirmLabel: 'Delete', onConfirm: () => deleteRole(r.id),
                    })} title="Delete">🗑</Btn></>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Workspaces (master + detail) ---------------- */
function Workspaces() {
  const nav = useNavigate();
  const { scope, confirm, db, openDrawer, createWorkspace, updateWorkspace, archiveWorkspace, unarchiveWorkspace } = useApp();
  const rows = db.workspaces.filter((w) => w.Org === scope.org);
  const [selId, setSelId] = useState(null);
  const sel = rows.find((r) => r.id === selId) || rows[0];
  const num = (v) => Number(String(v).replace(/[^0-9]/g, '')) || 0;
  const create = () => {
    const id = createWorkspace({ org: scope.org });
    setSelId(id);
  };
  const editWs = (w) => openDrawer({
    title: 'Edit workspace · ' + w.Workspace, sub: 'org · ' + w.Org,
    fields: [
      { section: 'Identity',
        label: 'Workspace', value: w.Workspace,
        help: 'Unique within the org. Used as the credential & isolation boundary.' },
      { label: 'Env', value: w.Env, type: 'select',
        options: ['dev', 'staging', 'prod'],
        help: 'Environment tier — affects default deploy gates and rate-limit policy.' },
      { label: 'Owner', value: w.Owner,
        help: 'Primary contact. Inherits Admin role by default.' },
      { section: 'Defaults',
        label: 'Secrets', value: w.Secrets,
        help: 'Vault scope binding for workspace-level secrets (ADR-0013).' },
    ],
    note: 'Renaming changes URLs. Existing flows / API keys stay bound by id. Audited (§16.9).',
    saveLabel: 'Save changes',
    onSave: (v) => updateWorkspace(w.id, {
      Workspace: v.Workspace, Env: v.Env, Owner: v.Owner, Secrets: v.Secrets,
    }, 'Workspace "' + v.Workspace + '" updated'),
  });
  const doArchive = (w) => confirm({
    title: 'Archive ' + w.Workspace + '?', sub: 'Flows stop reconciling; data and config are retained.',
    note: 'Reversible. Audited (§16.9).', confirmLabel: 'Archive',
    onConfirm: () => archiveWorkspace(w.id),
  });
  const archive = () => sel && doArchive(sel);
  return (
    <div>
      <PageHead crumb={<Crumb extra="Workspaces" />} title="Workspaces"
        desc="The team / environment boundary — and the credential & isolation boundary. Owns API keys & secret scope; RBAC, config and secrets inherit down to collections (nearest-ancestor-wins)."
        docref="MASTER-PLAN §5 · dashboard §1 · ADR-0012 · §16.8"
        actions={<Btn kind="pri" onClick={create}>+ New workspace</Btn>} />
      <p className="hint" style={{ marginTop: 0 }}>
        Showing workspaces in <b>{scope.org}</b> — switch organization from the switcher at the top of the sidebar.
      </p>
      <div className="grid g4 mb">
        <Metric k="Workspaces" v={String(rows.length)} d="isolation boundaries" dk="flat" />
        <Metric k="Members" v={String(rows.reduce((a, w) => a + num(w.Members), 0))} d="across all" dk="up" />
        <Metric k="API keys" v={String(rows.reduce((a, w) => a + num(w['API keys']), 0))} d="workspace-scoped" dk="flat" />
        <Metric k="Collections" v={String(rows.reduce((a, w) => a + num(w.Collections), 0))} d="flow groupings" dk="flat" />
      </div>
      <div className="tablecard mb">
        <table>
          <thead><tr>{['Workspace', 'Env', 'Members', 'API keys', 'Collections', 'Owner', 'Status', ''].map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="clickable" onClick={() => setSelId(r.id)}
                style={r.id === sel?.id ? { background: 'var(--panel3)' } : undefined}>
                <td><b>{r.Workspace}</b></td><td><Badge>{r.Env}</Badge></td>
                <td>{r.Members}</td><td>{r['API keys']}</td><td>{r.Collections}</td>
                <td>{r.Owner}</td><td><Badge>{r.Status}</Badge></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                  {r.id !== sel?.id && <><Btn sm onClick={() => setSelId(r.id)}>Select</Btn>{' '}</>}
                  <Btn sm onClick={() => editWs(r)} title="Edit">✎</Btn>{' '}
                  {r.Status === 'archived'
                    ? <Btn sm onClick={() => unarchiveWorkspace(r.id)} title="Re-activate">↺</Btn>
                    : <Btn sm kind="dng" onClick={() => doArchive(r)} title="Archive">⊘</Btn>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sel && (
        <>
          <div className="section-h">{sel.Workspace} — workspace detail</div>
          <div className="grid g3">
            <Card title="Identity & boundary" sub="credential & isolation (§16.8)">
              <KV k="Environment"><Badge>{sel.Env}</Badge></KV>
              <KV k="Owner">{sel.Owner}</KV>
              <KV k="Status"><Badge>{sel.Status}</Badge></KV>
              <KV k="Isolation"><Badge>active</Badge></KV>
              <KV k="Secrets">{sel.Secrets} · JIT FetchSecret</KV>
            </Card>
            <Card title="Access" sub="issued at this boundary (ADR-0013)">
              <KV k="Members">{sel.Members}</KV>
              <KV k="API keys">{sel['API keys']}</KV>
              <KV k="Collections">{sel.Collections}</KV>
              <div className="flex" style={{ gap: 6, marginTop: 8 }}>
                <Btn sm onClick={() => nav('/users')}>Members</Btn>
                <Btn sm onClick={() => nav('/apikeys')}>API keys</Btn>
              </div>
            </Card>
            <Card title="Inherited defaults" sub="flow down to collections (ADR-0012)">
              <KV k="RBAC"><Badge>active</Badge></KV>
              <KV k="Rate limit">200 rps · b400 (ADR-0020)</KV>
              <KV k="IP policy">allow 203.0.113.0/24</KV>
              <KV k="Config">override per collection</KV>
            </Card>
          </div>
          <div className="flex mt" style={{ gap: 8 }}>
            <Btn kind="pri" onClick={() => nav('/settings')}>Open workspace settings</Btn>
            <Btn onClick={() => nav('/flows')}>View flows</Btn>
            <Btn kind="dng" onClick={archive}>Archive workspace</Btn>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Collection — overview of one collection ---------------- */
/* Workspace-level policy defaults a collection inherits unless it overrides them. */
const WS_POLICY = {
  'Rate limit': '200 rps · burst 400',
  'IP policy': 'allow 203.0.113.0/24',
  'Config': 'workspace defaults',
  'Secrets': 'workspace Vault scope',
};

/* locate a collection by path, returning the node + its ancestor trail */
/* ADR-0024 rollup helpers: count env/secret entries across a given list of flows */
const directFlowsEnvCount = (flows) => flows.reduce((n, f) => n + (Array.isArray(f.env) ? f.env.length : 0), 0);
const directFlowsSecCount = (flows) => flows.reduce((n, f) => n + (Array.isArray(f.secrets) ? f.secrets.length : 0), 0);

function findCollection(nodes, path, trail = []) {
  for (const n of nodes || []) {
    const here = [...trail, n];
    if (n.p === path) return { node: n, trail: here };
    const found = findCollection(n.children, path, here);
    if (found) return found;
  }
  return null;
}

function Collection() {
  const nav = useNavigate();
  const { scope, setScope, toast, confirm, openDrawer, db, createFlow, deleteFlow, createCollection, renameCollection, deleteCollection } = useApp();
  const [tab, setTab] = useState('over');
  const allFlows = db.flows;
  const [localGrants, setLocalGrants] = useState([]);
  const [overrides, setOverrides] = useState({});
  /* a different collection = fresh local grants / overrides */
  useEffect(() => { setLocalGrants([]); setOverrides({}); }, [scope.ws, scope.folder]);

  const tree = db.collectionTrees[scope.ws] || [];
  const hit = findCollection(tree, scope.folder);
  if (!scope.folder || scope.folder === '/' || !hit) return <Navigate to="/flows" replace />;

  const { node, trail } = hit;
  const path = node.p;
  const subs = node.children || [];
  const parent = trail.length > 1 ? trail[trail.length - 2] : null;
  const inSubtree = (f) => f.Workspace === scope.ws && (f.Collection === path || f.Collection.startsWith(path + '/'));
  const flows = allFlows.filter(inSubtree);
  /* ADR-0024: env/secrets owned per-flow, not per-collection. Rollup counts unique keys across flows in subtree. */
  const envKeySet = new Set();
  const secKeySet = new Set();
  flows.forEach((f) => {
    (f.env || []).forEach((e) => envKeySet.add(e.k));
    (f.secrets || []).forEach((s) => secKeySet.add(s.Name));
  });
  const envEff = envKeySet.size;
  const secEff = secKeySet.size;
  const envLocal = directFlowsEnvCount(flows.filter((f) => f.Collection === path));
  const secLocal = directFlowsSecCount(flows.filter((f) => f.Collection === path));
  const directFlows = flows.filter((f) => f.Collection === path);
  const live = flows.filter((f) => f.State === 'live').length;
  const subFlowCount = (p) => allFlows.filter((f) => f.Workspace === scope.ws && (f.Collection === p || f.Collection.startsWith(p + '/'))).length;

  const inherited = [
    { id: 'g-adm', Role: 'Admin', Subject: 'workspace owner', local: false },
    { id: 'g-dev', Role: 'Developer', Subject: '@' + scope.ws + '-engineers', local: false },
    { id: 'g-view', Role: 'Viewer', Subject: '@' + scope.ws + '-oncall', local: false },
  ];
  const roles = [...inherited, ...localGrants];

  const open = (p) => setScope({ ...scope, folder: p });
  const newFlow = () => nav('/designer/' + createFlow({ workspace: scope.ws, collection: path, name: 'new-flow' }));
  const newSub = () => openDrawer({
    title: 'New sub-collection', sub: 'inside ' + scope.ws + path,
    fields: [{ label: 'Name', value: 'new-collection' }],
    onSave: (v) => open(createCollection(scope.ws, path, v.Name)),
  });
  const delFlow = (r) => confirm({
    title: 'Delete ' + r.Flow + '?', sub: 'Archives the flow and stops reconciliation.',
    confirmLabel: 'Delete', onConfirm: () => deleteFlow(r.id),
  });
  const rename = () => openDrawer({
    title: 'Rename collection', sub: scope.ws + path,
    fields: [{ label: 'Name', value: node.name }, { label: 'Description', value: node.desc || '', type: 'textarea' }],
    onSave: (v) => renameCollection(scope.ws, node.p, { name: v.Name, desc: v.Description }, 'Collection updated'),
  });
  const del = () => confirm({
    title: 'Delete collection “' + node.name + '”?',
    sub: (flows.length || subs.length)
      ? `Holds ${flows.length} flow(s) and ${subs.length} sub-collection(s) — they will be moved to the workspace root.`
      : 'This collection is empty.',
    note: 'Irreversible. Audited (§16.9).', confirmLabel: 'Delete collection',
    onConfirm: () => {
      deleteCollection(scope.ws, node.p);
      if (parent) setScope({ ...scope, folder: parent.p });
    },
  });
  /* local grants are scope-bound; the Owner role is org-only so we exclude it here */
  const localRoleNames = (db.roles || []).filter((r) => r.Name !== 'Owner').map((r) => r.Name);
  const addGrant = () => openDrawer({
    title: 'Add local role grant', sub: 'scoped to ' + scope.ws + path,
    fields: [
      { label: 'Role',
        value: localRoleNames.includes('Developer') ? 'Developer' : (localRoleNames[0] || 'Viewer'),
        type: 'select', options: localRoleNames.length ? localRoleNames : ['Viewer'],
        help: 'Owner is org-scoped only — pick a workspace/collection-appropriate role.' },
      { label: 'Subject', value: 'user@acme.io' }],
    note: 'A local grant applies to this collection and every sub-collection below it.',
    onSave: (v) => { setLocalGrants((g) => [...g, { id: 'cg' + Date.now(), Role: v.Role, Subject: v.Subject, local: true }]); toast('Local grant added'); },
  });
  const toggleOverride = (k) => {
    if (overrides[k] != null) {
      setOverrides((o) => { const n = { ...o }; delete n[k]; return n; });
      toast(k + ' reset to inherited');
      return;
    }
    openDrawer({
      title: 'Override — ' + k, sub: 'local to ' + scope.ws + path,
      fields: [{ label: k, value: WS_POLICY[k] }],
      note: 'A local override applies to this collection and everything below it (nearest-ancestor-wins).',
      onSave: (v) => { setOverrides((o) => ({ ...o, [k]: v[k] })); toast(k + ' overridden locally'); },
    });
  };

  return (
    <div>
      <PageHead
        crumb={<Crumb extra={node.name} />}
        title={<>🗁 {node.name}</>}
        desc={node.desc}
        docref={`collection ${scope.ws}${path} · owner ${node.owner} · RBAC / config / secret inheritance boundary (ADR-0012)`}
        actions={<>
          <Btn onClick={rename}>Rename</Btn>
          <Btn onClick={newSub}>+ Sub-collection</Btn>
          <Btn kind="pri" onClick={newFlow}>+ New flow</Btn>
        </>} />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <Btn sm onClick={() => (parent ? open(parent.p) : nav('/flows'))}>↑ {parent ? parent.name : 'All flows'}</Btn>
        <span className="docref" style={{ margin: 0 }}>inside workspace <b>{scope.ws}</b></span>
        <span style={{ marginLeft: 'auto' }}><Btn sm kind="dng" onClick={del}>Delete collection</Btn></span>
      </div>
      <div className="grid g4 mb">
        <Metric k="Flows (total)" v={String(flows.length)} d={`${directFlows.length} direct here`} dk="flat" />
        <Metric k="Sub-collections" v={String(subs.length)} d="nested groups" dk="flat" />
        <Metric k="Live" v={`${live}/${flows.length}`} d="reconciled" dk="up" />
        <Metric k="Inherited policy" v={String(Object.keys(WS_POLICY).length - Object.keys(overrides).length)}
          d={`${Object.keys(overrides).length} local override(s)`} dk="flat" />
      </div>
      <Tabs active={tab} onChange={setTab} tabs={[
        { k: 'over', t: 'Overview' }, { k: 'flows', t: `Flows (${flows.length})` },
        { k: 'subs', t: `Sub-collections (${subs.length})` }, { k: 'access', t: 'Access & Inheritance' }]} />

      {tab === 'over' && (
        <div className="grid g2">
          <Card title="Sub-collections" sub="nested flow groups">
            {subs.length === 0
              ? <EmptyState icon="🗀" title="No sub-collections" sub="A leaf collection — it holds flows directly." />
              : subs.map((s) => (
                <div className="attn" key={s.p}>
                  <span className="a-dot" style={{ background: 'var(--accent2)' }} />
                  <span className="a-main"><div className="a-t">🗀 {s.name}</div><div className="a-s">{s.desc}</div></span>
                  <span style={{ color: 'var(--faint)', fontSize: 12, marginRight: 8 }}>{subFlowCount(s.p)} flows</span>
                  <Btn sm onClick={() => open(s.p)}>Open →</Btn>
                </div>
              ))}
          </Card>
          <Card title="Flows here" sub={`${flows.length} in this collection subtree`}>
            {flows.length === 0
              ? <EmptyState icon="≡" title="No flows yet" sub="Create the first flow in this collection."
                  action={<Btn sm kind="pri" onClick={newFlow}>+ New flow</Btn>} />
              : flows.slice(0, 6).map((f) => (
                <div className="attn" key={f.id}>
                  <span className="a-main"><div className="a-t">{f.Flow}</div><div className="a-s mono">{f.Collection}</div></span>
                  <Badge>{f.State}</Badge>
                </div>
              ))}
            {flows.length > 6 && <div style={{ marginTop: 10 }}><Btn sm onClick={() => setTab('flows')}>View all {flows.length} →</Btn></div>}
          </Card>
          <Card title="Access & inheritance" sub="resolved nearest-ancestor-wins (ADR-0012)" style={{ gridColumn: '1 / -1' }}>
            <KV k="Effective roles">{roles.length} — {localGrants.length} local · {inherited.length} inherited from workspace</KV>
            <KV k="Rate limit">{overrides['Rate limit'] || WS_POLICY['Rate limit']} <Badge>{overrides['Rate limit'] ? 'local override' : 'inherited'}</Badge></KV>
            <KV k="Secrets">{overrides['Secrets'] || WS_POLICY['Secrets']} <Badge>{overrides['Secrets'] ? 'local override' : 'inherited'}</Badge></KV>
            <div style={{ marginTop: 10 }}><Btn sm onClick={() => setTab('access')}>Manage access & inheritance →</Btn></div>
          </Card>
        </div>
      )}

      {tab === 'flows' && (
        <div className="tablecard">
          <table>
            <thead><tr>{['Flow', 'Collection', 'Trigger', 'Nodes', 'State', 'p95', ''].map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>
              {flows.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                  No flows in this collection yet — use “+ New flow”.</td></tr>
              ) : flows.map((f) => (
                <tr key={f.id} className="clickable" onClick={() => nav('/designer/' + f.id)}>
                  <td><b>{f.Flow}</b></td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{f.Collection}</td>
                  <td><Badge>{f.Trigger}</Badge></td>
                  <td>{f.Nodes}</td><td><Badge>{f.State}</Badge></td><td>{f.p95}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Btn sm onClick={(e) => { e.stopPropagation(); nav('/designer/' + f.id); }}>Open</Btn>{' '}
                    <Btn sm kind="dng" onClick={(e) => { e.stopPropagation(); delFlow(f); }}>Delete</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'subs' && (
        subs.length === 0
          ? <Card title="Sub-collections">
              <EmptyState icon="🗀" title="No sub-collections"
                sub="This is a leaf collection. Add a sub-collection to nest flows further."
                action={<Btn sm onClick={newSub}>+ Sub-collection</Btn>} />
            </Card>
          : <div className="grid g3">
            {subs.map((s) => (
              <Card key={s.p} title={<>🗀 {s.name}</>} sub={s.desc}>
                <KV k="Path"><span className="mono">{scope.ws}{s.p}</span></KV>
                <KV k="Owner">{s.owner}</KV>
                <KV k="Flows">{subFlowCount(s.p)}</KV>
                <KV k="Sub-collections">{(s.children || []).length}</KV>
                <Btn sm kind="pri" style={{ marginTop: 8 }} onClick={() => open(s.p)}>Open collection →</Btn>
              </Card>
            ))}
          </div>
      )}

      {tab === 'access' && (
        <>
          <Card title="Effective roles" sub="workspace grants + local grants — nearest-ancestor-wins (ADR-0012)">
            <div className="tablecard" style={{ marginTop: 10 }}>
              <table>
                <thead><tr>{['Role', 'Subject', 'Source', ''].map((c) => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>
                  {roles.map((r) => (
                    <tr key={r.id}>
                      <td><Badge>{r.Role}</Badge></td>
                      <td>{r.Subject}</td>
                      <td>{r.local ? <><Badge>local</Badge> this collection</> : <><Badge>inherited</Badge> workspace {scope.ws}</>}</td>
                      <td style={{ textAlign: 'right' }}>
                        {r.local
                          ? <Btn sm kind="dng" onClick={() => setLocalGrants((g) => g.filter((x) => x.id !== r.id))}>Remove</Btn>
                          : <span style={{ color: 'var(--faint)', fontSize: 12 }}>read-only</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 10 }}><Btn sm kind="pri" onClick={addGrant}>+ Add local grant</Btn></div>
          </Card>
          <Card title="Effective policy" sub="inherited from the workspace unless overridden here" style={{ marginTop: 16 }}>
            {Object.keys(WS_POLICY).map((k) => {
              const ov = overrides[k] != null;
              return (
                <div className="kv" key={k}>
                  <span style={{ minWidth: 90 }}>{k}</span>
                  <span style={{ flex: 1, margin: '0 14px' }}>
                    {ov ? overrides[k] : WS_POLICY[k]} <Badge>{ov ? 'local override' : 'inherited'}</Badge>
                  </span>
                  <Btn sm kind={ov ? 'dng' : ''} onClick={() => toggleOverride(k)}>{ov ? 'Reset to inherited' : 'Override'}</Btn>
                </div>
              );
            })}
            <p className="hint">An override applies to this collection and every sub-collection below it. The nearest ancestor with a value wins.</p>
          </Card>
          <Card title="Configuration & Secrets" sub="rollup across flows in this collection (ADR-0024)" style={{ marginTop: 16 }}>
            <div className="kv">
              <span style={{ minWidth: 110 }}>Unique env keys</span>
              <span style={{ flex: 1, margin: '0 14px' }}>
                <b>{envEff}</b> across {flows.length} flow{flows.length === 1 ? '' : 's'}
                {envLocal > 0 && <> <Badge>{envLocal} entries directly here</Badge></>}
              </span>
            </div>
            <div className="kv">
              <span style={{ minWidth: 110 }}>Unique secrets</span>
              <span style={{ flex: 1, margin: '0 14px' }}>
                <b>{secEff}</b> across {flows.length} flow{flows.length === 1 ? '' : 's'}
                {secLocal > 0 && <> <Badge>{secLocal} entries directly here</Badge></>}
              </span>
            </div>
            <div style={{ marginTop: 10 }}>
              <Btn sm kind="pri" onClick={() => nav('/env-report')}>Cross-flow Env Report →</Btn>
            </div>
            <p className="hint">
              Env and secrets live per-flow (ADR-0024) — edit each flow's settings in its Designer.
              This collection holds none directly. Secrets resolve JIT via FetchSecret — never persisted to disk (§16.8).
            </p>
          </Card>
        </>
      )}
    </div>
  );
}


/* ======================= src/screens/more.jsx ======================= */
