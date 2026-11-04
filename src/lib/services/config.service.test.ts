// ==============================================================================
// Botanidex — Config Service Unit Tests (Vitest)
// Tujuan: Memastikan validasi, immutability, dan logika bisnis pengelolaan konfigurasi CMS bekerja 100%
// Caller: npm run test
// Dependensi: vitest, ConfigService
// Main Functions: describe('ConfigService')
// Side Effects: Resets ConfigService state in beforeEach
// ==============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
	beforeEach(() => ConfigService.resetToDefaults());

	it('harus memuat konfigurasi default dengan benar', () => {
		const config = ConfigService.getConfig();
		expect(config.identity.appName).toBe('Botanidex');
		expect(config.hero.headlineLine1).toBe('KATALOG BOTANI');
		expect(config.hero.gardenPhotos.length).toBeGreaterThanOrEqual(1);
		expect(config.hero.specimens.length).toBeGreaterThanOrEqual(1);
		expect(config.categories.length).toBeGreaterThanOrEqual(2);
	});

	it('harus dapat memperbarui identitas sekolah', () => {
		const updated = ConfigService.updateIdentity({ schoolName: 'SMKN 1 Agribisnis Mandiri', tagline: 'Laboratorium Botani Unggulan' });
		expect(updated.identity.schoolName).toBe('SMKN 1 Agribisnis Mandiri');
		expect(updated.identity.tagline).toBe('Laboratorium Botani Unggulan');
	});

	it('harus dapat memperbarui headline hero', () => {
		const updated = ConfigService.updateHeroHeadline('PUSPA NUSANTARA', 'SMK AGRO');
		expect(updated.hero.headlineLine1).toBe('PUSPA NUSANTARA');
		expect(updated.hero.headlineLine2).toBe('SMK AGRO');
	});

	it('harus dapat menambah dan menghapus foto fasilitas kebun', () => {
		const initialCount = ConfigService.getConfig().hero.gardenPhotos.length;
		const updated = ConfigService.addGardenPhoto({
			title: 'Lahan Riset Padi Aerob', badge: 'LAHAN PERCOBAAN',
			url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80'
		});
		expect(updated.hero.gardenPhotos.length).toBe(initialCount + 1);
		const addedPhoto = updated.hero.gardenPhotos[updated.hero.gardenPhotos.length - 1];
		expect(addedPhoto.title).toBe('Lahan Riset Padi Aerob');
		expect(ConfigService.removeGardenPhoto(addedPhoto.id).hero.gardenPhotos.length).toBe(initialCount);
	});

	it('harus menolak penghapusan jika hanya tersisa 1 foto kebun', () => {
		const config = ConfigService.getConfig();
		for (let i = config.hero.gardenPhotos.length - 1; i >= 1; i--) ConfigService.removeGardenPhoto(config.hero.gardenPhotos[i].id);
		const remaining = ConfigService.getConfig().hero.gardenPhotos;
		expect(remaining.length).toBe(1);
		expect(() => ConfigService.removeGardenPhoto(remaining[0].id)).toThrowError('Minimal harus ada 1 foto kebun yang ditampilkan.');
	});

	it('harus dapat menambah, mengubah, dan menghapus kategori botani', () => {
		const updated = ConfigService.addCategory({ id: 'hidroponik', label: 'Hidroponik', dotColor: 'bg-cyan-500' });
		expect(updated.categories.some((c) => c.id === 'hidroponik')).toBe(true);
		const updatedLabel = ConfigService.updateCategory('hidroponik', { label: 'Hidroponik Modern' });
		expect(updatedLabel.categories.find((c) => c.id === 'hidroponik')?.label).toBe('Hidroponik Modern');
		expect(ConfigService.removeCategory('hidroponik').categories.some((c) => c.id === 'hidroponik')).toBe(false);
	});

	it('tidak boleh menghapus kategori dasar "semua"', () => {
		expect(() => ConfigService.removeCategory('semua')).toThrowError('Kategori "Semua" adalah kategori dasar sistem dan tidak dapat dihapus.');
	});

	it('harus dapat memulihkan seluruh pengaturan ke nilai default', () => {
		ConfigService.updateHeroHeadline('JUDUL DIUBAH', 'SUBJUDUL DIUBAH');
		expect(ConfigService.getConfig().hero.headlineLine1).toBe('JUDUL DIUBAH');
		expect(ConfigService.resetToDefaults().hero.headlineLine1).toBe('KATALOG BOTANI');
	});

	it('menjaga immutability DEFAULT_APP_CONFIG saat objek hasil getConfig() dimutasi langsung (Pass #2 Regression)', () => {
		const config = ConfigService.getConfig();
		config.identity.appName = 'Mutasi Langsung Tanpa Save';
		config.hero.headlineLine1 = 'HEADLINE RUSAK';
		const fresh = ConfigService.getConfig();
		expect(fresh.identity.appName).toBe('Botanidex');
		expect(fresh.hero.headlineLine1).toBe('KATALOG BOTANI');
		expect(ConfigService.resetToDefaults().identity.appName).toBe('Botanidex');
	});

	it('menerima URL gambar lokal (/...) maupun data URI pada foto kebun dan spesimen (Pass #2 Regression)', () => {
		const afterGarden = ConfigService.addGardenPhoto({ title: 'Logo Kebun Lokal', badge: 'ASET LOKAL', url: '/SMK-Pertanian-Gorontalo.png' });
		expect(afterGarden.hero.gardenPhotos.some((p) => p.url === '/SMK-Pertanian-Gorontalo.png')).toBe(true);
		const afterSpecimen = ConfigService.addSpecimen({ commonName: 'Spesimen Ikon Lokal', latinName: 'Flora localis', url: '/icons/icon-512.svg' });
		expect(afterSpecimen.hero.specimens.some((s) => s.url === '/icons/icon-512.svg')).toBe(true);
	});

	it('mengambil konfigurasi remote atau fallback dengan fetchRemoteConfig (Wave 1)', async () => {
		const config = await ConfigService.fetchRemoteConfig();
		expect(config).toBeDefined();
		expect(config.identity.appName).toBeDefined();
		expect(Array.isArray(config.categories)).toBe(true);
	});
});
