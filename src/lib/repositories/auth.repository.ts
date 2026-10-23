// ==============================================================================
// Botanidex — Authentication Repository Layer
// Tujuan: Menjembatani interaksi otentikasi Supabase Auth & tabel public.profiles dengan fallback offline-safe
// Caller: auth.service.ts
// Dependensi: src/lib/supabase.ts, src/lib/types/auth.types.ts, src/lib/types/user.types.ts
// Main Functions: AuthRepository.signIn, AuthRepository.signUp, AuthRepository.signOut,
//                 AuthRepository.getSession, AuthRepository.resetPassword, AuthRepository.onAuthStateChange
// Side Effects: Supabase Auth HTTP API / WebSocket, DB queries ke public.profiles, LocalStorage sync
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import type { AuthCredentials, RegisterPayload, AuthResult } from '../types/auth.types';
import type { UserProfile, UserRole } from '../types/user.types';

const OFFLINE_AUTH_KEY = 'flora_smk_auth_user_v1';

export const DEMO_USERS: Record<'admin' | 'contributor', UserProfile> = {
	admin: {
		id: 'a0000000-0000-0000-0000-000000000001',
		email: 'guru.agronomi@smkpertanian.sch.id',
		display_name: 'Ir. Suhardi, M.P. (Guru Agribisnis & Pembimbing)',
		role: 'admin'
	},
	contributor: {
		id: 'c0000000-0000-0000-0000-000000000002',
		email: 'ahmad.fauzi@siswa.smkpertanian.sch.id',
		display_name: 'Ahmad Fauzi (Siswa XII Agribisnis)',
		role: 'contributor'
	}
};

export class AuthRepository {
	/**
	 * Memeriksa apakah Supabase online & terkonfigurasi
	 */
	static isLive(): boolean {
		return isSupabaseConfigured();
	}

	/**
	 * Mengambil profil lengkap pengguna dari tabel public.profiles
	 */
	static async getProfileById(userId: string): Promise<UserProfile | null> {
		if (!this.isLive()) {
			return Object.values(DEMO_USERS).find((u) => u.id === userId) || null;
		}

		try {
			const { data, error } = await supabase
				.from('profiles')
				.select('id, display_name, role')
				.eq('id', userId)
				.maybeSingle();

			if (error || !data) return null;

			// Dapatkan email dari session auth aktif
			const { data: sessionData } = await supabase.auth.getSession();
			const email = sessionData.session?.user?.email || '';

			return {
				id: data.id,
				email,
				display_name: data.display_name,
				role: data.role as UserRole
			};
		} catch {
			return null;
		}
	}

	/**
	 * Melakukan login dengan email dan kata sandi
	 */
	static async signIn(credentials: AuthCredentials): Promise<AuthResult<UserProfile>> {
		const email = credentials.email.trim().toLowerCase();

		// Mode Offline / Demo Fallback
		if (!this.isLive()) {
			const matched = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === email);
			if (matched) {
				this.persistLocalSession(matched);
				return { success: true, data: matched };
			}

			// Jika kata sandi demo umum digunakan
			if (credentials.password === 'Guru123456!' || credentials.password.toLowerCase().includes('guru')) {
				this.persistLocalSession(DEMO_USERS.admin);
				return { success: true, data: DEMO_USERS.admin };
			}

			if (credentials.password === 'Siswa123456!' || credentials.password.toLowerCase().includes('siswa')) {
				this.persistLocalSession(DEMO_USERS.contributor);
				return { success: true, data: DEMO_USERS.contributor };
			}

			return {
				success: false,
				error: {
					code: 'invalid_credentials',
					message: 'Email atau kata sandi tidak cocok dengan akun demo yang tersedia.'
				}
			};
		}

