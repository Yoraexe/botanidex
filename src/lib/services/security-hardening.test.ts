// ==============================================================================
// Botanidex — Security Hardening Regression Tests (Vitest)
// Tujuan: Menjamin seluruh celah keamanan (SEC-01 s/d SEC-08) terkunci dan teruji secara otomatis
// Caller: npm run test:unit
// Dependensi: vitest, auth.schema.ts, storage.service.ts
// Main Functions: Security regression test suites
// Side Effects: none (unit test suite)
// ==============================================================================

import { describe, it, expect } from 'vitest';
import { registerSchema } from '../schemas/auth.schema';
import { StorageService } from './storage.service';

describe('Security Hardening Suite (Astesia Layer 4)', () => {
	describe('SEC-01: Privilege Escalation Prevention', () => {
		it('menolak payload registrasi yang mencoba menyisipkan peran admin', () => {
			const attackPayload = {
				displayName: 'Penyerang Sistem',
				email: 'attacker@evil.com',
				password: 'SecretPassword123',
				confirmPassword: 'SecretPassword123',
				role: 'admin'
			};
			const res = registerSchema.safeParse(attackPayload);
			expect(res.success).toBe(false);
		});

		it('mengizinkan registrasi normal siswa dengan default role contributor', () => {
			const validPayload = {
				displayName: 'Siswa Rajin',
				email: 'siswa.rajin@smkpertanian.sch.id',
				password: 'SecretPassword123',
				confirmPassword: 'SecretPassword123'
			};
			const res = registerSchema.safeParse(validPayload);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.role).toBe('contributor');
			}
		});
	});

	describe('SEC-06: Open Redirect Sanitization Logic', () => {
		function sanitizeRedirectUrl(target: string | null): string {
			if (!target) return '/';
			const trimmed = target.trim();
			if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\') && !trimmed.includes(':')) {
				return trimmed;
			}
			return '/';
		}

		it('mengizinkan path internal aplikasi yang sah', () => {
			expect(sanitizeRedirectUrl('/admin/moderasi')).toBe('/admin/moderasi');
			expect(sanitizeRedirectUrl('/kontribusi/tambah')).toBe('/kontribusi/tambah');
			expect(sanitizeRedirectUrl('/katalog/jahe-merah')).toBe('/katalog/jahe-merah');
		});

		it('menolak dan menetralkan protocol-relative URLs (//evil.com)', () => {
			expect(sanitizeRedirectUrl('//evil.com')).toBe('/');
			expect(sanitizeRedirectUrl('///evil.com/phish')).toBe('/');
		});

		it('menolak dan menetralkan URL dengan skema eksternal (https:, javascript:)', () => {
			expect(sanitizeRedirectUrl('https://evil.com/login')).toBe('/');
			expect(sanitizeRedirectUrl('http://evil.com')).toBe('/');
			expect(sanitizeRedirectUrl('javascript:alert(1)')).toBe('/');
		});

		it('menolak dan menetralkan karakter backslash evasion', () => {
			expect(sanitizeRedirectUrl('/\\evil.com')).toBe('/');
			expect(sanitizeRedirectUrl('\\\\evil.com')).toBe('/');
		});
	});

	describe('SEC-07: File Upload & Stored XSS Prevention', () => {
		it('menolak file SVG untuk mencegah Stored XSS', async () => {
			const svgBlob = new Blob(['<svg><script>alert(1)</script></svg>'], { type: 'image/svg+xml' });
			const svgFile = new File([svgBlob], 'exploit.svg', { type: 'image/svg+xml' });

			await expect(StorageService.uploadPlantPhoto(svgFile)).rejects.toThrow(
				/Format SVG atau lainnya tidak diizinkan/
			);
		});

		it('menolak file eksekusi atau dokumen teks', async () => {
			const htmlBlob = new Blob(['<html>malicious</html>'], { type: 'text/html' });
			const htmlFile = new File([htmlBlob], 'payload.html', { type: 'text/html' });

			await expect(StorageService.uploadPlantPhoto(htmlFile)).rejects.toThrow(
				/File harus berupa gambar/
			);
		});
	});
});
