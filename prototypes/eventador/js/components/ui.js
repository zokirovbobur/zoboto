/* ======================= src/components/ui.jsx ======================= */

const cx = (...a) => a.filter(Boolean).join(' ');

const BADGE = {
  ok: ['active', 'live', 'healthy', 'reconciled', 'warm', 'on', 'enabled', 'attested', 'pass', 'invoked', 'paid', 'synced'],
  warn: ['degraded', 'invited', 'pending', 'read-only', 'scaling', 'warn'],
  dng: ['revoked', 'suspended', 'expired', 'error', 'failed', 'never', 'disabled', 'rolled back'],
  info: ['rolling out', 'Owner', 'Admin', 'dedicated', 'beta'],
};
function Badge({ children }) {
  const v = String(children);
  let k = 'mut';
  for (const key in BADGE) if (BADGE[key].some((x) => v.toLowerCase().includes(x.toLowerCase()))) { k = key; break; }
  return <span className={`badge b-${k}`}>{children}</span>;
}

const Btn = ({ kind, sm, children, ...p }) => (
  <button className={cx('btn', kind, sm && 'sm')} {...p}>{children}</button>
);

function IconBtn({ label, onClick, children }) {
  return <button className="iconbtn" aria-label={label} title={label} onClick={onClick}>{children}</button>;
}

