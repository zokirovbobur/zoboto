/* ============================================================
   FINPORT BLOG — icon set (stroke, 24x24)
   ============================================================ */
const ICON_PATHS = {
  book:'M4 5a2 2 0 0 1 2-2h11v16H6a2 2 0 0 0-2 2zM17 3a2 2 0 0 1 2 2v12',
  scale:'M12 4v16M5 8l-3 6h6zM19 8l-3 6h6zM5 8l7-2 7 2M7 20h10',
  card:'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18M7 15h4',
  piggy:'M4 12a6 5 0 0 1 6-5h3a6 5 0 0 1 6 5 6 5 0 0 1-2 3.7V19h-3v-2h-2v2H7v-2.2A6 5 0 0 1 4 12zM4 11H2.5M15 9.5h.5',
  wallet:'M3 7a2 2 0 0 1 2-2h12v3M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7H6a2 2 0 0 1-3-1.7M17 13h.01',
  phone:'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2',
  shield:'M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6zM9 12l2 2 4-4',
  briefcase:'M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1M3 12h18',
  chart:'M4 4v16h16M8 16v-4M12 16V9M16 16v-7',
  hash:'M4 9h16M4 15h16M9 4l-2 16M17 4l-2 16',
  heart:'M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 7a3.7 3.7 0 0 1 7-1.3C19 10.4 12 20 12 20z',
  swap:'M7 7h11l-3-3M17 17H6l3 3M4 12h16',
  coins:'M8 7a4 2.2 0 1 0 0 0M4 7v4c0 1.2 1.8 2.2 4 2.2s4-1 4-2.2V7M12 13a4 2.2 0 1 0 0 0M12 13v4c0 1.2 1.8 2.2 4 2.2s4-1 4-2.2v-4',
  target:'M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M12 12h.01',
  check2:'M9 11l3 3L20 6M4 12v6a2 2 0 0 0 2 2h12',
  search:'M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M21 21l-4.3-4.3',
  bookmark:'M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17l-6-4-6 4z',
  clock:'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 7v5l3 2',
  arrow:'M5 12h14M13 6l6 6-6 6',
  arrowRight:'M5 12h14M13 6l6 6-6 6',
  arrowLeft:'M19 12H5M11 6l-6 6 6 6',
  chevron:'M9 6l6 6-6 6',
  chevronDown:'M6 9l6 6 6-6',
  star:'M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.4l6-.9z',
  check:'M5 12l5 5L20 7',
  close:'M6 6l12 12M18 6L6 18',
  menu:'M4 7h16M4 12h16M4 17h16',
  user:'M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M5 20a7 7 0 0 1 14 0',
  shieldCheck:'M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6zM9 12l2 2 4-4',
  warn:'M12 3l9 16H3zM12 10v4M12 17h.01',
  bulb:'M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.6.6-1 1.2-1 2H9c0-.8-.4-1.4-1-2A6 6 0 0 1 12 3z',
  doc:'M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v4h4M9 13h6M9 17h6',
  flag:'M5 21V4M5 4h12l-2 4 2 4H5',
  link:'M10 13a4 4 0 0 0 5.7 0l2-2A4 4 0 0 0 12 5.3l-1 1M14 11a4 4 0 0 0-5.7 0l-2 2A4 4 0 0 0 12 18.7l1-1',
  telegram:'M21 4L3 11l5 2 2 6 3-4 5 4z',
  instagram:'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM17 7h.01',
  youtube:'M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM10 9l5 3-5 3z',
  globe:'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
};
function Icon({name, size=22, stroke=1.7, fill="none", className="", style={}}){
  const d = ICON_PATHS[name] || ICON_PATHS.doc;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} className={className} style={style}
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.split('M').filter(Boolean).map((seg,i)=><path key={i} d={'M'+seg}/>)}
    </svg>
  );
}

/* Islamic 8-point geometric tile used as subtle background */
const GEO_SVG = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='54' height='54' viewBox='0 0 54 54'>
   <g fill='none' stroke='%230C2340' stroke-width='1' stroke-opacity='0.12'>
   <path d='M27 4 L34 11 L43 11 L43 20 L50 27 L43 34 L43 43 L34 43 L27 50 L20 43 L11 43 L11 34 L4 27 L11 20 L11 11 L20 11 Z'/>
   <path d='M27 14 L40 27 L27 40 L14 27 Z'/>
   </g></svg>`
).replace(/%23/g,'%23');

document.documentElement.style.setProperty('--geo', `url("data:image/svg+xml,${GEO_SVG}")`);

/* Logo mark — abstract emerald "port/anchor" diamond on navy */
function LogoMark({size=34}){
  return (
    <span className="logo-mark" style={{width:size,height:size}}>
      <svg width={size*0.62} height={size*0.62} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l8 8-8 8-8-8z" stroke="#43C997"/>
        <path d="M12 8.5l3.5 3.5L12 15.5 8.5 12z" fill="#43C997" stroke="none"/>
      </svg>
    </span>
  );
}

Object.assign(window,{Icon, LogoMark, ICON_PATHS});
