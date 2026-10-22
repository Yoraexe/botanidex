// ==============================================================================
// Flora SMK — Plant Data Repository
// Tujuan: Data access layer untuk entitas tanaman (Supabase query dengan offline fallback)
// Caller: src/lib/services/plant.service.ts
// Dependensi: src/lib/supabase.ts, src/lib/data/seed-plants.ts, src/lib/types/plant.types.ts
// Main Functions: getApprovedPlants, getPlantBySlug, getPlantById, insertPlant, updatePlantStatus
// Side Effects: Read/write ke Supabase PostgreSQL atau browser localStorage fallback
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import { INITIAL_PLANTS_DATA } from '../data/seed-plants';
import type { Plant, PlantFilterOptions, ContributionStatus } from '../types/plant.types';

const LOCAL_STORAGE_KEY = 'flora_smk_plants_store_v1';

// In-memory cache for SSR & offline synchronization
let memoryPlants: Plant[] = [...INITIAL_PLANTS_DATA];

function loadLocalPlants(): Plant[] {
	if (typeof window === 'undefined') {
		return memoryPlants;
	}
	try {
		const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed) && parsed.length > 0) {
				memoryPlants = parsed;
				return parsed;
			}
		}
		// Inisialisasi awal ke localStorage
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PLANTS_DATA));
	} catch (err) {
		console.warn('Gagal membaca localStorage tanaman, menggunakan in-memory fallback:', err);
	}
	return memoryPlants;
}

function saveLocalPlants(plants: Plant[]): void {
	memoryPlants = plants;
	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plants));
		} catch (err) {
			console.warn('Gagal menyimpan ke localStorage:', err);
		}
	}
}

export class PlantRepository {
	/**
	 * Mengambil daftar seluruh tanaman yang berstatus approved
	 */
	static async getApprovedPlants(filters?: PlantFilterOptions): Promise<Plant[]> {
		if (isSupabaseConfigured()) {
			try {
				let query = supabase
					.from('plants')
					.select(`
						*,
						photos:plant_photos(*),
						videos:plant_videos(*)
					`)
					.eq('status', 'approved')
					.order('name_local', { ascending: true });

				if (filters?.category && filters.category !== 'semua') {
					query = query.eq('category', filters.category);
				}

				if (filters?.query && filters.query.trim().length > 0) {
					const search = filters.query.trim();
					query = query.or(`name_local.ilike.%${search}%,name_latin.ilike.%${search}%,name_english.ilike.%${search}%`);
				}

				const { data, error } = await query;
				if (!error && data) {
					return data as Plant[];
				}
				console.warn('Supabase query error, fallback ke local storage:', error?.message);
			} catch (err) {
				console.warn('Koneksi Supabase gagal, fallback ke offline store:', err);
			}
		}

		// Fallback offline store
		const allPlants = loadLocalPlants();
		return allPlants.filter((plant) => {
			if (plant.status !== 'approved') return false;

			if (filters?.category && filters.category !== 'semua' && plant.category !== filters.category) {
				return false;
			}

			if (filters?.query && filters.query.trim().length > 0) {
				const q = filters.query.toLowerCase().trim();
				const matchName = plant.name_local.toLowerCase().includes(q);
				const matchLatin = plant.name_latin.toLowerCase().includes(q);
				const matchEn = plant.name_english?.toLowerCase().includes(q);
				const matchAlias = plant.aliases.some((a) => a.toLowerCase().includes(q));
				const matchFamily = plant.taxonomy.familia?.toLowerCase().includes(q);
				if (!matchName && !matchLatin && !matchEn && !matchAlias && !matchFamily) {
					return false;
				}
			}

			return true;
		});
	}

