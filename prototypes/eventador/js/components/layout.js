/* ======================= src/components/Layout.jsx ======================= */

function Sidebar() {
  const { sidebarOpen, setSidebarOpen, navCollapsed, setNavCollapsed, pinnedNav, setPinnedNav } = useApp();
  const loc = useLocation();
  const toggle = (lbl) => setNavCollapsed((c) => c.includes(lbl) ? c.filter((x) => x !== lbl) : [...c, lbl]);
  const togglePin = (path) => setPinnedNav((p) => p.includes(path) ? p.filter((x) => x !== path) : [...p, path]);
  /* Flatten NAV into a path → item map for the PINNED section lookup. */
  const allItems = NAV.flatMap((g) => g.items.map((it) => ({ ...it, group: g.lbl })));
  const pinnedItems = pinnedNav.map((p) => allItems.find((x) => x.p === p)).filter(Boolean);
  const pinCollapsed = navCollapsed.includes('__pinned');
  return (
    <>
      <div className={'sidescrim' + (sidebarOpen ? ' on' : '')} onClick={() => setSidebarOpen(false)} />
      <nav className={'sidebar' + (sidebarOpen ? ' open' : '')} aria-label="Primary">
        <WorkspaceSwitcher />
        <CollectionTree />
        <WorkspaceTrees />
        <div className="sidebar-sep" />
        {pinnedItems.length > 0 && (
          <div className="navgroup">
            <button className="lbl" onClick={() => toggle('__pinned')} aria-expanded={!pinCollapsed}>
              <span className={'lbl-chev' + (pinCollapsed ? ' off' : '')}>▾</span> 📌 Pinned
            </button>
            {!pinCollapsed && pinnedItems.map((it) => (
              <div key={'pin-' + it.p} style={{ position: 'relative' }}>
                <NavLink to={it.p} onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => 'nav' + (isActive ? ' active' : '')}>
                  <span className="ico" aria-hidden>{it.i}</span> {it.t}
                </NavLink>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePin(it.p); }}
                  title="Unpin"
                  style={{
                    position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 0, color: 'var(--faint)', cursor: 'pointer',
                    fontSize: 11, padding: 2,
                  }}>✕</button>
              </div>
            ))}
          </div>
        )}
        {NAV.map((g) => {
          const hasActive = g.items.some((it) => loc.pathname === it.p);
          const collapsed = navCollapsed.includes(g.lbl) && !hasActive;
          return (
            <div className="navgroup" key={g.lbl}>
              <button className="lbl" onClick={() => toggle(g.lbl)} aria-expanded={!collapsed}>
                <span className={'lbl-chev' + (collapsed ? ' off' : '')}>▾</span> {g.lbl}
              </button>
              {!collapsed && g.items.map((it) => {
                const isPinned = pinnedNav.includes(it.p);
                return (
                  <div key={it.p} style={{ position: 'relative' }}>
                    <NavLink to={it.p} onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) => 'nav' + (isActive ? ' active' : '')}>
                      <span className="ico" aria-hidden>{it.i}</span> {it.t}
                      {it.tag && <span className="tag">{it.tag}</span>}
                    </NavLink>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePin(it.p); }}
                      title={isPinned ? 'Unpin' : 'Pin to top'}
                      className="nav-pin"
                      style={{
                        position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                        background: 'transparent', border: 0, cursor: 'pointer',
                        fontSize: 12, padding: 2, opacity: isPinned ? 1 : 0,
                        color: isPinned ? 'var(--accent)' : 'var(--faint)',
                        transition: 'opacity .12s',
                      }}>{isPinned ? '📌' : '📍'}</button>
                  </div>
                );
              })}
            </div>
          );
        })}
        <div className="sidebar-foot">eventador · UI demo prototype</div>
      </nav>
    </>
  );
}

