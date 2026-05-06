import type { Screen } from '@/lib/data';
import { Link } from '@tanstack/react-router';

const NAV_ITEMS: { id: Screen; label: string; icon: React.ReactNode }[] = [
  {
    id: 'operations', label: 'Operations',
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0"><rect x="3" y="3" width="7" height="7" strokeWidth="1.5" /><rect x="14" y="3" width="7" height="7" strokeWidth="1.5" /><rect x="3" y="14" width="7" height="7" strokeWidth="1.5" /><rect x="14" y="14" width="7" height="7" strokeWidth="1.5" /></svg>,
  },
  {
    id: 'dispatch', label: 'Dispatch',
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0"><path d="M3 12h18M12 3l9 9-9 9" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    id: 'orders', label: 'Orders',
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    id: 'fleet', label: 'Fleet',
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0"><circle cx="12" cy="7" r="4" strokeWidth="1.5" /><path d="M4 21v-1a8 8 0 0116 0v1" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    id: 'ai', label: 'AI Dispatch',
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0"><path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.7-1.388 2.43l-3.318-.664a9 9 0 00-3.996 0l-3.318.664c-1.418.27-2.388-1.43-1.388-2.43L5 14.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    id: 'settings', label: 'Settings',
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeWidth="1.5" /><circle cx="12" cy="12" r="3" strokeWidth="1.5" /></svg>,
  },
];

interface SidebarProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onNewDispatch: () => void;
  logCount: number;
}

export default function Sidebar({ activeScreen, onNavigate, onNewDispatch, logCount }: SidebarProps) {
  return (
    <nav className="w-[220px] bg-hq-panel border-r border-hq-border flex flex-col shrink-0">
      <div className="px-4 pt-[18px] pb-[14px] border-b border-hq-border">
        <div className="font-[family-name:var(--font-space)] text-[15px] font-bold text-hq-cyan tracking-wider" style={{ textShadow: 'var(--glow-cyan)' }}>
          LOGISTICS HQ
        </div>
        <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 tracking-[2px] mt-0.5">
          TERMINAL 04-A
        </div>
      </div>

      <div className="flex-1 py-2.5">
        {NAV_ITEMS.map((item) => (
          <div
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-2.5 px-4 py-2.5 cursor-pointer text-[12px] font-semibold tracking-[0.5px] uppercase border-l-2 transition-all duration-200
              ${activeScreen === item.id
                ? 'text-hq-cyan border-l-hq-cyan bg-[rgba(0,229,255,0.07)]'
                : 'text-hq-txt2 border-l-transparent hover:text-hq-txt hover:bg-[rgba(0,229,255,0.04)]'
              }`}
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </div>

      <button
        onClick={onNewDispatch}
        className="mx-3 mb-2.5 p-2.5 bg-[linear-gradient(135deg,rgba(0,229,255,.12),rgba(0,229,255,.04))] border border-hq-cyan text-hq-cyan font-[family-name:var(--font-space)] text-[10px] tracking-[2px] uppercase cursor-pointer text-center transition-all duration-200 hover:bg-[rgba(0,229,255,0.18)] hover:shadow-[var(--glow-cyan)]"
      >
        ⊕ NEW DISPATCH
      </button>

      <Link
        to="/control"
        className="mx-3 mb-2.5 p-2.5 border border-hq-amber text-hq-amber font-[family-name:var(--font-space)] text-[10px] tracking-[2px] uppercase text-center transition-all duration-200 hover:bg-[rgba(255,176,32,0.1)]"
      >
        ▶ LIVE CONTROL
      </Link>

      <div className="px-4 py-2.5 border-t border-hq-border">
        <div className="flex items-center gap-2 py-1.5 text-hq-txt3 text-[11px] cursor-pointer transition-colors hover:text-hq-txt2">
          📋 Logs (<span>{logCount}</span>)
        </div>
        <div
          onClick={() => onNavigate('ai')}
          className="flex items-center gap-2 py-1.5 text-hq-txt3 text-[11px] cursor-pointer transition-colors hover:text-hq-txt2"
        >
          🤖 AI Assistant
        </div>
      </div>
    </nav>
  );
}
