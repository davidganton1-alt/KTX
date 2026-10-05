-- Phase M.5 STEP 1 — engine_transfers table + Treasury address columns.
-- Run via Supabase dashboard SQL editor (or Management API with a valid PAT).
CREATE TABLE IF NOT EXISTS engine_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id uuid NOT NULL,
  currency text NOT NULL,
  network text NOT NULL,
  amount numeric(18,6) NOT NULL,
  to_address text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  plisio_op_id text,
  tx_url text,
  fee numeric(18,6),
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(deposit_id)
);

-- Treasury config columns (stored on the 'engine' platform_wallets row)
ALTER TABLE platform_wallets
  ADD COLUMN IF NOT EXISTS engine_trc20_address text,
  ADD COLUMN IF NOT EXISTS engine_bsc_address text;

-- service_role owns everything in-app; keep RLS closed to anon/authenticated
ALTER TABLE engine_transfers ENABLE ROW LEVEL SECURITY;
