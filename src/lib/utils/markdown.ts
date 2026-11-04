// ==============================================================================
// Botanidex — Lightweight Botanical Markdown Formatter
// Tujuan: Memformat teks deskripsi botani, khasiat herbal, dan tata cara perawatan ke format HTML yang aman (XSS-sanitized)
// Caller: src/routes/katalog/[slug]/+page.svelte, src/routes/admin/tanaman/[id]/edit
// Dependensi: Tidak ada (Native regex & string manipulation)
// Main Functions: escapeHtml, formatMarkdown
// Side Effects: Murni pure function tanpa mutasi data
// ==============================================================================

/**
 * Sanitasi karakter berbahaya untuk mencegah XSS
 */
export function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/**
 * Parser Markdown ringan untuk agronomi & botani:
 * - ### Judul Bagian -> Heading 4
 * - **Tebal** -> <strong>
 * - *Miring* -> <em>
 * - - Poin / * Poin -> <li> dalam <ul>
 * - 1. Angka -> <li> dalam <ol>
 * - Baris baru -> <br> / paragraf
 */
export function formatMarkdown(raw: string): string {
	if (!raw) return '';

	// 1. Sanitasi awal terhadap input mentah
	const sanitized = escapeHtml(raw.trim());

	// 2. Pisahkan per baris untuk memproses list & heading
	const lines = sanitized.split(/\r?\n/);
	const output: string[] = [];
	let inUl = false;
	let inOl = false;

	const closeLists = () => {
		if (inUl) { output.push('</ul>'); inUl = false; }
		if (inOl) { output.push('</ol>'); inOl = false; }
	};

	for (let line of lines) {
		const trimmed = line.trim();

		// Cek Heading (### Judul)
		if (trimmed.startsWith('### ')) {
			closeLists();
			const content = trimmed.slice(4).trim();
			output.push(`<h4 class="font-black text-sm text-[#0D0D0D] mt-3 mb-1 uppercase tracking-wide">${content}</h4>`);
			continue;
		}

		if (trimmed.startsWith('## ')) {
			closeLists();
			const content = trimmed.slice(3).trim();
			output.push(`<h3 class="font-black text-base text-[#0D0D0D] mt-4 mb-1.5 uppercase tracking-wide border-b border-stone-200 pb-0.5">${content}</h3>`);
			continue;
		}

		// Cek Unordered list (- atau *)
		if (/^[-*]\s+/.test(trimmed)) {
			if (inOl) closeLists();
			if (!inUl) { output.push('<ul class="list-disc list-inside space-y-1 my-2 text-stone-800 font-medium">'); inUl = true; }
			const itemContent = trimmed.replace(/^[-*]\s+/, '');
			output.push(`<li>${parseInlineMarkdown(itemContent)}</li>`);
			continue;
		}

		// Cek Ordered list (1. 2. dst)
		if (/^\d+\.\s+/.test(trimmed)) {
			if (inUl) closeLists();
			if (!inOl) { output.push('<ol class="list-decimal list-inside space-y-1 my-2 text-stone-800 font-medium">'); inOl = true; }
			const itemContent = trimmed.replace(/^\d+\.\s+/, '');
			output.push(`<li>${parseInlineMarkdown(itemContent)}</li>`);
			continue;
		}

		// Baris kosong
		if (!trimmed) {
			closeLists();
			output.push('<div class="h-2"></div>');
			continue;
		}

		// Paragraf biasa
		closeLists();
		output.push(`<p class="leading-relaxed text-stone-800 font-medium my-1">${parseInlineMarkdown(trimmed)}</p>`);
	}

	closeLists();
	return output.join('\n');
}

/**
 * Format inline: **bold**, *italic*, dan `code`
 */
function parseInlineMarkdown(text: string): string {
	return text
		.replace(/\*\*(.+?)\*\*/g, '<strong class="font-black text-[#0D0D0D]">$1</strong>')
		.replace(/\*(.+?)\*/g, '<em class="italic font-bold">$1</em>')
		.replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-stone-200 text-[#0D0D0D] font-mono text-xs font-bold">$1</code>');
}
