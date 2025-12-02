// Mobile Menu Handler
(function() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');
  
  // Mobile auth buttons
  const mobileAuth = document.getElementById('mobile-auth');
  const mobileProfile = document.getElementById('mobile-profile');
  const mobileLogout = document.getElementById('mobile-logout');
  const mobileCommunity = document.getElementById('mobile-community');
  
  // Original buttons
  const authOpen = document.getElementById('auth-open');
  const profileBtn = document.getElementById('profile-btn');
  const logoutBtn = document.getElementById('logout-btn');
  
  // Open mobile menu
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  }
  
  // Close mobile menu
  function closeMobileMenu() {
    mobileMenu.classList.add('hidden');
    document.body.style.overflow = '';
  }
  
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }
  
  // Close menu when clicking menu items
  mobileMenuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (item.getAttribute('href').startsWith('#')) {
        setTimeout(closeMobileMenu, 300);
      }
    });
  });
  
  // Close menu when clicking outside
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
      closeMobileMenu();
    }
  });
  
  // Sync mobile auth buttons with main buttons
  if (mobileAuth && authOpen) {
    mobileAuth.addEventListener('click', () => {
      authOpen.click();
      closeMobileMenu();
    });
  }
  
  if (mobileProfile && profileBtn) {
    mobileProfile.addEventListener('click', () => {
      profileBtn.click();
      closeMobileMenu();
    });
  }
  
  if (mobileLogout && logoutBtn) {
    mobileLogout.addEventListener('click', () => {
      logoutBtn.click();
      closeMobileMenu();
    });
  }
  
  if (mobileCommunity) {
    mobileCommunity.addEventListener('click', (e) => {
      e.preventDefault();
      // Community button logic (if exists)
      const communityBtn = document.querySelector('[data-page="community"]');
      if (communityBtn) {
        communityBtn.click();
      }
      closeMobileMenu();
    });
  }
  
  // Sync button visibility
  function syncMobileButtons() {
    const isLoggedIn = !authOpen.classList.contains('hidden');
    const isProfileVisible = !profileBtn.classList.contains('hidden');
    
    if (mobileAuth) {
      mobileAuth.classList.toggle('hidden', !isLoggedIn);
    }
    if (mobileProfile) {
      mobileProfile.classList.toggle('hidden', !isProfileVisible);
    }
    if (mobileLogout) {
      mobileLogout.classList.toggle('hidden', !isProfileVisible);
    }
  }
  
  // Watch for button visibility changes
  const observer = new MutationObserver(syncMobileButtons);
  
  [authOpen, profileBtn, logoutBtn].forEach(btn => {
    if (btn) {
      observer.observe(btn, { attributes: true, attributeFilter: ['class'] });
    }
  });
  
  // Initial sync
  syncMobileButtons();
  
  // Handle orientation change
  window.addEventListener('orientationchange', () => {
    closeMobileMenu();
  });
  
  // Handle resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768 && !mobileMenu.classList.contains('hidden')) {
        closeMobileMenu();
      }
    }, 250);
  });
})();
