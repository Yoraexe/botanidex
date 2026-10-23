// ==============================================================================
// Botanidex — Plant Data Repository
// Tujuan: Data access layer untuk entitas tanaman (Supabase query dengan mapper & offline fallback)
// Caller: src/lib/services/plant.service.ts, src/lib/repositories/map.repository.ts
// Dependensi: src/lib/supabase.ts, src/lib/data/seed-plants.ts, src/lib/types/plant.types.ts
// Main Functions: mapDbRowToPlant, mapPlantToDbRow, getApprovedPlants, getPlantBySlug, getPlantById, getAllPlants, insertPlant, updatePlantStatus
// Side Effects: Read/write ke Supabase PostgreSQL atau browser localStorage fallback
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import { INITIAL_PLANTS_DATA } from '../data/seed-plants';
import type { Plant, PlantFilterOptions, ContributionStatus, PlantTaxonomy } from '../types/plant.types';

const LOCAL_STORAGE_KEY = 'flora_smk_plants_store_v4';

// In-memory cache for SSR & offline synchronization
let memoryPlants: Plant[] = [...INITIAL_PLANTS_DATA];

/**
 * Memetakan baris tabel PostgreSQL (flat taxonomy columns) menjadi objek domain Plant
 */
export function mapDbRowToPlant(row: Record<string, any>): Plant {
	const nestedTaxonomy: PlantTaxonomy = row.taxonomy
		? {
				kingdom: row.taxonomy.kingdom || 'Plantae',
				divisio: row.taxonomy.divisio || undefined,
				classis: row.taxonomy.classis || undefined,
				ordo: row.taxonomy.ordo || undefined,
				familia: row.taxonomy.familia || undefined,
				genus: row.taxonomy.genus || undefined,
				species: row.taxonomy.species || undefined
			}
		: {
				kingdom: row.taxonomy_kingdom || 'Plantae',
				divisio: row.taxonomy_divisio || undefined,
				classis: row.taxonomy_classis || undefined,
				ordo: row.taxonomy_ordo || undefined,
				familia: row.taxonomy_familia || undefined,
				genus: row.taxonomy_genus || undefined,
				species: row.taxonomy_species || undefined
			};

	return {
		id: String(row.id),
		slug: String(row.slug),
		name_local: String(row.name_local),
		name_latin: String(row.name_latin),
		name_english: row.name_english || undefined,
		aliases: Array.isArray(row.aliases) ? row.aliases : [],
		category: row.category || 'lainnya',
		taxonomy: nestedTaxonomy,
		description: String(row.description || ''),
		location_x: typeof row.location_x === 'number' ? row.location_x : undefined,
		location_y: typeof row.location_y === 'number' ? row.location_y : undefined,
		location_label: row.location_label || undefined,
		status: (row.status as ContributionStatus) || 'approved',
		contributor_id: row.contributor_id || undefined,
		contributor_name: row.contributor_name || undefined,
		reviewed_by: row.reviewed_by || undefined,
		rejection_reason: row.rejection_reason || undefined,
		photos: Array.isArray(row.photos) ? row.photos : [],
		videos: Array.isArray(row.videos) ? row.videos : [],
		created_at: row.created_at || new Date().toISOString(),
		updated_at: row.updated_at || new Date().toISOString()
	};
}

/**
 * Memetakan objek domain Plant menjadi struktur kolom flat untuk tabel public.plants di Supabase
 */
export function mapPlantToDbRow(plant: Plant): Record<string, any> {
	return {
		id: plant.id,
		slug: plant.slug,
		name_local: plant.name_local,
		name_latin: plant.name_latin,
		name_english: plant.name_english ?? null,
		aliases: plant.aliases ?? [],
		category: plant.category,
		taxonomy_kingdom: plant.taxonomy?.kingdom || 'Plantae',
		taxonomy_divisio: plant.taxonomy?.divisio ?? null,
		taxonomy_classis: plant.taxonomy?.classis ?? null,
		taxonomy_ordo: plant.taxonomy?.ordo ?? null,
		taxonomy_familia: plant.taxonomy?.familia ?? null,
		taxonomy_genus: plant.taxonomy?.genus ?? null,
		taxonomy_species: plant.taxonomy?.species ?? null,
		description: plant.description,
		location_x: plant.location_x ?? null,
		location_y: plant.location_y ?? null,
		location_label: plant.location_label ?? null,
		status: plant.status,
		contributor_id: plant.contributor_id ?? null,
		contributor_name: plant.contributor_name ?? null,
		reviewed_by: plant.reviewed_by ?? null,
		rejection_reason: plant.rejection_reason ?? null,
		created_at: plant.created_at,
		updated_at: plant.updated_at
	};
}

