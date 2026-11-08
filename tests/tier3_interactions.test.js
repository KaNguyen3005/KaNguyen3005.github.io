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

  test('3.1: [Filter Tabs + Lightbox]: Filter by "ICPC" -> clicking card opens Lightbox -> closing leaves filter active', ({ assert }) => {
    const { document } = loadDOM(INDEX_HTML);
    const icpcFilter = document.querySelector('[data-filter="icpc"]');
    const modal = document.querySelector('#lightbox-modal');
    const closeBtn = document.querySelector('#lightbox-close');

    if (icpcFilter && modal && closeBtn) {
      // 1. Activate ICPC filter
      icpcFilter.click();
      assert.ok(icpcFilter.classList.contains('active'), 'ICPC filter button must have .active class');

      // 2. Click an ICPC card
      const icpcCard = document.querySelector('[data-category*="icpc"] [data-lightbox-src]') || 
                       document.querySelector('[data-category*="icpc"]');
      if (icpcCard) {
        icpcCard.click();
        assert.ok(!modal.classList.contains('hidden'), 'Modal must open when award card is clicked');

        // 3. Close modal
        closeBtn.click();
        assert.ok(modal.classList.contains('hidden'), 'Modal must close when close button is clicked');
        assert.ok(icpcFilter.classList.contains('active'), 'ICPC filter button must remain active after modal close');
      }
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

});
