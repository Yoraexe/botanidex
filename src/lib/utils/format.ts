// ==============================================================================
// Flora SMK — Formatting & Localization Utilities
// Tujuan: Format teks kategori, tanggal Indonesia, dan durasi video
// Caller: PlantCard, PlantDetail, Moderation Dashboard
// Dependensi: PlantCategory
// Main Functions: getCategoryBadgeLabel, getCategoryColorClass, formatDateId, formatDuration
// Side Effects: none (pure function)
// ==============================================================================

import type { PlantCategory } from '../types/plant.types';

export function getCategoryBadgeLabel(category: PlantCategory): string {
	const labels: Record<PlantCategory, string> = {
		hias: 'Tanaman Hias',
		pangan: 'Tanaman Pangan',
		obat: 'Tanaman Obat / Herbal',
		kayu: 'Tanaman Kayu / Hutan',
		industri: 'Tanaman Industri / Perkebunan',
		lainnya: 'Lainnya'
	};
	return labels[category] || category;
}

export function getCategoryColorClass(category: PlantCategory): { bg: string; text: string; border: string; dot: string } {
	switch (category) {
		case 'obat':
			return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: '#059669' };
		case 'pangan':
			return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: '#d97706' };
		case 'hias':
			return { bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-200', dot: '#db2777' };
		case 'kayu':
			return { bg: 'bg-stone-100', text: 'text-stone-800', border: 'border-stone-300', dot: '#57534e' };
		case 'industri':
			return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', dot: '#2563eb' };
		default:
			return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', dot: '#6b7280' };
	}
}

export function formatDateId(isoString: string): string {
	if (!isoString) return '-';
	try {
		const date = new Date(isoString);
		return new Intl.DateTimeFormat('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(date);
	} catch {
		return isoString;
	}
}

export function formatDuration(seconds?: number): string {
	if (!seconds || seconds <= 0) return '0:00';
	const mins = Math.floor(seconds / 60);
	const remSecs = Math.floor(seconds % 60);
	return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
}
