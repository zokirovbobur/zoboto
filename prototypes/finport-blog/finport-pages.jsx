/* ============================================================
   FINPORT BLOG — list pages: articles, category, glossary, about, search
   ============================================================ */

/* ---------- Articles / Category listing (sticky filters) ---------- */
function ListingPage({lang,go,marks,toggleMark,catId}){
  const t=I18N[lang];
  const cat=catId?CATEGORIES.find(c=>c.id===catId):null;
  const [level,setLevel]=useState(0);
  const [sort,setSort]=useState('new');
  const [onlyReviewed,setOnlyReviewed]=useState(false);
  let list=ARTICLES.filter(a=>!catId||a.cat===catId);
  if(level) list=list.filter(a=>a.level===level);
  if(onlyReviewed) list=list.filter(a=>a.reviewed);
  if(sort==='time') list=[...list].sort((a,b)=>a.time-b.time);

  return (
    <div className="view-enter">
      <div style={{background:'var(--surface-2)',borderBottom:'1px solid var(--line)',position:'relative',overflow:'hidden'}}>
        <div className="geo-bg" style={{opacity:.3,maskImage:'radial-gradient(90% 100% at 85% 0%,#000,transparent 70%)'}}></div>
        <div className="wrap" style={{position:'relative',padding:'34px 24px 30px'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13.5,color:'var(--muted)',marginBottom:16}}>
            <a onClick={()=>go({name:'home'})} style={{cursor:'pointer'}}>Bosh sahifa</a><span>/</span>
            <span style={{color:'var(--ink-2)'}}>{cat?cat.title:'Barcha maqolalar'}</span>
          </div>
          {cat && <span style={{width:52,height:52,borderRadius:14,display:'grid',placeItems:'center',background:'var(--emerald-tint)',color:'var(--emerald-2)',marginBottom:14}}><Icon name={cat.icon} size={26}/></span>}
          <h1 style={{fontSize:'clamp(28px,4vw,40px)',fontWeight:800}}>{cat?cat.title:t.nav.articles}</h1>
          <p style={{fontSize:17,color:'var(--muted)',marginTop:10,maxWidth:560}}>{cat?cat.desc:t.articles_sub}</p>
        </div>
      </div>

      {/* sticky filter bar */}
      <div style={{position:'sticky',top:68,zIndex:40,background:'rgba(255,255,255,.92)',backdropFilter:'blur(10px)',borderBottom:'1px solid var(--line)'}}>
        <div className="wrap" style={{padding:'14px 24px',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <span style={{fontSize:13,color:'var(--faint)',fontWeight:600,marginRight:2}}>Daraja:</span>
          <button className={"btn btn-sm "+(level===0?"btn-navy":"btn-ghost")} onClick={()=>setLevel(0)}>Barchasi</button>
          {[1,2,3].map(l=><button key={l} className={"btn btn-sm "+(level===l?"btn-navy":"btn-ghost")} onClick={()=>setLevel(l)}>{t.levels[l]}</button>)}
          <button className={"btn btn-sm "+(onlyReviewed?"btn-soft":"btn-ghost")} onClick={()=>setOnlyReviewed(v=>!v)} style={{marginLeft:6}}>
            <Icon name="shieldCheck" size={15}/>{t.reviewed}
          </button>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:13,color:'var(--faint)'}}>{list.length} natija</span>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{padding:'9px 12px',borderRadius:10,border:'1px solid var(--line-2)',background:'var(--surface)',fontFamily:'inherit',fontSize:13.5,fontWeight:600,color:'var(--ink-2)',cursor:'pointer'}}>
              <option value="new">Eng yangi</option>
              <option value="time">O‘qish vaqti</option>
            </select>
          </div>
        </div>
      </div>

      <section className="wrap" style={{padding:'30px 24px 0'}}>
        {list.length? (
          <div className="stagger" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:20}}>
            {list.map(a=><ArticleCard key={a.id} a={a} lang={lang} go={go} marks={marks} toggleMark={toggleMark}/>)}
          </div>
        ):(
          <div style={{textAlign:'center',padding:'60px 0',color:'var(--muted)'}}>
            <Icon name="search" size={40} style={{color:'var(--faint)',margin:'0 auto 14px'}}/>
            <p style={{fontSize:16}}>Bu filtrlar bo‘yicha maqola topilmadi.</p>
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------- Glossary ---------- */
function GlossaryPage({lang,go}){
  const [q,setQ]=useState('');
  const [letter,setLetter]=useState('');
  const alpha="ABDGIJMNPRSTZ".split('');
  let list=GLOSSARY.filter(g=>g.term.toLowerCase().includes(q.toLowerCase()));
  if(letter) list=list.filter(g=>g.term.toUpperCase().startsWith(letter));
  return (
    <div className="view-enter">
      <div style={{background:'var(--navy)',color:'#fff',position:'relative',overflow:'hidden'}}>
        <div className="geo-bg" style={{opacity:.1}}></div>
        <div className="wrap" style={{position:'relative',padding:'42px 24px 36px'}}>
          <div className="eyebrow" style={{color:'#43C997'}}>Lug‘at</div>
          <h1 style={{color:'#fff',fontSize:'clamp(28px,4vw,42px)',fontWeight:800,marginTop:12}}>Atamalar oddiy tilda</h1>
          <p style={{color:'#a9b8c7',fontSize:17,marginTop:10,maxWidth:520}}>Islomiy moliya va shaxsiy moliya atamalari — qisqa ta’rif va real misol bilan.</p>
          <div style={{marginTop:22,display:'flex',alignItems:'center',gap:12,background:'#fff',borderRadius:999,padding:'6px 6px 6px 20px',maxWidth:480}}>
            <Icon name="search" size={20} style={{color:'var(--faint)'}}/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Atama qidiring: riba, sukuk, zakat…"
              style={{flex:1,border:'none',outline:'none',fontSize:15.5,fontFamily:'inherit',color:'var(--ink)',padding:'8px 0'}}/>
          </div>
        </div>
      </div>

      <div style={{position:'sticky',top:68,zIndex:40,background:'rgba(255,255,255,.94)',backdropFilter:'blur(10px)',borderBottom:'1px solid var(--line)'}}>
        <div className="wrap" style={{padding:'12px 24px',display:'flex',gap:5,flexWrap:'wrap',alignItems:'center'}}>
          <button onClick={()=>setLetter('')} className={"btn btn-sm "+(letter===''?'btn-navy':'btn-ghost')} style={{minWidth:44}}>Barchasi</button>
          {alpha.map(l=>(
            <button key={l} onClick={()=>setLetter(letter===l?'':l)}
              style={{width:38,height:38,borderRadius:10,fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,
                background:letter===l?'var(--navy)':'transparent',color:letter===l?'#fff':'var(--ink-2)',transition:'.15s'}}
              onMouseEnter={e=>{if(letter!==l)e.currentTarget.style.background='var(--surface-3)'}}
              onMouseLeave={e=>{if(letter!==l)e.currentTarget.style.background='transparent'}}>{l}</button>
          ))}
        </div>
      </div>

      <section className="wrap" style={{padding:'28px 24px 0'}}>
        <div className="stagger gloss-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:18}}>
          {list.map((g,i)=>(
            <div key={i} className="card" style={{padding:'22px 22px'}}>
              <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:10}}>
                <h3 style={{fontSize:21,fontWeight:800,color:'var(--navy)'}}>{g.term}</h3>
                <span className="mono" style={{color:'var(--faint)'}}>atama</span>
              </div>
              <p style={{fontSize:15,color:'var(--ink-2)',lineHeight:1.55,marginBottom:14}}>{g.def}</p>
              <div style={{display:'flex',gap:11,padding:'12px 14px',background:'var(--surface-2)',borderRadius:11,marginBottom:g.related.length?14:0}}>
                <Icon name="bulb" size={17} style={{color:'var(--emerald-2)',flex:'0 0 auto',marginTop:1}}/>
                <div style={{fontSize:13.5,color:'var(--muted)',lineHeight:1.5}}><strong style={{color:'var(--ink-2)'}}>Oddiy misol: </strong>{g.ex}</div>
              </div>
              {g.related.length>0 && (
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {g.related.map(r=>{const ar=ARTICLES.find(x=>x.id===r);return ar?(
                    <button key={r} className="badge badge-cat" style={{cursor:'pointer'}} onClick={()=>go({name:'article',id:r})}>
                      <Icon name="doc" size={13}/>{ar.title.length>26?ar.title.slice(0,26)+'…':ar.title}
                    </button>
                  ):null;})}
                </div>
              )}
            </div>
          ))}
        </div>
        {list.length===0 && <div style={{textAlign:'center',padding:'50px 0',color:'var(--muted)'}}>Atama topilmadi.</div>}
      </section>
    </div>
  );
}

