// ==============================================================================
// Botanidex — Botanical Catalog Book Compiler
// Tujuan: Logika pengelompokan data, statistik kebun, indeks taksonomi, dan pemetaan halaman untuk Buku Ensiklopedia Botani Siap Cetak (A4 PDF)
// Caller: src/routes/katalog/buku/+page.svelte
// Dependensi: src/lib/types/plant.types.ts
// Main Functions: compileBookStatistics, groupPlantsByCategory, groupPlantsByFamily, calculateSpecimenPageNumbers
// Side Effects: Murni pure functions tanpa mutasi data
// ==============================================================================

import type { Plant } from '../types/plant.types';

export interface BookStatistics {
	totalSpecies: number;
	totalPopulation: number;
	totalFamilies: number;
	categoryBreakdown: Record<string, { speciesCount: number; populationCount: number }>;
}

export interface CategoryGroup {
	categoryId: string;
	plants: Plant[];
}

export interface FamilyGroup {
	family: string;
	count: number;
	plants: Plant[];
}

export function compileBookStatistics(plants: Plant[]): BookStatistics {
	const categoryBreakdown: Record<string, { speciesCount: number; populationCount: number }> = {};
	const uniqueFamilies = new Set<string>();
	let totalPopulation = 0;

	for (const p of plants) {
		const qty = typeof p.quantity === 'number' && p.quantity > 0 ? p.quantity : 1;
		totalPopulation += qty;

		const cat = p.category || 'lainnya';
		if (!categoryBreakdown[cat]) {
			categoryBreakdown[cat] = { speciesCount: 0, populationCount: 0 };
		}
		categoryBreakdown[cat].speciesCount += 1;
		categoryBreakdown[cat].populationCount += qty;

		const fam = p.taxonomy?.familia?.trim();
		if (fam) {
			uniqueFamilies.add(fam);
		}
	}

	return {
		totalSpecies: plants.length,
		totalPopulation,
		totalFamilies: uniqueFamilies.size,
		categoryBreakdown
	};
}

export function groupPlantsByCategory(plants: Plant[], preferredOrder?: string[]): CategoryGroup[] {
	const groupsMap = new Map<string, Plant[]>();

	for (const p of plants) {
		const cat = p.category || 'lainnya';
		const existing = groupsMap.get(cat) || [];
		existing.push(p);
		groupsMap.set(cat, existing);
	}

	const order = preferredOrder && preferredOrder.length > 0 ? preferredOrder : ['obat', 'pangan', 'hias', 'kehutanan', 'lainnya'];
	const result: CategoryGroup[] = [];

	// Urutkan sesuai preferensi urutan jika ada
	for (const catId of order) {
		if (groupsMap.has(catId)) {
			result.push({
				categoryId: catId,
				plants: groupsMap.get(catId)!
			});
			groupsMap.delete(catId);
		}
	}

	// Kategori sisanya
	for (const [categoryId, plantList] of groupsMap.entries()) {
		result.push({ categoryId, plants: plantList });
	}

	return result;
}

export function groupPlantsByFamily(plants: Plant[]): FamilyGroup[] {
	const familyMap = new Map<string, Plant[]>();

	for (const p of plants) {
		const fam = p.taxonomy?.familia?.trim() || 'Incertae Sedis / Belum Terklasifikasi';
		const list = familyMap.get(fam) || [];
		list.push(p);
		familyMap.set(fam, list);
	}

	return Array.from(familyMap.entries())
		.map(([family, list]) => ({
			family,
			count: list.length,
			plants: list.sort((a, b) => a.name_local.localeCompare(b.name_local, 'id'))
		}))
		.sort((a, b) => a.family.localeCompare(b.family, 'id'));
}

export function calculateSpecimenPageNumbers(
	plants: Plant[],
	layoutMode: 'encyclopedia' | 'compact' = 'encyclopedia',
	startPage = 4
): Map<string, number> {
	const pageMap = new Map<string, number>();

	plants.forEach((plant, index) => {
		const page =
			layoutMode === 'encyclopedia'
				? startPage + index
				: startPage + Math.floor(index / 2);
		pageMap.set(plant.id, page);
	});

	return pageMap;
}
