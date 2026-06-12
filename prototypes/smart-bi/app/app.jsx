/* ============================================================
   App — root state, shell composition, routing
   ============================================================ */
const { useState: AUS, useEffect: AUE } = React;

const ROLE_META = {
  CEO:               { name:'Bobur Zokirov', initials:'BZ', titleFull:'Chief Executive Officer', color:'#3b82f6', home:'dashboard' },
  Analyst:           { name:'Sardor Aliyev', initials:'SA', titleFull:'Business Analyst', color:'#22d3ee', home:'ai' },
  'Department Head': { name:'Nodira Yusupova', initials:'NY', titleFull:'Head of Retail', color:'#34d399', home:'dashboard' },
  'Data Admin':      { name:'Dilshod Umarov', initials:'DU', titleFull:'Data Administrator', color:'#a78bfa', home:'connectors' },
};

const SCREEN_COMPONENTS = {
  dashboard:'DashboardScreen', metrics:'MetricsScreen', alerts:'AlertsScreen', factor:'FactorScreen',
  library:'LibraryScreen', widget:'WidgetScreen', templates:'TemplatesScreen', reports:'ReportsScreen',
  connectors:'ConnectorsScreen', docs:'DocsScreen', admin:'AdminScreen', audit:'AuditScreen', settings:'SettingsScreen',
};

function ComingSoon({ id, t }) {
  return (
    <div className="screen">
      <div className="screen-head"><h1 className="screen-title">{t('nav_'+id) || id}</h1><div className="screen-sub">{t('coming_soon_sub')}</div></div>
      <div className="card card-pad center" style={{ height:320, flexDirection:'column', gap:14 }}>
        <div className="skeleton" style={{ width:'60%', height:18 }} />
        <div className="skeleton" style={{ width:'80%', height:120 }} />
        <div className="skeleton" style={{ width:'40%', height:18 }} />
      </div>
    </div>
  );
}

function AIScreen({ navigate, toast, t }) {
  t = t || ((k) => (window.I18N.en[k] || k));
  return (
    <div className="screen" style={{ height:'100%', display:'flex', flexDirection:'column', maxWidth:980 }}>
      <div className="screen-head row between wrap gap-12">
        <div className="col gap-2">
          <h1 className="screen-title row gap-10"><span style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,var(--accent),var(--accent-2))', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="sparkle" size={17} style={{color:'#fff'}}/></span>AI Analyst</h1>
          <div className="screen-sub">{t('ai_screen_sub')}</div>
        </div>
        <button className="btn btn-sm" onClick={()=>toast(t('new_chat'))}><Icon name="plus" size={15}/>{t('new_chat')}</button>
      </div>
      <div className="card" style={{ flex:1, display:'flex', flexDirection:'column', padding:'14px 18px', minHeight:0, overflow:'hidden' }}>
        <ChatThread navigate={navigate} toast={toast} />
      </div>
    </div>
  );
}

