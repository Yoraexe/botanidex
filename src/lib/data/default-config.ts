// ==============================================================================
// Botanidex — Factory Default App Configuration
// Tujuan: Preset bawaan resmi saat aplikasi pertama kali dijalankan atau di-reset
// Caller: config.repository.ts, config.service.ts
// Dependensi: config.types.ts
// Main Functions: DEFAULT_APP_CONFIG
// Side Effects: none (static configuration preset)
// ==============================================================================

import type { AppConfig } from '#lib/types/config.types';

export const DEFAULT_APP_CONFIG: AppConfig = {
	version: 1,
	updatedAt: '2026-10-23T00:00:00.000Z',
	identity: {
		appName: 'Botanidex',
		schoolName: 'SMK PPN Gorontalo',
		tagline: 'Katalog Botani Digital SMK PPN Gorontalo',
		headerBadge: 'SMK PPN GORONTALO'
	},
	hero: {
		headlineLine1: 'KATALOG BOTANI',
		headlineLine2: 'SMK PPN GORONTALO',
		gardenPhotos: [
			{
				id: 'garden-1',
				url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
				title: 'Greenhouse Florikultura & Pembibitan Modern',
				badge: 'FASILITAS KEBUN SEKOLAH'
			},
			{
				id: 'garden-2',
				url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=80',
				title: 'Kebun Tanaman Pangan & Hidroponik Agribisnis',
				badge: 'LAHAN OBSERVASI AGRONOMI'
			},
			{
				id: 'garden-3',
				url: 'https://images.unsplash.com/photo-1592417817098-8f3d69102a49?auto=format&fit=crop&w=1200&q=80',
				title: 'Taman Koleksi Tanaman Obat Tradisional (TOGA)',
				badge: 'LABORATORIUM BOTANI ALAMI'
			}
		],
		specimens: [
			{
				id: 'specimen-1',
				commonName: 'Mawar Floribunda',
				latinName: 'Rosa floribunda',
				url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80'
			},
			{
				id: 'specimen-2',
				commonName: 'Anggrek Bulan',
				latinName: 'Phalaenopsis amabilis',
				url: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80'
			},
			{
				id: 'specimen-3',
				commonName: 'Monstera Deliciosa',
				latinName: 'Monstera deliciosa',
				url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80'
			}
		],
		appDownload: {
			title: 'Aplikasi Lapangan',
			description: 'Akses katalog botani SMK PPN Gorontalo langsung dari perangkat Android atau iOS Anda.',
			showIosBadge: true,
			showAndroidBadge: true,
			buttonLabel: 'Pasang Aplikasi'
		}
	},
	categories: [
		{ id: 'semua', label: 'Semua', dotColor: 'bg-stone-800' },
		{ id: 'obat', label: 'Obat (TOGA)', dotColor: 'bg-emerald-500' },
		{ id: 'pangan', label: 'Pangan', dotColor: 'bg-amber-500' },
		{ id: 'hias', label: 'Hias', dotColor: 'bg-pink-500' },
		{ id: 'industri', label: 'Perkebunan', dotColor: 'bg-amber-800' },
		{ id: 'kayu', label: 'Kayu', dotColor: 'bg-lime-700' }
	]
};
