/* ======================= src/store.jsx ======================= */

/* Sidebar navigation (groups → items). Paths map to routes in App.jsx. */
const NAV = [
  { lbl: 'Overview', items: [{ p: '/dashboard', i: '◧', t: 'Dashboard' }] },
  /* "Design" group removed — Flows / Functions / Schedules are managed via the
     WorkspaceTrees in the sidebar (Postman pattern). Their /routes still exist
     and are reachable via tree item clicks, command palette and direct URL. */
  { lbl: 'Operate', items: [
    { p: '/deployments', i: '▤', t: 'Deployments', tag: 'CI/GitOps' },
    { p: '/monitoring', i: '◴', t: 'Monitoring' },
    { p: '/visualizer', i: '◉', t: 'Live Visualizer' },
    { p: '/dlq', i: '⚠', t: 'DLQ & Replay' } ] },
  { lbl: 'Organization', items: [
    { p: '/org', i: '🏢', t: 'Organization' },
    { p: '/workspaces', i: '▣', t: 'Workspaces' },
    { p: '/users', i: '☰', t: 'Users & RBAC' },
    { p: '/roles', i: '⛨', t: 'Roles' } ] },
  { lbl: 'Access & Routing', items: [
    { p: '/endpoints', i: '⇄', t: 'Endpoints' },
    { p: '/routegroups', i: '⛓', t: 'Route Groups' },
    { p: '/env-report', i: '≣', t: 'Env Report', tag: 'cross-flow' },
    { p: '/apikeys', i: '⚿', t: 'API Keys' } ] },
  { lbl: 'Middleware', items: [
    { p: '/middleware-protos', i: '⛬', t: 'Proto Registry', tag: 'new' },
    { p: '/protos', i: '📄', t: 'Protos (legacy)' } ] },
  { lbl: 'Govern', items: [
    { p: '/audit', i: '▦', t: 'Audit Log' } ] },
  { lbl: 'Platform', items: [
    { p: '/marketplace', i: '◆', t: 'Marketplace' },
    { p: '/settings', i: '⚙', t: 'Settings' } ] },
];

