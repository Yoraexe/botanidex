// ==============================================================================
// Botanidex — Plant & Moderation Zod Validation Schemas
// Tujuan: Validasi input data botani, taksonomi, kategori dinamis CMS, durasi video, dan moderasi guru
// Caller: Plant forms, PlantService, unit tests
// Dependensi: zod, src/lib/services/config.service.ts
// Main Functions: plantCategorySchema, plantFormSchema, moderationReviewSchema
// Side Effects: Membaca daftar kategori aktif dari ConfigService saat validasi
// ==============================================================================

import { z } from 'zod';
import { ConfigService } from '../services/config.service';

const CORE_CATEGORIES = ['hias', 'pangan', 'obat', 'kayu', 'industri', 'lainnya'] as const;

export const plantCategorySchema = z
	.string()
	.min(2, { message: 'Kategori tanaman wajib dipilih' })
	.max(40)
	.trim()
	.refine(
		(val) => {
			if (val === 'semua') return false;
			if ((CORE_CATEGORIES as readonly string[]).includes(val)) return true;
			return ConfigService.getCategories().some((c) => c.id === val && c.id !== 'semua');
		},
		{ message: 'Kategori tanaman tidak terdaftar dalam sistem' }
	);

export const plantFormSchema = z.object({
	name_local: z.string().min(2, { message: 'Nama lokal minimal 2 karakter' }).max(100, { message: 'Nama lokal maksimal 100 karakter' }).trim(),
	name_latin: z.string().min(2, { message: 'Nama Latin ilmiah minimal 2 karakter' }).max(120, { message: 'Nama Latin maksimal 120 karakter' }).trim(),
	name_english: z.string().max(100).optional().or(z.literal('')),
	aliases_raw: z.string().max(250).optional().or(z.literal('')),
	category: plantCategorySchema,
	quantity: z.coerce.number().int({ message: 'Jumlah tanaman harus berupa bilangan bulat' }).min(1, { message: 'Jumlah tanaman minimal 1' }).default(1),
	unit: z.string().min(1, { message: 'Satuan populasi wajib diisi' }).max(30).default('pohon'),
	description: z.string().min(10, { message: 'Deskripsi minimal 10 karakter' }).max(5000, { message: 'Deskripsi maksimal 5000 karakter' }).trim(),
	taxonomy_kingdom: z.string().max(60).default('Plantae'),
	taxonomy_divisio: z.string().max(60).optional().or(z.literal('')),
	taxonomy_classis: z.string().max(60).optional().or(z.literal('')),
	taxonomy_ordo: z.string().max(60).optional().or(z.literal('')),
	taxonomy_familia: z.string().max(60).optional().or(z.literal('')),
	taxonomy_genus: z.string().max(60).optional().or(z.literal('')),
	taxonomy_species: z.string().max(80).optional().or(z.literal('')),
	location_label: z.string().max(120).optional().or(z.literal('')),
	location_x: z.number().min(0).max(100).optional(),
	location_y: z.number().min(0).max(100).optional(),
	video_title: z.string().max(150).optional().or(z.literal('')),
	video_duration_seconds: z.number().min(0).max(300, { message: 'Durasi video maksimal 5 menit (300 detik)' }).optional()
});

export const moderationReviewSchema = z
	.object({
		plant_id: z.string().min(1, { message: 'Plant ID wajib diisi' }),
		action: z.enum(['approve', 'reject']),
		rejection_reason: z.string().max(500, { message: 'Alasan penolakan maksimal 500 karakter' }).optional()
	})
	.refine((d) => !(d.action === 'reject' && !d.rejection_reason?.trim()), {
		message: 'Alasan wajib diisi jika menolak kontribusi',
		path: ['rejection_reason']
	});

export type PlantFormValues = z.infer<typeof plantFormSchema>;