/* ---------- About page ---------- */
function AboutPage({lang,go}){
  const t=I18N[lang];
  return (
    <div className="view-enter">
      <div style={{background:'var(--surface-2)',borderBottom:'1px solid var(--line)',position:'relative',overflow:'hidden'}}>
        <div className="geo-bg" style={{opacity:.32,maskImage:'radial-gradient(90% 100% at 85% 0%,#000,transparent 70%)'}}></div>
        <div className="wrap" style={{position:'relative',padding:'48px 24px',maxWidth:840}}>
          <div className="eyebrow">Biz haqimizda</div>
          <h1 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:800,marginTop:12,maxWidth:680,lineHeight:1.08}}>Moliyani hammaga tushunarli qilamiz</h1>
          <p style={{fontSize:18,color:'var(--ink-2)',marginTop:16,maxWidth:620,lineHeight:1.55}}>
            Finport Blog — O‘zbekiston bozori uchun mustaqil moliyaviy ta’lim platformasi. Maqsadimiz: murakkab moliyaviy mavzularni — ayniqsa Islomiy moliyani — sodda, neytral va amaliy tilda tushuntirish.
          </p>
        </div>
      </div>
      <section className="wrap" style={{padding:'48px 24px 0',maxWidth:840}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,marginBottom:40}}>
          {[
            ['bulb','Sodda til','Atamalarni real misollar bilan tushuntiramiz, ortiqcha akademik tildan qochamiz.'],
            ['shieldCheck','Ekspert nazorati','Har bir material moliya yoki Shariat bo‘yicha mutaxassis tomonidan tekshiriladi.'],
            ['scale','Neytrallik','Biz biron bankni reklama qilmaymiz — faqat tushunishga yordam beramiz.'],
          ].map(([ic,h,d])=>(
            <div key={h} className="card" style={{padding:'24px 22px'}}>
              <span style={{width:46,height:46,borderRadius:13,display:'grid',placeItems:'center',background:'var(--emerald-tint)',color:'var(--emerald-2)',marginBottom:14}}><Icon name={ic} size={23}/></span>
              <h3 style={{fontSize:17,fontWeight:700,marginBottom:7}}>{h}</h3>
              <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.5}}>{d}</p>
            </div>
          ))}
        </div>
        <div className="card" style={{padding:'28px 26px',background:'var(--surface-3)',marginBottom:10}}>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:10}}>Shariat ko‘rib chiqish metodikasi</h3>
          <p style={{fontSize:15,color:'var(--ink-2)',lineHeight:1.6}}>
            Islomiy moliyaga oid materiallar mustaqil Shariat-moliya mutaxassisi tomonidan ko‘rib chiqiladi. Biz hukm (fatvo) chiqarmaymiz — faqat umumiy tushuncha beramiz. Aniq diniy savollar uchun malakali ulamoga murojaat qilishni tavsiya qilamiz.
          </p>
          <p style={{fontSize:13.5,color:'var(--muted)',marginTop:14,lineHeight:1.55}}>{t.disclaimer}</p>
        </div>
        <button className="btn btn-primary" style={{marginTop:8}} onClick={()=>go({name:'home'})}>Bosh sahifaga qaytish<Icon name="arrowRight" size={18}/></button>
      </section>
    </div>
  );
}

