
-- Graph nodes (locations on the grid)
CREATE TABLE public.graph_nodes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Graph edges (distances between nodes, with optional dynamic delay multiplier)
CREATE TABLE public.graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_node TEXT NOT NULL REFERENCES public.graph_nodes(id) ON DELETE CASCADE,
  to_node TEXT NOT NULL REFERENCES public.graph_nodes(id) ON DELETE CASCADE,
  distance REAL NOT NULL CHECK (distance >= 0),
  delay_multiplier REAL NOT NULL DEFAULT 1.0 CHECK (delay_multiplier >= 1.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(from_node, to_node)
);

-- Agents (couriers)
CREATE TABLE public.agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  current_location TEXT NOT NULL REFERENCES public.graph_nodes(id),
  availability BOOLEAN NOT NULL DEFAULT true,
  rating REAL NOT NULL DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders
CREATE TYPE public.order_status AS ENUM ('pending', 'assigned', 'in_transit', 'delivered', 'delayed');
CREATE TYPE public.order_priority AS ENUM ('low', 'medium', 'high');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT NOT NULL UNIQUE,
  pickup_node TEXT NOT NULL REFERENCES public.graph_nodes(id),
  drop_node TEXT NOT NULL REFERENCES public.graph_nodes(id),
  prep_time_minutes INTEGER NOT NULL DEFAULT 5 CHECK (prep_time_minutes >= 0),
  priority public.order_priority NOT NULL DEFAULT 'medium',
  status public.order_status NOT NULL DEFAULT 'pending',
  assigned_agent TEXT REFERENCES public.agents(id),
  estimated_cost REAL,
  estimated_eta_minutes REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_assigned ON public.orders(assigned_agent);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_agents_updated BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS — public read, public write (demo dashboard, no auth yet)
ALTER TABLE public.graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read nodes" ON public.graph_nodes FOR SELECT USING (true);
CREATE POLICY "public read edges" ON public.graph_edges FOR SELECT USING (true);
CREATE POLICY "public read agents" ON public.agents FOR SELECT USING (true);
CREATE POLICY "public read orders" ON public.orders FOR SELECT USING (true);

CREATE POLICY "public write nodes" ON public.graph_nodes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public write edges" ON public.graph_edges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public write agents" ON public.agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public write orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
