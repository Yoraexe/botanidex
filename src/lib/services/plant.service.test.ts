// ==============================================================================
// Botanidex — Unit Tests for PlantService & PlantRepository Mappers
// Tujuan: Memvalidasi pencarian, filter, QR generator, moderasi tanaman/video, peta sekolah, dan mapper DB Supabase
// Caller: npm run test (Vitest)
// Dependensi: vitest, PlantService, mapDbRowToPlant, mapPlantToDbRow
// Main Functions: describe('PlantService & Repository Mappers')
// Side Effects: In-memory store state changes during tests
// ==============================================================================

import { describe, it, expect } from 'vitest';
import { PlantService } from './plant.service';
import { mapDbRowToPlant, mapPlantToDbRow } from '../repositories/plant.repository';
import { createPlantSlug } from '../utils/slug';

describe('PlantService & Repository Mappers', () => {
	it('mengembalikan seluruh katalog tanaman default', async () => {
		const plants = await PlantService.getCatalog();
		expect(plants.length).toBeGreaterThan(0);
		const jahe = plants.find((p) => p.slug === 'jahe-merah');
		expect(jahe?.name_local).toBe('Jahe Merah');
		expect(jahe?.category).toBe('obat');
	});

	it('memfilter tanaman berdasarkan kategori secara tepat', async () => {
		const obatPlants = await PlantService.getCatalog({ category: 'obat' });
		expect(obatPlants.length).toBeGreaterThan(0);
		for (const p of obatPlants) expect(p.category).toBe('obat');

		const panganPlants = await PlantService.getCatalog({ category: 'pangan' });
		expect(panganPlants.length).toBeGreaterThan(0);
		for (const p of panganPlants) expect(p.category).toBe('pangan');
	});

	it('mencari tanaman berdasarkan nama lokal atau nama latin', async () => {
		const searchLocal = await PlantService.getCatalog({ query: 'Jahe' });
		expect(searchLocal[0].name_local).toContain('Jahe');
		const searchLatin = await PlantService.getCatalog({ query: 'Zea mays' });
		expect(searchLatin[0].name_latin).toContain('Zea mays');
	});

	it('mengambil tanaman detail berdasarkan slug', async () => {
		const plant = await PlantService.getPlantBySlug('jahe-merah');
		expect(plant?.slug).toBe('jahe-merah');
		expect(plant?.taxonomy.familia).toBe('Zingiberaceae');
		expect(plant?.photos.length).toBeGreaterThan(0);
	});

	it('mengembalikan null jika slug tanaman tidak ditemukan', async () => {
		expect(await PlantService.getPlantBySlug('tanaman-fiktif-tidak-ada-999')).toBeNull();
	});

	it('menghasilkan data URL QR code yang valid', async () => {
		const qrDataUrl = await PlantService.generateQrDataUrl('jahe-merah');
		expect(qrDataUrl.startsWith('data:image/png;base64,')).toBe(true);
	});

	it('memetakan baris flat PostgreSQL ke objek Plant bersarang dengan benar (BUG-02 Regression)', () => {
		const flatRow = {
			id: '99999999-9999-9999-9999-999999999999', slug: 'serai-wangi', name_local: 'Serai Wangi', name_latin: 'Cymbopogon nardus',
			category: 'obat', taxonomy_kingdom: 'Plantae', taxonomy_divisio: 'Tracheophyta', taxonomy_classis: 'Liliopsida',
			taxonomy_ordo: 'Poales', taxonomy_familia: 'Poaceae', taxonomy_genus: 'Cymbopogon', taxonomy_species: 'Cymbopogon nardus',
			description: 'Tanaman penghasil minyak atsiri sitronela.', status: 'approved', contributor_name: 'Siswa Uji', photos: [], videos: []
		};
		const mapped = mapDbRowToPlant(flatRow);
		expect(mapped.taxonomy.familia).toBe('Poaceae');
		expect(mapped.taxonomy.species).toBe('Cymbopogon nardus');
		expect(mapped.contributor_name).toBe('Siswa Uji');

		const backToRow = mapPlantToDbRow(mapped);
		expect(backToRow.taxonomy_familia).toBe('Poaceae');
		expect(backToRow.taxonomy_species).toBe('Cymbopogon nardus');
		expect(backToRow.taxonomy).toBeUndefined();
	});

	it('menyimpan tanaman baru beserta kuantitas/populasi dan video pending lalu menyetujui statusnya (CR-01)', async () => {
		const submitted = await PlantService.submitPlant(
			{
				name_local: 'Kunyit Putih', name_latin: 'Curcuma zedoaria', category: 'obat',
				quantity: 3, unit: 'pohon',
				description: 'Rimpang obat tradisional untuk praktikum fitofarmaka SMK.',
				taxonomy_kingdom: 'Plantae', taxonomy_familia: 'Zingiberaceae', taxonomy_species: 'Curcuma zedoaria',
				video_title: 'Penjelasan Kunyit Putih'
			},
			{ uploadedPhotos: ['https://example.com/kunyit.jpg'], uploadedVideoUrl: 'https://example.com/kunyit.mp4', videoDurationSeconds: 120, contributorName: 'Siswa Tester', isAdmin: false }
		);
		expect(submitted.status).toBe('pending');
		expect(submitted.quantity).toBe(3);
		expect(submitted.unit).toBe('pohon');
		expect(submitted.taxonomy.species).toBe('Curcuma zedoaria');
		expect(submitted.videos[0].status).toBe('pending');
		expect(submitted.videos[0].duration_seconds).toBe(120);

		await expect(PlantService.moderatePlant(submitted.id, 'reject', '')).rejects.toThrowError('Alasan wajib diisi jika menolak kontribusi');
		await PlantService.moderatePlant(submitted.id, 'approve');
		const approved = await PlantService.getPlantBySlug(submitted.slug);
		expect(approved?.status).toBe('approved');
		expect(approved?.videos[0]?.status).toBe('approved');
	});

	it('mengambil data peta kebun sekolah melalui PlantService (BUG-07 Regression)', async () => {
		const mapData = await PlantService.getSchoolMapData();
		expect(mapData.id).toBe('default-map');
		expect(mapData.markers.length).toBeGreaterThan(0);
	});

	it('menghasilkan fallback slug aman saat input hanya berupa simbol/non-ASCII (Pass #2 Regression)', () => {
		expect(createPlantSlug('??? !!!', '')).toBe('tanaman');
		expect(createPlantSlug('🌱🌿', 'Zingiber officinale')).toBe('zingiber-officinale');
	});
});
