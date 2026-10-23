// ==============================================================================
// Botanidex — App Configuration Zod Schema
// Tujuan: Validasi integritas data pengaturan dinamis CMS aplikasi (mendukung URL absolut, data URI, dan path lokal)
// Caller: config.service.ts, admin/pengaturan
// Dependensi: zod
// Main Functions: imageSourceSchema, appConfigSchema, heroConfigSchema, schoolIdentitySchema
// Side Effects: none
// ==============================================================================

import { z } from 'zod';

const isValidImageSource = (val: string): boolean => {
	const v = val.trim();
	if (v.startsWith('/') && v.length > 1 && !v.startsWith('//')) return true;
	if (v.startsWith('data:image/')) return true;
	try {
		const parsed = new URL(v);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
};

export const imageSourceSchema = (message: string) =>
	z.string().trim().min(2, { message }).refine(isValidImageSource, { message });

export const schoolIdentitySchema = z.object({
	appName: z.string().min(2).max(40),
	schoolName: z.string().min(2).max(80),
	tagline: z.string().max(120),
	headerBadge: z.string().max(60)
});

export const gardenPhotoSchema = z.object({
	id: z.string().min(1),
	url: imageSourceSchema('URL gambar kebun harus valid (http/https atau path lokal /...)'),
	title: z.string().min(2).max(80),
	badge: z.string().min(2).max(40)
});

export const specimenItemSchema = z.object({
	id: z.string().min(1),
	commonName: z.string().min(2).max(60),
	latinName: z.string().min(2).max(80),
	url: imageSourceSchema('URL gambar spesimen harus valid (http/https atau path lokal /...)')
});

export const categoryItemSchema = z.object({
	id: z.string().min(2).max(30),
	label: z.string().min(2).max(40),
	dotColor: z.string().min(2).max(40),
	activeColor: z.string().optional()
});

export const appDownloadSchema = z.object({
	title: z.string().min(2).max(60),
	description: z.string().min(5).max(200),
	showIosBadge: z.boolean(),
	showAndroidBadge: z.boolean(),
	buttonLabel: z.string().min(2).max(30)
});

export const heroConfigSchema = z.object({
	headlineLine1: z.string().min(2).max(40),
	headlineLine2: z.string().min(2).max(40),
	gardenPhotos: z.array(gardenPhotoSchema).min(1, 'Minimal harus ada 1 foto fasilitas kebun'),
	specimens: z.array(specimenItemSchema).min(1, 'Minimal harus ada 1 spesimen tanaman'),
	appDownload: appDownloadSchema
});

export const appConfigSchema = z.object({
	version: z.number().int().positive(),
	updatedAt: z.string(),
	identity: schoolIdentitySchema,
	hero: heroConfigSchema,
	categories: z.array(categoryItemSchema).min(1, 'Minimal harus ada 1 kategori')
});
