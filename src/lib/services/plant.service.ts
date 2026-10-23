// ==============================================================================
// Botanidex — Plant Service
// Tujuan: Business logic untuk katalog botani, pencarian, peta sekolah, QR code generation, dan moderasi
// Caller: Route pages (/katalog, /peta, /kontribusi/tambah, /admin/moderasi), QrGenerator
// Dependensi: plant.repository.ts, plant.schema.ts, slug.ts, qrcode
// Main Functions: getCatalog, getPlantBySlug, getSchoolMapData, generateQrDataUrl, submitPlant, moderatePlant, getAllPlants
// Side Effects: Panggil repository tanaman, validasi moderasi, generate QR data URL
// ==============================================================================

import QRCode from 'qrcode';
import { PlantRepository } from '../repositories/plant.repository';
import { moderationReviewSchema, type PlantFormValues } from '../schemas/plant.schema';
import { createPlantSlug } from '../utils/slug';
import type { Plant, PlantFilterOptions, ContributionStatus } from '../types/plant.types';
import type { SchoolMapInfo } from '../types/map.types';

export class PlantService {
	static async getCatalog(filters?: PlantFilterOptions): Promise<Plant[]> { return PlantRepository.getApprovedPlants(filters); }
	static async getPlantBySlug(slug: string): Promise<Plant | null> { return slug ? PlantRepository.getPlantBySlug(slug) : null; }
	static async getAllPlants(): Promise<Plant[]> { return PlantRepository.getAllPlants(); }

	static async getSchoolMapData(): Promise<SchoolMapInfo> {
		const approved = await PlantRepository.getApprovedPlants();
		const markers = approved
			.filter((p) => typeof p.location_x === 'number' && typeof p.location_y === 'number')
			.map((p) => ({
				plant_id: p.id, slug: p.slug, name_local: p.name_local, name_latin: p.name_latin,
				category: p.category, thumbnail_url: p.photos[0]?.storage_path || '/icons/icon-192.svg',
				x: p.location_x!, y: p.location_y!, location_label: p.location_label || 'Area Kebun Sekolah'
			}));
		return { id: 'default-map', title: 'Denah Terpadu Lahan Praktikum SMK PPN Gorontalo', version: 1, image_url: '/map-schematic.svg', markers };
	}

	static async generateQrDataUrl(slugOrUrl: string): Promise<string> {
		const origin = typeof window !== 'undefined' ? window.location.origin : 'https://botanidex.app';
		const targetUrl = slugOrUrl.startsWith('http') ? slugOrUrl : `${origin}/katalog/${slugOrUrl}`;
		return QRCode.toDataURL(targetUrl, { width: 320, margin: 2, color: { dark: '#14532d', light: '#ffffff' }, errorCorrectionLevel: 'M' });
	}

	static async submitPlant(
		formData: PlantFormValues,
		options: { uploadedPhotos: string[]; uploadedVideoUrl?: string; videoDurationSeconds?: number; contributorName?: string; contributorId?: string; isAdmin?: boolean }
	): Promise<Plant> {
		const baseSlug = createPlantSlug(formData.name_local, formData.name_latin);
		const exists = await PlantRepository.getPlantBySlug(baseSlug);
		const slug = exists ? `${baseSlug}-${Math.random().toString(36).substring(2, 6)}` : baseSlug;
		const aliases = (formData.aliases_raw || '').split(',').map((a) => a.trim()).filter(Boolean);
		const now = new Date().toISOString();
		const id = crypto.randomUUID();
		const status: ContributionStatus = options.isAdmin ? 'approved' : 'pending';

		const photos = options.uploadedPhotos.map((storage_path, sort_order) => ({
			id: crypto.randomUUID(), plant_id: id, storage_path,
			label: sort_order === 0 ? 'Habitus / Foto Utama' : `Dokumentasi ${sort_order + 1}`,
			sort_order, created_at: now
		}));

		const videos = options.uploadedVideoUrl
			? [{
					id: crypto.randomUUID(), plant_id: id, storage_path: options.uploadedVideoUrl,
					thumbnail_path: photos[0]?.storage_path,
					title: formData.video_title || `Penjelasan Edukasi: ${formData.name_local}`,
					duration_seconds: options.videoDurationSeconds ?? formData.video_duration_seconds,
					uploaded_by_name: options.contributorName || 'Siswa SMK PPN Gorontalo',
					uploaded_by: options.contributorId, status, created_at: now
				}]
			: [];

		return PlantRepository.insertPlant({
			id, slug, name_local: formData.name_local, name_latin: formData.name_latin,
			name_english: formData.name_english || undefined, aliases, category: formData.category,
			taxonomy: {
				kingdom: formData.taxonomy_kingdom || 'Plantae', divisio: formData.taxonomy_divisio || undefined,
				classis: formData.taxonomy_classis || undefined, ordo: formData.taxonomy_ordo || undefined,
				familia: formData.taxonomy_familia || undefined, genus: formData.taxonomy_genus || undefined,
				species: formData.taxonomy_species || undefined
			},
			description: formData.description, location_x: formData.location_x, location_y: formData.location_y,
			location_label: formData.location_label || undefined, status,
			contributor_id: options.contributorId, contributor_name: options.contributorName || 'Kontributor Siswa',
			photos, videos, created_at: now, updated_at: now
		});
	}

	static async moderatePlant(plantId: string, action: 'approve' | 'reject', rejectionReason?: string): Promise<boolean> {
		const parsed = moderationReviewSchema.safeParse({ plant_id: plantId, action, rejection_reason: rejectionReason });
		if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Payload moderasi tidak valid');
		return PlantRepository.updatePlantStatus(plantId, action === 'approve' ? 'approved' : 'rejected', rejectionReason);
	}
}
