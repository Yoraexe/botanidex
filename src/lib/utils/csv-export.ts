// ==============================================================================
// Botanidex — CSV Catalog Exporter
// Tujuan: Menghasilkan berkas CSV inventaris botani sekolah berstandar UTF-8 BOM untuk kompatibilitas Microsoft Excel dan akreditasi
// Caller: src/routes/admin/moderasi, src/routes/admin/pengaturan
// Dependensi: src/lib/types/plant.types.ts
// Main Functions: generatePlantsCsvString, exportPlantsToCsv
// Side Effects: Memicu download berkas di peramban pengguna
// ==============================================================================

import type { Plant } from '../types/plant.types';

function escapeCsvField(field: unknown): string {
	if (field === null || field === undefined) return '""';
	let str = String(field);
	// ADV-01 Hardening: Cegah CSV Formula / DDE Injection (CWE-1236)
	// Jika karakter pertama adalah =, +, -, @, \t, atau \r, berikan prefix petik tunggal (')
	if (/^[=+\-@\t\r]/.test(str)) {
		str = `'${str}`;
	}
	return `"${str.replace(/"/g, '""')}"`;
}

export function generatePlantsCsvString(plants: Plant[]): string {
	const headers = [
		'ID',
		'Slug',
		'Nama Lokal',
		'Nama Latin',
		'Nama Inggris',
		'Sinonim / Nama Lain',
		'Kategori',
		'Jumlah Populasi',
		'Satuan',
		'Kingdom',
		'Divisio',
		'Classis',
		'Ordo',
		'Familia',
		'Genus',
		'Species',
		'Koordinat X (%)',
		'Koordinat Y (%)',
		'Label Lokasi',
		'Status Publikasi',
		'Kontributor',
		'Jumlah Foto',
		'Jumlah Video',
		'Tanggal Dibuat',
		'Tanggal Diperbarui'
	];

	const rows = plants.map((p) => [
		escapeCsvField(p.id),
		escapeCsvField(p.slug),
		escapeCsvField(p.name_local),
		escapeCsvField(p.name_latin),
		escapeCsvField(p.name_english || ''),
		escapeCsvField((p.aliases || []).join('; ')),
		escapeCsvField(p.category),
		escapeCsvField(p.quantity || 1),
		escapeCsvField(p.unit || 'pohon'),
		escapeCsvField(p.taxonomy?.kingdom || 'Plantae'),
		escapeCsvField(p.taxonomy?.divisio || ''),
		escapeCsvField(p.taxonomy?.classis || ''),
		escapeCsvField(p.taxonomy?.ordo || ''),
		escapeCsvField(p.taxonomy?.familia || ''),
		escapeCsvField(p.taxonomy?.genus || ''),
		escapeCsvField(p.taxonomy?.species || ''),
		escapeCsvField(p.location_x ?? ''),
		escapeCsvField(p.location_y ?? ''),
		escapeCsvField(p.location_label || ''),
		escapeCsvField(p.status),
		escapeCsvField(p.contributor_name || ''),
		escapeCsvField(p.photos?.length || 0),
		escapeCsvField(p.videos?.length || 0),
		escapeCsvField(p.created_at),
		escapeCsvField(p.updated_at)
	]);

	// Prepend UTF-8 BOM (\uFEFF) untuk membuka karakter non-ASCII di Excel tanpa garbled
	return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

export function exportPlantsToCsv(plants: Plant[], filenamePrefix = 'inventaris-botani-smk'): void {
	if (typeof window === 'undefined') return;

	const csvContent = generatePlantsCsvString(plants);
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const dateStr = new Date().toISOString().slice(0, 10);
	const filename = `${filenamePrefix}-${dateStr}.csv`;

	const link = document.createElement('a');
	link.href = url;
	link.setAttribute('download', filename);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
