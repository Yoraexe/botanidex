-- ==============================================================================
-- Flora SMK — Migration 003: Dynamic App Configuration Sync
-- Tujuan: Membuat tabel public.app_config untuk menyimpan identitas sekolah, galeri kebun,
--         spesimen showcase, dan kategori botani dinamis secara terpusat di Supabase.
-- Caller: ConfigRepository (src/lib/repositories/config.repository.ts)
-- Dependensi: 001_initial_schema.sql, public.profiles
-- Side Effects: Membuat tabel public.app_config beserta RLS policies
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.app_config (
  id TEXT PRIMARY KEY DEFAULT 'default_config',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Indexing untuk query pencarian/fetch konfigurasi
CREATE INDEX IF NOT EXISTS idx_app_config_updated_at ON public.app_config(updated_at DESC);

-- Enable RLS
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- 1. Semua pengguna (publik/tamu, siswa, guru) dapat membaca konfigurasi aplikasi
DROP POLICY IF EXISTS "App config viewable by everyone" ON public.app_config;
CREATE POLICY "App config viewable by everyone" ON public.app_config
  FOR SELECT USING (true);

-- 2. Hanya akun Guru/Admin yang diizinkan menyisipkan atau memperbarui konfigurasi
DROP POLICY IF EXISTS "Admins can insert app config" ON public.app_config;
CREATE POLICY "Admins can insert app config" ON public.app_config
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update app config" ON public.app_config;
CREATE POLICY "Admins can update app config" ON public.app_config
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

COMMENT ON TABLE public.app_config IS 'Menyimpan konfigurasi CMS dinamis (identitas sekolah, hero, foto kebun, kategori botani) tersinkronisasi lintas perangkat';
