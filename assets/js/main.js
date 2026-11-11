/**
 * KaNguyen3005 Portfolio - Main JavaScript Engine
 * Version: 2.0.0 (Zero-Dependency Modular Client Engine)
 * Features:
 *  1. Throttled/passive scroll handler & active scrollspy
 *  2. IntersectionObserver-throttled typewriter effect
 *  3. Accessible high-resolution Lightbox modal
 *  4. Smooth category filter tabs for Honors and Projects
 *  5. Scroll reveal animation observer
 *  6. Mobile navigation toggle & responsive handling
 */

(function () {
  'use strict';

  // State Management
  const state = {
    isScrollTicking: false,
    activeSection: 'about',
    lightboxOpen: false,
    detailModalOpen: false,
    theme: 'dark',
    typewriterPaused: false,
    lastScrollY: 0
  };

  // ==========================================================================
  // 1. HIGH-PERFORMANCE PASSIVE SCROLL & SCROLLSPY
  // ==========================================================================
  function initScrollEngine() {
    const navbar = document.getElementById('navbar');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const sections = Array.from(document.querySelectorAll('section[id], header[id]'));
    const navLinks = Array.from(document.querySelectorAll('#navbar a[href^="#"], #mobileMenu a[href^="#"]'));

    function onScroll() {
      const scrollY = window.scrollY || window.pageYOffset;
      state.lastScrollY = scrollY;

      // 1.1 Navbar Elevation & Glass State
      if (navbar) {
        if (scrollY > 40) {
          navbar.classList.add('scrolled', 'glass-scrolled', 'shadow-xl');
          navbar.classList.add('bg-brand-surface/95');
        } else {
          navbar.classList.remove('scrolled', 'glass-scrolled', 'shadow-xl');
          navbar.classList.remove('bg-brand-surface/95');
        }
      }

      // 1.2 Back-to-Top Button Visibility
      if (backToTopBtn) {
        if (scrollY > 300) {
          backToTopBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
          backToTopBtn.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
        } else {
          backToTopBtn.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
          backToTopBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        }
      }

      // 1.3 Active Section Scrollspy
      const navOffset = (navbar ? navbar.offsetHeight : 64) + 60;
      let currentSectionId = '';

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const top = section.offsetTop - navOffset;
        if (scrollY >= top) {
          currentSectionId = section.getAttribute('id');
          break;
        }
      }

      if (currentSectionId && currentSectionId !== state.activeSection) {
        state.activeSection = currentSectionId;
        updateActiveNavLinks(currentSectionId, navLinks);
      }

      state.isScrollTicking = false;
    }

    function updateActiveNavLinks(activeId, links) {
      links.forEach((link) => {
        const href = link.getAttribute('href');
        const isMatch = href === '#' + activeId || (activeId === 'about' && href === '#');
        if (isMatch) {
          link.classList.add('active', 'text-brand-cyan');
          link.classList.remove('text-slate-300', 'text-slate-400');
        } else {
          link.classList.remove('active', 'text-brand-cyan');
          link.classList.add('text-slate-300');
        }
      });
    }

    // Passive scroll listener with requestAnimationFrame throttle
    window.addEventListener(
      'scroll',
      function () {
        if (!state.isScrollTicking) {
          window.requestAnimationFrame(onScroll);
          state.isScrollTicking = true;
        }
      },
      { passive: true }
    );

    // Initial run on mount
    onScroll();

    // 1.4 Back-to-Top Button Click Handler
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // ==========================================================================
  // 2. THROTTLED TYPEWRITER EFFECT (IntersectionObserver Controlled)
  // ==========================================================================
  function initTypewriter() {
    const typewriterEl = document.getElementById('typewriter');
    if (!typewriterEl) return;

    const roles = [
      'Software Engineering Intern @ Rikkeisoft',
      'ICPC PTITHCM Champion 2024',
      'Codeforces Specialist (@morex3)',
      'Distributed Systems Architect',
      'Author @ I-SMAC 2026 Conference',
      '2nd Prize UTC Code4Future Contest',
      '3rd Prize KADA Program (Korea)',
      'AI Agents & Deep Learning Researcher'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timerId = null;

    function tick() {
      if (state.typewriterPaused) return;

      const currentRole = roles[roleIndex];

      if (isDeleting) {
        typewriterEl.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typewriterEl.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
      }

      let speed = isDeleting ? 35 : 70;

      if (!isDeleting && charIndex === currentRole.length) {
        speed = 2000; // Pause at end of text
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        speed = 400; // Pause before typing new word
      }

      timerId = setTimeout(tick, speed);
    }

    // IntersectionObserver pauses typing when hero is scrolled offscreen
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              if (state.typewriterPaused) {
                state.typewriterPaused = false;
                tick();
              }
            } else {
              state.typewriterPaused = true;
              if (timerId) clearTimeout(timerId);
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(typewriterEl);
    }

    // Start initial loop
    tick();
  }

  // ==========================================================================
  // 3. ACCESSIBLE HIGH-RESOLUTION LIGHTBOX MODAL
  // ==========================================================================
  function initLightboxModal() {
    // Select either #lightbox-modal or fallback #credentialModal
    let modal = document.getElementById('lightbox-modal') || document.getElementById('credentialModal');
    let modalImg = document.getElementById('lightbox-img') || document.getElementById('modalImg');
    let modalTitle = document.getElementById('lightbox-title') || document.getElementById('modalTitle');
    let modalDesc = document.getElementById('lightbox-desc') || document.getElementById('modalDesc');
    let modalCaption = document.getElementById('lightbox-caption');
    let modalCloseBtn = document.getElementById('lightbox-close') || document.getElementById('modalCloseBtn');
    let modalVerify = document.getElementById('lightbox-verify') || document.getElementById('modalActionContainer');

    function open(options) {
      if (!modal) {
        modal = document.getElementById('lightbox-modal') || document.getElementById('credentialModal');
      }
      if (!modal) return;

      const src = options.src || '';
      const title = options.title || '';
      const desc = options.desc || '';
      const verify = options.verify || '';

      if (modalImg) {
        modalImg.src = src;
        modalImg.alt = title || 'Minh chứng thành tích';
      }
      if (modalTitle) {
        modalTitle.textContent = title;
      }
      if (modalDesc) {
        modalDesc.textContent = desc;
      }
      if (modalCaption) {
        modalCaption.textContent = desc || title || '';
      }
      if (modalVerify && verify) {
        modalVerify.innerHTML = `<a href="${verify}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-mono hover:bg-blue-500/30 transition-colors"><span>Xác thực liên kết</span> &rarr;</a>`;
      } else if (modalVerify && !verify) {
        modalVerify.innerHTML = '';
      }

      modal.classList.add('active', 'is-open');
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      document.body.classList.add('overflow-hidden');
      state.lightboxOpen = true;

      // Focus close button for accessibility
      if (modalCloseBtn && typeof modalCloseBtn.focus === 'function') {
        modalCloseBtn.focus();
      }
    }

    function close() {
      if (!modal) {
        modal = document.getElementById('lightbox-modal') || document.getElementById('credentialModal');
      }
      if (!modal) return;

      modal.classList.remove('active', 'is-open');
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.body.classList.remove('overflow-hidden');
      state.lightboxOpen = false;

      if (modalImg) {
        modalImg.src = '';
      }
    }

    // Attach click listeners to trigger elements
    function attachTriggers() {
      const triggers = document.querySelectorAll('[data-lightbox-src], [data-fullsrc], .lightbox-trigger');
      triggers.forEach(function (el) {
        el.style.cursor = 'pointer';
        el.removeEventListener('click', handleTriggerClick);
        el.addEventListener('click', handleTriggerClick);
      });
    }

    function handleTriggerClick(e) {
      e.preventDefault();
      const el = e.currentTarget;
      const src = el.getAttribute('data-lightbox-src') || el.getAttribute('data-fullsrc') || el.getAttribute('data-src') || (el.querySelector('img') ? el.querySelector('img').getAttribute('src') : '');
      const title = el.getAttribute('data-lightbox-title') || el.getAttribute('data-title') || (el.querySelector('img') ? el.querySelector('img').getAttribute('alt') : '');
      const desc = el.getAttribute('data-lightbox-desc') || el.getAttribute('data-desc') || '';
      const verify = el.getAttribute('data-lightbox-verify') || el.getAttribute('data-verify') || '';

      open({ src: src, title: title, desc: desc, verify: verify });
    }

    // Close button click
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', function (e) {
        e.preventDefault();
        close();
      });
    }

    // Backdrop click (click outside modal content)
    if (modal) {
      modal.addEventListener('click', function (e) {
        const dialog = modal.querySelector('.lightbox-dialog') || modal.querySelector('#modalContainer');
        if (dialog && typeof dialog.contains === 'function' && !dialog.contains(e.target)) {
          close();
        } else if (!dialog || e.target === modal) {
          close();
        }
      });
    }

    // Prevent clicks on modal image from bubbling to backdrop
    if (modalImg) {
      modalImg.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }

    // Escape key listener for modal closing (listen on document & window)
    function onKeyDown(e) {
      if ((e.key === 'Escape' || e.keyCode === 27) && (state.lightboxOpen || (modal && !modal.classList.contains('hidden')))) {
        close();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('keydown', onKeyDown);

    attachTriggers();

    // Export helpers globally
    window.openLightbox = function (triggerOrOptions) {
      if (!triggerOrOptions) return;
      if (typeof triggerOrOptions === 'string') {
        open({ src: triggerOrOptions });
      } else if (triggerOrOptions instanceof HTMLElement) {
        const el = triggerOrOptions;
        const src = el.getAttribute('data-lightbox-src') || el.getAttribute('data-fullsrc') || (el.querySelector('img') ? el.querySelector('img').getAttribute('src') : '');
        const title = el.getAttribute('data-lightbox-title') || el.getAttribute('data-title') || '';
        const desc = el.getAttribute('data-lightbox-desc') || el.getAttribute('data-desc') || '';
        const verify = el.getAttribute('data-lightbox-verify') || el.getAttribute('data-verify') || '';
        open({ src: src, title: title, desc: desc, verify: verify });
      } else if (typeof triggerOrOptions === 'object') {
        open(triggerOrOptions);
      }
    };

    window.closeLightbox = close;
  }

  // ==========================================================================
  // 4. CATEGORY FILTER TABS (Honors & Awards, Projects)
  // ==========================================================================
  function initFilterTabs() {
    // 4.1 Filter Tabs in Honors Section
    setupFilterGroup({
      containerSelector: '#honors',
      tabSelector: '.tab-btn, .filter-btn, [data-filter]',
      cardSelector: '.award-card, [data-category], [data-award-id]'
    });

    // 4.2 Filter Tabs in Projects Section
    setupFilterGroup({
      containerSelector: '#projects',
      tabSelector: '.filter-btn, .tab-btn, [data-filter]',
      cardSelector: '.project-card, [data-category]'
    });

    function setupFilterGroup(config) {
      const section = document.querySelector(config.containerSelector);
      if (!section) return;

      const tabs = Array.from(section.querySelectorAll(config.tabSelector));
      const cards = Array.from(section.querySelectorAll(config.cardSelector));

      if (tabs.length === 0 || cards.length === 0) return;

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function (e) {
          e.preventDefault();
          const filterValue = tab.getAttribute('data-filter') || 'all';

          // Update active styling on tabs
          tabs.forEach(function (t) {
            t.classList.remove('active');
            t.classList.remove('bg-brand-blue', 'text-white', 'shadow-md', 'shadow-brand-blue/30');
            t.classList.add('text-slate-400');
          });

          tab.classList.add('active');
          tab.classList.add('bg-brand-blue', 'text-white', 'shadow-md', 'shadow-brand-blue/30');
          tab.classList.remove('text-slate-400');

          // Filter card items
          cards.forEach(function (card) {
            const cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
            const shouldShow = filterValue === 'all' || cardCategory.includes(filterValue.toLowerCase());

            if (shouldShow) {
              card.classList.remove('is-hidden');
              card.style.display = '';
              card.style.opacity = '0';
              card.style.transform = 'translateY(12px) scale(0.98)';
              window.requestAnimationFrame(function () {
                card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
              });
            } else {
              card.style.opacity = '0';
              card.style.transform = 'scale(0.96)';
              setTimeout(function () {
                if (!shouldShow) {
                  card.classList.add('is-hidden');
                  card.style.display = 'none';
                }
              }, 250);
            }
          });
        });
      });
    }
  }

  // ==========================================================================
  // 5. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
  // ==========================================================================
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right');
    if (revealElements.length === 0) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('active');
              obs.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          threshold: 0.05,
          rootMargin: '0px 0px 60px 0px'
        }
      );

      revealElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      revealElements.forEach(function (el) {
        el.classList.add('active');
      });
    }

    // Auto-reveal hero elements quickly on load
    const heroReveals = document.querySelectorAll('#about .reveal-left, #about .reveal-right, #about .reveal');
    heroReveals.forEach(function (el) {
      setTimeout(function () {
        el.classList.add('active');
      }, 100);
    });
  }

  // ==========================================================================
  // 6. MOBILE NAVIGATION TOGGLE
  // ==========================================================================
  function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn') || document.getElementById('menu-btn') || document.querySelector('button[aria-label*="menu" i]');
    const mobileMenu = document.getElementById('mobileMenu') || document.getElementById('mobile-menu');
    if (!mobileMenuBtn || !mobileMenu) return;

    mobileMenuBtn.addEventListener('click', function (e) {
      e.preventDefault();
      mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when clicking any nav link inside it
    const links = mobileMenu.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // ==========================================================================
  // 7. SMOOTH SCROLL FOR IN-PAGE ANCHORS
  // ==========================================================================
  function initSmoothAnchors() {
    document.addEventListener('click', function (e) {
      if (!e || !e.target) return;
      let target = null;
      if (typeof e.target.closest === 'function') {
        target = e.target.closest('a[href^="#"]');
      } else {
        let el = e.target;
        while (el && el.tagName !== '#DOCUMENT') {
          if (el.tagName === 'A' && el.getAttribute && el.getAttribute('href') && el.getAttribute('href').startsWith('#')) {
            target = el;
            break;
          }
          el = el.parentElement;
        }
      }
      if (!target) return;

      const hash = target.getAttribute('href');
      if (!hash || hash === '#') return;

      const targetEl = document.querySelector(hash);
      if (targetEl) {
        e.preventDefault();
        const navbar = document.getElementById('navbar');
        const navHeight = navbar ? navbar.offsetHeight : 64;
        const targetTop = (targetEl.getBoundingClientRect ? targetEl.getBoundingClientRect().top : (targetEl.offsetTop || 0));
        const scrollY = (window.pageYOffset || window.scrollY || 0);
        const targetPosition = targetTop + scrollY - navHeight;

        if (typeof window.scrollTo === 'function') {
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }

        // Update URL hash smoothly without jump
        if (typeof history !== 'undefined' && history.pushState) {
          history.pushState(null, null, hash);
        }
      }
    });
  }

  // ==========================================================================
  // 7.5 HERO DUAL-TAB SHOWCASE (Arena vs Campus Life)
  // ==========================================================================
  function initHeroSwitcher() {
    const tabArena = document.getElementById('hero-tab-arena');
    const tabCampus = document.getElementById('hero-tab-campus');
    const picArena = document.getElementById('hero-pic-arena');
    const picCampus = document.getElementById('hero-pic-campus');
    const imageWrap = document.getElementById('hero-image-wrap');
    const statusPill = document.getElementById('hero-status-pill');
    const zoomText = document.getElementById('hero-zoom-text');
    const ethosQuote = document.getElementById('hero-ethos-quote');
    const ethosTag = document.getElementById('hero-ethos-tag');

    if (!tabArena || !tabCampus || !picArena || !picCampus || !imageWrap) return;

    function setView(view) {
      if (view === 'arena') {
        tabArena.classList.add('bg-brand-blue/30', 'text-cyan-300', 'border-brand-cyan/40');
        tabArena.classList.remove('text-slate-400');
        tabCampus.classList.remove('bg-brand-blue/30', 'text-cyan-300', 'border-brand-cyan/40');
        tabCampus.classList.add('text-slate-400');

        picArena.classList.remove('hidden');
        picArena.classList.add('block');
        picCampus.classList.add('hidden');
        picCampus.classList.remove('block');

        imageWrap.setAttribute('data-lightbox-src', 'assets/icpc_contest_2026.png');
        imageWrap.setAttribute('data-lightbox-title', 'Chung kết ICPC PTITHCM & Olympic AI 2026');
        imageWrap.setAttribute('data-lightbox-desc', 'Khoảnh khắc thi đấu thuật toán trực tiếp tại phòng lab máy tính PTITHCM của Mô Ha Mách Bu Ba Ka cùng đồng đội.');

        if (statusPill) {
          statusPill.textContent = 'Live Arena';
          statusPill.className = 'text-[11px] text-rose-400 font-mono';
        }
        if (zoomText) zoomText.textContent = 'Click xem ảnh gốc (1024x682 HD)';
        if (ethosQuote) ethosQuote.textContent = 'Kỷ luật thuật toán & Tư duy hệ thống ⚡';
        if (ethosTag) ethosTag.textContent = '@morex3';
      } else {
        tabCampus.classList.add('bg-brand-blue/30', 'text-cyan-300', 'border-brand-cyan/40');
        tabCampus.classList.remove('text-slate-400');
        tabArena.classList.remove('bg-brand-blue/30', 'text-cyan-300', 'border-brand-cyan/40');
        tabArena.classList.add('text-slate-400');

        picCampus.classList.remove('hidden');
        picCampus.classList.add('block');
        picArena.classList.add('hidden');
        picArena.classList.remove('block');

        imageWrap.setAttribute('data-lightbox-src', 'assets/ptit_campus_life.png');
        imageWrap.setAttribute('data-lightbox-title', 'Khuôn Viên PTITHCM & Tình Bạn Học Đường');
        imageWrap.setAttribute('data-lightbox-desc', 'Khoảnh khắc thư giãn dưới hoàng hôn rực rỡ tại khuôn viên PTITHCM cùng bạn bè — nơi nuôi dưỡng đam mê kỹ thuật và khát vọng kiến tạo công nghệ.');

        if (statusPill) {
          statusPill.textContent = 'Campus Life';
          statusPill.className = 'text-[11px] text-amber-400 font-mono';
        }
        if (zoomText) zoomText.textContent = 'Click xem ảnh hoàng hôn PTIT';
        if (ethosQuote) ethosQuote.textContent = 'PTIT Campus Life & Collaborative Engineering 🎓';
        if (ethosTag) ethosTag.textContent = 'PTIT Campus';
      }
    }

    tabArena.addEventListener('click', function (e) {
      e.stopPropagation();
      setView('arena');
    });

    tabCampus.addEventListener('click', function (e) {
      e.stopPropagation();
      setView('campus');
    });
  }

  // ==========================================================================
  // 8. LIFECYCLE INITIALIZATION
  // ==========================================================================
  /* ==========================================================================
     8. DARK / LIGHT THEME SWITCHER (Zero FOUC + Persistent Preference)
     ========================================================================== */
  function getThemeRoot() {
    return document.documentElement || document.querySelector('html');
  }

  function getSavedThemePreference() {
    try {
      if (typeof window.localStorage !== 'undefined' && window.localStorage) {
        var saved = window.localStorage.getItem('portfolio-theme');
        if (saved === 'light' || saved === 'dark') return saved;
      }
    } catch (err) {
      // Ignore storage restrictions in sandboxed environments
    }
    var root = getThemeRoot();
    if (root && root.getAttribute) {
      var attrTheme = root.getAttribute('data-theme');
      if (attrTheme === 'light' || attrTheme === 'dark') return attrTheme;
    }
    return 'dark';
  }

  function applyTheme(theme, persist) {
    var normalized = theme === 'light' ? 'light' : 'dark';
    var root = getThemeRoot();
    if (root && root.setAttribute) {
      root.setAttribute('data-theme', normalized);
    }
    state.theme = normalized;

    var toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      var label = normalized === 'light'
        ? 'Chuyển sang giao diện tối'
        : 'Chuyển sang giao diện sáng';
      toggleBtn.setAttribute('aria-pressed', normalized === 'light' ? 'true' : 'false');
      toggleBtn.setAttribute('aria-label', label);
      toggleBtn.setAttribute('title', label);
    }

    if (persist) {
      try {
        if (typeof window.localStorage !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('portfolio-theme', normalized);
        }
      } catch (err) {
        // Ignore storage write errors
      }
    }
    return normalized;
  }

  function initThemeSwitcher() {
    var initialTheme = getSavedThemePreference();
    applyTheme(initialTheme, false);

    var toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn && (!toggleBtn.dataset || toggleBtn.dataset.themeBound !== 'true')) {
      if (toggleBtn.dataset) toggleBtn.dataset.themeBound = 'true';
      toggleBtn.addEventListener('click', function () {
        var nextTheme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme, true);
      });
    }
  }

  /* ==========================================================================
     9. PROGRESSIVE DISCLOSURE DETAIL MODAL
     ========================================================================== */
  function findAncestor(node, predicate) {
    var cur = node;
    while (cur) {
      if (cur.nodeType === 1 && predicate(cur)) return cur;
      cur = cur.parentNode || cur.parentElement;
    }
    return null;
  }

  function clearElementChildren(el) {
    if (!el) return;
    if (typeof el.innerHTML === 'string' && !el.children.length) {
      el.innerHTML = '';
    }
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isSafeExternalUrl(url) {
    return typeof url === 'string' && (url.indexOf('https://') === 0 || url.indexOf('http://') === 0);
  }

  function initDetailModal() {
    var dataEl = document.getElementById('portfolio-details');
    var modal = document.getElementById('detail-modal');
    if (!dataEl || !modal) return;

    var catalog = {};
    try {
      catalog = JSON.parse((dataEl.textContent || '{}').trim());
    } catch (err) {
      return;
    }

    var dialog = document.getElementById('detail-modal-dialog');
    var closeBtn = document.getElementById('detail-modal-close');
    var badgeEl = document.getElementById('detail-modal-badge');
    var contextEl = document.getElementById('detail-modal-context');
    var titleEl = document.getElementById('detail-modal-title');
    var subtitleEl = document.getElementById('detail-modal-subtitle');
    var descEl = document.getElementById('detail-modal-desc');
    var metricsEl = document.getElementById('detail-modal-metrics');
    var highlightsEl = document.getElementById('detail-modal-highlights');
    var tagsEl = document.getElementById('detail-modal-tags');
    var actionsEl = document.getElementById('detail-modal-actions');
    var lastOpener = null;

    function openDetailModal(id, openerEl) {
      var item = catalog[id];
      if (!item) return false;
      lastOpener = openerEl || null;

      if (badgeEl) {
        badgeEl.textContent = item.badge || '';
        badgeEl.className = (item.badgeClass || 'badge-indigo') + ' inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium';
      }
      if (contextEl) contextEl.textContent = item.context || '';
      if (titleEl) titleEl.textContent = item.title || '';
      if (subtitleEl) subtitleEl.textContent = item.subtitle || '';
      if (descEl) descEl.textContent = item.description || '';

      var canCreate = typeof document.createElement === 'function';

      if (metricsEl) {
        clearElementChildren(metricsEl);
        var metrics = Array.isArray(item.metrics) ? item.metrics : [];
        if (canCreate) {
          metrics.forEach(function (metric) {
            var box = document.createElement('div');
            box.className = 'detail-metric-box p-3 rounded-xl bg-white/5 border border-white/10 text-center';
            var val = document.createElement('div');
            val.className = 'text-sm sm:text-base font-bold text-white';
            val.textContent = metric.value || '';
            var lbl = document.createElement('div');
            lbl.className = 'text-[11px] text-slate-400 mt-0.5';
            lbl.textContent = metric.label || '';
            box.appendChild(val);
            box.appendChild(lbl);
            metricsEl.appendChild(box);
          });
        } else {
          metricsEl.innerHTML = metrics.map(function (metric) {
            return '<div class="detail-metric-box p-3 rounded-xl bg-white/5 border border-white/10 text-center"><div class="text-sm sm:text-base font-bold text-white">' +
              escapeHtml(metric.value) + '</div><div class="text-[11px] text-slate-400 mt-0.5">' +
              escapeHtml(metric.label) + '</div></div>';
          }).join('');
        }
      }

      if (highlightsEl) {
        clearElementChildren(highlightsEl);
        var highlights = Array.isArray(item.highlights) ? item.highlights : [];
        if (canCreate) {
          highlights.forEach(function (point) {
            var li = document.createElement('li');
            li.className = 'flex items-start gap-2.5';
            var marker = document.createElement('span');
            marker.className = 'text-emerald-400 font-bold shrink-0';
            marker.textContent = '✓';
            var copy = document.createElement('span');
            copy.textContent = point;
            li.appendChild(marker);
            li.appendChild(copy);
            highlightsEl.appendChild(li);
          });
        } else {
          highlightsEl.innerHTML = highlights.map(function (point) {
            return '<li class="flex items-start gap-2.5"><span class="text-emerald-400 font-bold shrink-0">✓</span><span>' +
              escapeHtml(point) + '</span></li>';
          }).join('');
        }
      }

      if (tagsEl) {
        clearElementChildren(tagsEl);
        var tags = Array.isArray(item.tags) ? item.tags : [];
        if (canCreate) {
          tags.forEach(function (tag) {
            var chip = document.createElement('span');
            chip.className = 'px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300';
            chip.textContent = tag;
            tagsEl.appendChild(chip);
          });
        } else {
          tagsEl.innerHTML = tags.map(function (tag) {
            return '<span class="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">' +
              escapeHtml(tag) + '</span>';
          }).join('');
        }
      }

      if (actionsEl) {
        clearElementChildren(actionsEl);
        var hasSafeLink = item.primaryLink && isSafeExternalUrl(item.primaryLink.url);
        if (canCreate) {
          if (hasSafeLink) {
            var link = document.createElement('a');
            link.href = item.primaryLink.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs font-mono font-semibold transition-colors shadow-lg shadow-brand-blue/25';
            link.textContent = (item.primaryLink.label || 'Xem chi tiết') + ' \u2192';
            actionsEl.appendChild(link);
          }
          var footerClose = document.createElement('button');
          footerClose.type = 'button';
          footerClose.className = 'detail-footer-close px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono font-medium transition-colors';
          footerClose.textContent = 'Đóng cửa sổ';
          footerClose.addEventListener('click', closeDetailModal);
          actionsEl.appendChild(footerClose);
        } else {
          var actionHtml = '';
          if (hasSafeLink) {
            actionHtml += '<a href="' + escapeHtml(item.primaryLink.url) + '" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs font-mono font-semibold transition-colors shadow-lg shadow-brand-blue/25">' +
              escapeHtml(item.primaryLink.label || 'Xem chi tiết') + ' &rarr;</a>';
          }
          actionHtml += '<button type="button" class="detail-footer-close px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono font-medium transition-colors">Đóng cửa sổ</button>';
          actionsEl.innerHTML = actionHtml;
        }
      }

      modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
      modal.classList.add('flex');
      modal.setAttribute('aria-hidden', 'false');
      if (dialog) {
        dialog.classList.remove('scale-95');
        dialog.classList.add('scale-100');
      }
      state.detailModalOpen = true;
      if (document.body && document.body.style) {
        document.body.style.overflow = 'hidden';
      }
      if (closeBtn && typeof closeBtn.focus === 'function') {
        try {
          closeBtn.focus();
        } catch (err) {
          // Ignore focus errors in virtual DOM
        }
      }
      return true;
    }

    function closeDetailModal() {
      modal.classList.remove('flex', 'scale-100');
      modal.classList.add('hidden', 'opacity-0', 'pointer-events-none');
      modal.setAttribute('aria-hidden', 'true');
      if (dialog) {
        dialog.classList.remove('scale-100');
        dialog.classList.add('scale-95');
      }
      state.detailModalOpen = false;
      if (document.body && document.body.style && !state.lightboxOpen) {
        document.body.style.overflow = '';
      }
      if (lastOpener && typeof lastOpener.focus === 'function') {
        try {
          lastOpener.focus();
        } catch (err) {
          // Ignore focus errors in virtual DOM
        }
      }
    }

    window.PortfolioDetail = {
      open: openDetailModal,
      close: closeDetailModal
    };

    if (modal.dataset && modal.dataset.detailBound === 'true') return;
    if (modal.dataset) modal.dataset.detailBound = 'true';

    var detailCards = document.querySelectorAll('[data-detail-id]');
    detailCards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        var anchor = findAncestor(e.target, function (el) {
          return el.tagName === 'A' && Boolean(el.getAttribute('href'));
        });
        if (anchor) return;
        var detailId = card.getAttribute('data-detail-id');
        if (detailId) openDetailModal(detailId, card);
      });

      card.addEventListener('keydown', function (e) {
        if (e.target !== card) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var detailId = card.getAttribute('data-detail-id');
          if (detailId) openDetailModal(detailId, card);
        }
      });
    });

    var triggerButtons = document.querySelectorAll('.detail-trigger-btn');
    triggerButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var targetId = btn.getAttribute('data-detail-target');
        if (targetId) openDetailModal(targetId, btn);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeDetailModal);
    }

    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeDetailModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.detailModalOpen) {
        closeDetailModal();
      }
    });
  }

  function init() {
    initThemeSwitcher();
    initScrollEngine();
    initTypewriter();
    initLightboxModal();
    initDetailModal();
    initFilterTabs();
    initScrollReveal();
    initMobileMenu();
    initSmoothAnchors();
    initHeroSwitcher();
  }

  // Expose Portfolio API for testing & manual invocation
  window.Portfolio = {
    version: '2.1.0',
    init: init,
    setTheme: function (theme) { return applyTheme(theme, true); },
    getTheme: function () { return state.theme; },
    openDetail: function (id) { return window.PortfolioDetail ? window.PortfolioDetail.open(id) : false; },
    closeDetail: function () { if (window.PortfolioDetail) window.PortfolioDetail.close(); },
    openLightbox: window.openLightbox,
    closeLightbox: window.closeLightbox,
    state: state
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
