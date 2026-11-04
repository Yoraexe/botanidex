// ==============================================================================
// Botanidex — App Configuration Repository
// Tujuan: Data access layer untuk persistensi konfigurasi dinamis aplikasi (Supabase PostgreSQL, SSR & LocalStorage) dengan deep-clone immutability
// Caller: src/lib/services/config.service.ts
// Dependensi: default-config.ts, config.types.ts, config.schema.ts, src/lib/supabase.ts
// Main Functions: getConfig, fetchRemoteConfig, saveConfig, resetConfig
// Side Effects: Read/write ke Supabase app_config, browser localStorage, dan dispatch event flora:config-updated
// ==============================================================================

import { DEFAULT_APP_CONFIG } from '../data/default-config';
import { appConfigSchema } from '../schemas/config.schema';
import { supabase, isSupabaseConfigured } from '../supabase';
import type { AppConfig } from '../types/config.types';

const CONFIG_STORAGE_KEY = 'botanidex_app_config_v1';
const CONFIG_DOC_ID = 'default_config';
let memoryConfig: AppConfig = structuredClone(DEFAULT_APP_CONFIG);

export class ConfigRepository {
	static getConfig(): AppConfig {
		if (typeof window === 'undefined') return structuredClone(memoryConfig);
		try {
			const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
			if (raw) {
				const validation = appConfigSchema.safeParse(JSON.parse(raw));
				if (validation.success) return structuredClone((memoryConfig = validation.data));
				console.warn('Validasi konfigurasi tersimpan gagal, memuat default:', validation.error);
			}
			localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_APP_CONFIG));
		} catch (err) {
			console.warn('Gagal membaca localStorage konfigurasi:', err);
		}
		return structuredClone((memoryConfig = structuredClone(DEFAULT_APP_CONFIG)));
	}

	static async fetchRemoteConfig(): Promise<AppConfig> {
		if (isSupabaseConfigured()) {
			try {
				const { data, error } = await supabase
					.from('app_config')
					.select('data')
					.eq('id', CONFIG_DOC_ID)
					.maybeSingle();

				if (!error && data?.data) {
					const validation = appConfigSchema.safeParse(data.data);
					if (validation.success) {
						const remoteConfig = validation.data;
						memoryConfig = structuredClone(remoteConfig);
						if (typeof window !== 'undefined') {
							try {
								localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(remoteConfig));
								window.dispatchEvent(new CustomEvent('flora:config-updated', { detail: structuredClone(remoteConfig) }));
							} catch (e) {
								console.warn('Gagal cache remote config ke localStorage:', e);
							}
						}
						return structuredClone(remoteConfig);
					}
				}
			} catch (err) {
				console.warn('Gagal mengambil remote app_config dari Supabase:', err);
			}
		}
		return this.getConfig();
	}

	static saveConfig(newConfig: AppConfig): AppConfig {
		const validation = appConfigSchema.safeParse(newConfig);
		if (!validation.success) {
			throw new Error(`Konfigurasi tidak valid: ${validation.error.issues.map((i) => i.message).join(', ')}`);
		}
		const updated: AppConfig = { ...validation.data, updatedAt: new Date().toISOString() };
		memoryConfig = structuredClone(updated);

		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
				window.dispatchEvent(new CustomEvent('flora:config-updated', { detail: structuredClone(updated) }));
			} catch (err) {
				console.warn('Gagal menyimpan konfigurasi ke localStorage:', err);
			}
		}

		if (isSupabaseConfigured()) {
			supabase
				.from('app_config')
				.upsert({ id: CONFIG_DOC_ID, data: updated, updated_at: updated.updatedAt })
				.then(({ error }) => {
					if (error) console.warn('Gagal sinkronisasi app_config ke Supabase:', error.message);
				})
				.catch((err) => console.warn('Supabase app_config upsert exception:', err));
		}

		return structuredClone(updated);
	}

	static resetConfig(): AppConfig {
		return this.saveConfig(structuredClone(DEFAULT_APP_CONFIG));
	}
}
