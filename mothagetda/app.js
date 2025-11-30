// AI Mood Player - Frontend Only
// - Emotion Detection via Face++ (optional)
// - Spotify via Embed (default) + optional OAuth for device playback

(function () {
  const $ = (sel) => document.querySelector(sel);

  // Elements
  const spotifyLoginBtn = $('#spotify-login');
  const spotifyLogoutBtn = $('#spotify-logout');

  const imageInput = $('#image-input');
  const preview = $('#preview');
  const previewImg = $('#preview-img');
  const analyzeBtn = $('#analyze-btn');
  const demoBtn = $('#demo-btn');
  const statusEl = $('#status');

  const resultBox = $('#result-box');
  const emotionText = $('#emotion-text');
  const moodText = $('#mood-text');
  const confidenceText = $('#confidence-text');

  const embed = $('#embed');
  const playOnSpotify = $('#play-on-spotify');
  const likeBtn = $('#like');
  const skipBtn = $('#skip');
  const resetLearningBtn = $('#reset-learning');

  // Webcam elements
  const startCamBtn = $('#start-cam');
  const stopCamBtn = $('#stop-cam');
  const camVideo = $('#cam');
  const overlay = $('#overlay');

  // Tabs / CTA / Dropzone
  const tabUpload = document.getElementById('tab-upload');
  const tabWebcam = document.getElementById('tab-webcam');
  const panelUpload = document.querySelector('.panel-upload');
  const panelWebcam = document.querySelector('.panel-webcam');
  const ctaUpload = document.getElementById('cta-upload');
  const ctaWebcam = document.getElementById('cta-webcam');
  const dropzone = document.getElementById('dropzone');

  // Auth modal elements
  const authOpenBtn = document.getElementById('auth-open');
  const authModal = document.getElementById('auth-modal');
  const authCloseBtn = document.getElementById('auth-close');
  const authTabLogin = document.getElementById('auth-tab-login');
  const authTabSignup = document.getElementById('auth-tab-signup');
  const loginForm = document.getElementById('login-form');
  const loginEmail = document.getElementById('login-email');
  const loginPass = document.getElementById('login-password');
  const gotoSignup = document.getElementById('goto-signup');
  const forgotPass = document.getElementById('forgot-pass');
  const signupForm = document.getElementById('signup-form');
  const suName = document.getElementById('su-name');
  const suEmail = document.getElementById('su-email');
  const suPass = document.getElementById('su-pass');
  const suPass2 = document.getElementById('su-pass2');
  const signupSubmit = document.getElementById('signup-submit');
  const gotoLogin = document.getElementById('goto-login');
  const consentAll = document.getElementById('consent-all');
  const consentTos = document.getElementById('consent-tos');
  const consentPrivacy = document.getElementById('consent-privacy');
  const consentMarketing = document.getElementById('consent-marketing');
  const termsModal = document.getElementById('terms-modal');
  const termsClose = document.getElementById('terms-close');
  const termsBody = document.getElementById('terms-body');
  // Profile & app logout
  const profileBtn = document.getElementById('profile-btn');
  const appLogoutBtn = document.getElementById('app-logout');
  const profileModal = document.getElementById('profile-modal');
  const profileClose = document.getElementById('profile-close');
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profileLogout = document.getElementById('profile-logout');
  // MyPage (now inside profile modal) + Activity elements
  const activityLogToggle = document.getElementById('activity-log-toggle');
  const historyList = document.getElementById('history-list');
  const historyEmpty = document.getElementById('history-empty');
  const historyFilters = document.getElementById('history-filters');
  const myNameEl = document.getElementById('my-name');
  const myEmailEl = document.getElementById('my-email');
  const myAvatarEl = document.getElementById('my-avatar');
  // Community Extension elements (redesigned)
  const sideNav = document.getElementById('side-nav');
  const notifBadge = document.getElementById('notif-badge');
  const openShareBtn = document.getElementById('open-share');
  const frames = {
    feed: document.getElementById('frame-feed'),
    share: document.getElementById('frame-share'),
    theme: document.getElementById('frame-theme'),
    notifications: document.getElementById('frame-notifications')
  };
  const feedGrid = document.getElementById('feed-grid');
  const feedFilterChips = document.getElementById('feed-filter-chips');
  const moodButtonsWrap = document.getElementById('mood-buttons');
  const moodComment = document.getElementById('mood-comment');
  const currentTrackInput = document.getElementById('current-track');
  const shareSubmitBtn = document.getElementById('share-submit');
  const previewNick = document.getElementById('preview-nick');
  const previewTime = document.getElementById('preview-time');
  const previewMood = document.getElementById('preview-mood');
  const previewComment = document.getElementById('preview-comment');
  const previewTrack = document.getElementById('preview-track');
  const themeGrid = document.getElementById('theme-grid');
  const applyThemeBtn = document.getElementById('apply-theme');
  const openThemeSettingsBtn = document.getElementById('open-theme-settings');
  const notifList = document.getElementById('notif-list');
  const floatingNotifBtn = document.getElementById('floating-notif-btn');

  // State
  let accessToken = null; // Spotify implicit flow token
  let currentPlaylistId = null;
  let currentMood = null;
  let camStream = null;
  let analyzeTimer = null;
  let lastEmotions = [];

  // Moods mapping to Spotify playlist IDs (public, region-dependent)
  const moodPlaylists = {
    happy: [
      '37i9dQZF1DXdPec7aLTmlC',
      '37i9dQZF1DX3rxVfibe1L0',
      '37i9dQZF1DX1g0iEXLFycr',
    ],
    sad: [
      '37i9dQZF1DX7qK8ma5wgG1',
      '37i9dQZF1DX3YSRoSdA634',
    ],
    angry: [
      '37i9dQZF1DX76Wlfdnj7AP',
      '37i9dQZF1DWTcqUzwhNmKv',
    ],
    surprise: [
      '37i9dQZF1DX3rxVfibe1L0',
      '37i9dQZF1DX9XIFQuFvzM4',
    ],
    neutral: [
      '37i9dQZF1DX4WYpdgoIcn6',
      '37i9dQZF1DWTJ7xPn4vNaz',
    ],
    disgust: [
      '37i9dQZF1DX889U0CL85jj',
      '37i9dQZF1DWZeKCadgRdKQ',
    ],
    fear: [
      '37i9dQZF1DX4sWSpwq3LiO',
      '37i9dQZF1DXa1BeMIGX5Du',
    ],
    tired: [
      '37i9dQZF1DWZdL6tRZ2xYd',
      '37i9dQZF1DX82GYcclJ3Ug',
    ],
    chill: [
      '37i9dQZF1DX4WYpdgoIcn6',
      '37i9dQZF1DX889U0CL85jj',
    ],
  };

  // Utilities
  function setStatus(msg) {
    statusEl.textContent = msg || '';
  }

  function loadSettings() {
    try {
      // parse hash for access token (implicit grant)
      const hash = new URLSearchParams(window.location.hash.replace('#', ''));
      const token = hash.get('access_token');
      if (token) {
        accessToken = token;
        localStorage.setItem('spotify.accessToken', token);
        // cleanup URL hash
        history.replaceState({}, document.title, window.location.pathname + window.location.search);
      } else {
        const saved = localStorage.getItem('spotify.accessToken');
        if (saved) accessToken = saved;
      }
      updateSpotifyButtons();
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
  }

  function updateSpotifyButtons() {
    if (accessToken) {
      spotifyLoginBtn.disabled = true;
      spotifyLogoutBtn.disabled = false;
    } else {
      spotifyLoginBtn.disabled = false;
      spotifyLogoutBtn.disabled = true;
    }
  }

  // ===== Auth UI helpers =====
  function openModal(el) { if (el) { el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); } }
  function closeModal(el) { if (el) { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); } }
  function switchAuth(mode) {
    const isLogin = mode === 'login';
    if (authTabLogin) authTabLogin.classList.toggle('active', isLogin);
    if (authTabSignup) authTabSignup.classList.toggle('active', !isLogin);
    if (loginForm) loginForm.classList.toggle('hidden', !isLogin);
    if (signupForm) signupForm.classList.toggle('hidden', isLogin);
    if (isLogin && loginEmail) setTimeout(() => loginEmail.focus(), 10);
    if (!isLogin && suName) setTimeout(() => suName.focus(), 10);
  }
  function updateConsentAllFromItems() {
    const allChecked = [consentTos, consentPrivacy, consentMarketing].every(cb => cb && cb.checked);
    if (consentAll) consentAll.checked = allChecked;
  }
  function setAllConsents(val) {
    [consentTos, consentPrivacy, consentMarketing].forEach(cb => { if (cb) cb.checked = !!val; });
  }
  function canEnableSignup() {
    const hasReq = suName && suName.value.trim() && suEmail && suEmail.value.trim();
    const passOk = suPass && suPass2 && suPass.value && suPass.value === suPass2.value && suPass.value.length >= 8;
    const consentOk = consentTos && consentTos.checked && consentPrivacy && consentPrivacy.checked;
    return !!(hasReq && passOk && consentOk);
  }
  function refreshSignupButton() {
    if (signupSubmit) signupSubmit.disabled = !canEnableSignup();
  }

  // Tab switching (upload/webcam)
  function switchTab(mode) {
    const isUpload = mode === 'upload';
    if (tabUpload) tabUpload.classList.toggle('active', isUpload);
    if (tabWebcam) tabWebcam.classList.toggle('active', !isUpload);
    if (panelUpload) panelUpload.classList.toggle('hidden', !isUpload);
    if (panelWebcam) panelWebcam.classList.toggle('hidden', isUpload);
    if (isUpload) {
      // leaving webcam
      stopCam();
    } else {
      // ensure webcam active when switching
      startCam();
    }
  }

  function spotifyLogin() {
    const clientId = (window.APP_CONFIG && window.APP_CONFIG.spotify && window.APP_CONFIG.spotify.clientId) || '';
    const redirectUri = (window.APP_CONFIG && window.APP_CONFIG.spotify && window.APP_CONFIG.spotify.redirectUri) || (window.location.origin + window.location.pathname);
    if (!clientId) {
      alert('Spotify Client ID가 없습니다. config.js에 설정해 주세요.');
      return;
    }
    const scopes = [
      'user-read-playback-state',
      'user-modify-playback-state'
    ];
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.set('response_type', 'token'); // implicit grant
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes.join(' '));
    authUrl.searchParams.set('show_dialog', 'true');
    window.location.href = authUrl.toString();
  }

  function spotifyLogout() {
    accessToken = null;
    localStorage.removeItem('spotify.accessToken');
    updateSpotifyButtons();
    setStatus('Spotify 액세스 토큰이 제거되었습니다.');
  }

  function showPreview(file) {
    const url = URL.createObjectURL(file);
    previewImg.src = url;
    preview.classList.remove('hidden');
  }

  function pickMaxEmotion(emotionObj) {
    // Face++ emotion keys: sadness, neutral, disgust, anger, surprise, fear, happiness (values: 0-100)
    let bestKey = 'neutral';
    let bestVal = -1;
    Object.keys(emotionObj).forEach((k) => {
      const v = emotionObj[k];
      if (v > bestVal) { bestVal = v; bestKey = k; }
    });
    return { key: bestKey, confidence: (bestVal / 100) };
  }

  function mapEmotionToMood(emotionKey) {
    const key = (emotionKey || '').toLowerCase();
    switch (key) {
      case 'happiness': return 'happy';
      case 'sadness': return 'sad';
      case 'anger': return 'angry';
      case 'surprise': return 'surprise';
      case 'disgust': return 'disgust';
      case 'fear': return 'fear';
      case 'neutral':
      default: return 'neutral';
    }
  }

  function setResult({ emotion, mood, confidence }) {
    emotionText.textContent = emotion;
    moodText.textContent = mood;
    confidenceText.textContent = (confidence != null) ? `${Math.round(confidence * 100)}%` : '-';
    resultBox.classList.remove('hidden');
    currentMood = mood;
  }

  function getPrefs() {
    try { return JSON.parse(localStorage.getItem('prefs') || '{}'); } catch { return {}; }
  }
  function setPrefs(p) { localStorage.setItem('prefs', JSON.stringify(p)); }
  function scoreFor(playlistId) {
    const p = getPrefs();
    const s = p[playlistId] || { like: 0, skip: 0 };
    return s.like - 0.5 * s.skip;
  }
  function record(action, playlistId) {
    const p = getPrefs();
    const s = p[playlistId] || { like: 0, skip: 0 };
    if (action === 'like') s.like += 1; else if (action === 'skip') s.skip += 1;
    p[playlistId] = s; setPrefs(p);
  }
  function choosePlaylistForMood(mood) {
    const candidates = moodPlaylists[mood] || moodPlaylists['neutral'];
    let best = candidates[0];
    let bestScore = -Infinity;
    candidates.forEach((pid) => {
      const sc = scoreFor(pid);
      if (sc > bestScore) { bestScore = sc; best = pid; }
    });
    return best;
  }
  function setEmbedByMood(mood) {
    const key = (mood || 'neutral').toLowerCase();
    const playlistId = choosePlaylistForMood(key);
    currentPlaylistId = playlistId;
    embed.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.style.borderRadius = '12px';
    iframe.src = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`;
    iframe.width = '100%';
    iframe.height = '380';
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    iframe.loading = 'lazy';
    embed.appendChild(iframe);
  }

  async function analyzeWithFacePP(file) {
    const cfg = (window.APP_CONFIG && window.APP_CONFIG.facepp) || {};
    const key = (cfg.key || '').trim();
    const secret = (cfg.secret || '').trim();
    const endpoint = cfg.endpoint || 'https://api-us.faceplusplus.com/facepp/v3/detect';
    if (!key || !secret) {
      throw new Error('Face++ API Key/Secret이 없습니다. config.js에 키를 설정해 주세요.');
    }

    const fd = new FormData();
    fd.append('api_key', key);
    fd.append('api_secret', secret);
    fd.append('image_file', file);
    fd.append('return_attributes', 'emotion');

    const resp = await fetch(endpoint, { method: 'POST', body: fd });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Face++ 요청 실패: ${resp.status} ${text}`);
    }
    const data = await resp.json();
    if (!data.faces || data.faces.length === 0) {
      throw new Error('얼굴을 찾지 못했습니다. 다른 사진으로 시도해 주세요.');
    }
    const e = data.faces[0].attributes.emotion;
    const { key: emotionKey, confidence } = pickMaxEmotion(e);
    const mood = mapEmotionToMood(emotionKey);
    return { emotion: emotionKey, confidence, mood };
  }

  function promptDemoMood() {
    const options = ['happy', 'sad', 'angry', 'surprise', 'neutral', 'disgust', 'fear', 'tired', 'chill'];
    const mood = prompt(`데모 모드: 무드를 선택해 입력하세요\n${options.join(', ')}`, 'happy');
    if (!mood) return null;
    return { emotion: mood, confidence: null, mood: mood.toLowerCase() };
  }

  async function onAnalyze() {
    setStatus('분석 중...');
    try {
      const file = imageInput.files && imageInput.files[0];
      if (!file) {
        alert('이미지 파일을 선택해 주세요.');
        setStatus('');
        return;
      }
      showPreview(file);
      let result;
      try {
        result = await analyzeWithFacePP(file);
      } catch (e) {
        console.warn(e);
        alert(`Face++ 분석 실패: ${e.message}\n데모 모드로 진행합니다.`);
        result = promptDemoMood();
        if (!result) { setStatus('취소되었습니다.'); return; }
      }
      setResult(result);
      setEmbedByMood(result.mood);
      setStatus('완료! 플레이리스트를 재생해보세요.');
    } catch (err) {
      console.error(err);
      setStatus(`에러: ${err.message}`);
    }
  }

  async function onPlayOnSpotify() {
    if (!accessToken) {
      alert('Spotify 로그인이 필요합니다. 설정에서 로그인해 주세요.');
      return;
    }
    if (!currentPlaylistId) {
      alert('먼저 감정을 분석하여 플레이리스트를 선택해 주세요.');
      return;
    }
    // Try to start playback on user's active device.
    try {
      const resp = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ context_uri: `spotify:playlist:${currentPlaylistId}` })
      });
      if (resp.status === 202 || resp.status === 204) {
        setStatus('Spotify에서 재생을 시작했습니다. 활성 기기를 확인해 주세요.');
      } else if (resp.status === 404) {
        setStatus('활성화된 Spotify 기기를 찾을 수 없습니다. 앱에서 기기를 먼저 실행해 주세요.');
      } else if (resp.status === 401) {
        setStatus('토큰이 만료되었거나 권한이 없습니다. 다시 로그인해 주세요.');
        spotifyLogout();
      } else {
        const text = await resp.text();
        setStatus(`재생 실패 (${resp.status}): ${text}`);
      }
    } catch (e) {
      console.error(e);
      setStatus(`Spotify 재생 시도 중 오류: ${e.message}`);
    }
  }

  // Realtime (face-api.js)
  async function loadModels() {
    const base = (window.APP_CONFIG && window.APP_CONFIG.realtime && window.APP_CONFIG.realtime.modelBaseUrl) || '/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(base),
      faceapi.nets.faceExpressionNet.loadFromUri(base),
    ]);
  }

  function topExpression(expressions) {
    let bestK = 'neutral'; let bestV = -1;
    Object.keys(expressions).forEach(k => { if (expressions[k] > bestV) { bestV = expressions[k]; bestK = k; } });
    return { key: bestK, value: bestV };
  }
  function expressionsToEmotionMood(expressions) {
    const t = topExpression(expressions);
    const emotionKey = t.key; // face-api keys: neutral, happy, sad, angry, fearful, disgusted, surprised
    const map = { fearful: 'fear', disgusted: 'disgust', surprised: 'surprise' };
    const norm = map[emotionKey] || emotionKey; // happy/sad/angry/neutral as-is
    return { emotion: norm, mood: norm, confidence: t.value };
  }
  function drawOverlay(box, expressions) {
    const ctx = overlay.getContext('2d');
    const { width, height } = overlay;
    ctx.clearRect(0, 0, width, height);
    if (!box) return;
    ctx.strokeStyle = '#4f8cff';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(box.x, Math.max(0, box.y - 22), 180, 20);
    ctx.fillStyle = '#e9eef7';
    const top = topExpression(expressions);
    ctx.fillText(`${top.key}: ${Math.round(top.value * 100)}%`, box.x + 6, Math.max(12, box.y - 6));
  }
  function majority(items) {
    const counts = {};
    items.forEach(k => { counts[k] = (counts[k] || 0) + 1; });
    let bestK = null, bestC = -1;
    Object.keys(counts).forEach(k => { if (counts[k] > bestC) { bestC = counts[k]; bestK = k; } });
    return bestK;
  }
  async function startCam() {
    try {
      await loadModels();
      camStream = await navigator.mediaDevices.getUserMedia({ video: { width: 720, height: 405 }, audio: false });
      camVideo.srcObject = camStream;
      await camVideo.play();
      overlay.width = camVideo.videoWidth || camVideo.clientWidth;
      overlay.height = camVideo.videoHeight || camVideo.clientHeight;
      const interval = (window.APP_CONFIG && window.APP_CONFIG.realtime && window.APP_CONFIG.realtime.intervalMs) || 1200;
      const windowN = (window.APP_CONFIG && window.APP_CONFIG.realtime && window.APP_CONFIG.realtime.smoothingWindow) || 5;
      analyzeTimer = setInterval(async () => {
        try {
          const det = await faceapi.detectSingleFace(camVideo, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
          if (!det) { drawOverlay(null, null); return; }
          const dims = faceapi.matchDimensions(overlay, camVideo, true);
          const resized = faceapi.resizeResults(det, dims);
          drawOverlay(resized.detection.box, resized.expressions);
          const { emotion, mood, confidence } = expressionsToEmotionMood(resized.expressions);
          lastEmotions.push(mood);
          if (lastEmotions.length > windowN) lastEmotions.shift();
          const smoothed = majority(lastEmotions);
          setResult({ emotion, mood: smoothed, confidence });
          if (smoothed !== currentMood) { setEmbedByMood(smoothed); }
        } catch (e) { /* ignore */ }
      }, interval);
      setStatus('웹캠 분석을 시작했습니다.');
    } catch (e) {
      console.error(e);
      setStatus('웹캠을 시작할 수 없습니다: ' + e.message);
    }
  }
  function stopCam() {
    if (analyzeTimer) { clearInterval(analyzeTimer); analyzeTimer = null; }
    if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; }
    const ctx = overlay.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, overlay.width, overlay.height);
    setStatus('웹캠을 중지했습니다.');
  }

  // Event listeners
  imageInput.addEventListener('change', () => {
    const file = imageInput.files && imageInput.files[0];
    if (file) showPreview(file);
  });
  analyzeBtn.addEventListener('click', onAnalyze);
  demoBtn.addEventListener('click', () => {
    const result = promptDemoMood();
    if (!result) return;
    setResult(result);
    setEmbedByMood(result.mood);
    setStatus('데모 무드 적용됨');
  });
  spotifyLoginBtn.addEventListener('click', spotifyLogin);
  spotifyLogoutBtn.addEventListener('click', spotifyLogout);
  playOnSpotify.addEventListener('click', onPlayOnSpotify);
  likeBtn && likeBtn.addEventListener('click', () => { if (currentPlaylistId) { record('like', currentPlaylistId); setStatus('좋아요 반영됨'); } });
  skipBtn && skipBtn.addEventListener('click', () => { if (currentMood) { record('skip', currentPlaylistId); setEmbedByMood(currentMood); setStatus('다른 추천을 표시했습니다.'); } });
  resetLearningBtn && resetLearningBtn.addEventListener('click', () => { localStorage.removeItem('prefs'); setStatus('학습 데이터가 초기화되었습니다.'); });
  startCamBtn && startCamBtn.addEventListener('click', startCam);
  stopCamBtn && stopCamBtn.addEventListener('click', stopCam);

  // Tab buttons
  tabUpload && tabUpload.addEventListener('click', () => switchTab('upload'));
  tabWebcam && tabWebcam.addEventListener('click', () => switchTab('webcam'));

  // CTA buttons in hero
  ctaUpload && ctaUpload.addEventListener('click', () => { switchTab('upload'); imageInput && imageInput.click(); });
  ctaWebcam && ctaWebcam.addEventListener('click', () => switchTab('webcam'));

  // Dropzone interactions
  if (dropzone) {
    const setDrag = (on) => dropzone.classList.toggle('dragover', on);
    dropzone.addEventListener('click', () => imageInput && imageInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); setDrag(true); });
    dropzone.addEventListener('dragleave', () => setDrag(false));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault(); setDrag(false);
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f) return;
      // set to input for consistency
      if (imageInput) {
        const dt = new DataTransfer();
        dt.items.add(f);
        imageInput.files = dt.files;
      }
      showPreview(f);
    });
  }

  // Init
  loadSettings();
  switchTab('upload');

  // ===== Auth UI wiring =====
  function isLoggedIn() {
    try { return !!localStorage.getItem('demo.user'); } catch { return false; }
  }
  function applyGate() {
    if (!isLoggedIn()) {
      document.body.classList.add('blocked');
      openModal(authModal);
      switchAuth('login');
    } else {
      document.body.classList.remove('blocked');
    }
  }
  applyGate();
  if (authOpenBtn) authOpenBtn.addEventListener('click', () => { openModal(authModal); switchAuth('login'); });
  if (authCloseBtn) authCloseBtn.addEventListener('click', () => {
    if (document.body.classList.contains('blocked') && !isLoggedIn()) {
      alert('로그인 또는 회원가입 후 이용 가능합니다.');
      return;
    }
    closeModal(authModal);
  });
  if (authModal) authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      if (document.body.classList.contains('blocked') && !isLoggedIn()) {
        alert('로그인 또는 회원가입 후 이용 가능합니다.');
        return;
      }
      closeModal(authModal);
    }
  });
  if (authTabLogin) authTabLogin.addEventListener('click', () => switchAuth('login'));
  if (authTabSignup) authTabSignup.addEventListener('click', () => switchAuth('signup'));
  if (gotoSignup) gotoSignup.addEventListener('click', () => switchAuth('signup'));
  if (gotoLogin) gotoLogin.addEventListener('click', () => switchAuth('login'));
  if (forgotPass) forgotPass.addEventListener('click', () => alert('비밀번호 재설정 링크를 이메일로 발송하는 기능을 연결하세요.'));

  // Consent logic
  if (consentAll) consentAll.addEventListener('change', () => { setAllConsents(consentAll.checked); refreshSignupButton(); });
  [consentTos, consentPrivacy, consentMarketing].forEach(cb => {
    cb && cb.addEventListener('change', () => { updateConsentAllFromItems(); refreshSignupButton(); });
  });
  [suName, suEmail, suPass, suPass2].forEach(inp => { inp && inp.addEventListener('input', refreshSignupButton); });

  if (signupForm) signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!canEnableSignup()) { refreshSignupButton(); return; }
    const user = { name: suName.value.trim(), email: suEmail.value.trim(), password: suPass.value };
    localStorage.setItem('demo.user', JSON.stringify(user));
    alert('회원가입이 완료되었습니다. 환영합니다!');
    closeModal(authModal);
    applyGate();
    updateAuthUI();
  });
  if (loginForm) loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (loginEmail && loginEmail.value.trim()) || '';
    const pass = (loginPass && loginPass.value) || '';
    if (!email || !pass) { alert('이메일과 비밀번호를 입력해 주세요.'); return; }
    const stored = getUser();
    if (email === 'asd@asd.com' && pass === 'asd') {
      localStorage.setItem('demo.user', JSON.stringify({ email, name: 'Demo User', password: pass }));
      alert('데모 계정 로그인 성공');
    } else if (stored && stored.email === email && stored.password === pass) {
      alert('로그인되었습니다.');
    } else {
      alert('계정 정보가 올바르지 않습니다. 데모(asd@asd.com / asd) 또는 회원가입을 이용하세요.');
      return;
    }
    closeModal(authModal);
    applyGate();
    updateAuthUI();
  });

  // Terms modal
  const termsMap = {
    tos: '<h3>서비스 이용약관</h3><p class="muted">여기에 서비스 이용약관 내용을 넣어주세요.</p>',
    privacy: '<h3>개인정보 수집/이용</h3><p class="muted">여기에 개인정보 처리방침 내용을 넣어주세요.</p>',
    marketing: '<h3>마케팅 정보 수신 동의</h3><p class="muted">선택 동의 항목의 상세 내용을 넣어주세요.</p>'
  };
  document.querySelectorAll('.consent .more').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-doc');
      if (termsBody) termsBody.innerHTML = termsMap[key] || '<p class="muted">내용을 불러올 수 없습니다.</p>';
      openModal(termsModal);
    });
  });
  if (termsClose) termsClose.addEventListener('click', () => closeModal(termsModal));
  if (termsModal) termsModal.addEventListener('click', (e) => { if (e.target === termsModal) closeModal(termsModal); });
  
  // ===== Profile & App Logout =====
  function getUser() {
    try { return JSON.parse(localStorage.getItem('demo.user') || 'null'); } catch { return null; }
  }
  function updateAuthUI() {
    const user = getUser();
    const show = !!user;
    if (profileBtn) profileBtn.style.display = show ? '' : 'none';
    if (appLogoutBtn) appLogoutBtn.style.display = show ? '' : 'none';
    if (authOpenBtn) authOpenBtn.style.display = show ? 'none' : '';
    if (spotifyLogoutBtn) spotifyLogoutBtn.style.display = show ? 'none' : '';
    // Populate My Page basic info
    if (show && user) {
      myNameEl && (myNameEl.textContent = user.name || user.email || '-');
      myEmailEl && (myEmailEl.textContent = user.email || '-');
      if (myAvatarEl) {
        const seed = (user.name || user.email || 'U')[0].toUpperCase();
        myAvatarEl.textContent = seed;
      }
    }
  }
  updateAuthUI();
  function openProfile() {
    const user = getUser();
    profileName && (profileName.textContent = (user && user.name) || '-');
    profileEmail && (profileEmail.textContent = (user && user.email) || '-');
    openModal(profileModal);
  }
  profileBtn && profileBtn.addEventListener('click', openProfile);
  profileClose && profileClose.addEventListener('click', () => closeModal(profileModal));
  profileModal && profileModal.addEventListener('click', (e) => { if (e.target === profileModal) closeModal(profileModal); });
  profileLogout && profileLogout.addEventListener('click', () => {
    localStorage.removeItem('demo.user');
    closeModal(profileModal);
    applyGate();
    updateAuthUI();
  });
  appLogoutBtn && appLogoutBtn.addEventListener('click', () => {
    localStorage.removeItem('demo.user');
    applyGate();
    updateAuthUI();
  });
  // Change password (demo only)
  const changePassBtn = document.getElementById('change-pass');
  changePassBtn && changePassBtn.addEventListener('click', () => {
    const u = getUser(); if (!u) { alert('로그인이 필요합니다.'); return; }
    const np = prompt('새 비밀번호를 입력하세요 (8자 이상)', 'new-pass');
    if (!np || np.length < 8) { alert('8자 이상 비밀번호를 입력하세요.'); return; }
    u.password = np; localStorage.setItem('demo.user', JSON.stringify(u)); alert('비밀번호가 변경되었습니다.');
  });

  // ===== Activity Logging & History =====
  function getActivitySettings() {
    try { return JSON.parse(localStorage.getItem('activity.settings') || '{}'); } catch { return {}; }
  }
  function setActivitySettings(s) { localStorage.setItem('activity.settings', JSON.stringify(s)); }
  function isLoggingEnabled() { return !!getActivitySettings().logging; }
  function setLoggingEnabled(val) { const s = getActivitySettings(); s.logging = !!val; setActivitySettings(s); }
  function getActivities() {
    try { return JSON.parse(localStorage.getItem('activity.list') || '[]'); } catch { return []; }
  }
  function setActivities(list) { localStorage.setItem('activity.list', JSON.stringify(list)); }
  function addActivity(type, title, meta) {
    if (!isLoggingEnabled()) return;
    const list = getActivities();
    list.unshift({ id: Date.now(), type, title, meta, ts: new Date().toISOString() });
    setActivities(list);
    renderHistory();
  }
  // Example hooking points (you can call addActivity in existing flows later)
  // addActivity('mood', '무드 분석: happy', 'confidence 92%');

  function formatDate(ts) {
    try { const d = new Date(ts); return d.toLocaleString('ko-KR', { hour12: false }); } catch { return ts; }
  }
  function renderHistory(filter = currentHistoryFilter) {
    const list = getActivities();
    const filtered = list.filter(a => filter === 'all' ? true : a.type === filter);
    historyList && (historyList.innerHTML = '');
    if (!filtered.length) {
      historyEmpty && historyEmpty.classList.remove('hidden');
      return;
    } else { historyEmpty && historyEmpty.classList.add('hidden'); }
    filtered.forEach(a => {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.dataset.id = a.id;
      li.dataset.type = a.type;
      li.innerHTML = `<div class="line-top"><span class="badge">${a.type}</span><span class="time">${formatDate(a.ts)}</span></div><div class="title">${a.title}</div><div class="meta">${a.meta || ''}</div>`;
      historyList.appendChild(li);
    });
  }
  let currentHistoryFilter = 'all';
  historyFilters && historyFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('button.seg');
    if (!btn) return;
    historyFilters.querySelectorAll('.seg').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentHistoryFilter = btn.getAttribute('data-filter');
    renderHistory();
  });
  // Detail modal for activity
  let activityModalEl = document.getElementById('activity-modal');
  if (!activityModalEl) {
    activityModalEl = document.createElement('div');
    activityModalEl.id = 'activity-modal';
    activityModalEl.className = 'modal';
    activityModalEl.setAttribute('aria-hidden','true');
    activityModalEl.innerHTML = `<div class="activity-modal-card card" role="document"><div class="auth-head"><div><div class="auth-title">활동 상세</div><div class="auth-sub">기록 정보</div></div><button id="activity-close" class="icon-btn" aria-label="닫기">✕</button></div><div class="activity-body" id="activity-body"></div></div>`;
    document.body.appendChild(activityModalEl);
    const closeBtn = activityModalEl.querySelector('#activity-close');
    closeBtn.addEventListener('click', () => closeModal(activityModalEl));
    activityModalEl.addEventListener('click', (e) => { if (e.target === activityModalEl) closeModal(activityModalEl); });
  }
  const activityBody = document.getElementById('activity-body');
  historyList && historyList.addEventListener('click', (e) => {
    const item = e.target.closest('.history-item');
    if (!item) return;
    const id = Number(item.dataset.id);
    const act = getActivities().find(a => a.id === id);
    if (!act) return;
    if (activityBody) {
      activityBody.innerHTML = `<div class="detail-row"><span class="badge">${act.type}</span><span class="time muted">${formatDate(act.ts)}</span></div><div><strong>${act.title}</strong></div><div class="muted">${act.meta || ''}</div>`;
    }
    openModal(activityModalEl);
  });

  // Logging toggle
  if (activityLogToggle) {
    activityLogToggle.checked = isLoggingEnabled();
    activityLogToggle.addEventListener('change', () => { setLoggingEnabled(activityLogToggle.checked); });
  }
  // (Account inline logout removed with modal integration)

  // Initial render of activity history
  renderHistory();

  // ===== Community Extension Logic =====
  let currentFrame = 'feed';
  function switchFrame(name) {
    currentFrame = name;
    Object.entries(frames).forEach(([k, el]) => { if (el) el.classList.toggle('active', k === name); });
    if (sideNav) {
      sideNav.querySelectorAll('.side-item').forEach(b => b.classList.toggle('active', b.getAttribute('data-view') === name));
    }
    // special cases
    if (name === 'profile') { openProfile(); switchFrame('feed'); } // show profile modal instead
  }
  sideNav && sideNav.addEventListener('click', (e) => {
    const btn = e.target.closest('.side-item'); if (!btn) return;
    const view = btn.getAttribute('data-view'); switchFrame(view);
  });
  openShareBtn && openShareBtn.addEventListener('click', () => { switchFrame('share'); });

  // Demo feed data
  // Persistent feed & follow system
  function getDemoFeed() {
    const base = Date.now();
    return [
      { id: base-1, nick: 'Nova', mood: 'Chill', comment: '잔잔한 밤, 집중이 잘 돼요.', track: 'Lo-fi Beats', ts: base - 600000, mine: false, likes: 12, bookmarked: false, comments: 3, trackList:['Lo-fi Beats','Soft Pad','Night Flow','Calm Loop'] },
      { id: base-2, nick: 'Me', mood: 'Happy', comment: '분석 결과가 너무 신나요! 🎉', track: 'Party Mix', ts: base - 420000, mine: true, likes: 4, bookmarked: true, comments: 0, trackList:['Party Mix','Upbeat Hook','Dance Drift'] },
      { id: base-3, nick: 'Eon', mood: 'Focus', comment: '코딩 몰입 중입니다.', track: 'Deep Work Playlist', ts: base - 900000, mine: false, likes: 22, bookmarked: false, comments: 5, trackList:['Deep Work Playlist','Concentration','Flow State','Brain Boost','Long Focus'] },
      { id: base-4, nick: 'Luna', mood: 'Sad', comment: '조금 지친 하루였어요.', track: 'Mellow Piano', ts: base - 3600000, mine: false, likes: 9, bookmarked: false, comments: 2, trackList:['Mellow Piano','Moonlight Keys','Soft Rain'] },
    ];
  }
  function loadFeed() { try { return JSON.parse(localStorage.getItem('community.feed')||'null'); } catch { return null; } }
  function saveFeed() { localStorage.setItem('community.feed', JSON.stringify(feedData)); }
  function loadFollowing() { try { return JSON.parse(localStorage.getItem('community.following')||'[]'); } catch { return []; } }
  function saveFollowing(list) { localStorage.setItem('community.following', JSON.stringify(list)); }
  let feedData = loadFeed() || getDemoFeed();
  let following = loadFollowing();
  function isFollowing(nick){ return following.includes(nick); }
  function toggleFollow(nick){ if (nick==='Me') return; if (isFollowing(nick)) { following = following.filter(n=>n!==nick); } else { following.push(nick); } saveFollowing(following); addActivity('pref', isFollowing(nick)?'팔로우':'언팔로우', nick); renderFeed(); }
  let feedFilter = 'all';
  function formatAgo(ts) { const diff = Date.now() - ts; const m = Math.round(diff/60000); if (m < 1) return '방금'; if (m < 60) return m+'분 전'; const h = Math.round(m/60); if (h < 24) return h+'시간 전'; const d = Math.round(h/24); return d+'일 전'; }
  function moodClass(mood) {
    const m = (mood||'').toLowerCase();
    if (['chill','focus','energetic','happy','sad','angry','neutral'].includes(m)) return 'mood-'+m;
    return 'mood-neutral';
  }
  function renderFeed() {
    if (!feedGrid) return;
    feedGrid.innerHTML = '';
    const filtered = feedData.filter(item => {
      if (feedFilter === 'all') return true;
      if (feedFilter === 'mine') return item.mine;
      if (feedFilter === 'follow') return isFollowing(item.nick);
      if (feedFilter === 'trend') return item.likes >= 10;
      return true;
    });
    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'feed-card '+moodClass(item.mood);
      card.dataset.id = item.id;
      const followBtn = item.mine ? '' : `<button class="act-btn" data-act="follow">${isFollowing(item.nick)?'언팔로우':'팔로우'}</button>`;
      const tracks = item.trackList ? item.trackList.slice(0,3) : [item.track,'Sample A','Sample B'];
      const moreCount = item.trackList && item.trackList.length>3 ? item.trackList.length-3 : 0;
      card.innerHTML = `
        <div class="mood-badge">#${item.mood}</div>
        <div class="row-head"><div class="avatar">${item.nick[0]}</div><div class="nick">${item.nick}</div><div class="time">${formatAgo(item.ts)}</div>${followBtn}</div>
        <div class="comment">${item.comment}</div>
        <div class="track-mini" data-expanded="false" data-id="${item.id}">
          ${tracks.map(t=>`<div class="t-name">${t}</div>`).join('')}
          ${moreCount?`<div class="t-more">+${moreCount} more</div>`:''}
        </div>
        <div class="action-bar">
          <button class="act-btn" data-act="like">♡ <span class="count">${item.likes}</span></button>
          <button class="act-btn" data-act="comment">💬 <span class="count">${item.comments}</span></button>
          <button class="act-btn ${item.bookmarked?'active':''}" data-act="bookmark">🔖 <span class="count">${item.bookmarked?1:0}</span></button>
          <button class="act-btn" data-act="share">⤴ 공유</button>
        </div>
        <div class="comments-wrapper" id="comments-${item.id}"></div>`;
      feedGrid.appendChild(card);
    });
  }
  renderFeed();
  feedFilterChips && feedFilterChips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip'); if (!chip) return;
    feedFilterChips.querySelectorAll('.chip').forEach(c=>c.classList.remove('active')); chip.classList.add('active');
    feedFilter = chip.getAttribute('data-filter'); renderFeed();
  });
  feedGrid && feedGrid.addEventListener('click', (e) => {
    const actBtn = e.target.closest('.act-btn');
    const card = e.target.closest('.feed-card'); if (!card) return;
    const id = Number(card.dataset.id); const item = feedData.find(f=>f.id===id); if (!item) return;
    if (actBtn) {
      const act = actBtn.getAttribute('data-act');
      if (act === 'like') { item.likes += 1; addActivity('pref', '피드 좋아요', item.mood); }
      else if (act === 'bookmark') { item.bookmarked = !item.bookmarked; addActivity('pref', '북마크 변경', item.mood); }
      else if (act === 'share') { const url = location.origin + location.pathname + '?card='+id; navigator.clipboard && navigator.clipboard.writeText(url); alert('공유 링크가 복사되었습니다.'); item.lastShared = Date.now(); addActivity('pref','공유 링크 복사', item.mood); }
      else if (act === 'comment') { toggleComments(item); }
      else if (act === 'follow') { toggleFollow(item.nick); }
      renderFeed();
      saveFeed();
      return;
    }
    openPlaylistDetail(item);
  });
  // Track expansion
  feedGrid && feedGrid.addEventListener('click', (e) => {
    const mini = e.target.closest('.track-mini'); if (!mini) return;
    const tid = Number(mini.getAttribute('data-id'));
    const feedItem = feedData.find(f=>f.id===tid); if (!feedItem || !feedItem.trackList || feedItem.trackList.length<=3) return;
    const expanded = mini.getAttribute('data-expanded') === 'true';
    if (!expanded) {
      mini.setAttribute('data-expanded','true');
      mini.innerHTML = feedItem.trackList.map(t=>`<div class="t-name">${t}</div>`).join('') + `<div class="t-more" style="opacity:.6;font-size:11px;">(접기)</div>`;
    } else {
      mini.setAttribute('data-expanded','false');
      const tracks = feedItem.trackList.slice(0,3); const moreCount = feedItem.trackList.length-3;
      mini.innerHTML = tracks.map(t=>`<div class="t-name">${t}</div>`).join('') + (moreCount?`<div class="t-more">+${moreCount} more</div>`:'');
    }
  });

  // Share Creator interactions
  let shareMood = null;
  function updateSharePreview() {
    const user = getUser();
    previewNick && (previewNick.textContent = (user && (user.name || user.email)) || 'User');
    previewTime && (previewTime.textContent = new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}));
    previewMood && (previewMood.textContent = shareMood ? '#'+shareMood : '#Mood');
    previewComment && (previewComment.textContent = moodComment.value.trim() || '코멘트를 입력하세요.');
    previewTrack && (previewTrack.textContent = currentTrackInput.value.trim() || '트랙 정보 없음');
    shareSubmitBtn.disabled = !shareMood || !moodComment.value.trim();
  }
  moodButtonsWrap && moodButtonsWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.mood-btn'); if (!btn) return;
    moodButtonsWrap.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); shareMood = btn.getAttribute('data-mood'); updateSharePreview();
  });
  moodComment && moodComment.addEventListener('input', updateSharePreview);
  currentTrackInput && currentTrackInput.addEventListener('input', updateSharePreview);
  shareSubmitBtn && shareSubmitBtn.addEventListener('click', () => {
    if (!shareMood || !moodComment.value.trim()) return;
    const newItem = { id: Date.now(), nick: (getUser()?.name || 'Me'), mood: shareMood, comment: moodComment.value.trim(), track: currentTrackInput.value.trim() || 'Unknown', ts: Date.now(), mine: true, likes: 0, bookmarked: false, comments: 0, trackList:[currentTrackInput.value.trim()||'Unknown','Alt Mix','Deep Layer','Hidden Jam','Extra Loop'] };
    feedData.unshift(newItem); saveFeed();
    // Log activity
    addActivity('mood', `무드 공유: ${shareMood}`, moodComment.value.trim());
    moodComment.value=''; currentTrackInput.value=''; shareMood=null; moodButtonsWrap.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('active')); updateSharePreview(); renderFeed(); switchFrame('feed');
  });
  updateSharePreview();

  // Playlist detail view (simple modal reuse)
  let playlistDetailModal = document.getElementById('playlist-detail-modal');
  if (!playlistDetailModal) {
    playlistDetailModal = document.createElement('div');
    playlistDetailModal.id = 'playlist-detail-modal';
    playlistDetailModal.className = 'modal';
    playlistDetailModal.innerHTML = `<div class="activity-modal-card card" role="document"><div class="auth-head"><div><div class="auth-title">공유 상세</div><div class="auth-sub">무드 & 플레이리스트</div></div><button class="icon-btn" id="playlist-detail-close">✕</button></div><div class="activity-body" id="playlist-detail-body"></div></div>`;
    document.body.appendChild(playlistDetailModal);
    playlistDetailModal.addEventListener('click', (e)=>{ if (e.target===playlistDetailModal) closeModal(playlistDetailModal); });
    playlistDetailModal.querySelector('#playlist-detail-close').addEventListener('click', ()=>closeModal(playlistDetailModal));
  }
  const playlistDetailBody = document.getElementById('playlist-detail-body');
  function openPlaylistDetail(item) {
    if (!playlistDetailBody || !item) return;
    playlistDetailBody.innerHTML = `
      <div class="detail-row"><span class="badge">#${item.mood}</span><span class="time muted">${formatDate(item.ts)}</span></div>
      <div><strong>${item.comment}</strong></div>
      <div class="muted">재생 정보: ${item.track}</div>
      <div class="muted">좋아요 ${item.likes} · 댓글 ${item.comments}</div>
      <div class="row"><button class="btn btn-primary-glow" id="detail-share-btn">친구에게 공유</button></div>
      <div class="mini-list muted" style="font-size:12px;">(데모) 트랙 리스트 샘플:<br/>1. Sample Track A<br/>2. Sample Track B<br/>3. Sample Track C</div>`;
    openModal(playlistDetailModal);
    const shareBtn = document.getElementById('detail-share-btn');
    shareBtn && shareBtn.addEventListener('click', () => { navigator.clipboard && navigator.clipboard.writeText('https://example.com/feed/'+item.id); alert('상세 공유 링크 복사됨'); });
  }

  // Theme settings
  let selectedTheme = null;
  themeGrid && themeGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.theme-card'); if (!card) return;
    themeGrid.querySelectorAll('.theme-card').forEach(c=>c.classList.remove('active'));
    card.classList.add('active'); selectedTheme = card.getAttribute('data-theme'); applyThemeBtn.disabled = !selectedTheme;
  });
  function applyTheme(name) {
    // Basic theme variable overrides; extend as needed
    const root = document.documentElement;
    switch (name) {
      case 'lightPastel':
        root.style.setProperty('--bg','#f5f7fa'); root.style.setProperty('--panel','#ffffff'); root.style.setProperty('--text','#1a1f29'); root.style.setProperty('--muted','#4b5563'); break;
      case 'neonRetro':
        root.style.setProperty('--bg','#090b15'); root.style.setProperty('--panel','#161b2e'); root.style.setProperty('--text','#f1f5f9'); root.style.setProperty('--muted','#94a3b8'); break;
      case 'minimalBlack':
        root.style.setProperty('--bg','#0d0d0d'); root.style.setProperty('--panel','#161616'); root.style.setProperty('--text','#e5e5e5'); root.style.setProperty('--muted','#7a7f85'); break;
      case 'darkNeon':
      default:
        root.style.setProperty('--bg','#0b0d12'); root.style.setProperty('--panel','#141823'); root.style.setProperty('--text','#e9eef7'); root.style.setProperty('--muted','#a7b0c0'); break;
    }
    // Gradient sync
    if (name === 'lightPastel') {
      root.style.setProperty('--gradient-chill','linear-gradient(140deg,#e0f7ff,#d4eff9,#cbe7f3)');
      root.style.setProperty('--gradient-focus','linear-gradient(140deg,#ffe7f1,#ffd1e4,#fbb8d6)');
    } else if (name === 'neonRetro') {
      root.style.setProperty('--gradient-chill','linear-gradient(140deg,#051b2b,#042f47,#085372)');
      root.style.setProperty('--gradient-focus','linear-gradient(140deg,#170b3a,#2a1160,#3b1985)');
    } else if (name === 'minimalBlack') {
      root.style.setProperty('--gradient-chill','linear-gradient(140deg,#121212,#1e1e1e,#262626)');
      root.style.setProperty('--gradient-focus','linear-gradient(140deg,#181818,#222222,#2e2e2e)');
    } else {
      root.style.setProperty('--gradient-chill','linear-gradient(140deg,#0f2d3d,#074c66,#116b8c)');
      root.style.setProperty('--gradient-focus','linear-gradient(140deg,#2b1e5b,#3b2f6d,#513d86)');
    }
    localStorage.setItem('app.theme', name);
  }
  applyThemeBtn && applyThemeBtn.addEventListener('click', () => { if (!selectedTheme) return; applyTheme(selectedTheme); alert('테마가 적용되었습니다.'); });
  openThemeSettingsBtn && openThemeSettingsBtn.addEventListener('click', () => { switchFrame('theme'); });
  (function initTheme(){ const saved = localStorage.getItem('app.theme'); if (saved) applyTheme(saved); })();

  // Notifications demo
  function getDemoNotifications() {
    return [
      { id: 'n1', text: 'Nova님이 당신의 무드 카드에 좋아요를 눌렀습니다.', icon:'♡', ts: Date.now()-300000, unread:true },
      { id: 'n2', text: '새 댓글이 달렸어요.', icon:'💬', ts: Date.now()-720000, unread:true },
      { id: 'n3', text: '팔로우한 Luna님이 새로운 플레이리스트를 공유했습니다.', icon:'🎵', ts: Date.now()-3600000, unread:false }
    ];
  }
  let notifications = getDemoNotifications();
  function renderNotifications() {
    if (!notifList) return; notifList.innerHTML='';
    let unread = 0;
    notifications.forEach(n => {
      const li = document.createElement('li'); li.className = 'notif-item '+(n.unread?'unread':'');
      li.dataset.id = n.id;
      li.innerHTML = `<div class="n-icon">${n.icon}</div><div class="n-text">${n.text}</div><div class="n-time">${formatAgo(n.ts)}</div>`;
      if (n.unread) unread++; notifList.appendChild(li);
    });
    if (notifBadge) {
      if (unread > 0) { notifBadge.style.display=''; notifBadge.textContent = unread; } else { notifBadge.style.display='none'; }
    }
  }

  // ===== Comments System =====
  function ensureCommentsArray(item){ if (!item.commentsList) item.commentsList = []; }
  function toggleComments(item){ ensureCommentsArray(item); const wrap = document.getElementById('comments-'+item.id); if (!wrap) return; const open = wrap.classList.toggle('open'); if (open) renderComments(item); }
  function renderComments(item){ const wrap = document.getElementById('comments-'+item.id); if (!wrap) return; ensureCommentsArray(item); wrap.innerHTML = '';
    item.commentsList.forEach(c => { const ci = document.createElement('div'); ci.className='comment-item'; ci.innerHTML=`<div class="c-avatar">${c.user[0]}</div><div class="c-text"><strong>${c.user}</strong> ${c.text}</div>`; wrap.appendChild(ci); });
    const form = document.createElement('div'); form.className='comment-form'; form.innerHTML = `<input type="text" placeholder="댓글 남기기" aria-label="댓글 입력" /><button type="button">등록</button>`; const input = form.querySelector('input'); const btn = form.querySelector('button'); btn.addEventListener('click',()=>{ const val=input.value.trim(); if(!val) return; item.commentsList.push({ user: (getUser()?.name || 'Me'), text: val }); item.comments = item.commentsList.length; input.value=''; saveFeed(); renderComments(item); addActivity('pref','댓글 추가', item.mood); }); wrap.appendChild(form); }

  // ===== Starfield Background =====
  (function initStarfield(){ const canvas = document.getElementById('starfield'); if(!canvas) return; const ctx = canvas.getContext('2d'); let w=canvas.width=window.innerWidth; let h=canvas.height=window.innerHeight; const stars = Array.from({length:160},()=>({ x: Math.random()*w, y: Math.random()*h, z: Math.random()*1, r: Math.random()*1.4+0.2 })); function draw(){ ctx.clearRect(0,0,w,h); stars.forEach(s=>{ s.y += (0.15 + s.z*0.6); if (s.y>h) { s.y=0; s.x=Math.random()*w; } ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle='rgba(78,224,255,'+(0.25+s.z*0.5)+')'; ctx.fill(); }); requestAnimationFrame(draw); } window.addEventListener('resize',()=>{ w=canvas.width=window.innerWidth; h=canvas.height=window.innerHeight; }); draw(); })();
  renderNotifications();
  notifList && notifList.addEventListener('click', (e) => {
    const item = e.target.closest('.notif-item'); if (!item) return; const id = item.dataset.id; const n = notifications.find(x=>x.id===id); if (n) { n.unread=false; renderNotifications(); }
  });
  floatingNotifBtn && floatingNotifBtn.addEventListener('click', () => { switchFrame('notifications'); });
})();
