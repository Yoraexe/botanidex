// ==============================================================================
// Botanidex — Slug Generator Utility
// Tujuan: Menghasilkan slug URL yang bersih, ramah SEO, dan bebas karakter khusus dengan fallback aman
// Caller: Plant form submission, plant repositories
// Dependensi: none
// Main Functions: createPlantSlug
// Side Effects: none (pure function)
// ==============================================================================

export function createPlantSlug(nameLocal: string, nameLatin?: string): string {
	const clean = (str?: string) =>
		(str || '')
			.trim()
			.toLowerCase()
			.replace(/[\s\W-]+/g, '-')
			.replace(/^-+|-+$/g, '');

	return clean(nameLocal) || clean(nameLatin) || 'tanaman';
}
