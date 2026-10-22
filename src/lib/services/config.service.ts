// ==============================================================================
// Flora SMK — App Configuration Service
// Tujuan: Business logic layer untuk pengelolaan pengaturan dinamis aplikasi
// Caller: +page.svelte, admin/pengaturan, layout components
// Dependensi: config.repository.ts, config.types.ts
// Main Functions: getConfig, updateIdentity, updateHero, manageGardenPhotos, manageCategories, resetToDefaults
// Side Effects: Persists to ConfigRepository
// ==============================================================================

import { ConfigRepository } from '../repositories/config.repository';
import type {
	AppConfig,
	SchoolIdentityConfig,
	HeroConfig,
	GardenShowcasePhoto,
	SpecimenShowcaseItem,
	CategoryItemConfig,
	AppDownloadConfig
} from '../types/config.types';

export class ConfigService {
	/**
	 * Mengambil seluruh konfigurasi aplikasi aktif
	 */
	static getConfig(): AppConfig {
		return ConfigRepository.getConfig();
	}

	/**
	 * Memperbarui Identitas dan Brand Sekolah
	 */
	static updateIdentity(data: Partial<SchoolIdentityConfig>): AppConfig {
		const current = this.getConfig();
		const updated: AppConfig = {
			...current,
			identity: {
				...current.identity,
				...data
			}
		};
		return ConfigRepository.saveConfig(updated);
	}

	/**
	 * Memperbarui Teks Headline Hero
	 */
	static updateHeroHeadline(line1: string, line2: string): AppConfig {
		const current = this.getConfig();
		const updated: AppConfig = {
			...current,
			hero: {
				...current.hero,
				headlineLine1: line1.trim(),
				headlineLine2: line2.trim()
			}
		};
		return ConfigRepository.saveConfig(updated);
	}

	/**
	 * Menambahkan foto fasilitas kebun ke kartu kiri
	 */
	static addGardenPhoto(photo: Omit<GardenShowcasePhoto, 'id'>): AppConfig {
		const current = this.getConfig();
		const newPhoto: GardenShowcasePhoto = {
			id: `garden-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
			url: photo.url.trim(),
			title: photo.title.trim(),
			badge: photo.badge.trim()
		};
		const updated: AppConfig = {
			...current,
			hero: {
				...current.hero,
				gardenPhotos: [...current.hero.gardenPhotos, newPhoto]
			}
		};
		return ConfigRepository.saveConfig(updated);
	}

	/**
	 * Memperbarui item foto kebun berdasarkan ID
	 */
	static updateGardenPhoto(id: string, patch: Partial<GardenShowcasePhoto>): AppConfig {
		const current = this.getConfig();
		const updatedPhotos = current.hero.gardenPhotos.map((p) => {
			if (p.id === id) {
				return { ...p, ...patch };
			}
			return p;
		});
		const updated: AppConfig = {
			...current,
			hero: {
				...current.hero,
				gardenPhotos: updatedPhotos
			}
		};
		return ConfigRepository.saveConfig(updated);
	}

	/**
	 * Menghapus foto kebun (menjaga minimal 1 foto tetap ada)
	 */
	static removeGardenPhoto(id: string): AppConfig {
		const current = this.getConfig();
		if (current.hero.gardenPhotos.length <= 1) {
			throw new Error('Minimal harus ada 1 foto kebun yang ditampilkan.');
		}
		const filtered = current.hero.gardenPhotos.filter((p) => p.id !== id);
		const updated: AppConfig = {
			...current,
			hero: {
				...current.hero,
				gardenPhotos: filtered
			}
		};
		return ConfigRepository.saveConfig(updated);
	}

	/**
	 * Menambahkan spesimen tanaman ke kartu kanan
	 */
	static addSpecimen(specimen: Omit<SpecimenShowcaseItem, 'id'>): AppConfig {
		const current = this.getConfig();
		const newItem: SpecimenShowcaseItem = {
			id: `specimen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
			commonName: specimen.commonName.trim(),
			latinName: specimen.latinName.trim(),
			url: specimen.url.trim()
		};
		const updated: AppConfig = {
			...current,
			hero: {
				...current.hero,
				specimens: [...current.hero.specimens, newItem]
			}
		};
		return ConfigRepository.saveConfig(updated);
	}

