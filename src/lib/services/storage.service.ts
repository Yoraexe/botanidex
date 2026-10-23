// ==============================================================================
// Botanidex — Storage Service
// Tujuan: Menangani validasi, kompresi, dan upload foto/video tanaman ke Supabase Storage dengan fallback
// Caller: Form kontribusi tanaman (src/routes/kontribusi/tambah/+page.svelte)
// Dependensi: src/lib/supabase.ts, src/lib/utils/image-compress.ts
// Main Functions: uploadPlantPhoto, validateVideoFile, uploadPlantVideo
// Side Effects: Storage upload, pembacaan metadata durasi video, atau konversi ke local URL
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import { compressImageFile } from '../utils/image-compress';

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB (BRD F2 & F5)
const MAX_VIDEO_DURATION_SECONDS = 300; // 5 menit (BRD F2 & F5)

export class StorageService {
	/**
	 * Mengompresi dan mengunggah foto tanaman
	 */
	static async uploadPlantPhoto(file: File): Promise<string> {
		if (!file.type.startsWith('image/')) {
			throw new Error('File harus berupa gambar (JPG, PNG, WebP)');
		}

		// Kompresi client-side terlebih dahulu (max 2MB target client-side)
		const compressed = await compressImageFile(file, { maxWidth: 1600, quality: 0.82 });

		if (isSupabaseConfigured()) {
			try {
				const ext = file.name.split('.').pop() || 'jpg';
				const fileName = `photos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

				const { error } = await supabase.storage
					.from('plant-media')
					.upload(fileName, compressed, {
						cacheControl: '3600',
						upsert: false
					});

				if (!error) {
					const { data: urlData } = supabase.storage
						.from('plant-media')
						.getPublicUrl(fileName);
					return urlData.publicUrl;
				}
				console.warn('Gagal upload ke Supabase bucket, fallback lokal:', error.message);
			} catch (err) {
				console.warn('Supabase storage exception, fallback lokal:', err);
			}
		}

		// Fallback preview data URL untuk offline/demo
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
			reader.readAsDataURL(compressed);
		});
	}

	/**
	 * Memvalidasi format (MP4/WebM), ukuran (maks 50MB), dan durasi video (maks 5 menit / 300 detik)
	 */
	static async validateVideoFile(file: File): Promise<{ durationSeconds: number }> {
		if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
			throw new Error('Format video tidak didukung. Gunakan format MP4 atau WebM.');
		}

		if (file.size > MAX_VIDEO_BYTES) {
			throw new Error('Ukuran video melebihi batas maksimal 50MB.');
		}

		if (typeof document === 'undefined') {
			return { durationSeconds: 0 };
		}

		return new Promise((resolve, reject) => {
			const videoEl = document.createElement('video');
			videoEl.preload = 'metadata';
			const objectUrl = URL.createObjectURL(file);

			const cleanup = () => {
				URL.revokeObjectURL(objectUrl);
				videoEl.removeAttribute('src');
				videoEl.load();
			};

			videoEl.onloadedmetadata = () => {
				const duration = Math.round(videoEl.duration || 0);
				cleanup();
				if (duration > MAX_VIDEO_DURATION_SECONDS) {
					reject(
						new Error(
							`Durasi video (${Math.floor(duration / 60)}m ${duration % 60}d) melebihi batas maksimal 5 menit.`
						)
					);
					return;
				}
				resolve({ durationSeconds: duration });
			};

			videoEl.onerror = () => {
				cleanup();
				reject(new Error('File video rusak atau tidak dapat diputar oleh browser.'));
			};

			videoEl.src = objectUrl;
		});
	}

	/**
	 * Mengunggah video penjelasan siswa (maksimal 50MB, maks 5 menit, MP4/WebM)
	 */
	static async uploadPlantVideo(file: File): Promise<string> {
		if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
			throw new Error('Format video tidak didukung. Gunakan format MP4 atau WebM.');
		}

		if (file.size > MAX_VIDEO_BYTES) {
			throw new Error('Ukuran video melebihi batas 50MB');
		}

		if (isSupabaseConfigured()) {
			try {
				const ext = file.name.split('.').pop() || 'mp4';
				const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

				const { error } = await supabase.storage.from('plant-media').upload(fileName, file, {
					contentType: file.type,
					upsert: false
				});

				if (!error) {
					const { data: urlData } = supabase.storage
						.from('plant-media')
						.getPublicUrl(fileName);
					return urlData.publicUrl;
				}
				console.warn('Gagal upload video ke Supabase storage:', error.message);
			} catch (err) {
				console.warn('Supabase video upload exception:', err);
			}
		}

		// Untuk file video kecil (< 3.5MB) pada mode offline/demo, simpan sebagai Data URL agar tahan lintas tab/reload;
		// jika lebih besar, gunakan Object URL sesi aktif agar tidak melebihi kuota localStorage.
		if (file.size <= 3.5 * 1024 * 1024 && typeof FileReader !== 'undefined') {
			return new Promise((resolve) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result as string);
				reader.onerror = () => resolve(URL.createObjectURL(file));
				reader.readAsDataURL(file);
			});
		}

		return URL.createObjectURL(file);
	}
}
