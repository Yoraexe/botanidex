-- ==============================================================================
-- Flora SMK — Migration 002: Plant Quantity & Population Unit
-- Tujuan: Menambahkan kolom kuantitas dan satuan populasi pada tabel tanaman
-- Caller: Supabase CLI / Supabase SQL Editor
-- Dependensi: 001_initial_schema.sql
-- Side Effects: Menambahkan kolom quantity dan unit pada public.plants
-- ==============================================================================

ALTER TABLE public.plants 
ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'pohon';

-- Update comment
COMMENT ON COLUMN public.plants.quantity IS 'Jumlah populasi tanaman atau spesimen di area sekolah';
COMMENT ON COLUMN public.plants.unit IS 'Satuan kuantitas (pohon, rumpun, polybag, pot, bedeng, batang)';