function AvatarMenu() {
  const { signOut, toast, resetDb, confirm, theme, setTheme } = useApp();
  const nav = useNavigate();
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
    <div className="avatarwrap" ref={ref}>
      <button className="avatar" aria-label="Account menu" aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen((o) => !o)}>A</button>
      {open && (
        <div className="menu" role="menu">
          <div className="menu-h">
            <div className="avatar" style={{ width: 36, height: 36, cursor: 'default' }}>A</div>
            <div><div style={{ fontWeight: 650 }}>Ada Lovelace</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>ada@acme.io · Owner</div></div>
          </div>
          <button role="menuitem" className="menu-i" onClick={() => { setOpen(false); nav('/users/ada'); }}>👤 My profile</button>
          <button role="menuitem" className="menu-i" onClick={() => { setOpen(false); nav('/settings'); }}>⚙ Workspace settings</button>
          <button role="menuitem" className="menu-i" onClick={() => {
            const next = theme === 'light' ? 'dark' : 'light';
            setTheme(next); setOpen(false); toast('Theme: ' + next);
          }}>🌗 Appearance · <span style={{ color: 'var(--muted)' }}>{theme}</span></button>
          <div className="menu-d" />
          <button role="menuitem" className="menu-i" onClick={() => {
            setOpen(false);
            confirm({
              title: 'Reset demo data?',
              sub: 'Discards every change made in this session and restores the original mock data.',
              note: 'Your session edits are stored locally only — nothing leaves the browser.',
              confirmLabel: 'Reset', onConfirm: resetDb,
            });
          }}>↺ Reset demo data</button>
          <div className="menu-d" />
          <button role="menuitem" className="menu-i danger" onClick={() => { setOpen(false); signOut(); }}>↗ Sign out</button>
        </div>
      )}
    </div>
  );
}

