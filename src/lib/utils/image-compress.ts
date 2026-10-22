// ==============================================================================
// Botanidex — Client-Side Image Compression Utility
// Tujuan: Mengompresi resolusi dan ukuran file foto sebelum upload ke Supabase Storage
// Caller: PlantForm (kontribusi siswa), Admin tanaman editor
// Dependensi: HTMLCanvasElement browser API
// Main Functions: compressImageFile
// Side Effects: Memory allocation for image bitmap / canvas processing
// ==============================================================================

export interface CompressionOptions {
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
}

export async function compressImageFile(
	file: File,
	options: CompressionOptions = {}
): Promise<File> {
	// Jika bukan browser environment atau bukan gambar, kembalikan file asli
	if (typeof window === 'undefined' || !file.type.startsWith('image/')) {
		return file;
	}

	const { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = options;

	return new Promise((resolve) => {
		const img = new Image();
		const reader = new FileReader();

		reader.onload = (e) => {
			img.src = e.target?.result as string;
		};

		img.onload = () => {
			let { width, height } = img;

			if (width > maxWidth || height > maxHeight) {
				const ratio = Math.min(maxWidth / width, maxHeight / height);
				width = Math.round(width * ratio);
				height = Math.round(height * ratio);
			}

			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;

			const ctx = canvas.getContext('2d');
			if (!ctx) {
				resolve(file);
				return;
			}

			ctx.drawImage(img, 0, 0, width, height);

			const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

			canvas.toBlob(
				(blob) => {
					if (!blob) {
						resolve(file);
						return;
					}
					const compressedFile = new File([blob], file.name, {
						type: outputType,
						lastModified: Date.now()
					});
					resolve(compressedFile);
				},
				outputType,
				quality
			);
		};

		img.onerror = () => {
			resolve(file);
		};

		reader.readAsDataURL(file);
	});
}
