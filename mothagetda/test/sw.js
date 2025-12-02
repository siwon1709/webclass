const CACHE_NAME = 'ai-mood-player-v1.0.0';
const RUNTIME_CACHE = 'runtime-cache-v1';

// 캐시할 정적 리소스 목록
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './particles.js',
  './config.js',
  './manifest.json',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png'
];

// 설치 이벤트: 정적 리소스 캐싱
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 활성화 이벤트: 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch 이벤트: 네트워크 우선, 캐시 대체 전략
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청은 캐시하지 않음
  if (url.origin.includes('api.spotify.com') || 
      url.origin.includes('accounts.spotify.com') ||
      url.origin.includes('api-cn.faceplusplus.com')) {
    return;
  }

  // 외부 리소스 (Spotify Embed 등)
  if (url.origin !== location.origin) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(request).then((response) => {
          cache.put(request, response.clone());
          return response;
        }).catch(() => {
          return cache.match(request);
        });
      })
    );
    return;
  }

  // 정적 리소스: Cache First 전략
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // 유효한 응답만 캐시
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    }).catch(() => {
      // 오프라인 시 기본 페이지 반환
      if (request.destination === 'document') {
        return caches.match('./index.html');
      }
    })
  );
});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Push 알림 (선택사항)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  const options = {
    body: event.data ? event.data.text() : '새로운 음악 추천이 있습니다!',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: './icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: './icons/icon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('AI Mood Player', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 동기화 함수 (예시)
async function syncData() {
  console.log('[SW] Syncing data...');
  // 오프라인 중 저장된 데이터를 서버와 동기화
  return Promise.resolve();
}
