// ==============================================================================
// Botanidex — App Configuration Types (TypeScript)
// Tujuan: Mendefinisikan tipe data kontrak untuk CMS Pengaturan Dinamis Aplikasi
// Caller: config.schema.ts, config.service.ts, +page.svelte, admin/pengaturan
// Dependensi: none
// Main Functions: SchoolIdentityConfig, GardenShowcasePhoto, SpecimenShowcaseItem, CategoryItemConfig, AppDownloadConfig, HeroConfig, AppConfig
// Side Effects: none (type-only definition)
// ==============================================================================

export interface SchoolIdentityConfig { appName: string; schoolName: string; tagline: string; headerBadge: string; }
export interface GardenShowcasePhoto { id: string; url: string; title: string; badge: string; }
export interface SpecimenShowcaseItem { id: string; commonName: string; latinName: string; url: string; }
export interface CategoryItemConfig { id: string; label: string; dotColor: string; activeColor?: string; }
export interface AppDownloadConfig { title: string; description: string; showIosBadge: boolean; showAndroidBadge: boolean; buttonLabel: string; }
export interface HeroConfig { headlineLine1: string; headlineLine2: string; gardenPhotos: GardenShowcasePhoto[]; specimens: SpecimenShowcaseItem[]; appDownload: AppDownloadConfig; }
export interface AppConfig { version: number; updatedAt: string; identity: SchoolIdentityConfig; hero: HeroConfig; categories: CategoryItemConfig[]; }
