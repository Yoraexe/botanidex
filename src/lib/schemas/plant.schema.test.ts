// ==============================================================================
// Botanidex — Unit Tests for PlantForm Schema Validation
// Tujuan: Memvalidasi boundary input data formulir tanaman, kategori dinamis CMS, dan batas durasi video
// Caller: npm run test (Vitest)
// Dependensi: vitest, plantFormSchema, ConfigService
// Main Functions: describe('plantFormSchema')
// Side Effects: none
// ==============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { plantFormSchema } from './plant.schema';
import { ConfigService } from '../services/config.service';

describe('plantFormSchema', () => {
	beforeEach(() => ConfigService.resetToDefaults());

	it('menerima payload tanaman yang valid dan lengkap beserta taksonomi species', () => {
		const result = plantFormSchema.safeParse({
			name_local: 'Kumis Kucing', name_latin: 'Orthosiphon aristatus', name_english: 'Cat Whiskers',
			category: 'obat', quantity: 5, unit: 'polybag',
			description: 'Tanaman herbal untuk melancarkan saluran kemih dan anti inflamasi.',
			taxonomy_kingdom: 'Plantae', taxonomy_familia: 'Lamiaceae', taxonomy_species: 'Orthosiphon aristatus',
			location_label: 'Kebun TOGA Bedeng C-1', video_duration_seconds: 180
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.quantity).toBe(5);
			expect(result.data.unit).toBe('polybag');
		}
	});

	it('mengisi nilai default untuk quantity (1) dan unit ("pohon") jika tidak disediakan', () => {
		const result = plantFormSchema.safeParse({
			name_local: 'Kumis Kucing', name_latin: 'Orthosiphon aristatus',
			category: 'obat', description: 'Tanaman herbal untuk melancarkan saluran kemih dan anti inflamasi.'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.quantity).toBe(1);
			expect(result.data.unit).toBe('pohon');
		}
	});

	it('menolak jika quantity kurang dari 1', () => {
		const result = plantFormSchema.safeParse({
			name_local: 'Kumis Kucing', name_latin: 'Orthosiphon aristatus',
			category: 'obat', quantity: 0, description: 'Tanaman herbal untuk melancarkan saluran kemih.'
		});
		expect(result.success).toBe(false);
	});

	it('menerima kategori kustom yang ditambahkan lewat CMS ConfigService (BUG-03 Regression)', () => {
		ConfigService.addCategory({ id: 'kultur-jaringan', label: 'Kultur Jaringan', dotColor: 'bg-cyan-500' });
		const result = plantFormSchema.safeParse({
			name_local: 'Pisang Cavendish Kultur', name_latin: 'Musa acuminata',
			category: 'kultur-jaringan', description: 'Planlet pisang hasil perbanyakan laboratorium kultur jaringan.'
		});
		expect(result.success).toBe(true);
	});

	it('menolak jika durasi video melebihi 5 menit / 300 detik (BUG-05 Regression)', () => {
		const result = plantFormSchema.safeParse({
			name_local: 'Kumis Kucing', name_latin: 'Orthosiphon aristatus', category: 'obat',
			description: 'Deskripsi tanaman yang cukup panjang lebih dari 10 karakter.', video_duration_seconds: 305
		});
		expect(result.success).toBe(false);
	});

	it('menolak jika nama lokal kurang dari 2 karakter', () => {
		const result = plantFormSchema.safeParse({
			name_local: 'A', name_latin: 'Orthosiphon aristatus', category: 'obat',
			description: 'Deskripsi tanaman yang cukup panjang lebih dari 10 karakter.'
		});
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error.issues[0].message).toContain('Nama lokal minimal 2 karakter');
	});

	it('menolak jika deskripsi kurang dari 10 karakter', () => {
		const result = plantFormSchema.safeParse({
			name_local: 'Kumis Kucing', name_latin: 'Orthosiphon aristatus', category: 'obat', description: 'Pendek'
		});
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error.issues[0].message).toContain('Deskripsi minimal 10 karakter');
	});

	it('menolak kategori tanaman yang tidak terdaftar di sistem maupun CMS', () => {
		const result = plantFormSchema.safeParse({
			name_local: 'Tanaman Aneh', name_latin: 'Alienum botanicum',
			category: 'kategori_palsu_tidak_ada', description: 'Deskripsi tanaman yang cukup panjang lebih dari 10 karakter.'
		});
		expect(result.success).toBe(false);
	});
});
