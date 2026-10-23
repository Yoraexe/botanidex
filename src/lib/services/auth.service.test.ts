// ==============================================================================
// Botanidex — Auth Service Unit Tests (Vitest)
// Tujuan: Pengujian unit logic bisnis AuthService: validasi Zod, mapping error, role check, demo login
// Caller: npm run test:unit
// Dependensi: vitest, src/lib/services/auth.service.ts
// Main Functions: test cases for AuthService.login, AuthService.register, AuthService.logout
// Side Effects: none (mocked dependencies)
// ==============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { AuthRepository, DEMO_USERS } from '../repositories/auth.repository';

describe('AuthService', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	describe('login', () => {
		it('mengembalikan error validasi jika email kosong atau tidak valid', async () => {
			const res = await AuthService.login({ email: 'salah', password: 'password123' });
			expect(res.success).toBe(false);
			expect(res.error?.code).toBe('validation_error');
		});

		it('mengembalikan error validasi jika password kurang dari 6 karakter', async () => {
			const res = await AuthService.login({ email: 'guru@smk.id', password: '123' });
			expect(res.success).toBe(false);
			expect(res.error?.code).toBe('validation_error');
		});

		it('berhasil memproses login jika kredensial valid', async () => {
			vi.spyOn(AuthRepository, 'signIn').mockResolvedValue({
				success: true,
				data: DEMO_USERS.admin
			});

			const res = await AuthService.login({
				email: 'guru.agronomi@smkpertanian.sch.id',
				password: 'ValidPassword123'
			});

			expect(res.success).toBe(true);
			expect(res.data?.role).toBe('admin');
			expect(res.data?.email).toBe('guru.agronomi@smkpertanian.sch.id');
		});

		it('memetakan pesan error Supabase invalid_credentials ke bahasa Indonesia yang ramah', async () => {
			vi.spyOn(AuthRepository, 'signIn').mockResolvedValue({
				success: false,
				error: {
					code: 'invalid_credentials',
					message: 'Invalid login credentials'
				}
			});

			const res = await AuthService.login({
				email: 'guru@smk.id',
				password: 'WrongPassword123'
			});

			expect(res.success).toBe(false);
			expect(res.error?.message).toContain('Email atau kata sandi');
		});
	});

	describe('register', () => {
		it('mengembalikan error validasi jika password dan confirmPassword tidak cocok', async () => {
			const res = await AuthService.register({
				displayName: 'Siswa Baru',
				email: 'siswa@smk.id',
				password: 'Password123',
				confirmPassword: 'BedaPassword456'
			});

			expect(res.success).toBe(false);
			expect(res.error?.code).toBe('validation_error');
		});

		it('berhasil memproses registrasi siswa baru', async () => {
			const mockCreated = {
				id: 'new-id',
				email: 'siswa.baru@smk.id',
				display_name: 'Siswa Baru',
				role: 'contributor' as const
			};

			vi.spyOn(AuthRepository, 'signUp').mockResolvedValue({
				success: true,
				data: mockCreated
			});

			const res = await AuthService.register({
				displayName: 'Siswa Baru',
				email: 'siswa.baru@smk.id',
				password: 'Password123',
				confirmPassword: 'Password123',
				role: 'contributor'
			});

			expect(res.success).toBe(true);
			expect(res.data?.display_name).toBe('Siswa Baru');
		});
	});

	describe('Role authorization checks', () => {
		it('isAdmin mengidentifikasi peran admin dengan benar', () => {
			expect(AuthService.isAdmin(DEMO_USERS.admin)).toBe(true);
			expect(AuthService.isAdmin(DEMO_USERS.contributor)).toBe(false);
			expect(AuthService.isAdmin(null)).toBe(false);
		});

		it('isContributor mengidentifikasi kontributor dan admin', () => {
			expect(AuthService.isContributor(DEMO_USERS.contributor)).toBe(true);
			expect(AuthService.isContributor(DEMO_USERS.admin)).toBe(true);
			expect(AuthService.isContributor({ id: 'v1', email: 'guest@web.id', display_name: 'Guest', role: 'viewer' })).toBe(false);
			expect(AuthService.isContributor(null)).toBe(false);
		});
	});

	describe('loginAsDemo', () => {
		it('mengembalikan profil demo yang sesuai secara instan', () => {
			const admin = AuthService.loginAsDemo('admin');
			expect(admin.role).toBe('admin');
			expect(admin.display_name).toContain('Ir. Suhardi');

			const siswa = AuthService.loginAsDemo('contributor');
			expect(siswa.role).toBe('contributor');
			expect(siswa.display_name).toContain('Ahmad Fauzi');
		});
	});
});
