interface TopbarProps {
  title: string;
  liveCount: number;
  onNavigate: (screen: 'orders' | 'settings') => void;
}

export default function Topbar({ title, liveCount, onNavigate }: TopbarProps) {
  return (
    <div className="h-[50px] bg-hq-panel border-b border-hq-border flex items-center px-[18px] gap-3.5 shrink-0">
      <div className="font-[family-name:var(--font-space)] text-[13px] font-bold tracking-[0.5px] min-w-[160px]">
        {title}
      </div>

      <div className="flex items-center gap-1.5 font-[family-name:var(--font-jetbrains)] text-[10px] tracking-[1px] text-hq-green">
        <div className="w-[7px] h-[7px] rounded-full bg-hq-green shadow-[var(--glow-green)]" style={{ animation: 'pdot 2s infinite' }} />
        SYSTEM ONLINE
      </div>

      <div className="font-[family-name:var(--font-jetbrains)] text-[10px] text-hq-txt2 tracking-[1px]">
        <span className="text-hq-cyan">{liveCount}</span> LIVE ORDERS
      </div>

      <div className="ml-auto flex items-center gap-1.5 bg-hq-card border border-hq-border px-2.5 py-1.5 min-w-[200px]">
        <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" /></svg>
        <input
          type="text"
          placeholder="Search orders, couriers..."
          className="bg-transparent border-none outline-none text-hq-txt font-[family-name:var(--font-jetbrains)] text-[10px] w-full placeholder:text-hq-txt3"
        />
      </div>

      <button
        onClick={() => onNavigate('orders')}
        className="flex items-center gap-1.5 bg-[rgba(255,61,90,0.12)] border border-hq-red text-hq-red px-2.5 py-1.5 font-[family-name:var(--font-space)] text-[9px] tracking-[1px] cursor-pointer"
        style={{ animation: 'alert-pulse 1.5s infinite' }}
      >
        ⚠ PRIORITY ALERT
      </button>

      <div className="w-8 h-8 flex items-center justify-center border border-hq-border bg-hq-card text-hq-txt2 cursor-pointer transition-all hover:text-hq-cyan hover:border-hq-cyan text-[12px]">
        🔔
      </div>
      <div
        onClick={() => onNavigate('settings')}
        className="w-8 h-8 flex items-center justify-center border border-hq-border bg-hq-card text-hq-txt2 cursor-pointer transition-all hover:text-hq-cyan hover:border-hq-cyan text-[12px]"
      >
        ⚙
      </div>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-hq-purple to-hq-cyan flex items-center justify-center text-[11px] font-bold">
        AD
      </div>
    </div>
  );
}
