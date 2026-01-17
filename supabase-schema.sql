-- SharePoint Image Studio Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team')),
  monthly_generations INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Elements table
CREATE TABLE IF NOT EXISTS public.elements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.elements ENABLE ROW LEVEL SECURITY;

-- Users can only access their own elements
CREATE POLICY "Users can view own elements" ON public.elements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own elements" ON public.elements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own elements" ON public.elements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own elements" ON public.elements
  FOR DELETE USING (auth.uid() = user_id);

-- Generations table
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  generation_type TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  image_url TEXT NOT NULL,
  element_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own generations
CREATE POLICY "Users can view own generations" ON public.generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations" ON public.generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations" ON public.generations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations" ON public.generations
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS elements_user_id_idx ON public.elements(user_id);
CREATE INDEX IF NOT EXISTS elements_created_at_idx ON public.elements(created_at DESC);
CREATE INDEX IF NOT EXISTS generations_user_id_idx ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS generations_created_at_idx ON public.generations(created_at DESC);

-- Function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on elements
DROP TRIGGER IF EXISTS update_elements_updated_at ON public.elements;
CREATE TRIGGER update_elements_updated_at
  BEFORE UPDATE ON public.elements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for element images
INSERT INTO storage.buckets (id, name, public)
VALUES ('elements', 'elements', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for elements bucket
CREATE POLICY "Users can upload own element images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'elements' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view element images"
ON storage.objects FOR SELECT
USING (bucket_id = 'elements');

CREATE POLICY "Users can update own element images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'elements' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own element images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'elements' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
