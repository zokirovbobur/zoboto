/* ============================================================
   FINPORT BLOG — article detail page
   ============================================================ */
function Accordion({faq}){
  const [open,setOpen]=useState(0);
  return (
    <div>
      {faq.map((f,i)=>(
        <div key={i} className={"acc-item"+(open===i?" open":"")}>
          <button className="acc-q" onClick={()=>setOpen(open===i?-1:i)}>
            <span>{f.q}</span><Icon name="chevron" size={20} className="chev"/>
          </button>
          <div className="acc-a" style={{maxHeight:open===i?'240px':'0'}}>
            <div className="acc-a-inner">{f.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompareInline({lang}){
  const t=I18N[lang];
  return (
    <div className="cmp-inline" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,margin:'10px 0 26px'}}>
      <div className="card" style={{padding:'20px',background:'#f7f9fc'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,color:'var(--navy-2)',fontWeight:700,fontSize:15,marginBottom:10,fontFamily:'var(--font-display)'}}>
          <span style={{width:9,height:9,borderRadius:2,background:'var(--navy-soft)'}}></span>{t.odatiy}
        </div>
        <p style={{fontSize:14.5,color:'var(--ink-2)',lineHeight:1.55,fontFamily:'var(--font-ui)'}}>Bank pulni qarzga beradi va kelishilgan foizni qaytarib oladi. Daromad qarz summasiga bog‘lanadi.</p>
      </div>
      <div className="card" style={{padding:'20px',background:'var(--emerald-wash)',borderColor:'#cfe7da'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,color:'var(--emerald-2)',fontWeight:700,fontSize:15,marginBottom:10,fontFamily:'var(--font-display)'}}>
          <span style={{width:9,height:9,borderRadius:2,background:'var(--emerald)'}}></span>{t.islamic_bank}
        </div>
        <p style={{fontSize:14.5,color:'var(--ink-2)',lineHeight:1.55,fontFamily:'var(--font-ui)'}}>Bank real aktivni sotadi, ijaraga beradi yoki sherik bo‘ladi. Daromad aniq bitim va foydaga bog‘lanadi.</p>
      </div>
    </div>
  );
}
function ExampleBox({children}){
  return (
    <div style={{display:'flex',gap:14,padding:'18px 20px',background:'var(--surface-2)',borderRadius:14,margin:'8px 0 26px',border:'1px solid var(--line)',fontFamily:'var(--font-ui)'}}>
      <span style={{width:36,height:36,borderRadius:10,flex:'0 0 auto',display:'grid',placeItems:'center',background:'var(--emerald-tint)',color:'var(--emerald-2)'}}><Icon name="bulb" size={19}/></span>
      <div><div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,marginBottom:4,color:'var(--ink)'}}>Oddiy misol</div><div style={{fontSize:15,color:'var(--ink-2)',lineHeight:1.55}}>{children}</div></div>
    </div>
  );
}
function WarnBox({children}){
  return (
    <div style={{display:'flex',gap:14,padding:'18px 20px',background:'var(--rose-tint)',borderRadius:14,margin:'8px 0 26px',fontFamily:'var(--font-ui)'}}>
      <span style={{width:36,height:36,borderRadius:10,flex:'0 0 auto',display:'grid',placeItems:'center',background:'#f4d9d2',color:'var(--rose)'}}><Icon name="warn" size={19}/></span>
      <div><div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,marginBottom:4,color:'var(--rose)'}}>Ehtiyot bo‘ling</div><div style={{fontSize:15,color:'#7a3526',lineHeight:1.55}}>{children}</div></div>
    </div>
  );
}

