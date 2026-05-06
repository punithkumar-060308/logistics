import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Dijkstra shortest path on weighted graph (distance * delay_multiplier).
export interface Edge {
  from_node: string;
  to_node: string;
  distance: number;
  delay_multiplier: number;
}

export function shortestPath(
  edges: Edge[],
  start: string,
  end: string,
): { cost: number; path: string[] } | null {
  const adj = new Map<string, { to: string; w: number }[]>();
  for (const e of edges) {
    if (!adj.has(e.from_node)) adj.set(e.from_node, []);
    adj.get(e.from_node)!.push({ to: e.to_node, w: e.distance * e.delay_multiplier });
  }
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  dist.set(start, 0);
  // simple priority queue via array (graph is small)
  const queue: { node: string; d: number }[] = [{ node: start, d: 0 }];
  while (queue.length) {
    queue.sort((a, b) => a.d - b.d);
    const { node, d } = queue.shift()!;
    if (node === end) break;
    if (d > (dist.get(node) ?? Infinity)) continue;
    for (const { to, w } of adj.get(node) ?? []) {
      const nd = d + w;
      if (nd < (dist.get(to) ?? Infinity)) {
        dist.set(to, nd);
        prev.set(to, node);
        queue.push({ node: to, d: nd });
      }
    }
  }
  if (!dist.has(end)) return null;
  const path: string[] = [];
  let cur: string | null = end;
  while (cur) {
    path.unshift(cur);
    cur = prev.get(cur) ?? null;
  }
  return { cost: dist.get(end)!, path };
}

export async function loadGraph() {
  const { data: edges, error } = await supabaseAdmin.from("graph_edges").select("*");
  if (error) throw error;
  return (edges ?? []) as Edge[];
}

/**
 * Score = travel cost to pickup + pickup→drop cost + prep_time
 *         penalized by (5 - rating) so higher-rated agents are preferred.
 * Priority weights the score so high-priority orders prefer faster total ETA.
 */
export interface AssignmentResult {
  agentId: string;
  agentName: string;
  cost: number;
  etaMinutes: number;
  pickupPath: string[];
  dropPath: string[];
  score: number;
}

export async function findBestAgent(orderId: string): Promise<AssignmentResult | null> {
  const [{ data: order }, { data: agents }, edges] = await Promise.all([
    supabaseAdmin.from("orders").select("*").eq("id", orderId).maybeSingle(),
    supabaseAdmin.from("agents").select("*").eq("availability", true),
    loadGraph(),
  ]);
  if (!order || !agents?.length) return null;

  const drop = shortestPath(edges, order.pickup_node, order.drop_node);
  if (!drop) return null;

  const priorityWeight =
    order.priority === "high" ? 1.5 : order.priority === "medium" ? 1.0 : 0.7;

  let best: AssignmentResult | null = null;
  for (const a of agents) {
    const toPickup = shortestPath(edges, a.current_location, order.pickup_node);
    if (!toPickup) continue;
    const totalCost = toPickup.cost + drop.cost;
    const etaMinutes = totalCost * 5 + order.prep_time_minutes; // 5 min per unit distance
    // Lower score is better. Rating reduces the score.
    const score = (totalCost / priorityWeight) - (a.rating - 4) * 0.5;
    if (!best || score < best.score) {
      best = {
        agentId: a.id,
        agentName: a.name,
        cost: totalCost,
        etaMinutes,
        pickupPath: toPickup.path,
        dropPath: drop.path,
        score,
      };
    }
  }
  return best;
}