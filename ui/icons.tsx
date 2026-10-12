import React from 'react';
/** Small local vector assets with depth; no remote icon fonts or animations. */
export function TabIcon({name}:{name:'home'|'library'|'browse'|'settings'}) {
 const colors={home:['#e6b268','#b16c35'],library:['#80b595','#376f58'],browse:['#84b3dc','#376ca6'],settings:['#c1b3d4','#6d6084']} as const;
 const [light,dark]=colors[name];const gradient='nav-'+name;
 return <svg className="dimensional-icon" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id={gradient} x2="0.8" y2="1"><stop stopColor={light}/><stop offset="1" stopColor={dark}/></linearGradient></defs>
  <rect x="2" y="2" width="28" height="28" rx="9" fill={`url(#${gradient})`} stroke="#ffffff55" strokeWidth=".6"/>
  <path d="M6 10Q6 5 12 5h10" fill="none" stroke="#ffffff55" strokeWidth="1"/>
  {name==='home'&&<><path d="m7 15 9-8 9 8v10H7Z" fill="#fff3df"/><path d="M13 19h6v6h-6" fill={dark}/><path d="m6 15 10-9 10 9" fill="none" stroke="#ffd8a4" strokeWidth="2"/></>}
  {name==='library'&&<><rect x="7" y="9" width="5" height="16" rx="1.5" fill="#f4e8c9"/><rect x="13" y="7" width="5" height="18" rx="1.5" fill="#e4d8ed"/><path d="m20 10 4-1 3 15-4 1Z" fill="#d7e6ee"/><path d="M8 12h3m3-2h3M6 26h22" stroke={dark} strokeWidth="1"/></>}
  {name==='browse'&&<><circle cx="16" cy="16" r="10" fill="#f0f4f2"/><circle cx="16" cy="16" r="8" fill="#d5e9ed"/><path d="m21 10-3 9-7 3 3-9Z" fill="#d97962"/><path d="m21 10-7 3 4 6Z" fill="#fffaf0"/><circle cx="16" cy="16" r="1.5" fill={dark}/></>}
  {name==='settings'&&<><path d="m13 7 6 0 1 3 3 1 2 5-2 3-1 3-5 3-3-2-3-1-3-5 2-3 1-3Z" fill="#ede8f3"/><circle cx="16" cy="16" r="6" fill={dark}/><circle cx="16" cy="16" r="3" fill="#d3c3e3"/></>}
 </svg>;
}
