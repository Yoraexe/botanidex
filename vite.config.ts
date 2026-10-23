// ==============================================================================
// Botanidex — Vite & Vitest Configuration
// Tujuan: Konfigurasi build SvelteKit 5 Runes, Tailwind CSS v4, adapter hybrid (Vercel CI + Windows local safe), dan Vitest
// Caller: Vite CLI, Vitest CLI
// Dependensi: vitest/config, @tailwindcss/vite, @sveltejs/adapter-auto, @sveltejs/adapter-vercel, @sveltejs/kit/vite
// Main Functions: default Vite config
// Side Effects: Build pipeline configuration
// ==============================================================================

import path from 'node:path';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import adapterAuto from '@sveltejs/adapter-auto';
import adapterVercel from '@sveltejs/adapter-vercel';
import adapterNode from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';

function resolveAdapter() {
	if (process.env.ADAPTER === 'node') {
		return adapterNode({ out: 'build' });
	}
	if (process.env.VERCEL) {
		return adapterVercel();
	}
	if (process.platform === 'win32') {
		return adapterAuto();
	}
	return adapterVercel();
}

export default defineConfig({
	server: {
		allowedHosts: true
	},
	preview: {
		allowedHosts: true
	},
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib')
		}
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: resolveAdapter()
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
