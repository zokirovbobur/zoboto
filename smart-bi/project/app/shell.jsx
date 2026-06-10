/* ============================================================
   Shell — Sidebar, Topbar, AI Assistant panel
   ============================================================ */
const NAV_GROUPS = [
  { key:'grp_analyze', items:[
    { id:'dashboard', icon:'dashboard', tk:'nav_dashboard' },
    { id:'ai', icon:'ai', tk:'nav_ai', glow:true },
    { id:'metrics', icon:'metrics', tk:'nav_metrics' },
    { id:'alerts', icon:'alerts', tk:'nav_alerts', badge:'7' },
    { id:'factor', icon:'factor', tk:'nav_factor' },
  ]},
  { key:'grp_build', items:[
    { id:'library', icon:'library', tk:'nav_library' },
    { id:'widget', icon:'widget', tk:'nav_widget' },
    { id:'templates', icon:'templates', tk:'nav_templates' },
    { id:'reports', icon:'reports', tk:'nav_reports' },
  ]},
  { key:'grp_govern', items:[
    { id:'connectors', icon:'connectors', tk:'nav_connectors' },
    { id:'docs', icon:'docs', tk:'nav_docs' },
    { id:'admin', icon:'admin', tk:'nav_admin' },
    { id:'audit', icon:'audit', tk:'nav_audit' },
  ]},
];