const load = (k, d) => { try { const v = localStorage.getItem('evd_' + k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const persist = (k, v) => { try { localStorage.setItem('evd_' + k, JSON.stringify(v)); } catch (e) { void e; } };

/* bump when db.json shape changes — invalidates stale persisted copies */
const DB_VERSION = 12;

/* ---- mock-API mutation helpers: ids, timestamps, versions, starter graph ---- */
let _seq = 0;
const uid = (p) => p + Date.now().toString(36) + (_seq++).toString(36);
const nowZ = () => new Date().toISOString().slice(11, 19) + 'Z';
const hash = () => Math.random().toString(16).slice(2, 6) + '…' + Math.random().toString(16).slice(2, 5);
const nextVer = (plan) => 'v' + ((parseInt(String(plan).replace(/\D/g, ''), 10) || 0) + 1);
const starterGraph = () => ({
  nodes: [{ id: uid('n'), kind: 'httptrigger', title: 'HTTP Trigger', body: 'GET /', x: 90, y: 230 }],
  wires: [],
});

/* KEDA ScaledObject defaults — mirrors keda-autoscaling-spec §3.1 (runner pool template).
   New functions opt in to scale-to-zero (min=0) with concurrency as the primary leading
   indicator; users can edit min/max/cooldown and add triggers in the drawer. */
const defaultScalingPolicy = () => ({
  minReplicaCount: 0, maxReplicaCount: 8,
  cooldownPeriod: 120, pollingInterval: 5,
  triggers: [
    { type: 'prometheus', name: 'concurrency-saturation',
      query: 'avg(runner_concurrency_used / runner_concurrency_max)',
      threshold: '0.7' },
  ],
  behavior: {
    scaleUp:   { stabilizationWindowSeconds: 0,   percent: 200, periodSeconds: 15 },
    scaleDown: { stabilizationWindowSeconds: 120, percent: 25,  periodSeconds: 60 },
  },
});

const Ctx = createContext(null);
function AppProvider({ children }) {
  const [authed, setAuthed] = useState(() => load('authed', false));
  const [scope, setScope] = useState(() => load('scope', { org: 'Acme Corp', ws: 'payments', folder: '/' }));
  useEffect(() => persist('authed', authed), [authed]);
  useEffect(() => persist('scope', scope), [scope]);

  /* mock-API data — persisted to localStorage so session changes survive a refresh.
     loadDb() fetches the pristine /mock/db.json; resetDb() discards local changes. */
  const [db, setDb] = useState(null);
  const [dbError, setDbError] = useState(null);
  const loadInto = useCallback((fresh) => {
    setDbError(null);
    if (!fresh) {
      const saved = load('db', null);
      if (saved && saved.v === DB_VERSION && saved.data) { setDb(saved.data); return; }
    }
    setDb(null);
    loadDb().then(setDb).catch((e) => setDbError(String(e.message || e)));
  }, []);
  const reloadDb = useCallback(() => loadInto(false), [loadInto]);
  const resetDb = useCallback(() => {
    try { localStorage.removeItem('evd_db'); } catch (e) { void e; }
    loadInto(true);
  }, [loadInto]);
  useEffect(() => { reloadDb(); }, [reloadDb]);
  /* persist on every change — audit is capped so storage stays bounded */
  useEffect(() => {
    if (!db) return;
    persist('db', { v: DB_VERSION, data: { ...db, audit: (db.audit || []).slice(0, 150) } });
  }, [db]);

  /* self-heal: when data arrives, snap scope to a valid Org → Workspace → Collection */
  useEffect(() => {
    if (!db) return;
    setScope((s) => {
      const org = db.orgs.find((o) => o.name === s.org) || db.orgs[0];
      const ws = db.workspaces.find((w) => w.Org === org.name && w.Workspace === s.ws)
        || db.workspaces.find((w) => w.Org === org.name);
      const paths = [];
      const walk = (ns) => (ns || []).forEach((n) => { paths.push(n.p); walk(n.children); });
      walk(db.collectionTrees[ws.Workspace]);
      const folder = s.folder === '/' || paths.includes(s.folder) ? s.folder : '/';
      return (org.name === s.org && ws.Workspace === s.ws && folder === s.folder)
        ? s : { org: org.name, ws: ws.Workspace, folder };
    });
  }, [db]);

  const [toasts, setToasts] = useState([]);
  const [drawer, setDrawer] = useState(null);
  const [palette, setPalette] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bannerOff, setBannerOff] = useState(() => load('bannerOff', false));
  useEffect(() => persist('bannerOff', bannerOff), [bannerOff]);
  /* User-pinned NAV items — surfaced in a "PINNED" section above the standard
     groups. Stored as an array of route paths. */
  const [pinnedNav, setPinnedNav] = useState(() => load('pinnedNav', []));
  useEffect(() => persist('pinnedNav', pinnedNav), [pinnedNav]);
  /* Recently visited pages — last 10 unique routes the user opened, newest first.
     Layout calls pushVisit() on every useLocation change. */
  const [recentlyVisited, setRecentlyVisited] = useState(() => load('recentlyVisited', []));
  useEffect(() => persist('recentlyVisited', recentlyVisited), [recentlyVisited]);
  const pushVisit = useCallback((entry) => {
    if (!entry || !entry.p || entry.p === '/dashboard') return; /* don't track the home */
    setRecentlyVisited((prev) => {
      const next = [{ ...entry, ts: Date.now() }, ...prev.filter((x) => x.p !== entry.p)];
      return next.slice(0, 10);
    });
  }, []);
  /* Theme: 'dark' (default) | 'light'. Setting an attr on <html> lets the CSS
     light-theme block kick in without re-rendering the React tree. */
  const [theme, setTheme] = useState(() => load('theme', 'dark'));
  useEffect(() => {
    persist('theme', theme);
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
  }, [theme]);
  const [navCollapsed, setNavCollapsed] = useState(() => load('navCollapsed', []));
  useEffect(() => persist('navCollapsed', navCollapsed), [navCollapsed]);

  const toast = useCallback((m, type = 'ok') => {
    const id = Math.random();
    setToasts((t) => [...t, { id, m, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  }, []);
  const openDrawer = useCallback((cfg) => setDrawer(cfg), []);
  const closeDrawer = useCallback(() => setDrawer(null), []);
  const signOut = useCallback(() => { setAuthed(false); setDrawer(null); setPalette(false); }, []);
  /* centered popup confirm (not the right-side Drawer — that's for editing) */
  const [confirmDlg, setConfirmDlg] = useState(null);
  const closeConfirm = useCallback(() => setConfirmDlg(null), []);
  const confirm = useCallback((opts) => setConfirmDlg({
    title: opts.title || 'Confirm',
    sub: opts.sub,
    note: opts.note,
    confirmLabel: opts.confirmLabel || 'Confirm',
    kind: opts.kind || 'dng',
    onConfirm: opts.onConfirm,
  }), []);

  /* ---- data actions — mutate the one in-memory mock DB; every screen sees it ---- */
  const auditRow = (action, target) => ({ id: uid('a'), agoMin: 0, Time: nowZ(), Actor: 'ada@acme.io', Action: action, Target: target, Hash: hash() });

  const createFlow = ({ workspace, collection, name, graph, trigger }) => {
    const id = uid('f');
    /* Templates may pass a pre-built graph and a matching trigger label.
       Without a template, we fall back to the starter (single HTTP trigger). */
    const g = graph || starterGraph();
    const nodeCount = (g.nodes || []).length;
    const flow = {
      id, Workspace: workspace, Collection: collection, Flow: name || 'new-flow',
      Trigger: trigger || 'HTTP',
      Nodes: nodeCount + ' step' + (nodeCount === 1 ? '' : 's'),
      Plan: 'v1', State: 'draft', p95: '—', graph: g,
    };
    setDb((d) => ({ ...d, flows: [...d.flows, flow], audit: [auditRow('flow.create', (name || 'new-flow') + (graph ? ' (from template)' : '')), ...d.audit] }));
    toast('Flow “' + flow.Flow + '” created');
    return id;
  };
  const updateFlow = (id, patch, msg) => {
    const f = db && db.flows.find((x) => x.id === id);
    setDb((d) => ({
      ...d,
      flows: d.flows.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      audit: [auditRow('flow.update', f ? f.Flow : id), ...d.audit],
    }));
    if (msg) toast(msg);
  };
  const deleteFlow = (id) => {
    const f = db && db.flows.find((x) => x.id === id);
    setDb((d) => ({ ...d, flows: d.flows.filter((x) => x.id !== id), audit: [auditRow('flow.delete', f ? f.Flow : id), ...d.audit] }));
    toast('Flow deleted', 'dng');
  };
  const cloneFlow = (id) => {
    const f = db && db.flows.find((x) => x.id === id);
    if (!f) return null;
    const nid = uid('f');
    setDb((d) => ({ ...d, flows: [...d.flows, { ...f, id: nid, Flow: f.Flow + '-copy', State: 'draft', graph: f.graph ? JSON.parse(JSON.stringify(f.graph)) : undefined }] }));
    toast('Cloned ' + f.Flow);
    return nid;
  };
  const saveFlowGraph = (id, graph) => {
    const n = graph.nodes.length;
    const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
    /* Keep the last 20 saves as a version history. Each entry is a frozen graph
       snapshot tagged with the plan version + timestamp. */
    setDb((d) => ({
      ...d,
      flows: d.flows.map((f) => {
        if (f.id !== id) return f;
        const versions = Array.isArray(f.versions) ? f.versions : [];
        const snapshot = {
          v: f.Plan || 'v1',
          ts, author: 'ada@acme.io',
          nodeCount: n,
          graph: JSON.parse(JSON.stringify(graph)),
        };
        const nextVersions = [snapshot, ...versions].slice(0, 20);
        return { ...f, graph, Nodes: n + ' step' + (n === 1 ? '' : 's'), versions: nextVersions };
      }),
    }));
  };
  /* Restore the flow to a previous saved snapshot. */
  const restoreFlowVersion = (flowId, snapshotTs) => {
    const f = db && db.flows.find((x) => x.id === flowId);
    if (!f) return;
    const snap = (f.versions || []).find((v) => v.ts === snapshotTs);
    if (!snap) return;
    const n = (snap.graph.nodes || []).length;
    setDb((d) => ({
      ...d,
      flows: d.flows.map((x) => (x.id === flowId
        ? { ...x, graph: JSON.parse(JSON.stringify(snap.graph)), Nodes: n + ' step' + (n === 1 ? '' : 's') }
        : x)),
      audit: [auditRow('flow.restore', f.Flow + ' → ' + snap.v + ' (' + snap.ts + ')'), ...d.audit],
    }));
    toast('Restored ' + f.Flow + ' to ' + snap.v);
  };
  const deployFlow = (id, opts) => {
    const f = db && db.flows.find((x) => x.id === id);
    if (!f) return null;
    const ver = nextVer(f.Plan);
    const o = opts || {};
    /* Dry-run: no state change on the flow, deployment marked so the UI can show
       "dry-run only" without affecting traffic or replicas. */
    const isDryRun = !!o.dryRun;
    /* Scheduled: deployment is created in 'scheduled' status with a future
       timestamp. The pipeline starts when the scheduler kicks in (mocked). */
    const scheduledFor = o.scheduledFor || null;
    /* Org-level approval gate: if a policy demands prod approval and the
       workspace is prod, force pending-approval status. */
    const orgPolicy = (db && db.orgs[0] && db.orgs[0].policy) || {};
    const ws = (db && db.workspaces.find((w) => w.Workspace === f.Workspace)) || {};
    const requiresApproval = orgPolicy.requireProdApproval && ws.Env === 'prod';
    let status;
    if (isDryRun) status = 'dry-run';
    else if (scheduledFor) status = 'scheduled';
    else if (requiresApproval) status = 'pending approval';
    else status = 'rolling out';
    /* The pipeline of 5 stages is what the UI animates. We initialise it to
       pending; the live-progress hook in /deployments advances it stage by stage. */
    const pipeline = {
      stages: ['Validate', 'BuildKit', 'Sign + attest', 'Push @sha', 'Reconcile'],
      stageIdx: 0,
      startedAt: scheduledFor ? null : Date.now(),
    };
    const dep = {
      id: uid('h'), Workspace: f.Workspace, Flow: f.Flow, Version: ver,
      Plan: 'PlanSpec', Author: 'ada@acme.io',
      Trigger: o.trigger || 'manual', Started: 'just now', Duration: '—',
      Status: status,
      Traffic: isDryRun ? 0 : 0,
      dryRun: isDryRun, scheduledFor, requiresApproval,
      pipeline,
    };
    setDb((d) => ({
      ...d,
      flows: isDryRun || scheduledFor ? d.flows
        : d.flows.map((x) => (x.id === id ? { ...x, State: requiresApproval ? x.State : 'live', Plan: ver } : x)),
      deployments: [dep, ...d.deployments],
      audit: [auditRow(
        isDryRun ? 'deploy.dry_run'
          : scheduledFor ? 'deploy.scheduled'
          : requiresApproval ? 'deploy.pending_approval'
          : 'deploy.publish',
        f.Flow + ' ' + ver),
      ...d.audit],
    }));
    if (isDryRun) toast('Dry-run ' + f.Flow + ' ' + ver + ' — no side effects');
    else if (scheduledFor) toast('Scheduled ' + f.Flow + ' ' + ver + ' for ' + new Date(scheduledFor).toLocaleString());
    else if (requiresApproval) toast('Submitted ' + f.Flow + ' ' + ver + ' for approval', 'warn');
    else toast('Deployed ' + f.Flow + ' ' + ver + ' — reconciling');
    return { ver, depId: dep.id, status };
  };
  /* Advance a deployment one pipeline stage. Used by the live-progress hook. */
  const advanceDeploymentStage = (depId) => {
    setDb((d) => ({
      ...d,
      deployments: d.deployments.map((dep) => {
        if (dep.id !== depId || !dep.pipeline) return dep;
        const next = dep.pipeline.stageIdx + 1;
        const done = next >= dep.pipeline.stages.length;
        return {
          ...dep,
          pipeline: { ...dep.pipeline, stageIdx: next },
          Status: done ? (dep.dryRun ? 'dry-run · done' : 'rolling out') : dep.Status,
          Duration: done ? Math.round((Date.now() - (dep.pipeline.startedAt || Date.now())) / 1000) + 's' : dep.Duration,
        };
      }),
    }));
  };
  /* Cancel a scheduled deployment before it fires. */
  const cancelScheduledDeployment = (depId) => {
    const dep = db && db.deployments.find((x) => x.id === depId);
    if (!dep) return;
    setDb((d) => ({
      ...d,
      deployments: d.deployments.filter((x) => x.id !== depId),
      audit: [auditRow('deploy.scheduled.cancel', (dep.Flow || '') + ' ' + dep.Version), ...d.audit],
    }));
    toast('Scheduled deploy cancelled');
  };
  const createCollection = (ws, parentPath, name) => {
    const slug = (name || 'collection').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'collection';
    const base = parentPath && parentPath !== '/' ? parentPath : '';
    const p = base + '/' + slug;
    const node = { p, name: slug, owner: 'ada@acme.io', desc: 'New collection.' };
    setDb((d) => {
      const tree = JSON.parse(JSON.stringify(d.collectionTrees[ws] || []));
      if (!base) tree.push(node);
      else {
        const attach = (ns) => ns.forEach((x) => {
          if (x.p === parentPath) x.children = [...(x.children || []), node];
          else if (x.children) attach(x.children);
        });
        attach(tree);
      }
      return { ...d, collectionTrees: { ...d.collectionTrees, [ws]: tree }, audit: [auditRow('collection.create', ws + p), ...d.audit] };
    });
    toast('Collection “' + slug + '” created');
    return p;
  };
  const createApiKey = ({ workspace, name, scopes }) => {
    const id = uid('k');
    const key = {
      id, Workspace: workspace, Name: name || 'new-key',
      Prefix: 'evd_pk_' + Math.random().toString(16).slice(2, 6) + '…',
      Scopes: scopes || 'invoke', 'Rate limit': '50 rps · b100 · c20', Status: 'active', Expires: '90d',
    };
    setDb((d) => ({ ...d, apiKeys: [...d.apiKeys, key], audit: [auditRow('apikey.create', key.Name), ...d.audit] }));
    toast('API key “' + key.Name + '” created');
    return id;
  };
  const updateApiKey = (id, patch, msg) => {
    const k = db && db.apiKeys.find((x) => x.id === id);
    setDb((d) => ({ ...d, apiKeys: d.apiKeys.map((x) => (x.id === id ? { ...x, ...patch } : x)), audit: [auditRow('apikey.update', k ? k.Name : id), ...d.audit] }));
    if (msg) toast(msg);
  };
  const createRouteGroup = ({ workspace, name, namespace }) => {
    const id = uid('r');
    const rg = { id, Workspace: workspace, Name: name || 'new-group', 'Path namespace': namespace || '/new', Policy: 'API key + 200rps', 'Scaling shard': 'shared pool', Status: 'reconciled' };
    setDb((d) => ({ ...d, routeGroups: [...d.routeGroups, rg], audit: [auditRow('routegroup.create', rg.Name), ...d.audit] }));
    toast('Route group “' + rg.Name + '” created');
    return id;
  };
  const updateRouteGroup = (id, patch, msg) => {
    const r = db && db.routeGroups.find((x) => x.id === id);
    setDb((d) => ({
      ...d,
      routeGroups: d.routeGroups.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      audit: [auditRow('routegroup.update', r ? r.Name : id), ...d.audit],
    }));
    if (msg) toast(msg);
  };
  const deleteRouteGroup = (id) => {
    const r = db && db.routeGroups.find((x) => x.id === id);
    setDb((d) => ({
      ...d,
      routeGroups: d.routeGroups.filter((x) => x.id !== id),
      audit: [auditRow('routegroup.delete', r ? r.Name : id), ...d.audit],
    }));
    toast('Route group deleted', 'dng');
  };
  const promoteDeployment = (id) => {
    const dep = db && db.deployments.find((x) => x.id === id);
    if (!dep) return;
    setDb((d) => ({
      ...d,
      deployments: d.deployments.map((x) => (x.id === id ? { ...x, Status: 'reconciled', Traffic: 100 } : x)),
      audit: [auditRow('deploy.promote', (dep.Flow || '') + ' ' + dep.Version), ...d.audit],
    }));
    toast('Promoted ' + dep.Version + ' → 100% reconciled');
  };
  /* Canary release: shift a fraction of traffic to the new version.
     A real controller would gate this on SLO checks; we mock the step. */
  const canaryShift = (id, pct) => {
    const dep = db && db.deployments.find((x) => x.id === id);
    if (!dep) return;
    setDb((d) => ({
      ...d,
      deployments: d.deployments.map((x) => (x.id === id
        ? { ...x, Status: pct >= 100 ? 'reconciled' : 'canary', Traffic: pct }
        : x)),
      audit: [auditRow('deploy.canary', (dep.Flow || '') + ' ' + dep.Version + ' @ ' + pct + '%'), ...d.audit],
    }));
    toast('Canary @ ' + pct + '% — ' + dep.Version);
  };
  /* Approval flow — gate before a deployment may shift traffic past 0%. */
  const requestApproval = (id) => {
    const dep = db && db.deployments.find((x) => x.id === id);
    if (!dep) return;
    setDb((d) => ({
      ...d,
      deployments: d.deployments.map((x) => (x.id === id ? { ...x, Status: 'pending approval' } : x)),
      audit: [auditRow('deploy.approval.request', (dep.Flow || '') + ' ' + dep.Version), ...d.audit],
    }));
    toast('Approval requested for ' + dep.Version);
  };
  const approveDeployment = (id) => {
    const dep = db && db.deployments.find((x) => x.id === id);
    if (!dep) return;
    setDb((d) => ({
      ...d,
      deployments: d.deployments.map((x) => (x.id === id ? { ...x, Status: 'rolling out', Traffic: 10 } : x)),
      audit: [auditRow('deploy.approval.granted', (dep.Flow || '') + ' ' + dep.Version), ...d.audit],
    }));
    toast('Approved ' + dep.Version + ' — starting at 10% canary');
  };
  const rollbackDeployment = (id, targetVersion) => {
    const dep = db && db.deployments.find((x) => x.id === id);
    if (!dep) return;
    /* Default to immediate previous version; the UI may override to roll back
       further (Deployments page "Rollback to..." dropdown). */
    const prev = targetVersion
      || 'v' + Math.max((parseInt(String(dep.Version).replace(/\D/g, ''), 10) || 1) - 1, 1);
    setDb((d) => ({
      ...d,
      deployments: d.deployments.map((x) => (x.id === id ? { ...x, Status: 'rolled back' } : x)),
      flows: d.flows.map((f) => (dep.Flow && f.Flow === dep.Flow && f.Workspace === dep.Workspace ? { ...f, Plan: prev, State: 'live' } : f)),
      audit: [auditRow('deploy.rollback', (dep.Flow || '') + ' ' + dep.Version + ' → ' + prev), ...d.audit],
    }));
    toast('Rolled back ' + dep.Version + ' → ' + prev, 'warn');
  };
  const replayDlq = (id) => {
    const m = db && db.dlq.find((x) => x.id === id);
    setDb((d) => ({ ...d, dlq: d.dlq.filter((x) => x.id !== id), audit: [auditRow('dlq.replay', m ? m.ExecID : id), ...d.audit] }));
    toast('Replayed ' + (m ? m.ExecID : ''));
  };
  const discardDlq = (id) => {
    const m = db && db.dlq.find((x) => x.id === id);
    setDb((d) => ({ ...d, dlq: d.dlq.filter((x) => x.id !== id), audit: [auditRow('dlq.discard', m ? m.ExecID : id), ...d.audit] }));
    toast('Message discarded', 'dng');
  };
  const replayAllDlq = (workspace) => {
    let n = 0;
    setDb((d) => {
      const kept = d.dlq.filter((x) => x.Workspace !== workspace);
      n = d.dlq.length - kept.length;
      return { ...d, dlq: kept, audit: [auditRow('dlq.replay_all', workspace + ' (' + n + ')'), ...d.audit] };
    });
    toast('Replayed all DLQ messages in ' + workspace);
  };
  const inviteUser = ({ email, scope: scp, role }) => {
    const id = uid('iv');
    const inv = { id, Email: email || 'new.user@acme.io', Scope: scp || 'WS payments', Role: role || 'Viewer', 'Invited by': 'ada@acme.io', Sent: 'just now', Status: 'invited' };
    setDb((d) => ({ ...d, invitations: [inv, ...d.invitations], audit: [auditRow('user.invite', inv.Email), ...d.audit] }));
    toast('Invitation sent to ' + inv.Email);
    return id;
  };
  const acceptInvitation = (id) => {
    const inv = db && db.invitations.find((x) => x.id === id);
    if (!inv) return null;
    const userId = uid('u');
    const name = inv.Email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const user = { id: userId, User: name, Email: inv.Email, Status: 'active', Role: inv.Role, Scope: inv.Scope, MFA: 'pending', SSO: 'OIDC', 'Last active': 'just now', title: 'Member' };
    const grant = { id: uid('g'), userId, Scope: inv.Scope, Role: inv.Role, 'Granted by': 'invitation', Granted: 'just now', Status: 'active' };
    setDb((d) => ({
      ...d,
      users: [...d.users, user],
      invitations: d.invitations.map((x) => (x.id === id ? { ...x, Status: 'accepted' } : x)),
      grants: [...d.grants, grant],
      audit: [auditRow('user.create', inv.Email), ...d.audit],
    }));
    toast(inv.Email + ' joined as ' + inv.Role);
    return userId;
  };
  const revokeInvitation = (id) => {
    const inv = db && db.invitations.find((x) => x.id === id);
    setDb((d) => ({ ...d, invitations: d.invitations.filter((x) => x.id !== id), audit: [auditRow('user.invite_revoke', inv ? inv.Email : id), ...d.audit] }));
    toast('Invitation revoked', 'dng');
  };
  /* Admin-initiated direct user creation (no email invite flow). Generates a one-shot
     temp password that the caller must show to the operator IMMEDIATELY — it is not
     stored back to db.users (we keep only the bcrypt-style prefix for audit). */
  const genTempPassword = () => {
    const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let p = ''; for (let i = 0; i < 14; i++) p += alpha[Math.floor(Math.random() * alpha.length)];
    return 'Tmp-' + p;
  };
  const createUser = ({ name, email, phone, position, ipAddress, role, scope: scp }) => {
    const userId = uid('u');
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || cleanEmail.split('@')[0] || 'new-user').trim();
    const r = (role || 'Viewer').trim();
    const s = (scp || 'WS ' + scope.ws).trim();
    const tempPassword = genTempPassword();
    const passwordPrefix = tempPassword.slice(0, 6) + '…';
    const user = {
      id: userId, User: cleanName, Email: cleanEmail || 'user-' + userId + '@acme.io',
      Status: 'active', Role: r, Scope: s,
      MFA: 'pending', SSO: 'password',
      'Last active': '—',
      title: position || 'Member',
      phone: (phone || '').trim(),
      position: (position || '').trim(),
      ipAddress: Array.isArray(ipAddress)
        ? ipAddress.map((s) => String(s).trim()).filter(Boolean)
        : (ipAddress ? [String(ipAddress).trim()].filter(Boolean) : []),
      passwordPrefix, mustResetPassword: true,
    };
    const grant = {
      id: uid('g'), userId, Scope: s, Role: r,
      'Granted by': 'ada@acme.io · direct-create', Granted: 'just now', Status: 'active',
    };
    setDb((d) => ({
      ...d,
      users: [...d.users, user],
      grants: [...d.grants, grant],
      audit: [auditRow('user.create', cleanEmail + ' · ' + r + ' @ ' + s + ' · temp password issued'), ...d.audit],
    }));
    toast('User "' + cleanName + '" created — copy the temp password now');
    return { userId, tempPassword };
  };
  const updateUser = (id, patch, msg) => {
    const u = db && db.users.find((x) => x.id === id);
    setDb((d) => ({ ...d, users: d.users.map((x) => (x.id === id ? { ...x, ...patch } : x)), audit: [auditRow('user.update', u ? u.User : id), ...d.audit] }));
    if (msg) toast(msg);
  };
  const grantRole = (userId, { scope: scp, role }) => {
    const g = { id: uid('g'), userId, Scope: scp, Role: role, 'Granted by': 'ada@acme.io', Granted: 'just now', Status: 'active' };
    setDb((d) => ({ ...d, grants: [...d.grants, g], audit: [auditRow('role.grant', role + ' @ ' + scp), ...d.audit] }));
    toast('Granted ' + role + ' on ' + scp);
  };
  const revokeGrant = (grantId) => {
    const g = db && db.grants.find((x) => x.id === grantId);
    setDb((d) => ({ ...d, grants: d.grants.filter((x) => x.id !== grantId), audit: [auditRow('role.revoke', g ? g.Role + ' @ ' + g.Scope : grantId), ...d.audit] }));
    toast('Role grant revoked', 'dng');
  };
  const createFunction = ({
    workspace, flow, name, image, memory, timeoutSec, idleTimeoutSec, config, scaling,
    runtimeTier, fdkLang, description,
  }) => {
    const id = uid('fn');
    const mem = Number(memory) || 128;
    const tSec = Number(timeoutSec) || 30;
    const iSec = Number(idleTimeoutSec) || 30;
    /* Image can be empty → function lives in `pending build` state until Build Service
       compiles & pushes the OCI image. No random hash fabrication. */
    const hasImage = !!(image && String(image).trim());
    const tier = runtimeTier || 'Docker';
    const lang = fdkLang || 'fdk-go';
    const fn = {
      id, Workspace: workspace, Flow: flow || '—', Function: name || 'new-fn',
      Description: description || '',
      Image: hasImage ? image : null,
      'Runtime/FDK': tier + ' · ' + lang,
      RuntimeTier: tier, FdkLang: lang,
      Mem: mem >= 1024 ? (mem / 1024) + 'G' : mem + 'M',
      Memory: mem,
      Timeout: tSec + 's', TimeoutSec: tSec,
      IdleTimeoutSec: iSec,
      Format: 'http-stream',
      Status: hasImage ? 'warm' : 'pending build',
      Config: Array.isArray(config) ? config.filter((c) => c.k) : [],
      secrets: [],
      /* KEDA scaling — defaults match keda-autoscaling-spec §3.1 runner pool template */
      scaling: scaling || defaultScalingPolicy(),
    };
    setDb((d) => ({ ...d, functions: [...d.functions, fn], audit: [auditRow('function.create', fn.Function + (hasImage ? '' : ' (pending build)')), ...d.audit] }));
    toast('Function “' + fn.Function + '” created' + (hasImage ? '' : ' — pending build'));
    return id;
  };
  /* ADR-0024: per-function secrets (own). Stored as [{Name, Prefix, Status, Rotated, Expiry}] on the function. */
  const setFunctionSecrets = (fnId, secrets) => {
    const f = db && db.functions.find((x) => x.id === fnId);
    setDb((d) => ({
      ...d,
      functions: d.functions.map((x) => (x.id === fnId ? { ...x, secrets } : x)),
      audit: [auditRow('function.secrets.set', f ? f.Function : fnId), ...d.audit],
    }));
  };
  const updateFunction = (id, patch, msg) => {
    const f = db && db.functions.find((x) => x.id === id);
    setDb((d) => ({ ...d, functions: d.functions.map((x) => (x.id === id ? { ...x, ...patch } : x)), audit: [auditRow('function.update', f ? f.Function : id), ...d.audit] }));
    if (msg) toast(msg);
  };
  const deleteFunction = (id) => {
    const f = db && db.functions.find((x) => x.id === id);
    setDb((d) => ({ ...d, functions: d.functions.filter((x) => x.id !== id), audit: [auditRow('function.delete', f ? f.Function : id), ...d.audit] }));
    toast('Function deleted', 'dng');
  };
  const invokeFn = (id) => {
    const f = db && db.functions.find((x) => x.id === id);
    if (!f) return null;
    setDb((d) => ({ ...d, audit: [auditRow('function.invoke', f.Function), ...d.audit] }));
    toast('Invoked ' + f.Function + ' → 200 · 41 ms');
  };
  const createSchedule = ({ workspace, name, type, spec, targetType, target }) => {
    const id = uid('s');
    const tType = targetType === 'function' ? 'function' : 'flow';
    const s = {
      id, Workspace: workspace, enabled: true, Name: name || 'new-schedule', Type: type || 'cron',
      Spec: spec || '0 * * * *',
      TargetType: tType, Target: target || '—',
      Flow: tType === 'flow' ? (target || '—') : '—',                /* keep legacy Flow column for back-compat */
      Next: 'in 1h', Owner: 'replica-' + (1 + Math.floor(Math.random() * 3)) + ' (leader)', State: 'active',
    };
    setDb((d) => ({ ...d, schedules: [...d.schedules, s], audit: [auditRow('schedule.create', s.Name + ' → ' + tType + ':' + s.Target), ...d.audit] }));
    toast('Schedule “' + s.Name + '” created');
    return id;
  };
  const updateSchedule = (id, patch, msg) => {
    const s = db && db.schedules.find((x) => x.id === id);
    setDb((d) => ({ ...d, schedules: d.schedules.map((x) => (x.id === id ? { ...x, ...patch } : x)), audit: [auditRow('schedule.update', s ? s.Name : id), ...d.audit] }));
    if (msg) toast(msg);
  };
  const deleteSchedule = (id) => {
    const s = db && db.schedules.find((x) => x.id === id);
    setDb((d) => ({ ...d, schedules: d.schedules.filter((x) => x.id !== id), audit: [auditRow('schedule.delete', s ? s.Name : id), ...d.audit] }));
    toast('Schedule deleted', 'dng');
  };
  const runScheduleOnce = (id) => {
    const s = db && db.schedules.find((x) => x.id === id);
    if (!s) return;
    const targetLabel = (s.TargetType || 'flow') + ':' + (s.Target || s.Flow || '—');
    setDb((d) => ({ ...d, audit: [auditRow('schedule.run', s.Name + ' → ' + targetLabel), ...d.audit] }));
    toast('Running ' + targetLabel + ' once');
  };
  const createWorkspace = ({ org, name, env, owner }) => {
    const id = uid('w');
    const w = {
      id, Org: org || scope.org, Workspace: name || 'new-workspace',
      Env: env || 'staging', Members: '1', 'API keys': '0',
      Secrets: 'Vault scope', Collections: '0',
      Owner: owner || 'you@acme.io', Status: 'active',
    };
    setDb((d) => ({ ...d, workspaces: [...d.workspaces, w], audit: [auditRow('workspace.create', w.Workspace), ...d.audit] }));
    toast('Workspace “' + w.Workspace + '” created');
    return id;
  };
  const updateWorkspace = (id, patch, msg) => {
    const w = db && db.workspaces.find((x) => x.id === id);
    setDb((d) => ({
      ...d,
      workspaces: d.workspaces.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      audit: [auditRow('workspace.update', w ? w.Workspace : id), ...d.audit],
    }));
    if (msg) toast(msg);
  };
  const archiveWorkspace = (id) => {
    const w = db && db.workspaces.find((x) => x.id === id);
    setDb((d) => ({
      ...d,
      workspaces: d.workspaces.map((x) => (x.id === id ? { ...x, Status: 'archived' } : x)),
      audit: [auditRow('workspace.archive', w ? w.Workspace : id), ...d.audit],
    }));
    toast('Workspace archived', 'warn');
  };
  const unarchiveWorkspace = (id) => {
    const w = db && db.workspaces.find((x) => x.id === id);
    setDb((d) => ({
      ...d,
      workspaces: d.workspaces.map((x) => (x.id === id ? { ...x, Status: 'active' } : x)),
      audit: [auditRow('workspace.unarchive', w ? w.Workspace : id), ...d.audit],
    }));
    toast('Workspace re-activated');
  };
  const updateOrg = (orgName, patch, msg) => {
    setDb((d) => ({
      ...d,
      orgs: d.orgs.map((o) => (o.name === orgName ? { ...o, ...patch } : o)),
      audit: [auditRow('org.update', orgName), ...d.audit],
    }));
    if (msg) toast(msg);
  };
  const addOrgDomain = (orgName, domain) => {
    const clean = String(domain || '').trim().toLowerCase();
    if (!clean) return;
    setDb((d) => ({
      ...d,
      orgs: d.orgs.map((o) => (o.name === orgName && !(o.domains || []).includes(clean)
        ? { ...o, domains: [...(o.domains || []), clean] }
        : o)),
      audit: [auditRow('org.domain.add', orgName + ' · ' + clean), ...d.audit],
    }));
    toast('Domain "' + clean + '" added — verification started');
  };
  /* gRPC proto registry — workspace-scoped contracts compiled to OCI refs.
     In real prod the Build Service compiles .proto → descriptor and pushes
     to the OCI registry. Demo: UI accepts pasted .proto text and a mock
     parser produces the services / methods / messages structure. */
  const createProto = ({ workspace, name, version, description, services, messages }) => {
    const id = uid('proto');
    const cleanName = (name || 'new-proto').trim();
    const cleanVersion = (version || 'v1').trim();
    const proto = {
      id, Workspace: workspace, Name: cleanName, Version: cleanVersion,
      Description: (description || '').trim(),
      Ref: `oci://registry/proto/${cleanName}@${cleanVersion}`,
      services: Array.isArray(services) ? services : [],
      messages: messages || {},
    };
    setDb((d) => ({
      ...d, protos: [...(d.protos || []), proto],
      audit: [auditRow('proto.create', cleanName + '@' + cleanVersion), ...d.audit],
    }));
    toast('Proto "' + cleanName + '@' + cleanVersion + '" registered');
    return id;
  };
  const updateProto = (id, patch, msg) => {
    const p = db && (db.protos || []).find((x) => x.id === id);
    /* Name + Version are immutable — they're baked into the Ref (OCI tag).
       Strip them from the patch defensively in case the drawer sends them. */
    const safePatch = { ...patch };
    delete safePatch.Name; delete safePatch.Version; delete safePatch.Ref;
    setDb((d) => ({
      ...d,
      protos: (d.protos || []).map((x) => (x.id === id ? { ...x, ...safePatch } : x)),
      audit: [auditRow('proto.update', p ? p.Name + '@' + p.Version : id), ...d.audit],
    }));
    if (msg) toast(msg);
  };
  const deleteProto = (id) => {
    const p = db && (db.protos || []).find((x) => x.id === id);
    if (!p) return;
    /* Refuse delete if any flow's gRPC trigger still references this proto. */
    let usedBy = 0;
    (db.flows || []).forEach((fl) => {
      const g = fl.graph || {};
      (g.nodes || []).forEach((nd) => {
        if (nd.kind === 'grpc' && (nd.config || {}).protoRef === p.Ref) usedBy += 1;
      });
    });
    if (usedBy > 0) {
      toast('Proto "' + p.Name + '" is used by ' + usedBy + ' gRPC trigger(s) — remove them first', 'warn');
      return;
    }
    setDb((d) => ({
      ...d,
      protos: (d.protos || []).filter((x) => x.id !== id),
      audit: [auditRow('proto.delete', p.Name + '@' + p.Version), ...d.audit],
    }));
    toast('Proto deleted', 'dng');
  };
  const createRole = ({ name, description, permissions }) => {
    const id = uid('role');
    const cleanPerms = Array.isArray(permissions) ? permissions.filter(Boolean) : [];
    const r = {
      id, Name: (name || 'new-role').trim(),
      Description: (description || '').trim(),
      builtin: false, permissions: cleanPerms,
    };
    setDb((d) => ({ ...d, roles: [...d.roles, r], audit: [auditRow('role.create', r.Name + ' · ' + cleanPerms.length + ' perms'), ...d.audit] }));
    toast('Role “' + r.Name + '” created');
    return id;
  };
  const updateRole = (id, patch, msg) => {
    const r = db && db.roles.find((x) => x.id === id);
    if (!r) return;
    if (r.builtin) { toast('Built-in role “' + r.Name + '” cannot be edited', 'warn'); return; }
    const next = { ...r, ...patch };
    setDb((d) => ({
      ...d,
      roles: d.roles.map((x) => (x.id === id ? next : x)),
      audit: [auditRow('role.update', next.Name + ' · ' + (next.permissions || []).length + ' perms'), ...d.audit],
    }));
    if (msg) toast(msg);
  };
  const deleteRole = (id) => {
    const r = db && db.roles.find((x) => x.id === id);
    if (!r) return;
    if (r.builtin) { toast('Built-in role “' + r.Name + '” cannot be deleted', 'warn'); return; }
    /* refuse delete if any grant still references this role */
    const used = (db.grants || []).filter((g) => g.Role === r.Name).length;
    if (used > 0) { toast('Role “' + r.Name + '” is still granted to ' + used + ' user(s) — revoke first', 'warn'); return; }
    setDb((d) => ({
      ...d,
      roles: d.roles.filter((x) => x.id !== id),
      audit: [auditRow('role.delete', r.Name), ...d.audit],
    }));
    toast('Role deleted', 'dng');
  };
  const removeOrgDomain = (orgName, domain) => {
    setDb((d) => ({
      ...d,
      orgs: d.orgs.map((o) => (o.name === orgName
        ? { ...o, domains: (o.domains || []).filter((x) => x !== domain) }
        : o)),
      audit: [auditRow('org.domain.remove', orgName + ' · ' + domain), ...d.audit],
    }));
    toast('Domain removed', 'dng');
  };
  const setWorkspaceReadme = (id, readme, msg) => {
    const w = db && db.workspaces.find((x) => x.id === id);
    setDb((d) => ({
      ...d,
      workspaces: d.workspaces.map((x) => (x.id === id ? { ...x, readme } : x)),
      audit: [auditRow('workspace.docs', w ? w.Workspace : id), ...d.audit],
    }));
    if (msg) toast(msg);
  };
  /* ADR-0024: Flow.env (per-workflow env vars). Owned by the flow, not workspace/folder. */
  const setFlowEnv = (flowId, envArr, msg) => {
    const f = db && db.flows.find((x) => x.id === flowId);
    const next = (envArr || []).filter((e) => e && e.k);
    setDb((d) => ({
      ...d,
      flows: d.flows.map((x) => (x.id === flowId ? { ...x, env: next } : x)),
      audit: [auditRow('flow.env.set', (f ? f.Flow : flowId) + ' · ' + next.length + ' vars'), ...d.audit],
    }));
    if (msg) toast(msg);
  };
  const setFlowSecrets = (flowId, secArr, msg) => {
    const f = db && db.flows.find((x) => x.id === flowId);
    const next = (secArr || []).filter((s) => s && s.Name);
    setDb((d) => ({
      ...d,
      flows: d.flows.map((x) => (x.id === flowId ? { ...x, secrets: next } : x)),
      audit: [auditRow('flow.secrets.set', (f ? f.Flow : flowId) + ' · ' + next.length + ' secrets'), ...d.audit],
    }));
    if (msg) toast(msg);
  };
  const addFlowSecret = (flowId, name) => {
    const f = db && db.flows.find((x) => x.id === flowId);
    if (!f) return;
    const prefix = name.slice(0, 4).toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.random().toString(16).slice(2, 6) + '…';
    const sec = { Name: name, Prefix: prefix, Status: 'active', Created: 'just now', Rotated: '—', Expiry: '365d' };
    setDb((d) => ({
      ...d,
      flows: d.flows.map((x) => (x.id === flowId ? { ...x, secrets: [...(x.secrets || []), sec] } : x)),
      audit: [auditRow('flow.secret.create', f.Flow + ' · ' + name), ...d.audit],
    }));
    toast('Secret “' + name + '” added to flow — value shown once');
  };
  const rotateFlowSecret = (flowId, name) => {
    const f = db && db.flows.find((x) => x.id === flowId);
    if (!f) return;
    const newPrefix = name.slice(0, 4).toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.random().toString(16).slice(2, 6) + '…';
    setDb((d) => ({
      ...d,
      flows: d.flows.map((x) => (x.id === flowId ? { ...x, secrets: (x.secrets || []).map((s) => (s.Name === name ? { ...s, Prefix: newPrefix, Rotated: 'just now', Status: 'active' } : s)) } : x)),
      audit: [auditRow('flow.secret.rotate', f.Flow + ' · ' + name), ...d.audit],
    }));
    toast('Secret “' + name + '” rotated — new value shown once');
  };
  const revokeFlowSecret = (flowId, name) => {
    const f = db && db.flows.find((x) => x.id === flowId);
    if (!f) return;
    setDb((d) => ({
      ...d,
      flows: d.flows.map((x) => (x.id === flowId ? { ...x, secrets: (x.secrets || []).map((s) => (s.Name === name ? { ...s, Status: 'revoked' } : s)) } : x)),
      audit: [auditRow('flow.secret.revoke', f.Flow + ' · ' + name), ...d.audit],
    }));
    toast('Secret revoked', 'dng');
  };
  const deleteFlowSecret = (flowId, name) => {
    const f = db && db.flows.find((x) => x.id === flowId);
    if (!f) return;
    setDb((d) => ({
      ...d,
      flows: d.flows.map((x) => (x.id === flowId ? { ...x, secrets: (x.secrets || []).filter((s) => s.Name !== name) } : x)),
      audit: [auditRow('flow.secret.delete', f.Flow + ' · ' + name), ...d.audit],
    }));
    toast('Secret deleted', 'dng');
  };
  const renameCollection = (ws, path, patch, msg) => {
    setDb((d) => {
      const tree = JSON.parse(JSON.stringify(d.collectionTrees[ws] || []));
      const walk = (ns) => ns.forEach((x) => {
        if (x.p === path) Object.assign(x, patch);
        else if (x.children) walk(x.children);
      });
      walk(tree);
      return { ...d, collectionTrees: { ...d.collectionTrees, [ws]: tree }, audit: [auditRow('collection.update', ws + path), ...d.audit] };
    });
    if (msg) toast(msg);
  };
  const deleteCollection = (ws, path) => {
    /* compute the doomed subtree from current db (closure) before mutating */
    const tree = (db && db.collectionTrees[ws]) || [];
    const findNode = (nodes) => {
      for (const n of nodes) {
        if (n.p === path) return n;
        const f = findNode(n.children || []);
        if (f) return f;
      }
      return null;
    };
    const target = findNode(tree);
    if (!target) return;
    const doomed = new Set();
    const collect = (n) => { doomed.add(n.p); (n.children || []).forEach(collect); };
    collect(target);
    setDb((d) => {
      const newTree = JSON.parse(JSON.stringify(d.collectionTrees[ws] || []));
      const removeFrom = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].p === path) { arr.splice(i, 1); return true; }
          if (arr[i].children && removeFrom(arr[i].children)) return true;
        }
        return false;
      };
      removeFrom(newTree);
      /* flows that lived under the deleted subtree are moved to the workspace root */
      const flows = d.flows.map((f) => (f.Workspace === ws && doomed.has(f.Collection)) ? { ...f, Collection: '/' } : f);
      return { ...d, collectionTrees: { ...d.collectionTrees, [ws]: newTree }, flows, audit: [auditRow('collection.delete', ws + path), ...d.audit] };
    });
    /* if the deleted collection was the active one, reset scope so the page doesn't crash */
    if (scope.ws === ws && doomed.has(scope.folder)) setScope((s) => ({ ...s, folder: '/' }));
    toast('Collection deleted', 'dng');
  };

  return (
    <Ctx.Provider value={{
      authed, setAuthed, scope, setScope,
      db, dbError, reloadDb, resetDb,
      createFlow, updateFlow, deleteFlow, cloneFlow, saveFlowGraph, restoreFlowVersion, deployFlow, createCollection,
      createApiKey, updateApiKey, createRouteGroup, updateRouteGroup, deleteRouteGroup,
      renameCollection, deleteCollection,
      promoteDeployment, rollbackDeployment, canaryShift, requestApproval, approveDeployment,
      advanceDeploymentStage, cancelScheduledDeployment,
      replayDlq, discardDlq, replayAllDlq,
      inviteUser, acceptInvitation, revokeInvitation, createUser, updateUser, grantRole, revokeGrant,
      createFunction, updateFunction, deleteFunction, invokeFn,
      setFunctionSecrets,
      createSchedule, updateSchedule, deleteSchedule, runScheduleOnce,
      createWorkspace, updateWorkspace, archiveWorkspace, unarchiveWorkspace, setWorkspaceReadme,
      updateOrg, addOrgDomain, removeOrgDomain,
      createRole, updateRole, deleteRole,
      createProto, updateProto, deleteProto,
      setFlowEnv, setFlowSecrets, addFlowSecret, rotateFlowSecret, revokeFlowSecret, deleteFlowSecret,
      toasts, toast, drawer, openDrawer, closeDrawer, confirm, confirmDlg, closeConfirm,
      palette, setPalette, sidebarOpen, setSidebarOpen, signOut,
      bannerOff, setBannerOff, navCollapsed, setNavCollapsed,
      pinnedNav, setPinnedNav,
      recentlyVisited, pushVisit,
      theme, setTheme,
    }}>{children}</Ctx.Provider>
  );
}
const useApp = () => useContext(Ctx);


/* ======================= src/components/ui.jsx ======================= */
