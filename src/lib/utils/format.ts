// ==============================================================================
// Flora SMK — Formatting & Localization Utilities (Neo-Brutalist Theme)
// Tujuan: Format teks kategori, tanggal Indonesia, durasi, dan token warna pop
// Caller: PlantCard, PlantDetail, Moderation Dashboard
// Dependensi: PlantCategory
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

export function getCategoryColorClass(category: PlantCategory): {
	bg: string;
	text: string;
	border: string;
	dot: string;
	accentHex: string;
} {
	switch (category) {
		case 'obat':
			return {
				bg: 'bg-[#6BB092]',
				text: 'text-stone-900',
				border: 'border-2 border-stone-900',
				dot: '#18181B',
				accentHex: '#6BB092'
			};
		case 'pangan':
			return {
				bg: 'bg-[#F6BD60]',
				text: 'text-stone-900',
				border: 'border-2 border-stone-900',
				dot: '#18181B',
				accentHex: '#F6BD60'
			};
		case 'hias':
			return {
				bg: 'bg-[#CDB4DB]',
				text: 'text-stone-900',
				border: 'border-2 border-stone-900',
				dot: '#18181B',
				accentHex: '#CDB4DB'
			};
		case 'kayu':
			return {
				bg: 'bg-[#E07A5F]',
				text: 'text-stone-900',
				border: 'border-2 border-stone-900',
				dot: '#18181B',
				accentHex: '#E07A5F'
			};
		case 'industri':
			return {
				bg: 'bg-[#93C5FD]',
				text: 'text-stone-900',
				border: 'border-2 border-stone-900',
				dot: '#18181B',
				accentHex: '#93C5FD'
			};
		default:
			return {
				bg: 'bg-[#E5E7EB]',
				text: 'text-stone-900',
				border: 'border-2 border-stone-900',
				dot: '#18181B',
				accentHex: '#E5E7EB'
			};
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
