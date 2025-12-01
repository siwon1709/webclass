# AI Mood Player
서

얼굴 사진/웹캠의 감정을 분석해 무드에 맞는 Spotify 플레이리스트를 재생하는 웹 앱입니다.

- Emotion Detection: face-api.js(on-device, 실시간), Face++(옵션: 사진 분석)
- Spotify: 공개 플레이리스트 임베드 + 로그인(Implicit Grant) 시 내 기기 재생 시도

> 참고: 브라우저 자동재생 정책과 Spotify 정책 상 완전한 자동 재생에는 제약이 있습니다. 임베드 플레이어는 사용자의 재생 버튼 클릭이 필요할 수 있습니다. Spotify Web API로 내 기기에서 재생하려면 활성화된 Spotify 기기(앱)와 권한, 프리미엄 계정이 필요합니다.

## 빠른 시작

1) 개발용 서버 실행(Windows PowerShell 예시)

```powershell
# Python이 있다면
python -m http.server 5500

# Node.js가 있다면 (선택)
npx serve -l 5500
```

2) 브라우저에서 접속: http://localhost:5500/

3) 앱 사용하기
- 상단 버튼으로 Spotify 로그인/로그아웃을 제어합니다(키는 `config.js`).
- 얼굴 사진 업로드 → "감정 분석하기(사진)" 클릭 (Face++ 키가 없으면 데모로 전환)
- 또는 "웹캠 시작"으로 실시간 감정 분석(face-api.js) 활성화
- 결과 무드에 따른 추천 플레이리스트가 표시되며, "좋아요/다른 추천"으로 취향 학습이 반영됩니다.
- "내 Spotify 기기에서 재생 시도"는 로그인과 활성화된 기기가 필요합니다.

## 설정 (config.js)
`config.js`에 키를 "미리 넣어" 사용합니다(데모/개발 용도). 배포 시에는 서버 프록시/비공개 보관을 권장합니다.

```js
window.APP_CONFIG = {
	spotify: {
		clientId: "YOUR_SPOTIFY_CLIENT_ID",
		redirectUri: "http://localhost:5500/"
	},
	facepp: {
		key: "YOUR_FACEPP_API_KEY",
		secret: "YOUR_FACEPP_API_SECRET",
		endpoint: "https://api-us.faceplusplus.com/facepp/v3/detect"
	},
	realtime: {
		modelBaseUrl: "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights",
		intervalMs: 1200,
		smoothingWindow: 5
	}
};
```

### Face++ (사진 분석)
- Face++ Detect API는 `return_attributes=emotion`으로 감정 확률을 반환합니다.
- `config.js`에 Key/Secret을 채우면 사진 업로드 분석이 활성화됩니다.

### face-api.js (실시간 웹캠)
- CDN에서 모델을 로드하며, 브라우저 내(on-device)에서 표정(표정 분류) 인식.
- 네트워크 의존도가 낮아 실시간 분석에 적합합니다.

## Spotify 설정
- [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)에서 앱 생성 후 Client ID를 `config.js`에 입력.
- Redirect URI를 대시보드와 `config.js` 양쪽에 동일하게 등록.
- 로그인 후 `내 Spotify 기기에서 재생 시도`가 가능(활성화된 기기/프리미엄 필요).

## 감정→무드 매핑 및 학습
- Face++/face-api.js 결과 키를 `happy/sad/angry/surprise/disgust/fear/neutral/tired/chill` 무드로 매핑.
- 무드별 후보 플레이리스트 중, "좋아요/스킵" 학습을 반영한 가중치로 최적 추천을 선택.
- 학습 데이터는 브라우저 `localStorage`에 저장되며 "학습 초기화"로 삭제 가능.

## 한계 & 주의사항
- 브라우저의 자동 재생 제한으로 임베드에서 자동 재생이 되지 않을 수 있습니다.
- Spotify Web API 재생은 사용자의 활성 기기, 권한, 계정 상태에 따라 실패할 수 있습니다.
- 개인 정보: 업로드 이미지는 Face++ 호출 외에 저장하지 않으며, 실시간 분석은 on-device로 처리됩니다. 실제 서비스에서는 개인정보 처리방침을 준비하세요.
- 보안: 클라이언트에 키를 넣는 방식은 배포용으로 안전하지 않습니다. 서버 사이드 보관/프록시를 권장합니다.

## 라이선스/출처
- Spotify Embed & Web API 이용 약관을 준수하세요.
- Face++ API 정책을 준수하세요.
- 본 예시는 교육/데모 목적입니다.
