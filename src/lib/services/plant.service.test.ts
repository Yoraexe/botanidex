// ==============================================================================
// Flora SMK — Unit Tests for PlantService
// Tujuan: Memvalidasi fungsi pencarian, filter kategori, detail, dan QR generator
// Caller: npm run test (Vitest)
// Dependensi: vitest, PlantService
// ==============================================================================

import { describe, it, expect } from 'vitest';
import { PlantService } from './plant.service';

describe('PlantService', () => {
	it('mengembalikan seluruh katalog tanaman default', async () => {
		const plants = await PlantService.getCatalog();
		expect(plants).toBeDefined();
		expect(plants.length).toBeGreaterThan(0);

		// Harus memiliki minimal 1 tanaman obat (misal Jahe Merah)
		const jahe = plants.find((p) => p.slug === 'jahe-merah');
		expect(jahe).toBeDefined();
		expect(jahe?.name_local).toBe('Jahe Merah');
		expect(jahe?.category).toBe('obat');
	});

	it('memfilter tanaman berdasarkan kategori secara tepat', async () => {
		const obatPlants = await PlantService.getCatalog({ category: 'obat' });
		expect(obatPlants.length).toBeGreaterThan(0);
		for (const p of obatPlants) {
			expect(p.category).toBe('obat');
		}

		const panganPlants = await PlantService.getCatalog({ category: 'pangan' });
		expect(panganPlants.length).toBeGreaterThan(0);
		for (const p of panganPlants) {
			expect(p.category).toBe('pangan');
		}
	});

	it('mencari tanaman berdasarkan nama lokal atau nama latin', async () => {
		const searchLocal = await PlantService.getCatalog({ query: 'Jahe' });
		expect(searchLocal.length).toBeGreaterThan(0);
		expect(searchLocal[0].name_local).toContain('Jahe');

		const searchLatin = await PlantService.getCatalog({ query: 'Zea mays' });
		expect(searchLatin.length).toBeGreaterThan(0);
		expect(searchLatin[0].name_latin).toContain('Zea mays');
	});

	it('mengambil tanaman detail berdasarkan slug', async () => {
		const plant = await PlantService.getPlantBySlug('jahe-merah');
		expect(plant).not.toBeNull();
		expect(plant?.slug).toBe('jahe-merah');
		expect(plant?.taxonomy.familia).toBe('Zingiberaceae');
		expect(plant?.photos.length).toBeGreaterThan(0);
	});

	it('mengembalikan null jika slug tanaman tidak ditemukan', async () => {
		const plant = await PlantService.getPlantBySlug('tanaman-fiktif-tidak-ada-999');
		expect(plant).toBeNull();
	});

	it('menghasilkan data URL QR code yang valid', async () => {
		const qrDataUrl = await PlantService.generateQrDataUrl('jahe-merah');
		expect(qrDataUrl).toBeDefined();
		expect(qrDataUrl.startsWith('data:image/png;base64,')).toBe(true);
	});
});
