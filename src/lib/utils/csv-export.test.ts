// ==============================================================================
// Botanidex — Unit Tests for CSV Catalog Exporter
// Tujuan: Memvalidasi pembentukan format CSV, escaping tanda kutip, UTF-8 BOM, dan pemetaan kolom
// Caller: bun test / vitest
// Dependensi: src/lib/utils/csv-export.ts, src/lib/data/seed-plants.ts
// Main Functions: test suite
// Side Effects: Tidak ada
// ==============================================================================

import { describe, it, expect } from 'vitest';
import { generatePlantsCsvString } from './csv-export';
import { INITIAL_PLANTS_DATA } from '../data/seed-plants';
import type { Plant } from '../types/plant.types';

describe('CSV Catalog Exporter', () => {
	it('menghasilkan string CSV yang diawali UTF-8 BOM (\\uFEFF)', () => {
		const csv = generatePlantsCsvString(INITIAL_PLANTS_DATA.slice(0, 2));
		expect(csv.startsWith('\uFEFF')).toBe(true);
	});

	it('memuat header kolom inventaris botani yang lengkap', () => {
		const csv = generatePlantsCsvString(INITIAL_PLANTS_DATA.slice(0, 1));
		expect(csv).toContain('Nama Lokal');
		expect(csv).toContain('Nama Latin');
		expect(csv).toContain('Jumlah Populasi');
		expect(csv).toContain('Satuan');
		expect(csv).toContain('Familia');
		expect(csv).toContain('Koordinat X (%)');
	});

	it('melakukan escaping pada teks yang mengandung tanda kutip ganda dan koma', () => {
		const customPlant: Plant = {
			id: 'test-1',
			slug: 'test-tanaman',
			name_local: 'Pohon "Sakti", Gorontalo',
			name_latin: 'Ficus sp.',
			category: 'pohon',
			quantity: 2,
			unit: 'pohon',
			taxonomy: { kingdom: 'Plantae', familia: 'Moraceae' },
			description: 'Tanaman uji',
			status: 'approved',
			photos: [],
			videos: [],
			created_at: '2026-11-01T00:00:00Z',
			updated_at: '2026-11-01T00:00:00Z'
		};

		const csv = generatePlantsCsvString([customPlant]);
		expect(csv).toContain('"Pohon ""Sakti"", Gorontalo"');
		expect(csv).toContain('"Ficus sp."');
		expect(csv).toContain('"Moraceae"');
	});

	it('menghasilkan baris kosong aman jika daftar tanaman kosong', () => {
		const csv = generatePlantsCsvString([]);
		expect(csv.startsWith('\uFEFF')).toBe(true);
		expect(csv).toContain('Nama Lokal');
	});

	it('menetralkan CSV Formula / DDE Injection pada field yang diawali simbol formula (ADV-01)', () => {
		const injectionPlant: Plant = {
			id: 'test-inj',
			slug: 'test-injection',
			name_local: '=cmd|\'/C calc\'!A0',
			name_latin: '@SUM(1+1)',
			aliases: ['-2+3', '+cmd'],
			category: 'obat',
			quantity: 1,
			unit: 'pohon',
			taxonomy: { kingdom: 'Plantae', familia: '\tExploit' },
			description: 'Uji formula injection',
			location_label: '=1+1',
			status: 'approved',
			photos: [],
			videos: [],
			created_at: '2026-11-01T00:00:00Z',
			updated_at: '2026-11-01T00:00:00Z'
		};

		const csv = generatePlantsCsvString([injectionPlant]);
		// Seluruh karakter formula wajib di-escape dengan awalan petik tunggal (')
		expect(csv).toContain('"\'=cmd|\'/C calc\'!A0"');
		expect(csv).toContain('"\'@SUM(1+1)"');
		expect(csv).toContain('"\'=1+1"');
	});
});
