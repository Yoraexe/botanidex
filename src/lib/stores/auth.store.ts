// ==============================================================================
// Botanidex — Reactive Authentication Store
// Tujuan: Reactive store Svelte untuk status autentikasi, sinkronisasi Supabase Auth, dan session hydration
// Caller: Navbar, BottomNav, Route guards, /login, /register, +layout.svelte
// Dependensi: svelte/store, auth.service.ts, auth.repository.ts, user.types.ts, auth.types.ts
// Main Functions: authUser, authLoading, isSupabaseOnline, DEMO_USERS
// Side Effects: LocalStorage sync, window storage event listener, Supabase Auth onAuthStateChange subscription
// ==============================================================================

import { writable, derived } from 'svelte/store';
import { AuthService } from '../services/auth.service';
import { AuthRepository, DEMO_USERS } from '../repositories/auth.repository';
import type { UserProfile, UserRole } from '../types/user.types';
import type { AuthResult, AuthCredentials, RegisterPayload } from '../types/auth.types';

export { DEMO_USERS };

const AUTH_STORAGE_KEY = 'flora_smk_auth_user_v1';

function getInitialUser(): UserProfile | null {
	if (typeof window === 'undefined') return null;
	try {
		const saved = localStorage.getItem(AUTH_STORAGE_KEY);
		return saved ? JSON.parse(saved) : null;
	} catch {
		return null;
	}
}

const userWritable = writable<UserProfile | null>(getInitialUser());
export const authLoading = writable<boolean>(false);
export const isSupabaseOnline = writable<boolean>(AuthRepository.isLive());

let isInitialized = false;

function initAuthSession() {
	if (typeof window === 'undefined' || isInitialized) return;
	isInitialized = true;

	authLoading.set(true);

	// Sinkronisasi status Supabase
	isSupabaseOnline.set(AuthRepository.isLive());

	// Hydrate initial session
	AuthRepository.getInitialSession()
		.then((sessionUser) => {
			if (sessionUser) {
				userWritable.set(sessionUser);
			}
		})
		.finally(() => {
			authLoading.set(false);
		});

	// Dengarkan event Supabase onAuthStateChange
	AuthRepository.onAuthStateChange((newUser) => {
		userWritable.set(newUser);
	});

	// Dengarkan cross-tab storage changes
	window.addEventListener('storage', (e) => {
		if (e.key === AUTH_STORAGE_KEY) {
			try {
				const user = e.newValue ? JSON.parse(e.newValue) : null;
				userWritable.set(user);
			} catch {
				// ignore
			}
		}
	});
}

// Inisialisasi otomatis di browser client
if (typeof window !== 'undefined') {
	initAuthSession();
}

function createAuthStore() {
	const { subscribe, set } = userWritable;

	const persist = (user: UserProfile | null) => {
		set(user);
		if (typeof window !== 'undefined') {
			try {
				user
					? localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
					: localStorage.removeItem(AUTH_STORAGE_KEY);
			} catch {
				// ignore quota
			}
		}
	};

	return {
		subscribe,
		setUser: persist,

		/**
		 * Login standar production dengan kredensial
		 */
		login: async (credentials: AuthCredentials): Promise<AuthResult<UserProfile>> => {
			authLoading.set(true);
			try {
				const res = await AuthService.login(credentials);
				if (res.success && res.data) {
					persist(res.data);
				}
				return res;
			} finally {
				authLoading.set(false);
			}
		},

		/**
		 * Registrasi akun siswa baru
		 */
		register: async (payload: RegisterPayload): Promise<AuthResult<UserProfile>> => {
			authLoading.set(true);
			try {
				const res = await AuthService.register(payload);
				if (res.success && res.data) {
					persist(res.data);
				}
				return res;
			} finally {
				authLoading.set(false);
			}
		},

		/**
		 * Reset password
		 */
		resetPassword: async (email: string): Promise<AuthResult<void>> => {
			return AuthService.resetPassword({ email });
		},

		/**
		 * Login cepat role demo
		 */
		loginAsDemo: (role: 'admin' | 'contributor'): UserProfile => {
			const user = AuthService.loginAsDemo(role);
			persist(user);
			return user;
		},

		/**
		 * Logout dari akun
		 */
		logout: async (): Promise<void> => {
			authLoading.set(true);
			try {
				await AuthService.logout();
				persist(null);
			} finally {
				authLoading.set(false);
			}
		}
	};
}

export const authUser = createAuthStore();

// Derived helpers
export const isAuthenticated = derived(authUser, ($u) => Boolean($u));
export const isAdminUser = derived(authUser, ($u) => $u?.role === 'admin');
export const isContributorUser = derived(authUser, ($u) => $u?.role === 'admin' || $u?.role === 'contributor');
