// ==============================================================================
// Botanidex — Plant Domain Types
// Tujuan: Mendefinisikan tipe data botani, taksonomi, foto, video, dan status katalog
// Caller: Plant repositories, services, schemas, and UI components
// Dependensi: none
// Main Functions: Plant, PlantPhoto, PlantVideo, PlantCategory, PlantTaxonomy, PlantFilterOptions
// Side Effects: none (type-only definition)
// ==============================================================================

export type CorePlantCategory = 'hias' | 'pangan' | 'obat' | 'kayu' | 'industri' | 'lainnya';
export type PlantCategory = CorePlantCategory | (string & {});

export type ContributionStatus = 'pending' | 'approved' | 'rejected';

export interface PlantTaxonomy {
	kingdom: string;
	divisio?: string;
	classis?: string;
	ordo?: string;
	familia?: string;
	genus?: string;
	species?: string;
}

export interface PlantPhoto {
	id: string;
	plant_id: string;
	storage_path: string;
	label?: 'habitus' | 'daun' | 'bunga' | 'buah' | 'biji' | string;
	sort_order: number;
	created_at?: string;
}

export interface PlantVideo {
	id: string;
	plant_id: string;
	storage_path: string;
	thumbnail_path?: string;
	title: string;
	duration_seconds?: number;
	uploaded_by_name?: string;
	uploaded_by?: string;
	status: ContributionStatus;
	rejection_reason?: string;
	created_at?: string;
}

export interface Plant {
	id: string;
	slug: string;
	name_local: string;
	name_latin: string;
	name_english?: string;
	aliases: string[];
	category: PlantCategory;
	taxonomy: PlantTaxonomy;
	description: string;
	location_x?: number; // 0.0 - 100.0 (percentage on school map)
	location_y?: number; // 0.0 - 100.0 (percentage on school map)
	location_label?: string;
	status: ContributionStatus;
	contributor_id?: string;
	contributor_name?: string;
	reviewed_by?: string;
	rejection_reason?: string;
	photos: PlantPhoto[];
	videos: PlantVideo[];
	created_at: string;
	updated_at: string;
}

export interface PlantFilterOptions {
	query?: string;
	category?: PlantCategory | 'semua';
	family?: string;
	location?: string;
}
