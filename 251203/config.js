// 클라이언트에 키를 넣는 것은 보안상 권장되지 않습니다.
// 데모/개발 용도에서만 사용하세요. 배포 시에는 서버 프록시/토큰 교환 등을 활용하세요.
window.APP_CONFIG = {
  spotify: {
    clientId: "YOUR_SPOTIFY_CLIENT_ID",
    redirectUri: window.location.origin + window.location.pathname,
  },
  facepp: {
    key: "YOUR_CLIENT_ID",
    secret: "YOUR_Secret_CLIENT_ID",
    endpoint: "https://api-us.faceplusplus.com/facepp/v3/detect"
  },
  realtime: {
    modelBaseUrl: "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights",
    // 분석 주기(ms). 너무 짧으면 CPU/네트워크 부담이 커집니다.
    intervalMs: 1200,
    // 결과 스무딩용: 최근 N회 결과의 최빈값으로 무드 결정
    smoothingWindow: 5
  }
};

