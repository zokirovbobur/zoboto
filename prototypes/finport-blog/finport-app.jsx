/* ============================================================
   FINPORT BLOG — app shell & router
   ============================================================ */
function App(){
  const [view,setView]=useState({name:'home'});
  const [lang,setLang]=useState(()=>localStorage.getItem('fp_lang')||'uz');
  const [marks,toggleMark]=useBookmarks();
  const [tool,setTool]=useState(null);
  const [search,setSearch]=useState(false);
  const [toast,setToast]=useState('');
  const [progress,setProgress]=useState(0);
  const toastTimer=useRef(null);

  const showToast=useCallback((m)=>{
    setToast(m);
    clearTimeout(toastTimer.current);
    toastTimer.current=setTimeout(()=>setToast(''),2200);
  },[]);

  const go=useCallback((v)=>{
    setView(v);
    window.scrollTo({top:0,behavior:'auto'});
  },[]);

  useEffect(()=>{localStorage.setItem('fp_lang',lang);},[lang]);

  // bookmark toast
  const toggleMarkWithToast=useCallback((id)=>{
    const saved=marks.includes(id);
    toggleMark(id);
    showToast(saved?'Saqlanganlardan olib tashlandi':'Maqola saqlandi');
  },[marks,toggleMark,showToast]);

  // reading progress on article page
  useEffect(()=>{
    if(view.name!=='article'){setProgress(0);return;}
    const onScroll=()=>{
      const h=document.documentElement;
      const max=h.scrollHeight-h.clientHeight;
      setProgress(max>0?Math.min(100,(h.scrollTop/max)*100):0);
    };
    onScroll();
    window.addEventListener('scroll',onScroll,{passive:true});
    return ()=>window.removeEventListener('scroll',onScroll);
  },[view]);

  // keyboard: / opens search, esc closes
  useEffect(()=>{
    const onKey=(e)=>{
      if(e.key==='/' && !/input|textarea/i.test(e.target.tagName)){e.preventDefault();setSearch(true);}
      if(e.key==='Escape'){setSearch(false);setTool(null);}
    };
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[]);

  const openTool=useCallback((tl)=>setTool(tl),[]);

  return (
    <React.Fragment>
      {view.name==='article' && <div className="read-progress" style={{width:progress+'%'}}></div>}
      <Header lang={lang} setLang={setLang} go={go} view={view} onSearch={()=>setSearch(true)}/>

      <main>
        {view.name==='home' && (
          <React.Fragment>
            <Hero lang={lang} go={go} onSearch={()=>setSearch(true)}/>
            <CategoryGrid lang={lang} go={go}/>
            <LearningPath lang={lang} go={go}/>
            <ArticlesSection lang={lang} go={go} marks={marks} toggleMark={toggleMarkWithToast}/>
            <ComparisonModule lang={lang}/>
            <ToolsSection lang={lang} openTool={openTool}/>
            <Newsletter lang={lang}/>
            <TrustLayer lang={lang} onFeedback={()=>showToast('Fikr-mulohaza formasi (demo)')}/>
          </React.Fragment>
        )}
        {view.name==='articles' && <ListingPage lang={lang} go={go} marks={marks} toggleMark={toggleMarkWithToast}/>}
        {view.name==='category' && <ListingPage lang={lang} go={go} marks={marks} toggleMark={toggleMarkWithToast} catId={view.id}/>}
        {view.name==='article' && <ArticlePage id={view.id} lang={lang} go={go} marks={marks} toggleMark={toggleMarkWithToast}/>}
        {view.name==='glossary' && <GlossaryPage lang={lang} go={go}/>}
        {view.name==='about' && <AboutPage lang={lang} go={go}/>}
        {view.name==='tools' && (
          <div className="view-enter" style={{paddingTop:8}}>
            <div style={{background:'var(--surface-2)',borderBottom:'1px solid var(--line)',position:'relative',overflow:'hidden'}}>
              <div className="geo-bg" style={{opacity:.3,maskImage:'radial-gradient(90% 100% at 85% 0%,#000,transparent 70%)'}}></div>
              <div className="wrap" style={{position:'relative',padding:'40px 24px 8px'}}>
                <div className="eyebrow">Vositalar</div>
                <h1 style={{fontSize:'clamp(28px,4vw,42px)',fontWeight:800,marginTop:12}}>{I18N[lang].tools_title}</h1>
                <p style={{fontSize:17,color:'var(--muted)',marginTop:10,maxWidth:560,marginBottom:30}}>{I18N[lang].tools_sub}</p>
              </div>
            </div>
            <ToolsSection lang={lang} openTool={openTool}/>
            <ComparisonModule lang={lang}/>
          </div>
        )}
      </main>

      <Footer lang={lang} go={go}/>

      {tool && <ToolModal tool={tool} lang={lang} onClose={()=>setTool(null)}/>}
      {search && <SearchOverlay lang={lang} go={go} onClose={()=>setSearch(false)}/>}
      <Toast msg={toast}/>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
