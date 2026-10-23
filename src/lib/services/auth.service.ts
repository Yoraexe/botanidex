// ==============================================================================
// Botanidex — Authentication Service Layer
// Tujuan: Business logic autentikasi, validasi input schema Zod, pemetaan error user-friendly, dan helper otorisasi peran
// Caller: auth.store.ts, /login, /register, +layout.svelte, Route guards
// Dependensi: auth.repository.ts, auth.schema.ts, auth.types.ts, user.types.ts
// Main Functions: AuthService.login, AuthService.register, AuthService.logout,
//                 AuthService.resetPassword, AuthService.loginAsDemo, AuthService.isAdmin, AuthService.isContributor
// Side Effects: Berinteraksi dengan AuthRepository dan sinkronisasi auth.store
// ==============================================================================

import { AuthRepository, DEMO_USERS } from '../repositories/auth.repository';
import { loginSchema, registerSchema, resetPasswordSchema } from '../schemas/auth.schema';
import type { AuthResult } from '../types/auth.types';
import type { UserProfile, UserRole } from '../types/user.types';

export class AuthService {
	/**
	 * Melakukan login akun dengan validasi Zod ketat dan pemetaan pesan kesalahan
	 */
	static async login(rawInput: unknown): Promise<AuthResult<UserProfile>> {
		const parsed = loginSchema.safeParse(rawInput);
		if (!parsed.success) {
			const firstError = parsed.error.issues[0];
			return {
				success: false,
				error: {
					code: 'validation_error',
					message: firstError?.message || 'Data login tidak valid.',
					field: firstError?.path[0] as any
				}
			};
		}

		const res = await AuthRepository.signIn(parsed.data);
		if (!res.success && res.error) {
			return {
				success: false,
				error: {
					code: res.error.code,
					message: this.mapErrorMessage(res.error.code, res.error.message)
				}
			};
		}

		return res;
	}

	/**
	 * Mendaftarkan akun siswa baru dengan validasi konfirmasi kata sandi
	 */
	static async register(rawInput: unknown): Promise<AuthResult<UserProfile>> {
		const parsed = registerSchema.safeParse(rawInput);
		if (!parsed.success) {
			const firstError = parsed.error.issues[0];
			return {
				success: false,
				error: {
					code: 'validation_error',
					message: firstError?.message || 'Data pendaftaran tidak valid.',
					field: firstError?.path[0] as any
				}
			};
		}

		const res = await AuthRepository.signUp(parsed.data);
		if (!res.success && res.error) {
			return {
				success: false,
				error: {
					code: res.error.code,
					message: this.mapErrorMessage(res.error.code, res.error.message)
				}
			};
		}

		return res;
	}

	/**
	 * Mengajukan reset kata sandi akun
	 */
	static async resetPassword(rawInput: unknown): Promise<AuthResult<void>> {
		const parsed = resetPasswordSchema.safeParse(rawInput);
		if (!parsed.success) {
			return {
				success: false,
				error: {
					code: 'validation_error',
					message: parsed.error.issues[0]?.message || 'Email tidak valid.'
				}
			};
		}

		const res = await AuthRepository.resetPassword(parsed.data.email);
		if (!res.success && res.error) {
			return {
				success: false,
				error: {
					code: res.error.code,
					message: this.mapErrorMessage(res.error.code, res.error.message)
				}
			};
		}

		return { success: true };
	}

	/**
	 * Melakukan logout akun aktif
	 */
	static async logout(): Promise<void> {
		await AuthRepository.signOut();
	}

	/**
	 * Login cepat akun demo (untuk mode development atau evaluasi sekolah)
	 */
	static loginAsDemo(role: 'admin' | 'contributor'): UserProfile {
		const user = DEMO_USERS[role];
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('flora_smk_auth_user_v1', JSON.stringify(user));
			} catch {
				// ignore
			}
		}
		return user;
	}

	/**
	 * Otorisasi: memeriksa apakah pengguna memiliki hak akses Administrator / Guru
	 */
	static isAdmin(user: UserProfile | null): boolean {
		return user?.role === 'admin';
	}

	/**
	 * Otorisasi: memeriksa apakah pengguna memiliki hak kontribusi (Siswa atau Guru)
	 */
	static isContributor(user: UserProfile | null): boolean {
		return user?.role === 'admin' || user?.role === 'contributor';
	}

	/**
	 * Menerjemahkan kode error Supabase Auth menjadi pesan bahasa Indonesia yang ramah & aman
	 */
	private static mapErrorMessage(code: string, fallback: string): string {
		const lowerCode = code.toLowerCase();
		const lowerMsg = fallback.toLowerCase();

		if (lowerCode.includes('invalid_credentials') || lowerMsg.includes('invalid login credentials')) {
			return 'Email atau kata sandi yang Anda masukkan salah. Silakan periksa kembali.';
		}
		if (lowerCode.includes('user_already_exists') || lowerMsg.includes('already registered')) {
			return 'Email ini sudah terdaftar. Silakan masuk menggunakan akun Anda.';
		}
		if (lowerCode.includes('email_not_confirmed') || lowerMsg.includes('email not confirmed')) {
			return 'Email Anda belum dikonfirmasi. Silakan periksa kotak masuk atau folder spam email Anda.';
		}
		if (lowerCode.includes('over_request_rate_limit') || lowerMsg.includes('rate limit')) {
			return 'Terlalu banyak percobaan masuk. Mohon tunggu beberapa saat sebelum mencoba lagi.';
		}
		if (lowerCode.includes('network_error') || lowerMsg.includes('failed to fetch')) {
			return 'Tidak dapat terhubung ke server autentikasi. Pastikan perangkat Anda terhubung ke internet.';
		}
		if (lowerCode.includes('user_not_found')) {
			return 'Akun dengan email tersebut tidak ditemukan.';
		}

		return fallback || 'Terjadi kendala pada sistem autentikasi. Silakan coba lagi.';
	}
}
