// ==============================================================================
// Botanidex — Contribution Moderation Zod Schema
// Tujuan: Validasi payload moderasi guru (approval/rejection dengan alasan)
// Caller: src/lib/services/plant.service.ts
// Dependensi: zod
// Main Functions: moderationReviewSchema
// Side Effects: none (validation only)
// ==============================================================================

import { z } from 'zod';

export const moderationReviewSchema = z
	.object({
		plant_id: z.string().min(1, { message: 'Plant ID wajib diisi' }),
		action: z.enum(['approve', 'reject']),
		rejection_reason: z
			.string()
			.max(500, { message: 'Alasan penolakan maksimal 500 karakter' })
			.optional()
	})
	.refine(
		(data) => {
			if (
				data.action === 'reject' &&
				(!data.rejection_reason || data.rejection_reason.trim().length === 0)
			) {
				return false;
			}
			return true;
		},
		{
			message: 'Alasan wajib diisi jika menolak kontribusi',
			path: ['rejection_reason']
		}
	);
