import React from 'react';

/** Filled, glass-backed app icons that stay legible at small navigation sizes. */
export function TabIcon({name}:{name:'home'|'library'|'browse'|'progress'|'settings'}) {
  const tile = {
    home: ['#e5f1ff', '#c8e0ff'],
    library: ['#e3fbfc', '#b8edf0'],
    browse: ['#e9f1ff', '#d2e2ff'],
    progress: ['#e8f7ee', '#c8eed7'],
    settings: ['#f0ebff', '#ddd4ff']
  } as const;
  const [top, bottom] = tile[name];
  const icon = name === 'home'
    ? <><path fill="#3168c8" d="m6.2 15.1 9.8-8 9.8 8v10.2a1.7 1.7 0 0 1-1.7 1.7h-5.2v-7.2h-5.8V27H8a1.7 1.7 0 0 1-1.8-1.7z"/><path fill="#ff6985" d="m4.5 14.7 10.4-8.9a1.8 1.8 0 0 1 2.3 0l2.2 1.9V6.3a1.4 1.4 0 0 1 2.8 0v3.8l2.2 1.9a1.8 1.8 0 0 1-2.3 2.7L16 9.5l-8.6 7.2a1.8 1.8 0 1 1-2.9-2z"/></>
    : name === 'library'
      ? <><path fill="#227b70" d="M6.1 9.1a2 2 0 0 1 2-2h3.7v18.4H8.1a2 2 0 0 1-2-2z"/><path fill="#4773d3" d="M13.2 6.1h4v19.4h-4z"/><path fill="#43bfd0" d="m19 7.2 3.8-.8 3.4 17.8-3.8.8z"/><path fill="#eaffff" d="M7.4 11h2.9v1.7H7.4zm6.7-2h2v1.7h-2zm6.8 1.2 1.7-.4.4 2-1.7.4z"/><path fill="#38535b" d="M5.2 26h21.6a1.3 1.3 0 0 1 0 2.6H5.2a1.3 1.3 0 0 1 0-2.6z"/></>
      : name === 'browse'
        ? <><path fill="#428fca" d="M16 4a12 12 0 1 1 0 24 12 12 0 0 1 0-24z"/><path fill="#eaf5ff" d="M16 7a9 9 0 1 1 0 18 9 9 0 0 1 0-18z"/><path fill="#ff658a" d="m21.7 9.1-3.5 9.2-8.9 4.2 3.7-9.5z"/><path fill="#306bbd" d="m21.7 9.1-8.7 3.9 5.2 5.3z"/><path fill="#f4fbff" d="M17.6 16a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0z"/></>
        : name === 'progress'
          ? <><path fill="#2e9a68" d="M6 26V16h5v10zm7 0V9h5v17zm7 0V5h5v21z"/><path fill="#f1fff6" d="M7.5 18h2v6h-2zm7-7h2v13h-2zm7-4h2v17h-2z"/><path fill="#65c895" d="M5 27h21v2H5z"/></>
          : <><path fill="#7e60be" d="M13.4 3.6h5.2l.8 3.2 2.3 1 2.9-1.5 3.7 3.7-1.5 2.9 1 2.3 3.2.8v5.2l-3.2.8-1 2.3 1.5 2.9-3.7 3.7-2.9-1.5-2.3 1-.8 3.2h-5.2l-.8-3.2-2.3-1-2.9 1.5-3.7-3.7 1.5-2.9-1-2.3-3.2-.8V15l3.2-.8 1-2.3-1.5-2.9 3.7-3.7 2.9 1.5 2.3-1z" transform="translate(1 1) scale(.88)"/><path fill="#f6f3ff" d="M16 10.1a5.9 5.9 0 1 1 0 11.8 5.9 5.9 0 0 1 0-11.8z"/><path fill="#a78be2" d="M16 12.9a3.1 3.1 0 1 1 0 6.2 3.1 3.1 0 0 1 0-6.2z"/></>;
  return <svg className="dimensional-icon" viewBox="0 0 32 32" aria-hidden="true">
    <defs><linearGradient id={`glass-${name}`} x1="0" y1="0" x2=".9" y2="1"><stop stopColor={top}/><stop offset="1" stopColor={bottom}/></linearGradient></defs>
    <rect x="1.5" y="1.5" width="29" height="29" rx="10" fill={`url(#glass-${name})`}/>
    <path d="M4 10Q4 3.8 10.5 3.8H22" fill="none" stroke="#fff" strokeOpacity=".72" strokeWidth="1.6" strokeLinecap="round"/>
    {icon}
  </svg>;
}
