// ==============================================================================
// Botanidex — Authentication Domain Types
// Tujuan: Definisi kontrak tipe data autentikasi, payload form, kredensial, dan response
// Caller: auth.schema.ts, auth.repository.ts, auth.service.ts, auth.store.ts, /login, /register
// Dependensi: src/lib/types/user.types.ts
// Main Functions: AuthCredentials, RegisterPayload, AuthResult, AuthError
// Side Effects: none (type-only definition)
// ==============================================================================

import type { UserProfile, UserRole } from './user.types';

export interface AuthCredentials {
	email: string;
	password: string;
}

export interface RegisterPayload {
	email: string;
	password: string;
	confirmPassword?: string;
	displayName: string;
	role?: UserRole;
}

export interface AuthError {
	code: string;
	message: string;
	field?: 'email' | 'password' | 'confirmPassword' | 'displayName';
}

export interface AuthResult<T = UserProfile> {
	success: boolean;
	data?: T;
	error?: AuthError;
}

export interface AuthSessionData {
	user: UserProfile;
	accessToken?: string;
	refreshToken?: string;
	expiresAt?: number;
	isOfflineDemo?: boolean;
}
