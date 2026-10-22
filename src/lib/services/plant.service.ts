// ==============================================================================
// Botanidex — Plant Service
// Tujuan: Business logic untuk katalog botani, pencarian, QR code generation, dan moderasi
// Caller: Route handlers, UI pages, forms
// Dependensi: src/lib/repositories/plant.repository.ts, src/lib/utils/slug.ts, qrcode
// Main Functions: getApprovedCatalog, getPlantDetail, submitNewPlant, reviewPlantSubmission, generateQrDataUrl
// Side Effects: Panggil repository tanaman, generate QR canvas
// ==============================================================================

import QRCode from 'qrcode';
import { PlantRepository } from '../repositories/plant.repository';
import { createPlantSlug } from '../utils/slug';
import type { Plant, PlantFilterOptions, ContributionStatus } from '../types/plant.types';
import type { PlantFormValues } from '../schemas/plant.schema';

export class PlantService {
	/**
	 * Mengambil katalog tanaman approved dengan filter dan pencarian
	 */
	static async getCatalog(filters?: PlantFilterOptions): Promise<Plant[]> {
		return PlantRepository.getApprovedPlants(filters);
	}

	/**
	 * Mengambil detail tanaman lengkap berdasarkan slug URL
	 */
	static async getPlantBySlug(slug: string): Promise<Plant | null> {
		if (!slug) return null;
		return PlantRepository.getPlantBySlug(slug);
	}

	/**
	 * Menghasilkan Data URL gambar QR Code untuk ditempel pada tanaman fisik
	 */
	static async generateQrDataUrl(slugOrUrl: string): Promise<string> {
		const targetUrl = slugOrUrl.startsWith('http')
			? slugOrUrl
			: `${typeof window !== 'undefined' ? window.location.origin : 'https://botanidex.app'}/katalog/${slugOrUrl}`;

		return QRCode.toDataURL(targetUrl, {
			width: 320,
			margin: 2,
			color: {
				dark: '#14532d', // green-900
				light: '#ffffff'
			},
			errorCorrectionLevel: 'M'
		});
	}

	/**
	 * Mengajukan entitas tanaman baru (dari siswa atau guru)
	 */
	static async submitPlant(
		formData: PlantFormValues,
		options: {
			uploadedPhotos: string[];
			uploadedVideoUrl?: string;
			contributorName?: string;
			contributorId?: string;
			isAdmin?: boolean;
		}
	): Promise<Plant> {
		const baseSlug = createPlantSlug(formData.name_local, formData.name_latin);
		const existingWithSlug = await PlantRepository.getPlantBySlug(baseSlug);
		const finalSlug = existingWithSlug ? `${baseSlug}-${Math.random().toString(36).substring(2, 6)}` : baseSlug;

		const aliases = (formData.aliases_raw || '')
			.split(',')
			.map((a) => a.trim())
			.filter(Boolean);

		const now = new Date().toISOString();
		const plantId = crypto.randomUUID();

		const photos = options.uploadedPhotos.map((path, idx) => ({
			id: crypto.randomUUID(),
			plant_id: plantId,
			storage_path: path,
			label: idx === 0 ? 'Habitus / Foto Utama' : `Dokumentasi ${idx + 1}`,
			sort_order: idx,
			created_at: now
		}));

		const videos = options.uploadedVideoUrl
			? [
					{
						id: crypto.randomUUID(),
						plant_id: plantId,
						storage_path: options.uploadedVideoUrl,
						title: formData.video_title || `Penjelasan Edukasi: ${formData.name_local}`,
						uploaded_by_name: options.contributorName || 'Siswa SMK PPN Gorontalo',
						uploaded_by: options.contributorId,
						status: options.isAdmin ? ('approved' as ContributionStatus) : ('pending' as ContributionStatus),
						created_at: now
					}
				]
			: [];

		const newPlant: Plant = {
			id: plantId,
			slug: finalSlug,
			name_local: formData.name_local,
			name_latin: formData.name_latin,
			name_english: formData.name_english || undefined,
			aliases,
			category: formData.category,
			taxonomy: {
				kingdom: formData.taxonomy_kingdom || 'Plantae',
				divisio: formData.taxonomy_divisio || undefined,
				classis: formData.taxonomy_classis || undefined,
				ordo: formData.taxonomy_ordo || undefined,
				familia: formData.taxonomy_familia || undefined,
				genus: formData.taxonomy_genus || undefined,
				species: formData.taxonomy_species || undefined
			},
			description: formData.description,
			location_x: formData.location_x,
			location_y: formData.location_y,
			location_label: formData.location_label || undefined,
			status: options.isAdmin ? 'approved' : 'pending',
			contributor_id: options.contributorId,
			contributor_name: options.contributorName || 'Kontributor Siswa',
			photos,
			videos,
			created_at: now,
			updated_at: now
		};

		return PlantRepository.insertPlant(newPlant);
	}

	/**
	 * Melakukan moderasi terhadap submission tanaman
	 */
	static async moderatePlant(
		plantId: string,
		action: 'approve' | 'reject',
		rejectionReason?: string
	): Promise<boolean> {
		const status: ContributionStatus = action === 'approve' ? 'approved' : 'rejected';
		return PlantRepository.updatePlantStatus(plantId, status, rejectionReason);
	}

	/**
	 * Mengambil daftar pengajuan untuk dashboard moderasi guru
	 */
	static async getModerationQueue(): Promise<Plant[]> {
		return PlantRepository.getAllPlants('pending');
	}

	/**
	 * Mengambil seluruh tanaman terdaftar
	 */
	static async getAllPlants(): Promise<Plant[]> {
		return PlantRepository.getAllPlants();
	}
}