		// Mode Produksi (Supabase Live)
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password: credentials.password
			});

			if (error || !data.user) {
				return {
					success: false,
					error: {
						code: error?.code || 'auth_error',
						message: error?.message || 'Gagal masuk ke akun.'
					}
				};
			}

			// Ambil atau buat profil di public.profiles
			let profile = await this.getProfileById(data.user.id);
			if (!profile) {
				const fallbackRole = (data.user.user_metadata?.role as UserRole) || 'contributor';
				const fallbackName = data.user.user_metadata?.display_name || email.split('@')[0];

				await supabase.from('profiles').upsert({
					id: data.user.id,
					display_name: fallbackName,
					role: fallbackRole
				});

				profile = {
					id: data.user.id,
					email: data.user.email || email,
					display_name: fallbackName,
					role: fallbackRole
				};
			}

			this.persistLocalSession(profile);
			return { success: true, data: profile };
		} catch (err: any) {
			return {
				success: false,
				error: {
					code: 'network_error',
					message: err?.message || 'Terjadi gangguan jaringan saat menghubungi server autentikasi.'
				}
			};
		}
	}

	/**
	 * Melakukan registrasi akun baru (khusus siswa/kontributor)
	 */
	static async signUp(payload: RegisterPayload): Promise<AuthResult<UserProfile>> {
		const email = payload.email.trim().toLowerCase();
		const role: UserRole = payload.role || 'contributor';
		const displayName = payload.displayName.trim();

		// Mode Offline / Demo Fallback
		if (!this.isLive()) {
			const newUser: UserProfile = {
				id: `offline-${Date.now()}`,
				email,
				display_name: displayName,
				role
			};
			this.persistLocalSession(newUser);
			return { success: true, data: newUser };
		}

		// Mode Produksi (Supabase Live)
		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password: payload.password,
				options: {
					data: {
						display_name: displayName,
						role
					}
				}
			});

			if (error || !data.user) {
				return {
					success: false,
					error: {
						code: error?.code || 'signup_error',
						message: error?.message || 'Gagal mendaftarkan akun baru.'
					}
				};
			}

			// Simpan ke public.profiles
			await supabase.from('profiles').upsert({
				id: data.user.id,
				display_name: displayName,
				role
			});

			const createdProfile: UserProfile = {
				id: data.user.id,
				email: data.user.email || email,
				display_name: displayName,
				role
			};

			this.persistLocalSession(createdProfile);
			return { success: true, data: createdProfile };
		} catch (err: any) {
			return {
				success: false,
				error: {
					code: 'network_error',
					message: err?.message || 'Terjadi gangguan jaringan saat mendaftarkan akun.'
				}
			};
		}
	}

	/**
	 * Keluar dari sesi akun aktif
	 */
	static async signOut(): Promise<void> {
		this.clearLocalSession();
		if (this.isLive()) {
			try {
				await supabase.auth.signOut();
			} catch (err) {
				console.warn('Gagal memanggil Supabase signOut:', err);
			}
		}
	}

	/**
	 * Memeriksa dan memulihkan sesi aktif saat ini
	 */
	static async getInitialSession(): Promise<UserProfile | null> {
		// Prioritaskan sesi lokal untuk offline responsiveness
		const localUser = this.getLocalSession();

		if (!this.isLive()) {
			return localUser;
		}

		try {
			const { data } = await supabase.auth.getSession();
			if (!data.session?.user) {
				if (localUser && localUser.id.startsWith('offline-')) {
					return localUser;
				}
				this.clearLocalSession();
				return null;
			}

			const profile = await this.getProfileById(data.session.user.id);
			if (profile) {
				this.persistLocalSession(profile);
				return profile;
			}
			return localUser;
		} catch {
			return localUser;
		}
	}

	/**
	 * Mengirim permohonan reset kata sandi via email
	 */
	static async resetPassword(email: string): Promise<AuthResult<void>> {
		if (!this.isLive()) {
			return { success: true };
		}

		try {
			const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;
			const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
				redirectTo
			});

			if (error) {
				return {
					success: false,
					error: {
						code: error.code || 'reset_error',
						message: error.message
					}
				};
			}

			return { success: true };
		} catch (err: any) {
			return {
				success: false,
				error: {
					code: 'network_error',
					message: err?.message || 'Gagal mengirim email reset kata sandi.'
				}
			};
		}
	}

	/**
	 * Langganan event perubahan status autentikasi Supabase
	 */
	static onAuthStateChange(callback: (user: UserProfile | null) => void): () => void {
		if (!this.isLive()) {
			// Dummy unsubscribe untuk offline mode
			return () => {};
		}

		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_OUT' || !session?.user) {
				this.clearLocalSession();
				callback(null);
			} else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
				const profile = await this.getProfileById(session.user.id);
				if (profile) {
					this.persistLocalSession(profile);
					callback(profile);
				}
			}
		});

		return () => subscription.unsubscribe();
	}

	// --------------------------------------------------------------------------
	// Local Storage Helpers
	// --------------------------------------------------------------------------

	private static getLocalSession(): UserProfile | null {
		if (typeof window === 'undefined') return null;
		try {
			const raw = localStorage.getItem(OFFLINE_AUTH_KEY);
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}

	private static persistLocalSession(user: UserProfile): void {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(OFFLINE_AUTH_KEY, JSON.stringify(user));
		} catch {
			// ignore storage quota errors
		}
	}

	private static clearLocalSession(): void {
		if (typeof window === 'undefined') return;
		try {
			localStorage.removeItem(OFFLINE_AUTH_KEY);
		} catch {
			// ignore
		}
	}
}
