// ==============================================================================
// Botanidex — Authentication Input Validation Schemas
// Tujuan: Validasi batas skema Zod untuk form login, pendaftaran siswa, dan reset password
// Caller: auth.service.ts, /login, /register
// Dependensi: zod
// Main Functions: loginSchema, registerSchema, resetPasswordSchema
// Side Effects: none (pure schema parsing & transformation)
// ==============================================================================

import { z } from 'zod';

export const loginSchema = z.object({
	email: z
		.string()
		.trim()
		.min(1, 'Email wajib diisi')
		.email('Format email tidak valid')
		.toLowerCase(),
	password: z
		.string()
		.min(6, 'Kata sandi minimal 6 karakter')
		.max(72, 'Kata sandi terlalu panjang')
});

export const registerSchema = z
	.object({
		displayName: z
			.string()
			.trim()
			.min(3, 'Nama lengkap minimal 3 karakter')
			.max(60, 'Nama lengkap maksimal 60 karakter'),
		email: z
			.string()
			.trim()
			.min(1, 'Email wajib diisi')
			.email('Format email tidak valid')
			.toLowerCase(),
		password: z
			.string()
			.min(6, 'Kata sandi minimal 6 karakter')
			.max(72, 'Kata sandi terlalu panjang'),
		confirmPassword: z
			.string()
			.min(1, 'Konfirmasi kata sandi wajib diisi'),
		// SEC-01 Hardening: Registrasi publik dikunci hanya untuk peran 'contributor'
		role: z
			.literal('contributor')
			.default('contributor')
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Konfirmasi kata sandi tidak cocok dengan kata sandi',
		path: ['confirmPassword']
	});

export const resetPasswordSchema = z.object({
	email: z
		.string()
		.trim()
		.min(1, 'Email wajib diisi')
		.email('Format email tidak valid')
		.toLowerCase()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
