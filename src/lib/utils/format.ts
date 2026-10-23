// ==============================================================================
// Botanidex — Formatting & Localization Utilities (Neo-Brutalist Theme)
// Tujuan: Format teks kategori (statis & dinamis CMS), tanggal Indonesia, durasi, dan token warna botani
// Caller: PlantCard, PlantDetail, SchoolMap, Moderation Dashboard
// Dependensi: src/lib/types/plant.types.ts, src/lib/services/config.service.ts
// Main Functions: getCategoryBadgeLabel, getCategoryShortLabel, getCategoryColorClass, formatDateId, formatDuration
// Side Effects: Membaca konfigurasi kategori aktif dari ConfigService untuk kategori kustom
// ==============================================================================

import type { PlantCategory } from '../types/plant.types';
import { ConfigService } from '../services/config.service';

const BADGE_LABELS: Record<string, string> = {
	hias: 'Tanaman Hias', pangan: 'Tanaman Pangan', obat: 'Tanaman Obat / Herbal',
	kayu: 'Tanaman Kayu / Hutan', industri: 'Tanaman Industri / Perkebunan', lainnya: 'Lainnya'
};

const SHORT_LABELS: Record<string, string> = {
	hias: 'Hias', pangan: 'Pangan', obat: 'Obat', kayu: 'Kayu', industri: 'Industri', lainnya: 'Lainnya'
};

const CATEGORY_COLORS: Record<string, { bg: string; accentHex: string }> = {
	obat: { bg: 'bg-[#A7D7C5]', accentHex: '#A7D7C5' },
	pangan: { bg: 'bg-[#FBBF24]', accentHex: '#FBBF24' },
	hias: { bg: 'bg-[#E9D5FF]', accentHex: '#E9D5FF' },
	kayu: { bg: 'bg-[#FED7AA]', accentHex: '#FED7AA' },
	industri: { bg: 'bg-[#BAE6FD]', accentHex: '#BAE6FD' }
};

function resolveDynamicLabel(category: string): string {
	try { return ConfigService.getCategories().find((c) => c.id === category)?.label || category; }
	catch { return category; }
}

export const getCategoryBadgeLabel = (category: PlantCategory): string => BADGE_LABELS[category] || resolveDynamicLabel(category);
export const getCategoryShortLabel = (category: PlantCategory): string => SHORT_LABELS[category] || resolveDynamicLabel(category);

export function getCategoryColorClass(category: PlantCategory) {
	const theme = CATEGORY_COLORS[category] || { bg: 'bg-[#D4F469]', accentHex: '#D4F469' };
	return { bg: theme.bg, text: 'text-[#0D0D0D]', border: 'border-2 border-[#0D0D0D]', dot: '#0D0D0D', accentHex: theme.accentHex };
}

export function formatDateId(isoString: string): string {
	if (!isoString) return '-';
	try { return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(isoString)); }
	catch { return isoString; }
}

export function formatDuration(seconds?: number): string {
	if (!seconds || seconds <= 0) return '0:00';
	return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}
