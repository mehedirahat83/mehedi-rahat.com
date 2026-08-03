CREATE TABLE IF NOT EXISTS membership_tiers (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  minimum_spend integer NOT NULL DEFAULT 0 CHECK (minimum_spend >= 0),
  discount_percent integer NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS membership_tiers_active_sort_idx ON membership_tiers (active, sort_order);

INSERT INTO membership_tiers (id, name, minimum_spend, discount_percent, sort_order)
VALUES
  ('tier-silver', 'Silver', 0, 0, 0),
  ('tier-gold', 'Gold', 10000, 10, 1),
  ('tier-diamond', 'Diamond', 50000, 20, 2),
  ('tier-vip', 'VIP', 100000, 30, 3)
ON CONFLICT (id) DO NOTHING;
