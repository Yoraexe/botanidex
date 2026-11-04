-- ==============================================================================
-- Flora SMK — Migration 004: Security Hardening & Strict RLS Enforcement
-- Tujuan: Menutup celah eskalasi privilege, bypass moderasi, IDOR, dan kebocoran data
-- Caller: Supabase CLI / Supabase SQL Editor
-- Dependensi: 001_initial_schema.sql, 002_add_quantity_and_categories.sql, 003_app_config.sql
-- Side Effects: Memperbarui RLS policies pada profiles, plants, plant_photos, plant_videos
-- ==============================================================================

-- 1. HARDENING PROFILES TABLE
-- Mencegah user mengubah kolom role miliknya menjadi admin (SEC-01)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND (
      role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Izinkan pembuatan profil baru saat registrasi hanya dengan role 'contributor' (SEC-01)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id AND (
      role = 'contributor'
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Batasi pembacaan seluruh data profile hanya untuk user yang telah terotentikasi (SEC-05)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);


-- 2. HARDENING PLANTS TABLE
-- Cegah bypass moderasi: Siswa hanya dapat memasukkan tanaman dengan status 'pending' (SEC-02)
DROP POLICY IF EXISTS "Contributors can insert plants" ON public.plants;
CREATE POLICY "Contributors can insert plants" ON public.plants
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    (contributor_id = auth.uid() OR contributor_id IS NULL) AND
    (
      status = 'pending'
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Izinkan kontributor merevisi tanaman miliknya sendiri yang masih pending / rejected
-- Revisi otomatis mereset status ke 'pending' untuk diverifikasi ulang oleh guru (SEC-02, SEC-08)
DROP POLICY IF EXISTS "Contributors can update own pending plants" ON public.plants;
CREATE POLICY "Contributors can update own pending plants" ON public.plants
  FOR UPDATE USING (
    contributor_id = auth.uid() AND status IN ('pending', 'rejected')
  )
  WITH CHECK (
    contributor_id = auth.uid() AND status = 'pending'
  );

-- Pertahankan wewenang Admin untuk memperbarui status dan semua kolom tanaman
DROP POLICY IF EXISTS "Admins can update plants" ON public.plants;
CREATE POLICY "Admins can update plants" ON public.plants
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- 3. HARDENING PLANT PHOTOS TABLE
-- Tambahkan DELETE policy agar foto lama dapat dihapus saat revisi/edit (SEC-08)
DROP POLICY IF EXISTS "Photos can be deleted by plant owner or admin" ON public.plant_photos;
CREATE POLICY "Photos can be deleted by plant owner or admin" ON public.plant_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.plants 
      WHERE id = plant_photos.plant_id 
        AND (
          contributor_id = auth.uid() 
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
    )
  );


-- 4. HARDENING PLANT VIDEOS TABLE
-- Video baru dari siswa wajib berstatus 'pending' (SEC-02)
DROP POLICY IF EXISTS "Auth users can insert videos" ON public.plant_videos;
CREATE POLICY "Auth users can insert videos" ON public.plant_videos
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    (uploaded_by = auth.uid() OR uploaded_by IS NULL) AND
    (
      status = 'pending'
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Tambahkan DELETE policy untuk video tanaman (SEC-08)
DROP POLICY IF EXISTS "Videos can be deleted by owner or admin" ON public.plant_videos;
CREATE POLICY "Videos can be deleted by owner or admin" ON public.plant_videos
  FOR DELETE USING (
    uploaded_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
