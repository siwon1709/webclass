// AI Mood Player - Frontend Only
// - Emotion Detection via Face++ (optional)
// - Spotify via Embed (default) + optional OAuth for device playback

(function () {
  const $ = (sel) => document.querySelector(sel);

  // Elements
  const logoutBtn = document.getElementById('logout-btn');
  const profileBtn = document.getElementById('profile-btn');
  const notificationsBtn = document.getElementById('notifications-btn');
  const notifBadge = document.getElementById('notif-badge');
  const notifDropdown = document.getElementById('notifications-dropdown');
  const notifList = document.getElementById('notif-list');
  const clearNotifsBtn = document.getElementById('clear-notifs');
  const toastContainer = document.getElementById('toast-container');

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
  const likeBtn = document.getElementById('like-btn');
  const skipBtn = $('#skip');
  const resetLearningBtn = $('#reset-learning');

  // Dropzone
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

  // Profile modal elements
  const profileModal = document.getElementById('profile-modal');
  const profileClose = document.getElementById('profile-close');
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profileTabPlayed = document.getElementById('profile-tab-played');
  const profileTabLiked = document.getElementById('profile-tab-liked');
  const profilePlayedList = document.getElementById('profile-played-list');
  const profileLikedList = document.getElementById('profile-liked-list');

  // State
  let currentPlaylistId = null;
  let currentMood = null;
  let currentUser = null;
  let notifications = [];
  let playedTracks = [];
  let likedTracks = [];

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

  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    surprise: '😲',
    neutral: '😐',
    disgust: '🤢',
    fear: '😨',
    tired: '😴',
    chill: '😌'
  };

  const moodLabels = {
    happy: '행복',
    sad: '슬픔',
    angry: '분노',
    surprise: '놀람',
    neutral: '평온',
    disgust: '혐오',
    fear: '두려움',
    tired: '피곤',
    chill: '차분'
  };

  // Utilities
  function setStatus(msg) {
    statusEl.textContent = msg || '';
  }

  function loadSettings() {
    try {
      // Load user session
      const savedUser = localStorage.getItem('demo.user');
      if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
      }
      
      // Load notifications
      const savedNotifs = localStorage.getItem('notifications');
      if (savedNotifs) {
        notifications = JSON.parse(savedNotifs);
        updateNotificationBadge();
      }
      
      // Load played tracks
      const savedPlayed = localStorage.getItem('playedTracks');
      if (savedPlayed) playedTracks = JSON.parse(savedPlayed);
      
      // Load liked tracks
      const savedLiked = localStorage.getItem('likedTracks');
      if (savedLiked) likedTracks = JSON.parse(savedLiked);
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
  }

  function updateAuthUI() {
    const authOpenBtn = document.getElementById('auth-open');
    if (currentUser) {
      // User is logged in
      authOpenBtn.classList.add('hidden');
      if (logoutBtn) logoutBtn.classList.remove('hidden');
      if (profileBtn) profileBtn.classList.remove('hidden');
    } else {
      // User is logged out
      authOpenBtn.classList.remove('hidden');
      if (logoutBtn) logoutBtn.classList.add('hidden');
      if (profileBtn) profileBtn.classList.add('hidden');
    }
  }

  function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icons = { like: '❤️', analysis: '🎭', info: 'ℹ️' };
    const icon = icons[type] || 'ℹ️';
    
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="닫기">✕</button>
    `;
    
    toastContainer.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    const removeToast = () => {
      toast.classList.add('hiding');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    };
    
    closeBtn.addEventListener('click', removeToast);
    
    // 5초 후 자동 제거
    setTimeout(removeToast, 5000);
  }

  function addNotification(type, message) {
    const notif = {
      id: Date.now(),
      type,
      message,
      time: new Date().toISOString(),
      unread: true
    };
    notifications.unshift(notif);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationBadge();
    renderNotifications();
    
    // 토스트 메시지 표시
    showToast(type, message);
  }

  function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => n.unread).length;
    if (notifBadge) {
      if (unreadCount > 0) {
        notifBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        notifBadge.classList.remove('hidden');
      } else {
        notifBadge.classList.add('hidden');
      }
    }
  }

  function renderNotifications() {
    if (!notifList) return;
    if (notifications.length === 0) {
      notifList.innerHTML = '<p class="muted" style="padding: 12px; text-align: center;">새 알림이 없습니다.</p>';
      return;
    }
    
    const icons = { like: '❤️', analysis: '🎭', info: 'ℹ️' };
    notifList.innerHTML = notifications.map(n => {
      const icon = icons[n.type] || 'ℹ️';
      const time = formatTimeAgo(new Date(n.time));
      const unreadClass = n.unread ? 'unread' : '';
      return `
        <div class="notif-item ${unreadClass}" data-id="${n.id}">
          <div class="notif-icon">${icon}</div>
          <div class="notif-content">
            <div class="notif-text">${n.message}</div>
            <div class="notif-time">${time}</div>
          </div>
        </div>
      `;
    }).join('');
    
    // Mark as read on click
    notifList.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.getAttribute('data-id'));
        const notif = notifications.find(n => n.id === id);
        if (notif) {
          notif.unread = false;
          localStorage.setItem('notifications', JSON.stringify(notifications));
          updateNotificationBadge();
          renderNotifications();
        }
      });
    });
  }

  function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return '방금 전';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  }

  function addPlayedTrack(mood, playlistId) {
    const track = {
      id: Date.now(),
      mood,
      playlistId,
      time: new Date().toISOString()
    };
    playedTracks.unshift(track);
    if (playedTracks.length > 50) playedTracks = playedTracks.slice(0, 50); // Keep last 50
    localStorage.setItem('playedTracks', JSON.stringify(playedTracks));
  }

  function addLikedTrack(mood, playlistId) {
    const track = {
      id: Date.now(),
      mood,
      playlistId,
      title: `${mood} 플레이리스트`,
      time: new Date().toISOString()
    };
    
    // 중복 체크 (같은 플레이리스트를 이미 좋아요 했는지)
    const alreadyLiked = likedTracks.some(t => t.playlistId === playlistId);
    if (alreadyLiked) {
      showToast('info', '이미 좋아요를 누른 플레이리스트입니다.');
      return false;
    }
    
    likedTracks.unshift(track);
    if (likedTracks.length > 50) likedTracks = likedTracks.slice(0, 50);
    localStorage.setItem('likedTracks', JSON.stringify(likedTracks));
    
    // 알림 추가
    if (currentUser) {
      addNotification('like', `${mood} 무드 플레이리스트를 좋아요 했습니다!`);
    }
    
    return true;
  }

  function analyzeMoodStats() {
    const allTracks = [...playedTracks, ...likedTracks];
    
    if (allTracks.length === 0) {
      return null;
    }
    
    // Count moods
    const moodCount = {};
    allTracks.forEach(track => {
      const mood = track.mood;
      if (mood) {
        moodCount[mood] = (moodCount[mood] || 0) + 1;
      }
    });
    
    // Sort by count and get top 3
    const sortedMoods = Object.entries(moodCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    const total = allTracks.length;
    
    return sortedMoods.map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  }

  function renderMoodStats() {
    const moodStatsEl = document.getElementById('mood-stats');
    if (!moodStatsEl) return;
    
    const stats = analyzeMoodStats();
    
    if (!stats) {
      moodStatsEl.innerHTML = '<p class="muted">분석할 데이터가 없습니다. 음악을 재생하거나 좋아요를 눌러보세요!</p>';
      return;
    }
    
    moodStatsEl.innerHTML = stats.map(stat => {
      const emoji = moodEmojis[stat.mood] || '🎵';
      const label = moodLabels[stat.mood] || stat.mood;
      
      return `
        <div class="mood-stat-item">
          <div class="mood-stat-emoji">${emoji}</div>
          <div class="mood-stat-info">
            <div class="mood-stat-label">${label}</div>
            <div class="mood-stat-bar-container">
              <div class="mood-stat-bar" style="width: ${stat.percentage}%"></div>
            </div>
          </div>
          <div class="mood-stat-percentage">${stat.percentage}%</div>
        </div>
      `;
    }).join('');
  }

  function renderProfilePlayed() {
    if (!profilePlayedList) return;
    if (playedTracks.length === 0) {
      profilePlayedList.innerHTML = '<p class="muted">재생 기록이 없습니다.</p>';
      return;
    }
    
    profilePlayedList.innerHTML = playedTracks.map(t => {
      const time = formatTimeAgo(new Date(t.time));
      return `
        <div class="profile-item">
          <div class="profile-item-icon">🎵</div>
          <div class="profile-item-details">
            <div class="profile-item-title">무드: ${t.mood}</div>
            <div class="profile-item-time">${time}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderProfileLiked() {
    if (!profileLikedList) return;
    if (likedTracks.length === 0) {
      profileLikedList.innerHTML = '<p class="muted">좋아요 누른 곡이 없습니다.</p>';
      return;
    }
    
    profileLikedList.innerHTML = likedTracks.map(t => {
      const time = formatTimeAgo(new Date(t.time));
      return `
        <div class="profile-item">
          <div class="profile-item-icon">❤️</div>
          <div class="profile-item-details">
            <div class="profile-item-title">${t.title || '플레이리스트'}</div>
            <div class="profile-item-time">${time}</div>
          </div>
        </div>
        <div class="profile-embed">
          <iframe 
            style="border-radius: 12px;" 
            src="https://open.spotify.com/embed/playlist/${t.playlistId}?utm_source=generator" 
            width="100%" 
            height="152" 
            frameBorder="0" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy">
          </iframe>
        </div>
      `;
    }).join('');
  }

  function logout() {
    currentUser = null;
    localStorage.removeItem('demo.user');
    updateAuthUI();
    alert('로그아웃 성공');
    closeModal(authModal);
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
    const mood = prompt(`테스트 모드: 무드를 선택해 입력하세요\n${options.join(', ')}`, 'happy');
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
      
      // Add notification for completed analysis
      if (currentUser) {
        addNotification('analysis', `감정 분석 완료: ${result.emotion} (${result.mood})`);
      }
      
      // Track played
      if (currentPlaylistId) {
        addPlayedTrack(result.mood, currentPlaylistId);
      }
    } catch (err) {
      console.error(err);
      setStatus(`에러: ${err.message}`);
    }
  }

  function onLike() {
    if (!currentPlaylistId || !currentMood) {
      alert('먼저 음악을 추천받아주세요.');
      return;
    }
    
    if (!currentUser) {
      alert('로그인이 필요한 기능입니다.');
      openModal(authModal);
      switchAuth('login');
      return;
    }
    
    const success = addLikedTrack(currentMood, currentPlaylistId);
    if (success) {
      record('like', currentPlaylistId);
      setStatus('좋아요! 취향을 학습했습니다.');
      
      // 버튼 애니메이션
      if (likeBtn) {
        likeBtn.classList.add('liked');
        setTimeout(() => likeBtn.classList.remove('liked'), 300);
      }
    }
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
  if (likeBtn) likeBtn.addEventListener('click', onLike);
  skipBtn && skipBtn.addEventListener('click', () => { if (currentMood) { record('skip', currentPlaylistId); setEmbedByMood(currentMood); setStatus('다른 추천을 표시했습니다.'); } });
  resetLearningBtn && resetLearningBtn.addEventListener('click', () => { localStorage.removeItem('prefs'); setStatus('학습 데이터가 초기화되었습니다.'); });

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
    currentUser = user;
    localStorage.setItem('demo.user', JSON.stringify(user));
    updateAuthUI();
    alert('회원가입이 완료되었습니다. 환영합니다!');
    closeModal(authModal);
  });
  if (loginForm) loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (loginEmail && loginEmail.value.trim()) || '';
    const pass = (loginPass && loginPass.value) || '';
    if (!email || !pass) { alert('이메일과 비밀번호를 입력해 주세요.'); return; }
    // Demo: store minimal session flag
    currentUser = { email };
    localStorage.setItem('demo.user', JSON.stringify({ email }));
    updateAuthUI();
    alert('로그인되었습니다.');
    closeModal(authModal);
  });

  // Terms modal
  const termsMap = {
    tos: `
      <h3>서비스 이용약관</h3>
      <div style="max-height: 60vh; overflow-y: auto; padding-right: 8px;">
        <h4>제1조 목적</h4>
        <p class="muted">본 약관은 우리(이하 "회사")가 제공하는 얼굴 분석 기반 음악 추천 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
        
        <h4>제2조 정의</h4>
        <p class="muted">"서비스"란 이용자가 사진을 업로드하거나 카메라를 통해 얼굴을 인식하여 감정을 분석하고, 이에 맞는 음악을 추천하는 기능을 말합니다.</p>
        <p class="muted">"이용자"란 본 약관에 따라 서비스를 이용하는 모든 개인을 의미합니다.</p>
        
        <h4>제3조 약관의 효력 및 변경</h4>
        <p class="muted">본 약관은 서비스 화면에 게시하거나 기타 방법으로 공지함으로써 효력이 발생합니다.</p>
        <p class="muted">회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경된 약관은 공지 후 효력이 발생합니다.</p>
        
        <h4>제4조 서비스 이용</h4>
        <p class="muted">이용자는 본 약관에 동의한 후 서비스를 이용할 수 있습니다.</p>
        <p class="muted">서비스는 얼굴 인식 및 감정 분석 기술을 활용하여 음악을 추천하며, 추천 결과는 참고용일 뿐 절대적인 판단 기준이 아닙니다.</p>
        
        <h4>제5조 개인정보 보호</h4>
        <p class="muted">회사는 서비스 제공을 위해 필요한 최소한의 개인정보(예: 얼굴 이미지, 분석 결과)를 수집·처리할 수 있습니다.</p>
        <p class="muted">수집된 개인정보는 서비스 제공 목적 외에는 사용되지 않으며, 관련 법령 및 개인정보처리방침에 따라 관리됩니다.</p>
        <p class="muted">이용자는 언제든지 개인정보 열람, 수정, 삭제를 요청할 수 있습니다.</p>
        
        <h4>제6조 이용자의 의무</h4>
        <p class="muted">이용자는 타인의 얼굴 사진을 무단으로 업로드하거나 권리를 침해하는 행위를 해서는 안 됩니다.</p>
        <p class="muted">서비스 이용 과정에서 불법적이거나 부적절한 콘텐츠를 업로드해서는 안 됩니다.</p>
        
        <h4>제7조 회사의 의무</h4>
        <p class="muted">회사는 안정적인 서비스 제공을 위해 최선을 다합니다.</p>
        <p class="muted">회사는 이용자의 개인정보를 보호하기 위해 관련 법령을 준수합니다.</p>
        
        <h4>제8조 책임 제한</h4>
        <p class="muted">서비스에서 제공하는 음악 추천은 분석 알고리즘에 따른 결과로, 절대적인 정확성을 보장하지 않습니다.</p>
        <p class="muted">회사는 이용자가 서비스 이용 과정에서 발생한 손해에 대해 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.</p>
        
        <h4>제9조 준거법 및 관할</h4>
        <p class="muted">본 약관은 대한민국 법령에 따라 해석됩니다.</p>
        <p class="muted">서비스와 관련하여 발생하는 분쟁은 회사의 본사 소재지를 관할하는 법원을 제1심 법원으로 합니다.</p>
      </div>
    `,
    privacy: `
      <h3>개인정보 수집/이용</h3>
      <div style="max-height: 60vh; overflow-y: auto; padding-right: 8px;">
        <h4>제1조 수집하는 개인정보 항목</h4>
        <p class="muted">회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
        <p class="muted">• 필수 항목: 얼굴 사진(이미지 데이터), 감정 분석 결과</p>
        <p class="muted">• 선택 항목: 이메일 주소, 닉네임, 음악 선호도</p>
        
        <h4>제2조 개인정보의 수집·이용 목적</h4>
        <p class="muted">회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다.</p>
        <p class="muted">• 얼굴 사진을 기반으로 감정을 분석하여 맞춤형 음악 추천 제공</p>
        <p class="muted">• 서비스 품질 개선 및 알고리즘 고도화</p>
        <p class="muted">• 고객 문의 응대 및 서비스 관련 공지 전달</p>
        
        <h4>제3조 개인정보의 보유 및 이용 기간</h4>
        <p class="muted">• 얼굴 사진 및 분석 데이터: 서비스 제공 후 즉시 삭제하거나, 익명화하여 통계·연구 목적으로만 활용</p>
        <p class="muted">• 기타 개인정보: 회원 탈퇴 시까지 보관 후 지체 없이 파기</p>
        
        <h4>제4조 개인정보 제3자 제공</h4>
        <p class="muted">회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 따라 요구되는 경우에 한해 제공할 수 있습니다.</p>
        
        <h4>제5조 개인정보 처리 위탁</h4>
        <p class="muted">회사는 서비스 운영을 위해 필요한 경우 일부 업무를 외부 업체에 위탁할 수 있으며, 이 경우 개인정보 보호 관련 법령을 준수합니다.</p>
        
        <h4>제6조 이용자의 권리</h4>
        <p class="muted">• 이용자는 언제든지 자신의 개인정보 열람, 수정, 삭제를 요청할 수 있습니다.</p>
        <p class="muted">• 얼굴 사진 제공은 서비스 이용을 위한 필수 항목이며, 동의하지 않을 경우 서비스 이용이 제한될 수 있습니다.</p>
        
        <h4>제7조 동의 내용 (얼굴 사진 수집 관련)</h4>
        <p class="muted">• 본인은 회사가 얼굴 사진을 수집·분석하여 감정 상태를 파악하고, 이를 기반으로 음악을 추천하는 서비스 제공에 동의합니다.</p>
        <p class="muted">• 얼굴 사진은 서비스 제공 목적 외에는 사용되지 않습니다.</p>
        <p class="muted">• 얼굴 사진은 분석 완료 후 즉시 삭제되거나 익명화 처리됩니다.</p>
      </div>
    `,
    marketing: '<h3>마케팅 정보 수신 동의</h3><p class="muted">체크를 하시면 당신의 휴대폰에 광고 문자가 갈것입니다. 당신의 개인정보는 저희가 잘 써서 버려드리겠습니다 ^^7 .</p>'
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

  // Logout button
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Profile button and modal
  if (profileBtn) profileBtn.addEventListener('click', () => {
    if (currentUser) {
      if (profileName) profileName.textContent = currentUser.name || currentUser.email || '사용자';
      if (profileEmail) profileEmail.textContent = currentUser.email || '';
      renderMoodStats();
      renderProfilePlayed();
      renderProfileLiked();
      openModal(profileModal);
    }
  });
  if (profileClose) profileClose.addEventListener('click', () => closeModal(profileModal));
  if (profileModal) profileModal.addEventListener('click', (e) => { if (e.target === profileModal) closeModal(profileModal); });
  if (profileTabPlayed) profileTabPlayed.addEventListener('click', () => {
    profileTabPlayed.classList.add('active');
    profileTabLiked.classList.remove('active');
    profilePlayedList.classList.remove('hidden');
    profileLikedList.classList.add('hidden');
  });
  if (profileTabLiked) profileTabLiked.addEventListener('click', () => {
    profileTabLiked.classList.add('active');
    profileTabPlayed.classList.remove('active');
    profileLikedList.classList.remove('hidden');
    profilePlayedList.classList.add('hidden');
  });

  // Notifications button and dropdown
  if (notificationsBtn) notificationsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifDropdown.classList.toggle('hidden');
    renderNotifications();
  });
  if (clearNotifsBtn) clearNotifsBtn.addEventListener('click', () => {
    notifications = [];
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationBadge();
    renderNotifications();
  });
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (notifDropdown && !notifDropdown.classList.contains('hidden') && !notificationsBtn.contains(e.target)) {
      notifDropdown.classList.add('hidden');
    }
  });

  // Hero CTA 버튼 이벤트
  const ctaUploadBtn = document.getElementById('cta-upload');
  if (ctaUploadBtn) {
    ctaUploadBtn.addEventListener('click', () => {
      const imageInput = document.getElementById('image-input');
      if (imageInput) {
        imageInput.click();
      }
    });
  }
})();
