/*
# Create date_responses table (single-tenant, no auth)

1. New Tables
- `date_responses`
  - `id` (uuid, primary key)
  - `date_date` (date, not null) — the date chosen for the romantic outing
  - `date_time` (time, not null) — the time chosen for the outing
  - `message` (text, nullable) — optional personal message from the girlfriend
  - `confirmed` (boolean, default true) — whether the date was confirmed
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `date_responses`.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (a single love letter app, no sign-in).
*/

CREATE TABLE IF NOT EXISTS date_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_date date NOT NULL,
  date_time time NOT NULL,
  message text,
  confirmed boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE date_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_date_responses" ON date_responses;
CREATE POLICY "anon_select_date_responses" ON date_responses FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_date_responses" ON date_responses;
CREATE POLICY "anon_insert_date_responses" ON date_responses FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_date_responses" ON date_responses;
CREATE POLICY "anon_update_date_responses" ON date_responses FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_date_responses" ON date_responses;
CREATE POLICY "anon_delete_date_responses" ON date_responses FOR DELETE
TO anon, authenticated USING (true);
