// ==============================================================================
// Botanidex — App Configuration Repository
// Tujuan: Data access layer untuk persistensi konfigurasi dinamis aplikasi (SSR & LocalStorage) dengan deep-clone immutability
// Caller: src/lib/services/config.service.ts
// Dependensi: default-config.ts, config.types.ts, config.schema.ts
// Main Functions: getConfig, saveConfig, resetConfig
// Side Effects: Read/write ke browser localStorage dan dispatch event flora:config-updated
// ==============================================================================

import { DEFAULT_APP_CONFIG } from '../data/default-config';
import { appConfigSchema } from '../schemas/config.schema';
import type { AppConfig } from '../types/config.types';

const CONFIG_STORAGE_KEY = 'botanidex_app_config_v1';

let memoryConfig: AppConfig = structuredClone(DEFAULT_APP_CONFIG);

export class ConfigRepository {
	static getConfig(): AppConfig {
		if (typeof window === 'undefined') {
			return structuredClone(memoryConfig);
		}

		try {
			const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
			if (raw) {
				const validation = appConfigSchema.safeParse(JSON.parse(raw));
				if (validation.success) {
					memoryConfig = validation.data;
					return structuredClone(memoryConfig);
				}
				console.warn('Validasi konfigurasi tersimpan gagal, memuat default:', validation.error);
			}
			localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_APP_CONFIG));
		} catch (err) {
			console.warn('Gagal membaca localStorage konfigurasi:', err);
		}

		memoryConfig = structuredClone(DEFAULT_APP_CONFIG);
		return structuredClone(memoryConfig);
	}

	static saveConfig(newConfig: AppConfig): AppConfig {
		const validation = appConfigSchema.safeParse(newConfig);
		if (!validation.success) {
			throw new Error(`Konfigurasi tidak valid: ${validation.error.issues.map((i) => i.message).join(', ')}`);
		}

		const updatedConfig: AppConfig = {
			...validation.data,
			updatedAt: new Date().toISOString()
		};

		memoryConfig = structuredClone(updatedConfig);

		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updatedConfig));
				window.dispatchEvent(new CustomEvent('flora:config-updated', { detail: structuredClone(updatedConfig) }));
			} catch (err) {
				console.warn('Gagal menyimpan konfigurasi ke localStorage:', err);
			}
		}

		return structuredClone(updatedConfig);
	}

	static resetConfig(): AppConfig {
		const reset: AppConfig = {
			...structuredClone(DEFAULT_APP_CONFIG),
			updatedAt: new Date().toISOString()
		};
		memoryConfig = structuredClone(reset);

		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(reset));
				window.dispatchEvent(new CustomEvent('flora:config-updated', { detail: structuredClone(reset) }));
			} catch (err) {
				console.warn('Gagal reset konfigurasi di localStorage:', err);
			}
		}

		return structuredClone(reset);
	}
}
