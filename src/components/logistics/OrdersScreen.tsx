import { useState, useMemo } from 'react';
import KPICard from './KPICard';
import type { Order, Alert } from '@/lib/data';
import { fmtTime } from '@/lib/data';

interface OrdersScreenProps {
  orders: Order[];
  alerts: Alert[];
  onOrderDetail: (id: string) => void;
  onExportCSV: () => void;
}

const PER_PAGE = 5;

export default function OrdersScreen({ orders, alerts, onOrderDetail, onExportCSV }: OrdersScreenProps) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPrio, setFilterPrio] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchS = filterStatus === 'all' || o.status === filterStatus;
      const matchP = filterPrio === 'all' || o.prio === filterPrio;
      const matchQ = !searchQ || o.id.toLowerCase().includes(searchQ.toLowerCase()) || o.dest.toLowerCase().includes(searchQ.toLowerCase()) || o.courier.toLowerCase().includes(searchQ.toLowerCase());
      return matchS && matchP && matchQ;
    });
  }, [orders, filterStatus, filterPrio, searchQ]);

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const page = Math.min(currentPage, pages || 1);
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const prioClass: Record<string, string> = { High: 'hi', Med: 'me', Low: 'lo' };
  const statClass: Record<string, string> = { Delayed: 'dl', 'In-Transit': 'it', Dispatching: 'dp', Pending: 'pe' };

  const prioColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    hi: { bg: 'bg-[rgba(255,61,90,0.12)]', border: 'border-hq-red', text: 'text-hq-red', dot: 'bg-hq-red shadow-[var(--glow-red)]' },
    me: { bg: 'bg-[rgba(0,229,255,0.08)]', border: 'border-hq-cyan', text: 'text-hq-cyan', dot: 'bg-hq-cyan' },
    lo: { bg: 'bg-[rgba(0,255,157,0.08)]', border: 'border-hq-green', text: 'text-hq-green', dot: 'bg-hq-green' },
  };

  const statColors: Record<string, { bg: string; border: string; text: string }> = {
    dl: { bg: 'bg-[rgba(255,170,0,0.12)]', border: 'border-hq-amber', text: 'text-hq-amber' },
    it: { bg: 'bg-[rgba(0,255,157,0.08)]', border: 'border-hq-green', text: 'text-hq-green' },
    dp: { bg: 'bg-[rgba(0,229,255,0.08)]', border: 'border-hq-cyan', text: 'text-hq-cyan' },
    pe: { bg: 'bg-[rgba(124,77,255,0.12)]', border: 'border-hq-purple', text: 'text-hq-purple' },
  };

  const active = orders.filter((o) => o.status !== 'Delivered').length;
  const delayed = orders.filter((o) => o.status === 'Delayed').length;
  const hiprio = orders.filter((o) => o.prio === 'High' && o.status !== 'Delivered').length;

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-[18px]">
        <KPICard label="Active Deliveries" value={String(active).padStart(2, '0')} color="cyan" delta="▲ +12%" />
        <KPICard label="Delayed Orders" value={String(delayed).padStart(2, '0')} color="amber" delta="▲ +2%" />
        <KPICard label="High Priority" value={String(hiprio).padStart(2, '0')} color="red" badge="URGENT" />
        <KPICard label="Avg Lead Time" value="24m" color="green" delta="▼ -4m" deltaNeg />
      </div>

      <div className="grid gap-3.5" style={{ gridTemplateColumns: '1fr 300px' }}>
        <div className="bg-hq-card border border-hq-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hq-border">
            <div className="font-[family-name:var(--font-space)] text-[12px] flex items-center gap-2 tracking-[0.3px]">
              📦 Active Order Tracker
            </div>
            <div className="flex gap-1.5">
              {['all', 'Delayed', 'In-Transit', 'Dispatching', 'Pending'].map((s) => (
                <button
                  key={s}
                  onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
                  className={`px-2.5 py-1 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[1px] uppercase cursor-pointer border transition-all
                    ${filterStatus === s ? 'border-hq-cyan text-hq-cyan bg-[rgba(0,229,255,0.07)]' : 'border-hq-border bg-hq-card2 text-hq-txt2 hover:border-hq-cyan hover:text-hq-cyan'}`}
                >
                  {s === 'all' ? 'ALL' : s.toUpperCase()}
                </button>
              ))}
              <button
                onClick={onExportCSV}
                className="px-2.5 py-1 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[1px] uppercase cursor-pointer border border-hq-border bg-hq-card2 text-hq-txt2 hover:border-hq-cyan hover:text-hq-cyan transition-all"
              >
                ⬇ CSV
              </button>
            </div>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Order ID', 'Priority', 'Destination', 'Courier', 'Elapsed', 'Status'].map((h) => (
                  <th key={h} className="px-3.5 py-2.5 text-left font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] text-hq-txt3 uppercase border-b border-hq-border">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.map((o) => {
                const pc = prioColors[prioClass[o.prio]];
                const sc = statColors[statClass[o.status] || 'dp'];
                return (
                  <tr key={o.id} className="hover:bg-[rgba(0,229,255,0.025)]">
                    <td className="px-3.5 py-3 border-b border-[rgba(26,45,82,0.4)]">
                      <span onClick={() => onOrderDetail(o.id)} className="font-[family-name:var(--font-jetbrains)] text-[11px] text-hq-cyan cursor-pointer hover:shadow-[var(--glow-cyan)]">{o.id}</span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-[rgba(26,45,82,0.4)]">
                      <span className={`inline-flex items-center gap-1 px-[7px] py-0.5 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[1px] rounded-sm ${pc.bg} border ${pc.border} ${pc.text}`}>
                        <span className={`w-[5px] h-[5px] rounded-full ${pc.dot}`} />
                        {o.prio}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-[rgba(26,45,82,0.4)] text-hq-txt2 text-[12px] max-w-[160px]">{o.dest}</td>
                    <td className="px-3.5 py-3 border-b border-[rgba(26,45,82,0.4)]">
                      <div className="flex items-center gap-[7px]">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-hq-purple to-hq-cyan flex items-center justify-center text-[9px] font-bold">
                          {o.courier.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-[12px]">{o.courier}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 border-b border-[rgba(26,45,82,0.4)]">
                      <span className={`font-[family-name:var(--font-jetbrains)] text-[11px] text-hq-txt2 ${o.status === 'Delayed' ? 'text-hq-amber' : ''}`} style={o.status === 'Delayed' ? { animation: 'pdot 1.5s infinite' } : undefined}>
                        {fmtTime(o.elapsed)}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-[rgba(26,45,82,0.4)]">
                      <span className={`px-2 py-0.5 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[1px] rounded-sm ${sc.bg} border ${sc.border} ${sc.text}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="px-3.5 py-2.5 flex items-center justify-between border-t border-hq-border font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3">
            <span>Showing {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
            <div className="flex gap-1.5">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2.5 py-1 font-[family-name:var(--font-jetbrains)] text-[9px] cursor-pointer border transition-all
                    ${page === i + 1 ? 'border-hq-cyan text-hq-cyan bg-[rgba(0,229,255,0.08)]' : 'bg-hq-card2 border-hq-border text-hq-txt2 hover:border-hq-cyan hover:text-hq-cyan'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts panel */}
        <div className="bg-hq-card border border-hq-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hq-border">
            <div className="font-[family-name:var(--font-space)] text-[12px] flex items-center gap-2 tracking-[0.3px]">
              ⚠ Active Alerts
              <span className="bg-hq-red text-foreground text-[8px] px-1.5 py-0.5 font-[family-name:var(--font-jetbrains)] tracking-[1px]">{alerts.length} NEW</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-3">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`border-l-[3px] px-3 py-2.5 ${a.type === 'r' ? 'border-l-hq-red bg-[rgba(255,61,90,0.04)]' : a.type === 'a' ? 'border-l-hq-amber bg-[rgba(255,170,0,0.04)]' : a.type === 'g' ? 'border-l-hq-green bg-[rgba(0,255,157,0.04)]' : 'border-l-hq-border bg-hq-card2'}`}
              >
                <div className={`text-[11px] font-semibold mb-1 tracking-[0.3px] ${a.type === 'r' ? 'text-hq-red' : a.type === 'a' ? 'text-hq-amber' : 'text-hq-txt2'}`}>
                  {a.title}
                </div>
                <div className="text-[11px] text-hq-txt2 leading-relaxed">{a.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
