/* ======================= src/screens/more.jsx ======================= */

/* ---------------- Flows ---------------- */
function Flows() {
  const nav = useNavigate();
  const { scope, setScope, confirm, db, createFlow, updateFlow, deleteFlow, deployFlow, cloneFlow, openDrawer } = useApp();
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(new Set());
  /* page-local collection filter, seeded from sidebar scope; users can override */
  const [filterColl, setFilterColl] = useState(
    scope.folder && scope.folder !== '/' ? scope.folder : 'all',
  );
  const [filterState, setFilterState] = useState('all');     /* all | live | degraded | scaled to 0 */
  const [filterTrigger, setFilterTrigger] = useState('all'); /* all | HTTP | Kafka | Webhook | Timer | gRPC | Manual */
  const [sortBy, setSortBy] = useState(null); /* { key, dir: 'asc'|'desc' } */
  useEffect(() => {
    setFilterColl(scope.folder && scope.folder !== '/' ? scope.folder : 'all');
  }, [scope.folder, scope.ws]);
  /* clear selection whenever the visible set could change */
  useEffect(() => { setSelected(new Set()); }, [filterColl, filterState, filterTrigger, scope.ws]);

  /* flatten collection tree for the dropdown */
  const tree = db.collectionTrees[scope.ws] || [];
  const flat = [];
  const walk = (ns, depth) => (ns || []).forEach((n) => { flat.push({ p: n.p, label: '  '.repeat(depth) + n.name }); walk(n.children, depth + 1); });
  walk(tree, 0);

  const inFilter = (f) => filterColl === 'all'
    || f.Collection === filterColl
    || f.Collection.startsWith(filterColl + '/');
  const scoped = db.flows.filter((f) => f.Workspace === scope.ws && inFilter(f));
  /* cross-row enrichments (DLQ count, schedule presence, latest deployment) — precomputed for all rendering */
  const dlqByFlow = {}; db.dlq.filter((d) => d.Workspace === scope.ws).forEach((d) => { dlqByFlow[d.Flow] = (dlqByFlow[d.Flow] || 0) + 1; });
  const schedByFlow = {}; db.schedules.filter((s) => s.Workspace === scope.ws && (s.TargetType || 'flow') === 'flow' && s.enabled !== false).forEach((s) => { schedByFlow[s.Target || s.Flow] = (schedByFlow[s.Target || s.Flow] || 0) + 1; });
  const lastDeployByFlow = {};
  db.deployments.filter((d) => d.Workspace === scope.ws).forEach((d) => {
    if (!lastDeployByFlow[d.Flow]) lastDeployByFlow[d.Flow] = d; /* first wins because deployments are newest-first */
  });
  /* trigger options derived from data in this workspace */
  const triggers = Array.from(new Set(scoped.map((f) => f.Trigger))).sort();
  const states = Array.from(new Set(scoped.map((f) => f.State))).sort();
  let rows = scoped.filter((r) => (filterState === 'all' || r.State === filterState)
    && (filterTrigger === 'all' || r.Trigger === filterTrigger)
    && (!q || (r.Flow + r.Trigger + r.State + r.Collection + (r.Path || '')).toLowerCase().includes(q.toLowerCase())));
  /* sortable headers */
  if (sortBy) {
    const num = (s) => { const m = String(s || '').match(/(\d+(?:\.\d+)?)/); return m ? parseFloat(m[1]) : 0; };
    const cmp = sortBy.key === 'p95' || sortBy.key === 'Plan' ? (a, b) => num(a[sortBy.key]) - num(b[sortBy.key])
      : (a, b) => String(a[sortBy.key] || '').localeCompare(String(b[sortBy.key] || ''));
    rows = [...rows].sort((a, b) => (sortBy.dir === 'desc' ? -1 : 1) * cmp(a, b));
  }
  const toggleSort = (key) => setSortBy((s) => s && s.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' });
  const sortIcon = (key) => sortBy && sortBy.key === key ? (sortBy.dir === 'asc' ? ' ▲' : ' ▼') : '';

  const toggleOne = (id) => setSelected((s) => { const x = new Set(s); x.has(id) ? x.delete(id) : x.add(id); return x; });
  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someChecked = !allChecked && rows.some((r) => selected.has(r.id));
  const toggleAll = () => setSelected(() => allChecked ? new Set() : new Set(rows.map((r) => r.id)));

  const bulkDeploy = () => selected.forEach((id) => deployFlow(id));
  const bulkClone = () => selected.forEach((id) => cloneFlow(id));
  const bulkDelete = () => confirm({
    title: `Delete ${selected.size} flow${selected.size === 1 ? '' : 's'}?`,
    sub: 'All selected flows will be archived and stop reconciling.',
    note: 'Audited (§16.9).', confirmLabel: 'Delete',
    onConfirm: () => { Array.from(selected).forEach((id) => deleteFlow(id)); setSelected(new Set()); },
  });
  /* Flow templates — pre-built graphs so a new user does not face an empty
     canvas. Each template seeds a Trigger + a few logical steps that match
     a common pattern. Node ids are placeholder strings (Designer regenerates). */
  const FLOW_TEMPLATES = [
    { key: 'blank',   icon: '⬚', name: 'Blank flow',
      desc: 'Start from a single HTTP trigger and build the rest yourself.',
      trigger: 'HTTP',
      build: () => ({
        nodes: [{ id: 't1', kind: 'httptrigger', title: 'POST /entrypoint',
          x: 90, y: 230, config: { method: 'POST', path: '/entrypoint', auth: 'api-key', cors: false, timeoutSec: 30 } }],
        wires: [],
      }) },
    { key: 'http-api', icon: '🌐', name: 'HTTP API',
      desc: 'Public REST endpoint → validate → transform → return.',
      trigger: 'HTTP',
      build: () => ({
        nodes: [
          { id: 't1', kind: 'httptrigger', title: 'POST /orders', x: 90, y: 230,
            config: { method: 'POST', path: '/orders', auth: 'api-key', cors: true, timeoutSec: 30 } },
          { id: 'n2', kind: 'filter', title: 'validate', x: 320, y: 230,
            config: { predicate: 'amount > 0 and currency != null', onNoMatch: 'error' } },
          { id: 'n3', kind: 'jsontransform', title: 'normalize', x: 550, y: 230,
            config: { expression: '{ "id": $generate(), "data": $ }', outputVar: '' } },
          { id: 'n4', kind: 'httpresp', title: 'Return 200', x: 780, y: 230,
            config: { statusCode: 200, body: '{ "ok": true }', headers: [] } },
        ],
        wires: [['t1', 'n2'], ['n2', 'n3'], ['n3', 'n4']],
      }) },
    { key: 'kafka-pipeline', icon: '🔷', name: 'Kafka pipeline',
      desc: 'Consume topic → enrich → publish to downstream topic.',
      trigger: 'Kafka',
      build: () => ({
        nodes: [
          { id: 't1', kind: 'kafkatrig', title: 'consume orders.created', x: 90, y: 230,
            config: { topic: 'orders.created', consumerGroup: 'flow-' + scope.ws + '-pipeline', offsetReset: 'latest', maxBatch: 100, autoCommit: true } },
          { id: 'n2', kind: 'httpreq', title: 'GET customer', x: 320, y: 230,
            config: { method: 'GET', url: 'https://api.example.com/customers/{{msg.customer_id}}', headers: [], body: '', timeoutSec: 30, retries: 3 } },
          { id: 'n3', kind: 'jsontransform', title: 'enrich', x: 550, y: 230,
            config: { expression: '$merge([msg, { "customer": $$.customer }])', outputVar: '' } },
          { id: 'n4', kind: 'kafkapub', title: 'publish orders.enriched', x: 780, y: 230,
            config: { topic: 'orders.enriched', value: '$', partitionStrategy: 'hash-key', acks: 'all' } },
        ],
        wires: [['t1', 'n2'], ['n2', 'n3'], ['n3', 'n4']],
      }) },
    { key: 'cron-job', icon: '◷', name: 'Cron job',
      desc: 'Run every day at 02:00 → execute a function.',
      trigger: 'Timer',
      build: () => ({
        nodes: [
          { id: 't1', kind: 'cron', title: 'cron 0 2 * * *', x: 90, y: 230,
            config: { cron: '0 2 * * *', timezone: 'UTC', catchUp: false, payload: '{}' } },
          { id: 'n2', kind: 'code', title: 'nightly job', x: 320, y: 230, fnId: null,
            body: '⚠ pick a function' },
        ],
        wires: [['t1', 'n2']],
      }) },
    { key: 'webhook-receiver', icon: '🪝', name: 'Webhook receiver',
      desc: 'Signed inbound webhook (Stripe-style) → process → ack.',
      trigger: 'Webhook',
      build: () => ({
        nodes: [
          { id: 't1', kind: 'webhook', title: 'webhook /webhooks/stripe', x: 90, y: 230,
            config: { method: 'POST', path: '/webhooks/stripe', mode: 'webhook',
              signatureHeader: 'Stripe-Signature', signingSecretName: '', idempotencyHeader: 'Idempotency-Key' } },
          { id: 'n2', kind: 'switch', title: 'route by event', x: 320, y: 230,
            config: { switchExpr: 'event.type', cases: [
              { k: 'payment.succeeded', v: 'success' },
              { k: 'payment.failed',    v: 'failure' },
            ], defaultLabel: 'ignored' } },
          { id: 'n3', kind: 'httpresp', title: 'Return 200', x: 550, y: 230,
            config: { statusCode: 200, body: '{ "received": true }', headers: [] } },
        ],
        wires: [['t1', 'n2'], ['n2', 'n3']],
      }) },
  ];
  const create = () => {
    const coll = filterColl !== 'all' ? filterColl : db.collectionTrees[scope.ws]?.[0]?.p || '/';
    /* Two-pane drawer: template gallery + flow name. The user picks a template,
       enters a name, and lands in the Designer with the graph already wired. */
    let chosenTemplate = FLOW_TEMPLATES[0];
    const open = () => openDrawer({
      title: 'Create a new flow',
      sub: 'workspace · ' + scope.ws + ' · collection ' + coll,
      fields: [
        { section: 'Template',
          label: 'Pick a template', value: chosenTemplate.key, type: 'select',
          options: FLOW_TEMPLATES.map((t) => ({ value: t.key, label: `${t.icon}  ${t.name} — ${t.desc}` })),
          help: 'A template is a pre-built graph. You can edit every step afterwards in the Designer.' },
        { section: 'Identity',
          label: 'Name', value: 'new-' + chosenTemplate.key,
          help: 'Workspace-unique. Lowercase, alphanumeric, hyphens.' },
      ],
      saveLabel: 'Create flow',
      onSave: (v) => {
        const tmpl = FLOW_TEMPLATES.find((t) => t.key === v['Pick a template']) || FLOW_TEMPLATES[0];
        /* If the user changed the template select mid-form, the Name default no
           longer matches. Reopen with the updated name; otherwise create. */
        if (tmpl.key !== chosenTemplate.key) {
          chosenTemplate = tmpl;
          setTimeout(open, 60);
          return;
        }
        const id = createFlow({
          workspace: scope.ws, collection: coll, name: v.Name,
          graph: tmpl.build(), trigger: tmpl.trigger,
        });
        nav('/designer/' + id);
      },
    });
    open();
  };
  const TRIGGERS = ['HTTP', 'Kafka', 'Webhook', 'Timer', 'gRPC', 'Manual'];
  const editFlow = (r) => {
    const isHttp = r.Trigger === 'HTTP';
    openDrawer({
      title: 'Edit flow · ' + r.Flow,
      sub: 'workspace ' + r.Workspace + ' · ' + (r.Collection || '/'),
      fields: [
        { section: 'Identity', label: 'Name', value: r.Flow,
          help: 'Workspace-unique. Used in logs, audit, deployments.' },
        { label: 'Collection', value: r.Collection || '/', type: 'select',
          options: flat.length ? flat.map((c) => c.p) : ['/'],
          help: 'Move flow to another collection in this workspace.' },
        { section: 'Trigger',
          label: 'Trigger', value: r.Trigger, type: 'select', options: TRIGGERS,
          help: 'Changing trigger does not auto-update the Designer graph — review trigger node after save.' },
        ...(isHttp ? [
          { label: 'Method', value: r.Method || 'GET', type: 'select',
            options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
          { label: 'Path', value: r.Path || '/',
            help: 'Public callable path under the workspace gateway.' },
        ] : []),
      ],
      note: 'Metadata only. The Designer graph is edited separately. Audited (§16.9).',
      saveLabel: 'Save changes',
      onDelete: () => confirm({
        title: 'Delete "' + r.Flow + '"?', sub: 'Flow archived, stops reconciling.',
        confirmLabel: 'Delete', onConfirm: () => deleteFlow(r.id),
      }),
      onSave: (v) => {
        const patch = { Flow: v.Name, Collection: v.Collection, Trigger: v.Trigger };
        if (v.Trigger === 'HTTP') { patch.Method = v.Method; patch.Path = v.Path; }
        else { patch.Method = undefined; patch.Path = undefined; }
        updateFlow(r.id, patch, 'Flow "' + v.Name + '" updated');
      },
    });
  };

  const filterLabel = filterColl === 'all' ? 'all collections' : <>collection <b>{filterColl}</b> <span style={{ color: 'var(--faint)' }}>(incl. sub-collections)</span></>;
  return (
    <div>
      <PageHead crumb={<Crumb extra="Flows" />} title="Flows"
        desc="A flow is a DAG that orchestrates steps for a trigger. Steps are either inline (fast, fused into the engine) or Function nodes (containerised — referenced from the Functions registry). Workspace + collection scope this list."
        docref="flow-engine · dashboard §1 · ADR-0003/0004/0012 · CONCEPTS.md §2"
        actions={<Btn kind="pri" onClick={create}>+ New Flow</Btn>} />
      <p className="hint" style={{ marginTop: 0 }}>
        Showing <b>{scope.ws}</b> · {filterLabel} — {scoped.length} flow{scoped.length === 1 ? '' : 's'}.
      </p>
      <div className="flex mb" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="select" value={filterColl} onChange={(e) => setFilterColl(e.target.value)} aria-label="Collection filter">
          <option value="all">All collections</option>
          {flat.map((c) => <option key={c.p} value={c.p}>{c.label}  ({c.p})</option>)}
        </select>
        <div className="field" style={{ margin: 0, flex: 1, minWidth: 180, maxWidth: 360 }}>
          <input placeholder="Filter by name, trigger, path, collection…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {(states.length > 1 || triggers.length > 1) && (
        <div className="flex mb" style={{ gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          {states.length > 1 && (
            <div className="chipset">
              <span className="chipset-lbl">State</span>
              <button type="button" className={'chip' + (filterState === 'all' ? ' on' : '')} onClick={() => setFilterState('all')}>All</button>
              {states.map((st) => (
                <button key={st} type="button" className={'chip' + (filterState === st ? ' on' : '')} onClick={() => setFilterState(st)}>
                  {st} <span className="chip-n">{scoped.filter((f) => f.State === st).length}</span>
                </button>
              ))}
            </div>
          )}
          {triggers.length > 1 && (
            <div className="chipset">
              <span className="chipset-lbl">Trigger</span>
              <button type="button" className={'chip' + (filterTrigger === 'all' ? ' on' : '')} onClick={() => setFilterTrigger('all')}>All</button>
              {triggers.map((tr) => (
                <button key={tr} type="button" className={'chip' + (filterTrigger === tr ? ' on' : '')} onClick={() => setFilterTrigger(tr)}>
                  {tr} <span className="chip-n">{scoped.filter((f) => f.Trigger === tr).length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {selected.size > 0 && (
        <div className="note mb" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 0 }}>
          <b>{selected.size} selected</b>
          <span style={{ flex: 1 }} />
          <Btn sm onClick={bulkDeploy}>Deploy all</Btn>
          <Btn sm onClick={bulkClone}>Clone all</Btn>
          <Btn sm kind="dng" onClick={bulkDelete}>Delete all</Btn>
          <Btn sm onClick={() => setSelected(new Set())}>Clear</Btn>
        </div>
      )}
      {(() => {
        const wsAllFlows = db.flows.filter((f) => f.Workspace === scope.ws);
        if (wsAllFlows.length === 0) {
          const wsCounts = {};
          db.flows.forEach((f) => { wsCounts[f.Workspace] = (wsCounts[f.Workspace] || 0) + 1; });
          return (
            <WsEmptyState icon="≡" scope={scope} title="No flows in"
              description={<>This workspace doesn't have any flows yet. Create your first flow with the button above, or switch to a workspace that has them.</>}
              wsCounts={wsCounts}
              onSwitchWs={(ws) => setScope({ ...scope, ws, folder: '/' })}
              cta={<Btn kind="pri" onClick={create}>+ New Flow</Btn>}
              footerHint={<>A flow is a DAG that orchestrates steps for a trigger (ADR-0003/0004). Once created, deploy it from the Designer.</>}
            />
          );
        }
        return null;
      })()}
      {db.flows.filter((f) => f.Workspace === scope.ws).length > 0 && (
      <div className="tablecard">
        <table>
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input type="checkbox" aria-label="Select all visible"
                  checked={allChecked}
                  ref={(el) => { if (el) el.indeterminate = someChecked; }}
                  onChange={toggleAll} />
              </th>
              <th className="sortable" onClick={() => toggleSort('Flow')}>Flow{sortIcon('Flow')}</th>
              <th>Trigger / Path</th>
              <th className="sortable" onClick={() => toggleSort('Collection')}>Collection{sortIcon('Collection')}</th>
              <th>Nodes</th>
              <th className="sortable" onClick={() => toggleSort('Plan')} title="Last published plan version">Plan{sortIcon('Plan')}</th>
              <th className="sortable" onClick={() => toggleSort('State')}>State{sortIcon('State')}</th>
              <th className="sortable" onClick={() => toggleSort('p95')}>p95{sortIcon('p95')}</th>
              <th>Signals</th>
              <th>Last deploy</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={11} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                {scoped.length === 0
                  ? <>No flows in collection <b className="mono">{filterColl}</b>. <button type="button" className="addf" onClick={() => setFilterColl('all')}>Show all collections</button></>
                  : <>No flows match. <button type="button" className="addf" onClick={() => { setQ(''); setFilterState('all'); setFilterTrigger('all'); }}>Clear filters</button></>}
              </td></tr>
            ) : rows.map((r) => {
              const dlqN = dlqByFlow[r.Flow] || 0;
              const schedN = schedByFlow[r.Flow] || 0;
              const lastDep = lastDeployByFlow[r.Flow];
              const p95n = parseFloat((r.p95 || '').match(/\d+(?:\.\d+)?/)?.[0] || '0');
              const p95cls = !r.p95 || r.p95 === '—' ? '' : p95n > 200 ? 'b-warn' : p95n > 500 ? 'b-dng' : 'b-ok';
              const runNow = (e) => { e.stopPropagation(); confirm({
                title: 'Run "' + r.Flow + '" once?', sub: 'Manual test invocation; audited (§16.9). Uses default trigger payload.',
                confirmLabel: 'Run', onConfirm: () => { deployFlow(r.id); /* re-use as audited fire */ },
              }); };
              return (
              <tr key={r.id} className="clickable" onClick={() => nav('/designer/' + r.id)}>
                <td onClick={(e) => e.stopPropagation()} style={{ width: 36 }}>
                  <input type="checkbox" aria-label={'Select ' + r.Flow}
                    checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} />
                </td>
                <td><b>{r.Flow}</b></td>
                <td>
                  <Badge>{r.Trigger}</Badge>
                  {r.Method && r.Path && <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6 }}>{r.Method} {r.Path}</span>}
                </td>
                <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{r.Collection}</td>
                <td style={{ fontSize: 12 }}>{r.Nodes}</td>
                <td className="mono" title="Last published plan version (PlanSpec)">{r.Plan}</td>
                <td><Badge>{r.State}</Badge></td>
                <td><span className={'badge ' + p95cls}>{r.p95 || '—'}</span></td>
                <td>
                  <span style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
                    {schedN > 0 && (
                      <span className="badge b-info" title={schedN + ' active schedule(s) target this flow'}
                        onClick={(e) => { e.stopPropagation(); nav('/scheduler'); }} style={{ cursor: 'pointer' }}>
                        ⏱ {schedN}
                      </span>
                    )}
                    {dlqN > 0 && (
                      <span className="badge b-dng" title={dlqN + ' message(s) in DLQ'}
                        onClick={(e) => { e.stopPropagation(); nav('/dlq'); }} style={{ cursor: 'pointer' }}>
                        ⚠ {dlqN}
                      </span>
                    )}
                  </span>
                </td>
                <td style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {lastDep
                    ? <span title={lastDep.Author + ' · ' + lastDep.Trigger + ' · ' + lastDep.Status}>
                        <span className="mono">{lastDep.Version}</span> · {lastDep.Started}
                      </span>
                    : <span style={{ color: 'var(--faint)' }}>never</span>}
                </td>
                <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <Btn sm onClick={runNow} title="Manual test invocation">▶</Btn>{' '}
                  <Btn sm onClick={(e) => { e.stopPropagation(); deployFlow(r.id); }} title="Deploy">⇡</Btn>{' '}
                  <Btn sm onClick={(e) => { e.stopPropagation(); editFlow(r); }} title="Edit metadata">✎</Btn>{' '}
                  <Btn sm onClick={(e) => { e.stopPropagation(); cloneFlow(r.id); }} title="Clone">⎘</Btn>{' '}
                  <Btn sm kind="dng" onClick={(e) => { e.stopPropagation(); confirm({
                    title: 'Delete "' + r.Flow + '"?', sub: 'Flow archived, stops reconciling.',
                    confirmLabel: 'Delete', onConfirm: () => deleteFlow(r.id),
                  }); }} title="Delete">🗑</Btn>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

/* ---------------- Deployments ---------------- */
/* Canary step progression used by the inline 'Canary →' button. After 100% it
   becomes equivalent to Promote. */
const CANARY_STEPS = [10, 25, 50, 100];
function TrafficBar({ pct }) {
  const p = Math.max(0, Math.min(100, Number(pct) || 0));
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--muted)', marginBottom: 4,
      }}>
        <span>traffic split</span>
        <span style={{ marginLeft: 'auto' }}>
          new <b className="mono" style={{ color: 'var(--accent)' }}>{p}%</b>
          {' · '}previous <b className="mono">{100 - p}%</b>
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'var(--panel3)', overflow: 'hidden', display: 'flex' }}>
        <div style={{ width: p + '%', background: 'var(--accent)', transition: 'width .35s' }} />
        <div style={{ width: (100 - p) + '%', background: 'var(--border2)' }} />
      </div>
    </div>
  );
}

/* Per-stage durations for the live progress animation (ms). Tuned so the
   whole pipeline finishes in ~5 seconds — feels responsive but real. */
const STAGE_DURATIONS_MS = [400, 1500, 700, 500, 1500];

function Deployments() {
  const nav = useNavigate();
  const { scope, setScope, confirm, db, promoteDeployment, rollbackDeployment,
    canaryShift, requestApproval, approveDeployment,
    advanceDeploymentStage, cancelScheduledDeployment } = useApp();
  /* Live pipeline ticker — advances any deployment whose pipeline.stageIdx is
     still below the total. Runs once per render, sets a single timeout per
     in-flight deployment. */
  useEffect(() => {
    const inFlight = (db.deployments || []).filter((d) =>
      d.pipeline && d.pipeline.stageIdx < (d.pipeline.stages || []).length
      && (d.Status === 'rolling out' || d.Status === 'dry-run' || d.Status === 'canary' || (d.Status === 'pending approval' && d.pipeline.stageIdx > 0)));
    const timers = inFlight.map((dep) => {
      const idx = dep.pipeline.stageIdx;
      const ms = STAGE_DURATIONS_MS[idx] || 500;
      return setTimeout(() => advanceDeploymentStage(dep.id), ms);
    });
    return () => timers.forEach(clearTimeout);
  }, [db.deployments, advanceDeploymentStage]);
  const history = db.deployments.filter((d) => d.Workspace === scope.ws);
  const rollingOut = history.filter((d) => d.Status === 'rolling out').length;
  const latest = history[0];
  const wsCounts = {};
  db.deployments.forEach((d) => { wsCounts[d.Workspace] = (wsCounts[d.Workspace] || 0) + 1; });
  return (
    <div>
      <PageHead crumb={<Crumb extra="Deployments" />} title="Deployments — declarative reconcile"
        desc="Build → atomic publish (PlanSpec) → control plane reconciles → double-buffer + drain → status-gated promote / rollback. CI/GitOps publish desired state; never push to the data plane."
        docref="build · control-plane §3/§12 · ADR-0005/0009/0022"
        actions={<Btn kind="pri" onClick={() => nav('/flows')}>Deploy a flow →</Btn>} />
      <div className="note">CI / GitOps submits a <b>commit ref</b> · polls <span className="mono">observedGeneration</span> to gate · placement & scale stay platform-owned (ADR-0022).</div>
      <div className="grid g4 mb">
        <Metric k="Deployments" v={String(history.length)} d={'in ' + scope.ws} dk="flat" />
        <Metric k="Rolling out" v={String(rollingOut)} d="awaiting promote" dk="flat" />
        <Metric k="Reconciled" v={String(history.filter((d) => d.Status === 'reconciled').length)} d="healthy" dk="up" />
        <Metric k="Rolled back" v={String(history.filter((d) => d.Status === 'rolled back').length)} d="reverted" dk="flat" />
      </div>
      {latest && (
        <Card title={`Latest — ${latest.Flow} ${latest.Version}`}
          sub={`${latest.Status} · ${latest.Trigger} · started ${latest.Started}`} style={{ marginBottom: 16 }}>
          <Stepper steps={(() => {
            /* Drive the Stepper from the deployment's `pipeline.stageIdx`. The
               useEffect above advances it on a timer; the UI re-renders each tick. */
            const p = latest.pipeline;
            const stages = (p && p.stages) || ['Validate', 'BuildKit', 'Sign + attest', 'Push @sha', 'Reconcile'];
            const idx = p ? p.stageIdx : stages.length;
            return [
              ...stages.map((label, i) => ({
                t: label,
                state: i < idx ? 'done' : i === idx ? 'active' : '',
              })),
              { t: 'Promote',
                state: latest.Status === 'reconciled' ? 'done'
                  : (latest.Traffic === 100 ? 'done' : (idx >= stages.length ? 'active' : '')) },
            ];
          })()} />
          {(latest.Status === 'rolling out' || latest.Status === 'canary') && (
            <>
              <TrafficBar pct={latest.Traffic ?? 0} />
              <div className="flex mt" style={{ gap: 8, flexWrap: 'wrap' }}>
                {CANARY_STEPS.filter((s) => s > (latest.Traffic || 0)).slice(0, 1).map((s) => (
                  <Btn key={s} sm kind="pri" onClick={() => canaryShift(latest.id, s)}>
                    Canary → {s}%
                  </Btn>
                ))}
                <Btn sm onClick={() => promoteDeployment(latest.id)}>Promote → 100%</Btn>
                <Btn sm kind="dng" onClick={() => confirm({
                  title: 'Rollback ' + latest.Flow + ' ' + latest.Version + '?',
                  sub: 'Reverts to the previous live version. New traffic stops flowing to this release.',
                  confirmLabel: 'Rollback',
                  onConfirm: () => rollbackDeployment(latest.id),
                })}>Rollback</Btn>
              </div>
            </>
          )}
          {latest.Status === 'pending approval' && (
            <div className="note mt" style={{ borderLeft: '3px solid var(--warn)' }}>
              ⏳ Waiting for an approver to release this version into canary.
              <div className="flex mt" style={{ gap: 8 }}>
                <Btn sm kind="pri" onClick={() => approveDeployment(latest.id)}>✓ Approve & start canary</Btn>
                <Btn sm kind="dng" onClick={() => rollbackDeployment(latest.id)}>Reject</Btn>
              </div>
            </div>
          )}
        </Card>
      )}
      <Card title="Deployment history" sub={`${scope.ws} · newest first`}>
        {history.length === 0 ? (
          <div style={{ marginTop: 10 }}>
            <WsEmptyState icon="▤" scope={scope} title="No deployments in"
              description={<>This workspace hasn't deployed anything yet. Deployments appear here once you Deploy a flow from the Designer (or your CI/GitOps pipeline publishes a PlanSpec).</>}
              wsCounts={wsCounts}
              onSwitchWs={(ws) => setScope({ ...scope, ws, folder: '/' })}
              cta={<Btn kind="pri" onClick={() => nav('/flows')}>Open Flows →</Btn>}
              footerHint={<>Declarative reconcile: CI/GitOps submits a commit ref + observedGeneration poll gates rollout (ADR-0005/0022).</>} />
          </div>
        ) : (
        <div className="tablecard" style={{ marginTop: 10 }}>
          <table>
            <thead><tr>{['Flow', 'Version', 'Author', 'Trigger', 'Started', 'Traffic', 'Status', ''].map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>
              {history.map((d) => {
                const t = d.Traffic ?? (d.Status === 'reconciled' ? 100 : d.Status === 'rolled back' ? 0 : null);
                const inFlight = d.Status === 'rolling out' || d.Status === 'canary';
                /* Past reconciled versions for this same flow — targets for
                   "Rollback to..." dropdown. Excludes the current row itself. */
                const rollbackTargets = history.filter((x) =>
                  x.Flow === d.Flow && x.id !== d.id
                  && (x.Status === 'reconciled' || x.Status === 'rolled back'))
                  .map((x) => x.Version);
                const isScheduled = d.Status === 'scheduled';
                const isDryRun = d.dryRun;
                return (
                <tr key={d.id} style={isScheduled ? { opacity: 0.85 } : isDryRun ? { opacity: 0.7 } : null}>
                  <td><b>{d.Flow}</b>{isDryRun && <> <Badge>dry-run</Badge></>}</td>
                  <td className="mono">{d.Version}</td>
                  <td>{d.Author}</td><td><Badge>{d.Trigger}</Badge></td>
                  <td>
                    {isScheduled
                      ? <span style={{ color: 'var(--info)' }}>{new Date(d.scheduledFor).toLocaleString()}</span>
                      : d.Started}
                  </td>
                  <td className="mono" style={{ fontSize: 12 }}>{t == null ? '—' : t + '%'}</td>
                  <td><Badge>{d.Status}</Badge></td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {isScheduled && (
                      <Btn sm kind="dng" onClick={() => cancelScheduledDeployment(d.id)}>Cancel</Btn>
                    )}
                    {d.Status === 'pending approval' && (
                      <><Btn sm kind="pri" onClick={() => approveDeployment(d.id)}>✓ Approve</Btn>{' '}</>
                    )}
                    {inFlight && CANARY_STEPS.filter((s) => s > (d.Traffic || 0)).slice(0, 1).map((s) => (
                      <span key={s}><Btn sm onClick={() => canaryShift(d.id, s)}>→ {s}%</Btn>{' '}</span>
                    ))}
                    {inFlight && <><Btn sm kind="pri" onClick={() => promoteDeployment(d.id)}>Promote</Btn>{' '}</>}
                    {!isScheduled && !isDryRun && d.Status !== 'rolled back' && d.Status !== 'pending approval' && (
                      rollbackTargets.length > 1
                        ? <select className="select" style={{ padding: '4px 6px', fontSize: 12 }} value=""
                            onChange={(e) => { const tv = e.target.value; if (tv) rollbackDeployment(d.id, tv); }}>
                            <option value="">Rollback to…</option>
                            {rollbackTargets.map((v) => <option key={v} value={v}>{v}</option>)}
                          </select>
                        : <Btn sm kind="dng" onClick={() => rollbackDeployment(d.id)}>Rollback</Btn>
                    )}
                    {d.Status === 'rolled back' && <span style={{ color: 'var(--faint)', fontSize: 12 }}>reverted</span>}
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------- Monitoring ---------------- */
/* Mock log generator — deterministic per workspace so the demo feels stable. */
function generateLogs(scope, count) {
  const LEVELS = ['INFO', 'OK', 'WARN', 'ERR'];
  const TEMPLATES = [
    'gateway: req accepted exec={exec} adapter=http authz=ok',
    'runner: {fn} warm hit (no cold start)',
    'backpressure: inbox 410/512 → ingress pause 4ms',
    'engine: result published sink=http-resp {ms}ms',
    'webhook-fanout: sink 503 → DLQ (replayable)',
    'KEDA: scaled {fn} 2 → 4 (broker lag 240)',
    'kafka: consumer assigned partition=7 group=flow-{ws}-pipeline',
    'engine: WAL flush 32 events ack=all',
    'gateway: rate-limit hit · key=evd_pk_… retry after 1s',
    'runner: {fn} cold start 142ms (firecracker)',
    'engine: outbox commit 8 events idempotency-key=match',
    'gateway: cors preflight allowed · origin=https://app.example.com',
  ];
  const rows = [];
  const baseTs = Date.now();
  for (let i = 0; i < count; i++) {
    const ts = new Date(baseTs - i * (3000 + (i % 7) * 500));
    const lvlIdx = (i * 13) % 11;
    const level = lvlIdx < 6 ? 'INFO' : lvlIdx < 8 ? 'OK' : lvlIdx < 10 ? 'WARN' : 'ERR';
    const tmpl = TEMPLATES[(i * 7) % TEMPLATES.length];
    const msg = tmpl
      .replace('{exec}', '01HX' + ((9999 - i) % 9999) + 'F' + (i % 9))
      .replace('{ms}', String(40 + ((i * 17) % 200)))
      .replace('{fn}',  ['risk-score', 'fraud-model', 'pdf-render', 'fanout-worker'][i % 4])
      .replace('{ws}',  scope.ws || 'workspace');
    rows.push({ ts: ts.toISOString().slice(11, 23), level, msg });
  }
  return rows;
}

function Monitoring() {
  const nav = useNavigate();
  const { toast, scope, db } = useApp();
  const [tab, setTab] = useState('met');
  const [range, setRange] = useState('1h');
  const [logQ, setLogQ] = useState('');
  const [logLevel, setLogLevel] = useState('all');
  /* Refresh bumps `tick` so jittered/derived numbers (p95) recompute. db itself is reactive. */
  const [tick, setTick] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(() => new Date().toLocaleTimeString());
  const refresh = () => {
    setTick((t) => t + 1);
    const ts = new Date().toLocaleTimeString();
    setLastRefresh(ts);
    toast('Refreshed at ' + ts);
  };
  const wsFlows = db.flows.filter((f) => f.Workspace === scope.ws);
  const liveCount = wsFlows.filter((f) => f.State === 'live').length;
  const degraded = wsFlows.filter((f) => f.State === 'degraded');
  const dlqCount = db.dlq.filter((d) => d.Workspace === scope.ws).length;
  /* deterministic-per-tick jitter so p95 nudges on refresh without flickering inside one render */
  const p95 = (() => { const base = 86; const j = ((tick * 7) % 11) - 5; return Math.max(40, base + j); })();
  const dotOf = (s) => (s === 'degraded' ? 'var(--danger)' : s === 'live' ? 'var(--ok)' : 'var(--warn)');
  return (
    <div>
      <PageHead crumb={<Crumb extra="Monitoring" />} title="Monitoring"
        desc="Tenant-scoped metrics, live logs, per-ExecID traces, autoscaling — same OTel pipeline, metering off the hot path."
        docref="dashboard §7 · flow-engine §14 · ADR-0007/0011"
        actions={<>
          <span style={{ fontSize: 11, color: 'var(--faint)' }} title="Last refresh">last {lastRefresh}</span>
          <select className="select" value={range} aria-label="Time range"
            onChange={(e) => { setRange(e.target.value); toast('Range: ' + e.target.value); }}>
            {['15m', '1h', '6h', '24h', '7d'].map((r) => <option key={r}>{r}</option>)}
          </select>
          <Btn onClick={refresh}>↻ Refresh</Btn>
        </>} />
      <Tabs active={tab} onChange={setTab} tabs={[{ k: 'met', t: 'Metrics' }, { k: 'log', t: 'Logs' }, { k: 'tr', t: 'Traces' }, { k: 'as', t: 'Autoscaling' }]} />
      {tab === 'met' && (<>
        <div className="grid g4 mb">
          <Metric k="Live flows" v={`${liveCount}/${wsFlows.length}`} d="reconciled" dk="up" />
          <Metric k="Degraded" v={String(degraded.length)} d={degraded.length ? 'needs attention' : 'all healthy'} dk={degraded.length ? 'flat' : 'up'} />
          <Metric k="DLQ depth" v={String(dlqCount)} d="parked messages" dk={dlqCount ? 'flat' : 'up'} />
          <Metric k="p95 latency" v={p95 + ' ms'} d="— within SLO" dk="flat" />
        </div>
        <Card title="Flow health" sub={`${scope.ws} · live state per flow`}>
          {wsFlows.length === 0
            ? <p className="hint" style={{ margin: 0 }}>No flows in this workspace.</p>
            : wsFlows.map((f) => (
              <div className="attn" key={f.id}>
                <span className="a-dot" style={{ background: dotOf(f.State) }} />
                <span className="a-main"><div className="a-t">{f.Flow}</div>
                  <div className="a-s">{f.Trigger} · {f.Nodes} · p95 {f.p95}</div></span>
                <Badge>{f.State}</Badge>
                {f.State === 'degraded' && <Btn sm onClick={() => nav('/dlq')}>View DLQ →</Btn>}
              </div>
            ))}
        </Card>
        <div className="grid g3" style={{ marginTop: 16 }}>
          <Card title={`Latency p50 · ${range}`}>
            <Spark data={[28, 30, 26, 32, 29, 28, 31, 35, 30, 27, 29, 28]} />
            <KV k="current">{Math.max(20, p95 - 60)} ms</KV>
          </Card>
          <Card title={`Latency p95 · ${range}`}>
            <Spark data={[50, 45, 60, 48, 70, 55, 62, 90, 58, 52, 66, 49]} />
            <KV k="current">{p95} ms</KV>
          </Card>
          <Card title={`Latency p99 · ${range}`}>
            <Spark data={[110, 130, 105, 145, 125, 160, 140, 200, 135, 120, 150, 115]} />
            <KV k="current">{p95 + 50} ms</KV>
          </Card>
        </div>
        <Card title={`Throughput · ${range}`} sub="requests / second" style={{ marginTop: 16 }}>
          <Spark data={[120, 145, 180, 210, 250, 280, 240, 200, 230, 260, 290, 270]} />
        </Card>
      </>)}
      {tab === 'log' && (() => {
        const all = generateLogs(scope, 50);
        const filtered = all.filter((l) => {
          if (logLevel !== 'all' && l.level !== logLevel) return false;
          if (logQ && !l.msg.toLowerCase().includes(logQ.toLowerCase())) return false;
          return true;
        });
        return (
          <>
            <div className="flex mb" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="field" style={{ margin: 0, flex: 1, minWidth: 220, maxWidth: 360 }}>
                <input placeholder="Search log line…" value={logQ} onChange={(e) => setLogQ(e.target.value)} />
              </div>
              <select className="select" value={logLevel} onChange={(e) => setLogLevel(e.target.value)} aria-label="Log level">
                <option value="all">All levels</option>
                <option value="INFO">INFO</option>
                <option value="OK">OK</option>
                <option value="WARN">WARN</option>
                <option value="ERR">ERR</option>
              </select>
              <Btn sm onClick={() => { setLogQ(''); setLogLevel('all'); }}>Clear</Btn>
            </div>
            <p className="hint" style={{ marginTop: -6 }}>{filtered.length} of {all.length} lines · last {range}.</p>
            <div className="logbox" style={{ maxHeight: 520, overflow: 'auto' }}>
              {filtered.length === 0
                ? <div style={{ padding: 16, color: 'var(--muted)', textAlign: 'center' }}>No matching log lines.</div>
                : filtered.map((l, i) => (
                  <div className="logline" key={i}>
                    <span style={{ color: 'var(--faint)' }}>{l.ts}</span>
                    <span className={'lv-' + l.level}>{l.level}</span>
                    <span>{l.msg}</span>
                  </div>
                ))}
            </div>
          </>
        );
      })()}
      {tab === 'tr' && (() => {
        /* Mock recent ExecIDs — would come from APM in prod. */
        const recentExecs = wsFlows.slice(0, 4).map((f, i) => ({
          id: '01HX' + (8 + i).toString().padStart(2, '0') + 'Z' + (i % 10),
          flow: f.Flow,
          ts: i + 'm ago',
          status: i === 0 && f.State === 'degraded' ? 'failed' : 'ok',
          totalMs: 86 + ((i * 23) % 60),
        }));
        const spans = [
          ['gateway.decode+authz', 0, 8],
          ['bus.enqueue',          8, 5],
          ['engine.auth',         13, 9],
          ['runner.risk-score',   27, 55],
          ['sink.http-resp',      88, 12],
        ];
        return (
          <>
            <Card title="Recent traces" sub="click an ExecID to view its waterfall">
              <div className="tablecard">
                <table>
                  <thead><tr>{['ExecID', 'Flow', 'Total', 'Status', 'When'].map((c) => <th key={c}>{c}</th>)}</tr></thead>
                  <tbody>
                    {recentExecs.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                        No recent executions in this workspace.
                      </td></tr>
                    ) : recentExecs.map((e) => (
                      <tr key={e.id} className="clickable" onClick={() => toast('Trace ' + e.id + ' selected (showing first below)')}>
                        <td className="mono">{e.id}</td>
                        <td><b>{e.flow}</b></td>
                        <td className="mono">{e.totalMs} ms</td>
                        <td><Badge>{e.status}</Badge></td>
                        <td style={{ color: 'var(--faint)' }}>{e.ts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card title={'Waterfall · exec ' + (recentExecs[0]?.id || '—') + ' — ' + (recentExecs[0]?.flow || '—')}
              sub="one ExecID → one owning replica (ADR-0011)" style={{ marginTop: 16 }}>
              {spans.map((s, i) => (
                <div className="tspan" key={i}>
                  <span className="nm">{s[0]}</span>
                  <div className="bw"><div className="seg" style={{ left: s[1] + '%', width: s[2] + '%' }}>{s[2]}ms</div></div>
                </div>
              ))}
              <p className="hint" style={{ marginTop: 12 }}>
                Total: {spans.reduce((n, s) => n + s[2], 0)}ms · 5 spans · sampled at 100% (demo).
              </p>
            </Card>
          </>
        );
      })()}
      {tab === 'as' && (
        <div className="grid g3">
          <Card title="KEDA — risk-score" sub="scale on leading indicators"><KV k="signal">broker lag + concurrency</KV><KV k="replicas">1 → 12</KV><KV k="activation"><Badge>active</Badge></KV></Card>
          <Card title="Sync tiers" sub="never scale to zero"><KV k="gateway">HPA min 2 · now 6</KV><KV k="NestJS">min 2 · now 2</KV></Card>
          <Card title="Cluster" sub="Karpenter + spot"><KV k="nodes">14 (4 spot)</KV><KV k="overprovision"><Badge>active</Badge></KV></Card>
        </div>
      )}
    </div>
  );
}

/* ---------------- Live Visualizer ---------------- */
function Visualizer() {
  const { openDrawer } = useApp();
  const [tap, setTap] = useState(false);
  const [i, setI] = useState(0);
  const [ev, setEv] = useState(0);
  const [sel, setSel] = useState(null);
  const order = ['httpin', 'auth', 'sw', 'risk', 'join', 'resp'];
  const timer = useRef(null);
  useEffect(() => {
    if (tap) {
      timer.current = setInterval(() => { setI((x) => x + 1); setEv((e) => e + 7); }, 650);
      return () => clearInterval(timer.current);
    }
  }, [tap]);
  useEffect(() => {
    if (!sel) return;
    openDrawer({
      title: 'Node — ' + sel, sub: 'live (sampled · ADR-0019)',
      fields: [
        { label: 'Requests/s', value: '1,240', ro: true },
        { label: 'p95', value: '86 ms', ro: true },
        { label: 'Errors', value: '0.2%', ro: true },
        { label: 'Replicas', value: '1 → 12', ro: true },
        { label: 'Alert threshold (p95 ms)', value: '250' },
        { label: 'Sample rate', value: '1/50', type: 'select', options: ['1/10', '1/50', '1/100', 'off'] }],
      note: 'Heatmap is free (from metrics). Per-request animation needs the opt-in Flow Tap.',
      saveLabel: 'Save', onSave: () => setSel(null),
    });
  }, [sel, openDrawer]);
  return (
    <div>
      <PageHead crumb={<Crumb extra="Live Visualizer" />} title="Live Flow Visualizer"
        desc="Always-on aggregate heatmap from metrics (free). Opt-in sampled Flow Tap — time-boxed, drop-on-overload, tenant-scoped, audited. Off the hot path."
        docref="ADR-0019 · dashboard §7 · flow-engine §14"
        actions={<Btn kind={tap ? 'dng' : 'pri'} onClick={() => setTap(!tap)}>{tap ? '■ Stop Flow Tap' : '▶ Start Flow Tap'}</Btn>} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        <Card title="Topology — payments-api" sub="click any node for live metrics + alert threshold">
          <FlowCanvas heat ping={tap ? order[i % order.length] : null} onSelect={setSel} />
        </Card>
        <Card title="Flow Tap session" sub="sampled · TTL · best-effort">
          <KV k="mode"><Badge>{tap ? 'active' : 'disabled'}</Badge></KV>
          <KV k="sampling">1 / 50 (2%)</KV><KV k="events">{ev.toLocaleString()}</KV>
          <KV k="dropped">0 <Badge>healthy</Badge></KV><KV k="payloads"><Badge>read-only</Badge> metadata only</KV>
          <p className="hint">Payload capture is a separate audited, TTL'd privileged action (§16.8/§16.9).</p>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- DLQ ---------------- */
function Dlq() {
  const { scope, confirm, db, replayDlq, discardDlq, replayAllDlq, setScope, openDrawer, toast } = useApp();
  const rows = db.dlq.filter((d) => d.Workspace === scope.ws);
  const [q, setQ] = useState('');
  const [flowFilter, setFlowFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [selected, setSelected] = useState(new Set());
  const flowsInDlq = Array.from(new Set(rows.map((r) => r.Flow))).sort();
  const reasonGroup = (r) => /OOM|memory/i.test(r) ? 'memory'
    : /timeout|deadline/i.test(r) ? 'timeout'
    : /5\d\d|server/i.test(r) ? '5xx'
    : /4\d\d|forbidden|unauthor/i.test(r) ? '4xx' : 'other';
  const reasons = Array.from(new Set(rows.map((r) => reasonGroup(r.Reason)))).sort();
  const ageHours = (age) => /(\d+)\s*h/i.test(age) ? Number(RegExp.$1) : /(\d+)\s*d/i.test(age) ? Number(RegExp.$1) * 24 : 0;
  const AGE_LIMITS = { '1h': 1, '24h': 24, '7d': 168, all: Infinity };
  const filtered = rows.filter((r) => {
    if (q && !(r.Flow + r.Node + r.Reason + r.ExecID).toLowerCase().includes(q.toLowerCase())) return false;
    if (flowFilter !== 'all' && r.Flow !== flowFilter) return false;
    if (reasonFilter !== 'all' && reasonGroup(r.Reason) !== reasonFilter) return false;
    if (ageFilter !== 'all' && ageHours(r.Age || '') > AGE_LIMITS[ageFilter]) return false;
    return true;
  });
  const toggleOne = (id) => setSelected((s) => { const x = new Set(s); x.has(id) ? x.delete(id) : x.add(id); return x; });
  const allChecked = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const toggleAll = () => setSelected(() => allChecked ? new Set() : new Set(filtered.map((r) => r.id)));
  const clearFilters = () => { setQ(''); setFlowFilter('all'); setReasonFilter('all'); setAgeFilter('all'); };
  const hasFilter = q || flowFilter !== 'all' || reasonFilter !== 'all' || ageFilter !== 'all';

  /* cross-workspace summary: where else are messages parked? helps explain "empty in this WS" */
  const wsCounts = {};
  db.dlq.forEach((d) => { wsCounts[d.Workspace] = (wsCounts[d.Workspace] || 0) + 1; });
  const otherWs = Object.entries(wsCounts).filter(([ws]) => ws !== scope.ws);
  const totalAcrossWs = db.dlq.length;
  const replayAll = () => confirm({
    title: `Replay ${rows.length} messages in ${scope.ws}?`,
    sub: 'Idempotency keys + journaled Join barrier keep durability correct.',
    confirmLabel: 'Replay all', onConfirm: () => replayAllDlq(scope.ws),
  });
  const bulkReplay = () => confirm({
    title: 'Replay ' + selected.size + ' selected message' + (selected.size === 1 ? '' : 's') + '?',
    sub: 'Idempotency keys ensure each message is processed only once.',
    confirmLabel: 'Replay', onConfirm: () => {
      Array.from(selected).forEach((id) => replayDlq(id));
      setSelected(new Set());
    },
  });
  const bulkDiscard = () => confirm({
    title: 'Discard ' + selected.size + ' selected message' + (selected.size === 1 ? '' : 's') + '?',
    sub: 'These messages will be permanently removed.',
    confirmLabel: 'Discard',
    onConfirm: () => {
      Array.from(selected).forEach((id) => discardDlq(id));
      setSelected(new Set());
    },
  });
  const inspect = (r) => openDrawer({
    title: 'DLQ message · ' + r.ExecID,
    sub: r.Flow + ' / ' + r.Node + ' · ' + r.Age,
    fields: [
      { section: 'Context',
        label: 'ExecID', value: r.ExecID, ro: true },
      { label: 'Flow / Node', value: r.Flow + ' / ' + r.Node, ro: true },
      { label: 'Reason', value: r.Reason, ro: true },
      { label: 'Attempts', value: String(r.Attempts), ro: true },
      { label: 'Age', value: r.Age, ro: true },
      { section: 'Payload (mock — would be journaled)',
        label: 'Body', value: '{\n  "order_id": "ord_' + r.ExecID.slice(-6) + '",\n  "amount": 12000,\n  "currency": "USD",\n  "customer_id": "cus_abc"\n}',
        type: 'textarea', ro: true,
        help: 'Real engine stores the message body + metadata in WAL. Shown here as a mock.' },
      { label: 'Headers', value: 'X-Idempotency-Key: ' + r.ExecID + '\nContent-Type: application/json\nUser-Agent: stripe/2.0',
        type: 'textarea', ro: true },
      { section: 'Replay target',
        label: 'Replay to flow', value: r.Flow, type: 'select',
        options: db.flows.filter((f) => f.Workspace === scope.ws).map((f) => f.Flow),
        help: 'Replay to the original flow, or pick a different one (useful for debugging fixes).' },
    ],
    note: 'Replay re-injects this message at the failed Node. Discard removes it permanently.',
    saveLabel: '▶ Replay',
    onDelete: () => discardDlq(r.id),
    onSave: (v) => {
      const targetSame = v['Replay to flow'] === r.Flow;
      replayDlq(r.id);
      if (!targetSame) toast('Replayed to ' + v['Replay to flow']);
    },
  });
  const discard = (r) => confirm({
    title: 'Discard ' + r.ExecID + '?', sub: 'Removes the message from DLQ without replay.',
    confirmLabel: 'Discard', onConfirm: () => discardDlq(r.id),
  });
  return (
    <div>
      <PageHead crumb={<Crumb extra="DLQ" />} title="Dead-letter Queue & Replay"
        desc="Failed messages parked with full context. Replay is idempotent — idempotency keys + a journaled Join barrier keep durability correct."
        docref="dashboard §7 · flow-engine §8 · ADR-0010/0018"
        actions={rows.length > 0 && <Btn kind="pri" onClick={replayAll}>Replay all ({rows.length})</Btn>} />
      <p className="hint" style={{ marginTop: 0 }}>
        DLQ for <b>{scope.ws}</b> — {rows.length} parked message{rows.length === 1 ? '' : 's'} ·
        <span style={{ color: 'var(--faint)' }}> {totalAcrossWs} total across all workspaces</span>.
      </p>
      <div className="flex mb" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="field" style={{ margin: 0, flex: 1, minWidth: 200, maxWidth: 320 }}>
          <input placeholder="Search ExecID, node, reason…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="select" value={flowFilter} onChange={(e) => setFlowFilter(e.target.value)} aria-label="Flow">
          <option value="all">All flows</option>
          {flowsInDlq.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select className="select" value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value)} aria-label="Reason">
          <option value="all">All reasons</option>
          {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="select" value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} aria-label="Age">
          <option value="all">Any age</option>
          <option value="1h">≤ 1h</option>
          <option value="24h">≤ 24h</option>
          <option value="7d">≤ 7d</option>
        </select>
        {hasFilter && <Btn sm onClick={clearFilters}>Clear</Btn>}
      </div>
      {selected.size > 0 && (
        <div className="note mb" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 0 }}>
          <b>{selected.size} selected</b>
          <span style={{ flex: 1 }} />
          <Btn sm kind="pri" onClick={bulkReplay}>Replay all selected</Btn>
          <Btn sm kind="dng" onClick={bulkDiscard}>Discard all selected</Btn>
          <Btn sm onClick={() => setSelected(new Set())}>Clear</Btn>
        </div>
      )}
      {rows.length === 0 ? (
        <WsEmptyState scope={scope} title="No parked messages in"
          description={<>DLQ is workspace-scoped — failed messages from <b>{scope.ws}</b> appear here. None right now means flows in this workspace are running cleanly (or have nothing to fail yet).</>}
          wsCounts={wsCounts}
          onSwitchWs={(ws) => setScope({ ...scope, ws, folder: '/' })}
          footerHint={<>When a flow fails (timeout, runner OOM, upstream error), the message is parked here with ExecID + full context. Replay is idempotent (ADR-0010 + ADR-0018).</>}
        />
      ) : (
        <div className="tablecard">
          <table>
            <thead><tr>
              <th style={{ width: 36 }}>
                <input type="checkbox" aria-label="Select all visible" checked={allChecked} onChange={toggleAll} />
              </th>
              {['ExecID', 'Flow', 'Node', 'Reason', 'Attempts', 'Age', ''].map((c) => <th key={c}>{c}</th>)}
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No matches.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="clickable" onClick={() => inspect(r)}>
                  <td onClick={(e) => e.stopPropagation()} style={{ width: 36 }}>
                    <input type="checkbox" aria-label={'Select ' + r.ExecID}
                      checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} />
                  </td>
                  <td className="mono">{r.ExecID}</td><td><b>{r.Flow}</b></td><td>{r.Node}</td>
                  <td><Badge>{reasonGroup(r.Reason)}</Badge> {r.Reason}</td>
                  <td>{r.Attempts}</td><td>{r.Age}</td>
                  <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Btn sm onClick={() => inspect(r)}>🔎 Inspect</Btn>{' '}
                    <Btn sm onClick={() => replayDlq(r.id)}>Replay</Btn>{' '}
                    <Btn sm kind="dng" onClick={() => discard(r)}>Discard</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- API Keys ---------------- */
function ApiKeys() {
  const { scope, setScope, toast, openDrawer, db, createApiKey, updateApiKey } = useApp();
  const rows = db.apiKeys.filter((k) => k.Workspace === scope.ws);
  const wsCounts = {};
  db.apiKeys.forEach((k) => { wsCounts[k.Workspace] = (wsCounts[k.Workspace] || 0) + 1; });
  const [selId, setSelId] = useState(null);
  const sel = rows.find((k) => k.id === selId) || rows[0];

  const create = () => openDrawer({
    title: 'Create API key', sub: 'secret shown once — argon2id(+pepper), never reversible',
    fields: [
      { label: 'Name', value: 'new-service-key' },
      { label: 'Scopes', value: 'invoke', type: 'select', options: ['invoke', 'invoke, read', 'deploy, read', 'admin'] },
      { label: 'Secret (copy now)', value: 'evd_sk_live_' + Math.random().toString(16).slice(2, 12) + '…SHOWN·ONCE', ro: true }],
    note: 'The key is workspace-scoped to ' + scope.ws + '. Store the secret now — it is never shown again.',
    saveLabel: 'Copy & create',
    onSave: (v) => setSelId(createApiKey({ workspace: scope.ws, name: v.Name, scopes: v.Scopes })),
  });
  const editLimit = () => openDrawer({
    title: 'Rate limit — ' + sel.Name, sub: 'tighten-only within the workspace boundary (ADR-0020)',
    fields: [
      { label: 'Sustained rps', value: '50' }, { label: 'Burst', value: '100' }, { label: 'Max concurrency', value: '20' }],
    onSave: (v) => updateApiKey(sel.id, { 'Rate limit': `${v['Sustained rps']} rps · b${v.Burst} · c${v['Max concurrency']}` }, 'Rate limit updated'),
  });
  return (
    <div>
      <PageHead crumb={<Crumb extra="API Keys" />} title="API Keys"
        desc="Workspace-scoped, gateway-validated. Secret stored argon2id(+pepper). A key carries scopes + a rate limit and authorises calls to this workspace's endpoints."
        docref="ADR-0013 · ADR-0020 · dashboard §4"
        actions={<Btn kind="pri" onClick={create}>+ Create key</Btn>} />
      <p className="hint" style={{ marginTop: 0 }}>Keys in <b>{scope.ws}</b> — {rows.length} total.</p>
      {rows.length === 0 ? (
        <WsEmptyState icon="⚿" scope={scope} title="No API keys in"
          description={<>This workspace doesn't have any API keys yet. Keys authorise calls to this workspace's endpoints (workspace-scoped credential, ADR-0013).</>}
          wsCounts={wsCounts}
          onSwitchWs={(ws) => setScope({ ...scope, ws, folder: '/' })}
          cta={<Btn kind="pri" onClick={create}>+ Create key</Btn>}
          footerHint={<>Secrets are stored argon2id(+pepper); the value is shown ONCE on create. Per-key rate limit + IP allow/deny reconciled to the gateway (ADR-0020).</>} />
      ) : (
      <div className="tablecard mb">
        <table>
          <thead><tr>{['Name', 'Prefix', 'Scopes', 'Rate limit', 'Expires', 'Status', ''].map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {rows.map((k) => (
              <tr key={k.id} className="clickable" onClick={() => setSelId(k.id)}
                style={k.id === sel?.id ? { background: 'var(--panel3)' } : undefined}>
                <td><b>{k.Name}</b></td><td className="mono">{k.Prefix}</td>
                <td>{k.Scopes}</td><td className="mono" style={{ fontSize: 12 }}>{k['Rate limit']}</td>
                <td>{k.Expires}</td><td><Badge>{k.Status}</Badge></td>
                <td style={{ textAlign: 'right' }}>{k.id === sel?.id ? <Badge>selected</Badge> : <Btn sm onClick={(e) => { e.stopPropagation(); setSelId(k.id); }}>Select</Btn>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      {sel && (
        <div className="grid g3">
          <Card title={sel.Name + ' — key'} sub="workspace-scoped credential (ADR-0013)">
            <KV k="Prefix"><span className="mono">{sel.Prefix}</span></KV>
            <KV k="Scopes">{sel.Scopes}</KV>
            <KV k="Status"><Badge>{sel.Status}</Badge></KV>
            <KV k="Expires">{sel.Expires}</KV>
          </Card>
          <Card title="Rate limit & policy" sub="reconciled to the gateway (ADR-0020)">
            <KV k="Rate limit"><span className="mono">{sel['Rate limit']}</span></KV>
            <KV k="IP allow">203.0.113.0/24</KV>
            <KV k="IP deny">deny-before-allow</KV>
            <Btn sm kind="pri" style={{ marginTop: 8 }} onClick={editLimit}>Edit rate limit</Btn>
          </Card>
          <Card title="Lifecycle" sub="rotation, revocation — all audited">
            <KV k="Last used">5m ago · 203.0.113.7 (Chrome/macOS)</KV>
            <KV k="Calls (24h)">12,480</KV>
            <KV k="Expires">{sel.Expires}</KV>
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Btn sm onClick={() => openDrawer({
                title: 'Rotate key "' + sel.Name + '"',
                sub: 'A new secret is generated. Old value stays valid for 24h (dual-validity grace period).',
                fields: [
                  { label: 'New secret (copy now)', ro: true,
                    value: 'evd_sk_live_' + Math.random().toString(16).slice(2, 12) + '…SHOWN·ONCE' },
                  { label: 'Old key validity', value: '24h dual-validity → then revoked', ro: true },
                ],
                note: 'Update all callers in the next 24h. The old value will be revoked automatically after the grace period.',
                saveLabel: 'I have copied it',
                onSave: () => updateApiKey(sel.id, {
                  Prefix: 'evd_pk_' + Math.random().toString(16).slice(2, 6) + '…',
                  Status: 'active',
                }, 'Key rotated — 24h dual-validity'),
              })}>↻ Rotate</Btn>
              {sel.Status === 'revoked'
                ? <Btn sm onClick={() => updateApiKey(sel.id, { Status: 'active' }, 'Key re-activated')}>Re-activate</Btn>
                : <Btn sm kind="dng" onClick={() => updateApiKey(sel.id, { Status: 'revoked' }, 'Key revoked')}>Revoke key</Btn>}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ---------------- Route Groups (= API surfaces) ---------------- */
function RouteGroups() {
  const nav = useNavigate();
  const { scope, setScope, db, openDrawer, createRouteGroup, updateRouteGroup, deleteRouteGroup, confirm } = useApp();
  const rows = db.routeGroups.filter((r) => r.Workspace === scope.ws);
  const wsCounts = {};
  db.routeGroups.forEach((r) => { wsCounts[r.Workspace] = (wsCounts[r.Workspace] || 0) + 1; });
  const [selId, setSelId] = useState(null);
  const sel = rows.find((r) => r.id === selId) || rows[0];
  const boundOf = (name) => db.flows.filter((f) => f.Workspace === scope.ws && f.RouteGroup === name && f.Path);
  const bound = sel ? boundOf(sel.Name) : [];

  const create = () => openDrawer({
    title: 'New route group', sub: 'an API surface in ' + scope.ws,
    fields: [{ label: 'Name', value: 'new-api' }, { label: 'Path namespace', value: '/new' }],
    note: 'A route group groups endpoints under a path namespace with shared policy (ADR-0021).',
    onSave: (v) => setSelId(createRouteGroup({ workspace: scope.ws, name: v.Name, namespace: v['Path namespace'] })),
  });
  const editRg = (r) => openDrawer({
    title: 'Edit route group · ' + r.Name,
    sub: 'workspace ' + r.Workspace,
    fields: [
      { section: 'Identity', label: 'Name', value: r.Name,
        help: 'Workspace-unique. Flows bind to this name via Flow.RouteGroup.' },
      { label: 'Path namespace', value: r['Path namespace'],
        help: 'All endpoints below this prefix inherit the group policy.' },
      { section: 'Policy & scaling',
        label: 'Policy', value: r.Policy,
        help: 'Auth + rate-limit string — reconciled to the gateway (ADR-0021).' },
      { label: 'Scaling shard', value: r['Scaling shard'], type: 'select',
        options: ['shared pool', 'dedicated', 'isolated'],
        help: 'KEDA scaling tier (KEDA §3.3).' },
    ],
    note: 'Bound endpoints follow the new namespace on next reconcile. Audited (§16.9).',
    saveLabel: 'Save changes',
    onDelete: () => confirm({
      title: 'Delete route group "' + r.Name + '"?',
      sub: boundOf(r.Name).length
        ? boundOf(r.Name).length + ' flow(s) bound here will lose their group policy and fall back to workspace defaults.'
        : 'No flows are bound to this group.',
      confirmLabel: 'Delete',
      onConfirm: () => { deleteRouteGroup(r.id); if (selId === r.id) setSelId(null); },
    }),
    onSave: (v) => updateRouteGroup(r.id, {
      Name: v.Name, 'Path namespace': v['Path namespace'],
      Policy: v.Policy, 'Scaling shard': v['Scaling shard'],
    }, 'Route group "' + v.Name + '" updated'),
  });
  return (
    <div>
      <PageHead crumb={<Crumb extra="Route Groups" />} title="Route Groups"
        desc="A route group is an API surface — a path namespace that groups endpoints with shared auth, rate-limit and an optional KEDA scaling shard. The stateless gateway reconciles it."
        docref="ADR-0021 · interface-adapter §7 · keda §3.3"
        actions={<Btn kind="pri" onClick={create}>+ Route Group</Btn>} />
      <p className="hint" style={{ marginTop: 0 }}>API surfaces in <b>{scope.ws}</b> — {rows.length} total.</p>
      {rows.length === 0 ? (
        <WsEmptyState icon="⛓" scope={scope} title="No route groups in"
          description={<>This workspace has no API surfaces yet. A route group binds a path namespace (e.g. <span className="mono">/payments</span>) to HTTP/Webhook endpoints with shared auth, rate-limit, and an optional scaling shard.</>}
          wsCounts={wsCounts}
          onSwitchWs={(ws) => setScope({ ...scope, ws, folder: '/' })}
          cta={<Btn kind="pri" onClick={create}>+ Route Group</Btn>}
          footerHint={<>Route groups are reconciled by the stateless gateway (ADR-0021 + KEDA §3.3). Endpoints are HTTP/Webhook flows bound by name.</>} />
      ) : (
      <div className="tablecard mb">
        <table>
          <thead><tr>{['Name', 'Path namespace', 'Endpoints', 'Policy', 'Scaling shard', 'Status', ''].map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="clickable" onClick={() => setSelId(r.id)}
                style={r.id === sel?.id ? { background: 'var(--panel3)' } : undefined}>
                <td><b>{r.Name}</b></td><td className="mono">{r['Path namespace']}/*</td>
                <td>{boundOf(r.Name).length}</td><td>{r.Policy}</td>
                <td><Badge>{r['Scaling shard']}</Badge></td><td><Badge>{r.Status}</Badge></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                  {r.id !== sel?.id && <><Btn sm onClick={() => setSelId(r.id)}>Select</Btn>{' '}</>}
                  <Btn sm onClick={() => editRg(r)} title="Edit">✎</Btn>{' '}
                  <Btn sm kind="dng" onClick={() => confirm({
                    title: 'Delete route group "' + r.Name + '"?',
                    sub: boundOf(r.Name).length
                      ? boundOf(r.Name).length + ' flow(s) bound here will fall back to workspace defaults.'
                      : 'No flows are bound to this group.',
                    confirmLabel: 'Delete',
                    onConfirm: () => { deleteRouteGroup(r.id); if (selId === r.id) setSelId(null); },
                  })} title="Delete">🗑</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      {sel && (
        <>
          <div className="section-h">{sel.Name} — endpoints ({bound.length})</div>
          <div className="tablecard mb">
            <table>
              <thead><tr>{['Method', 'Endpoint', 'Adapter', 'Flow', 'State'].map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {bound.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>No endpoints bound — bind one from the Endpoints page.</td></tr>
                ) : bound.map((f) => (
                  <tr key={f.id} className="clickable" onClick={() => nav('/endpoints')}>
                    <td><Badge>{f.Method}</Badge></td>
                    <td className="mono">{sel['Path namespace']}{f.Path}</td>
                    <td>{f.Adapter}</td><td>{f.Flow}</td><td><Badge>{f.State}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid g2">
            <Card title="Shared policy" sub="applies to every endpoint in the group">
              <KV k="Policy">{sel.Policy}</KV>
              <KV k="Auth">API key — workspace-scoped (ADR-0013)</KV>
              <KV k="IP allow/deny">workspace default + group overrides</KV>
            </Card>
            <Card title="Scaling shard" sub="optional KEDA shard (ADR-0021)">
              <KV k="Shard mode"><Badge>{sel['Scaling shard']}</Badge></KV>
              <KV k="Leading indicator">broker lag + concurrency</KV>
              <KV k="Floor / max">2 / 40 replicas</KV>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Endpoints (callable surface — derived from flow triggers) ---------------- */

/* Build a mock OpenAPI 3.0 spec from the workspace's HTTP-triggered flows.
   A real implementation would walk PlanSpec contracts; we keep it simple. */
function buildOpenApiSpec(workspace, endpoints, routeGroupNs) {
  const paths = {};
  endpoints.forEach((f) => {
    const fullPath = (f.RouteGroup ? (routeGroupNs(f.RouteGroup) || '') : '') + (f.Path || '/');
    const method = (f.Method || 'POST').toLowerCase();
    if (!paths[fullPath]) paths[fullPath] = {};
    paths[fullPath][method] = {
      summary: f.Flow,
      operationId: f.Flow.replace(/[^a-zA-Z0-9]/g, '_'),
      tags: [f.Collection || 'default'],
      security: [{ ApiKeyAuth: [] }],
      requestBody: method === 'get' ? undefined : {
        required: true,
        content: { 'application/json': { schema: { type: 'object', example: { name: 'eventador' } } } },
      },
      responses: {
        200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', example: { ok: true } } } } },
        400: { description: 'Bad Request' },
        429: { description: 'Too Many Requests' },
      },
    };
  });
  return {
    openapi: '3.0.3',
    info: { title: workspace + ' API', version: '1.0.0',
      description: 'Generated from eventador workspace ' + workspace + ' (HTTP / Webhook triggers).' },
    servers: [{ url: 'https://gateway.' + workspace + '.eventador.io' }],
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-Api-Key' },
      },
    },
    paths,
  };
}

function curlFor(endpoint, fullPath, workspace, apiKeyPrefix) {
  const url = 'https://gateway.' + workspace + '.eventador.io' + fullPath;
  const method = endpoint.Method || 'POST';
  const headers = ['-H "X-Api-Key: ' + (apiKeyPrefix || 'evd_sk_…') + '"'];
  const body = method === 'GET' ? null : '-d \'{ "name": "eventador" }\'';
  if (body) headers.push('-H "Content-Type: application/json"');
  return [
    'curl -X ' + method + ' \\',
    '  ' + headers.join(' \\\n  ') + ' \\',
    body ? '  ' + body + ' \\' : null,
    '  ' + url,
  ].filter(Boolean).join('\n');
}

function Endpoints() {
  const nav = useNavigate();
  const { scope, db, toast, openDrawer, updateFlow } = useApp();
  const groups = db.routeGroups.filter((r) => r.Workspace === scope.ws);
  const nsOf = (name) => { const r = groups.find((g) => g.Name === name); return r ? r['Path namespace'] : ''; };
  const endpoints = db.flows.filter((f) => f.Workspace === scope.ws && f.Path);
  const keys = db.apiKeys.filter((k) => k.Workspace === scope.ws && k.Status === 'active');
  const [selId, setSelId] = useState(null);
  const [keyId, setKeyId] = useState('');
  const [payload, setPayload] = useState('{ "amount": 1200 }');
  const [result, setResult] = useState(null);
  const ep = endpoints.find((e) => e.id === selId) || null;
  const fullPath = (f) => (f.RouteGroup ? nsOf(f.RouteGroup) : '') + f.Path;

  const pick = (e) => { setSelId(e.id); setResult(null); };
  const send = () => {
    const key = keys.find((k) => k.id === keyId);
    if (!key) { toast('Select an API key first', 'warn'); return; }
    let ok = true;
    try { JSON.parse(payload); } catch { ok = false; }
    if (!ok) { setResult({ status: '400 · 2 ms', body: '{ "error": "invalid JSON payload" }' }); toast('400 — invalid payload', 'dng'); return; }
    setResult({ status: '200 · 41 ms · warm (no cold start)', body: `{ "ok": true, "flow": "${ep.Flow}", "via": "${key.Name}" }` });
    toast('200 — ' + ep.Method + ' ' + fullPath(ep));
  };
  const bind = (f) => openDrawer({
    title: 'Bind endpoint to a route group', sub: f.Method + ' ' + f.Path,
    fields: [{ label: 'Route group', value: groups[0] ? groups[0].Name : '', type: 'select', options: groups.map((g) => g.Name) }],
    note: 'The endpoint is published under the route group’s path namespace and inherits its policy.',
    onSave: (v) => { updateFlow(f.id, { RouteGroup: v['Route group'] }); toast('Endpoint bound to ' + v['Route group']); },
  });
  return (
    <div>
      <PageHead crumb={<Crumb extra="Endpoints" />} title="Endpoints"
        desc="Every externally-callable route in this workspace — derived from HTTP / gRPC / Webhook flow triggers. An endpoint is method + path + adapter, bound to a flow and published under a route group."
        docref="interface-adapter · ADR-0008/0021 · REFERENCE-MAP #8"
        actions={<>
          <Btn onClick={() => {
            const spec = buildOpenApiSpec(scope.ws, endpoints, nsOf);
            const json = JSON.stringify(spec, null, 2);
            openDrawer({
              title: 'OpenAPI 3.0 spec — ' + scope.ws,
              sub: endpoints.length + ' endpoint' + (endpoints.length === 1 ? '' : 's') + ' · paste into Swagger UI / Postman',
              fields: [
                { label: 'openapi.json', value: json, type: 'textarea', ro: true,
                  help: 'Generated from your HTTP / Webhook triggers. Includes security scheme (X-Api-Key) and example responses.' },
              ],
              note: 'In production the spec is regenerated on every deploy and served at /.well-known/openapi.json.',
              saveLabel: '📋 Copy & close',
              onSave: () => {
                try {
                  navigator.clipboard.writeText(json);
                  toast('Copied openapi.json to clipboard');
                } catch { toast('Clipboard blocked — select all and copy manually', 'warn'); }
              },
            });
          }}>↗ Export OpenAPI</Btn>
          <Btn onClick={() => nav('/routegroups')}>Route groups →</Btn>
        </>} />
      <p className="hint" style={{ marginTop: 0 }}>
        {endpoints.length} endpoint{endpoints.length === 1 ? '' : 's'} in <b>{scope.ws}</b> · Timer & Kafka flows are event sources, not endpoints.
      </p>
      <div className="tablecard mb">
        <table>
          <thead><tr>{['Method', 'Endpoint', 'Adapter', 'Flow', 'Route group', 'State', ''].map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {endpoints.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No callable endpoints — create an HTTP/Webhook flow first.</td></tr>
            ) : endpoints.map((f) => (
              <tr key={f.id} className="clickable" onClick={() => pick(f)}
                style={f.id === selId ? { background: 'var(--panel3)' } : undefined}>
                <td><Badge>{f.Method}</Badge></td>
                <td className="mono">{fullPath(f)}</td>
                <td>{f.Adapter}</td><td>{f.Flow}</td>
                <td>{f.RouteGroup || <span style={{ color: 'var(--warn)' }}>unrouted</span>}</td>
                <td><Badge>{f.State}</Badge></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <Btn sm onClick={(e) => {
                    e.stopPropagation();
                    const snippet = curlFor(f, fullPath(f), scope.ws, keys[0]?.Prefix);
                    openDrawer({
                      title: 'cURL — ' + f.Method + ' ' + fullPath(f),
                      sub: 'paste into a terminal',
                      fields: [{ label: 'Command', value: snippet, type: 'textarea', ro: true,
                        help: 'Replace the X-Api-Key value with your real workspace key.' }],
                      saveLabel: '📋 Copy & close',
                      onSave: () => { try { navigator.clipboard.writeText(snippet); toast('cURL copied'); } catch { toast('Clipboard blocked', 'warn'); } },
                    });
                  }}>cURL</Btn>{' '}
                  {!f.RouteGroup && <><Btn sm onClick={(e) => { e.stopPropagation(); bind(f); }}>Bind</Btn>{' '}</>}
                  <Btn sm onClick={(e) => { e.stopPropagation(); nav('/designer/' + f.id); }}>Open</Btn>{' '}
                  <Btn sm kind="pri" onClick={(e) => { e.stopPropagation(); pick(f); }}>Try</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ep && (
        <Card title={'Try it — ' + ep.Method + ' ' + fullPath(ep)} sub={'flow ' + ep.Flow + ' · ' + ep.Adapter}>
          <div className="grid g2">
            <div>
              <div className="field"><label>API key</label>
                <select value={keyId} onChange={(e) => setKeyId(e.target.value)}>
                  <option value="">— select a key —</option>
                  {keys.map((k) => <option key={k.id} value={k.id}>{k.Name} · {k['Rate limit']}</option>)}
                </select>
              </div>
              <div className="field"><label>Request payload (JSON)</label>
                <textarea rows={4} value={payload} onChange={(e) => setPayload(e.target.value)} /></div>
              <Btn kind="pri" onClick={send}>▶ Send request</Btn>
              {keys.length === 0 && <p className="hint">No active API keys in this workspace — create one on the API Keys page.</p>}
            </div>
            <div>
              <div className="section-h">Response</div>
              {result
                ? <div className="note" style={{ marginTop: 0 }}><b>{result.status}</b><br /><span className="mono">{result.body}</span></div>
                : <EmptyState icon="⇄" title="No response yet" sub="Pick an API key and send a request." />}
              <p className="hint">Calls are authorised by the API key and rate-limited by the route group's policy (ADR-0020).</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------------- Env Report (ADR-0024 — cross-flow discovery, read-only) ---------------- */
/* Workspace/folder no longer hold env or secrets. Each Flow + Function owns its own.
   This screen scans across all flows + functions in the current workspace and surfaces:
     - which keys are defined in which flows (with same-value vs divergent-value detection)
     - which secrets are referenced in which flows / functions
     - which inline-node ${KEY} references in any flow lack a matching Flow.env entry
   No editing happens here — click a row to jump to that flow's Designer for in-context editing. */
function EnvReport() {
  const { scope, setScope, db } = useApp();
  const nav = useNavigate();
  const wsFlows = db.flows.filter((f) => f.Workspace === scope.ws);
  const wsFns = db.functions.filter((f) => f.Workspace === scope.ws);

  /* Aggregate env keys across flows + functions */
  const envIndex = new Map(); /* key -> { occurrences:[{type,flowId,flowName,fnName,value}], values:Set } */
  wsFlows.forEach((fl) => (fl.env || []).forEach((e) => {
    const slot = envIndex.get(e.k) || { occurrences: [], values: new Set() };
    slot.occurrences.push({ type: 'flow', flowId: fl.id, flowName: fl.Flow, value: e.v });
    slot.values.add(e.v);
    envIndex.set(e.k, slot);
  }));
  wsFns.forEach((fn) => (fn.Config || []).forEach((c) => {
    const slot = envIndex.get(c.k) || { occurrences: [], values: new Set() };
    const parent = wsFlows.find((fl) => fl.Flow === fn.Flow);
    slot.occurrences.push({ type: 'fn', flowId: parent ? parent.id : null, flowName: fn.Flow, fnName: fn.Function, value: c.v });
    slot.values.add(c.v);
    envIndex.set(c.k, slot);
  }));

  const secIndex = new Map(); /* name -> { occurrences:[{type, flowId, flowName, fnName, prefix, status}] } */
  wsFlows.forEach((fl) => (fl.secrets || []).forEach((s) => {
    const slot = secIndex.get(s.Name) || { occurrences: [] };
    slot.occurrences.push({ type: 'flow', flowId: fl.id, flowName: fl.Flow, prefix: s.Prefix, status: s.Status });
    secIndex.set(s.Name, slot);
  }));
  wsFns.forEach((fn) => (fn.secrets || []).forEach((s) => {
    const slot = secIndex.get(s.Name) || { occurrences: [] };
    const parent = wsFlows.find((fl) => fl.Flow === fn.Flow);
    slot.occurrences.push({ type: 'fn', flowId: parent ? parent.id : null, flowName: fn.Flow, fnName: fn.Function, prefix: s.Prefix, status: s.Status });
    secIndex.set(s.Name, slot);
  }));

  /* Undefined ${KEY} references across all flows (inline node body scan) */
  const REF_RE = /\$\{([A-Z][A-Z0-9_]*)\}/g;
  const undefinedRefs = [];
  wsFlows.forEach((fl) => {
    const defined = new Set((fl.env || []).map((e) => e.k).concat((fl.secrets || []).map((s) => s.Name)));
    /* the demo's designerFlow is a single in-memory graph (no per-flow nodes table); we can only meaningfully
       check the active designer flow. Other flows have their counts via flow.Nodes string. We'll surface only
       what we can verify directly — keys absent from this flow's env entirely. */
    /* For now, no per-flow nodes data is stored in db.flows — leave as a future hook. */
    void defined;
    void fl;
  });

  const [tab, setTab] = useState('env');
  const [q, setQ] = useState('');
  const envRows = Array.from(envIndex.entries()).map(([k, v]) => ({ key: k, ...v }));
  const secRows = Array.from(secIndex.entries()).map(([n, v]) => ({ name: n, ...v }));
  const envFiltered = envRows.filter((r) => !q || r.key.toLowerCase().includes(q.toLowerCase()));
  const secFiltered = secRows.filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase()));

  /* Cross-workspace activity for empty state */
  const wsCounts = {};
  db.flows.forEach((fl) => {
    const n = (fl.env?.length || 0) + (fl.secrets?.length || 0);
    if (n > 0) wsCounts[fl.Workspace] = (wsCounts[fl.Workspace] || 0) + n;
  });
  db.functions.forEach((fn) => {
    const n = (fn.Config?.length || 0) + (fn.secrets?.length || 0);
    if (n > 0) wsCounts[fn.Workspace] = (wsCounts[fn.Workspace] || 0) + n;
  });

  return (
    <div>
      <PageHead crumb={<Crumb extra="Env Report" />} title="Environment Report"
        desc="Cross-flow discovery (ADR-0024). Env and secrets are owned per-flow and per-function — workspace and folder hold NEITHER. This screen surfaces which keys live where and flags divergent values for the same key across flows. Read-only; edit in the Designer's Flow env panel or the Function's Config."
        docref="ADR-0024 (supersedes 0023; refines 0012) · BRD NFR-5,NFR-8" />
      <p className="hint" style={{ marginTop: 0 }}>
        Workspace <b>{scope.ws}</b> · {envRows.length} unique env keys · {secRows.length} unique secret names ·
        across {wsFlows.length} flow{wsFlows.length === 1 ? '' : 's'} and {wsFns.length} function{wsFns.length === 1 ? '' : 's'}.
      </p>
      {envRows.length === 0 && secRows.length === 0 ? (
        <WsEmptyState icon="≣" scope={scope} title="No env or secrets defined in"
          description={<>Nothing to report — no flow in <b>{scope.ws}</b> has declared env or secrets yet. Per ADR-0024, both live at Flow level (and optionally per Function); workspace/folder hold neither.</>}
          wsCounts={wsCounts}
          onSwitchWs={(ws) => setScope({ ...scope, ws, folder: '/' })}
          cta={wsFlows.length > 0
            ? <Btn kind="pri" onClick={() => nav('/designer/' + wsFlows[0].id)}>Open {wsFlows[0].Flow} →</Btn>
            : <Btn onClick={() => nav('/flows')}>Create a flow →</Btn>}
          footerHint={<>To add env or secrets: open a flow in the Designer → toolbar ⚙ Env button. Function-level overrides go on the function in /functions.</>} />
      ) : (
      <>
      <div className="field" style={{ maxWidth: 360 }}>
        <input placeholder="Filter by key or name…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Tabs active={tab} onChange={setTab} tabs={[
        { k: 'env', t: 'Env keys (' + envFiltered.length + ')' },
        { k: 'sec', t: 'Secret names (' + secFiltered.length + ')' }]} />

      {tab === 'env' && (
        <div className="tablecard">
          <table>
            <thead><tr><th>Key</th><th>Used by</th><th>Distinct values</th><th>Sample value</th><th /></tr></thead>
            <tbody>
              {envFiltered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                  No env keys defined yet in this workspace.
                </td></tr>
              ) : envFiltered.map((r) => {
                const flowOcc = r.occurrences.filter((o) => o.type === 'flow');
                const fnOcc = r.occurrences.filter((o) => o.type === 'fn');
                const distinct = r.values.size;
                const sample = Array.from(r.values)[0] || '';
                return (
                  <tr key={r.key}>
                    <td className="mono"><b>{r.key}</b></td>
                    <td>
                      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                        {flowOcc.length > 0 && <Badge>{flowOcc.length} flow{flowOcc.length === 1 ? '' : 's'}</Badge>}
                        {fnOcc.length > 0 && <Badge>{fnOcc.length} fn override{fnOcc.length === 1 ? '' : 's'}</Badge>}
                      </span>
                      <div className="hint" style={{ fontSize: 11, marginTop: 2, marginBottom: 0 }}>
                        {flowOcc.map((o) => o.flowName).join(', ')}
                        {fnOcc.length > 0 && (flowOcc.length > 0 ? ' · fn: ' : 'fn: ') + fnOcc.map((o) => o.fnName).join(', ')}
                      </div>
                    </td>
                    <td>
                      {distinct === 1
                        ? <Badge>uniform</Badge>
                        : <Badge>⚠ {distinct} different</Badge>}
                    </td>
                    <td className="mono" style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sample}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {flowOcc[0] && <Btn sm onClick={() => nav('/designer/' + flowOcc[0].flowId)}>Open flow →</Btn>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'sec' && (
        <div className="tablecard">
          <table>
            <thead><tr><th>Name</th><th>Used by</th><th>Status</th><th>Prefix</th><th /></tr></thead>
            <tbody>
              {secFiltered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                  No secrets defined yet in this workspace.
                </td></tr>
              ) : secFiltered.map((r) => {
                const flowOcc = r.occurrences.filter((o) => o.type === 'flow');
                const fnOcc = r.occurrences.filter((o) => o.type === 'fn');
                const anyRevoked = r.occurrences.some((o) => o.status === 'revoked');
                return (
                  <tr key={r.name}>
                    <td className="mono"><b>{r.name}</b></td>
                    <td>
                      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                        {flowOcc.length > 0 && <Badge>{flowOcc.length} flow{flowOcc.length === 1 ? '' : 's'}</Badge>}
                        {fnOcc.length > 0 && <Badge>{fnOcc.length} fn{fnOcc.length === 1 ? '' : 's'}</Badge>}
                      </span>
                      <div className="hint" style={{ fontSize: 11, marginTop: 2, marginBottom: 0 }}>
                        {flowOcc.map((o) => o.flowName).join(', ')}
                        {fnOcc.length > 0 && (flowOcc.length > 0 ? ' · fn: ' : 'fn: ') + fnOcc.map((o) => o.fnName).join(', ')}
                      </div>
                    </td>
                    <td><Badge>{anyRevoked ? '⚠ partial revoke' : 'active'}</Badge></td>
                    <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{r.occurrences[0]?.prefix || '—'}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {flowOcc[0] && <Btn sm onClick={() => nav('/designer/' + flowOcc[0].flowId)}>Open flow →</Btn>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="hint">
        ADR-0024: env and secrets are owned <b>per-flow</b> (shared by all nodes in a flow) and <b>per-function</b> (overrides flow on collision).
        Workspace and folder hold NEITHER env nor secrets. To rotate a secret used in multiple flows, rotate it in each — this report shows you exactly where.
      </p>
      </>
      )}
    </div>
  );
}

/* Legacy export name kept temporarily so older imports continue to resolve. */
const EnvSecrets = EnvReport;


/* ---------------- Audit Log ---------------- */
const csvEscape = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const downloadCsv = (filename, headers, rows) => {
  const body = [headers.join(','), ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join('\n');
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
};
function Audit() {
  const { toast, db, openDrawer } = useApp();
  const [q, setQ] = useState('');
  const [actorFilter, setActorFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const rows = db.audit;
  /* Build facet option lists from the data — actors are stable; action prefixes
     (flow / schedule / apikey / role / user / workspace / org / deploy / dlq) drive
     the second dropdown. */
  const actors = Array.from(new Set(rows.map((r) => r.Actor))).sort();
  const actionPrefixes = Array.from(new Set(rows.map((r) => (r.Action || '').split('.')[0]))).filter(Boolean).sort();
  const TIME_RANGES = { '1h': 60, '24h': 1440, '7d': 10080, '30d': 43200, all: Infinity };
  const filtered = rows.filter((r) => {
    if (q && !(r.Actor + r.Action + r.Target).toLowerCase().includes(q.toLowerCase())) return false;
    if (actorFilter !== 'all' && r.Actor !== actorFilter) return false;
    if (actionFilter !== 'all' && !(r.Action || '').startsWith(actionFilter + '.')) return false;
    if (timeFilter !== 'all' && (r.agoMin ?? 0) > TIME_RANGES[timeFilter]) return false;
    return true;
  });
  const clearFilters = () => { setQ(''); setActorFilter('all'); setActionFilter('all'); setTimeFilter('all'); };
  const hasFilter = q || actorFilter !== 'all' || actionFilter !== 'all' || timeFilter !== 'all';
  const exportCsv = () => {
    const headers = ['Time', 'Actor', 'Action', 'Target', 'Hash'];
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`audit-${date}.csv`, headers, filtered);
    toast('Exported ' + filtered.length + ' row' + (filtered.length === 1 ? '' : 's') + ' → audit-' + date + '.csv');
  };
  /* Append-only hash chain (§16.9): demo audit rows have random Hash strings, so we report
     chain length + sample. A real implementation would re-derive H(n) = h(H(n-1) || row(n)). */
  const verifyChain = () => {
    const total = rows.length;
    const anomalies = rows.filter((r) => !r.Hash || !/[a-f0-9]/.test(String(r.Hash))).length;
    const ok = anomalies === 0;
    openDrawer({
      title: 'Chain verification', sub: 'append-only · tamper-evident (§16.9)',
      fields: [
        { label: 'Result', value: ok ? '✓ chain intact' : '⚠ ' + anomalies + ' anomal' + (anomalies === 1 ? 'y' : 'ies') + ' detected', ro: true },
        { label: 'Rows verified', value: String(total), ro: true },
        { label: 'Latest hash', value: rows[0]?.Hash || '—', ro: true },
        { label: 'Earliest hash', value: rows[total - 1]?.Hash || '—', ro: true },
      ],
      note: ok
        ? 'No gaps or malformed hashes. Real verification re-derives H(n) = h(H(n-1) || row).'
        : 'A real engine would mark the broken segment and require a re-seal from the last known-good checkpoint.',
      saveLabel: 'Close', onSave: () => {},
    });
    toast(ok ? 'Chain verified · ' + total + ' rows' : 'Chain check found ' + anomalies + ' anomaly/ies', ok ? 'ok' : 'warn');
  };
  return (
    <div>
      <PageHead crumb={<Crumb extra="Audit" />} title="Audit Log"
        desc="Every privileged action — append-only, tamper-evident hash chain. Tenant-scoped."
        docref="dashboard §4 · MASTER-PLAN §16.9"
        actions={<>
          <Btn onClick={exportCsv}>Export</Btn>
          <Btn onClick={verifyChain}>Verify chain ✓</Btn>
        </>} />
      <div className="flex mb" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="field" style={{ margin: 0, flex: 1, minWidth: 220, maxWidth: 360 }}>
          <input placeholder="Search actor, action, target…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="select" value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} aria-label="Filter by actor">
          <option value="all">All actors</option>
          {actors.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className="select" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} aria-label="Filter by action prefix">
          <option value="all">All actions</option>
          {actionPrefixes.map((p) => <option key={p} value={p}>{p}.*</option>)}
        </select>
        <select className="select" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} aria-label="Time range">
          <option value="all">All time</option>
          <option value="1h">Last 1h</option>
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7d</option>
          <option value="30d">Last 30d</option>
        </select>
        {hasFilter && <Btn sm onClick={clearFilters}>Clear filters</Btn>}
      </div>
      <p className="hint" style={{ marginTop: -6 }}>
        {filtered.length} of {rows.length} entries{hasFilter ? ' · filtered' : ''}.
      </p>
      <DataTable rows={filtered} exclude={['id', 'agoMin']} />
    </div>
  );
}

/* ---------------- Scheduler ---------------- */
function Scheduler() {
  const { scope, setScope, openDrawer, confirm, db, createSchedule, updateSchedule, deleteSchedule, runScheduleOnce } = useApp();
  const rows = db.schedules.filter((s) => s.Workspace === scope.ws);
  const wsFlows = db.flows.filter((f) => f.Workspace === scope.ws);
  const wsFns = db.functions.filter((f) => f.Workspace === scope.ws);
  const wsCounts = {};
  db.schedules.forEach((s) => { wsCounts[s.Workspace] = (wsCounts[s.Workspace] || 0) + 1; });
  /* Shared form for create + edit. `existing` undefined = create mode; row object = edit mode.
     Same UX (3 sections), same mid-form refresh on Kind/Pattern change. */
  const defaultSpecFor = (p) => p === 'cron' ? '0 * * * *' : p === 'interval' ? '5m' : '2026-12-31T09:00:00Z';
  const openScheduleForm = (existing) => {
    const isEdit = !!existing;
    let cur = isEdit
      ? {
          Name: existing.Name, Pattern: existing.Type, Spec: existing.Spec,
          Timezone: existing.Timezone || 'UTC',
          TargetKind: existing.TargetType || 'flow',
          Target: existing.Target || existing.Flow || '',
        }
      : {
          Name: 'new-schedule', Pattern: 'cron', Spec: '0 * * * *', Timezone: 'UTC',
          TargetKind: 'flow', Target: wsFlows[0]?.Flow || wsFns[0]?.Function || '',
        };
    const reopen = () => openDrawer({
      title: isEdit ? 'Edit schedule · ' + existing.Name : 'New schedule',
      sub: isEdit
        ? 'workspace · ' + existing.Workspace + ' · owner ' + existing.Owner
        : 'workspace · ' + scope.ws,
      fields: [
        /* ── What to fire ─────────────────────────────────── */
        { section: 'Target — what to fire',
          label: 'Kind', value: cur.TargetKind, type: 'select', options: ['flow', 'function'],
          help: 'Flow = orchestration (DAG). Function = standalone container (Lambda-style).' },
        { label: cur.TargetKind === 'flow' ? 'Flow' : 'Function',
          value: cur.Target,
          type: 'select',
          options: cur.TargetKind === 'flow'
            ? (wsFlows.length ? wsFlows.map((f) => f.Flow) : ['—'])
            : (wsFns.length ? wsFns.map((f) => f.Function) : ['—']) },

        /* ── When to fire ─────────────────────────────────── */
        { section: 'Trigger — when to fire',
          label: 'Pattern', value: cur.Pattern, type: 'select', options: ['cron', 'interval', 'one-shot'] },
        { label: 'Spec', value: cur.Spec,
          help: cur.Pattern === 'cron' ? 'cron expression — e.g. 0 2 * * * (daily 02:00)'
            : cur.Pattern === 'interval' ? 'duration — e.g. 5m, 1h, 30s'
            : 'ISO timestamp — e.g. 2026-12-31T09:00:00Z' },
        ...(cur.Pattern === 'cron' ? [{ label: 'Timezone', value: cur.Timezone,
          help: 'IANA tz — e.g. UTC, Asia/Tashkent, America/New_York. Cron is evaluated in this timezone.' }] : []),

        /* ── Metadata ─────────────────────────────────────── */
        { section: 'Metadata',
          label: 'Name', value: cur.Name, ro: isEdit,
          help: isEdit ? 'Immutable after create — used in audit chain.' : 'Unique within this workspace. Used in logs and audit.' },
      ],
      note: 'Leader-elected · partitioned · exactly-once cluster-wide (ADR-0017). Target must exist in this workspace at deploy.',
      saveLabel: isEdit ? 'Save changes' : 'Create schedule',
      onDelete: isEdit ? () => deleteSchedule(existing.id) : undefined,
      onSave: (v) => {
        const kind = v.Kind;
        const pattern = v.Pattern;
        const targetField = kind === 'flow' ? 'Flow' : 'Function';
        const specChanged = pattern !== cur.Pattern;
        /* Kind or Pattern changed mid-form → reopen with refreshed options/spec instead of saving stale data */
        if (kind !== cur.TargetKind || specChanged) {
          cur = {
            Name: v.Name, Pattern: pattern, Timezone: v.Timezone || 'UTC',
            Spec: specChanged ? defaultSpecFor(pattern) : v.Spec,
            TargetKind: kind,
            Target: kind === cur.TargetKind ? v[targetField]
              : (kind === 'flow' ? (wsFlows[0]?.Flow || '') : (wsFns[0]?.Function || '')),
          };
          setTimeout(reopen, 60);
          return;
        }
        if (isEdit) {
          updateSchedule(existing.id, {
            Type: pattern, Spec: v.Spec, Timezone: v.Timezone || existing.Timezone,
            TargetType: kind, Target: v[targetField],
            Flow: kind === 'flow' ? v[targetField] : '—', /* legacy column */
          }, 'Schedule "' + existing.Name + '" updated');
        } else {
          createSchedule({
            workspace: scope.ws, name: v.Name, type: pattern, spec: v.Spec,
            targetType: kind, target: v[targetField],
          });
        }
      },
    });
    reopen();
  };
  const create = () => openScheduleForm();
  const edit = (s) => openScheduleForm(s);
  const del = (s) => confirm({
    title: 'Delete schedule “' + s.Name + '”?', sub: 'The schedule will stop firing immediately.',
    confirmLabel: 'Delete', onConfirm: () => deleteSchedule(s.id),
  });
  return (
    <div>
      <PageHead crumb={<Crumb extra="Schedules" />} title="Schedules"
        desc="Leader-elected, partitioned timer service. A schedule fires exactly once cluster-wide (ADR-0017). Targets a Flow (orchestration) or a Function (Lambda-style direct invoke)."
        docref="interface-adapter §3 · ADR-0017"
        actions={<Btn kind="pri" onClick={create}>+ Schedule</Btn>} />
      <p className="hint" style={{ marginTop: 0 }}>Schedules in <b>{scope.ws}</b> — {rows.length} total · {rows.filter((s) => s.enabled).length} active.</p>
      {rows.length === 0 ? (
        <WsEmptyState icon="◷" scope={scope} title="No schedules in"
          description={<>This workspace has no scheduled triggers yet. A schedule fires a <b>flow</b> (orchestration) or a <b>function</b> (Lambda-style) on cron / interval / one-shot timing.</>}
          wsCounts={wsCounts}
          onSwitchWs={(ws) => setScope({ ...scope, ws, folder: '/' })}
          cta={(wsFlows.length > 0 || wsFns.length > 0)
            ? <Btn kind="pri" onClick={create}>+ Schedule</Btn>
            : <Btn onClick={() => window.location.assign('/flows')}>Create a flow or function first →</Btn>}
          footerHint={<>Schedules are leader-elected + partitioned — a timer fires exactly once cluster-wide (ADR-0017).</>} />
      ) : (
      <div className="tablecard">
        <table>
          <thead><tr>{['On', 'Name', 'Type', 'Spec', 'Target', 'Next', 'Owner', 'State', ''].map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => {
              const tType = r.TargetType || 'flow';
              const target = r.Target || r.Flow || '—';
              return (
              <tr key={r.id}>
                <td><Toggle on={r.enabled} label=""
                  onChange={(v) => updateSchedule(r.id, { enabled: v, Next: v ? r.Next : 'paused', State: v ? 'active' : 'pending' }, `${r.Name} ${v ? 'enabled' : 'paused'}`)} /></td>
                <td><b>{r.Name}</b></td><td><Badge>{r.Type}</Badge></td><td className="mono">{r.Spec}</td>
                <td>
                  <Badge>{tType === 'function' ? 'fn' : 'flow'}</Badge>{' '}
                  <span className="mono" style={{ fontSize: 12 }}>{target}</span>
                </td>
                <td>{r.Next}</td><td style={{ fontSize: 11, color: 'var(--muted)' }}>{r.Owner}</td><td><Badge>{r.State}</Badge></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <Btn sm onClick={() => runScheduleOnce(r.id)}>Run now</Btn>{' '}
                  <Btn sm onClick={() => edit(r)}>Edit</Btn>{' '}
                  <Btn sm kind="dng" onClick={() => del(r)}>Delete</Btn>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

/* ---------------- Marketplace ---------------- */
function Marketplace() {
  const { toast, db } = useApp();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [items, setItems] = useState(db.marketplace);
  const cats = ['All', 'Payments', 'AI', 'Data', 'Notification'];
  const visible = items.filter((p) => (cat === 'All' || p.cat === cat) && (!q || (p.name + p.cat).toLowerCase().includes(q.toLowerCase())));
  const toggle = (p) => { setItems((xs) => xs.map((x) => x.id === p.id ? { ...x, installed: !x.installed } : x)); toast((p.installed ? 'Uninstalled ' : 'Installed ') + p.name); };
  return (
    <div>
      <PageHead crumb={<Crumb extra="Marketplace" />} title="Marketplace"
        desc="Connectors, polyglot FDKs, AI nodes, templates — sandboxed gRPC plugins, signed & attested."
        docref="arch §9 · ADR-0008 · roadmap Phase 7"
        actions={<Btn onClick={() => toast('Submission form opened (mock)')}>Submit plugin</Btn>} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="field" style={{ margin: 0, maxWidth: 320, flex: 1 }}>
          <input placeholder="Search plugins…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Tabs active={cat} onChange={setCat} tabs={cats.map((c) => ({ k: c, t: c }))} />
      </div>
      <div className="grid g3">
        {visible.map((p) => (
          <Card key={p.id} title={p.name} sub={p.sub}>
            <div className="flex" style={{ gap: 6, marginBottom: 6 }}>
              <Badge>{p.cat}</Badge> <Badge>signed</Badge>
              <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 12 }}>{p.installs} installs</span>
            </div>
            <Btn kind={p.installed ? '' : 'pri'} sm onClick={() => toggle(p)}>{p.installed ? '✓ Installed — uninstall' : 'Install'}</Btn>
          </Card>
        ))}
        {visible.length === 0 && <div style={{ gridColumn: '1/-1', color: 'var(--muted)', textAlign: 'center', padding: 24 }}>No plugins match.</div>}
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function Settings() {
  const { toast, confirm, scope, setScope, db, updateWorkspace, archiveWorkspace } = useApp();
  const ws = db.workspaces.find((w) => w.Workspace === scope.ws && w.Org === scope.org)
    || db.workspaces.find((w) => w.Workspace === scope.ws)
    || null;
  const [docker, setDocker] = useState(true);
  const [wasm, setWasm] = useState(false);
  const [dlq, setDlq] = useState(true);
  const [name, setName] = useState(ws ? ws.Workspace : scope.ws);
  const [slug, setSlug] = useState(ws ? ws.Workspace : scope.ws);
  const [region, setRegion] = useState((ws && ws.Region) || 'us-east-1');
  useEffect(() => {
    if (!ws) return;
    setName(ws.Workspace); setSlug(ws.Workspace); setRegion(ws.Region || 'us-east-1');
  }, [ws && ws.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = () => {
    if (!ws) { toast('Workspace not found', 'dng'); return; }
    const patch = { Workspace: name, Region: region };
    updateWorkspace(ws.id, patch, 'Workspace updated');
    if (name !== scope.ws) setScope({ ...scope, ws: name });
  };
  const doArchive = () => {
    if (!ws) return;
    confirm({
      title: 'Archive ' + ws.Workspace + '?',
      sub: 'Flows stop reconciling; data and config are retained.',
      note: 'Reversible. Audited (§16.9).', confirmLabel: 'Archive',
      onConfirm: () => archiveWorkspace(ws.id),
    });
  };
  const dangerDelete = () => confirm({
    title: 'Delete workspace "' + name + '"?', sub: 'All flows, functions, keys, secrets, and history will be lost.',
    note: 'Irreversible. Audited (§16.9). Requires Owner role.', confirmLabel: 'Delete workspace',
    onConfirm: () => toast('Hard-delete is disabled in the demo — use Archive instead', 'warn'),
  });
  return (
    <div>
      <PageHead crumb={<Crumb extra="Settings" />} title="Workspace Settings"
        desc="Runtimes, event bus, persistence, secrets, workspace identity. Secrets only via JIT FetchSecret — never to disk."
        docref="arch §6 · ADR-0006/0015/0016 · §16.8" />
      <div className="grid g2 mb">
        <Card title="Workspace identity" sub="rename / slug / default region">
          <div className="field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label>Slug</label><input value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
          <div className="field"><label>Default region</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option>us-east-1</option><option>us-west-2</option><option>eu-west-1</option><option>ap-southeast-1</option>
            </select></div>
          <Btn kind="pri" onClick={save}>Save changes</Btn>
        </Card>
        <Card title="Runtimes (tiered, sandboxed)" sub="ADR-0015 — no privileged containers">
          <div className="kv"><span>Docker</span><Toggle on={docker} onChange={(v) => { setDocker(v); toast('Docker ' + (v ? 'enabled' : 'disabled')); }} label={docker ? 'enabled' : 'disabled'} /></div>
          <div className="kv"><span>Firecracker (~125ms)</span><Badge>enabled</Badge></div>
          <div className="kv"><span>WASM (sub-ms)</span><Toggle on={wasm} onChange={(v) => { setWasm(v); toast('WASM ' + (v ? 'enabled' : 'disabled')); }} label={wasm ? 'enabled' : 'disabled'} /></div>
        </Card>
        <Card title="Event bus" sub="ADR-0006 — separate from control gRPC">
          <KV k="broker">Kafka</KV><KV k="partitions">24</KV>
          <div className="kv"><span>DLQ</span><Toggle on={dlq} onChange={(v) => { setDlq(v); toast('DLQ ' + (v ? 'enabled' : 'disabled')); }} label={dlq ? 'enabled' : 'disabled'} /></div>
        </Card>
        <Card title="Persistence" sub="ADR-0016">
          <KV k="Postgres">+ 2 read replicas</KV><KV k="Redis">warm-pool · rate · key cache</KV><KV k="Object store">+ OCI registry</KV>
        </Card>
        <Card title="Secrets" sub="JIT FetchSecret · never to disk (§16.8)">
          <KV k="provider">Vault (SPIFFE)</KV><KV k="mTLS"><Badge>enabled</Badge></KV>
        </Card>
        <Card title="Webhooks" sub="org-level notifications (Slack/PagerDuty)">
          <KV k="deploy.failed">→ #payments-alerts</KV><KV k="dlq.high">→ PagerDuty</KV>
          <KV k="audit.privileged">→ SIEM webhook</KV>
        </Card>
      </div>
      <Card title="Danger zone" sub="irreversible · Owner role required">
        <div className="kv"><span>Archive workspace {ws && ws.Status === 'archived' && <Badge>archived</Badge>}</span>
          <Btn kind="dng" sm onClick={doArchive} disabled={!ws || ws.Status === 'archived'}>Archive</Btn></div>
        <div className="kv"><span>Delete workspace permanently</span>
          <Btn kind="dng" sm onClick={dangerDelete}>Delete…</Btn></div>
      </Card>
    </div>
  );
}

/* ---------------- Protos (gRPC contract registry) ---------------- */

/* Mock .proto parser — production would call into protoc on the Build Service.
   Here we scan the pasted text with regexes to surface enough structure for
   the UI to feel real: services, methods (with streaming), and messages with
   their fields. Anything we can't parse falls back to a single placeholder
   service so the user sees that something was registered. */

function Protos() {
  const { scope, db, openDrawer, confirm, createProto, updateProto, deleteProto } = useApp();
  const protos = (db.protos || []).filter((p) => p.Workspace === scope.ws);

  const usageCount = (proto) => {
    let n = 0;
    (db.flows || []).filter((fl) => fl.Workspace === scope.ws).forEach((fl) => {
      const g = fl.graph || {};
      (g.nodes || []).forEach((nd) => {
        if (nd.kind === 'grpc' && (nd.config || {}).protoRef === proto.Ref) n += 1;
      });
    });
    return n;
  };

  /* Detected services panel rendered live inside the drawer. */
  const openUpload = (existing) => {
    const isEdit = !!existing;
    const defaultProto = `syntax = "proto3";
package payments;

service Checkout {
  rpc Charge (CheckoutRequest) returns (CheckoutResponse);
  rpc Refund (RefundRequest) returns (RefundResponse);
}

message CheckoutRequest {
  double amount = 1;
  string currency = 2;
  string customer_id = 3;
}
message CheckoutResponse {
  string transaction_id = 1;
  string status = 2;
}
message RefundRequest  { string transaction_id = 1; string reason = 2; }
message RefundResponse { string refund_id = 1; string status = 2; }
`;
    const startingText = existing && existing._sourceText
      ? existing._sourceText
      : isEdit
      ? `service ${existing.services[0]?.name || 'Service'} {\n  // edit below — Name and Version are immutable\n}\n`
      : defaultProto;
    openDrawer({
      title: isEdit ? 'Edit proto · ' + existing.Name + '@' + existing.Version : 'Upload proto',
      sub: 'workspace · ' + scope.ws,
      fields: [
        { section: 'Identity',
          label: 'Name', value: isEdit ? existing.Name : 'payments',
          ro: isEdit,
          help: isEdit
            ? 'Immutable — encoded in the OCI tag.'
            : 'lowercase package name, e.g. payments, billing, notification.' },
        { label: 'Version', value: isEdit ? existing.Version : 'v1',
          ro: isEdit,
          help: isEdit ? 'Immutable — encoded in the OCI tag.' : 'Semantic version tag, e.g. v1, v2.' },
        { label: 'Description', value: isEdit ? (existing.Description || '') : '', type: 'textarea',
          help: 'What this contract is for. Shown in /protos list.' },
        { section: 'Proto source',
          label: 'Proto text (.proto)', value: startingText, type: 'textarea',
          help: 'Paste your .proto file content. Services / methods / messages are parsed live.' },
      ],
      note: isEdit
        ? 'Editing replaces the parsed services / messages. Existing gRPC triggers keep their service+method selection.'
        : 'On save, the Build Service compiles this to an OCI descriptor (mocked here). gRPC triggers will see it in their Proto descriptor dropdown.',
      saveLabel: isEdit ? 'Save changes' : 'Register proto',
      onDelete: isEdit ? () => deleteProto(existing.id) : undefined,
      onSave: (v) => {
        const parsed = parseProtoText(v['Proto text (.proto)']);
        if (isEdit) {
          updateProto(existing.id, {
            Description: v.Description,
            services: parsed.services,
            messages: parsed.messages,
            _sourceText: v['Proto text (.proto)'],
          }, 'Proto updated');
        } else {
          createProto({
            workspace: scope.ws, name: v.Name, version: v.Version,
            description: v.Description,
            services: parsed.services, messages: parsed.messages,
          });
        }
      },
    });
  };

  const totalMethods = protos.reduce((n, p) =>
    n + (p.services || []).reduce((m, s) => m + (s.methods || []).length, 0), 0);

  return (
    <div>
      <PageHead crumb={<Crumb extra="Protos" />} title="gRPC proto registry"
        desc="Workspace-scoped contracts compiled to OCI descriptors. gRPC triggers pick a proto from this registry to expose their service / method."
        docref="ADR-0009 · interface-adapter §5 · build-service-pipeline.md"
        actions={<Btn kind="pri" onClick={() => openUpload()}>+ Upload proto</Btn>} />
      <p className="hint" style={{ marginTop: 0 }}>
        <b>{scope.ws}</b> · {protos.length} proto{protos.length === 1 ? '' : 's'} · {totalMethods} method{totalMethods === 1 ? '' : 's'} total.
      </p>
      {protos.length === 0 ? (
        <EmptyState icon="⛬" title="No protos in this workspace"
          sub={<>gRPC triggers need a proto contract. Upload your first <span className="mono">.proto</span> file to register it.</>} />
      ) : (
        <div className="tablecard">
          <table>
            <thead><tr>{['Name', 'Version', 'Services', 'Methods', 'Used by', 'OCI ref', 'Last update', ''].map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>
              {protos.map((p) => {
                const used = usageCount(p);
                const svcCount = (p.services || []).length;
                const methodCount = (p.services || []).reduce((n, s) => n + (s.methods || []).length, 0);
                return (
                  <tr key={p.id} className="clickable" onClick={() => openUpload(p)}>
                    <td><b>{p.Name}</b></td>
                    <td className="mono">{p.Version}</td>
                    <td>{svcCount}</td>
                    <td>{methodCount}</td>
                    <td>{used > 0 ? <Badge>{used} flow{used === 1 ? '' : 's'}</Badge> : <span style={{ color: 'var(--faint)' }}>—</span>}</td>
                    <td className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{p.Ref}</td>
                    <td style={{ color: 'var(--faint)', fontSize: 12 }}>just now</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                      <Btn sm onClick={() => openUpload(p)}>✎</Btn>{' '}
                      <Btn sm kind="dng" onClick={() => confirm({
                        title: 'Delete proto "' + p.Name + '@' + p.Version + '"?',
                        sub: used > 0
                          ? '⚠ ' + used + ' gRPC trigger(s) reference this proto. Delete will be blocked.'
                          : 'Removes the registry entry. The OCI image remains until garbage-collected.',
                        confirmLabel: 'Delete',
                        onConfirm: () => deleteProto(p.id),
                      })}>🗑</Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



/* ======================= src/App.jsx ======================= */
