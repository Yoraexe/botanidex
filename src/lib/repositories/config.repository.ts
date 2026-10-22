// ==============================================================================
// Flora SMK — App Configuration Repository
// Tujuan: Data access layer untuk persistensi konfigurasi dinamis aplikasi (SSR & LocalStorage)
// Caller: src/lib/services/config.service.ts
// Dependensi: default-config.ts, config.types.ts, config.schema.ts
// Main Functions: getConfig, saveConfig, resetConfig
// Side Effects: Read/write ke browser localStorage
// ==============================================================================

import { DEFAULT_APP_CONFIG } from '../data/default-config';
import { appConfigSchema } from '../schemas/config.schema';
import type { AppConfig } from '../types/config.types';

const CONFIG_STORAGE_KEY = 'flora_smk_app_config_v2';

// In-memory cache for SSR & client synchronization
let memoryConfig: AppConfig = { ...DEFAULT_APP_CONFIG };

export class ConfigRepository {
	/**
	 * Mengambil konfigurasi aplikasi saat ini (dengan validasi schema & fallback bawaan)
	 */
	static getConfig(): AppConfig {
		if (typeof window === 'undefined') {
			return memoryConfig;
		}

		try {
			const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				const validation = appConfigSchema.safeParse(parsed);
				if (validation.success) {
					memoryConfig = validation.data;
					return memoryConfig;
				} else {
					console.warn('Validasi konfigurasi tersimpan gagal, memuat default:', validation.error);
				}
			}
			// Inisialisasi awal ke localStorage jika belum ada
			localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_APP_CONFIG));
		} catch (err) {
			console.warn('Gagal membaca localStorage konfigurasi:', err);
		}

		memoryConfig = { ...DEFAULT_APP_CONFIG };
		return memoryConfig;
	}

	/**
	 * Menyimpan pembaruan konfigurasi aplikasi
	 */
	static saveConfig(newConfig: AppConfig): AppConfig {
		const validation = appConfigSchema.safeParse(newConfig);
		if (!validation.success) {
			throw new Error(`Konfigurasi tidak valid: ${validation.error.issues.map((i) => i.message).join(', ')}`);
		}

		const updatedConfig: AppConfig = {
			...validation.data,
			updatedAt: new Date().toISOString()
		};

		memoryConfig = updatedConfig;

		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updatedConfig));
				// Dispatch custom event for real-time reactivity across components/tabs
				window.dispatchEvent(new CustomEvent('flora:config-updated', { detail: updatedConfig }));
			} catch (err) {
				console.warn('Gagal menyimpan konfigurasi ke localStorage:', err);
			}
		}

		return updatedConfig;
	}

	/**
	 * Mengembalikan seluruh pengaturan ke preset pabrik bawaan
	 */
	static resetConfig(): AppConfig {
		const reset = {
			...DEFAULT_APP_CONFIG,
			updatedAt: new Date().toISOString()
		};
		memoryConfig = reset;

		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(reset));
				window.dispatchEvent(new CustomEvent('flora:config-updated', { detail: reset }));
			} catch (err) {
				console.warn('Gagal reset konfigurasi di localStorage:', err);
			}
		}

		return reset;
	}
}