function Logo({ size = 30 }) {
  return (
    <div className="row gap-10" style={{ alignItems:'center' }}>
      <div style={{ width:size, height:size, borderRadius:9, position:'relative', flexShrink:0,
        background:'linear-gradient(135deg, var(--accent), var(--accent-2))', display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 4px 14px -4px var(--accent-glow)' }}>
        <svg width={size*0.62} height={size*0.62} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19V5M4 19h16M8 16l3-5 3 3 5-8" />
        </svg>
      </div>
    </div>
  );
}

function Sidebar({ screen, navigate, t, collapsed, role }) {
  return (
    <aside style={{ width:collapsed?72:'var(--sidebar-w)', flexShrink:0, borderRight:'1px solid var(--border)',
      background:'var(--surface)', display:'flex', flexDirection:'column', transition:'width .2s ease', zIndex:30 }}>
      <div className="row gap-10" style={{ height:'var(--topbar-h)', padding:'0 18px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <Logo />
        {!collapsed && <div className="col" style={{ lineHeight:1.2, whiteSpace:'nowrap' }}>
          <span style={{ fontWeight:800, fontSize:14.5, letterSpacing:'-0.02em' }}>BI Navigator</span>
          <span className="dim" style={{ fontSize:10.5, letterSpacing:'0.04em' }}>UZBEKISTAN</span>
        </div>}
      </div>
      <nav className="col grow" style={{ padding:'14px 12px', gap:18, overflowY:'auto' }}>
        {NAV_GROUPS.map(g => (
          <div key={g.key} className="col gap-4">
            {!collapsed && <div className="eyebrow" style={{ padding:'0 8px 4px', fontSize:10 }}>{t(g.key)}</div>}
            {g.items.map(it => {
              const active = screen === it.id;
              return (
                <button key={it.id} onClick={() => navigate(it.id)} title={collapsed ? t(it.tk) : null}
                  style={{ display:'flex', alignItems:'center', gap:11, height:38, padding:collapsed?0:'0 11px',
                    justifyContent:collapsed?'center':'flex-start', borderRadius:9, fontSize:13.5, fontWeight:active?600:500,
                    color: active ? 'var(--text)' : 'var(--text-2)', background: active ? 'var(--active)' : 'transparent',
                    position:'relative', transition:'background .15s, color .15s' }}
                  onMouseEnter={e=>{ if(!active) e.currentTarget.style.background='var(--hover)'; }}
                  onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent'; }}>
                  {active && <span style={{ position:'absolute', left:-12, top:9, bottom:9, width:3, borderRadius:99, background:'linear-gradient(var(--accent),var(--accent-2))' }} />}
                  <span style={{ color: active ? 'var(--accent)' : (it.glow?'var(--accent-2)':'inherit'), display:'flex', position:'relative' }}>
                    <Icon name={it.icon} size={18} />
                    {it.glow && <span style={{ position:'absolute', top:-1, right:-1, width:5, height:5, borderRadius:99, background:'var(--accent-2)', boxShadow:'0 0 6px var(--accent-2)' }} />}
                  </span>
                  {!collapsed && <span style={{ flex:1, textAlign:'left' }}>{t(it.tk)}</span>}
                  {!collapsed && it.badge && <span className="badge badge-neg" style={{ height:18, padding:'0 7px', fontSize:10.5 }}>{it.badge}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div style={{ padding:12, borderTop:'1px solid var(--border)' }}>
        <button onClick={() => navigate('settings')} title={collapsed?t('nav_settings'):null}
          style={{ display:'flex', alignItems:'center', gap:11, height:38, padding:collapsed?0:'0 11px', width:'100%',
            justifyContent:collapsed?'center':'flex-start', borderRadius:9, fontSize:13.5, fontWeight:500,
            color: screen==='settings'?'var(--text)':'var(--text-2)', background: screen==='settings'?'var(--active)':'transparent' }}>
          <Icon name="settings" size={18} />{!collapsed && t('nav_settings')}
        </button>
      </div>
    </aside>
  );
}

function Topbar({ t, lang, setLang, theme, setTheme, openAI, role, navigate, toggleSidebar, onMobile, mobile, notifOpen, setNotifOpen, profileOpen, setProfileOpen, onLogout }) {
  return (
    <header style={{ height:'var(--topbar-h)', flexShrink:0, borderBottom:'1px solid var(--border)', background:'color-mix(in srgb, var(--surface) 80%, transparent)',
      backdropFilter:'blur(10px)', display:'flex', alignItems:'center', gap:14, padding:'0 18px 0 14px', position:'sticky', top:0, zIndex:40 }}>
      <button className="iconbtn" onClick={toggleSidebar}><Icon name="menu" /></button>
      <div className="search-box" style={{ flex:1, maxWidth:460 }}>
        <Icon name="search" />
        <input className="input" placeholder={t('search')} />
      </div>
      <div className="grow" />
      <button className="btn btn-sm" onClick={onMobile} style={{ gap:6 }} title="Mobile preview">
        <Icon name="phone" size={15} />{!mobile && <span style={{display:window.innerWidth<900?'none':'inline'}}>Mobile</span>}
      </button>
      {/* language */}
      <LangSwitch lang={lang} setLang={setLang} />
      {/* theme */}
      <button className="iconbtn" onClick={() => setTheme(theme==='dark'?'light':'dark')} title="Toggle theme">
        <Icon name={theme==='dark'?'sun':'moon'} size={17} />
      </button>
      {/* notifications */}
      <div style={{ position:'relative' }}>
        <button className="iconbtn" onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }} style={{ position:'relative' }}>
          <Icon name="bell" size={17} />
          <span style={{ position:'absolute', top:5, right:6, width:7, height:7, borderRadius:99, background:'var(--neg)', border:'2px solid var(--surface)' }} />
        </button>
        {notifOpen && <NotifPanel navigate={navigate} close={()=>setNotifOpen(false)} />}
      </div>
      {/* AI button */}
      <button className="btn btn-sm btn-accent2" onClick={openAI} style={{ paddingLeft:11 }}>
        <Icon name="sparkle" size={15} />{t('ask_ai')}
      </button>
      {/* profile */}
      <div style={{ position:'relative' }}>
        <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }} className="row gap-8" style={{ paddingLeft:6 }}>
          <span className="avatar" style={{ background:`linear-gradient(135deg, ${role.color}, var(--accent-2))`, width:34, height:34 }}>{role.initials}</span>
        </button>
        {profileOpen && <ProfileMenu role={role} navigate={navigate} close={()=>setProfileOpen(false)} onLogout={onLogout} />}
      </div>
    </header>
  );
}

function LangSwitch({ lang, setLang }) {
  const [open, setOpen] = React.useState(false);
  const labels = { en:'EN', ru:'RU', uz:'UZ' };
  const names = { en:'English', ru:'Русский', uz:'Oʻzbekcha' };
  return (
    <div style={{ position:'relative' }}>
      <button className="btn btn-sm" onClick={() => setOpen(!open)} style={{ gap:6, paddingLeft:10 }}>
        <Icon name="globe" size={15} /><span className="mono" style={{ fontWeight:600 }}>{labels[lang]}</span>
      </button>
      {open && <>
        <div style={{ position:'fixed', inset:0, zIndex:50 }} onClick={() => setOpen(false)} />
        <div className="card scale-in" style={{ position:'absolute', right:0, top:42, width:170, padding:6, zIndex:51, boxShadow:'var(--shadow-3)', background:'var(--elevated)' }}>
          {['en','ru','uz'].map(l => (
            <button key={l} onClick={() => { setLang(l); setOpen(false); }} className="row between"
              style={{ width:'100%', padding:'9px 11px', borderRadius:8, fontSize:13, fontWeight:500, color: lang===l?'var(--text)':'var(--text-2)', background: lang===l?'var(--active)':'transparent' }}>
              {names[l]}<span className="mono dim" style={{ fontSize:11 }}>{labels[l]}</span>
            </button>
          ))}
        </div>
      </>}
    </div>
  );
}

function NotifPanel({ navigate, close }) {
  const items = [
    { icon:'alert', tone:'var(--neg)', title:'Fergana sales dropped 18%', time:'2h ago', go:'alerts' },
    { icon:'sparkle', tone:'var(--accent-2)', title:'Weekly CEO summary is ready', time:'4h ago', go:'reports' },
    { icon:'database', tone:'var(--warn)', title:'CRM sync failed', time:'1d ago', go:'connectors' },
    { icon:'check', tone:'var(--pos)', title:'Banking Core synced', time:'1d ago', go:'connectors' },
  ];
  return <>
    <div style={{ position:'fixed', inset:0, zIndex:50 }} onClick={close} />
    <div className="card scale-in" style={{ position:'absolute', right:0, top:46, width:320, zIndex:51, boxShadow:'var(--shadow-3)', background:'var(--elevated)', overflow:'hidden' }}>
      <div className="row between" style={{ padding:'13px 15px', borderBottom:'1px solid var(--border)' }}>
        <span style={{ fontWeight:700, fontSize:14 }}>Notifications</span><span className="badge badge-accent">4 new</span>
      </div>
      <div className="col" style={{ maxHeight:330, overflowY:'auto' }}>
        {items.map((n,i) => (
          <button key={i} onClick={() => { navigate(n.go); close(); }} className="row gap-10" style={{ padding:'12px 15px', borderBottom:'1px solid var(--border)', textAlign:'left' }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--hover)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <span style={{ width:30, height:30, borderRadius:8, flexShrink:0, background:'var(--surface)', color:n.tone, display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name={n.icon} size={15} /></span>
            <div className="col gap-2 grow"><span style={{ fontSize:12.8, fontWeight:500 }}>{n.title}</span><span className="dim" style={{ fontSize:11 }}>{n.time}</span></div>
          </button>
        ))}
      </div>
    </div>
  </>;
}

function ProfileMenu({ role, navigate, close, onLogout }) {
  const items = [
    { icon:'admin', label:'Admin & Access', go:'admin' },
    { icon:'settings', label:'Settings', go:'settings' },
    { icon:'audit', label:'Audit Log', go:'audit' },
  ];
  return <>
    <div style={{ position:'fixed', inset:0, zIndex:50 }} onClick={close} />
    <div className="card scale-in" style={{ position:'absolute', right:0, top:46, width:250, zIndex:51, boxShadow:'var(--shadow-3)', background:'var(--elevated)', overflow:'hidden' }}>
      <div className="row gap-10" style={{ padding:'15px', borderBottom:'1px solid var(--border)' }}>
        <span className="avatar" style={{ background:`linear-gradient(135deg, ${role.color}, var(--accent-2))`, width:40, height:40 }}>{role.initials}</span>
        <div className="col gap-2"><span style={{ fontWeight:700, fontSize:13.5 }}>{role.name}</span><span className="dim" style={{ fontSize:11.5 }}>{role.titleFull}</span></div>
      </div>
      <div className="col" style={{ padding:6 }}>
        {items.map(it => (
          <button key={it.go} onClick={() => { navigate(it.go); close(); }} className="row gap-10" style={{ padding:'9px 11px', borderRadius:8, fontSize:13, color:'var(--text-2)' }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--hover)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <Icon name={it.icon} size={16} />{it.label}
          </button>
        ))}
        <div style={{ height:1, background:'var(--border)', margin:'5px 8px' }} />
        <button onClick={onLogout} className="row gap-10" style={{ padding:'9px 11px', borderRadius:8, fontSize:13, color:'var(--neg)' }}
          onMouseEnter={e=>e.currentTarget.style.background='var(--neg-soft)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          <Icon name="logout" size={16} />Sign out & switch role
        </button>
      </div>
    </div>
  </>;
}

Object.assign(window, { Sidebar, Topbar, Logo, NAV_GROUPS });
