-- Users Table: Stores basic information about each user.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Settings Table: Stores user-specific application settings.
CREATE TABLE settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    appearance_mode TEXT DEFAULT 'system' NOT NULL,
    base_gradient TEXT DEFAULT 'moon' NOT NULL,
    ui_motion_level TEXT DEFAULT 'medium' NOT NULL,
    typography_mode TEXT DEFAULT 'default' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Chemicals Table: Master list of all available chemicals.
CREATE TABLE chemicals (
    id TEXT PRIMARY KEY, -- Using the predefined string ID like 'hcl'
    name TEXT NOT NULL,
    formula TEXT NOT NULL,
    type TEXT NOT NULL,
    concentration NUMERIC
);

-- User Inventory Table: Links users to the chemicals they have acquired.
CREATE TABLE user_inventory (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chemical_id TEXT REFERENCES chemicals(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 NOT NULL, -- Represents number of containers/bottles
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    PRIMARY KEY (user_id, chemical_id)
);

-- Experiments Table: Stores information about each completed experiment.
CREATE TABLE experiments (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Experiment Logs Table: Stores the step-by-step logs for each experiment.
CREATE TABLE experiment_logs (
    id BIGSERIAL PRIMARY KEY,
    experiment_id BIGINT REFERENCES experiments(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    log_text TEXT NOT NULL,
    is_custom_note BOOLEAN DEFAULT FALSE
);

-- Function to automatically update the 'updated_at' timestamp on settings change
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before any update on the settings table
CREATE TRIGGER on_settings_update
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Seed the chemicals table with some initial data
INSERT INTO chemicals (id, name, formula, type, concentration) VALUES
('hcl', 'Hydrochloric Acid', 'HCl', 'acid', 0.1),
('naoh', 'Sodium Hydroxide', 'NaOH', 'base', 0.1),
('phenolphthalein', 'Phenolphthalein', 'C20H14O4', 'indicator', NULL),
('h2so4', 'Sulfuric Acid', 'H2SO4', 'acid', 0.2),
('koh', 'Potassium Hydroxide', 'KOH', 'base', 0.15),
('methyl_orange', 'Methyl Orange', 'C14H14N3NaO3S', 'indicator', NULL),
('acetic_acid', 'Acetic Acid', 'CH3COOH', 'acid', 0.1),
('ammonia', 'Ammonia', 'NH3', 'base', 0.1),
('bromothymol_blue', 'Bromothymol Blue', 'C27H28Br2O5S', 'indicator', NULL);
