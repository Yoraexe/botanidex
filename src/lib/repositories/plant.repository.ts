// ==============================================================================
// Botanidex — Plant Data Repository
// Tujuan: Data access layer untuk entitas tanaman (Supabase query dengan mapper & offline fallback)
// Caller: src/lib/services/plant.service.ts
// Dependensi: src/lib/supabase.ts, src/lib/data/seed-plants.ts, src/lib/types/plant.types.ts
// Main Functions: mapDbRowToPlant, mapPlantToDbRow, getApprovedPlants, getPlantBySlug, getPlantById, getAllPlants, insertPlant, updatePlant, deletePlant, updatePlantStatus
// Side Effects: Read/write ke Supabase PostgreSQL atau browser localStorage fallback
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import { INITIAL_PLANTS_DATA } from '../data/seed-plants';
import type { Plant, PlantFilterOptions, ContributionStatus, PlantTaxonomy } from '../types/plant.types';

const LOCAL_STORAGE_KEY = 'flora_smk_plants_store_v4';
const PLANT_RELATIONS = '*, photos:plant_photos(*), videos:plant_videos(*)';

let memoryPlants: Plant[] = structuredClone(INITIAL_PLANTS_DATA);

export function mapDbRowToPlant(row: Record<string, any>): Plant {
	const src = row.taxonomy || {};
	const taxonomy: PlantTaxonomy = {
		kingdom: src.kingdom || row.taxonomy_kingdom || 'Plantae',
		divisio: src.divisio || row.taxonomy_divisio || undefined,
		classis: src.classis || row.taxonomy_classis || undefined,
		ordo: src.ordo || row.taxonomy_ordo || undefined,
		familia: src.familia || row.taxonomy_familia || undefined,
		genus: src.genus || row.taxonomy_genus || undefined,
		species: src.species || row.taxonomy_species || undefined
	};
	const now = new Date().toISOString();
	return {
		id: String(row.id), slug: String(row.slug), name_local: String(row.name_local), name_latin: String(row.name_latin),
		name_english: row.name_english || undefined, aliases: Array.isArray(row.aliases) ? row.aliases : [],
		category: row.category || 'lainnya', taxonomy, description: String(row.description || ''),
		quantity: typeof row.quantity === 'number' && row.quantity > 0 ? row.quantity : 1,
		unit: row.unit || 'pohon',
		location_x: typeof row.location_x === 'number' ? row.location_x : undefined,
		location_y: typeof row.location_y === 'number' ? row.location_y : undefined,
		location_label: row.location_label || undefined, status: (row.status as ContributionStatus) || 'approved',
		contributor_id: row.contributor_id || undefined, contributor_name: row.contributor_name || undefined,
		reviewed_by: row.reviewed_by || undefined, rejection_reason: row.rejection_reason || undefined,
		photos: Array.isArray(row.photos) ? row.photos : [], videos: Array.isArray(row.videos) ? row.videos : [],
		created_at: row.created_at || now, updated_at: row.updated_at || now
	};
}

export function mapPlantToDbRow(plant: Plant): Record<string, any> {
	const t = plant.taxonomy;
	return {
		id: plant.id, slug: plant.slug, name_local: plant.name_local, name_latin: plant.name_latin,
		name_english: plant.name_english ?? null, aliases: plant.aliases ?? [], category: plant.category,
		quantity: plant.quantity ?? 1, unit: plant.unit ?? 'pohon',
		taxonomy_kingdom: t?.kingdom || 'Plantae', taxonomy_divisio: t?.divisio ?? null,
		taxonomy_classis: t?.classis ?? null, taxonomy_ordo: t?.ordo ?? null,
		taxonomy_familia: t?.familia ?? null, taxonomy_genus: t?.genus ?? null, taxonomy_species: t?.species ?? null,
		description: plant.description, location_x: plant.location_x ?? null, location_y: plant.location_y ?? null,
		location_label: plant.location_label ?? null, status: plant.status,
		contributor_id: plant.contributor_id ?? null, contributor_name: plant.contributor_name ?? null,
		reviewed_by: plant.reviewed_by ?? null, rejection_reason: plant.rejection_reason ?? null,
		created_at: plant.created_at, updated_at: plant.updated_at
	};
}

