import type { Zone, Courier } from '@/lib/data';

interface FleetScreenProps {
  zones: Zone[];
  couriers: Courier[];
  avgFairness: string;
  onRebalanceZones: () => void;
  onAutoRedistribute: () => void;
}

export default function FleetScreen({ zones, couriers, avgFairness, onRebalanceZones, onAutoRedistribute }: FleetScreenProps) {
  const overloaded = zones.filter((z) => z.pct > 85);
  const top4 = couriers.slice(5, 9);
  const courierIds = ['992-ALPHA', '441-BETA', '112-DELTA', '228-EPSILON'];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-[family-name:var(--font-space)] text-[20px]">Courier Workload</h1>
          <p className="text-[12px] text-hq-txt3 font-[family-name:var(--font-jetbrains)] mt-1">Real-time performance metrics and zone distribution.</p>
        </div>
        <div className="flex gap-[22px]">
          <div>
            <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 tracking-[1px]">AVG. FAIRNESS</div>
            <div className="font-[family-name:var(--font-space)] text-[18px] text-hq-green">{avgFairness}%</div>
          </div>
          <div>
            <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 tracking-[1px]">ACTIVE ZONES</div>
            <div className="font-[family-name:var(--font-space)] text-[18px] text-hq-cyan">12/12</div>
          </div>
        </div>
      </div>

      <div className="grid gap-3.5 mb-3.5" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="bg-hq-card border border-hq-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hq-border">
            <div className="font-[family-name:var(--font-space)] text-[12px] flex items-center gap-2">Workload Balance by City Zone</div>
            <button onClick={onRebalanceZones} className="px-2.5 py-1 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[1px] uppercase cursor-pointer border border-hq-cyan text-hq-cyan bg-[rgba(0,229,255,0.07)] hover:bg-[rgba(0,229,255,0.15)] transition-all">Run Optimization</button>
          </div>
          <div className="p-3.5">
            {zones.map((z) => (
              <div key={z.name} className="flex items-center gap-2.5 mb-[7px]">
                <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 w-[50px] tracking-[1px]">{z.name}</div>
                <div className="flex-1 h-[5px] bg-hq-bg rounded-sm">
                  <div className="h-full rounded-sm transition-all duration-500" style={{ width: `${z.pct}%`, background: z.col }} />
                </div>
                <div className="font-[family-name:var(--font-jetbrains)] text-[9px] w-8 text-right" style={{ color: z.col }}>{z.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-hq-card border border-hq-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hq-border">
            <div className={`font-[family-name:var(--font-space)] text-[12px] ${overloaded.length ? 'text-hq-amber' : 'text-hq-green'}`}>
              {overloaded.length ? '⚠ IMBALANCE DETECTED' : '✓ BALANCED'}
            </div>
          </div>
          <div className="mx-3.5 my-3 px-3 py-3 border-l-[3px] border-l-hq-amber bg-[rgba(255,170,0,0.05)] border border-[rgba(255,170,0,0.25)]">
            {overloaded.length ? (
              <>
                <div className="text-[10px] text-hq-amber tracking-[2px] uppercase font-[family-name:var(--font-jetbrains)] mb-1">⚠ IMBALANCE DETECTED</div>
                <div className="text-[12px] text-hq-txt mb-1">{overloaded.map((z) => z.name).join(', ')} Zone(s) at high capacity.</div>
                <div className="text-[11px] text-hq-txt2">Redistribute couriers from lower zones to maintain SLA fairness.</div>
              </>
            ) : (
              <>
                <div className="text-[10px] text-hq-green tracking-[2px] uppercase font-[family-name:var(--font-jetbrains)] mb-1">✓ BALANCED</div>
                <div className="text-[12px] text-hq-green mb-1">All zones within acceptable thresholds.</div>
                <div className="text-[11px] text-hq-txt2">No redistribution required at this time.</div>
              </>
            )}
          </div>
          <div className="px-3.5 pb-3">
            <button onClick={onAutoRedistribute} className="w-full p-3 bg-[linear-gradient(135deg,rgba(0,229,255,.12),rgba(0,255,157,.06))] border border-hq-cyan text-hq-cyan font-[family-name:var(--font-space)] text-[9px] tracking-[2px] uppercase cursor-pointer transition-all hover:bg-[rgba(0,229,255,0.2)] hover:shadow-[var(--glow-cyan)]">
              ⚡ AUTO-REDISTRIBUTE
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {top4.map((c, i) => {
          const fairColor = c.fair > 90 ? 'var(--hq-green)' : c.fair > 75 ? 'var(--hq-cyan)' : 'var(--hq-amber)';
          return (
            <div key={c.init} className="bg-hq-card2 border border-hq-border p-3.5 relative transition-colors hover:border-hq-border2">
              {c.top && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-hq-green text-hq-bg font-[family-name:var(--font-jetbrains)] text-[7px] tracking-[1px] px-[7px] py-0.5 uppercase font-bold">TOP PERFORMER</div>
              )}
              <div className={`flex items-center gap-2.5 mb-2.5 ${c.top ? 'mt-3.5' : ''}`}>
                <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-hq-purple to-hq-cyan flex items-center justify-center text-[12px] font-bold border-2 border-hq-border2">{c.init}</div>
                <div>
                  <div className="text-[13px] font-bold">{c.name}</div>
                  <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 tracking-[1px] mt-px">ID: #{courierIds[i]}</div>
                </div>
              </div>
              <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 tracking-[1px] mb-1 flex justify-between">
                <span>Fairness Score</span>
                <span style={{ color: fairColor }}>{c.fair}%</span>
              </div>
              <div className="h-[3px] bg-hq-bg rounded-sm mb-[7px]">
                <div className="h-full rounded-sm" style={{ width: `${c.fair}%`, background: fairColor }} />
              </div>
              <div className="text-[11px] text-hq-txt3 font-[family-name:var(--font-jetbrains)]">
                Orders Today
                <span className="block text-[19px] text-hq-txt font-[family-name:var(--font-space)] mt-0.5">{c.orders}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
