/* ============================================================
   Charts — inline SVG, gradient + glow, animated
   All export to window.
   ============================================================ */
const { useState, useEffect, useRef, useMemo } = React;

let _uid = 0;
const uid = (p) => `${p}-${++_uid}`;

/* ---------- Sparkline ---------- */
function Sparkline({ data, color = 'var(--accent)', w = 90, h = 30, fill = true }) {
  const id = useMemo(() => uid('sp'), []);
  const min = Math.min(...data), max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [ (i / (data.length - 1)) * w, h - 4 - ((v - min) / rng) * (h - 8) ]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display:'block', overflow:'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${id})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.6" fill={color} />
    </svg>
  );
}

/* ---------- Area / Line chart (plan vs fact) ---------- */
function AreaChart({ series, labels, h = 220, accent = 'var(--accent)', accent2 = 'var(--accent-2)', showPlan = true, planData = null }) {
  const wrap = useRef(null);
  const [w, setW] = useState(640);
  const id = useMemo(() => uid('ac'), []);
  const [hover, setHover] = useState(null);
  useEffect(() => {
    const ro = new ResizeObserver(es => setW(es[0].contentRect.width));
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);
  const padL = 44, padB = 26, padT = 14, padR = 8;
  const all = planData ? [...series, ...planData] : series;
  const max = Math.max(...all) * 1.08, min = Math.min(...all) * 0.92;
  const rng = max - min || 1;
  const X = i => padL + (i / (series.length - 1)) * (w - padL - padR);
  const Y = v => padT + (1 - (v - min) / rng) * (h - padT - padB);
  const toPath = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  const line = toPath(series);
  const area = `${line} L${X(series.length-1)} ${h-padB} L${padL} ${h-padB} Z`;
  const gl = 5; // gridlines
  return (
    <div ref={wrap} style={{ width:'100%' }}>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const x = (e.clientX - r.left) * (w / r.width); const i = Math.round(((x - padL) / (w - padL - padR)) * (series.length - 1)); if (i >= 0 && i < series.length) setHover(i); }}>
        <defs>
          <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
            <stop offset="60%" stopColor={accent2} stopOpacity="0.10" />
            <stop offset="100%" stopColor={accent2} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={accent} /><stop offset="100%" stopColor={accent2} />
          </linearGradient>
          <filter id={`${id}g`} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {Array.from({length:gl}).map((_,i) => { const y = padT + (i/(gl-1))*(h-padT-padB); const val = max - (i/(gl-1))*rng; return (
          <g key={i}>
            <line x1={padL} y1={y} x2={w-padR} y2={y} stroke="var(--grid-line)" strokeWidth="1" />
            <text x={padL-8} y={y+3} textAnchor="end" fontSize="10" fill="var(--text-3)" fontFamily="var(--font-mono)">{Math.round(val)}</text>
          </g>); })}
        {showPlan && planData && <path d={toPath(planData)} fill="none" stroke="var(--text-3)" strokeWidth="1.6" strokeDasharray="4 4" opacity="0.7" />}
        <path d={area} fill={`url(#${id}f)`} style={{ animation:'fadeIn .8s ease both' }} />
        <path d={line} fill="none" stroke={`url(#${id}s)`} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
          filter={`url(#${id}g)`} strokeDasharray="2000" strokeDashoffset="2000" style={{ animation:'dash 1.3s ease forwards' }} />
        {labels.map((l, i) => (i % Math.ceil(labels.length/8) === 0 || i === labels.length-1) && (
          <text key={i} x={X(i)} y={h-8} textAnchor="middle" fontSize="10" fill="var(--text-3)">{l}</text>
        ))}
        {hover != null && (
          <g>
            <line x1={X(hover)} y1={padT} x2={X(hover)} y2={h-padB} stroke="var(--border-strong)" strokeWidth="1" />
            <circle cx={X(hover)} cy={Y(series[hover])} r="4.5" fill={accent2} stroke="var(--card)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover != null && (
        <div style={{ position:'relative', marginTop:-6 }}>
          <div style={{ position:'absolute', left:`clamp(40px, ${(X(hover)/w)*100}%, calc(100% - 90px))`, transform:'translateX(-50%)',
            background:'var(--elevated)', border:'1px solid var(--border-strong)', borderRadius:8, padding:'6px 10px',
            fontSize:11.5, boxShadow:'var(--shadow-2)', whiteSpace:'nowrap', pointerEvents:'none' }}>
            <strong className="mono">{labels[hover]}</strong> · <span className="mono" style={{color:accent2}}>{series[hover]}</span>
            {planData && <span className="muted mono"> / plan {planData[hover]}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Grouped bars (plan vs fact) ---------- */
function BarPlanFact({ data, h = 220, keyName = 'name', actKey = 'rev', planKey = 'plan' }) {
  const wrap = useRef(null); const [w, setW] = useState(560);
  const id = useMemo(() => uid('bf'), []);
  useEffect(() => { const ro = new ResizeObserver(es => setW(es[0].contentRect.width)); if (wrap.current) ro.observe(wrap.current); return () => ro.disconnect(); }, []);
  const padL = 36, padB = 34, padT = 10, padR = 8;
  const max = Math.max(...data.flatMap(d => [d[actKey], d[planKey]])) * 1.1;
  const Y = v => padT + (1 - v / max) * (h - padT - padB);
  const groupW = (w - padL - padR) / data.length;
  const bw = Math.min(22, groupW * 0.28);
  return (
    <div ref={wrap} style={{ width:'100%' }}>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)"/><stop offset="100%" stopColor="#2563eb"/></linearGradient>
          <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.5"/><stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0.15"/></linearGradient>
        </defs>
        {[0,0.25,0.5,0.75,1].map((t,i) => { const y = padT + t*(h-padT-padB); return <line key={i} x1={padL} y1={y} x2={w-padR} y2={y} stroke="var(--grid-line)"/>; })}
        {data.map((d, i) => { const cx = padL + groupW * i + groupW/2; const ya = Y(d[actKey]); const yp = Y(d[planKey]); return (
          <g key={i}>
            <rect x={cx - bw - 3} y={yp} width={bw} height={h-padB-yp} rx="3" fill={`url(#${id}b)`} style={{ animation:`fadeUp .6s ${i*0.05}s ease both` }} />
            <rect x={cx + 3} y={ya} width={bw} height={h-padB-ya} rx="3" fill={`url(#${id}a)`} style={{ animation:`fadeUp .6s ${i*0.05+0.06}s ease both` }} />
            <text x={cx} y={h-12} textAnchor="middle" fontSize="10.5" fill="var(--text-2)">{String(d[keyName]).slice(0,9)}</text>
          </g>); })}
      </svg>
    </div>
  );
}

/* ---------- Horizontal region bars ---------- */
function RegionBars({ regions, onClick, activeId }) {
  const max = Math.max(...regions.map(r => r.rev));
  return (
    <div className="col gap-10">
      {regions.map((r, i) => {
        const active = activeId === r.id;
        return (
          <div key={r.id} className="clickable" onClick={() => onClick && onClick(r)}
            style={{ display:'grid', gridTemplateColumns:'92px 1fr 78px', alignItems:'center', gap:12,
              padding:'5px 8px', borderRadius:8, background: active ? 'var(--active)' : 'transparent', transition:'background .15s' }}>
            <span style={{ fontSize:13, fontWeight:600 }}>{r.name}</span>
            <div className="meter" style={{ height:9 }}>
              <span style={{ width:`${(r.rev/max)*100}%`, animation:`fadeIn .8s ${i*0.05}s ease both`,
                background: r.growth < 0 ? 'linear-gradient(90deg,var(--neg),#fb7185)' : 'linear-gradient(90deg,var(--accent),var(--accent-2))' }} />
            </div>
            <div className="row between gap-6">
              <span className="mono num" style={{ fontSize:12.5, fontWeight:600 }}>{r.rev}</span>
              <span className={`delta ${r.growth<0?'down':'up'}`} style={{ fontSize:11.5 }}>{r.growth>0?'+':''}{r.growth}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Donut ---------- */
function Donut({ data, size = 160, thickness = 22, center }) {
  const id = useMemo(() => uid('dn'), []);
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2, C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="row gap-20" style={{ alignItems:'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink:0 }}>
        <g transform={`rotate(-90 ${size/2} ${size/2})`}>
          {data.map((d, i) => { const frac = d.value/total; const dash = frac*C; const off = acc*C; acc += frac; return (
            <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={d.color} strokeWidth={thickness}
              strokeDasharray={`${dash} ${C-dash}`} strokeDashoffset={-off} strokeLinecap="butt"
              style={{ animation:`fadeIn .8s ${i*0.08}s ease both` }} />); })}
        </g>
        {center && <>
          <text x={size/2} y={size/2-2} textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--text)" fontFamily="var(--font-mono)">{center.value}</text>
          <text x={size/2} y={size/2+16} textAnchor="middle" fontSize="10.5" fill="var(--text-3)">{center.label}</text>
        </>}
      </svg>
      <div className="col gap-8" style={{ flex:1 }}>
        {data.map((d, i) => (
          <div key={i} className="row between gap-10">
            <span className="row gap-8" style={{ fontSize:12.5 }}><span style={{ width:9, height:9, borderRadius:3, background:d.color }} />{d.label}</span>
            <span className="mono num muted" style={{ fontSize:12 }}>{Math.round(d.value/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Gauge ---------- */
function Gauge({ value, max = 100, label, size = 150, color = 'var(--accent)' }) {
  const id = useMemo(() => uid('gg'), []);
  const r = size/2 - 14, C = Math.PI * r; // semicircle
  const frac = Math.min(value/max, 1);
  return (
    <svg width={size} height={size*0.62} viewBox={`0 0 ${size} ${size*0.62}`}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="var(--accent)"/><stop offset="100%" stopColor="var(--accent-2)"/></linearGradient></defs>
      <path d={`M14 ${size*0.5} A ${r} ${r} 0 0 1 ${size-14} ${size*0.5}`} fill="none" stroke="var(--surface)" strokeWidth="12" strokeLinecap="round" />
      <path d={`M14 ${size*0.5} A ${r} ${r} 0 0 1 ${size-14} ${size*0.5}`} fill="none" stroke={`url(#${id})`} strokeWidth="12" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C*(1-frac)} style={{ transition:'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)' }} />
      <text x={size/2} y={size*0.42} textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--text)" fontFamily="var(--font-mono)">{value}<tspan fontSize="13" fill="var(--text-3)">%</tspan></text>
      <text x={size/2} y={size*0.56} textAnchor="middle" fontSize="11" fill="var(--text-3)">{label}</text>
    </svg>
  );
}

/* ---------- Funnel ---------- */
function Funnel({ data }) {
  const max = data[0].value;
  return (
    <div className="col gap-4">
      {data.map((d, i) => { const pct = d.value/max; const prev = i? data[i-1].value : d.value; const drop = i? Math.round((1 - d.value/prev)*100):0; return (
        <div key={i} className="col gap-4">
          <div className="row between" style={{ fontSize:12.5 }}><span>{d.label}</span><span className="mono num muted">{d.value.toLocaleString()}</span></div>
          <div style={{ height:30, borderRadius:7, background:'var(--surface)', overflow:'hidden', position:'relative' }}>
            <div style={{ position:'absolute', inset:0, width:`${pct*100}%`, borderRadius:7,
              background:`linear-gradient(90deg, var(--accent), var(--accent-2))`, opacity: 0.35 + pct*0.55,
              animation:`fadeIn .7s ${i*0.08}s ease both` }} />
            {i>0 && <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:11, fontWeight:600, color:'var(--neg)' }}>−{drop}%</span>}
          </div>
        </div>); })}
    </div>
  );
}

/* ---------- Heatmap ---------- */
function Heatmap({ rows, cols, values }) {
  // values[r][c] 0..1
  const cell = (v) => `rgba(34,211,238,${0.08 + v*0.85})`;
  return (
    <div style={{ display:'grid', gridTemplateColumns:`88px repeat(${cols.length}, 1fr)`, gap:4, fontSize:11 }}>
      <div />
      {cols.map((c,i) => <div key={i} style={{ textAlign:'center', color:'var(--text-3)', fontWeight:600 }}>{c}</div>)}
      {rows.map((rname, r) => (
        <React.Fragment key={r}>
          <div style={{ color:'var(--text-2)', fontWeight:600, display:'flex', alignItems:'center' }}>{rname}</div>
          {cols.map((_, c) => (
            <div key={c} title={`${values[r][c].toFixed(2)}`} style={{ aspectRatio:'1.6', borderRadius:5, background:cell(values[r][c]),
              animation:`fadeIn .5s ${(r*cols.length+c)*0.012}s ease both`, border:'1px solid var(--border)' }} />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------- Mini bars (for widget previews) ---------- */
function MiniBars({ data = [40,65,52,78,60,88,72], color = 'var(--accent)', h = 70 }) {
  const max = Math.max(...data);
  return (
    <div className="row gap-6" style={{ alignItems:'flex-end', height:h }}>
      {data.map((v,i) => <div key={i} style={{ flex:1, height:`${(v/max)*100}%`, borderRadius:'4px 4px 2px 2px',
        background:`linear-gradient(180deg, var(--accent), var(--accent-2))`, opacity:0.55+0.45*(v/max), animation:`fadeUp .5s ${i*0.04}s ease both` }} />)}
    </div>
  );
}

Object.assign(window, { Sparkline, AreaChart, BarPlanFact, RegionBars, Donut, Gauge, Funnel, Heatmap, MiniBars });