/* One collapsible breadcrumb segment — opens a menu to switch Org / Workspace / Collection. */
function CrumbDrop({ icon, value, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <span className="crumbdrop" ref={ref}>
      <button type="button" className={cx('crumb-seg', open && 'open')}
        aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {icon && <span className="cd-ic" aria-hidden>{icon}</span>}
        <span className="cd-val">{value}</span>
        <span className="cd-chev" aria-hidden>▾</span>
      </button>
      {open && (
        <div className="crumbmenu" role="menu">
          {items.length === 0 && <div className="cd-empty">Nothing here</div>}
          {items.map((it) => (
            <button key={it.key} type="button" role="menuitemradio" aria-checked={it.active}
              className={cx('cd-item', it.active && 'on')}
              style={it.depth ? { paddingLeft: 10 + it.depth * 13 } : undefined}
              onClick={() => { setOpen(false); if (!it.active) it.run(); }}>
              <span className="cd-tick" aria-hidden>{it.active ? '✓' : ''}</span>
              <span className="cd-main">
                <span className="cd-name">{it.label}</span>
                {it.sub && <span className="cd-sub">{it.sub}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

function Crumb({ extra }) {
  const { scope, setScope, toast, db } = useApp();
  const nav = useNavigate();
  const sep = <span className="crumb-sep" aria-hidden>›</span>;

  const orgItems = (db.orgs || []).map((o) => ({
    key: o.id, label: o.name, sub: o.plan, active: o.name === scope.org,
    run: () => {
      const fw = db.workspaces.find((w) => w.Org === o.name);
      setScope({ ...scope, org: o.name, ws: fw ? fw.Workspace : scope.ws, folder: '/' });
      toast('Switched to ' + o.name);
    },
  }));
  const wsItems = (db.workspaces || []).filter((w) => w.Org === scope.org).map((w) => ({
    key: w.id, label: w.Workspace, sub: w.Env, active: w.Workspace === scope.ws,
    run: () => { setScope({ ...scope, ws: w.Workspace, folder: '/' }); toast('Switched to ' + w.Workspace); },
  }));
  const flat = [];
  const walk = (nodes, depth) => (nodes || []).forEach((n) => { flat.push({ p: n.p, name: n.name, depth }); walk(n.children, depth + 1); });
  walk((db.collectionTrees || {})[scope.ws], 0);
  const colItems = [
    { key: '__root', label: '/', sub: 'workspace root', depth: 0, active: !scope.folder || scope.folder === '/', p: '/' },
    ...flat.map((n) => ({ key: n.p, label: n.name, sub: n.p, depth: n.depth + 1, active: scope.folder === n.p, p: n.p })),
  ].map((it) => ({
    ...it,
    run: () => { setScope({ ...scope, folder: it.p }); nav(it.p === '/' ? '/flows' : '/collection'); },
  }));

  return (
    <span className="crumb-scope">
      <CrumbDrop value={scope.org} items={orgItems} />
      {sep}
      <CrumbDrop icon="▣" value={scope.ws} items={wsItems} />
      {sep}
      <CrumbDrop icon="🗀" value={scope.folder || '/'} items={colItems} />
      {extra && <>{sep}<span className="crumb-extra">{extra}</span></>}
    </span>
  );
}

function PageHead({ crumb, title, desc, docref, actions }) {
  return (
    <div>
      {crumb && <div className="crumb">{crumb}</div>}
      <div className="head">
        <div>
          <h1>{title}</h1>
          {desc && <p>{desc}</p>}
          {docref && <span className="docref">{docref}</span>}
        </div>
        {actions && <div className="actions">{actions}</div>}
      </div>
    </div>
  );
}

const Card = ({ title, sub, children, style, id }) => (
  <div className="card" style={style} id={id}>
    {title && <h3>{title}</h3>}
    {sub && <div className="sub">{sub}</div>}
    {children}
  </div>
);
const Metric = ({ k, v, d, dk }) => (
  <div className="metric"><div className="k">{k}</div><div className="v">{v}</div>{d && <div className={cx('d', dk)}>{d}</div>}</div>
);
const KV = ({ k, children }) => (
  <div className="kv"><span>{k}</span><span>{children}</span></div>
);
/* Spark — normalises any numeric series into 0–100% bar heights. Callers used to
   have to pre-normalise; passing raw values like 12000 would overflow the page.
   Now we scale to the series max, clamped to a minimum height so flat data is
   still visible. */
const Spark = ({ data = [40, 55, 45, 70, 62, 85, 78, 92, 70, 88, 96, 74] }) => {
  const nums = (Array.isArray(data) ? data : []).map((n) => Number(n) || 0);
  const max = Math.max(1, ...nums.map(Math.abs));
  return (
    <div className="spark">
      {nums.map((v, i) => {
        const pct = Math.max(4, Math.min(100, Math.round((Math.abs(v) / max) * 100)));
        return <i key={i} style={{ height: pct + '%' }} />;
      })}
    </div>
  );
};
const EmptyState = ({ icon = '◦', title, sub, action }) => (
  <div className="empty">
    <div className="e-ico">{icon}</div>
    <div className="e-title">{title}</div>
    {sub && <div className="e-sub">{sub}</div>}
    {action && <div style={{ marginTop: 6 }}>{action}</div>}
  </div>
);

/* WsEmptyState — rich empty state for workspace-scoped lists.
   Explains why empty + shows cross-workspace activity + offers one-click switch.
   Props:
     icon          — large symbol/emoji (default 🎉 for "nothing to fix")
     title         — short label, scope.ws auto-appended
     scope         — { ws } so we can show "in <ws>" inline
     description   — why this surface might be empty
     wsCounts      — { [wsName]: count } map of where data lives in other workspaces
     onSwitchWs    — (ws) => void; if provided, renders "Switch to <ws>" quick buttons
     cta           — optional primary action (jsx) at top
     footerHint    — small educational text at the bottom (jsx ok) */
function WsEmptyState({ icon = '🎉', title, scope, description, wsCounts, onSwitchWs, cta, footerHint }) {
  const others = wsCounts ? Object.entries(wsCounts).filter(([ws, n]) => ws !== scope.ws && n > 0) : [];
  return (
    <div className="tablecard ws-empty">
      <div className="ws-empty-ico">{icon}</div>
      <div className="ws-empty-title">{title} <span className="mono ws-empty-ws">{scope.ws}</span></div>
      {description && <p className="hint ws-empty-desc">{description}</p>}
      {cta && <div className="ws-empty-cta">{cta}</div>}
      {others.length > 0 && (
        <>
          <div className="ws-empty-other-label">Activity in other workspaces:</div>
          <div className="ws-empty-switches">
            {others.map(([ws, n]) => (
              <button key={ws} type="button" className="btn sm"
                onClick={() => onSwitchWs && onSwitchWs(ws)}>
                Switch to {ws} <span className="badge">{n}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {footerHint && <p className="hint ws-empty-footer">{footerHint}</p>}
    </div>
  );
}
const Section = ({ children }) => <div className="section-h">{children}</div>;

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.k} role="tab" aria-selected={active === t.k}
          className={cx('tab', active === t.k && 'on')} onClick={() => onChange(t.k)}>{t.t}</button>
      ))}
    </div>
  );
}
function Toggle({ on, onChange, label }) {
  return (
    <button type="button" className={cx('tg', on && 'on')} role="switch" aria-checked={on} onClick={() => onChange(!on)}>
      <span className="sw2" />{label}
    </button>
  );
}
const Stepper = ({ steps }) => (
  <div className="stepper">
    {steps.map((s, i) => (
      <div key={i} className={cx('step', s.state)}>
        <div className="dot">{s.state === 'done' ? '✓' : s.state === 'active' ? '●' : i + 1}</div>{s.t}
      </div>
    ))}
  </div>
);

/* Editable data table — row click opens the detail panel; Save writes back; empty state built-in. */
function DataTable({ rows, setRows, exclude = ['id'], onRowClick, emptyTitle = 'Nothing here yet', emptySub }) {
  const { openDrawer, toast } = useApp();
  if (!rows.length) return <div className="tablecard"><EmptyState title={emptyTitle} sub={emptySub} /></div>;
  const cols = Object.keys(rows[0]).filter((k) => !exclude.includes(k));
  const rowClick = (r) => {
    if (onRowClick) return onRowClick(r);
    if (!setRows) return;
    openDrawer({
      title: String(r[cols[0]] || 'Record'),
      sub: 'Details — editable (mock, client-side only)',
      fields: cols.map((c, i) => ({ label: c, value: String(r[c] ?? ''), section: i === 0 ? 'Properties' : undefined })),
      onSave: (vals) => { setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, ...vals } : x)); toast('Saved'); },
      onDelete: () => { setRows((rs) => rs.filter((x) => x.id !== r.id)); toast('Deleted', 'dng'); },
    });
  };
  const KNOWN = ['active', 'revoked', 'live', 'degraded', 'reconciled', 'suspended', 'invited', 'warm', 'rolling out', 'scaled to 0', 'read-only', 'expired', 'pending', 'rolled back'];
  return (
    <div className="tablecard">
      <table>
        <thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={(setRows || onRowClick) ? 'clickable' : ''} onClick={() => rowClick(r)}
              tabIndex={(setRows || onRowClick) ? 0 : -1}
              onKeyDown={(e) => { if (e.key === 'Enter' && (setRows || onRowClick)) rowClick(r); }}>
              {cols.map((c) => {
                const val = r[c];
                const badge = ['Status', 'State', 'Role', 'MFA'].includes(c) || KNOWN.includes(String(val));
                return <td key={c}>{c === cols[0] ? <b>{val}</b> : badge ? <Badge>{val}</Badge> : val}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Secrets list editor — named entries with Rotate / Revoke / Delete + inline "Add secret".
   Callbacks receive the secret object (or just the name for add). Add triggers "shown ONCE" modal in caller. */
function SecretsListField({ id, value, onAdd, onRotate, onRevoke, onDelete }) {
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const rows = Array.isArray(value) ? value : [];
  const submit = () => {
    const n = (newName || '').trim();
    if (!n) return;
    onAdd(n);
    setNewName(''); setAddOpen(false);
  };
  return (
    <div id={id} className="secretslist">
      {rows.length === 0 ? (
        <div className="hint" style={{ margin: 0, padding: '6px 0' }}>No secrets yet.</div>
      ) : rows.map((s) => (
        <div key={s.Name} className="secretslist-row">
          <span className="mono"><b>{s.Name}</b></span>
          <span className="badge">{s.Status === 'revoked' ? '⊘ revoked' : 'active'}</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--faint)', marginLeft: 'auto', marginRight: 6 }}>{s.Prefix}</span>
          {s.Status !== 'revoked' && onRotate && (
            <button type="button" className="addf" onClick={() => onRotate(s)} title="Rotate (generates new value, shown once)">↻ Rotate</button>
          )}
          {s.Status !== 'revoked' && onRevoke && (
            <button type="button" className="addf" onClick={() => onRevoke(s)} title="Revoke (disable immediately)">⊘ Revoke</button>
          )}
          {onDelete && (
            <button type="button" className="addf" onClick={() => onDelete(s)} title="Delete permanently">✕</button>
          )}
        </div>
      ))}
      {addOpen ? (
        <div className="secretslist-add">
          <input autoFocus placeholder="SECRET_NAME"
            value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setAddOpen(false); setNewName(''); } }} />
          <button type="button" className="btn pri sm" onClick={submit}>Create &amp; show once</button>
          <button type="button" className="addf" onClick={() => { setAddOpen(false); setNewName(''); }}>cancel</button>
        </div>
      ) : (
        <button type="button" className="addf" onClick={() => setAddOpen(true)}>＋ Add secret</button>
      )}
    </div>
  );
}

/* Grouped permissions checkbox list — `catalog` is [{ id, label, group }],
   `value` is the selected ids array. Renders collapsible per-group sections with
   group-level select-all toggle so picking "all of Flow" is one click. */
function PermsListField({ id, value, onChange, catalog, readOnly }) {
  const selected = new Set(value || []);
  const groups = [];
  const byGroup = new Map();
  (catalog || []).forEach((p) => {
    if (!byGroup.has(p.group)) { byGroup.set(p.group, []); groups.push(p.group); }
    byGroup.get(p.group).push(p);
  });
  const toggleOne = (pid) => {
    const next = new Set(selected);
    next.has(pid) ? next.delete(pid) : next.add(pid);
    onChange(Array.from(next));
  };
  const toggleGroup = (group) => {
    const perms = byGroup.get(group) || [];
    const allOn = perms.every((p) => selected.has(p.id));
    const next = new Set(selected);
    perms.forEach((p) => { allOn ? next.delete(p.id) : next.add(p.id); });
    onChange(Array.from(next));
  };
  return (
    <div className="permslist" id={id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
        {selected.size} of {(catalog || []).length} permissions selected
      </div>
      {groups.map((g) => {
        const perms = byGroup.get(g);
        const onCount = perms.filter((p) => selected.has(p.id)).length;
        const allOn = onCount === perms.length;
        return (
          <div key={g} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13, cursor: readOnly ? 'default' : 'pointer' }}>
                <input type="checkbox" disabled={readOnly}
                  checked={allOn}
                  ref={(el) => { if (el) el.indeterminate = onCount > 0 && !allOn; }}
                  onChange={() => !readOnly && toggleGroup(g)} />
                {g}
              </label>
              <span style={{ marginLeft: 'auto', color: 'var(--faint)', fontSize: 11 }}>{onCount}/{perms.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', paddingLeft: 22 }}>
              {perms.map((p) => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: readOnly ? 'default' : 'pointer' }}>
                  <input type="checkbox" disabled={readOnly}
                    checked={selected.has(p.id)}
                    onChange={() => !readOnly && toggleOne(p.id)} />
                  <span>{p.label} <span className="mono" style={{ color: 'var(--faint)', fontSize: 10 }}>{p.id}</span></span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Repeating single-string list (CIDR / IP allowlist / domain list).
   Each row is one input + a remove button; "+ Add" appends a blank row. */
function StringListField({ id, value, onChange, placeholder, addLabel }) {
  const rows = Array.isArray(value) && value.length ? value : [''];
  const update = (i, v) => onChange(rows.map((r, idx) => (idx === i ? v : r)));
  const add = () => onChange([...rows, '']);
  const remove = (i) => {
    const next = rows.filter((_, idx) => idx !== i);
    onChange(next.length ? next : ['']);
  };
  return (
    <div className="kvlist" id={id}>
      {rows.map((v, i) => (
        <div className="kvlist-row" key={i} style={{ gridTemplateColumns: '1fr auto' }}>
          <input placeholder={placeholder || 'e.g. 203.0.113.0/24'} value={v}
            onChange={(e) => update(i, e.target.value)} />
          <button type="button" className="addf" aria-label="Remove line" onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button type="button" className="addf" onClick={add}>＋ {addLabel || 'Add'}</button>
    </div>
  );
}

/* Key/Value list editor — repeating rows with "Add line" (Fn-style fn config). */
function KvListField({ id, value, onChange }) {
  const rows = value.length ? value : [{ k: '', v: '' }];
  const update = (i, patch) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    onChange(next);
  };
  const add = () => onChange([...rows, { k: '', v: '' }]);
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i).length ? rows.filter((_, idx) => idx !== i) : [{ k: '', v: '' }]);
  return (
    <div className="kvlist" id={id}>
      <div className="kvlist-head"><span>Key</span><span>Value</span><span /></div>
      {rows.map((r, i) => (
        <div className="kvlist-row" key={i}>
          <input placeholder="KEY" value={r.k} onChange={(e) => update(i, { k: e.target.value })} />
          <input placeholder="value" value={r.v} onChange={(e) => update(i, { v: e.target.value })} />
          <button type="button" className="addf" aria-label="Remove line" onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button type="button" className="addf" onClick={add}>＋ Add line</button>
    </div>
  );
}

/* Detail / edit panel — sectioned, Esc-closes, focus-managed. */
function Drawer() {
  const { drawer, closeDrawer } = useApp();
  const [vals, setVals] = useState({});
  const firstRef = useRef(null);
  useEffect(() => {
    if (!drawer) return;
    const k = (e) => { if (e.key === 'Escape') finish(); };
    window.addEventListener('keydown', k);
    setTimeout(() => firstRef.current && firstRef.current.focus(), 40);
    return () => window.removeEventListener('keydown', k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawer]);
  if (!drawer) return null;
  const fields = drawer.fields || [];
  const valOf = (f) => (f.label in vals ? vals[f.label] : f.value);
  const set = (label, v) => setVals((s) => ({ ...s, [label]: v }));
  const finish = () => { setVals({}); closeDrawer(); };
  const save = () => {
    const out = {};
    fields.forEach((f) => {
      if (f.type === 'toggle') out[f.label] = !!valOf(f);
      else if (f.type === 'number') out[f.label] = valOf(f) === '' || valOf(f) == null ? null : Number(valOf(f));
      else if (f.type === 'kvlist') out[f.label] = (valOf(f) || []).filter((r) => r.k);
      else if (f.type === 'permslist') out[f.label] = Array.from(valOf(f) || []);
      else if (f.type === 'stringlist') out[f.label] = (valOf(f) || []).map((s) => String(s).trim()).filter(Boolean);
      else out[f.label] = valOf(f) ?? '';
    });
    drawer.onSave && drawer.onSave(out);
    finish();
  };
  return (
    <>
      <div className="scrim" onClick={finish} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="drw-title">
        <header>
          <div>
            <h3 id="drw-title">{drawer.title}</h3>
            {drawer.sub && <div className="sub">{drawer.sub}</div>}
          </div>
          <button className="x" aria-label="Close" onClick={finish}>✕</button>
        </header>
        <div className="body">
          {fields.map((f, i) => (
            <div key={f.label + i}>
              {f.section && <div className="section-h">{f.section}</div>}
              <div className="field">
                <label htmlFor={'fld_' + i}>{f.label}{f.ro ? ' · read-only' : ''}</label>
                {f.type === 'toggle' ? (
                  <Toggle on={!!valOf(f)} onChange={(v) => set(f.label, v)} label={valOf(f) ? 'on' : 'off'} />
                ) : f.type === 'select' ? (
                  <select id={'fld_' + i} ref={i === 0 ? firstRef : null}
                    value={valOf(f)} onChange={(e) => set(f.label, e.target.value)}>
                    {(f.options || [f.value]).map((o) => {
                      const opt = (o && typeof o === 'object') ? o : { value: o, label: o };
                      return <option key={opt.value} value={opt.value}>{opt.label}</option>;
                    })}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea id={'fld_' + i} rows={3} ref={i === 0 ? firstRef : null}
                    defaultValue={f.value} onChange={(e) => set(f.label, e.target.value)} />
                ) : f.type === 'number' ? (
                  <input id={'fld_' + i} type="number" min={f.min} max={f.max} placeholder={f.placeholder}
                    ref={i === 0 ? firstRef : null} defaultValue={f.value ?? ''} readOnly={f.ro}
                    onChange={(e) => set(f.label, e.target.value)} />
                ) : f.type === 'kvlist' ? (
                  <KvListField id={'fld_' + i} value={valOf(f) || []} onChange={(v) => set(f.label, v)} />
                ) : f.type === 'stringlist' ? (
                  <StringListField id={'fld_' + i} value={valOf(f) || []}
                    placeholder={f.placeholder} addLabel={f.addLabel}
                    onChange={(v) => set(f.label, v)} />
                ) : f.type === 'permslist' ? (
                  <PermsListField id={'fld_' + i} value={valOf(f) || []}
                    catalog={f.catalog || []} readOnly={f.ro}
                    onChange={(v) => set(f.label, v)} />
                ) : f.type === 'secretslist' ? (
                  <SecretsListField id={'fld_' + i} value={valOf(f) || []}
                    onAdd={f.onAdd} onRotate={f.onRotate} onRevoke={f.onRevoke} onDelete={f.onDelete} />
                ) : (
                  <input id={'fld_' + i} ref={i === 0 ? firstRef : null}
                    placeholder={f.placeholder}
                    defaultValue={f.value} readOnly={f.ro} onChange={(e) => set(f.label, e.target.value)} />
                )}
                {f.help && <div className="hint" style={{ marginTop: 4 }}>{f.help}</div>}
              </div>
            </div>
          ))}
          {drawer.note && <div className="note" style={{ marginTop: 14, marginBottom: 0 }}>{drawer.note}</div>}
        </div>
        <footer>
          <Btn onClick={finish}>Cancel</Btn>
          {drawer.onDelete && <Btn kind="dng" onClick={() => { drawer.onDelete(); finish(); }}>Delete</Btn>}
          <Btn kind="pri" style={{ marginLeft: 'auto' }} onClick={save}>{drawer.saveLabel || 'Save changes'}</Btn>
        </footer>
      </aside>
    </>
  );
}

function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => <div className={cx('toast', 't-' + (t.type || 'ok'))} key={t.id} role="status">{t.m}</div>)}
    </div>
  );
}

/* Centered confirmation popup — for destructive / irreversible actions. */
function Confirm() {
  const { confirmDlg, closeConfirm } = useApp();
  useEffect(() => {
    if (!confirmDlg) return;
    const k = (e) => { if (e.key === 'Escape') closeConfirm(); if (e.key === 'Enter') { confirmDlg.onConfirm && confirmDlg.onConfirm(); closeConfirm(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [confirmDlg, closeConfirm]);
  if (!confirmDlg) return null;
  const ok = () => { confirmDlg.onConfirm && confirmDlg.onConfirm(); closeConfirm(); };
  return (
    <>
      <div className="scrim" onClick={closeConfirm} />
      <div className="confirm" role="alertdialog" aria-modal="true" aria-labelledby="cf-title">
        <h3 id="cf-title">{confirmDlg.title}</h3>
        {confirmDlg.sub && <div className="cf-sub">{confirmDlg.sub}</div>}
        {confirmDlg.note && <div className="note" style={{ marginBottom: 0 }}>{confirmDlg.note}</div>}
        <footer>
          <Btn onClick={closeConfirm}>Cancel</Btn>
          <Btn kind={confirmDlg.kind} onClick={ok} autoFocus>{confirmDlg.confirmLabel}</Btn>
        </footer>
      </div>
    </>
  );
}


/* ======================= src/components/ContextMenu.jsx ======================= */