function loadLocalPlants(): Plant[] {
	if (typeof window === 'undefined') return memoryPlants;
	try {
		const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed) && parsed.length > 0) return (memoryPlants = parsed.map(mapDbRowToPlant));
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
		try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plants)); } catch (err) { console.warn('Gagal menyimpan ke localStorage:', err); }
	}
}

export class PlantRepository {
	static async getApprovedPlants(filters?: PlantFilterOptions): Promise<Plant[]> {
		if (isSupabaseConfigured()) {
			try {
				let query = supabase.from('plants').select(PLANT_RELATIONS).eq('status', 'approved').order('name_local', { ascending: true });
				if (filters?.category && filters.category !== 'semua') query = query.eq('category', filters.category);
				// ADV-05 Hardening: Sanitasi PostgREST query filter dari simbol berbahaya (. , : ( ) % * " \)
				const s = filters?.query?.replace(/[^a-zA-Z0-9\s\-_']/g, ' ').replace(/\s+/g, ' ').trim();
				if (s) query = query.or(`name_local.ilike.%${s}%,name_latin.ilike.%${s}%,name_english.ilike.%${s}%,taxonomy_familia.ilike.%${s}%`);
				const { data, error } = await query;
				if (!error && data) return data.map(mapDbRowToPlant);
			} catch (err) {
				console.warn('Koneksi Supabase gagal, fallback ke offline store:', err);
			}
		}

		const q = filters?.query?.toLowerCase().trim();
		return loadLocalPlants().filter((p) => {
			if (p.status !== 'approved') return false;
			if (filters?.category && filters.category !== 'semua' && p.category !== filters.category) return false;
			if (!q) return true;
			return [p.name_local, p.name_latin, p.name_english, p.taxonomy.familia, ...p.aliases].some((f) => f?.toLowerCase().includes(q));
		});
	}

	static async getPlantBySlug(slug: string): Promise<Plant | null> {
		if (isSupabaseConfigured()) {
			try {
				const { data, error } = await supabase.from('plants').select(PLANT_RELATIONS).eq('slug', slug).single();
				if (!error && data) return mapDbRowToPlant(data);
			} catch (err) {
				console.warn('Koneksi Supabase getPlantBySlug gagal:', err);
			}
		}
		return loadLocalPlants().find((p) => p.slug === slug) || null;
	}

	static async getPlantById(id: string): Promise<Plant | null> {
		if (isSupabaseConfigured()) {
			try {
				const { data, error } = await supabase.from('plants').select(PLANT_RELATIONS).eq('id', id).single();
				if (!error && data) return mapDbRowToPlant(data);
			} catch (err) {
				console.warn('Koneksi Supabase getPlantById gagal:', err);
			}
		}
		return loadLocalPlants().find((p) => p.id === id) || null;
	}

	static async getAllPlants(status?: ContributionStatus): Promise<Plant[]> {
		if (isSupabaseConfigured()) {
			try {
				let query = supabase.from('plants').select(PLANT_RELATIONS).order('created_at', { ascending: false });
				if (status) query = query.eq('status', status);
				const { data, error } = await query;
				if (!error && data) return data.map(mapDbRowToPlant);
			} catch (err) {
				console.warn('Koneksi Supabase getAllPlants gagal:', err);
			}
		}
		const plants = loadLocalPlants();
		return (status ? plants.filter((p) => p.status === status) : [...plants]).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
	}

	static async insertPlant(newPlant: Plant): Promise<Plant> {
		if (isSupabaseConfigured()) {
			try {
				const { data, error } = await supabase.from('plants').insert([mapPlantToDbRow(newPlant)]).select().single();
				if (!error && data) {
					if (newPlant.photos.length > 0) {
						await supabase.from('plant_photos').insert(newPlant.photos.map((p) => ({ id: p.id, plant_id: data.id, storage_path: p.storage_path, label: p.label ?? null, sort_order: p.sort_order, created_at: p.created_at })));
					}
					if (newPlant.videos.length > 0) {
						await supabase.from('plant_videos').insert(newPlant.videos.map((v) => ({ id: v.id, plant_id: data.id, storage_path: v.storage_path, thumbnail_path: v.thumbnail_path ?? null, title: v.title, duration_seconds: v.duration_seconds ?? null, uploaded_by: v.uploaded_by ?? null, uploaded_by_name: v.uploaded_by_name ?? null, status: v.status, created_at: v.created_at })));
					}
					return newPlant;
				}
			} catch (err) {
				console.warn('Gagal insert ke Supabase, simpan ke local fallback:', err);
			}
		}
		saveLocalPlants([newPlant, ...loadLocalPlants()]);
		return newPlant;
	}

	static async updatePlant(updatedPlant: Plant): Promise<Plant> {
		const now = new Date().toISOString();
		const finalPlant: Plant = { ...updatedPlant, updated_at: now };

		if (isSupabaseConfigured()) {
			try {
				const dbRow = mapPlantToDbRow(finalPlant);
				const { error } = await supabase.from('plants').update(dbRow).eq('id', finalPlant.id);
				if (!error) {
					await supabase.from('plant_photos').delete().eq('plant_id', finalPlant.id);
					if (finalPlant.photos.length > 0) {
						await supabase.from('plant_photos').insert(
							finalPlant.photos.map((p) => ({
								id: p.id,
								plant_id: finalPlant.id,
								storage_path: p.storage_path,
								label: p.label ?? null,
								sort_order: p.sort_order,
								created_at: p.created_at || now
							}))
						);
					}
					if (finalPlant.videos.length > 0) {
						await supabase.from('plant_videos').delete().eq('plant_id', finalPlant.id);
						await supabase.from('plant_videos').insert(
							finalPlant.videos.map((v) => ({
								id: v.id,
								plant_id: finalPlant.id,
								storage_path: v.storage_path,
								thumbnail_path: v.thumbnail_path ?? null,
								title: v.title,
								duration_seconds: v.duration_seconds ?? null,
								uploaded_by: v.uploaded_by ?? null,
								uploaded_by_name: v.uploaded_by_name ?? null,
								status: v.status,
								created_at: v.created_at || now
							}))
						);
					}
				} else {
					console.warn('Gagal update plant di Supabase:', error.message);
					// SEC-08 & Anti-Silent Failure: Lempar error jika koneksi Supabase live gagal menyimpan
					throw new Error(`Gagal memperbarui data tanaman di server: ${error.message}`);
				}
			} catch (err) {
				console.warn('Supabase updatePlant exception:', err);
				throw err;
			}
		}

		const localList = loadLocalPlants();
		const idx = localList.findIndex((p) => p.id === finalPlant.id);
		if (idx !== -1) {
			localList[idx] = finalPlant;
			saveLocalPlants([...localList]);
		} else {
			saveLocalPlants([finalPlant, ...localList]);
		}
		return finalPlant;
	}

	static async deletePlant(id: string): Promise<boolean> {
		if (isSupabaseConfigured()) {
			try {
				const { error } = await supabase.from('plants').delete().eq('id', id);
				if (error) {
					console.warn('Gagal delete plant dari Supabase:', error.message);
					throw new Error(`Gagal menghapus tanaman dari server: ${error.message}`);
				}
			} catch (err) {
				console.warn('Supabase deletePlant exception:', err);
				throw err;
			}
		}
		saveLocalPlants(loadLocalPlants().filter((p) => p.id !== id));
		return true;
	}

	static async updatePlantStatus(id: string, status: ContributionStatus, rejectionReason?: string): Promise<boolean> {
		const now = new Date().toISOString();
		if (isSupabaseConfigured()) {
			try {
				const { error } = await supabase.from('plants').update({ status, rejection_reason: rejectionReason || null, updated_at: now }).eq('id', id);
				if (error) {
					console.warn('Gagal update status di Supabase:', error.message);
					throw new Error(`Gagal memperbarui status tanaman di server: ${error.message}`);
				}
				await supabase.from('plant_videos').update({ status, rejection_reason: rejectionReason || null }).eq('plant_id', id);
				return true;
			} catch (err) {
				console.warn('Gagal update status di Supabase:', err);
				throw err;
			}
		}
		const reason = rejectionReason || undefined;
		saveLocalPlants(loadLocalPlants().map((p) => (p.id === id ? { ...p, status, rejection_reason: reason, videos: (p.videos || []).map((v) => ({ ...v, status, rejection_reason: reason })), updated_at: now } : p)));
		return true;
	}
}
