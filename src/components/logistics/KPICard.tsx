interface KPICardProps {
  label: string;
  value: string | React.ReactNode;
  color: 'cyan' | 'green' | 'amber' | 'red';
  delta?: string;
  deltaNeg?: boolean;
  badge?: string;
  children?: React.ReactNode;
}

const colorMap = {
  cyan: { text: 'text-hq-cyan', shadow: 'var(--glow-cyan)', bar: 'bg-hq-cyan' },
  green: { text: 'text-hq-green', shadow: 'var(--glow-green)', bar: 'bg-hq-green' },
  amber: { text: 'text-hq-amber', shadow: 'var(--glow-amber)', bar: 'bg-hq-amber' },
  red: { text: 'text-hq-red', shadow: 'var(--glow-red)', bar: 'bg-hq-red' },
};

export default function KPICard({ label, value, color, delta, deltaNeg, badge, children }: KPICardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-hq-card border border-hq-border p-3.5 relative overflow-hidden transition-colors hover:border-hq-border2">
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.bar}`} />
      <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 tracking-[2px] uppercase mb-[7px]">
        {label}
      </div>
      <div className={`font-[family-name:var(--font-space)] text-[26px] font-bold leading-none ${c.text}`} style={{ textShadow: c.shadow }}>
        {value}
      </div>
      {delta && (
        <div className={`mt-1.5 font-[family-name:var(--font-jetbrains)] text-[9px] ${deltaNeg ? 'text-hq-red' : 'text-hq-green'}`}>
          {delta}
        </div>
      )}
      {badge && (
        <div className="inline-block mt-1.5 px-1.5 py-0.5 text-[8px] tracking-[1px] font-[family-name:var(--font-jetbrains)] bg-[rgba(255,61,90,0.12)] border border-hq-red text-hq-red">
          {badge}
        </div>
      )}
      {children}
    </div>
  );
}
