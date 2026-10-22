<!--
  Flora SMK — Mobile Bottom Navigation Bar (Svelte 5 Runes)
  Tujuan: Navigasi bawah jempol-ramah untuk layar HP & PWA
  Caller: src/routes/+layout.svelte
-->
<script lang="ts">
	import { page } from '$app/state';
	import { authUser } from '#lib/stores/auth.store';
	import { Home, BookOpen, QrCode, Map, PlusCircle, ShieldCheck } from '@lucide/svelte';

	let currentPath = $derived(page.url.pathname);
</script>

<div class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-lg">
	<nav class="flex items-center justify-around">
		<!-- Beranda -->
		<a
			href="/"
			class="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors {currentPath === '/'
				? 'text-emerald-600 font-bold'
				: 'text-stone-500 hover:text-stone-800'}"
		>
			<Home class="w-5 h-5 mb-0.5" />
			<span>Beranda</span>
		</a>

		<!-- Katalog -->
		<a
			href="/katalog"
			class="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors {currentPath.startsWith('/katalog')
				? 'text-emerald-600 font-bold'
				: 'text-stone-500 hover:text-stone-800'}"
		>
			<BookOpen class="w-5 h-5 mb-0.5" />
			<span>Katalog</span>
		</a>

		<!-- Scan QR Button (Floating Center highlight) -->
		<a
			href="/scan"
			class="flex flex-col items-center -mt-5"
			aria-label="Scan QR Code Tanaman"
		>
			<div class="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md border-4 border-white transition-transform active:scale-95">
				<QrCode class="w-6 h-6" />
			</div>
			<span class="text-[10px] font-bold text-emerald-700 mt-0.5">Scan QR</span>
		</a>

		<!-- Peta -->
		<a
			href="/peta"
			class="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors {currentPath.startsWith('/peta')
				? 'text-emerald-600 font-bold'
				: 'text-stone-500 hover:text-stone-800'}"
		>
			<Map class="w-5 h-5 mb-0.5" />
			<span>Peta</span>
		</a>

		<!-- Admin / Kontribusi -->
		{#if $authUser?.role === 'admin'}
			<a
				href="/admin/moderasi"
				class="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors {currentPath.startsWith('/admin')
					? 'text-emerald-600 font-bold'
					: 'text-stone-500 hover:text-stone-800'}"
			>
				<ShieldCheck class="w-5 h-5 mb-0.5" />
				<span>Moderasi</span>
			</a>
		{:else}
			<a
				href="/kontribusi/tambah"
				class="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors {currentPath.startsWith('/kontribusi')
					? 'text-emerald-600 font-bold'
					: 'text-stone-500 hover:text-stone-800'}"
			>
				<PlusCircle class="w-5 h-5 mb-0.5" />
				<span>Tambah</span>
			</a>
		{/if}
	</nav>
</div>
