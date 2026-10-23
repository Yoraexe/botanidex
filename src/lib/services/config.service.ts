// ==============================================================================
// Botanidex — App Configuration Service
// Tujuan: Business logic layer untuk pengelolaan pengaturan dinamis aplikasi
// Caller: +page.svelte, admin/pengaturan, layout components
// Dependensi: config.repository.ts, config.types.ts
// Main Functions: getConfig, updateIdentity, updateHeroHeadline, addGardenPhoto, removeGardenPhoto, addSpecimen, removeSpecimen, updateAppDownload, getCategories, addCategory, updateCategory, removeCategory, resetToDefaults
// Side Effects: Persists to ConfigRepository
// ==============================================================================

import { ConfigRepository } from '../repositories/config.repository';
import type { AppConfig, SchoolIdentityConfig, GardenShowcasePhoto, SpecimenShowcaseItem, CategoryItemConfig, AppDownloadConfig } from '../types/config.types';

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export class ConfigService {
	private static patch(mutator: (current: AppConfig) => AppConfig): AppConfig {
		return ConfigRepository.saveConfig(mutator(this.getConfig()));
	}

	static getConfig(): AppConfig { return ConfigRepository.getConfig(); }
	static getCategories(): CategoryItemConfig[] { return this.getConfig().categories; }
	static resetToDefaults(): AppConfig { return ConfigRepository.resetConfig(); }

	static updateIdentity(data: Partial<SchoolIdentityConfig>): AppConfig {
		return this.patch((c) => ({ ...c, identity: { ...c.identity, ...data } }));
	}

	static updateHeroHeadline(line1: string, line2: string): AppConfig {
		return this.patch((c) => ({ ...c, hero: { ...c.hero, headlineLine1: line1.trim(), headlineLine2: line2.trim() } }));
	}

	static addGardenPhoto(photo: Omit<GardenShowcasePhoto, 'id'>): AppConfig {
		const item: GardenShowcasePhoto = { id: uid('garden'), url: photo.url.trim(), title: photo.title.trim(), badge: photo.badge.trim() };
		return this.patch((c) => ({ ...c, hero: { ...c.hero, gardenPhotos: [...c.hero.gardenPhotos, item] } }));
	}

	static removeGardenPhoto(id: string): AppConfig {
		return this.patch((c) => {
			if (c.hero.gardenPhotos.length <= 1) throw new Error('Minimal harus ada 1 foto kebun yang ditampilkan.');
			return { ...c, hero: { ...c.hero, gardenPhotos: c.hero.gardenPhotos.filter((p) => p.id !== id) } };
		});
	}

	static addSpecimen(specimen: Omit<SpecimenShowcaseItem, 'id'>): AppConfig {
		const item: SpecimenShowcaseItem = { id: uid('specimen'), commonName: specimen.commonName.trim(), latinName: specimen.latinName.trim(), url: specimen.url.trim() };
		return this.patch((c) => ({ ...c, hero: { ...c.hero, specimens: [...c.hero.specimens, item] } }));
	}

	static removeSpecimen(id: string): AppConfig {
		return this.patch((c) => {
			if (c.hero.specimens.length <= 1) throw new Error('Minimal harus ada 1 spesimen tanaman yang dipamerkan.');
			return { ...c, hero: { ...c.hero, specimens: c.hero.specimens.filter((s) => s.id !== id) } };
		});
	}

	static updateAppDownload(data: Partial<AppDownloadConfig>): AppConfig {
		return this.patch((c) => ({ ...c, hero: { ...c.hero, appDownload: { ...c.hero.appDownload, ...data } } }));
	}

	static addCategory(category: CategoryItemConfig): AppConfig {
		return this.patch((c) => {
			if (c.categories.some((item) => item.id.toLowerCase() === category.id.toLowerCase())) {
				throw new Error(`Kategori dengan ID "${category.id}" sudah ada.`);
			}
			return { ...c, categories: [...c.categories, category] };
		});
	}

	static updateCategory(id: string, patch: Partial<CategoryItemConfig>): AppConfig {
		return this.patch((c) => ({ ...c, categories: c.categories.map((cat) => (cat.id === id ? { ...cat, ...patch } : cat)) }));
	}

	static removeCategory(id: string): AppConfig {
		if (id === 'semua') throw new Error('Kategori "Semua" adalah kategori dasar sistem dan tidak dapat dihapus.');
		return this.patch((c) => {
			if (c.categories.length <= 2) throw new Error('Minimal harus ada 2 kategori terdaftar.');
			return { ...c, categories: c.categories.filter((cat) => cat.id !== id) };
		});
	}
}
