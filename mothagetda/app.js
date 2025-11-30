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
  if (authOpenBtn) authOpenBtn.addEventListener('click', () => { openModal(authModal); switchAuth('login'); });
  if (authCloseBtn) authCloseBtn.addEventListener('click', () => closeModal(authModal));
  if (authModal) authModal.addEventListener('click', (e) => { if (e.target === authModal) closeModal(authModal); });
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
    const user = { name: suName.value.trim(), email: suEmail.value.trim() };
    localStorage.setItem('demo.user', JSON.stringify(user));
    alert('회원가입이 완료되었습니다. 환영합니다!');
    closeModal(authModal);
  });
  if (loginForm) loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (loginEmail && loginEmail.value.trim()) || '';
    const pass = (loginPass && loginPass.value) || '';
    if (!email || !pass) { alert('이메일과 비밀번호를 입력해 주세요.'); return; }
    // Demo: store minimal session flag
    localStorage.setItem('demo.user', JSON.stringify({ email }));
    alert('로그인되었습니다.');
    closeModal(authModal);
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
})();