function ArticlePage({id,lang,go,marks,toggleMark}){
  const t=I18N[lang];
  const a=ARTICLES.find(x=>x.id===id)||ARTICLES[0];
  const B=ARTICLE_BODY;
  const [active,setActive]=useState('s1');
  const saved=marks.includes(a.id);
  const related=B.related.map(r=>ARTICLES.find(x=>x.id===r)).filter(Boolean);

  useEffect(()=>{
    const onScroll=()=>{
      let cur='s1';
      B.toc.forEach(s=>{const el=document.getElementById(s.id);if(el&&el.getBoundingClientRect().top<160)cur=s.id;});
      setActive(cur);
    };
    window.addEventListener('scroll',onScroll,{passive:true});
    return ()=>window.removeEventListener('scroll',onScroll);
  },[id]);

  const jump=(sid)=>{const el=document.getElementById(sid);if(el){window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-90,behavior:'smooth'});}};

  return (
    <div className="view-enter">
      {/* breadcrumb hero */}
      <div style={{background:'var(--surface-2)',borderBottom:'1px solid var(--line)',position:'relative',overflow:'hidden'}}>
        <div className="geo-bg" style={{opacity:.28,maskImage:'radial-gradient(100% 100% at 90% 0%,#000,transparent 70%)'}}></div>
        <div className="wrap" style={{position:'relative',padding:'26px 24px 38px',maxWidth:1080}}>
          <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13.5,color:'var(--muted)',marginBottom:22,flexWrap:'wrap'}}>
            <a onClick={()=>go({name:'home'})} style={{cursor:'pointer'}}>Bosh sahifa</a><span>/</span>
            <a onClick={()=>go({name:'category',id:a.cat})} style={{cursor:'pointer'}}>{a.catLabel}</a><span>/</span>
            <span style={{color:'var(--ink-2)'}}>Maqola</span>
          </div>
          <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
            <span className="badge badge-cat">{a.catLabel}</span>
            {a.reviewed && <span className="badge badge-review"><Icon name="shieldCheck" size={13}/>{t.reviewed}</span>}
            <Level level={a.level} lang={lang}/>
          </div>
          <h1 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:800,lineHeight:1.08,maxWidth:820,letterSpacing:'-.02em'}}>{a.title}</h1>
          <p style={{fontSize:18,color:'var(--ink-2)',marginTop:16,maxWidth:720,lineHeight:1.5}}>{a.summary}</p>
          <div style={{display:'flex',alignItems:'center',gap:20,marginTop:24,flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:11}}>
              <span style={{width:42,height:42,borderRadius:'50%',background:'var(--navy)',color:'#fff',display:'grid',placeItems:'center',fontFamily:'var(--font-display)',fontWeight:700}}>NK</span>
              <div>
                <div style={{fontWeight:700,fontSize:14.5}}>Nodira Karimova</div>
                <div style={{fontSize:12.5,color:'var(--muted)'}}>Moliyaviy ta’lim muharriri</div>
              </div>
            </div>
            <div style={{width:1,height:34,background:'var(--line)'}}></div>
            <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13.5,color:'var(--muted)'}}>
              <Icon name="clock" size={16}/>{a.time} {t.min_read} · 12-iyun, 2026
            </div>
            <button className="btn btn-ghost btn-sm" style={{marginLeft:'auto',color:saved?'var(--emerald-2)':'var(--ink)'}} onClick={()=>toggleMark(a.id)}>
              <Icon name="bookmark" size={17} fill={saved?'currentColor':'none'}/>{saved?'Saqlangan':'Saqlash'}
            </button>
          </div>
        </div>
      </div>

      <div className="wrap article-grid" style={{maxWidth:1080,padding:'0 24px',display:'grid',gridTemplateColumns:'232px 1fr',gap:46,alignItems:'start'}}>
        {/* TOC */}
        <aside style={{position:'sticky',top:92,paddingTop:38}} className="toc-aside">
          {/* reviewed-by card */}
          <div className="card" style={{padding:'16px',marginBottom:22}}>
            <div className="mono" style={{color:'var(--faint)',marginBottom:10}}>Reviewed by</div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{width:38,height:38,borderRadius:'50%',background:'var(--gold-tint)',color:'#8a6418',display:'grid',placeItems:'center'}}><Icon name="shieldCheck" size={19}/></span>
              <div><div style={{fontWeight:700,fontSize:13.5}}>Dr. A. Yusupov</div><div style={{fontSize:12,color:'var(--muted)'}}>Shariat-moliya eksperti</div></div>
            </div>
          </div>
          <div className="mono" style={{color:'var(--faint)',marginBottom:10,paddingLeft:14}}>Mundarija</div>
          <nav>{B.toc.map(s=>(
            <a key={s.id} className={"toc-link"+(active===s.id?" active":"")} onClick={()=>jump(s.id)}>{s.t}</a>
          ))}</nav>
        </aside>

        {/* body */}
        <article style={{paddingTop:38,maxWidth:720,minWidth:0}}>
          {/* summary box */}
          <div className="card" style={{padding:'22px 24px',marginBottom:30,background:'var(--emerald-wash)',borderColor:'#cfe7da'}}>
            <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:12}}>
              <Icon name="star" size={18} style={{color:'var(--emerald-2)'}}/>
              <span style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:15,color:'var(--emerald-2)'}}>Asosiy xulosalar</span>
            </div>
            <ul style={{display:'flex',flexDirection:'column',gap:10}}>
              {B.takeaways.map((k,i)=>(
                <li key={i} style={{display:'flex',gap:11,fontSize:15,color:'var(--ink-2)',lineHeight:1.5}}>
                  <Icon name="check" size={17} style={{color:'var(--emerald)',flex:'0 0 auto',marginTop:3}}/>{k}
                </li>
              ))}
            </ul>
          </div>

          <div className="prose">
            <h2 id="s1">Qisqacha xulosa</h2>
            <p>Ko‘pchilik uchun Islomiy bank va odatiy bank tashqi ko‘rinishi bir xil — karta, ilova, omonat, moliyalashtirish. Farq esa <strong>pul qanday ishlashida</strong> va daromad qayerdan kelishida. Quyida ettita asosiy farqni oddiy tilda ko‘rib chiqamiz.</p>
            <CompareInline lang={lang}/>

            <h2 id="s2">1. Daromad modeli</h2>
            <p>Odatiy bank asosan pulni qarzga berib, ustiga foiz oladi. Islomiy bank esa daromadni real iqtisodiy faoliyatdan — savdo, ijara yoki sheriklikdan — oladi.</p>
            <ExampleBox>Telefon olmoqchisiz. Odatiy bank sizga pul qarz beradi va foiz qo‘shadi. Islomiy bank telefonni o‘zi sotib olib, ustama narx bilan sizga bo‘lib to‘lashga sotadi (murabaha).</ExampleBox>

            <h2 id="s3">2. Foiz va foyda</h2>
            <p>Foiz (riba) oldindan belgilangan va qarz summasiga bog‘langan ortiqcha to‘lov. Foyda esa aniq bitim natijasi bo‘lib, kafolatlanmaydi va aktivga bog‘lanadi.</p>

            <h2 id="s4">3. Aktivga bog‘liqlik</h2>
            <p>Islomiy moliyada har bir bitim ortida real mol yoki xizmat turishi kerak. Bu spekulyativ, “puldan pul” yaratuvchi bitimlarni cheklaydi.</p>
            <ExampleBox>Mavjud bo‘lmagan yoki noaniq tovar ustidan tuzilgan shartnoma Islomiy moliyada qabul qilinmaydi — chunki u <strong>gharar</strong> (haddan tashqari noaniqlik)ga olib keladi.</ExampleBox>

            <h2 id="s5">4. Risk taqsimoti</h2>
            <p>Odatiy kreditda risk asosan mijozda. Sheriklikka asoslangan Islomiy mahsulotlarda (musharaka, mudaraba) risk bank va mijoz o‘rtasida taqsimlanadi.</p>
            <WarnBox>“Islomiy” yorlig‘i o‘zi kafolat emas. Har doim mahsulot tuzilishini, ustama va jarima shartlarini hamda Shariat kengashi tasdig‘ini tekshiring.</WarnBox>

            <h2 id="s6">5–7. Shartnoma, nazorat va kechikish</h2>
            <p><strong>Shartnoma turi:</strong> qarz emas, balki savdo/ijara/sheriklik. <strong>Nazorat:</strong> mustaqil Shariat kengashi mahsulotni tasdiqlaydi. <strong>Kechiktirilgan to‘lov:</strong> jarima bank daromadiga qo‘shilmay, ko‘pincha xayriyaga yo‘naltiriladi.</p>
            <p>Ushbu uch nuqta birgalikda tizimning falsafasini ko‘rsatadi: pul vositadir, maqsad emas; daromad esa real qiymat yaratishdan kelishi kerak.</p>

            <h2 id="s7">Tez-tez so‘raladigan savollar</h2>
            <Accordion faq={B.faq}/>

            {/* disclaimer */}
            <div style={{marginTop:34,padding:'20px 22px',borderRadius:14,background:'var(--surface-3)',display:'flex',gap:13,fontFamily:'var(--font-ui)'}}>
              <Icon name="shield" size={20} style={{color:'var(--muted)',flex:'0 0 auto',marginTop:2}}/>
              <p style={{fontSize:13.5,color:'var(--ink-2)',lineHeight:1.55}}>{t.disclaimer}</p>
            </div>
            <div style={{marginTop:14,display:'flex',gap:10,flexWrap:'wrap',fontFamily:'var(--font-ui)'}}>
              <button className="btn btn-ghost btn-sm"><Icon name="flag" size={15}/>{t.found_error}</button>
              <button className="btn btn-ghost btn-sm"><Icon name="link" size={15}/>Manbalar</button>
              <span style={{marginLeft:'auto',fontSize:12.5,color:'var(--faint)',alignSelf:'center'}}>Oxirgi yangilanish: 12-iyun, 2026</span>
            </div>
          </div>
        </article>
      </div>

      {/* related */}
      <section className="wrap" style={{maxWidth:1080,padding:'0 24px',marginTop:60}}>
        <SectionHead eyebrow="Davomi" title="O‘xshash maqolalar"/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:20}}>
          {related.map(r=><ArticleCard key={r.id} a={r} lang={lang} go={go} marks={marks} toggleMark={toggleMark} compact/>)}
        </div>
      </section>
    </div>
  );
}

Object.assign(window,{ArticlePage});
