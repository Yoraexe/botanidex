<!--
  Flora SMK — Root Layout (Svelte 5 Runes)
  Tujuan: Membungkus seluruh halaman dengan Navbar, Banner status offline, Toast container, dan BottomNav
  Caller: SvelteKit router
-->
<script lang="ts">
	import './layout.css';
	import type { Snippet } from 'svelte';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import BottomNav from '#lib/components/layout/BottomNav.svelte';
	import OfflineBanner from '#lib/components/layout/OfflineBanner.svelte';
	import Toast from '#lib/components/ui/Toast.svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="min-h-screen flex flex-col bg-stone-50 text-stone-900 pb-20 md:pb-0">
	<!-- Offline status alert -->
	<OfflineBanner />

	<!-- Toast alert overlay -->
	<Toast />

	<!-- Main navigation header -->
	<Navbar />

	<!-- Dynamic Page Content -->
	<main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
		{#if children}
			{@render children()}
		{/if}
	</main>

	<!-- Footer Desktop -->
	<footer class="hidden md:block bg-white border-t border-stone-200 mt-auto py-8 text-stone-500 text-xs">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<div class="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">
					FS
				</div>
				<p class="font-semibold text-stone-700">Flora SMK — Inovasi Botani Digital untuk SMK Pertanian</p>
			</div>
			<p>© 2026 SMK Pertanian Indonesia. Progressive Web App didesain untuk edukasi lapangan.</p>
		</div>
	</footer>

	<!-- Mobile bottom tab navigation -->
	<BottomNav />
</div>
