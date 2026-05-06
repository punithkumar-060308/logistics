import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/logistics/Sidebar';
import Topbar from '@/components/logistics/Topbar';
import Toast from '@/components/logistics/Toast';
import OrdersScreen from '@/components/logistics/OrdersScreen';
import OperationsScreen from '@/components/logistics/OperationsScreen';
import DispatchScreen from '@/components/logistics/DispatchScreen';
import FleetScreen from '@/components/logistics/FleetScreen';
import AIScreen from '@/components/logistics/AIScreen';
import SettingsScreen from '@/components/logistics/SettingsScreen';
import OrderDetailModal from '@/components/logistics/OrderDetailModal';
import NewDispatchModal from '@/components/logistics/NewDispatchModal';
import {
  type Screen, type Order, type DispatchLogEntry,
  SCREEN_TITLES, INITIAL_ORDERS, INITIAL_COURIERS, INITIAL_ALERTS, INITIAL_ZONES, INIT_DISPATCH_LOG,
  nowStr,
} from '@/lib/data';

export const Route = createFileRoute('/')({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: 'Logistics HQ — Mission Control' },
      { name: 'description', content: 'Real-time logistics operations dashboard with AI-powered dispatch intelligence' },
    ],
    links: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap' },
    ],
  }),
});

function Dashboard() {
  const [screen, setScreen] = useState<Screen>('orders');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [couriers, setCouriers] = useState(INITIAL_COURIERS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [dispatchLog, setDispatchLog] = useState<DispatchLogEntry[]>(() =>
    INIT_DISPATCH_LOG.map((l) => ({ ...l, time: nowStr() }))
  );
  const [liveCount, setLiveCount] = useState(142);
  const [fleetEff, setFleetEff] = useState('94.2%');

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'info' as 'info' | 'ok' | 'warn' | 'err', visible: false });
  const showToast = useCallback((message: string, type: 'info' | 'ok' | 'warn' | 'err' = 'info') => {
    setToast({ message, type, visible: true });
  }, []);

  // Modals
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  const addLog = useCallback((tag: string, cls: string, body: string, sub: string) => {
    setDispatchLog((prev) => [{ tag, cls, body, sub, time: nowStr() }, ...prev].slice(0, 50));
  }, []);

  // Live simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prev) => prev.map((o) => o.status !== 'Delivered' ? { ...o, elapsed: o.elapsed + 1 } : o));
      if (Math.random() < 0.03) setLiveCount((c) => c + (Math.random() < 0.5 ? 1 : -1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-assign and resolve
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prev) => {
        const pending = prev.filter((o) => o.status === 'Pending');
        if (pending.length && Math.random() < 0.15) {
          const o = pending[0];
          const c = couriers.filter((x) => x.status === 'active')[Math.floor(Math.random() * 5)];
          if (c) {
            addLog('AUTO-ASSIGNED', 'in', `${o.id} auto-assigned to ${c.name}.`, '↑ AUTO-DISPATCH');
            showToast(`Auto-assigned ${o.id} to ${c.name}`, 'ok');
            return prev.map((x) => x.id === o.id ? { ...x, status: 'Dispatching' as const, courier: c.name } : x);
          }
        }
        const delayed = prev.filter((o) => o.status === 'Delayed');
        if (delayed.length && Math.random() < 0.05) {
          addLog('RESOLVED', 'ok', `Delay cleared for ${delayed[0].id}. Back in transit.`, '✓ ROUTE CLEARED');
          return prev.map((x) => x.id === delayed[0].id ? { ...x, status: 'In-Transit' as const } : x);
        }
        return prev;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [couriers, addLog, showToast]);

  // Dispatch log simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (screen === 'dispatch' && Math.random() < 0.04) {
        const evts = [
          { tag: 'DELIVERED', cls: 'ok', body: `Delivery confirmed by courier ${couriers[Math.floor(Math.random() * 5)].name}.`, sub: '✓ POD VERIFIED' },
          { tag: 'REROUTED', cls: 'cr', body: 'Traffic delay on Route 9. Re-routing dispatch.', sub: '⚠ CONGESTION' },
          { tag: 'ASSIGNED', cls: 'in', body: `Order ${orders[Math.floor(Math.random() * 5)].id} assigned to ${couriers[Math.floor(Math.random() * 5)].name}.`, sub: '↑ AUTO-ASSIGNED' },
        ];
        const e = evts[Math.floor(Math.random() * evts.length)];
        addLog(e.tag, e.cls, e.body, e.sub);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, couriers, orders, addLog]);

  const handleRunOptimization = () => {
    showToast('Running full optimization algorithm...', 'info');
    setTimeout(() => {
      setZones((prev) => prev.map((z) => z.pct > 80 ? { ...z, pct: Math.max(60, z.pct - 15) } : z));
      setCouriers((prev) => prev.map((c) => ({ ...c, fair: Math.min(99, c.fair + 3) })));
      setFleetEff('96.8%');
      showToast('Optimization complete! Fleet efficiency: 96.8%', 'ok');
      addLog('OPTIMIZED', 'ok', 'Full route optimization completed. ETA improvements across all zones.', '↑ EFFICIENCY +2.6%');
    }, 1800);
  };

  const handleReassign = (id: string) => {
    const c = couriers.filter((x) => x.status === 'active')[Math.floor(Math.random() * 5)];
    if (!c) return;
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, courier: c.name, status: 'Dispatching' as const, elapsed: 0 } : o));
    addLog('REASSIGNED', 'ok', `${id} reassigned to ${c.name} via manual override.`, '✓ MANUAL OVERRIDE');
    showToast(`Order ${id} reassigned to ${c.name}`, 'ok');
    setDetailOrder(null);
  };

  const handleMarkDelivered = (id: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: 'Delivered' as const } : o));
    addLog('DELIVERED', 'ok', `${id} confirmed delivered.`, '✓ POD VERIFIED');
    showToast(`Order ${id} marked as delivered!`, 'ok');
    setDetailOrder(null);
  };

  const handleExportCSV = () => {
    const rows = [['Order ID', 'Priority', 'Destination', 'Courier', 'Status']];
    orders.forEach((o) => rows.push([o.id, o.prio, o.dest, o.courier, o.status]));
    const csv = rows.map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'logistics-orders.csv';
    a.click();
    showToast('CSV exported successfully!', 'ok');
  };

  const handleNewDispatch = (dest: string, prio: 'High' | 'Med' | 'Low', courier: string) => {
    const id = '#ORD-' + Math.floor(88300 + Math.random() * 200);
    setOrders((prev) => [{ id, prio, dest, courier, elapsed: 0, status: 'Dispatching' as const }, ...prev]);
    setLiveCount((c) => c + 1);
    addLog('NEW ORDER', prio === 'High' ? 'cr' : 'in', `${id} created → ${dest} assigned to ${courier}.`, `↑ ${prio.toUpperCase()} PRIORITY`);
    setAlerts((prev) => [{ type: 'i' as const, title: 'New Dispatch', body: `${id} dispatched to ${dest} via ${courier}.` }, ...prev]);
    setShowDispatchModal(false);
    showToast(`Order ${id} dispatched to ${courier}!`, 'ok');
    setScreen('orders');
  };

  const handleRebalanceZones = () => {
    showToast('Running zone optimization...', 'info');
    setTimeout(() => {
      setZones((prev) => prev.map((z) => z.pct > 80 ? { ...z, pct: Math.max(65, z.pct - 18), col: 'var(--hq-cyan)' } : z));
      showToast('Zones rebalanced successfully!', 'ok');
      addLog('REBALANCED', 'ok', 'Zone rebalancing complete. All zones now within SLA limits.', '✓ OPTIMIZATION APPLIED');
    }, 1200);
  };

  const handleAutoRedistribute = () => {
    showToast('Auto-redistributing couriers...', 'info');
    setTimeout(() => {
      setZones((prev) => prev.map((z, i) => i === 0 ? { ...z, pct: 70, col: 'var(--hq-cyan)' } : z));
      setCouriers((prev) => prev.map((c, i) => i === 5 || i === 6 ? { ...c, orders: c.orders + 2 } : c));
      showToast('4 couriers redistributed from Central to North', 'ok');
      addLog('REDISTRIBUTED', 'ok', '4 couriers moved from Central Zone to Northern Sector.', '✓ FAIRNESS RESTORED');
    }, 1000);
  };

  const handleEmergencyStop = () => {
    setAlerts((prev) => [{ type: 'r' as const, title: 'EMERGENCY STOP', body: 'All automated dispatch suspended by operator.' }, ...prev]);
    showToast('⚠ Emergency stop activated. Manual mode only.', 'err');
    addLog('EMERGENCY', 'cr', 'Emergency stop activated. All automation suspended.', '⚠ MANUAL MODE ONLY');
  };

  const avgFairness = (couriers.reduce((a, c) => a + c.fair, 0) / couriers.length).toFixed(1);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeScreen={screen}
        onNavigate={setScreen}
        onNewDispatch={() => setShowDispatchModal(true)}
        logCount={dispatchLog.length}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={SCREEN_TITLES[screen]} liveCount={liveCount} onNavigate={setScreen} />
        <div className="flex-1 overflow-y-auto p-[18px] hq-scroll">
          {screen === 'operations' && (
            <OperationsScreen alerts={alerts} fleetEff={fleetEff} onRunOptimization={handleRunOptimization} />
          )}
          {screen === 'dispatch' && (
            <DispatchScreen dispatchLog={dispatchLog} onManualOverride={() => { showToast('Manual override mode activated', 'warn'); addLog('OVERRIDE', 'cr', 'Manual override enabled. Auto-dispatch suspended.', '⚠ MANUAL MODE'); }} />
          )}
          {screen === 'orders' && (
            <OrdersScreen
              orders={orders}
              alerts={alerts}
              onOrderDetail={(id) => setDetailOrder(orders.find((o) => o.id === id) || null)}
              onExportCSV={handleExportCSV}
            />
          )}
          {screen === 'fleet' && (
            <FleetScreen zones={zones} couriers={couriers} avgFairness={avgFairness} onRebalanceZones={handleRebalanceZones} onAutoRedistribute={handleAutoRedistribute} />
          )}
          {screen === 'ai' && (
            <AIScreen orders={orders} couriers={couriers} zones={zones} alerts={alerts} liveCount={liveCount} onAddLog={addLog} />
          )}
          {screen === 'settings' && (
            <SettingsScreen onRunOptimization={handleRunOptimization} onToast={showToast} onEmergencyStop={handleEmergencyStop} />
          )}
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} onHide={() => setToast((t) => ({ ...t, visible: false }))} />
      <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} onReassign={handleReassign} onMarkDelivered={handleMarkDelivered} />
      {showDispatchModal && <NewDispatchModal couriers={couriers} onClose={() => setShowDispatchModal(false)} onDispatch={handleNewDispatch} onToast={showToast} />}
    </div>
  );
}
