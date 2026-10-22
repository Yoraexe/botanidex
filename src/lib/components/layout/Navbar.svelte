<!--
  Flora SMK — Global Header / Navbar (Svelte 5 Runes)
  Tujuan: Navigasi utama atas gaya Neo-Brutalist Fresh Modern Agronomy dengan profil peran pengguna
  Caller: src/routes/+layout.svelte
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { authUser } from '#lib/stores/auth.store';
	import { ConfigService } from '#lib/services/config.service';
	import { Sprout, QrCode, Map, BookOpen, PlusCircle, ShieldCheck, User, LogOut, ChevronDown, Sliders } from '@lucide/svelte';
	import Button from '../ui/Button.svelte';

	let isDropdownOpen = $state(false);
	const currentPath = $derived(page.url.pathname);

	let identity = $state(ConfigService.getConfig().identity);

	onMount(() => {
		const handleConfigChange = (e: any) => {
			if (e.detail?.identity) {
				identity = e.detail.identity;
			}
		};
		if (typeof window !== 'undefined') {
			window.addEventListener('flora:config-updated', handleConfigChange);
		}
		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('flora:config-updated', handleConfigChange);
			}
		};
	});

	function handleSwitchRole(role: 'admin' | 'contributor' | 'viewer') {
		authUser.loginAsDemo(role);
		isDropdownOpen = false;
	}

	function handleLogout() {
		authUser.logout();
		isDropdownOpen = false;
	}
</script>