/* ---------- Search overlay ---------- */
function SearchOverlay({lang,go,onClose}){
  const t=I18N[lang];
  const [q,setQ]=useState('');
  const inputRef=useRef(null);
  useEffect(()=>{inputRef.current&&inputRef.current.focus();},[]);
  const ql=q.toLowerCase();
  const aRes=q?ARTICLES.filter(a=>a.title.toLowerCase().includes(ql)||a.catLabel.toLowerCase().includes(ql)):ARTICLES.slice(0,4);
  const gRes=q?GLOSSARY.filter(g=>g.term.toLowerCase().includes(ql)):[];
  const suggestions=['murabaha','kredit','omonat','zakat','sukuk','riba'];
  return (
    <div className="modal-back" style={{alignItems:'flex-start',paddingTop:'10vh'}} onClick={onClose}>
      <div className="modal scroll-thin" style={{maxWidth:640}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'18px 22px',borderBottom:'1px solid var(--line)'}}>
          <Icon name="search" size={22} style={{color:'var(--faint)'}}/>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} placeholder={t.search_ph}
            style={{flex:1,border:'none',outline:'none',fontSize:17,fontFamily:'inherit'}}/>
          <button className="icon-btn" onClick={onClose}><Icon name="close" size={20}/></button>
        </div>
        <div style={{padding:'18px 22px'}}>
          {!q && (
            <div style={{marginBottom:18}}>
              <div className="mono" style={{color:'var(--faint)',marginBottom:10}}>Ommabop qidiruvlar</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {suggestions.map(s=><button key={s} className="badge badge-navy" style={{cursor:'pointer',fontSize:13}} onClick={()=>setQ(s)}>{s}</button>)}
              </div>
            </div>
          )}
          {aRes.length>0 && <div className="mono" style={{color:'var(--faint)',margin:'4px 0 8px'}}>Maqolalar</div>}
          {aRes.map(a=>(
            <button key={a.id} onClick={()=>{onClose();go({name:'article',id:a.id});}}
              style={{width:'100%',display:'flex',alignItems:'center',gap:13,padding:'12px 12px',borderRadius:11,textAlign:'left',transition:'.15s'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <span style={{width:36,height:36,borderRadius:9,flex:'0 0 auto',display:'grid',placeItems:'center',background:'var(--emerald-tint)',color:'var(--emerald-2)'}}><Icon name="doc" size={18}/></span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:14.5,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{a.title}</div>
                <div style={{fontSize:12.5,color:'var(--faint)'}}>{a.catLabel} · {a.time} {t.min_read}</div>
              </div>
              <Icon name="arrowRight" size={17} style={{color:'var(--faint)'}}/>
            </button>
          ))}
          {gRes.length>0 && <div className="mono" style={{color:'var(--faint)',margin:'14px 0 8px'}}>Lug‘at</div>}
          {gRes.map((g,i)=>(
            <button key={i} onClick={()=>{onClose();go({name:'glossary'});}}
              style={{width:'100%',display:'flex',alignItems:'center',gap:13,padding:'12px',borderRadius:11,textAlign:'left',transition:'.15s'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <span style={{width:36,height:36,borderRadius:9,flex:'0 0 auto',display:'grid',placeItems:'center',background:'#eaf0f7',color:'var(--navy-2)'}}><Icon name="hash" size={18}/></span>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14.5}}>{g.term}</div><div style={{fontSize:12.5,color:'var(--faint)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{g.def}</div></div>
            </button>
          ))}
          {q && aRes.length===0 && gRes.length===0 && <div style={{textAlign:'center',padding:'30px 0',color:'var(--muted)'}}>“{q}” bo‘yicha natija topilmadi.</div>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window,{ListingPage,GlossaryPage,AboutPage,SearchOverlay});