	/**
	 * Mengambil tanaman berdasarkan slug URL
	 */
	static async getPlantBySlug(slug: string): Promise<Plant | null> {
		if (isSupabaseConfigured()) {
			try {
				const { data, error } = await supabase
					.from('plants')
					.select(`
						*,
						photos:plant_photos(*),
						videos:plant_videos(*)
					`)
					.eq('slug', slug)
					.single();

				if (!error && data) {
					return data as Plant;
				}
			} catch (err) {
				console.warn('Koneksi Supabase getPlantBySlug gagal:', err);
			}
		}

		const plants = loadLocalPlants();
		const found = plants.find((p) => p.slug === slug);
		return found || null;
	}

	/**
	 * Mengambil tanaman berdasarkan ID
	 */
	static async getPlantById(id: string): Promise<Plant | null> {
		if (isSupabaseConfigured()) {
			try {
				const { data, error } = await supabase
					.from('plants')
					.select(`
						*,
						photos:plant_photos(*),
						videos:plant_videos(*)
					`)
					.eq('id', id)
					.single();

				if (!error && data) {
					return data as Plant;
				}
			} catch (err) {
				console.warn('Koneksi Supabase getPlantById gagal:', err);
			}
		}

		const plants = loadLocalPlants();
		const found = plants.find((p) => p.id === id);
		return found || null;
	}

	/**
	 * Mengambil seluruh tanaman untuk keperluan moderasi/admin (termasuk pending & rejected)
	 */
	static async getAllPlants(status?: ContributionStatus): Promise<Plant[]> {
		if (isSupabaseConfigured()) {
			try {
				let query = supabase
					.from('plants')
					.select(`
						*,
						photos:plant_photos(*),
						videos:plant_videos(*)
					`)
					.order('created_at', { ascending: false });

				if (status) {
					query = query.eq('status', status);
				}

				const { data, error } = await query;
				if (!error && data) {
					return data as Plant[];
				}
			} catch (err) {
				console.warn('Koneksi Supabase getAllPlants gagal:', err);
			}
		}

		const plants = loadLocalPlants();
		if (status) {
			return plants.filter((p) => p.status === status);
		}
		return [...plants].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
	}

	/**
	 * Menyimpan entitas tanaman baru (kontribusi siswa atau input guru)
	 */
	static async insertPlant(newPlant: Plant): Promise<Plant> {
		if (isSupabaseConfigured()) {
			try {
				const { photos, videos, ...plantRow } = newPlant;
				const { data, error } = await supabase
					.from('plants')
					.insert([plantRow])
					.select()
					.single();

				if (!error && data) {
					// Simpan photos jika ada
					if (photos.length > 0) {
						await supabase.from('plant_photos').insert(
							photos.map((p) => ({
								...p,
								plant_id: data.id
							}))
						);
					}
					// Simpan videos jika ada
					if (videos.length > 0) {
						await supabase.from('plant_videos').insert(
							videos.map((v) => ({
								...v,
								plant_id: data.id
							}))
						);
					}
					return newPlant;
				}
			} catch (err) {
				console.warn('Gagal insert ke Supabase, simpan ke local fallback:', err);
			}
		}

		const current = loadLocalPlants();
		const updated = [newPlant, ...current];
		saveLocalPlants(updated);
		return newPlant;
	}

	/**
	 * Mengupdate status moderasi tanaman (approve / reject)
	 */
	static async updatePlantStatus(
		id: string,
		status: ContributionStatus,
		rejectionReason?: string
	): Promise<boolean> {
		if (isSupabaseConfigured()) {
			try {
				const { error } = await supabase
					.from('plants')
					.update({
						status,
						rejection_reason: rejectionReason || null,
						updated_at: new Date().toISOString()
					})
					.eq('id', id);

				if (!error) return true;
			} catch (err) {
				console.warn('Gagal update status di Supabase:', err);
			}
		}

		const current = loadLocalPlants();
		const updated = current.map((p) => {
			if (p.id === id) {
				return {
					...p,
					status,
					rejection_reason: rejectionReason || undefined,
					updated_at: new Date().toISOString()
				};
			}
			return p;
		});
		saveLocalPlants(updated);
		return true;
	}
}