function loadLocalPlants(): Plant[] {
	if (typeof window === 'undefined') {
		return memoryPlants;
	}
	try {
		const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed) && parsed.length > 0) {
				memoryPlants = parsed.map(mapDbRowToPlant);
				return memoryPlants;
			}
		}
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
					.select(
						`
						*,
						photos:plant_photos(*),
						videos:plant_videos(*)
					`
					)
					.eq('status', 'approved')
					.order('name_local', { ascending: true });

				if (filters?.category && filters.category !== 'semua') {
					query = query.eq('category', filters.category);
				}

				if (filters?.query && filters.query.trim().length > 0) {
					const search = filters.query.trim();
					query = query.or(
						`name_local.ilike.%${search}%,name_latin.ilike.%${search}%,name_english.ilike.%${search}%,taxonomy_familia.ilike.%${search}%`
					);
				}

				const { data, error } = await query;
				if (!error && data) {
					return data.map(mapDbRowToPlant);
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

			if (
				filters?.category &&
				filters.category !== 'semua' &&
				plant.category !== filters.category
			) {
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
					.select(
						`
						*,
						photos:plant_photos(*),
						videos:plant_videos(*)
					`
					)
					.eq('slug', slug)
					.single();

				if (!error && data) {
					return mapDbRowToPlant(data);
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
					.select(
						`
						*,
						photos:plant_photos(*),
						videos:plant_videos(*)
					`
					)
					.eq('id', id)
					.single();

				if (!error && data) {
					return mapDbRowToPlant(data);
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
					.select(
						`
						*,
						photos:plant_photos(*),
						videos:plant_videos(*)
					`
					)
					.order('created_at', { ascending: false });

				if (status) {
					query = query.eq('status', status);
				}

				const { data, error } = await query;
				if (!error && data) {
					return data.map(mapDbRowToPlant);
				}
			} catch (err) {
				console.warn('Koneksi Supabase getAllPlants gagal:', err);
			}
		}

		const plants = loadLocalPlants();
		if (status) {
			return plants.filter((p) => p.status === status);
		}
		return [...plants].sort(
			(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		);
	}

	/**
	 * Menyimpan entitas tanaman baru (kontribusi siswa atau input guru)
	 */
	static async insertPlant(newPlant: Plant): Promise<Plant> {
		if (isSupabaseConfigured()) {
			try {
				const plantRow = mapPlantToDbRow(newPlant);
				const { data, error } = await supabase
					.from('plants')
					.insert([plantRow])
					.select()
					.single();

				if (!error && data) {
					if (newPlant.photos.length > 0) {
						await supabase.from('plant_photos').insert(
							newPlant.photos.map((p) => ({
								id: p.id,
								plant_id: data.id,
								storage_path: p.storage_path,
								label: p.label ?? null,
								sort_order: p.sort_order,
								created_at: p.created_at
							}))
						);
					}
					if (newPlant.videos.length > 0) {
						await supabase.from('plant_videos').insert(
							newPlant.videos.map((v) => ({
								id: v.id,
								plant_id: data.id,
								storage_path: v.storage_path,
								thumbnail_path: v.thumbnail_path ?? null,
								title: v.title,
								duration_seconds: v.duration_seconds ?? null,
								uploaded_by: v.uploaded_by ?? null,
								uploaded_by_name: v.uploaded_by_name ?? null,
								status: v.status,
								created_at: v.created_at
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
	 * Mengupdate status moderasi tanaman beserta video terkait (approve / reject)
	 */
	static async updatePlantStatus(
		id: string,
		status: ContributionStatus,
		rejectionReason?: string
	): Promise<boolean> {
		const now = new Date().toISOString();

		if (isSupabaseConfigured()) {
			try {
				const { error } = await supabase
					.from('plants')
					.update({
						status,
						rejection_reason: rejectionReason || null,
						updated_at: now
					})
					.eq('id', id);

				if (!error) {
					await supabase
						.from('plant_videos')
						.update({
							status,
							rejection_reason: rejectionReason || null
						})
						.eq('plant_id', id);
					return true;
				}
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
					videos: (p.videos || []).map((v) => ({
						...v,
						status,
						rejection_reason: rejectionReason || undefined
					})),
					updated_at: now
				};
			}
			return p;
		});
		saveLocalPlants(updated);
		return true;
	}
}
