<!--
  Flora SMK — Global Header / Navbar (Svelte 5 Runes)
  Tujuan: Navigasi utama atas untuk desktop dan mobile dengan profil peran pengguna
  Caller: src/routes/+layout.svelte
-->
<script lang="ts">
	import { authUser } from '#lib/stores/auth.store';
	import { Sprout, QrCode, Map, BookOpen, PlusCircle, ShieldCheck, User, LogOut } from '@lucide/svelte';
	import Button from '../ui/Button.svelte';

	let isDropdownOpen = $state(false);

	function handleSwitchRole(role: 'admin' | 'contributor' | 'viewer') {
		authUser.loginAsDemo(role);
		isDropdownOpen = false;
	}

	function handleLogout() {
		authUser.logout();
		isDropdownOpen = false;
	}
</script>

<header class="bg-white/95 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-40 transition-shadow">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
		<!-- Brand & Logo -->
		<a href="/" class="flex items-center gap-2.5 text-emerald-700 hover:text-emerald-800 transition-colors">
			<div class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
				<Sprout class="w-6 h-6" />
			</div>
			<div>
				<div class="font-bold text-lg leading-tight tracking-tight text-stone-900 flex items-center gap-1.5">
					Flora SMK
					<span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-widest">PWA</span>
				</div>
				<p class="text-[11px] text-stone-500 font-medium">Katalog Tanaman SMK Pertanian</p>
			</div>
		</a>

		<!-- Desktop Navigation Links -->
		<nav class="hidden md:flex items-center gap-1 text-sm font-medium text-stone-600">
			<a
				href="/katalog"
				class="px-3 py-2 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
			>
				<BookOpen class="w-4 h-4" />
				Katalog Tanaman
			</a>
			<a
				href="/scan"
				class="px-3 py-2 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
			>
				<QrCode class="w-4 h-4" />
				Scan QR
			</a>
			<a
				href="/peta"
				class="px-3 py-2 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
			>
				<Map class="w-4 h-4" />
				Peta Kebun
			</a>
			{#if $authUser?.role === 'admin'}
				<a
					href="/admin/moderasi"
					class="px-3 py-2 rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 font-semibold"
				>
					<ShieldCheck class="w-4 h-4 text-emerald-600" />
					Moderasi Guru
				</a>
			{/if}
			{#if $authUser?.role === 'contributor' || $authUser?.role === 'admin'}
				<a
					href="/kontribusi/tambah"
					class="px-3 py-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
				>
					<PlusCircle class="w-4 h-4" />
					Tambah Tanaman
				</a>
			{/if}
		</nav>

		<!-- Right Side User Actions / Role Switcher -->
		<div class="relative flex items-center gap-2">
			{#if $authUser}
				<div class="relative">
					<button
						onclick={() => (isDropdownOpen = !isDropdownOpen)}
						class="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors text-left"
					>
						<div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
							{$authUser.role === 'admin' ? 'GURU' : 'SISWA'}
						</div>
						<div class="hidden sm:block">
							<p class="text-xs font-bold text-stone-900 leading-none">{$authUser.display_name.split(' ')[0]}</p>
							<p class="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">{$authUser.role}</p>
						</div>
					</button>

					{#if isDropdownOpen}
						<div
							class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 p-2 z-50 text-xs text-stone-700 animate-in fade-in zoom-in-95 duration-100"
						>
							<div class="p-2 border-b border-stone-100 mb-1">
								<p class="font-bold text-stone-900 truncate">{$authUser.display_name}</p>
								<p class="text-[11px] text-stone-500 truncate">{$authUser.email}</p>
								<span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
									Peran: {$authUser.role}
								</span>
							</div>

							<p class="px-2 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">Ganti Akun Demo</p>
							<button
								onclick={() => handleSwitchRole('admin')}
								class="w-full text-left px-2 py-1.5 rounded-lg hover:bg-stone-100 flex items-center gap-2"
							>
								<ShieldCheck class="w-4 h-4 text-emerald-600" />
								<span>Login sebagai Guru / Admin</span>
							</button>
							<button
								onclick={() => handleSwitchRole('contributor')}
								class="w-full text-left px-2 py-1.5 rounded-lg hover:bg-stone-100 flex items-center gap-2"
							>
								<PlusCircle class="w-4 h-4 text-emerald-600" />
								<span>Login sebagai Siswa</span>
							</button>

							<div class="border-t border-stone-100 mt-1 pt-1">
								<button
									onclick={handleLogout}
									class="w-full text-left px-2 py-1.5 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium"
								>
									<LogOut class="w-4 h-4" />
									<span>Keluar (Guest Mode)</span>
								</button>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Quick Login for Demo/SMK presentation -->
				<div class="flex items-center gap-1.5">
					<button
						onclick={() => handleSwitchRole('contributor')}
						class="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
					>
						Masuk Siswa
					</button>
					<Button size="sm" variant="primary" onclick={() => handleSwitchRole('admin')}>
						<ShieldCheck class="w-3.5 h-3.5" />
						Portal Guru
					</Button>
				</div>
			{/if}
		</div>
	</div>
</header>
