// ==============================================================================
// Botanidex — Auth Schema Unit Tests (Vitest)
// Tujuan: Memvalidasi kontrak input login, register, dan reset password dengan Zod
// Caller: npm run test:unit
// Dependensi: vitest, src/lib/schemas/auth.schema.ts
// Main Functions: test cases for loginSchema, registerSchema, resetPasswordSchema
// Side Effects: none (unit test suite)
// ==============================================================================

import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, resetPasswordSchema } from './auth.schema';

describe('Auth Validation Schemas', () => {
	describe('loginSchema', () => {
		it('menerima kredensial email dan password yang valid', () => {
			const valid = {
				email: 'guru.agronomi@smkpertanian.sch.id',
				password: 'Password123'
			};
			const res = loginSchema.safeParse(valid);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.email).toBe('guru.agronomi@smkpertanian.sch.id');
				expect(res.data.password).toBe('Password123');
			}
		});

		it('menolak email dengan format tidak valid', () => {
			const invalid = {
				email: 'bukan-email',
				password: 'Password123'
			};
			const res = loginSchema.safeParse(invalid);
			expect(res.success).toBe(false);
		});

		it('menolak password yang terlalu pendek (< 6 karakter)', () => {
			const invalid = {
				email: 'guru@sekolah.id',
				password: '123'
			};
			const res = loginSchema.safeParse(invalid);
			expect(res.success).toBe(false);
		});

		it('melakukan sanitasi lowercase dan trim pada email', () => {
			const input = {
				email: '  Guru.Botani@Sekolah.ID  ',
				password: 'SecretPassword'
			};
			const res = loginSchema.safeParse(input);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.email).toBe('guru.botani@sekolah.id');
			}
		});
	});

	describe('registerSchema', () => {
		it('menerima payload registrasi siswa yang valid dan lengkap', () => {
			const valid = {
				displayName: 'Ahmad Fauzi',
				email: 'ahmad.fauzi@siswa.smkpertanian.sch.id',
				password: 'PasswordSiswa123',
				confirmPassword: 'PasswordSiswa123',
				role: 'contributor'
			};
			const res = registerSchema.safeParse(valid);
			expect(res.success).toBe(true);
		});

		it('menolak jika confirmPassword tidak cocok dengan password', () => {
			const mismatch = {
				displayName: 'Siti Rahma',
				email: 'siti@siswa.id',
				password: 'PasswordA123',
				confirmPassword: 'PasswordB456',
				role: 'contributor'
			};
			const res = registerSchema.safeParse(mismatch);
			expect(res.success).toBe(false);
		});

		it('menolak jika nama tampilan terlalu pendek (< 3 karakter)', () => {
			const shortName = {
				displayName: 'Al',
				email: 'al@siswa.id',
				password: 'Password123',
				confirmPassword: 'Password123'
			};
			const res = registerSchema.safeParse(shortName);
			expect(res.success).toBe(false);
		});

		it('menolak upaya eskalasi privilege registrasi peran admin (SEC-01 Regression)', () => {
			const malicious = {
				displayName: 'Hacker Siswa',
				email: 'hacker@siswa.id',
				password: 'Password123',
				confirmPassword: 'Password123',
				role: 'admin'
			};
			const res = registerSchema.safeParse(malicious);
			expect(res.success).toBe(false);
		});
	});

	describe('resetPasswordSchema', () => {
		it('memvalidasi email permohonan reset password', () => {
			expect(resetPasswordSchema.safeParse({ email: 'guru@smk.id' }).success).toBe(true);
			expect(resetPasswordSchema.safeParse({ email: 'salah' }).success).toBe(false);
		});
	});
});
