// ==============================================================================
// Flora SMK — Authentication Store
// Tujuan: Reaktif global store untuk status autentikasi dan peran (viewer, contributor, admin)
// Caller: Navbar, Route guards, Form submission
// Dependensi: svelte/store, src/lib/types/user.types.ts
// Main Functions: authStore, login, logout, switchDemoRole
// Side Effects: LocalStorage session sync
// ==============================================================================

import { writable } from 'svelte/store';
import type { UserProfile, UserRole } from '../types/user.types';

const AUTH_STORAGE_KEY = 'flora_smk_auth_user_v1';

export const DEMO_USERS: Record<UserRole, UserProfile> = {
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
	},
	viewer: {
		id: 'v0000000-0000-0000-0000-000000000003',
		email: 'tamu@sekolah.id',
		display_name: 'Pengunjung Umum',
		role: 'viewer'
	}
};

function getInitialUser(): UserProfile | null {
	if (typeof window === 'undefined') return null;
	try {
		const saved = localStorage.getItem(AUTH_STORAGE_KEY);
		if (saved) {
			return JSON.parse(saved);
		}
	} catch {
		// fallback null
	}
	return null;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<UserProfile | null>(getInitialUser());

	return {
		subscribe,
		setUser: (user: UserProfile | null) => {
			set(user);
			if (typeof window !== 'undefined') {
				if (user) {
					localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
				} else {
					localStorage.removeItem(AUTH_STORAGE_KEY);
				}
			}
		},
		loginAsDemo: (role: UserRole) => {
			const user = DEMO_USERS[role];
			set(user);
			if (typeof window !== 'undefined') {
				localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
			}
			return user;
		},
		logout: () => {
			set(null);
			if (typeof window !== 'undefined') {
				localStorage.removeItem(AUTH_STORAGE_KEY);
			}
		}
	};
}

export const authUser = createAuthStore();
