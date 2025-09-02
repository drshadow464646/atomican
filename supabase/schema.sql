-- supabase/schema.sql

-- Enable the uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Create custom enum types
-- Note: Supabase/Postgres doesn't support "CREATE TYPE IF NOT EXISTS" in the same way as tables.
-- A workaround is to check and create it, but for simplicity in this script,
-- we'll assume it might be run fresh. For production, a more robust migration tool is better.
-- A simple DROP/CREATE is often fine for initial development.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chemical_type') THEN
        CREATE TYPE chemical_type AS ENUM ('acid', 'base', 'indicator', 'salt', 'solvent', 'oxidant', 'reductant', 'other');
    END IF;
END$$;


-- 1. Users Table
-- Stores basic user profile information.
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    auth_id UUID UNIQUE, -- This would link to Supabase Auth user
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Settings Table
-- Stores user-specific application settings.
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appearance_mode TEXT DEFAULT 'system',
    base_gradient TEXT DEFAULT 'moon',
    ui_motion_level TEXT DEFAULT 'medium',
    typography_mode TEXT DEFAULT 'default',
    UNIQUE(user_id) -- Each user has only one settings row
);

-- 3. Chemicals Table
-- Master list of all available chemicals.
CREATE TABLE IF NOT EXISTS chemicals (
    id TEXT PRIMARY KEY, -- Using the text ID like 'hcl', 'naoh'
    name TEXT NOT NULL,
    formula TEXT NOT NULL,
    type chemical_type NOT NULL,
    concentration NUMERIC -- Molarity (mol/L), can be NULL
);

-- 4. User Inventory Table
-- Links users to the chemicals they have in their inventory.
CREATE TABLE IF NOT EXISTS user_inventory (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chemical_id TEXT NOT NULL REFERENCES chemicals(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1, -- e.g., number of bottles
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, chemical_id)
);

-- 5. Experiments Table
-- Stores records of past experiments/practicals.
CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);

-- 6. Experiment Logs Table
-- Stores the step-by-step logs for each experiment.
CREATE TABLE IF NOT EXISTS experiment_logs (
    id BIGSERIAL PRIMARY KEY,
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    log_text TEXT NOT NULL,
    is_custom_note BOOLEAN DEFAULT FALSE
);

-- Seed initial chemical data
-- This uses INSERT ... ON CONFLICT DO NOTHING to be idempotent as well.
INSERT INTO chemicals (id, name, formula, type, concentration) VALUES
    ('hcl', 'Hydrochloric Acid', 'HCl', 'acid', 0.1),
    ('naoh', 'Sodium Hydroxide', 'NaOH', 'base', 0.1),
    ('phenolphthalein', 'Phenolphthalein', 'C20H14O4', 'indicator', NULL),
    ('h2so4', 'Sulfuric Acid', 'H2SO4', 'acid', 0.1),
    ('koh', 'Potassium Hydroxide', 'KOH', 'base', 0.1),
    ('nacl', 'Sodium Chloride', 'NaCl', 'salt', NULL),
    ('h2o', 'Water', 'H2O', 'solvent', NULL),
    ('kmno4', 'Potassium Permanganate', 'KMnO4', 'oxidant', 0.02),
    ('c2h5oh', 'Ethanol', 'C2H5OH', 'solvent', NULL),
    ('ch3cooh', 'Acetic Acid', 'CH3COOH', 'acid', 0.1),
    ('nh3', 'Ammonia', 'NH3', 'base', 0.1),
    ('methyl_orange', 'Methyl Orange', 'C14H14N3NaO3S', 'indicator', NULL)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies (recommended for Supabase)
-- Make sure to enable Row Level Security on your tables in the Supabase dashboard.
-- These are example policies and should be adjusted for your app's security rules.

-- For users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own data" ON users FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = auth_id);

-- For settings table
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own settings" ON settings FOR ALL USING (
    (SELECT auth_id FROM users WHERE id = user_id) = auth.uid()
);

-- For user_inventory table
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own inventory" ON user_inventory FOR ALL USING (
    (SELECT auth_id FROM users WHERE id = user_id) = auth.uid()
);

-- For experiments and logs
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own experiments" ON experiments FOR ALL USING (
    (SELECT auth_id FROM users WHERE id = user_id) = auth.uid()
);
CREATE POLICY "Users can manage logs for their own experiments" ON experiment_logs FOR ALL USING (
    (SELECT user_id FROM experiments WHERE id = experiment_id) = (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- Chemicals table is public read-only
ALTER TABLE chemicals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access to chemicals" ON chemicals FOR SELECT USING (true);
