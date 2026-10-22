// ==============================================================================
// Botanidex — User & Auth Domain Types
// Tujuan: Mendefinisikan tipe profil pengguna, role otorisasi, dan sesi
// Caller: Auth services, repositories, middleware hooks, and stores
// Dependensi: none
// Main Functions: UserRole, UserProfile, AuthSession
// Side Effects: none (type-only definition)
// ==============================================================================

export type UserRole = 'viewer' | 'contributor' | 'admin';

export interface UserProfile {
	id: string;
	email: string;
	display_name: string;
	role: UserRole;
	avatar_url?: string;
	created_at?: string;
}

export interface AuthState {
	user: UserProfile | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}
