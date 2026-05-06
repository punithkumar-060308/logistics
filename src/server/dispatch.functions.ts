import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { findBestAgent } from "./dispatch.server";

export const fetchControlData = createServerFn({ method: "GET" }).handler(async () => {
  const [nodes, edges, agents, orders] = await Promise.all([
    supabaseAdmin.from("graph_nodes").select("*").order("id"),
    supabaseAdmin.from("graph_edges").select("*"),
    supabaseAdmin.from("agents").select("*").order("name"),
    supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false }),
  ]);
  return {
    nodes: nodes.data ?? [],
    edges: edges.data ?? [],
    agents: agents.data ?? [],
    orders: orders.data ?? [],
  };
});

export const assignOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ orderId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const result = await findBestAgent(data.orderId);
    if (!result) return { ok: false as const, error: "No available agent or path." };
    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        assigned_agent: result.agentId,
        status: "assigned",
        estimated_cost: result.cost,
        estimated_eta_minutes: result.etaMinutes,
      })
      .eq("id", data.orderId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, result };
  });

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        pickup: z.string().min(1),
        drop: z.string().min(1),
        prep: z.number().int().min(0).max(120),
        priority: z.enum(["low", "medium", "high"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const code = "ORD-" + Math.floor(1000 + Math.random() * 9000);
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .insert({
        order_code: code,
        pickup_node: data.pickup,
        drop_node: data.drop,
        prep_time_minutes: data.prep,
        priority: data.priority,
      })
      .select()
      .single();
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, order: row };
  });

export const setEdgeDelay = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        from: z.string().min(1),
        to: z.string().min(1),
        multiplier: z.number().min(1).max(10),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    // Update both directions for symmetric grid
    await supabaseAdmin
      .from("graph_edges")
      .update({ delay_multiplier: data.multiplier })
      .or(
        `and(from_node.eq.${data.from},to_node.eq.${data.to}),and(from_node.eq.${data.to},to_node.eq.${data.from})`,
      );
    return { ok: true as const };
  });

export const autoDispatchAll = createServerFn({ method: "POST" }).handler(async () => {
  const { data: pending } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("status", "pending");
  let assigned = 0;
  for (const o of pending ?? []) {
    const r = await findBestAgent(o.id);
    if (!r) continue;
    await supabaseAdmin
      .from("orders")
      .update({
        assigned_agent: r.agentId,
        status: "assigned",
        estimated_cost: r.cost,
        estimated_eta_minutes: r.etaMinutes,
      })
      .eq("id", o.id);
    assigned++;
  }
  return { ok: true as const, assigned };
});