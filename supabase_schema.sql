-- Supabase Schema for LabSphere Application

-- 1. User Profiles
-- This table stores user-specific settings and links to Supabase's built-in auth.
-- The `id` column should be linked to the `id` from the `auth.users` table.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  appearance_mode TEXT DEFAULT 'system',
  base_gradient TEXT DEFAULT 'moon',
  ui_motion_level TEXT DEFAULT 'medium',
  typography_mode TEXT DEFAULT 'default',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy: Users can see and update their own profile.
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. Chemical Definitions
-- This table stores the master list of all available chemicals.
CREATE TABLE public.chemical_definitions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    formula TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('acid', 'base', 'indicator', 'salt', 'solvent', 'oxidant', 'reductant', 'other')),
    concentration NUMERIC, -- Molarity (mol/L)
    cas_number TEXT UNIQUE, -- Chemical Abstracts Service number
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy: All authenticated users can read chemical definitions.
CREATE POLICY "Allow authenticated read access to chemical definitions" ON public.chemical_definitions FOR SELECT TO authenticated USING (true);


-- 3. User Inventory
-- This table tracks which chemicals a user has in their personal inventory.
CREATE TABLE public.user_inventory (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chemical_id INTEGER NOT NULL REFERENCES public.chemical_definitions(id) ON DELETE CASCADE,
  quantity_ml NUMERIC NOT NULL DEFAULT 100.0, -- Default quantity when added
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chemical_id) -- Ensures a user has only one entry per chemical
);

-- Policy: Users can manage their own inventory.
CREATE POLICY "Users can manage their own inventory" ON public.user_inventory FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 4. Past Practicals (Experiments)
-- This table will store the results and logs of completed experiments.
CREATE TABLE public.past_practicals (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  final_ph NUMERIC,
  final_color TEXT,
  total_titrant_volume_ml NUMERIC,
  notes TEXT,
  logs JSONB -- Store the array of lab log objects
);

-- Policy: Users can manage their own experiment history.
CREATE POLICY "Users can manage their own practicals" ON public.past_practicals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable Row Level Security for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chemical_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_practicals ENABLE ROW LEVEL SECURITY;

-- Add a function to handle new user sign-ups
-- This trigger automatically creates a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
