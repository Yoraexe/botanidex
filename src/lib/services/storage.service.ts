// ==============================================================================
// Botanidex — Storage Service
// Tujuan: Menangani upload foto dan video tanaman ke Supabase Storage dengan fallback
// Caller: Form kontribusi tanaman, editor admin
// Dependensi: src/lib/supabase.ts, src/lib/utils/image-compress.ts
// Main Functions: uploadPlantPhoto, uploadPlantVideo
// Side Effects: Storage upload atau konversi ke local data URL
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import { compressImageFile } from '../utils/image-compress';

export class StorageService {
	/**
	 * Mengompresi dan mengunggah foto tanaman
	 */
	static async uploadPlantPhoto(file: File): Promise<string> {
		// Validasi ukuran & tipe
		if (!file.type.startsWith('image/')) {
			throw new Error('File harus berupa gambar (JPG, PNG, WebP)');
		}

		// Kompresi client-side terlebih dahulu
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
					const { data: urlData } = supabase.storage.from('plant-media').getPublicUrl(fileName);
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
	 * Mengunggah video penjelasan siswa (maksimal 50MB, MP4/WebM)
	 */
	static async uploadPlantVideo(file: File): Promise<string> {
		if (!file.type.startsWith('video/')) {
			throw new Error('File harus berupa video (MP4 atau WebM)');
		}

		const maxBytes = 50 * 1024 * 1024; // 50MB
		if (file.size > maxBytes) {
			throw new Error('Ukuran video melebihi batas 50MB');
		}

		if (isSupabaseConfigured()) {
			try {
				const ext = file.name.split('.').pop() || 'mp4';
				const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

				const { error } = await supabase.storage
					.from('plant-media')
					.upload(fileName, file, {
						contentType: file.type,
						upsert: false
					});

				if (!error) {
					const { data: urlData } = supabase.storage.from('plant-media').getPublicUrl(fileName);
					return urlData.publicUrl;
				}
				console.warn('Gagal upload video ke Supabase storage:', error.message);
			} catch (err) {
				console.warn('Supabase video upload exception:', err);
			}
		}

		// Fallback blob URL untuk playback lokal pada sesi aktif
		return URL.createObjectURL(file);
	}
}