function MobileFrame({ children, onClose, role, screen, navigate }) {
  return (
    <div className="scrim center" style={{ alignItems:'center', flexDirection:'column', gap:18 }} onClick={onClose}>
      <div className="row gap-10" style={{ color:'#fff' }} onClick={e=>e.stopPropagation()}>
        <Icon name="phone" size={16}/><span style={{ fontWeight:600, fontSize:13.5 }}>{window.I18N && window.I18N[window._lang||'en'] ? (window.I18N[window._lang||'en'].mobile_preview_label||'Mobile preview · responsive layout') : 'Mobile preview · responsive layout'}</span>
      </div>
      <div onClick={e=>e.stopPropagation()} style={{ width:390, height:'min(800px, 86vh)', background:'var(--bg)', borderRadius:42, border:'10px solid #05070b',
        boxShadow:'0 40px 100px rgba(0,0,0,0.6), inset 0 0 0 2px var(--border-strong)', overflow:'hidden', position:'relative', display:'flex', flexDirection:'column' }}>
        <div style={{ height:30, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 22px', flexShrink:0, fontSize:12, fontWeight:600 }}>
          <span className="mono">9:41</span>
          <span style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', top:8, width:110, height:20, background:'#05070b', borderRadius:99 }} />
          <span className="row gap-4 dim"><Icon name="bolt" size={13}/></span>
        </div>
        {children}
      </div>
      <button className="btn btn-sm" onClick={onClose} style={{ color:'#fff', background:'rgba(255,255,255,0.1)', borderColor:'rgba(255,255,255,0.2)' }}><Icon name="close" size={14}/>{window.I18N && (window.I18N[window._lang||'en']||{}).close_preview||'Close preview'}</button>
    </div>
  );
}

/* MobileDash: embedded=true hides built-in header/nav (used in real mobile layout) */
function MobileDash({ role, navigate, embedded, t }) {
  t = t || ((k) => (window.I18N.en[k] || k));
  const D = window.DATA;
  return (
    <div className="col grow" style={{ overflowY: embedded ? 'visible' : 'auto' }}>
      {!embedded && (
        <div className="row between" style={{ padding:'10px 16px' }}>
          <div className="row gap-10"><Logo size={28}/><div className="col" style={{lineHeight:1.1}}><span style={{fontWeight:800,fontSize:13}}>BI Navigator</span><span className="dim" style={{fontSize:9.5,letterSpacing:'0.05em'}}>UZBEKISTAN</span></div></div>
          <span className="avatar" style={{ width:30, height:30, background:`linear-gradient(135deg,${role.color},var(--accent-2))`, fontSize:11 }}>{role.initials}</span>
        </div>
      )}
      <div className="col gap-12" style={{ padding: embedded ? '12px 14px 24px' : '6px 16px 80px' }}>
        <div className="col gap-2"><span className="dim" style={{fontSize:12}}>{t('mobile_greeting')} {role.name.split(' ')[0]}</span><span style={{fontSize:18,fontWeight:800,letterSpacing:'-0.02em'}}>{t('company_overview')}</span></div>
        <div className="card card-pad glow-border" style={{ background:'var(--card-2)' }}>
          <div className="row gap-8" style={{marginBottom:8}}><span className="badge badge-info"><Icon name="sparkle" size={11}/>{t('ai_brief')}</span></div>
          <p style={{margin:0,fontSize:12.8,lineHeight:1.5}}>{t('ai_brief_text')}</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {D.KPIS.slice(0,4).map(k => (
            <div key={k.id} className="card kpi" style={{ padding:13 }}>
              <div className="kpi-label" style={{fontSize:11}}>{k.label}</div>
              <div className="kpi-value mono" style={{ fontSize:21, marginTop:7 }}>{k.value}<span className="unit" style={{fontSize:11}}>{k.unit}</span></div>
              <div style={{marginTop:7}}><Delta value={k.delta} suffix={k.id==='growth'?'':'%'}/></div>
            </div>
          ))}
        </div>
        <div className="card card-pad">
          <div className="section-title" style={{marginBottom:10,fontSize:13.5}}>Revenue trend</div>
          <AreaChart series={D.REV_TREND.slice(6)} planData={D.PLAN_TREND.slice(6)} labels={D.MONTHS.slice(6)} h={150}/>
        </div>
        <div className="card card-pad">
          <div className="section-title" style={{marginBottom:10,fontSize:13.5}}>Regional performance</div>
          <RegionBars regions={D.REGIONS.slice(0,5)} />
        </div>
        {embedded && (
          <button className="btn btn-sm row gap-6" onClick={() => navigate('ai')} style={{ alignSelf:'center', marginTop:4 }}>
            <Icon name="sparkle" size={14} />{t('mobile_ask_ai')}
          </button>
        )}
      </div>
      {!embedded && (
        <div className="row between" style={{ position:'absolute', bottom:0, left:0, right:0, padding:'10px 26px 22px', background:'var(--surface)', borderTop:'1px solid var(--border)' }}>
          {[['dashboard',t('mobile_home')],['ai',t('mobile_ai_label')],['alerts',t('mobile_alerts_label')],['library',t('mobile_boards')]].map(([ic,l],i)=>(
            <button key={i} className="col center gap-4" style={{ color:i===0?'var(--accent)':'var(--text-3)' }}><Icon name={ic} size={20}/><span style={{fontSize:9.5,fontWeight:600}}>{l}</span></button>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [logged, setLogged] = AUS(false);
  const [roleId, setRoleId] = AUS('CEO');
  const [screen, setScreen] = AUS('dashboard');
  const [lang, setLang] = AUS('uz');
  const [theme, setTheme] = AUS('dark');
  const [aiOpen, setAiOpen] = AUS(false);
  const [collapsed, setCollapsed] = AUS(false);
  const [mobile, setMobile] = AUS(false);
  const [notifOpen, setNotifOpen] = AUS(false);
  const [profileOpen, setProfileOpen] = AUS(false);
  const [isMobile, setIsMobile] = AUS(() => window.innerWidth <= 768);
  const toast = useToast();

  AUE(() => {
    const handle = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  AUE(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  AUE(() => { window._lang = lang; }, [lang]);
  AUE(() => {
    const saved = JSON.parse(localStorage.getItem('binav') || '{}');
    if (saved.theme) setTheme(saved.theme);
    if (saved.lang) setLang(saved.lang);
  }, []);
  AUE(() => { localStorage.setItem('binav', JSON.stringify({ theme, lang })); }, [theme, lang]);

  const t = (k) => (window.I18N[lang] && window.I18N[lang][k]) || window.I18N.en[k] || k;
  const role = ROLE_META[roleId];

  const navigate = (s) => { setScreen(s); setNotifOpen(false); setProfileOpen(false); window.scrollTo(0,0); };
  const enter = (rid) => { setRoleId(rid); setLogged(true); setScreen(ROLE_META[rid].home); };
  const logout = () => { setLogged(false); setProfileOpen(false); setAiOpen(false); };

  if (!logged) return <LoginScreen onEnter={enter} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />;

  const renderScreen = () => {
    if (screen === 'ai') return <AIScreen navigate={navigate} toast={toast} t={t} />;
    const compName = SCREEN_COMPONENTS[screen];
    const Comp = window[compName];
    if (Comp) return <Comp navigate={navigate} openAI={()=>setAiOpen(true)} toast={toast} role={role} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} t={t} />;
    return <ComingSoon id={screen} t={t} />;
  };

  const renderMobileScreen = () => {
    if (screen === 'dashboard') return <MobileDash role={role} navigate={navigate} embedded={true} t={t} />;
    if (screen === 'ai') return <AIScreen navigate={navigate} toast={toast} t={t} />;
    const compName = SCREEN_COMPONENTS[screen];
    const Comp = window[compName];
    if (Comp) return <Comp navigate={navigate} openAI={()=>setAiOpen(true)} toast={toast} role={role} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} t={t} />;
    return <ComingSoon id={screen} t={t} />;
  };

  /* ---- Real mobile device layout ---- */
  if (isMobile) {
    return (
      <div className="col" style={{ height:'100vh', overflow:'hidden' }}>
        <MobileTopbar role={role} theme={theme} setTheme={setTheme}
          openAI={() => setAiOpen(true)} navigate={navigate}
          notifOpen={notifOpen} setNotifOpen={setNotifOpen} />
        <main className="grow" style={{ overflowY:'auto', WebkitOverflowScrolling:'touch', minHeight:0 }}>
          {renderMobileScreen()}
        </main>
        <MobileBottomNav screen={screen} navigate={navigate} t={t} />
        <AIPanel open={aiOpen} onClose={() => setAiOpen(false)} navigate={navigate} toast={toast} />
      </div>
    );
  }

  /* ---- Desktop layout (unchanged) ---- */
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar screen={screen} navigate={navigate} t={t} collapsed={collapsed} role={role} />
      <div className="col grow" style={{ minWidth:0 }}>
        <Topbar t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} openAI={()=>setAiOpen(true)}
          role={role} navigate={navigate} toggleSidebar={()=>setCollapsed(c=>!c)} onMobile={()=>setMobile(true)} mobile={mobile}
          notifOpen={notifOpen} setNotifOpen={setNotifOpen} profileOpen={profileOpen} setProfileOpen={setProfileOpen} onLogout={logout} />
        <main className="grow" style={{ overflowY:'auto', minHeight:0 }}>{renderScreen()}</main>
      </div>
      <AIPanel open={aiOpen} onClose={()=>setAiOpen(false)} navigate={navigate} toast={toast} />
      {mobile && <MobileFrame onClose={()=>setMobile(false)} role={role}><MobileDash role={role} navigate={navigate} t={t} /></MobileFrame>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ToastProvider><App /></ToastProvider>);
