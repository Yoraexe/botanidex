// ==============================================================================
// Flora SMK — Formatting & Localization Utilities (Neo-Brutalist Theme)
// Tujuan: Format teks kategori, tanggal Indonesia, durasi, dan token warna botani
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
				bg: 'bg-[#A7D7C5]',
				text: 'text-[#0D0D0D]',
				border: 'border-2 border-[#0D0D0D]',
				dot: '#0D0D0D',
				accentHex: '#A7D7C5'
			};
		case 'pangan':
			return {
				bg: 'bg-[#FBBF24]',
				text: 'text-[#0D0D0D]',
				border: 'border-2 border-[#0D0D0D]',
				dot: '#0D0D0D',
				accentHex: '#FBBF24'
			};
		case 'hias':
			return {
				bg: 'bg-[#E9D5FF]',
				text: 'text-[#0D0D0D]',
				border: 'border-2 border-[#0D0D0D]',
				dot: '#0D0D0D',
				accentHex: '#E9D5FF'
			};
		case 'kayu':
			return {
				bg: 'bg-[#FED7AA]',
				text: 'text-[#0D0D0D]',
				border: 'border-2 border-[#0D0D0D]',
				dot: '#0D0D0D',
				accentHex: '#FED7AA'
			};
		case 'industri':
			return {
				bg: 'bg-[#BAE6FD]',
				text: 'text-[#0D0D0D]',
				border: 'border-2 border-[#0D0D0D]',
				dot: '#0D0D0D',
				accentHex: '#BAE6FD'
			};
		default:
			return {
				bg: 'bg-[#E5E7EB]',
				text: 'text-[#0D0D0D]',
				border: 'border-2 border-[#0D0D0D]',
				dot: '#0D0D0D',
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
