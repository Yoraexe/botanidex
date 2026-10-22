// ==============================================================================
// Botanidex — Slug Generator Utility
// Tujuan: Menghasilkan slug URL yang bersih, ramah SEO, dan bebas karakter khusus
// Caller: Plant form submission, plant repositories
// Dependensi: none
// Main Functions: createPlantSlug
// Side Effects: none (pure function)
// ==============================================================================

export function createPlantSlug(nameLocal: string, nameLatin?: string): string {
	const base = nameLocal.trim() || nameLatin?.trim() || 'tanaman';
	return base
		.toLowerCase()
		.replace(/[\s\W-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
