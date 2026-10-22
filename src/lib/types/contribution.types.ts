// ==============================================================================
// Botanidex — Student Contribution & Moderation Domain Types
// Tujuan: Mendefinisikan tipe formulir pengajuan tanaman dan antrean moderasi guru
// Caller: Contribution form, moderation dashboard, and services
// Dependensi: Plant, PlantCategory, ContributionStatus
// Main Functions: PlantSubmissionForm, ModerationAction
// Side Effects: none (type-only definition)
// ==============================================================================

import type { PlantCategory, ContributionStatus } from './plant.types';

export interface PlantSubmissionForm {
	name_local: string;
	name_latin: string;
	name_english?: string;
	aliases_raw?: string; // Comma-separated
	category: PlantCategory;
	description: string;
	taxonomy_kingdom?: string;
	taxonomy_divisio?: string;
	taxonomy_classis?: string;
	taxonomy_ordo?: string;
	taxonomy_familia?: string;
	taxonomy_genus?: string;
	taxonomy_species?: string;
	location_label?: string;
	location_x?: number;
	location_y?: number;
	photo_files?: File[];
	video_title?: string;
	video_file?: File;
}

export interface ModerationReviewPayload {
	plant_id: string;
	action: 'approve' | 'reject';
	rejection_reason?: string;
}
