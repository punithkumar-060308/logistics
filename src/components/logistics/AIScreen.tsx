import { useState, useRef, useEffect } from 'react';
import type { Order, Courier, Zone, Alert } from '@/lib/data';
import { nowStr } from '@/lib/data';

interface AIScreenProps {
  orders: Order[];
  couriers: Courier[];
  zones: Zone[];
  alerts: Alert[];
  liveCount: number;
  onAddLog: (tag: string, cls: string, body: string, sub: string) => void;
}

interface Message {
  role: 'sys' | 'usr' | 'thinking';
  content: string;
}

export default function AIScreen({ orders, couriers, zones, alerts, liveCount, onAddLog }: AIScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'sys',
      content: '👋 Hello! I\'m your AI Dispatch Intelligence. I can help you:<br/><br/>• Analyze delayed orders and suggest fixes<br/>• Recommend optimal courier assignments<br/>• Identify traffic bottlenecks<br/>• Rebalance zone workloads<br/><br/>Ask me anything about your current operations!',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  const delayed = orders.filter((o) => o.status === 'Delayed').length;
  const hiprio = orders.filter((o) => o.prio === 'High' && o.status !== 'Delivered').length;
  const overloaded = zones.filter((z) => z.pct > 85).length;
  const avgFair = (couriers.reduce((a, c) => a + c.fair, 0) / couriers.length).toFixed(1);

  const sendMessage = async (msg?: string) => {
    const text = msg || input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    setMessages((prev) => [...prev, { role: 'usr', content: text }, { role: 'thinking', content: '⏳ Analyzing operations data...' }]);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `Based on current data, I recommend immediate attention to ${delayed} delayed orders. The highest priority is reassigning orders in the Central zone where capacity is at ${zones[0]?.pct}%. Consider redistributing workload to ${couriers.filter((c) => c.fair > 90).length} couriers with high fairness scores.`,
        `Fleet efficiency is strong at 94.2%. However, I notice ${overloaded} zone(s) are overloaded. I suggest running the auto-redistribute function to balance the workload. Average fairness across all couriers is ${avgFair}%.`,
        `Operations briefing: ${liveCount} live orders, ${delayed} delayed, ${hiprio} high-priority. Top recommendation: Focus on clearing delayed orders in Central zone first, then rebalance Northern sector couriers.`,
      ];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => prev.filter((m) => m.role !== 'thinking').concat({ role: 'sys', content: reply }));
      onAddLog('AI INSIGHT', 'ai-gen', 'AI recommendation generated: ' + reply.slice(0, 60) + '...', '🤖 AI');
      setSending(false);
    }, 1500);
  };

  const quickActions = [
    { label: '📦 Analyze Delayed Orders', msg: 'Analyze all delayed orders and tell me what actions I should take right now.' },
    { label: '🚴 Best Courier for Next Order', msg: 'Which courier should I assign to the next high-priority order? Consider fairness scores and current workload.' },
    { label: '⚖ Check Zone Imbalance', msg: 'Is there a zone imbalance problem? How should I rebalance the fleet?' },
    { label: '📊 Full Ops Briefing', msg: 'Give me a full operations briefing: current status, risks, and top 3 recommendations.' },
    { label: '🚦 Traffic Re-routing Help', msg: 'What traffic issues are affecting deliveries and how should I re-route?' },
  ];

  return (
    <div className="grid gap-3.5" style={{ gridTemplateColumns: '1fr 320px', height: 'calc(100vh - 100px)' }}>
      <div className="bg-hq-card border border-hq-border flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-hq-border">
          <div className="font-[family-name:var(--font-space)] text-[12px] flex items-center gap-2">🤖 AI Dispatch Intelligence</div>
          <div className="font-[family-name:var(--font-jetbrains)] text-[8px] text-hq-green tracking-[1px] flex items-center gap-1.5">
            <div className="w-[7px] h-[7px] rounded-full bg-hq-green shadow-[var(--glow-green)]" style={{ animation: 'pdot 2s infinite' }} />
            AI ONLINE
          </div>
        </div>
        <div ref={msgsRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 hq-scroll">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`px-3 py-2.5 rounded-sm text-[12px] leading-relaxed max-w-[90%]
                ${m.role === 'sys' ? 'bg-[rgba(0,229,255,0.07)] border border-[rgba(0,229,255,0.2)] text-hq-txt self-start' : ''}
                ${m.role === 'usr' ? 'bg-[rgba(124,77,255,0.1)] border border-[rgba(124,77,255,0.3)] text-hq-txt self-end' : ''}
                ${m.role === 'thinking' ? 'text-hq-txt3 italic font-[family-name:var(--font-jetbrains)] text-[10px] self-start' : ''}`}
              dangerouslySetInnerHTML={{ __html: m.content }}
            />
          ))}
        </div>
        <div className="flex gap-[7px] p-3 border-t border-hq-border">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about orders, routing, fairness, delays..."
            className="flex-1 bg-hq-bg border border-hq-border text-hq-txt px-2.5 py-[7px] font-[family-name:var(--font-jetbrains)] text-[11px] outline-none transition-colors focus:border-hq-cyan placeholder:text-hq-txt3"
          />
          <button
            onClick={() => sendMessage()}
            disabled={sending}
            className="px-3.5 py-[7px] bg-[rgba(0,229,255,0.1)] border border-hq-cyan text-hq-cyan font-[family-name:var(--font-jetbrains)] text-[10px] tracking-[1px] cursor-pointer transition-all hover:bg-[rgba(0,229,255,0.2)] hover:shadow-[var(--glow-cyan)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            SEND ▶
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="bg-hq-card border border-hq-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hq-border">
            <div className="font-[family-name:var(--font-space)] text-[12px]">Quick Actions</div>
          </div>
          <div className="p-2.5 flex flex-col gap-1.5">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                onClick={() => sendMessage(qa.msg)}
                className="text-left px-2.5 py-2 font-[family-name:var(--font-jetbrains)] text-[10px] border border-hq-border bg-hq-card2 text-hq-txt2 cursor-pointer transition-all hover:border-hq-cyan hover:text-hq-cyan"
              >
                {qa.label}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-hq-card border border-hq-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hq-border">
            <div className="font-[family-name:var(--font-space)] text-[12px]">Live Context</div>
          </div>
          <div className="px-3 py-2.5 font-[family-name:var(--font-jetbrains)] text-[9px] text-hq-txt3 leading-[1.8]">
            LIVE ORDERS: {liveCount}<br />
            DELAYED: {delayed}<br />
            HIGH PRIORITY: {hiprio}<br />
            FLEET EFFICIENCY: 94.2%<br />
            ACTIVE COURIERS: {couriers.filter((c) => c.status === 'active').length}<br />
            ZONES OVERLOADED: {overloaded}<br />
            AVG FAIRNESS: {avgFair}%<br />
            LAST UPDATE: {nowStr()}
          </div>
        </div>
      </div>
    </div>
  );
}
