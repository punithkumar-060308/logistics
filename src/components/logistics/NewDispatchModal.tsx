import { useState } from 'react';
import type { Courier } from '@/lib/data';

interface NewDispatchModalProps {
  couriers: Courier[];
  onClose: () => void;
  onDispatch: (dest: string, prio: 'High' | 'Med' | 'Low', courier: string) => void;
  onToast: (msg: string, type: 'info' | 'ok' | 'warn' | 'err') => void;
}

export default function NewDispatchModal({ couriers, onClose, onDispatch, onToast }: NewDispatchModalProps) {
  const [dest, setDest] = useState('');
  const [prio, setPrio] = useState<'High' | 'Med' | 'Low'>('Med');
  const [courier, setCourier] = useState('Auto');

  const handleSubmit = () => {
    if (!dest.trim()) { onToast('Please enter a destination', 'err'); return; }
    let assignedCourier = courier;
    if (courier === 'Auto') {
      const active = couriers.filter((c) => c.status === 'active');
      assignedCourier = active.sort((a, b) => b.fair - a.fair)[0]?.name || 'Auto';
    }
    onDispatch(dest, prio, assignedCourier);
  };

  return (
    <div className="fixed inset-0 bg-[rgba(6,12,24,0.85)] z-[1000] flex items-center justify-center" onClick={onClose}>
      <div className="bg-hq-panel border border-hq-border2 p-5 min-w-[360px] max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="float-right bg-transparent border border-hq-border text-hq-txt2 px-2.5 py-1 cursor-pointer font-[family-name:var(--font-jetbrains)] text-[10px] hover:border-hq-red hover:text-hq-red transition-all">✕ CLOSE</button>
        <h3 className="font-[family-name:var(--font-space)] text-[14px] text-hq-cyan mb-3.5" style={{ textShadow: 'var(--glow-cyan)' }}>⊕ NEW DISPATCH</h3>

        <div className="mb-3">
          <label className="block font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 tracking-[2px] uppercase mb-1.5">Destination</label>
          <input value={dest} onChange={(e) => setDest(e.target.value)} placeholder="e.g. Sector 7 Logistics Hub, NJ" className="w-full bg-hq-bg border border-hq-border text-hq-txt px-2.5 py-[7px] font-[family-name:var(--font-jetbrains)] text-[11px] outline-none focus:border-hq-cyan transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <label className="block font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 tracking-[2px] uppercase mb-1.5">Priority</label>
            <select value={prio} onChange={(e) => setPrio(e.target.value as 'High' | 'Med' | 'Low')} className="w-full bg-hq-bg border border-hq-border text-hq-txt px-2.5 py-[7px] font-[family-name:var(--font-jetbrains)] text-[11px] outline-none focus:border-hq-cyan">
              <option value="High">High</option>
              <option value="Med">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="block font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 tracking-[2px] uppercase mb-1.5">Assign Courier</label>
            <select value={courier} onChange={(e) => setCourier(e.target.value)} className="w-full bg-hq-bg border border-hq-border text-hq-txt px-2.5 py-[7px] font-[family-name:var(--font-jetbrains)] text-[11px] outline-none focus:border-hq-cyan">
              <option value="Auto">Auto-Assign</option>
              {couriers.filter((c) => c.status === 'active').map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="block font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 tracking-[2px] uppercase mb-1.5">Package Notes</label>
          <input placeholder="Fragile, perishable, oversized..." className="w-full bg-hq-bg border border-hq-border text-hq-txt px-2.5 py-[7px] font-[family-name:var(--font-jetbrains)] text-[11px] outline-none focus:border-hq-cyan transition-colors" />
        </div>

        <button onClick={handleSubmit} className="w-full p-3 bg-[linear-gradient(135deg,rgba(0,229,255,.12),rgba(0,255,157,.06))] border border-hq-cyan text-hq-cyan font-[family-name:var(--font-space)] text-[11px] tracking-[2px] uppercase cursor-pointer transition-all hover:bg-[rgba(0,229,255,0.2)] hover:shadow-[var(--glow-cyan)]">
          ⚡ DISPATCH NOW
        </button>
      </div>
    </div>
  );
}
