// ==============================================================================
// Botanidex — Botanical Catalog Book Compiler Test Suite
// Tujuan: Memvalidasi kalkulasi statistik kebun, pengelompokan kategori, indeks familia, dan penomoran halaman buku cetak
// Caller: bun test / vitest
// Dependensi: src/lib/utils/catalog-book.ts, src/lib/data/seed-plants.ts
// Main Functions: test suite
// Side Effects: Tidak ada
// ==============================================================================

import { describe, it, expect } from 'vitest';
import {
	compileBookStatistics,
	groupPlantsByCategory,
	groupPlantsByFamily,
	calculateSpecimenPageNumbers
} from './catalog-book';
import { INITIAL_PLANTS_DATA } from '../data/seed-plants';
import type { Plant } from '../types/plant.types';

describe('Botanical Catalog Book Compiler', () => {
	it('menghitung statistik buku dengan akurat (total spesies, populasi, familia)', () => {
		const stats = compileBookStatistics(INITIAL_PLANTS_DATA);
		expect(stats.totalSpecies).toBe(INITIAL_PLANTS_DATA.length);
		expect(stats.totalPopulation).toBeGreaterThanOrEqual(INITIAL_PLANTS_DATA.length);
		expect(stats.totalFamilies).toBeGreaterThan(0);
		expect(stats.categoryBreakdown['obat']).toBeDefined();
		expect(stats.categoryBreakdown['obat'].speciesCount).toBeGreaterThan(0);
	});

	it('mengelompokkan tanaman berdasarkan kategori sesuai urutan preferensi', () => {
		const groups = groupPlantsByCategory(INITIAL_PLANTS_DATA, ['obat', 'pangan']);
		expect(groups.length).toBeGreaterThan(0);
		expect(groups[0].categoryId).toBe('obat');
		expect(groups[0].plants.every((p) => p.category === 'obat')).toBe(true);
	});

	it('mengelompokkan tanaman berdasarkan familia secara alfabetis', () => {
		const familyGroups = groupPlantsByFamily(INITIAL_PLANTS_DATA);
		expect(familyGroups.length).toBeGreaterThan(0);
		// Verifikasi alfabetis
		for (let i = 0; i < familyGroups.length - 1; i++) {
			expect(familyGroups[i].family.localeCompare(familyGroups[i + 1].family, 'id')).toBeLessThanOrEqual(0);
		}
	});

	it('menghitung nomor halaman mode ensiklopedia (1 spesimen per halaman)', () => {
		const mockPlants: Plant[] = INITIAL_PLANTS_DATA.slice(0, 3);
		const pages = calculateSpecimenPageNumbers(mockPlants, 'encyclopedia', 4);
		expect(pages.get(mockPlants[0].id)).toBe(4);
		expect(pages.get(mockPlants[1].id)).toBe(5);
		expect(pages.get(mockPlants[2].id)).toBe(6);
	});

	it('menghitung nomor halaman mode kompak (2 spesimen per halaman)', () => {
		const mockPlants: Plant[] = INITIAL_PLANTS_DATA.slice(0, 4);
		const pages = calculateSpecimenPageNumbers(mockPlants, 'compact', 4);
		expect(pages.get(mockPlants[0].id)).toBe(4);
		expect(pages.get(mockPlants[1].id)).toBe(4);
		expect(pages.get(mockPlants[2].id)).toBe(5);
		expect(pages.get(mockPlants[3].id)).toBe(5);
	});

	it('menangani daftar tanaman kosong secara aman', () => {
		const stats = compileBookStatistics([]);
		expect(stats.totalSpecies).toBe(0);
		expect(stats.totalPopulation).toBe(0);
		expect(stats.totalFamilies).toBe(0);

		const groups = groupPlantsByCategory([]);
		expect(groups).toEqual([]);

		const families = groupPlantsByFamily([]);
		expect(families).toEqual([]);

		const pages = calculateSpecimenPageNumbers([], 'encyclopedia');
		expect(pages.size).toBe(0);
	});
});
