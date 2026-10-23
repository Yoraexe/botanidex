// ==============================================================================
// Botanidex — School Map Repository
// Tujuan: Data access layer untuk denah sekolah dan koordinat lokasi tanaman
// Caller: src/lib/services/plant.service.ts
// Dependensi: src/lib/repositories/plant.repository.ts, src/lib/types/map.types.ts
// Main Functions: getSchoolMapData
// Side Effects: Read data tanaman approved dari PlantRepository
// ==============================================================================

import { PlantRepository } from './plant.repository';
import type { SchoolMapInfo, PlantMarker } from '../types/map.types';

export class MapRepository {
	/**
	 * Mengambil informasi denah sekolah beserta semua marker tanaman yang aktif
	 */
	static async getSchoolMapData(): Promise<SchoolMapInfo> {
		const approvedPlants = await PlantRepository.getApprovedPlants();

		const markers: PlantMarker[] = approvedPlants
			.filter((p) => typeof p.location_x === 'number' && typeof p.location_y === 'number')
			.map((p) => ({
				plant_id: p.id,
				slug: p.slug,
				name_local: p.name_local,
				name_latin: p.name_latin,
				category: p.category,
				thumbnail_url: p.photos[0]?.storage_path || '/icons/icon-192.svg',
				x: p.location_x!,
				y: p.location_y!,
				location_label: p.location_label || 'Area Kebun Sekolah'
			}));

		return {
			id: 'default-map',
			title: 'Denah Terpadu Lahan Praktikum SMK PPN Gorontalo',
			version: 1,
			image_url: '/map-schematic.svg',
			markers
		};
	}
}
