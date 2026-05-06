import { useRef } from 'react';

interface SettingsScreenProps {
  onRunOptimization: () => void;
  onToast: (msg: string, type: 'info' | 'ok' | 'warn' | 'err') => void;
  onEmergencyStop: () => void;
}

function Slider({ label, sub, id, min, max, defaultValue, suffix }: { label: string; sub: string; id: string; min: number; max: number; defaultValue: number; suffix?: string }) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const pct = ((defaultValue - min) / (max - min)) * 100;

  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <div className="text-[13px] text-hq-txt">{label}</div>
        <div className="text-[10px] text-hq-txt3 mt-px">{sub}</div>
      </div>
      <div className="flex items-center gap-2.5">
        <input
          type="range"
          min={min}
          max={max}
          defaultValue={defaultValue}
          style={{ '--pct': `${pct}%` } as React.CSSProperties}
          onInput={(e) => {
            const el = e.currentTarget;
            const v = Number(el.value);
            const p = ((v - min) / (max - min)) * 100;
            el.style.setProperty('--pct', `${p}%`);
            if (spanRef.current) spanRef.current.textContent = suffix ? `${v}${suffix}` : `${v}%`;
          }}
        />
        <span ref={spanRef} className="font-[family-name:var(--font-jetbrains)] text-[10px] text-hq-cyan w-[40px] text-right">
          {suffix ? `${defaultValue}${suffix}` : `${defaultValue}%`}
        </span>
      </div>
    </div>
  );
}

function Toggle({ label, sub, defaultChecked, onChange }: { label: string; sub: string; defaultChecked: boolean; onChange?: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <div className="text-[13px] text-hq-txt">{label}</div>
        <div className="text-[10px] text-hq-txt3 mt-px">{sub}</div>
      </div>
      <label className="tg-switch">
        <input type="checkbox" defaultChecked={defaultChecked} onChange={(e) => onChange?.(e.target.checked)} />
        <div className="tg-track" />
      </label>
    </div>
  );
}

export default function SettingsScreen({ onRunOptimization, onToast, onEmergencyStop }: SettingsScreenProps) {
  return (
    <div>
      <div className="mb-[18px]">
        <h1 className="font-[family-name:var(--font-space)] text-[19px]">System Configuration</h1>
        <p className="text-[11px] text-hq-txt3 font-[family-name:var(--font-jetbrains)] tracking-[1px] mt-1">TUNE ASSIGNMENT ALGORITHMS & OPERATIONAL PARAMETERS</p>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {/* Algorithm Weights */}
        <div className="bg-hq-card border border-hq-border">
          <div className="flex items-center px-4 py-3 border-b border-hq-border">
            <div className="font-[family-name:var(--font-space)] text-[12px]">Algorithm Weights</div>
          </div>
          <div className="p-4 border-b border-hq-border">
            <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 tracking-[2px] uppercase mb-3">Priority vs Distance</div>
            <Slider label="Priority Weighting" sub="How heavily urgent orders are favored" id="prio-w" min={0} max={100} defaultValue={70} />
            <Slider label="Distance Optimization" sub="Minimize total fleet travel distance" id="dist-w" min={0} max={100} defaultValue={55} />
            <Slider label="Fairness Score Floor" sub="Min acceptable fairness per courier" id="fair-w" min={0} max={100} defaultValue={80} />
          </div>
        </div>

        {/* Automation */}
        <div className="bg-hq-card border border-hq-border">
          <div className="flex items-center px-4 py-3 border-b border-hq-border">
            <div className="font-[family-name:var(--font-space)] text-[12px]">Automation Controls</div>
          </div>
          <div className="p-4 border-b border-hq-border">
            <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 tracking-[2px] uppercase mb-3">System Automation</div>
            <Toggle label="Auto-Dispatch" sub="Automatically assign incoming orders" defaultChecked onChange={(c) => onToast(`Auto-Dispatch ${c ? 'enabled' : 'disabled'}`, c ? 'ok' : 'warn')} />
            <Toggle label="Route Re-optimization" sub="Re-route on traffic events" defaultChecked onChange={(c) => onToast(`Route Re-optimization ${c ? 'enabled' : 'disabled'}`, c ? 'ok' : 'warn')} />
            <Toggle label="SLA Alerts" sub="Notify when SLA thresholds breached" defaultChecked onChange={(c) => onToast(`SLA Alerts ${c ? 'enabled' : 'disabled'}`, c ? 'ok' : 'warn')} />
            <Toggle label="Batch Consolidation" sub="Group nearby orders for efficiency" defaultChecked={false} onChange={(c) => onToast(`Batch Consolidation ${c ? 'enabled' : 'disabled'}`, c ? 'ok' : 'warn')} />
          </div>
        </div>

        {/* SLA */}
        <div className="bg-hq-card border border-hq-border">
          <div className="flex items-center px-4 py-3 border-b border-hq-border">
            <div className="font-[family-name:var(--font-space)] text-[12px]">SLA Thresholds</div>
          </div>
          <div className="p-4 border-b border-hq-border">
            <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 tracking-[2px] uppercase mb-3">Delivery Time Limits</div>
            <Slider label="High Priority SLA" sub="Max delivery window (minutes)" id="sla-hi" min={10} max={120} defaultValue={30} suffix=" min" />
            <Slider label="Standard SLA" sub="Max delivery window (minutes)" id="sla-st" min={10} max={180} defaultValue={90} suffix=" min" />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-hq-card border border-hq-border">
          <div className="flex items-center px-4 py-3 border-b border-hq-border">
            <div className="font-[family-name:var(--font-space)] text-[12px]">System Actions</div>
          </div>
          <div className="p-4">
            <button onClick={onRunOptimization} className="w-full p-3 mb-3 bg-[linear-gradient(135deg,rgba(0,229,255,.12),rgba(0,255,157,.06))] border border-hq-cyan text-hq-cyan font-[family-name:var(--font-space)] text-[11px] tracking-[2px] uppercase cursor-pointer transition-all hover:bg-[rgba(0,229,255,0.2)] hover:shadow-[var(--glow-cyan)]">
              ⚡ RUN FULL OPTIMIZATION
            </button>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button onClick={() => onToast('Configuration exported', 'ok')} className="p-2 text-center font-[family-name:var(--font-jetbrains)] text-[10px] border border-hq-border bg-hq-card2 text-hq-txt2 cursor-pointer hover:border-hq-cyan hover:text-hq-cyan transition-all">Export Config</button>
              <button onClick={() => onToast('Import not yet connected', 'info')} className="p-2 text-center font-[family-name:var(--font-jetbrains)] text-[10px] border border-hq-border bg-hq-card2 text-hq-txt2 cursor-pointer hover:border-hq-cyan hover:text-hq-cyan transition-all">Import Config</button>
              <button onClick={() => onToast('Settings reset to defaults', 'ok')} className="p-2 text-center font-[family-name:var(--font-jetbrains)] text-[10px] border border-hq-amber bg-hq-card2 text-hq-amber cursor-pointer hover:bg-[rgba(255,170,0,0.1)] transition-all">Reset Defaults</button>
              <button onClick={onEmergencyStop} className="p-2 text-center font-[family-name:var(--font-jetbrains)] text-[10px] border border-hq-red bg-hq-card2 text-hq-red cursor-pointer hover:bg-[rgba(255,61,90,0.1)] transition-all">Emergency Stop</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
