-- extensions for UUID generation (if desired)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- rounds: svako kolo
CREATE TABLE IF NOT EXISTS rounds (
  id SERIAL PRIMARY KEY,
  uuid uuid DEFAULT gen_random_uuid() UNIQUE,
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT false,
  drawn_numbers integer[] DEFAULT NULL -- NULL dok nisu izvučeni
);

-- tickets: svaki uplaćeni listić
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  uuid uuid DEFAULT gen_random_uuid() UNIQUE,
  round_id integer REFERENCES rounds(id) ON DELETE SET NULL,
  personal_id varchar(20) NOT NULL,
  numbers integer[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- index for fast lookup by uuid
CREATE INDEX IF NOT EXISTS idx_tickets_uuid ON tickets (uuid);
CREATE INDEX IF NOT EXISTS idx_rounds_uuid ON rounds (uuid);
