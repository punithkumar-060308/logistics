import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useTransition } from "react";
import {
  fetchControlData,
  assignOrder,
  createOrder,
  setEdgeDelay,
  autoDispatchAll,
} from "@/server/dispatch.functions";

export const Route = createFileRoute("/control")({
  component: ControlPage,
  loader: () => fetchControlData(),
  head: () => ({
    meta: [
      { title: "Live Dispatch Control — Logistics HQ" },
      {
        name: "description",
        content:
          "Live dispatch control panel powered by a graph-based shortest-path agent assignment algorithm.",
      },
    ],
  }),
});

type Data = Awaited<ReturnType<typeof fetchControlData>>;

function ControlPage() {
  const initial = Route.useLoaderData() as Data;
  const [data, setData] = useState<Data>(initial);
  const [pending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<string>("");

  // New order form
  const nodes = data.nodes;
  const [pickup, setPickup] = useState(nodes[0]?.id ?? "");
  const [drop, setDrop] = useState(nodes[nodes.length - 1]?.id ?? "");
  const [prep, setPrep] = useState(5);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  // Edge delay form
  const [edgeFrom, setEdgeFrom] = useState("N5");
  const [edgeTo, setEdgeTo] = useState("N6");
  const [multiplier, setMultiplier] = useState(2.5);

  const refresh = async () => {
    const fresh = await fetchControlData();
    setData(fresh);
  };

  const handleAssign = (orderId: string) =>
    startTransition(async () => {
      const res = await assignOrder({ data: { orderId } });
      if (res.ok) {
        setLastResult(
          `✓ Assigned to ${res.result.agentName} — ETA ${res.result.etaMinutes.toFixed(1)} min — path ${res.result.pickupPath.join("→")} ⇒ ${res.result.dropPath.join("→")}`,
        );
      } else {
        setLastResult("✗ " + res.error);
      }
      await refresh();
    });

  const handleCreate = () =>
    startTransition(async () => {
      await createOrder({ data: { pickup, drop, prep, priority } });
      setLastResult("✓ Order created");
      await refresh();
    });

  const handleAutoDispatch = () =>
    startTransition(async () => {
      const r = await autoDispatchAll();
      setLastResult(`✓ Auto-dispatched ${r.assigned} pending orders`);
      await refresh();
    });

  const handleEdgeDelay = () =>
    startTransition(async () => {
      await setEdgeDelay({ data: { from: edgeFrom, to: edgeTo, multiplier } });
      setLastResult(`✓ Set delay ×${multiplier} on ${edgeFrom}↔${edgeTo}`);
      await refresh();
    });

  const agentName = (id: string | null) =>
    id ? data.agents.find((a) => a.id === id)?.name ?? id : "—";

  return (
    <div className="min-h-screen bg-hq-bg text-hq-txt p-6 font-[family-name:var(--font-space)]">
      <header className="flex items-center justify-between mb-6 border-b border-hq-border pb-4">
        <div>
          <h1 className="text-xl text-hq-cyan tracking-widest" style={{ textShadow: "var(--glow-cyan)" }}>
            LIVE DISPATCH CONTROL
          </h1>
          <p className="text-[11px] text-hq-txt3 mt-1 tracking-[2px]">
            GRAPH-BASED ASSIGNMENT · {data.nodes.length} NODES · {data.edges.length} EDGES ·{" "}
            {data.agents.filter((a) => a.availability).length} AGENTS AVAILABLE
          </p>
        </div>
        <Link
          to="/"
          className="text-[10px] tracking-[2px] text-hq-txt2 border border-hq-border px-3 py-2 hover:text-hq-cyan hover:border-hq-cyan"
        >
          ← DASHBOARD
        </Link>
      </header>

      {lastResult && (
        <div className="mb-4 px-3 py-2 border border-hq-cyan bg-[rgba(0,229,255,0.07)] text-[12px] text-hq-cyan font-[family-name:var(--font-jetbrains)]">
          {lastResult}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Orders */}
        <section className="lg:col-span-2 bg-hq-card border border-hq-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hq-border">
            <h2 className="text-[12px] tracking-[2px]">ORDERS</h2>
            <button
              onClick={handleAutoDispatch}
              disabled={pending}
              className="text-[10px] tracking-[1px] border border-hq-cyan text-hq-cyan px-3 py-1.5 hover:bg-[rgba(0,229,255,0.1)] disabled:opacity-50"
            >
              ▶ AUTO-DISPATCH PENDING
            </button>
          </div>
          <table className="w-full text-[11px] font-[family-name:var(--font-jetbrains)]">
            <thead className="text-hq-txt3 text-[9px] tracking-[1px]">
              <tr className="border-b border-hq-border">
                <th className="text-left px-3 py-2">CODE</th>
                <th className="text-left px-3 py-2">PRIO</th>
                <th className="text-left px-3 py-2">PICK→DROP</th>
                <th className="text-left px-3 py-2">STATUS</th>
                <th className="text-left px-3 py-2">AGENT</th>
                <th className="text-left px-3 py-2">ETA</th>
                <th className="text-left px-3 py-2">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((o) => (
                <tr key={o.id} className="border-b border-hq-border hover:bg-hq-card2">
                  <td className="px-3 py-2">{o.order_code}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        o.priority === "high"
                          ? "text-hq-red"
                          : o.priority === "medium"
                          ? "text-hq-amber"
                          : "text-hq-txt2"
                      }
                    >
                      {o.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {o.pickup_node} → {o.drop_node}
                  </td>
                  <td className="px-3 py-2 text-hq-cyan">{o.status}</td>
                  <td className="px-3 py-2">{agentName(o.assigned_agent)}</td>
                  <td className="px-3 py-2">
                    {o.estimated_eta_minutes ? `${o.estimated_eta_minutes.toFixed(1)}m` : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {o.status === "pending" && (
                      <button
                        onClick={() => handleAssign(o.id)}
                        disabled={pending}
                        className="text-hq-cyan hover:underline disabled:opacity-40"
                      >
                        assign ▶
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* New order */}
        <section className="bg-hq-card border border-hq-border">
          <h2 className="text-[12px] tracking-[2px] px-4 py-3 border-b border-hq-border">NEW ORDER</h2>
          <div className="p-4 flex flex-col gap-2 text-[11px] font-[family-name:var(--font-jetbrains)]">
            <label className="flex flex-col gap-1">
              PICKUP
              <select
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="bg-hq-bg border border-hq-border px-2 py-1.5 text-hq-txt"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.id} · {n.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              DROP
              <select
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
                className="bg-hq-bg border border-hq-border px-2 py-1.5 text-hq-txt"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.id} · {n.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              PREP TIME (MIN)
              <input
                type="number"
                value={prep}
                onChange={(e) => setPrep(Number(e.target.value))}
                min={0}
                max={120}
                className="bg-hq-bg border border-hq-border px-2 py-1.5 text-hq-txt"
              />
            </label>
            <label className="flex flex-col gap-1">
              PRIORITY
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                className="bg-hq-bg border border-hq-border px-2 py-1.5 text-hq-txt"
              >
                <option value="low">LOW</option>
                <option value="medium">MEDIUM</option>
                <option value="high">HIGH</option>
              </select>
            </label>
            <button
              onClick={handleCreate}
              disabled={pending}
              className="mt-2 border border-hq-cyan text-hq-cyan py-2 hover:bg-[rgba(0,229,255,0.1)] disabled:opacity-50"
            >
              ⊕ CREATE ORDER
            </button>
          </div>
        </section>

        {/* Agents */}
        <section className="bg-hq-card border border-hq-border">
          <h2 className="text-[12px] tracking-[2px] px-4 py-3 border-b border-hq-border">AGENTS</h2>
          <div className="p-4 flex flex-col gap-2 text-[11px] font-[family-name:var(--font-jetbrains)]">
            {data.agents.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-hq-border pb-2">
                <div>
                  <div className="text-hq-txt">{a.name}</div>
                  <div className="text-hq-txt3 text-[9px]">
                    @ {a.current_location} · ★ {a.rating.toFixed(1)}
                  </div>
                </div>
                <span
                  className={
                    a.availability ? "text-hq-green text-[9px]" : "text-hq-txt3 text-[9px]"
                  }
                >
                  {a.availability ? "AVAILABLE" : "OFFLINE"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Environment */}
        <section className="bg-hq-card border border-hq-border lg:col-span-2">
          <h2 className="text-[12px] tracking-[2px] px-4 py-3 border-b border-hq-border">
            ENVIRONMENT · APPLY DYNAMIC DELAY
          </h2>
          <div className="p-4 grid grid-cols-4 gap-3 text-[11px] font-[family-name:var(--font-jetbrains)] items-end">
            <label className="flex flex-col gap-1">
              FROM
              <select
                value={edgeFrom}
                onChange={(e) => setEdgeFrom(e.target.value)}
                className="bg-hq-bg border border-hq-border px-2 py-1.5"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.id}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              TO
              <select
                value={edgeTo}
                onChange={(e) => setEdgeTo(e.target.value)}
                className="bg-hq-bg border border-hq-border px-2 py-1.5"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.id}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              DELAY ×{multiplier.toFixed(1)}
              <input
                type="range"
                min={1}
                max={5}
                step={0.1}
                value={multiplier}
                onChange={(e) => setMultiplier(Number(e.target.value))}
              />
            </label>
            <button
              onClick={handleEdgeDelay}
              disabled={pending}
              className="border border-hq-amber text-hq-amber py-2 hover:bg-[rgba(255,176,32,0.1)] disabled:opacity-50"
            >
              ▶ APPLY DELAY
            </button>
          </div>
          <div className="px-4 pb-4 text-[10px] text-hq-txt3 font-[family-name:var(--font-jetbrains)]">
            Algorithm: Dijkstra over <code>distance × delay_multiplier</code>. Score combines
            travel cost (agent → pickup → drop) + prep time, weighted by order priority and
            agent rating.
          </div>
        </section>
      </div>
    </div>
  );
}