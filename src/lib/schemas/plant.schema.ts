// ==============================================================================
// Botanidex — Plant Zod Validation Schema
// Tujuan: Validasi input data botani, taksonomi, dan sanitasi batasan teks
// Caller: Plant forms, API endpoints, server load functions
// Dependensi: zod
// Main Functions: plantFormSchema, plantSearchSchema
// Side Effects: none (schema validation only)
// ==============================================================================

import { z } from 'zod';

export const plantCategorySchema = z.enum([
	'hias',
	'pangan',
	'obat',
	'kayu',
	'industri',
	'lainnya'
]);

export const plantFormSchema = z.object({
	name_local: z
		.string()
		.min(2, { message: 'Nama lokal minimal 2 karakter' })
		.max(100, { message: 'Nama lokal maksimal 100 karakter' })
		.trim(),
	name_latin: z
		.string()
		.min(2, { message: 'Nama Latin ilmiah minimal 2 karakter' })
		.max(120, { message: 'Nama Latin maksimal 120 karakter' })
		.trim(),
	name_english: z.string().max(100).optional().or(z.literal('')),
	aliases_raw: z.string().max(250).optional().or(z.literal('')),
	category: plantCategorySchema,
	description: z
		.string()
		.min(10, { message: 'Deskripsi minimal 10 karakter' })
		.max(5000, { message: 'Deskripsi maksimal 5000 karakter' })
		.trim(),
	taxonomy_kingdom: z.string().max(60).default('Plantae'),
	taxonomy_divisio: z.string().max(60).optional().or(z.literal('')),
	taxonomy_classis: z.string().max(60).optional().or(z.literal('')),
	taxonomy_ordo: z.string().max(60).optional().or(z.literal('')),
	taxonomy_familia: z.string().max(60).optional().or(z.literal('')),
	taxonomy_genus: z.string().max(60).optional().or(z.literal('')),
	taxonomy_species: z.string().max(60).optional().or(z.literal('')),
	location_label: z.string().max(120).optional().or(z.literal('')),
	location_x: z.number().min(0).max(100).optional(),
	location_y: z.number().min(0).max(100).optional(),
	video_title: z.string().max(150).optional().or(z.literal(''))
});

export type PlantFormValues = z.infer<typeof plantFormSchema>;
