// ==============================================================================
// Botanidex — PWA Service Worker (SvelteKit 3)
// Tujuan: Menyediakan kapabilitas offline-first untuk caching aset statis dan katalog
// Caller: Browser Service Worker runtime
// Dependensi: $app/manifest, $app/env (SvelteKit 3)
// Main Functions: install, activate, fetch event listeners
// Side Effects: Cache storage read/write, network fetch interception
// ==============================================================================

import { immutable, assets, prerendered } from '$app/manifest';
import { version } from '$app/env';

const CACHE_NAME = `botanidex-cache-${version}`;
const ASSETS_TO_CACHE = [
	'/',
	...Array.from(immutable || []),
	...Array.from(assets || []),
	...Array.from(prerendered || [])
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then(async (cache) => {
			await cache.addAll(ASSETS_TO_CACHE);
		}).then(() => {
			self.skipWaiting();
		})
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			for (const key of keys) {
				if (key !== CACHE_NAME) {
					await caches.delete(key);
				}
			}
		}).then(() => {
			self.clients.claim();
		})
	);
});

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// Jangan intercept non-GET, internal Vite dev requests, HMR, atau Supabase auth/storage
	if (
		event.request.method !== 'GET' ||
		url.pathname.includes('/auth/v1/') ||
		url.pathname.startsWith('/@') ||
		url.pathname.includes('node_modules') ||
		url.searchParams.has('import') ||
		url.searchParams.has('v') ||
		url.pathname.endsWith('.svelte')
	) {
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				return cachedResponse;
			}

			return fetch(event.request)
				.then((networkResponse) => {
					// Cache successful basic responses
					if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
						const responseToCache = networkResponse.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, responseToCache);
						});
					}
					return networkResponse;
				})
				.catch(() => {
					// Offline fallback untuk navigasi HTML
					if (event.request.headers.get('accept')?.includes('text/html')) {
						return caches.match('/');
					}
					return new Response('Offline: Konten belum di-cache', {
						status: 503,
						statusText: 'Service Unavailable'
					});
				});
		})
	);
});
