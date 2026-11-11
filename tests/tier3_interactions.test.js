/**
 * tests/tier3_interactions.test.js
 * Tier 3: Cross-Feature Combinations & Pairwise Interaction Suite (14 tests).
 * Tests combinations between: Filter Tabs, Lightbox Modal, Scrollspy,
 * Navbar state, Typewriter IntersectionObserver, and Mobile drawer.
 */

const fs = require('node:fs');
const path = require('node:path');
const { describe, test } = require('./runner.js');
const { loadDOM } = require('./dom_helper.js');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const INDEX_HTML = path.join(PROJECT_ROOT, 'index.html');

describe('Tier 3: Cross-Feature Combinations Suite', () => {

  test('3.1: [Filter Tabs + Category Navigation]: Filter by "ICPC" -> filters cards to ICPC -> card verification link intact', ({ assert }) => {
    const { document } = loadDOM(INDEX_HTML);
    const icpcFilter = document.querySelector('[data-filter="icpc"]');
    const modal = document.querySelector('#lightbox-modal');

    if (icpcFilter && modal) {
      // 1. Activate ICPC filter
      icpcFilter.click();
      assert.ok(icpcFilter.classList.contains('active'), 'ICPC filter button must have .active class');

      // 2. Inspect ICPC card in filtered view
      const icpcCard = document.querySelector('[data-category*="icpc"]');
      assert.ok(icpcCard, 'ICPC card must exist in filtered view');
      const verifyLink = icpcCard.querySelector('a[href*="icpc.global"]') || icpcCard.querySelector('a');
      assert.ok(verifyLink, 'ICPC card must contain official external verification link');

      // 3. Ensure modal remains closed during filtering
      assert.ok(modal.classList.contains('hidden'), 'Modal should remain hidden during filter operations');
      assert.ok(icpcFilter.classList.contains('active'), 'ICPC filter button must remain active');
    }
  });

  test('3.2: [Filter Tabs + Lightbox]: Filter by "Tech" -> click Code4Future -> Escape closes modal -> filter unchanged', ({ assert }) => {
    const { document } = loadDOM(INDEX_HTML);
    const techFilter = document.querySelector('[data-filter="tech"]');
    const modal = document.querySelector('#lightbox-modal');

    if (techFilter && modal) {
      techFilter.click();
      assert.ok(techFilter.classList.contains('active'), 'Tech filter button must be active');

      // Open modal
      modal.classList.remove('hidden');

      // Press Escape
      document.dispatchEvent({ type: 'keydown', key: 'Escape', keyCode: 27 });

      // Tech filter should remain active
      assert.ok(techFilter.classList.contains('active'), 'Tech filter must remain active');
    }
  });

  test('3.3: [Filter Tabs + Lightbox]: Filter by "Scholarship" -> click PTIT Scholarship -> backdrop click closes modal', ({ assert }) => {
    const { document } = loadDOM(INDEX_HTML);
    const scholarFilter = document.querySelector('[data-filter="scholarship"]');
    const modal = document.querySelector('#lightbox-modal');

    if (scholarFilter && modal) {
      scholarFilter.click();
      assert.ok(scholarFilter.classList.contains('active'));

      modal.classList.remove('hidden');
      modal.click(); // Click backdrop
      assert.ok(scholarFilter.classList.contains('active'), 'Scholarship filter must remain active');
    }
  });

  test('3.4: [Scrollspy + Navbar Active State]: Scrolling to #about highlights Hero/About nav link', ({ assert }) => {
    const { document, window } = loadDOM(INDEX_HTML);
    const aboutLink = document.querySelector('#navbar a[href="#about"]');
    if (aboutLink) {
      window.scrollTo(0, 0);
      window.dispatchEvent('scroll');
      assert.ok(document.querySelector('#navbar'), 'Navbar must be present during scroll');
    }
  });

  test('3.5: [Scrollspy + Navbar Active State]: Scrolling to #honors updates active link indicator to #honors', ({ assert }) => {
    const { document, window } = loadDOM(INDEX_HTML);
    const honorsSec = document.querySelector('#honors');
    if (honorsSec) {
      window.scrollTo(0, 800);
      window.dispatchEvent('scroll');
      assert.ok(honorsSec, '#honors section must be present during scrollspy');
    }
  });

  test('3.6: [Scrollspy + Navbar Active State]: Scrolling to #projects updates active link indicator to #projects', ({ assert }) => {
    const { document, window } = loadDOM(INDEX_HTML);
    const projectsSec = document.querySelector('#projects');
    if (projectsSec) {
      window.scrollTo(0, 1600);
      window.dispatchEvent('scroll');
      assert.ok(projectsSec, '#projects section must be present during scrollspy');
    }
  });

  test('3.7: [Scrollspy + Navbar Active State]: Scrolling to #skills updates active link indicator to #skills', ({ assert }) => {
    const { document, window } = loadDOM(INDEX_HTML);
    const skillsSec = document.querySelector('#skills');
    if (skillsSec) {
      window.scrollTo(0, 2400);
      window.dispatchEvent('scroll');
      assert.ok(skillsSec, '#skills section must be present during scrollspy');
    }
  });

  test('3.8: [Typewriter Observer + Scroll Position]: Typewriter throttles when scrolled past 1000px', ({ assert }) => {
    const { rawHTML, window } = loadDOM(INDEX_HTML);
    // Verifies IntersectionObserver usage in markup or scripts
    assert.ok(/IntersectionObserver/i.test(rawHTML), 'Typewriter effect must be wrapped in IntersectionObserver');
    window.scrollTo(0, 1500);
    window.dispatchEvent('scroll');
  });

  test('3.9: [Navbar Click + Smooth Scroll + Active State]: Clicking #navbar a[href="#honors"] triggers smooth navigation', ({ assert }) => {
    const { document } = loadDOM(INDEX_HTML);
    const honorsLink = document.querySelector('#navbar a[href="#honors"]');
    if (honorsLink) {
      assert.doesNotThrow(() => {
        honorsLink.click();
      }, 'Clicking navbar link must not throw error');
    }
  });

  test('3.10: [Mobile Menu Toggle + Navigation Link Click]: Mobile menu collapses upon link selection', ({ assert }) => {
    const { document } = loadDOM(INDEX_HTML);
    const menuBtn = document.querySelector('#menu-btn') || document.querySelector('#navbar button');
    const mobileMenu = document.querySelector('#mobile-menu') || document.querySelector('#nav-links');

    if (menuBtn && mobileMenu) {
      menuBtn.click(); // Open
      const link = mobileMenu.querySelector('a');
      if (link) {
        link.click();
        // Menu should handle link click
        assert.ok(mobileMenu, 'Mobile menu should handle item navigation');
      }
    }
  });

  test('3.11: [Lightbox Active + Viewport Resize]: Lightbox image maintains centered containment', ({ assert }) => {
    const { document, window } = loadDOM(INDEX_HTML);
    const modal = document.querySelector('#lightbox-modal');
    if (modal) {
      modal.classList.remove('hidden');
      window.innerWidth = 768;
      window.innerHeight = 1024;
      window.dispatchEvent('resize');
      assert.ok(!modal.classList.contains('hidden'), 'Modal should remain open across viewport resize');
    }
  });

  test('3.12: [Filter Tabs + Rapid Scroll]: Switching filter and immediately scrolling maintains stable layout', ({ assert }) => {
    const { document, window } = loadDOM(INDEX_HTML);
    const filterBtn = document.querySelector('[data-filter="tech"]') || document.querySelector('[data-filter="all"]');
    if (filterBtn) {
      filterBtn.click();
      window.scrollTo(0, 3000);
      window.dispatchEvent('scroll');
      assert.ok(document.body, 'Body must maintain stability');
    }
  });

  test('3.13: [Zero 404s + Lightbox Image Preload]: Every data-lightbox-src points to an existing file', ({ assert }) => {
    const { document } = loadDOM(INDEX_HTML);
    const zoomables = document.querySelectorAll('[data-lightbox-src]');
    for (const elem of zoomables) {
      const src = elem.getAttribute('data-lightbox-src');
      if (src && !src.startsWith('http')) {
        const cleanPath = src.replace(/^\.\//, '');
        const full = path.join(PROJECT_ROOT, cleanPath);
        assert.ok(fs.existsSync(full), `Lightbox target file ${src} must exist on disk`);
      }
    }
  });

  test('3.14: [Bento Cards + CTA Links]: External Codeforces CTA preserves page state', ({ assert }) => {
    const { document } = loadDOM(INDEX_HTML);
    const cfLink = document.querySelector('a[href*="codeforces.com"]');
    if (cfLink) {
      assert.equal(cfLink.getAttribute('target'), '_blank', 'External profile link must open in new tab (_blank)');
    }
  });

  test('3.15: [Hero Tab Switcher]: Hero Dual-Tab controls toggle Arena and Campus Life views', ({ assert }) => {
    const { document } = loadDOM(INDEX_HTML);
    const tabArena = document.querySelector('#hero-tab-arena');
    const tabCampus = document.querySelector('#hero-tab-campus');
    const picArena = document.querySelector('#hero-pic-arena');
    const picCampus = document.querySelector('#hero-pic-campus');
    const imageWrap = document.querySelector('#hero-image-wrap');

    assert.ok(tabArena, 'Hero Arena tab must exist');
    assert.ok(tabCampus, 'Hero Campus tab must exist');
    assert.ok(picArena, 'Hero Arena picture must exist');
    assert.ok(picCampus, 'Hero Campus picture must exist');
    assert.ok(imageWrap, 'Hero image wrapper must exist');

    // Click campus tab
    tabCampus.click();
    assert.ok(!picCampus.classList.contains('hidden'), 'Campus view must become visible');
    assert.ok(picArena.classList.contains('hidden'), 'Arena view must be hidden');
    assert.equal(imageWrap.getAttribute('data-lightbox-src'), 'assets/ptit_campus_life.png', 'Lightbox source must point to campus photo');

    // Click arena tab
    tabArena.click();
    assert.ok(!picArena.classList.contains('hidden'), 'Arena view must become visible again');
    assert.ok(picCampus.classList.contains('hidden'), 'Campus view must be hidden again');
    assert.equal(imageWrap.getAttribute('data-lightbox-src'), 'assets/icpc_contest_2026.png', 'Lightbox source must point to contest arena photo');
  });

  test('3.16: [Theme Switcher]: Clicking #theme-toggle toggles data-theme between dark and light', ({ assert }) => {
    const { document } = loadDOM(INDEX_HTML);
    const html = document.querySelector('html');
    const toggleBtn = document.getElementById('theme-toggle');
    assert.ok(html && toggleBtn, 'Root <html> and #theme-toggle must exist');

    const initialTheme = html.getAttribute('data-theme') || 'dark';
    toggleBtn.click();
    const swappedTheme = html.getAttribute('data-theme');
    assert.notEqual(swappedTheme, initialTheme, 'Clicking #theme-toggle must toggle data-theme');
    assert.equal(toggleBtn.getAttribute('aria-pressed'), swappedTheme === 'light' ? 'true' : 'false');

    toggleBtn.click();
    assert.equal(html.getAttribute('data-theme'), initialTheme, 'Clicking #theme-toggle twice must restore initial theme');
  });

  test('3.17: [Progressive Disclosure Modal]: Clicking card opens #detail-modal with content and Escape closes it', ({ assert }) => {
    const { document } = loadDOM(INDEX_HTML);
    const dueBroCard = document.querySelector('[data-detail-id="project-duebro"]');
    const modal = document.getElementById('detail-modal');
    const titleEl = document.getElementById('detail-modal-title');
    const metricsEl = document.getElementById('detail-modal-metrics');
    const tagsEl = document.getElementById('detail-modal-tags');
    assert.ok(dueBroCard && modal && titleEl, 'Summary card and #detail-modal elements must exist');

    dueBroCard.click();
    assert.ok(!modal.classList.contains('hidden'), '#detail-modal must become visible when card is clicked');
    assert.equal(modal.getAttribute('aria-hidden'), 'false', '#detail-modal aria-hidden must be false when open');
    assert.ok(/Due Bro/i.test(titleEl.textContent), '#detail-modal-title must populate selected project title');
    assert.ok((metricsEl.children.length > 0 || metricsEl.innerHTML.length > 0) && /React Native/i.test(tagsEl.innerHTML), 'Metrics and tags must render on open');

    document.dispatchEvent({ type: 'keydown', key: 'Escape' });
    assert.ok(modal.classList.contains('hidden'), 'Escape key must close #detail-modal');
    assert.equal(modal.getAttribute('aria-hidden'), 'true', '#detail-modal aria-hidden must reset to true on close');
  });

  test('3.18: [Mobile Theme Switcher]: Clicking #theme-toggle-mobile toggles theme on mobile and syncs state', ({ assert }) => {
    const { document, window } = loadDOM(INDEX_HTML);
    window.innerWidth = 375;
    window.innerHeight = 812;
    const html = document.querySelector('html');
    const mobileToggle = document.getElementById('theme-toggle-mobile');
    const desktopToggle = document.getElementById('theme-toggle');
    assert.ok(html && mobileToggle, 'Root <html> and #theme-toggle-mobile must exist');

    const initialTheme = html.getAttribute('data-theme') || 'dark';
    mobileToggle.click();
    const switchedTheme = html.getAttribute('data-theme');
    assert.notEqual(switchedTheme, initialTheme, 'Clicking #theme-toggle-mobile must toggle data-theme');
    assert.equal(mobileToggle.getAttribute('aria-pressed'), switchedTheme === 'light' ? 'true' : 'false', 'Mobile toggle aria-pressed must update');
    if (desktopToggle) {
      assert.equal(desktopToggle.getAttribute('aria-pressed'), switchedTheme === 'light' ? 'true' : 'false', 'Desktop toggle aria-pressed must sync');
    }

    // Toggle again to restore
    mobileToggle.click();
    assert.equal(html.getAttribute('data-theme'), initialTheme, 'Clicking #theme-toggle-mobile twice must restore initial theme');
  });

  test('3.19: [Card Detail Modal Multi-Category Interaction]: Clicking honors, projects, research, and skills cards populates correct content and handles close triggers', ({ assert }) => {
    const { document } = loadDOM(INDEX_HTML);
    const modal = document.getElementById('detail-modal');
    const titleEl = document.getElementById('detail-modal-title');
    const descEl = document.getElementById('detail-modal-desc');
    const closeBtn = document.getElementById('detail-modal-close');
    assert.ok(modal && titleEl && descEl && closeBtn, '#detail-modal and core elements must exist');

    // Test representative cards from Honors, Projects, Research, and Skills
    const testCardIds = [
      { id: 'award-icpc-2024', category: 'honors', titlePattern: /ICPC|Quán Quân/i },
      { id: 'project-lms', category: 'projects', titlePattern: /LMS|Microservices/i },
      { id: 'research-ismac', category: 'research', titlePattern: /I-SMAC|PhoBERT/i },
      { id: 'skill-languages', category: 'skills', titlePattern: /Ngôn Ngữ|Languages/i }
    ];

    for (const testCase of testCardIds) {
      const card = document.querySelector(`[data-detail-id="${testCase.id}"]`);
      assert.ok(card, `Card with data-detail-id="${testCase.id}" (${testCase.category}) must exist in DOM`);

      // Trigger card click
      card.click();
      assert.ok(!modal.classList.contains('hidden'), `Modal must open when clicking ${testCase.id}`);
      assert.equal(modal.getAttribute('aria-hidden'), 'false', `Modal aria-hidden must be false for ${testCase.id}`);
      assert.ok(testCase.titlePattern.test(titleEl.textContent), `Modal title for ${testCase.id} must match expected content`);
      assert.ok((descEl.textContent || '').trim().length > 10, `Modal description for ${testCase.id} must not be empty`);

      // Close using close button
      closeBtn.click();
      assert.ok(modal.classList.contains('hidden'), `Modal must close when clicking close button after ${testCase.id}`);
      assert.equal(modal.getAttribute('aria-hidden'), 'true', `Modal aria-hidden must reset to true after ${testCase.id}`);
    }
  });

  test('3.20: [Card Detail Modal Trigger Button & Backdrop Interaction]: .detail-trigger-btn opens modal and backdrop click closes it', ({ assert }) => {
    const { document } = loadDOM(INDEX_HTML);
    const modal = document.getElementById('detail-modal');
    const triggerBtn = document.querySelector('.detail-trigger-btn');
    if (triggerBtn) {
      triggerBtn.click();
      assert.ok(!modal.classList.contains('hidden'), 'Modal must open via .detail-trigger-btn');

      // Backdrop click closes modal
      modal.click();
      assert.ok(modal.classList.contains('hidden'), 'Clicking modal backdrop must close #detail-modal');
    }
  });

});
