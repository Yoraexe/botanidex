// ==============================================================================
// Botanidex — School Map Domain Types
// Tujuan: Mendefinisikan tipe koordinat denah sekolah dan marker lokasi tanaman
// Caller: Map components, map services, and repositories
// Dependensi: PlantCategory
// Main Functions: PlantMarker, SchoolMapInfo
// Side Effects: none (type-only definition)
// ==============================================================================

import type { PlantCategory } from './plant.types';

export interface PlantMarker {
	plant_id: string;
	slug: string;
	name_local: string;
	name_latin: string;
	category: PlantCategory;
	thumbnail_url: string;
	x: number; // 0.0 - 100.0%
	y: number; // 0.0 - 100.0%
	location_label?: string;
}

export interface SchoolMapInfo {
	id: string;
	title: string;
	image_url: string;
	version: number;
	markers: PlantMarker[];
}
