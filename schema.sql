-- Supabase Schema for CleanTrack AI

-- Create Profiles Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT
);

-- Create Apartments Table
CREATE TABLE IF NOT EXISTS apartments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create Areas Table
CREATE TABLE IF NOT EXISTS areas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    apartment_id TEXT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE
);

-- Create Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL,
    last_completed_date TEXT,
    next_due_date TEXT NOT NULL,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    area_id TEXT NOT NULL REFERENCES areas(id) ON DELETE CASCADE
);

-- Create Apartment Users (Invitations & Members)
CREATE TABLE IF NOT EXISTS apartment_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apartment_id TEXT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted'
    UNIQUE(apartment_id, email)
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, split_part(new.email, '@', 1));
  
  -- Auto-link pending invitations
  UPDATE public.apartment_users
  SET user_id = new.id
  WHERE email = new.email;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartment_users ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for prototype)
CREATE POLICY "Allow all operations on profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on apartments" ON apartments FOR ALL USING (true);
CREATE POLICY "Allow all operations on areas" ON areas FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on apartment_users" ON apartment_users FOR ALL USING (true);
