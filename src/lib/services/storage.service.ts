// ==============================================================================
// Botanidex — Storage Service
// Tujuan: Menangani validasi, kompresi, dan upload foto/video tanaman ke Supabase Storage dengan fallback
// Caller: Form kontribusi tanaman (src/routes/kontribusi/tambah/+page.svelte)
// Dependensi: src/lib/supabase.ts, src/lib/utils/image-compress.ts
// Main Functions: uploadPlantPhoto, validateVideoFile, uploadPlantVideo, deleteMediaFiles, extractStoragePath
// Side Effects: Storage upload/remove, pembacaan metadata durasi video, atau konversi ke local URL
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import { compressImageFile } from '../utils/image-compress';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const IMAGE_MIME_TO_EXT: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const VIDEO_MIME_TO_EXT: Record<string, string> = {
	'video/mp4': 'mp4',
	'video/webm': 'webm'
};
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_VIDEO_DURATION_SECONDS = 300;

export function extractStoragePath(urlOrPath: string): string | null {
	if (!urlOrPath) return null;
	if (urlOrPath.startsWith('photos/') || urlOrPath.startsWith('videos/')) return urlOrPath;
	const bucketMarker = '/plant-media/';
	const idx = urlOrPath.indexOf(bucketMarker);
	if (idx !== -1) return urlOrPath.slice(idx + bucketMarker.length);
	return null;
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error('Gagal membaca file media'));
		reader.readAsDataURL(blob);
	});
}

async function trySupabaseUpload(folder: 'photos' | 'videos', blob: Blob, ext: string, contentType?: string): Promise<string | null> {
	if (!isSupabaseConfigured()) return null;
	try {
		const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
		const { error } = await supabase.storage.from('plant-media').upload(fileName, blob, { cacheControl: '3600', contentType, upsert: false });
		if (!error) return supabase.storage.from('plant-media').getPublicUrl(fileName).data.publicUrl;
		console.warn(`Gagal upload ${folder} ke Supabase storage:`, error.message);
	} catch (err) {
		console.warn(`Supabase ${folder} upload exception:`, err);
	}
	return null;
}

function assertValidVideo(file: File) {
	if (!ALLOWED_VIDEO_TYPES.includes(file.type)) throw new Error('Format video tidak didukung. Gunakan format MP4 atau WebM.');
	if (file.size > MAX_VIDEO_BYTES) throw new Error('Ukuran video melebihi batas maksimal 50MB.');
}

export class StorageService {
	static async uploadPlantPhoto(file: File): Promise<string> {
		// SEC-07 Hardening: Validasi ketat format foto (JPG, PNG, WebP) & tolak SVG demi mencegah Stored XSS
		if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
			throw new Error('File harus berupa gambar dengan format JPG, PNG, atau WebP. Format SVG atau lainnya tidak diizinkan.');
		}
		const compressed = await compressImageFile(file, { maxWidth: 1600, quality: 0.82 });
		// Turunkan ekstensi dari MIME type terverifikasi, bukan dari nama file klien yang dapat dimanipulasi
		const ext = IMAGE_MIME_TO_EXT[file.type] || 'jpg';
		return (await trySupabaseUpload('photos', compressed, ext, file.type)) ?? readBlobAsDataUrl(compressed);
	}

	static async validateVideoFile(file: File): Promise<{ durationSeconds: number }> {
		assertValidVideo(file);
		if (typeof document === 'undefined') return { durationSeconds: 0 };

		return new Promise((resolve, reject) => {
			const videoEl = document.createElement('video');
			videoEl.preload = 'metadata';
			const objectUrl = URL.createObjectURL(file);
			const cleanup = () => { URL.revokeObjectURL(objectUrl); videoEl.removeAttribute('src'); videoEl.load(); };

			videoEl.onloadedmetadata = () => {
				const duration = Math.round(videoEl.duration || 0);
				cleanup();
				if (duration > MAX_VIDEO_DURATION_SECONDS) {
					return reject(new Error(`Durasi video (${Math.floor(duration / 60)}m ${duration % 60}d) melebihi batas maksimal 5 menit.`));
				}
				resolve({ durationSeconds: duration });
			};
			videoEl.onerror = () => { cleanup(); reject(new Error('File video rusak atau tidak dapat diputar oleh browser.')); };
			videoEl.src = objectUrl;
		});
	}

	static async uploadPlantVideo(file: File): Promise<string> {
		assertValidVideo(file);
		// Turunkan ekstensi dari MIME terverifikasi
		const ext = VIDEO_MIME_TO_EXT[file.type] || 'mp4';
		const remoteUrl = await trySupabaseUpload('videos', file, ext, file.type);
		if (remoteUrl) return remoteUrl;
		if (file.size <= 3.5 * 1024 * 1024 && typeof FileReader !== 'undefined') {
			return readBlobAsDataUrl(file).catch(() => URL.createObjectURL(file));
		}
		return URL.createObjectURL(file);
	}

	static async deleteMediaFiles(urlsOrPaths: string[]): Promise<boolean> {
		if (!isSupabaseConfigured() || !urlsOrPaths?.length) return false;
		const paths = urlsOrPaths.map(extractStoragePath).filter((p): p is string => Boolean(p));
		if (paths.length === 0) return false;
		try {
			const { error } = await supabase.storage.from('plant-media').remove(paths);
			if (error) {
				console.warn('Gagal menghapus berkas di Supabase storage:', error.message);
				return false;
			}
			return true;
		} catch (err) {
			console.warn('Supabase storage remove exception:', err);
			return false;
		}
	}
}
