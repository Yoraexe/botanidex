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
import { sveltekit } from '@sveltejs/kit/vite';

const isWindowsLocal = process.platform === 'win32' && !process.env.VERCEL;

export default defineConfig({
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
			adapter: isWindowsLocal ? adapterAuto() : adapterVercel()
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
