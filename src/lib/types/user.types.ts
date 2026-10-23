// ==============================================================================
// Botanidex — User & Auth Domain Types
// Tujuan: Mendefinisikan tipe profil pengguna dan role otorisasi
// Caller: Auth store and UI components
// Dependensi: none
// Main Functions: UserRole, UserProfile
// Side Effects: none (type-only definition)
// ==============================================================================

export type UserRole = 'viewer' | 'contributor' | 'admin';

export interface UserProfile {
	id: string;
	email: string;
	display_name: string;
	role: UserRole;
}
