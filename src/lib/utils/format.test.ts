// ==============================================================================
// Botanidex — Unit Tests for Formatting Utilities
// Tujuan: Memvalidasi pemformatan label kategori (statis & dinamis CMS), durasi, dan tanggal
// Caller: npm run test (Vitest)
// Dependensi: vitest, format utils, ConfigService
// Main Functions: describe('Format Utilities')
// Side Effects: none
// ==============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
	getCategoryBadgeLabel,
	getCategoryShortLabel,
	formatDuration,
	formatDateId
} from './format';
import { ConfigService } from '../services/config.service';

describe('Format Utilities', () => {
	beforeEach(() => {
		ConfigService.resetToDefaults();
	});

	it('memformat label kategori standar dan kategori kustom CMS dengan utuh (BUG-03 Regression)', () => {
		expect(getCategoryBadgeLabel('obat')).toBe('Tanaman Obat / Herbal');
		expect(getCategoryShortLabel('obat')).toBe('Obat');
		expect(getCategoryBadgeLabel('pangan')).toBe('Tanaman Pangan');
		expect(getCategoryBadgeLabel('hias')).toBe('Tanaman Hias');
		expect(getCategoryBadgeLabel('industri')).toBe('Tanaman Industri / Perkebunan');
		expect(getCategoryBadgeLabel('kayu')).toBe('Tanaman Kayu / Hutan');

		ConfigService.addCategory({
			id: 'kultur-jaringan',
			label: 'Kultur Jaringan',
			dotColor: 'bg-cyan-500'
		});
		expect(getCategoryBadgeLabel('kultur-jaringan')).toBe('Kultur Jaringan');
		expect(getCategoryShortLabel('kultur-jaringan')).toBe('Kultur Jaringan');
	});

	it('memformat durasi detik ke format menit:detik', () => {
		expect(formatDuration(0)).toBe('0:00');
		expect(formatDuration(65)).toBe('1:05');
		expect(formatDuration(154)).toBe('2:34');
		expect(formatDuration(300)).toBe('5:00');
	});

	it('memformat tanggal ISO ke format Indonesia', () => {
		const formatted = formatDateId('2026-10-21T08:00:00Z');
		expect(formatted).toContain('2026');
		expect(formatted).toContain('Oktober');
	});
});
