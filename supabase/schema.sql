-- Create custom types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chemical_type') THEN
        CREATE TYPE chemical_type AS ENUM ('acid', 'base', 'indicator', 'salt', 'solvent', 'oxidant', 'reductant', 'other');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'equipment_type') THEN
        CREATE TYPE equipment_type AS ENUM ('beaker', 'burette', 'pipette', 'cylinder');
    END IF;
END
$$;

-- 1. Users Table
-- Stores basic user profile information.
CREATE TABLE IF NOT EXISTS public.users (
    id UUID NOT NULL PRIMARY KEY DEFAULT auth.uid(),
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Settings Table
-- Stores user-specific settings for the application.
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    appearance_mode TEXT DEFAULT 'system',
    base_gradient TEXT DEFAULT 'moon',
    ui_motion_level TEXT DEFAULT 'medium',
    typography_mode TEXT DEFAULT 'default',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS settings_user_id_idx ON public.settings(user_id);

-- 3. Chemicals Table
-- Master list of all available chemicals.
CREATE TABLE IF NOT EXISTS public.chemicals (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    formula TEXT,
    type chemical_type NOT NULL,
    concentration NUMERIC, -- Molarity (mol/L)
    cas_number TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chemicals_type_idx ON public.chemicals(type);
CREATE INDEX IF NOT EXISTS chemicals_name_idx ON public.chemicals(name);


-- 4. User Inventory Table
-- Join table linking users to the chemicals they possess.
CREATE TABLE IF NOT EXISTS public.user_inventory (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    chemical_id INTEGER NOT NULL REFERENCES public.chemicals(id) ON DELETE CASCADE,
    quantity_ml NUMERIC,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS user_inventory_user_chemical_idx ON public.user_inventory(user_id, chemical_id);

-- 5. Experiments Table
-- Stores records of past experiments conducted by users.
CREATE TABLE IF NOT EXISTS public.experiments (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Experiment Logs Table
-- Stores the step-by-step logs for each experiment.
CREATE TABLE IF NOT EXISTS public.experiment_logs (
    id SERIAL PRIMARY KEY,
    experiment_id INTEGER NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
    log_text TEXT NOT NULL,
    is_custom_note BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS experiment_logs_experiment_id_idx ON public.experiment_logs(experiment_id);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chemicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_logs ENABLE ROW LEVEL SECURITY;


-- Policies for 'users' table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Policies for 'settings' table
DROP POLICY IF EXISTS "Users can view their own settings" ON public.settings;
CREATE POLICY "Users can view their own settings" ON public.settings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own settings" ON public.settings;
CREATE POLICY "Users can manage their own settings" ON public.settings FOR ALL USING (auth.uid() = user_id);

-- Policies for 'chemicals' table
DROP POLICY IF EXISTS "All users can view all chemicals" ON public.chemicals;
CREATE POLICY "All users can view all chemicals" ON public.chemicals FOR SELECT USING (true);

-- Policies for 'user_inventory' table
DROP POLICY IF EXISTS "Users can view their own inventory" ON public.user_inventory;
CREATE POLICY "Users can view their own inventory" ON public.user_inventory FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own inventory" ON public.user_inventory;
CREATE POLICY "Users can manage their own inventory" ON public.user_inventory FOR ALL USING (auth.uid() = user_id);

-- Policies for 'experiments' table
DROP POLICY IF EXISTS "Users can view their own experiments" ON public.experiments;
CREATE POLICY "Users can view their own experiments" ON public.experiments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own experiments" ON public.experiments;
CREATE POLICY "Users can manage their own experiments" ON public.experiments FOR ALL USING (auth.uid() = user_id);

-- Policies for 'experiment_logs' table
DROP POLICY IF EXISTS "Users can view logs for their own experiments" ON public.experiment_logs;
CREATE POLICY "Users can view logs for their own experiments" ON public.experiment_logs FOR SELECT USING (
    (SELECT user_id FROM public.experiments WHERE id = experiment_id) = auth.uid()
);

DROP POLICY IF EXISTS "Users can manage logs for their own experiments" ON public.experiment_logs;
CREATE POLICY "Users can manage logs for their own experiments" ON public.experiment_logs FOR ALL USING (
    (SELECT user_id FROM public.experiments WHERE id = experiment_id) = auth.uid()
);

-- Seed initial chemical data if the table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.chemicals) THEN
    INSERT INTO public.chemicals (name, formula, type, concentration, cas_number) VALUES
    ('Hydrochloric Acid', 'HCl', 'acid', 0.1, '7647-01-0'),
    ('Sodium Hydroxide', 'NaOH', 'base', 0.1, '1310-73-2'),
    ('Phenolphthalein', 'C20H14O4', 'indicator', NULL, '77-09-8'),
    ('Sulfuric Acid', 'H2SO4', 'acid', 0.2, '7664-93-9'),
    ('Potassium Hydroxide', 'KOH', 'base', 0.2, '1310-58-3'),
    ('Nitric Acid', 'HNO3', 'acid', 0.15, '7697-37-2'),
    ('Ammonia', 'NH3', 'base', 0.1, '7664-41-7'),
    ('Acetic Acid', 'CH3COOH', 'acid', 0.1, '64-19-7'),
    ('Sodium Chloride', 'NaCl', 'salt', NULL, '7647-14-5'),
    ('Water', 'H2O', 'solvent', NULL, '7732-18-5'),
    ('Ethanol', 'C2H5OH', 'solvent', NULL, '64-17-5'),
    ('Methyl Orange', 'C14H14N3NaO3S', 'indicator', NULL, '547-58-0'),
    ('Bromothymol Blue', 'C27H28Br2O5S', 'indicator', NULL, '76-59-5'),
    ('Potassium Permanganate', 'KMnO4', 'oxidant', 0.02, '7722-64-7'),
    ('Sodium Thiosulfate', 'Na2S2O3', 'reductant', 0.1, '7772-98-7');
  END IF;
END $$;
