// ==============================================================================
// Flora SMK — Unit Tests for PlantForm Schema Validation
// Tujuan: Memvalidasi boundary input data formulir tanaman dengan Zod
// Caller: npm run test (Vitest)
// Dependensi: vitest, plantFormSchema
// ==============================================================================

import { describe, it, expect } from 'vitest';
import { plantFormSchema } from './plant.schema';

describe('plantFormSchema', () => {
	it('menerima payload tanaman yang valid dan lengkap', () => {
		const payload = {
			name_local: 'Kumis Kucing',
			name_latin: 'Orthosiphon aristatus',
			name_english: 'Cat Whiskers',
			category: 'obat',
			description: 'Tanaman herbal untuk melancarkan saluran kemih dan anti inflamasi.',
			taxonomy_kingdom: 'Plantae',
			taxonomy_familia: 'Lamiaceae',
			location_label: 'Kebun TOGA Bedeng C-1'
		};

		const result = plantFormSchema.safeParse(payload);
		expect(result.success).toBe(true);
	});

	it('menolak jika nama lokal kurang dari 2 karakter', () => {
		const payload = {
			name_local: 'A',
			name_latin: 'Orthosiphon aristatus',
			category: 'obat',
			description: 'Deskripsi tanaman yang cukup panjang lebih dari 10 karakter.'
		};

		const result = plantFormSchema.safeParse(payload);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toContain('Nama lokal minimal 2 karakter');
		}
	});

	it('menolak jika deskripsi kurang dari 10 karakter', () => {
		const payload = {
			name_local: 'Kumis Kucing',
			name_latin: 'Orthosiphon aristatus',
			category: 'obat',
			description: 'Pendek'
		};

		const result = plantFormSchema.safeParse(payload);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toContain('Deskripsi minimal 10 karakter');
		}
	});

	it('menolak kategori tanaman yang di luar enum', () => {
		const payload = {
			name_local: 'Tanaman Aneh',
			name_latin: 'Alienum botanicum',
			category: 'kategori_palsu',
			description: 'Deskripsi tanaman yang cukup panjang lebih dari 10 karakter.'
		};

		const result = plantFormSchema.safeParse(payload);
		expect(result.success).toBe(false);
	});
});
