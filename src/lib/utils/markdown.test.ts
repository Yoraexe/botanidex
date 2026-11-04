// ==============================================================================
// Botanidex — Markdown Formatter Test Suite
// Tujuan: Memvalidasi parsing Markdown botani (XSS prevention, heading, bullet list, inline format)
// Caller: bun test / vitest
// Dependensi: src/lib/utils/markdown.ts
// Main Functions: test suite
// Side Effects: Tidak ada
// ==============================================================================

import { describe, it, expect } from 'vitest';
import { formatMarkdown, escapeHtml } from './markdown';

describe('Botanical Markdown Formatter', () => {
	it('melakukan sanitasi tag HTML berbahaya (XSS prevention)', () => {
		const malicious = '<script>alert("xss")</script><img src="x" onerror="steal()" />';
		const result = formatMarkdown(malicious);
		expect(result).not.toContain('<script>');
		expect(result).toContain('&lt;script&gt;');
		expect(result).not.toContain('<img');
		expect(result).toContain('&lt;img');
	});

	it('memformat teks tebal (**bold**) dan miring (*italic*)', () => {
		const raw = 'Tanaman ini **sangat berkhasiat** untuk *batuk dan pilek*.';
		const formatted = formatMarkdown(raw);
		expect(formatted).toContain('<strong class="font-black text-[#0D0D0D]">sangat berkhasiat</strong>');
		expect(formatted).toContain('<em class="italic font-bold">batuk dan pilek</em>');
	});

	it('memformat heading sub-bagian botani (###)', () => {
		const raw = '### Khasiat Herbal & Farmakologi';
		const formatted = formatMarkdown(raw);
		expect(formatted).toContain('<h4 class="font-black text-sm text-[#0D0D0D] mt-3 mb-1 uppercase tracking-wide">Khasiat Herbal &amp; Farmakologi</h4>');
	});

	it('mengelompokkan daftar berbutir (-) ke dalam <ul> dan <li>', () => {
		const raw = `- Daun untuk tapal obat\n- Rimpang untuk minuman hangat\n- Batang untuk pupuk kompos`;
		const formatted = formatMarkdown(raw);
		expect(formatted).toContain('<ul class="list-disc list-inside');
		expect(formatted).toContain('<li>Daun untuk tapal obat</li>');
		expect(formatted).toContain('<li>Rimpang untuk minuman hangat</li>');
		expect(formatted).toContain('<li>Batang untuk pupuk kompos</li>');
		expect(formatted).toContain('</ul>');
	});

	it('mengelompokkan daftar bernomor (1.) ke dalam <ol> dan <li>', () => {
		const raw = `1. Siapkan media tanam gembur\n2. Tanam rimpang kedalaman 5cm\n3. Siram dua hari sekali`;
		const formatted = formatMarkdown(raw);
		expect(formatted).toContain('<ol class="list-decimal list-inside');
		expect(formatted).toContain('<li>Siapkan media tanam gembur</li>');
		expect(formatted).toContain('<li>Tanam rimpang kedalaman 5cm</li>');
		expect(formatted).toContain('<li>Siram dua hari sekali</li>');
		expect(formatted).toContain('</ol>');
	});

	it('mengembalikan string kosong jika input falsy', () => {
		expect(formatMarkdown('')).toBe('');
		expect(formatMarkdown(null as any)).toBe('');
	});
});