<header class="bg-white border-b-2 border-[#0D0D0D] sticky top-0 z-40">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
		<!-- Brand & Logo -->
		<a href="/" class="flex items-center gap-3 group">
			<div class="w-11 h-11 rounded-xl bg-white border-2 border-[#0D0D0D] shadow-[2.5px_2.5px_0px_#0D0D0D] p-1 flex items-center justify-center shrink-0 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
				<img
					src="/SMK-Pertanian-Gorontalo.png"
					alt="Logo SMK PPN Gorontalo"
					class="w-full h-full object-contain"
				/>
			</div>
			<div>
				<div class="font-black text-xl leading-none tracking-tight text-[#0D0D0D]">
					{identity.appName}
				</div>
				<p class="hidden lg:block text-[11px] text-stone-600 font-bold mt-0.5">{identity.tagline}</p>
			</div>
		</a>

		<!-- Desktop Navigation Links (Cohesive Option A Styling) -->
		<nav class="hidden md:flex items-center gap-2 text-sm font-bold text-[#0D0D0D]">
			<a
				href="/katalog"
				class="px-3.5 py-2 rounded-xl border-2 transition-all flex items-center gap-2 {currentPath.startsWith('/katalog')
					? 'bg-[#D4F469] border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]'
					: 'border-transparent hover:border-[#0D0D0D] hover:bg-[#F3F6ED] hover:shadow-[2px_2px_0px_#0D0D0D]'}"
			>
				<BookOpen class="w-4 h-4 stroke-[2.2]" />
				<span>Katalog Tanaman</span>
			</a>
			<a
				href="/scan"
				class="px-3.5 py-2 rounded-xl border-2 transition-all flex items-center gap-2 {currentPath.startsWith('/scan')
					? 'bg-[#D4F469] border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]'
					: 'border-transparent hover:border-[#0D0D0D] hover:bg-[#F3F6ED] hover:shadow-[2px_2px_0px_#0D0D0D]'}"
			>
				<QrCode class="w-4 h-4 stroke-[2.2]" />
				<span>Scan QR</span>
			</a>
			<a
				href="/peta"
				class="px-3.5 py-2 rounded-xl border-2 transition-all flex items-center gap-2 {currentPath.startsWith('/peta')
					? 'bg-[#D4F469] border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]'
					: 'border-transparent hover:border-[#0D0D0D] hover:bg-[#F3F6ED] hover:shadow-[2px_2px_0px_#0D0D0D]'}"
			>
				<Map class="w-4 h-4 stroke-[2.2]" />
				<span>Peta Kebun</span>
			</a>
			{#if $authUser?.role === 'admin'}
				<a
					href="/admin/moderasi"
					class="px-3.5 py-2 rounded-xl border-2 transition-all flex items-center gap-2 {currentPath.startsWith('/admin/moderasi')
						? 'bg-[#0F3E2E] text-white border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]'
						: 'border-transparent hover:border-[#0D0D0D] hover:bg-[#F3F6ED] hover:shadow-[2px_2px_0px_#0D0D0D]'}"
				>
					<ShieldCheck class="w-4 h-4 stroke-[2.2]" />
					<span>Portal Guru</span>
				</a>
				<a
					href="/admin/pengaturan"
					class="px-3.5 py-2 rounded-xl border-2 transition-all flex items-center gap-2 {currentPath.startsWith('/admin/pengaturan')
						? 'bg-[#D4F469] border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]'
						: 'border-transparent hover:border-[#0D0D0D] hover:bg-[#F3F6ED] hover:shadow-[2px_2px_0px_#0D0D0D]'}"
				>
					<Sliders class="w-4 h-4 stroke-[2.2]" />
					<span>CMS</span>
				</a>
			{/if}
			{#if $authUser?.role === 'contributor' || $authUser?.role === 'admin'}
				<a
					href="/kontribusi/tambah"
					class="px-3.5 py-2 rounded-xl border-2 transition-all flex items-center gap-2 {currentPath.startsWith('/kontribusi')
						? 'bg-[#D4F469] border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]'
						: 'border-transparent hover:border-[#0D0D0D] hover:bg-[#F3F6ED] hover:shadow-[2px_2px_0px_#0D0D0D]'}"
				>
					<PlusCircle class="w-4 h-4 stroke-[2.2]" />
					<span>Tambah Tanaman</span>
				</a>
			{/if}
		</nav>

		<!-- Right Side User Actions / Role Switcher -->
		<div class="relative flex items-center gap-2">
			{#if $authUser}
				<div class="relative">
					<button
						onclick={() => (isDropdownOpen = !isDropdownOpen)}
						class="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl border-2 border-[#0D0D0D] bg-white shadow-[2px_2px_0px_#0D0D0D] hover:shadow-[3px_3px_0px_#0D0D0D] transition-all text-left cursor-pointer active:translate-y-0.5"
					>
						<div class="w-8 h-8 rounded-lg border border-[#0D0D0D] font-black text-xs flex items-center justify-center {$authUser.role === 'admin' ? 'bg-[#0F3E2E] text-white' : 'bg-[#D4F469] text-[#0D0D0D]'}">
							{$authUser.role === 'admin' ? 'GURU' : 'SISWA'}
						</div>
						<div class="hidden sm:block">
							<p class="text-xs font-black text-[#0D0D0D] leading-none">{$authUser.display_name.split(' ')[0]}</p>
							<p class="text-[10px] text-stone-600 uppercase tracking-wider font-extrabold mt-0.5">{$authUser.role}</p>
						</div>
						<ChevronDown class="w-3.5 h-3.5 text-stone-700 ml-0.5" />
					</button>

					{#if isDropdownOpen}
						<div
							class="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-[5px_5px_0px_#0D0D0D] border-2 border-[#0D0D0D] p-2.5 z-50 text-xs text-stone-800"
						>
							<div class="p-2.5 bg-[#F3F6ED] rounded-xl border border-[#0D0D0D] mb-2">
								<p class="font-black text-[#0D0D0D] truncate">{$authUser.display_name}</p>
								<p class="text-[11px] text-stone-600 truncate font-medium">{$authUser.email}</p>
								<span class="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase border border-[#0D0D0D] {$authUser.role === 'admin' ? 'bg-[#0F3E2E] text-white' : 'bg-[#D4F469] text-[#0D0D0D]'}">
									Peran: {$authUser.role}
								</span>
							</div>

							<p class="px-2 py-1 text-[10px] font-black text-stone-500 uppercase tracking-wider">Ganti Mode Akun</p>
							<button
								onclick={() => handleSwitchRole('admin')}
								class="w-full text-left px-2.5 py-2 rounded-xl hover:bg-[#F3F6ED] flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
							>
								<ShieldCheck class="w-4 h-4 text-[#0D0D0D]" />
								<span>Login sebagai Guru / Admin</span>
							</button>
							<button
								onclick={() => handleSwitchRole('contributor')}
								class="w-full text-left px-2.5 py-2 rounded-xl hover:bg-[#F3F6ED] flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
							>
								<PlusCircle class="w-4 h-4 text-[#0D0D0D]" />
								<span>Login sebagai Siswa</span>
							</button>

							<div class="border-t-2 border-[#0D0D0D] mt-2 pt-2">
								<button
									onclick={handleLogout}
									class="w-full text-left px-2.5 py-2 rounded-xl hover:bg-[#E07A5F]/20 text-[#0D0D0D] flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
								>
									<LogOut class="w-4 h-4 text-[#E07A5F]" />
									<span>Keluar (Guest Mode)</span>
								</button>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Quick Login for Demo/SMK presentation -->
				<div class="flex items-center gap-2">
					<button
						onclick={() => handleSwitchRole('contributor')}
						class="text-xs font-black px-3 py-2 rounded-xl border-2 border-[#0D0D0D] bg-white text-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] hover:bg-[#D4F469] transition-colors cursor-pointer"
					>
						Masuk Siswa
					</button>
					<Button size="sm" variant="primary" onclick={() => handleSwitchRole('admin')}>
						<ShieldCheck class="w-4 h-4 text-[#0D0D0D]" />
						Portal Guru
					</Button>
				</div>
			{/if}
		</div>
	</div>
</header>
