import { useState } from 'react';
import KPICard from './KPICard';
import type { Alert } from '@/lib/data';
import { CHART_24H, CHART_7D } from '@/lib/data';

interface OperationsScreenProps {
  alerts: Alert[];
  fleetEff: string;
  onRunOptimization: () => void;
}

export default function OperationsScreen({ alerts, fleetEff, onRunOptimization }: OperationsScreenProps) {
  const [chartView, setChartView] = useState<'24h' | '7d'>('24h');
  const data = chartView === '24h' ? CHART_24H : CHART_7D;
  const max = Math.max(...data.vals);

  const workload = [
    { l: 'Local Express', pct: 42, col: 'var(--hq-cyan)' },
    { l: 'Regional Hubs', pct: 35, col: 'var(--hq-green)' },
    { l: 'Priority Air', pct: 15, col: 'var(--hq-amber)' },
    { l: 'Last Mile', pct: 8, col: 'var(--hq-red)' },
  ];

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-[18px]">
        <KPICard label="System Health" value="OPTIMAL" color="green">
          <div className="mt-2.5 h-[3px] bg-hq-bg rounded-sm"><div className="h-full w-[96%] bg-hq-green rounded-sm" /></div>
        </KPICard>
        <KPICard label="On-Time Delivery" value="98%" color="cyan" delta="▲ +2.4% from avg" />
        <KPICard label="Avg Dispatch Time" value="2.4m" color="amber">
          <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 mt-1.5">GOAL: &lt; 3.0M</div>
        </KPICard>
        <KPICard label="Active Fleet" value={<>84<span className="text-[14px] text-hq-txt2">/92</span></>} color="cyan">
          <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 mt-1.5">91% UTILIZATION</div>
        </KPICard>
      </div>

      <div className="grid gap-3.5 mb-3.5" style={{ gridTemplateColumns: '1fr 280px' }}>
        {/* Chart */}
        <div className="bg-hq-card border border-hq-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hq-border">
            <div className="font-[family-name:var(--font-space)] text-[12px] flex items-center gap-2">📈 Order Volume Trends</div>
            <div className="flex gap-1.5">
              {(['24h', '7d'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setChartView(v)}
                  className={`px-2.5 py-1 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[1px] uppercase cursor-pointer border transition-all
                    ${chartView === v ? 'border-hq-cyan text-hq-cyan bg-[rgba(0,229,255,0.07)]' : 'border-hq-border bg-hq-card2 text-hq-txt2 hover:border-hq-cyan hover:text-hq-cyan'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2 h-[130px] px-4 pt-3.5">
            {data.vals.map((v, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-b from-[rgba(0,229,255,0.55)] to-[rgba(0,229,255,0.08)] border-t border-hq-cyan cursor-pointer transition-all hover:from-hq-cyan hover:to-[rgba(0,229,255,0.2)] relative group"
                style={{ height: `${(v / max) * 100}%` }}
              >
                <div className="hidden group-hover:block absolute -top-[22px] left-1/2 -translate-x-1/2 bg-hq-card2 border border-hq-border2 font-[family-name:var(--font-jetbrains)] text-[8px] text-hq-cyan px-1.5 py-0.5 whitespace-nowrap">
                  {v} orders @ {data.labels[i]}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-4 py-1.5 font-[family-name:var(--font-jetbrains)] text-[8px] text-hq-txt3">
            {data.labels.map((l) => <span key={l}>{l}</span>)}
          </div>
        </div>

        {/* Workload */}
        <div className="bg-hq-card border border-hq-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hq-border">
            <div className="font-[family-name:var(--font-space)] text-[12px]">Workload Distribution</div>
          </div>
          <div className="p-3.5">
            {workload.map((w) => (
              <div key={w.l} className="flex items-center gap-2.5 mb-2.5">
                <div className="text-[11px] text-hq-txt2 w-[95px]">{w.l}</div>
                <div className="flex-1 h-[3px] bg-hq-bg rounded-sm">
                  <div className="h-full rounded-sm" style={{ width: `${w.pct}%`, background: w.col }} />
                </div>
                <div className="font-[family-name:var(--font-jetbrains)] text-[9px] w-[30px] text-right" style={{ color: w.col }}>{w.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3.5" style={{ gridTemplateColumns: '1fr 280px' }}>
        {/* Alerts */}
        <div className="bg-hq-card border border-hq-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hq-border">
            <div className="font-[family-name:var(--font-space)] text-[12px] flex items-center gap-2">
              ⚠ Critical Alerts
              <span className="bg-hq-red text-foreground text-[8px] px-1.5 py-0.5 font-[family-name:var(--font-jetbrains)] tracking-[1px]">{alerts.length} NEW</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-3">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`border-l-[3px] px-3 py-2.5 ${a.type === 'r' ? 'border-l-hq-red bg-[rgba(255,61,90,0.04)]' : a.type === 'a' ? 'border-l-hq-amber bg-[rgba(255,170,0,0.04)]' : 'border-l-hq-border bg-hq-card2'}`}
              >
                <div className={`text-[11px] font-semibold mb-1 ${a.type === 'r' ? 'text-hq-red' : a.type === 'a' ? 'text-hq-amber' : 'text-hq-txt2'}`}>{a.title}</div>
                <div className="text-[11px] text-hq-txt2 leading-relaxed">{a.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Efficiency */}
        <div className="bg-hq-card border border-hq-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hq-border">
            <div className="font-[family-name:var(--font-space)] text-[11px]">Fleet Efficiency</div>
          </div>
          <div className="px-4 py-3.5 text-center">
            <div className="font-[family-name:var(--font-space)] text-[36px] text-hq-green" style={{ textShadow: 'var(--glow-green)' }}>{fleetEff}</div>
            <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 mt-1.5 tracking-[1px]">FLEET EFFICIENCY INDEX</div>
            <div className="mt-3.5 h-1 bg-hq-bg rounded-sm">
              <div className="h-full bg-hq-green rounded-sm transition-all duration-500" style={{ width: fleetEff }} />
            </div>
          </div>
          <div className="px-3.5 pb-3">
            <button onClick={onRunOptimization} className="w-full p-3 bg-[linear-gradient(135deg,rgba(0,229,255,.12),rgba(0,255,157,.06))] border border-hq-cyan text-hq-cyan font-[family-name:var(--font-space)] text-[9px] tracking-[2px] uppercase cursor-pointer transition-all hover:bg-[rgba(0,229,255,0.2)] hover:shadow-[var(--glow-cyan)]">
              ⚡ RUN OPTIMIZATION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
