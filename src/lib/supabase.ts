// ==============================================================================
// Botanidex — Supabase Client & Connection Manager
// Tujuan: Inisialisasi klien Supabase dengan fallback offline-safe
// Caller: Repositories (plant, contribution, user, storage)
// Dependensi: @supabase/supabase-js
// Main Functions: supabase, isSupabaseConfigured
// Side Effects: Inisialisasi koneksi websocket/REST client Supabase
// ==============================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://mock-supabase.local';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key-local';

export const isSupabaseConfigured = (): boolean => {
	return (
		Boolean(supabaseUrl) &&
		!supabaseUrl.includes('mock-supabase.local') &&
		!supabaseUrl.includes('your-project') &&
		Boolean(supabaseAnonKey) &&
		!supabaseAnonKey.includes('mock-anon-key') &&
		!supabaseAnonKey.includes('your-anon-key')
	);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true
	}
});