	/**
	 * Memperbarui spesimen tanaman berdasarkan ID
	 */
	static updateSpecimen(id: string, patch: Partial<SpecimenShowcaseItem>): AppConfig {
		const current = this.getConfig();
		const updatedSpecimens = current.hero.specimens.map((s) => {
			if (s.id === id) {
				return { ...s, ...patch };
			}
			return s;
		});
		const updated: AppConfig = {
			...current,
			hero: {
				...current.hero,
				specimens: updatedSpecimens
			}
		};
		return ConfigRepository.saveConfig(updated);
	}

	/**
	 * Menghapus spesimen tanaman (menjaga minimal 1 spesimen)
	 */
	static removeSpecimen(id: string): AppConfig {
		const current = this.getConfig();
		if (current.hero.specimens.length <= 1) {
			throw new Error('Minimal harus ada 1 spesimen tanaman yang dipamerkan.');
		}
		const filtered = current.hero.specimens.filter((s) => s.id !== id);
		const updated: AppConfig = {
			...current,
			hero: {
				...current.hero,
				specimens: filtered
			}
		};
		return ConfigRepository.saveConfig(updated);
	}

	/**
	 * Memperbarui pengaturan kartu Unduh Aplikasi
	 */
	static updateAppDownload(data: Partial<AppDownloadConfig>): AppConfig {
		const current = this.getConfig();
		const updated: AppConfig = {
			...current,
			hero: {
				...current.hero,
				appDownload: {
					...current.hero.appDownload,
					...data
				}
			}
		};
		return ConfigRepository.saveConfig(updated);
	}

	/**
	 * Mengambil daftar kategori aktif
	 */
	static getCategories(): CategoryItemConfig[] {
		return this.getConfig().categories;
	}

	/**
	 * Menambahkan kategori botani baru
	 */
	static addCategory(category: CategoryItemConfig): AppConfig {
		const current = this.getConfig();
		const exists = current.categories.some((c) => c.id.toLowerCase() === category.id.toLowerCase());
		if (exists) {
			throw new Error(`Kategori dengan ID "${category.id}" sudah ada.`);
		}
		const updated: AppConfig = {
			...current,
			categories: [...current.categories, category]
		};
		return ConfigRepository.saveConfig(updated);
	}

	/**
	 * Memperbarui kategori botani berdasarkan ID
	 */
	static updateCategory(id: string, patch: Partial<CategoryItemConfig>): AppConfig {
		const current = this.getConfig();
		const updatedCategories = current.categories.map((c) => {
			if (c.id === id) {
				return { ...c, ...patch };
			}
			return c;
		});
		const updated: AppConfig = {
			...current,
			categories: updatedCategories
		};
		return ConfigRepository.saveConfig(updated);
	}

	/**
	 * Menghapus kategori botani (proteksi: tidak boleh hapus 'semua')
	 */
	static removeCategory(id: string): AppConfig {
		if (id === 'semua') {
			throw new Error('Kategori "Semua" adalah kategori dasar sistem dan tidak dapat dihapus.');
		}
		const current = this.getConfig();
		if (current.categories.length <= 2) {
			throw new Error('Minimal harus ada 2 kategori terdaftar.');
		}
		const filtered = current.categories.filter((c) => c.id !== id);
		const updated: AppConfig = {
			...current,
			categories: filtered
		};
		return ConfigRepository.saveConfig(updated);
	}

	/**
	 * Reset seluruh konfigurasi ke nilai bawaan pabrik
	 */
	static resetToDefaults(): AppConfig {
		return ConfigRepository.resetConfig();
	}
}
