export function Icon({ name, size = 20 }: { name: 'fish' | 'search' | 'settings' | 'close' | 'capture' | 'list' | 'pin' | 'arrow' | 'shield' | 'pause'; size?: number }) {
  const paths = {
    fish: <><path d="M4 12C8 3 17 5 21 12c-4 7-13 9-17 0Z"/><path d="m5 12-4-5v10l4-5M10 6l3-3 2 3M10 18l3 3 2-3"/><circle cx="16.5" cy="10.5" r=".7"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    settings: <><path d="m9 3-1 3-3 1-2 3 2 2-1 3 3 3h3l2 3 3-2 3-1 1-3 2-3-2-2V7l-3-2h-3l-2-2Z"/><circle cx="12" cy="12" r="3"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>, capture: <><path d="M3 7h5l2-3h4l2 3h5v13H3Z"/><circle cx="12" cy="13" r="4"/></>,
    list: <><path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1"/></>,
    pin: <><path d="m9 3 9 3-3 5v5l-9-3 3-4V3ZM10 15l-3 7"/></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>, shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/></>, pause: <path d="M8 5v14M16 5v14"/>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
