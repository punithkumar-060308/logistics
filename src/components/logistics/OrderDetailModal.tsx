import type { Order } from '@/lib/data';
import { fmtTime } from '@/lib/data';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onReassign: (id: string) => void;
  onMarkDelivered: (id: string) => void;
}

export default function OrderDetailModal({ order, onClose, onReassign, onMarkDelivered }: OrderDetailModalProps) {
  if (!order) return null;

  const statClass: Record<string, { bg: string; border: string; text: string }> = {
    Delayed: { bg: 'bg-[rgba(255,170,0,0.12)]', border: 'border-hq-amber', text: 'text-hq-amber' },
    'In-Transit': { bg: 'bg-[rgba(0,255,157,0.08)]', border: 'border-hq-green', text: 'text-hq-green' },
    Dispatching: { bg: 'bg-[rgba(0,229,255,0.08)]', border: 'border-hq-cyan', text: 'text-hq-cyan' },
    Pending: { bg: 'bg-[rgba(124,77,255,0.12)]', border: 'border-hq-purple', text: 'text-hq-purple' },
  };

  const prioClass: Record<string, { bg: string; border: string; text: string }> = {
    High: { bg: 'bg-[rgba(255,61,90,0.12)]', border: 'border-hq-red', text: 'text-hq-red' },
    Med: { bg: 'bg-[rgba(0,229,255,0.08)]', border: 'border-hq-cyan', text: 'text-hq-cyan' },
    Low: { bg: 'bg-[rgba(0,255,157,0.08)]', border: 'border-hq-green', text: 'text-hq-green' },
  };

  const sc = statClass[order.status] || statClass.Dispatching;
  const pc = prioClass[order.prio];

  return (
    <div className="fixed inset-0 bg-[rgba(6,12,24,0.85)] z-[1000] flex items-center justify-center" onClick={onClose}>
      <div className="bg-hq-panel border border-hq-border2 p-5 min-w-[360px] max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="float-right bg-transparent border border-hq-border text-hq-txt2 px-2.5 py-1 cursor-pointer font-[family-name:var(--font-jetbrains)] text-[10px] hover:border-hq-red hover:text-hq-red transition-all">✕ CLOSE</button>
        <h3 className="font-[family-name:var(--font-space)] text-[14px] text-hq-cyan mb-3.5" style={{ textShadow: 'var(--glow-cyan)' }}>ORDER {order.id}</h3>

        {[
          { label: 'STATUS', val: <span className={`px-2 py-0.5 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[1px] rounded-sm ${sc.bg} border ${sc.border} ${sc.text}`}>{order.status}</span> },
          { label: 'PRIORITY', val: <span className={`px-2 py-0.5 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[1px] rounded-sm ${pc.bg} border ${pc.border} ${pc.text}`}>{order.prio}</span> },
          { label: 'DESTINATION', val: <span className="font-semibold">{order.dest}</span> },
          { label: 'ASSIGNED COURIER', val: <span className="font-semibold">{order.courier}</span> },
          { label: 'TIME ELAPSED', val: <span className={`font-[family-name:var(--font-jetbrains)] text-[11px] ${order.status === 'Delayed' ? 'text-hq-amber' : 'text-hq-txt2'}`} style={order.status === 'Delayed' ? { animation: 'pdot 1.5s infinite' } : undefined}>{fmtTime(order.elapsed)}</span> },
        ].map(({ label, val }) => (
          <div key={label} className="flex justify-between py-[7px] border-b border-[rgba(26,45,82,0.5)] text-[12px]">
            <span className="text-hq-txt3 font-[family-name:var(--font-jetbrains)] text-[10px] tracking-[1px]">{label}</span>
            {val}
          </div>
        ))}

        <div className="mt-3.5 flex gap-2">
          <button
            onClick={() => onReassign(order.id)}
            className="flex-1 p-2 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[1px] uppercase cursor-pointer border border-hq-cyan text-hq-cyan bg-[rgba(0,229,255,0.07)] hover:bg-[rgba(0,229,255,0.15)] transition-all"
          >
            🔄 Reassign
          </button>
          <button
            onClick={() => onMarkDelivered(order.id)}
            className="flex-1 p-2 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[1px] uppercase cursor-pointer border border-hq-green text-hq-green bg-[rgba(0,255,157,0.07)] hover:bg-[rgba(0,255,157,0.15)] transition-all"
          >
            ✓ Mark Delivered
          </button>
        </div>
      </div>
    </div>
  );
}
