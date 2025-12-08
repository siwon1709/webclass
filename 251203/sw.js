const CACHE_NAME = 'ai-mood-player-v1.0.1';
const RUNTIME_CACHE = 'runtime-cache-v1';

// 캐시할 정적 리소스 목록 (실제 파일 경로로 수정)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/particles.js',
  '/config.js',
  '/manifest.json'
];

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        // 개별적으로 캐시하여 일부 실패해도 계속 진행
        return Promise.allSettled(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(err => {
              console.warn(`[SW] Failed to cache ${url}:`, err);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Install failed:', err);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch 이벤트
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청은 캐시하지 않음
  if (
    url.hostname.includes('api.spotify.com') || 
    url.hostname.includes('accounts.spotify.com') ||
    url.hostname.includes('api-cn.faceplusplus.com') ||
    url.hostname.includes('i.scdn.co') ||
    request.method !== 'GET'
  ) {
    return;
  }

  // 외부 리소스 (CDN 등)
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // 로컬 리소스: Cache First, Network Fallback
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // 백그라운드에서 업데이트 확인
          fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, response);
                });
              }
            })
            .catch(() => {});
          
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }

            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });

            return response;
          })
          .catch((err) => {
            console.error('[SW] Fetch failed:', err);
            // 오프라인 시 HTML 요청이면 index.html 반환
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            throw err;
          });
      })
  );
});

// 메시지 이벤트 (클라이언트와 통신)
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
