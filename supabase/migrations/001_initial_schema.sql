-- ==============================================================================
-- Flora SMK — Database Schema & Initial Migrations
-- Tujuan: Definisi tabel, relasi, RLS policies, indexing, dan fungsi pencarian
-- Caller: Supabase CLI / Supabase SQL Editor
-- Dependensi: PostgreSQL 14+, uuid-ossp extension
-- Main Functions: search_plants
-- Side Effects: Membuat tabel public.profiles, public.plants, public.plant_photos,
--               public.plant_videos, public.school_maps beserta RLS policies
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
DO $$ BEGIN
  CREATE TYPE contribution_status AS ENUM (
    'pending', 'approved', 'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'viewer', 'contributor', 'admin'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table (syncs with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'contributor',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Plants Table (mendukung kategori standar & kategori dinamis CMS)
CREATE TABLE IF NOT EXISTS public.plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_local TEXT NOT NULL,
  name_latin TEXT NOT NULL,
  name_english TEXT,
  aliases TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'lainnya',
  -- Taxonomy (Flat Columns — dipetakan oleh PlantRepository mapper)
  taxonomy_kingdom TEXT DEFAULT 'Plantae',
  taxonomy_divisio TEXT,
  taxonomy_classis TEXT,
  taxonomy_ordo TEXT,
  taxonomy_familia TEXT,
  taxonomy_genus TEXT,
  taxonomy_species TEXT,
  -- Content
  description TEXT NOT NULL,
  -- Location on school map (percentage coords 0.0 - 100.0)
  location_x REAL,
  location_y REAL,
  location_label TEXT,
  -- Meta & Moderation
  status contribution_status NOT NULL DEFAULT 'approved',
  contributor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  contributor_name TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Plant Photos
CREATE TABLE IF NOT EXISTS public.plant_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  label TEXT, -- habitus, daun, bunga, buah, biji
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Plant Videos (Student Explanation Videos)
CREATE TABLE IF NOT EXISTS public.plant_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  title TEXT NOT NULL,
  duration_seconds INT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_by_name TEXT,
  status contribution_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. School Maps
CREATE TABLE IF NOT EXISTS public.school_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_path TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Denah Area SMK Pertanian',
  version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_plants_slug ON public.plants(slug);
CREATE INDEX IF NOT EXISTS idx_plants_category ON public.plants(category);
CREATE INDEX IF NOT EXISTS idx_plants_status ON public.plants(status);
CREATE INDEX IF NOT EXISTS idx_plant_photos_plant_id ON public.plant_photos(plant_id);
CREATE INDEX IF NOT EXISTS idx_plant_videos_plant_id ON public.plant_videos(plant_id);
CREATE INDEX IF NOT EXISTS idx_plant_videos_status ON public.plant_videos(status);

-- Full-text search function
CREATE OR REPLACE FUNCTION search_plants(search_query TEXT)
RETURNS SETOF public.plants AS $$
  SELECT *
  FROM public.plants
  WHERE status = 'approved'
    AND (
      name_local ILIKE '%' || search_query || '%'
      OR name_latin ILIKE '%' || search_query || '%'
      OR COALESCE(name_english, '') ILIKE '%' || search_query || '%'
      OR taxonomy_familia ILIKE '%' || search_query || '%'
      OR search_query = ANY(aliases)
    )
  ORDER BY name_local ASC;
$$ LANGUAGE sql STABLE;

-- RLS Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_maps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Approved plants viewable by everyone" ON public.plants;
CREATE POLICY "Approved plants viewable by everyone" ON public.plants
  FOR SELECT USING (
    status = 'approved' 
    OR contributor_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Contributors can insert plants" ON public.plants;
CREATE POLICY "Contributors can insert plants" ON public.plants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can update plants" ON public.plants;
CREATE POLICY "Admins can update plants" ON public.plants
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete plants" ON public.plants;
CREATE POLICY "Admins can delete plants" ON public.plants
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Photos viewable by everyone" ON public.plant_photos;
CREATE POLICY "Photos viewable by everyone" ON public.plant_photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users can insert photos" ON public.plant_photos;
CREATE POLICY "Auth users can insert photos" ON public.plant_photos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Approved videos viewable by everyone" ON public.plant_videos;
CREATE POLICY "Approved videos viewable by everyone" ON public.plant_videos
  FOR SELECT USING (
    status = 'approved' 
    OR uploaded_by = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Auth users can insert videos" ON public.plant_videos;
CREATE POLICY "Auth users can insert videos" ON public.plant_videos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can update videos" ON public.plant_videos;
CREATE POLICY "Admins can update videos" ON public.plant_videos
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Maps viewable by everyone" ON public.school_maps;
CREATE POLICY "Maps viewable by everyone" ON public.school_maps FOR SELECT USING (true);
