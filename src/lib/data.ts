export interface Courier {
  name: string;
  init: string;
  zone: string;
  fair: number;
  orders: number;
  status: 'active' | 'delayed';
  top?: boolean;
}

export interface Order {
  id: string;
  prio: 'High' | 'Med' | 'Low';
  dest: string;
  courier: string;
  elapsed: number;
  status: 'Delayed' | 'In-Transit' | 'Dispatching' | 'Pending' | 'Delivered';
}

export interface Alert {
  type: 'r' | 'a' | 'i' | 'g';
  title: string;
  body: string;
}

export interface Zone {
  name: string;
  pct: number;
  col: string;
}

export interface DispatchLogEntry {
  tag: string;
  cls: string;
  body: string;
  sub: string;
  time: string;
}

export const INITIAL_COURIERS: Courier[] = [
  { name: 'J. Rodriguez', init: 'JR', zone: 'CENTRAL', fair: 72, orders: 34, status: 'active' },
  { name: 'S. Chen', init: 'SC', zone: 'NORTH', fair: 88, orders: 28, status: 'active' },
  { name: 'M. Thompson', init: 'MT', zone: 'SOUTH', fair: 91, orders: 31, status: 'active' },
  { name: 'A. Varma', init: 'AV', zone: 'EAST', fair: 65, orders: 22, status: 'delayed' },
  { name: 'K. Miller', init: 'KM', zone: 'WEST', fair: 95, orders: 19, status: 'active' },
  { name: 'Marcus Chen', init: 'MC', zone: 'CENTRAL', fair: 99.8, orders: 34, status: 'active', top: true },
  { name: 'Sarah Jenkins', init: 'SJ', zone: 'NORTH', fair: 82.4, orders: 28, status: 'active' },
  { name: 'David Vane', init: 'DV', zone: 'IND.ZONE', fair: 91.0, orders: 31, status: 'active' },
  { name: 'Elena Ross', init: 'ER', zone: 'WEST', fair: 76.5, orders: 22, status: 'active' },
];

export const INITIAL_ORDERS: Order[] = [
  { id: '#ORD-88219', prio: 'High', dest: 'Sector 7 Logistics Hub, NJ', courier: 'J. Rodriguez', elapsed: 6125, status: 'Delayed' },
  { id: '#ORD-88240', prio: 'Low', dest: 'Midtown Medical Plaza, NY', courier: 'S. Chen', elapsed: 922, status: 'In-Transit' },
  { id: '#ORD-88231', prio: 'Med', dest: 'Downtown Executive Suites, NY', courier: 'M. Thompson', elapsed: 2650, status: 'Dispatching' },
  { id: '#ORD-88195', prio: 'High', dest: 'Southside Freight Depot, PA', courier: 'A. Varma', elapsed: 7918, status: 'Delayed' },
  { id: '#ORD-88242', prio: 'Low', dest: 'Industrial Park A-12, CT', courier: 'K. Miller', elapsed: 525, status: 'In-Transit' },
  { id: '#ORD-88250', prio: 'Med', dest: 'Harbor Point Terminal, NJ', courier: 'Marcus Chen', elapsed: 310, status: 'In-Transit' },
  { id: '#ORD-88251', prio: 'High', dest: 'Metro Air Cargo Hub, NY', courier: 'UNASSIGNED', elapsed: 180, status: 'Pending' },
  { id: '#ORD-88252', prio: 'Low', dest: 'Eastside Depot, CT', courier: 'Sarah Jenkins', elapsed: 89, status: 'In-Transit' },
  { id: '#ORD-88253', prio: 'Med', dest: 'Northgate Freight, PA', courier: 'David Vane', elapsed: 1240, status: 'In-Transit' },
  { id: '#ORD-88254', prio: 'Low', dest: 'West Harbor, NY', courier: 'Elena Ross', elapsed: 445, status: 'Dispatching' },
  { id: '#ORD-88255', prio: 'High', dest: 'Priority Depot Alpha, NJ', courier: 'UNASSIGNED', elapsed: 60, status: 'Pending' },
  { id: '#ORD-88256', prio: 'Med', dest: 'Central Logistics HQ, NY', courier: 'K. Miller', elapsed: 780, status: 'In-Transit' },
];

export const INITIAL_ALERTS: Alert[] = [
  { type: 'r', title: 'Unassigned High-Prio', body: 'Order #88219 has no courier assigned within 10min limit.' },
  { type: 'a', title: 'Traffic Warning', body: 'Severe congestion on I-95 heading into Sector 4.' },
  { type: 'i', title: 'System Notice', body: 'Backup server synchronization complete at 14:02.' },
];

export const INITIAL_ZONES: Zone[] = [
  { name: 'CENTRAL', pct: 95, col: 'var(--hq-amber)' },
  { name: 'NORTH', pct: 60, col: 'var(--hq-cyan)' },
  { name: 'SOUTH', pct: 72, col: 'var(--hq-cyan)' },
  { name: 'EAST', pct: 80, col: 'var(--hq-green)' },
  { name: 'WEST', pct: 55, col: 'var(--hq-cyan)' },
  { name: 'IND.', pct: 45, col: 'var(--hq-green)' },
];

export const CHART_24H = { labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'], vals: [38, 44, 42, 62, 75, 88] };
export const CHART_7D = { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], vals: [65, 72, 58, 80, 95, 88, 45] };

export const INIT_DISPATCH_LOG: DispatchLogEntry[] = [
  { tag: 'ORDER #9902', cls: 'ok', body: 'Courier FLT-99 assigned to Zone Delta.', sub: '✓ OPTIMIZED: ETA -4.2M', time: '' },
  { tag: 'CRITICAL ALERT', cls: 'cr', body: 'Delay detected on Highway 101. Re-routing dispatch CYC-08.', sub: '⚠ TRAFFIC CONGESTION HIGH', time: '' },
  { tag: 'BATCH UPDATED', cls: 'bt', body: '12 pending orders consolidated for route alpha.', sub: '↑ EFFICIENCY +18%', time: '' },
  { tag: 'ORDER #9899', cls: 'ok', body: 'Delivery confirmed by Courier FLT-02.', sub: '✓ POD VERIFIED', time: '' },
];

export function fmtTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function nowStr(): string {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export type Screen = 'operations' | 'dispatch' | 'orders' | 'fleet' | 'ai' | 'settings';

export const SCREEN_TITLES: Record<Screen, string> = {
  operations: 'OPERATIONS OVERVIEW',
  dispatch: 'REAL-TIME DISPATCH',
  orders: 'ORDER MONITORING',
  fleet: 'COURIER WORKLOAD',
  ai: 'AI DISPATCH INTELLIGENCE',
  settings: 'SYSTEM CONFIGURATION',
};
