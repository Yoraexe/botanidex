// ==============================================================================
// Botanidex — Unit Tests for Formatting Utilities
// Tujuan: Memvalidasi pemformatan label kategori, durasi, dan tanggal
// Caller: npm run test (Vitest)
// Dependensi: vitest, format utils
// ==============================================================================

import { describe, it, expect } from 'vitest';
import { getCategoryBadgeLabel, formatDuration, formatDateId } from './format';

describe('Format Utilities', () => {
	it('memformat label kategori ke bahasa Indonesia yang ramah', () => {
		expect(getCategoryBadgeLabel('obat')).toBe('Tanaman Obat / Herbal');
		expect(getCategoryBadgeLabel('pangan')).toBe('Tanaman Pangan');
		expect(getCategoryBadgeLabel('hias')).toBe('Tanaman Hias');
		expect(getCategoryBadgeLabel('industri')).toBe('Tanaman Industri / Perkebunan');
		expect(getCategoryBadgeLabel('kayu')).toBe('Tanaman Kayu / Hutan');
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
