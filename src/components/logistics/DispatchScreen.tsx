import { useEffect, useRef, useCallback } from 'react';
import type { DispatchLogEntry } from '@/lib/data';

interface DispatchScreenProps {
  dispatchLog: DispatchLogEntry[];
  onManualOverride: () => void;
}

const NODE_POSITIONS = [
  [.15, .2], [.3, .12], [.5, .08], [.7, .15], [.85, .25], [.9, .45], [.82, .7], [.62, .82], [.4, .85], [.2, .75], [.1, .55], [.12, .35], [.35, .3], [.65, .38], [.5, .6], [.28, .48], [.72, .55],
];

const COURIERS_MAP = [
  { x: .38, y: .35, id: 'CYC-12', icon: '🚴' },
  { x: .55, y: .52, id: 'FLT-99', icon: '🚚' },
  { x: .62, y: .3, id: 'VAN-04', icon: '🚐' },
];

export default function DispatchScreen({ dispatchLog, onManualOverride }: DispatchScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const p = canvas.parentElement;
    if (!p) return;
    canvas.width = p.clientWidth;
    canvas.height = p.clientHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    NODE_POSITIONS.forEach(([x1, y1], i) => {
      NODE_POSITIONS.forEach(([x2, y2], j) => {
        if (j <= i) return;
        const dist = Math.hypot((x2 - x1) * W, (y2 - y1) * H);
        if (dist < W * 0.35) {
          ctx.beginPath(); ctx.moveTo(x1 * W, y1 * H); ctx.lineTo(x2 * W, y2 * H);
          ctx.strokeStyle = 'rgba(0,229,255,0.1)'; ctx.lineWidth = 1; ctx.stroke();
        }
      });
    });

    NODE_POSITIONS.forEach(([x, y]) => {
      ctx.beginPath(); ctx.arc(x * W, y * H, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,229,255,.5)'; ctx.shadowBlur = 8; ctx.shadowColor = '#00e5ff'; ctx.fill(); ctx.shadowBlur = 0;
    });

    ctx.beginPath(); ctx.arc(.5 * W, .5 * H, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#ff3d5a'; ctx.shadowBlur = 16; ctx.shadowColor = '#ff3d5a'; ctx.fill(); ctx.shadowBlur = 0;
  }, []);

  useEffect(() => {
    drawCanvas();
    const handler = () => drawCanvas();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [drawCanvas]);

  const logTagColor = (cls: string) => {
    if (cls === 'ok') return 'text-hq-green';
    if (cls === 'cr') return 'text-hq-red';
    if (cls === 'bt') return 'text-hq-purple';
    if (cls === 'ai-gen') return 'text-hq-amber';
    return 'text-hq-cyan';
  };

  const logBorderColor = (cls: string) => {
    if (cls === 'cr') return 'border-l-hq-red';
    if (cls === 'ok') return 'border-l-hq-green';
    if (cls === 'in') return 'border-l-hq-cyan';
    if (cls === 'bt') return 'border-l-hq-purple';
    if (cls === 'ai-gen') return 'border-l-hq-amber';
    return 'border-l-hq-border';
  };

  return (
    <div className="grid gap-3.5" style={{ gridTemplateColumns: '1fr 320px', height: 'calc(100vh - 100px)' }}>
      {/* Map */}
      <div className="flex flex-col bg-hq-card border border-hq-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-hq-border">
          <div className="font-[family-name:var(--font-space)] text-[12px] flex items-center gap-2">
            <div className="w-[7px] h-[7px] rounded-full bg-hq-green shadow-[var(--glow-green)]" style={{ animation: 'pdot 2s infinite' }} />
            Live Traffic Matrix
          </div>
          <div className="flex items-center gap-2 font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-green tracking-[1px]">
            <div className="w-[7px] h-[7px] rounded-full bg-hq-green shadow-[var(--glow-green)]" style={{ animation: 'pdot 2s infinite' }} />
            AUTOMATED DISPATCH ACTIVE
          </div>
        </div>
        <div className="flex-1 bg-hq-bg relative overflow-hidden min-h-[300px]">
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,229,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <canvas ref={canvasRef} className="w-full block" style={{ height: '100%' }} />
          {/* Courier nodes */}
          {COURIERS_MAP.map((c) => (
            <div key={c.id} className="absolute flex flex-col items-center cursor-pointer z-[3] transition-all" style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%`, transform: 'translate(-50%, -50%)' }}>
              <div className="w-[26px] h-[26px] bg-hq-card2 border border-hq-cyan flex items-center justify-center text-[11px] shadow-[var(--glow-cyan)] relative">
                <div className="absolute -inset-[5px] border border-hq-cyan opacity-25" style={{ animation: 'node-pulse 2s infinite' }} />
                {c.icon}
              </div>
              <div className="mt-1 font-[family-name:var(--font-jetbrains)] text-[8px] text-hq-txt2 bg-[rgba(6,12,24,0.85)] px-1 py-px">{c.id}</div>
            </div>
          ))}
          {/* Alert nodes */}
          <div className="absolute w-2.5 h-2.5 bg-hq-amber rounded-full shadow-[var(--glow-amber)] z-[3]" style={{ left: '28%', top: '22%', transform: 'translate(-50%, -50%)', animation: 'node-pulse 1.5s infinite' }} />
          <div className="absolute w-2.5 h-2.5 bg-hq-red rounded-full shadow-[var(--glow-red)] z-[3]" style={{ left: '70%', top: '65%', transform: 'translate(-50%, -50%)', animation: 'node-pulse 1.5s infinite' }} />
        </div>
        <div className="flex gap-2.5 px-3 py-2.5 border-t border-hq-border bg-hq-panel items-center">
          <label className="flex items-center gap-1.5 font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt2 cursor-pointer"><input type="checkbox" defaultChecked /> Show Couriers</label>
          <label className="flex items-center gap-1.5 font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt2 cursor-pointer"><input type="checkbox" /> Active Routes</label>
          <label className="flex items-center gap-1.5 font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt2 cursor-pointer"><input type="checkbox" defaultChecked /> Alert Nodes</label>
          <button onClick={onManualOverride} className="ml-auto px-3 py-1.5 bg-hq-card2 border border-hq-border text-hq-txt2 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[1px] cursor-pointer hover:border-hq-cyan hover:text-hq-cyan transition-all">⚙ Manual Override</button>
        </div>
      </div>

      {/* Log */}
      <div className="flex flex-col bg-hq-card border border-hq-border overflow-hidden">
        <div className="px-4 py-3 border-b border-hq-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-[family-name:var(--font-space)] text-[12px] flex items-center gap-2">Assignment Queue</div>
              <div className="font-[family-name:var(--font-jetbrains)] text-[8px] text-hq-txt3 tracking-[1px] mt-1">Real-time optimization logs</div>
            </div>
            <div className="bg-[rgba(0,229,255,0.08)] border border-hq-cyan text-hq-cyan font-[family-name:var(--font-jetbrains)] text-[8px] px-[7px] py-0.5 tracking-[1px]">AUTO-BALANCING</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2.5 hq-scroll">
          {dispatchLog.map((l, i) => (
            <div key={i} className={`border border-hq-border border-l-2 ${logBorderColor(l.cls)} px-3 py-3 mb-[7px] bg-hq-card2`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[1px] ${logTagColor(l.cls)}`}>{l.tag}</span>
                <span className="font-[family-name:var(--font-jetbrains)] text-[8px] text-hq-txt3">{l.time || '--:--:--'}</span>
              </div>
              <div className="text-[12px] text-hq-txt mb-1">{l.body}</div>
              <div className="font-[family-name:var(--font-jetbrains)] text-[8px] text-hq-txt3 flex items-center gap-1.5">{l.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
