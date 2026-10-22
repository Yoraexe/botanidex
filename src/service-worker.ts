// ==============================================================================
// Flora SMK — PWA Service Worker
// Tujuan: Menyediakan kapabilitas offline-first untuk caching aset statis dan katalog
// Caller: Browser Service Worker runtime
// Dependensi: $service-worker (SvelteKit)
// Main Functions: install, activate, fetch event listeners
// Side Effects: Cache storage read/write, network fetch interception
// ==============================================================================

/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

const CACHE_NAME = `flora-smk-cache-${version}`;
const ASSETS_TO_CACHE = [...build, ...files];

self.addEventListener('install', (event: any) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then(async (cache) => {
			await cache.addAll(ASSETS_TO_CACHE);
		}).then(() => {
			(self as any).skipWaiting();
		})
	);
});

self.addEventListener('activate', (event: any) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			for (const key of keys) {
				if (key !== CACHE_NAME) {
					await caches.delete(key);
				}
			}
		}).then(() => {
			(self as any).clients.claim();
		})
	);
});

self.addEventListener('fetch', (event: any) => {
	const url = new URL(event.request.url);

	// Jangan intercept non-GET requests atau request ke Supabase auth
	if (event.request.method !== 'GET' || url.pathname.includes('/auth/v1/')) {
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				return cachedResponse;
			}

			return fetch(event.request)
				.then((networkResponse) => {
					// Cache successful GET responses untuk navigasi dan data
					if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
						const responseToCache = networkResponse.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, responseToCache);
						});
					}
					return networkResponse;
				})
				.catch(() => {
					// Offline fallback
					if (event.request.headers.get('accept')?.includes('text/html')) {
						return caches.match('/') as Promise<Response>;
					}
					return new Response('Offline: Konten belum di-cache', {
						status: 503,
						statusText: 'Service Unavailable'
					});
				});
		})
	);
});