function NotificationsMenu() {
  const nav = useNavigate();
  const { db, scope } = useApp();
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
  const items = [];
  db.invitations.filter((i) => i.Status === 'invited').forEach((i) => items.push({
    id: 'inv-' + i.id, ic: '✉', t: 'Invitation pending', s: i.Email + ' · ' + i.Role + ' on ' + i.Scope, go: '/users',
  }));
  db.deployments.filter((d) => d.Workspace === scope.ws && d.Status === 'rolling out').forEach((d) => items.push({
    id: 'dep-' + d.id, ic: '▤', t: d.Flow + ' ' + d.Version + ' rolling out', s: 'awaiting promote to 100%', go: '/deployments',
  }));
  db.flows.filter((f) => f.Workspace === scope.ws && f.State === 'degraded').forEach((f) => items.push({
    id: 'fl-' + f.id, ic: '⚠', t: f.Flow + ' is degraded', s: 'p95 ' + (f.p95 || '—'), go: '/monitoring',
  }));
  const dlqN = db.dlq.filter((d) => d.Workspace === scope.ws).length;
  if (dlqN > 0) items.push({
    id: 'dlq', ic: '⚠', t: 'DLQ backlog', s: dlqN + ' message' + (dlqN === 1 ? '' : 's') + ' parked', go: '/dlq',
  });
  const n = items.length;
  return (
    <div className="avatarwrap" ref={ref}>
      <button className="iconbtn" aria-label={'Notifications · ' + n}
        title={n + ' notification' + (n === 1 ? '' : 's')}
        onClick={() => setOpen((o) => !o)} style={{ position: 'relative' }}>
        ◔{n > 0 && <span style={{
          position: 'absolute', top: 2, right: 2, minWidth: 14, height: 14, padding: '0 4px',
          borderRadius: 7, background: 'var(--danger)', color: '#fff', fontSize: 10,
          lineHeight: '14px', fontWeight: 700, textAlign: 'center',
        }}>{n > 9 ? '9+' : n}</span>}
      </button>
      {open && (
        <div className="menu" role="menu" style={{ minWidth: 320, maxHeight: 420, overflow: 'auto' }}>
          <div className="menu-h" style={{ padding: '10px 12px' }}>
            <b>Notifications</b>
            <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 11 }}>workspace {scope.ws}</span>
          </div>
          {n === 0 ? (
            <div style={{ padding: '18px 14px', color: 'var(--muted)', fontSize: 13, textAlign: 'center' }}>
              ✓ Nothing to look at.
            </div>
          ) : items.map((it) => (
            <button key={it.id} role="menuitem" className="menu-i"
              onClick={() => { setOpen(false); nav(it.go); }}
              style={{ alignItems: 'flex-start', textAlign: 'left' }}>
              <span style={{ marginRight: 8, marginTop: 2 }}>{it.ic}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{it.t}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{it.s}</div>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Topbar() {
  const { setPalette, setSidebarOpen, toast, scope, openDrawer, inviteUser, db } = useApp();
  const roleNames = (db.roles || []).map((r) => r.Name);
  /* Keyboard shortcuts reference. Drawer fields are read-only so the table renders
     as plain text with monospace keys. */
  const SHORTCUTS = [
    { sec: 'Navigation', rows: [
      ['⌘ K',          'Open command palette'],
      ['⌘ /',          'Toggle this shortcuts sheet'],
      ['Esc',          'Close any open modal / drawer / menu'],
    ]},
    { sec: 'Designer · canvas', rows: [
      ['Click node',   'Select step'],
      ['Drag node',    'Move step'],
      ['Drag port → port', 'Connect two steps'],
      ['Click wire',   'Delete connection'],
      ['Right-click',  'Open context menu (cut / copy / paste / delete)'],
    ]},
    { sec: 'Designer · keyboard', rows: [
      ['⌘ S',          'Save flow'],
      ['⌘ Enter',      'Validate flow'],
      ['Del',          'Delete selected step'],
      ['⌘ D',          'Duplicate selected step'],
      ['⌘ C / X / V',  'Copy / Cut / Paste selected step'],
    ]},
    { sec: 'Lists', rows: [
      ['Click row',    'Open detail or designer'],
      ['Right-click',  'Row actions (where supported)'],
      ['⌘ A',          'Select all (where supported)'],
    ]},
  ];
  const helpOpen = () => openDrawer({
    title: 'Keyboard shortcuts',
    sub: 'eventador · all platforms (⌘ on macOS, Ctrl elsewhere)',
    fields: SHORTCUTS.flatMap((s, i) => [
      { section: s.sec,
        label: 'Shortcut · Action', ro: true,
        value: s.rows.map((r) => r[0].padEnd(20, ' ') + r[1]).join('\n') },
    ]),
    note: 'Designer shortcuts only fire when the canvas has focus. Some keys are still mock — they will be wired up incrementally.',
    saveLabel: 'Close', onSave: () => {},
  });
  /* Global ⌘/ to open the cheatsheet — power-user discoverability. */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') { e.preventDefault(); helpOpen(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const invite = () => openDrawer({
    title: 'Invite a user', sub: 'they receive an email; provisioned via SCIM/JIT on accept',
    fields: [
      { label: 'Email', value: 'new.user@acme.io' },
      { label: 'Scope', value: 'WS: ' + scope.ws },
      { label: 'Role', value: roleNames.includes('Developer') ? 'Developer' : (roleNames[0] || 'Viewer'),
        type: 'select', options: roleNames.length ? roleNames : ['Viewer'],
        help: 'Pick from built-in or custom roles. Manage roles at /roles.' },
    ],
    saveLabel: 'Send invitation',
    onSave: (v) => inviteUser({ email: v.Email, scope: v.Scope, role: v.Role }),
  });
  return (
    <header className="topbar" role="banner">
      <button className="hamburger" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>≡</button>
      <div className="brand"><span className="dot" /> eventador</div>
      <span className="topbar-sep" aria-hidden />
      <OrgSwitcher />
      <div className="spacer" />
      <button className="search" aria-label="Open command palette" onClick={() => setPalette(true)}>
        <span>⌕</span><span>Search or jump to…</span><kbd>⌘K</kbd>
      </button>
      <Btn kind="pri" onClick={invite}>+ Invite</Btn>
      <NotificationsMenu />
      <IconBtn label="Keyboard shortcuts (⌘/)" onClick={helpOpen}>?</IconBtn>
      <AvatarMenu />
    </header>
  );
}

/* Tree-managed routes are not in NAV (they live in WorkspaceTrees), so DocTitle
   must map them manually — otherwise landing on /flows directly sets the title
   to "Demo" instead of "Flows". */
const TREE_ROUTE_TITLES = {
  '/flows': 'Flows',
  '/functions': 'Functions',
  '/scheduler': 'Schedules',
  '/protos': 'Protos',
};
function DocTitle() {
  const loc = useLocation();
  const { pushVisit } = useApp();
  useEffect(() => {
    const all = NAV.flatMap((g) => g.items);
    const m = all.find((x) => loc.pathname === x.p) ||
      (TREE_ROUTE_TITLES[loc.pathname] && { t: TREE_ROUTE_TITLES[loc.pathname] }) ||
      (loc.pathname.startsWith('/designer') && { t: 'Designer' }) ||
      (loc.pathname.startsWith('/users/') && { t: 'Profile' }) ||
      (loc.pathname === '/collection' && { t: 'Collection' });
    const title = m ? m.t : 'Demo';
    document.title = 'eventador · ' + title;
    /* Track this visit for the Dashboard "Recently visited" card. */
    if (m && loc.pathname !== '*') pushVisit({ p: loc.pathname, t: title });
  }, [loc, pushVisit]);
  return null;
}

function Layout() {
  const { bannerOff, setBannerOff } = useApp();
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <div className="shell">
        {!bannerOff && (
          <div className="demobar">
            <span>Interactive mock prototype — mock API + localStorage, no backend (Vite + React)</span>
            <button className="demobar-x" aria-label="Dismiss notice" onClick={() => setBannerOff(true)}>✕</button>
          </div>
        )}
        <div className="app">
          <Topbar />
          <Sidebar />
          <main id="main" role="main"><div className="page"><Outlet /></div></main>
        </div>
      </div>
      <DocTitle />
    </>
  );
}


/* ======================= src/screens/core.jsx ======================= */
