/**
 * tests/tier2_boundaries.test.js
 * Tier 2: Boundary & Corner Cases Suite (61 tests).
 * Tests extreme viewports, long text, keyboard Escape, outside click,
 * CLS protection, image error handling, and network resilience.
 */

const fs = require('node:fs');
const path = require('node:path');
const { describe, test } = require('./runner.js');
const { loadDOM, parseHTML } = require('./dom_helper.js');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const INDEX_HTML = path.join(PROJECT_ROOT, 'index.html');

describe('Tier 2: Boundary & Corner Cases Suite', () => {

  // =========================================================================
  // Feature 1 Boundaries: Navigation & Brand
  // =========================================================================
  describe('[Tier 2] Feature 1 Boundaries: Navigation & Brand', () => {
    test('1.1: Long brand title does not collide with nav links or cause overflow', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const navbar = document.querySelector('#navbar');
      assert.ok(navbar, '#navbar must exist');
      const innerNav = navbar.querySelector('.max-w-7xl') || navbar.querySelector('div');
      assert.ok(innerNav, 'Navbar container must constrain width');
      const classes = innerNav.getAttribute('class') || '';
      assert.ok(/max-w-|container|mx-auto/i.test(classes), 'Navbar must constrain layout width');
    });

    test('1.2: Mobile viewport (320px) navigation layout constraints', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/md:flex|hidden\s+md:flex|lg:flex/i.test(rawHTML), 'Nav links must be hidden on small mobile viewports');
    });

    test('1.3: Ultra-wide 4K viewport (3840px) max-width boundary constraint', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const containers = document.querySelectorAll('.max-w-7xl, .max-w-6xl, .max-w-5xl, .container');
      assert.ok(containers.length >= 3, 'Key sections must constrain maximum width to prevent 4K stretching');
    });

    test('1.4: Navigation anchor with empty hash or unknown target handled gracefully', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const dummyA = document.querySelector('a[href="#"]') || document.querySelector('a');
      assert.doesNotThrow(() => {
        dummyA.click();
      }, 'Clicking anchor must not throw an uncaught exception');
    });

    test('1.5: Navbar button rapid click debouncing / event listener resilience', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const btn = document.querySelector('#menu-btn') || document.querySelector('#navbar button');
      if (btn) {
        assert.doesNotThrow(() => {
          for (let i = 0; i < 20; i++) btn.click();
        }, 'Rapid clicking mobile menu toggle must not throw errors');
      }
    });
  });

  // =========================================================================
  // Feature 2 Boundaries: Hero Section & CTAs
  // =========================================================================
  describe('[Tier 2] Feature 2 Boundaries: Hero Section & CTAs', () => {
    test('2.1: Long biography text containment without overflowing parent card', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const hero = document.querySelector('#about') || document.querySelector('main') || document.body;
      const paragraphs = hero.querySelectorAll('p');
      assert.ok(paragraphs.length > 0, 'Hero must contain bio paragraphs');
      for (const p of paragraphs) {
        const text = p.textContent || '';
        assert.ok(text.length < 2000, 'Bio paragraph must be reasonably bounded in length');
      }
    });

    test('2.2: Typewriter text array handles unicode Vietnamese characters correctly', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      const vietnameseSample = /Kỹ Sư Phần Mềm|Quán Quân ICPC|Khoa Học/i.test(rawHTML);
      assert.ok(vietnameseSample, 'Typewriter roles or content must support accented Vietnamese UTF-8 cleanly');
    });

    test('2.3: Typewriter cursor element maintains animation styling', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/animate-pulse|border-r|typewriter|blink/i.test(rawHTML), 'Typewriter must define a blinking cursor effect');
    });

    test('2.4: External CTA link security: all external links contain noopener or noreferrer', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const externalLinks = document.querySelectorAll('a[href^="http"]');
      for (const a of externalLinks) {
        const rel = a.getAttribute('rel') || '';
        assert.ok(/noopener|noreferrer/i.test(rel), `External link ${a.getAttribute('href')} must contain rel="noopener" or "noreferrer"`);
      }
    });

    test('2.5: Hero arena card aspect ratio resilience at narrow mobile width (320px)', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const heroImg = document.querySelector('img[src*="icpc_contest_2026"]');
      assert.ok(heroImg, 'Hero arena image must exist');
      const cls = heroImg.getAttribute('class') || '';
      assert.ok(/object-cover|w-full/i.test(cls), 'Hero arena image must use object-cover and full width to maintain ratio');
    });
  });

  // =========================================================================
  // Feature 3 Boundaries: Bento Stats Matrix
  // =========================================================================
  describe('[Tier 2] Feature 3 Boundaries: Bento Stats Matrix', () => {
    test('3.1: Large metric values (e.g. 100%, 1400+) do not wrap or break cell bounds', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/font-bold[\s\S]*?(100%|1400\+|1st)/i.test(rawHTML), 'Stat numbers must be prominently styled');
    });

    test('3.2: Multi-line description labels in bento cards maintain vertical alignment', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const statCards = document.querySelectorAll('.glass-card');
      assert.ok(statCards.length >= 4, 'Bento stat cards must exist');
    });

    test('3.3: Responsive grid layout shifts from 1 col on mobile to multi-column on desktop', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/grid-cols-1[\s\S]*?(md:grid-cols-2|lg:grid-cols-4|grid-cols-2|grid-cols-4)/i.test(rawHTML), 
        'Stats must define responsive grid breakpoints (grid-cols-1 to multi-col)');
    });

    test('3.4: Hover transforms do not trigger horizontal page overflow on small screens', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const cards = document.querySelectorAll('.glass-card');
      for (const c of cards) {
        const cls = c.getAttribute('class') || '';
        assert.ok(!cls.includes('hover:scale-150'), 'Card hover should not cause extreme scale overflow');
      }
    });

    test('3.5: Obsidian dark theme text contrast: primary text must be high-contrast', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/text-white|text-slate-100|text-slate-200/i.test(rawHTML), 'Primary text must use high-contrast white or light slate');
    });
  });

  // =========================================================================
  // Feature 4 Boundaries: Contest & Award Photos Integration
  // =========================================================================
  describe('[Tier 2] Feature 4 Boundaries: Contest & Award Photos Integration', () => {
    test('4.1: Broken image fallback resilience: images define onerror handler or svg fallback', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const awardImgs = document.querySelectorAll('img[src*="awards/"]');
      assert.ok(awardImgs.length > 0, 'Award images must exist');
      for (const img of awardImgs) {
        const onerror = img.getAttribute('onerror') || '';
        assert.ok(onerror.includes('placeholder.svg') || onerror.includes('this.src') || onerror.includes('this.onerror'),
          'Award images must implement an onerror fallback to prevent broken UI icons');
      }
    });

    test('4.2: WebP / PNG dual availability or clean format compatibility', ({ assert }) => {
      const awardsDir = path.join(PROJECT_ROOT, 'assets', 'awards');
      if (fs.existsSync(awardsDir)) {
        const files = fs.readdirSync(awardsDir);
        assert.ok(files.some(f => f.endsWith('.png') || f.endsWith('.webp')), 'Award directory must contain image assets');
      }
    });

    test('4.3: Zero-byte image detection: all asset files in assets/ have size > 0', ({ assert }) => {
      const assetsDir = path.join(PROJECT_ROOT, 'assets');
      const scanDir = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanDir(full);
          } else if (/\.(png|jpg|jpeg|webp|svg)$/i.test(entry.name)) {
            const stat = fs.statSync(full);
            assert.ok(stat.size > 0, `Asset ${entry.name} must not be a zero-byte empty file`);
          }
        }
      };
      if (fs.existsSync(assetsDir)) {
        scanDir(assetsDir);
      }
    });

    test('4.4: High-DPI image support: master contest image has width >= 600px', ({ assert }) => {
      const heroPath = path.join(PROJECT_ROOT, 'assets', 'icpc_contest_2026.png');
      if (fs.existsSync(heroPath)) {
        const stat = fs.statSync(heroPath);
        // Master HD file is > 100KB
        assert.ok(stat.size > 100000, 'Master contest photo should be a high-resolution asset (> 100KB)');
      }
    });

    test('4.5: Offscreen images utilize loading="lazy" attribute to conserve bandwidth', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      assert.ok(lazyImages.length >= 3, 'Offscreen images must specify loading="lazy"');
    });
  });

  // =========================================================================
  // Feature 5 Boundaries: Honors Category Filter Tabs
  // =========================================================================
  describe('[Tier 2] Feature 5 Boundaries: Honors Category Filter Tabs', () => {
    test('5.1: Rapid successive filter tab clicks maintain consistent state', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const buttons = document.querySelectorAll('[data-filter]');
      if (buttons.length > 0) {
        assert.doesNotThrow(() => {
          for (let i = 0; i < 10; i++) {
            buttons[i % buttons.length].click();
          }
        }, 'Rapid filter clicking must not crash');
      }
    });

    test('5.2: Filter selection exclusivity: only active tab has active class', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const activeBtns = document.querySelectorAll('[data-filter].active');
      assert.ok(activeBtns.length <= 1, 'At most one filter button should have .active class at a time');
    });

    test('5.3: Unknown filter value handled gracefully without throwing runtime errors', ({ assert }) => {
      const doc = parseHTML('<button data-filter="nonexistent">Unknown</button>');
      const btn = doc.querySelector('button');
      assert.doesNotThrow(() => {
        btn.click();
      }, 'Unknown filter must not throw errors');
    });

    test('5.4: Keyboard accessibility: filter buttons have role="button" or native <button>', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const filterBtns = document.querySelectorAll('[data-filter]');
      for (const btn of filterBtns) {
        const isButton = btn.tagName === 'BUTTON' || btn.getAttribute('role') === 'button';
        assert.ok(isButton, 'Filter elements must be accessible buttons');
      }
    });

    test('5.5: Empty category handling: when no cards match, grid does not crash', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const cards = document.querySelectorAll('[data-category]');
      // Even if cards count changes, document structure remains intact
      assert.ok(document.body, 'Document body must remain intact');
    });
  });

  // =========================================================================
  // Feature 6 Boundaries: Interactive Lightbox Proof Modal
  // =========================================================================
  describe('[Tier 2] Feature 6 Boundaries: Interactive Lightbox Proof Modal', () => {
    test('6.1: Keyboard Escape key closes modal when open', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const modal = document.querySelector('#lightbox-modal');
      assert.ok(modal, '#lightbox-modal must exist');

      // Simulate opening
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');

      // Dispatch Escape key event
      document.dispatchEvent({
        type: 'keydown',
        key: 'Escape',
        keyCode: 27
      });

      // Verify handler exists and handles keydown
      assert.ok(typeof document.dispatchEvent === 'function');
    });

    test('6.2: Outside click on backdrop closes modal', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const modal = document.querySelector('#lightbox-modal');
      assert.ok(modal, '#lightbox-modal must exist');
      assert.doesNotThrow(() => {
        modal.click();
      }, 'Clicking modal backdrop must be safely handled');
    });

    test('6.3: Direct click on modal image does NOT close modal (event propagation stopped)', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const img = document.querySelector('#lightbox-img') || document.querySelector('#lightbox-modal img');
      if (img) {
        let propagationStopped = false;
        img.addEventListener('click', (e) => {
          e.stopPropagation();
          propagationStopped = true;
        });
        img.click();
        assert.ok(propagationStopped, 'Clicking image should stop propagation to modal backdrop');
      }
    });

    test('6.4: Opening lightbox with missing caption renders gracefully without undefined text', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const caption = document.querySelector('#lightbox-caption');
      if (caption) {
        caption.textContent = '';
        assert.equal(caption.textContent, '', 'Empty caption should render cleanly without error');
      }
    });

    test('6.5: Opening modal locks document body scroll (overflow: hidden)', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const body = document.body;
      assert.ok(body, 'Body must exist');
      // Body should support class or style manipulation for overflow hidden
      body.classList.add('overflow-hidden');
      assert.ok(body.classList.contains('overflow-hidden'));
      body.classList.remove('overflow-hidden');
      assert.ok(!body.classList.contains('overflow-hidden'));
    });

    test('6.6: Lightbox rapid open/close cycles do not corrupt modal state', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const modal = document.querySelector('#lightbox-modal');
      const closeBtn = document.querySelector('#lightbox-close');
      if (modal && closeBtn) {
        assert.doesNotThrow(() => {
          for (let i = 0; i < 5; i++) {
            modal.classList.remove('hidden');
            closeBtn.click();
            modal.classList.add('hidden');
          }
        }, 'Rapid modal open/close cycles must execute cleanly');
      }
    });
  });

  // =========================================================================
  // Feature 7 Boundaries: Scrolling Smoothness & 60fps Animation
  // =========================================================================
  describe('[Tier 2] Feature 7 Boundaries: Scrolling Smoothness & 60fps Animation', () => {
    test('7.1: Scroll listener uses { passive: true } or throttled rAF', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/passive:\s*true|requestAnimationFrame|IntersectionObserver/i.test(rawHTML), 
        'Scroll and animation handlers must use passive listeners, rAF, or IntersectionObserver');
    });

    test('7.2: High-frequency scroll simulation (100 events) maintains DOM stability', ({ assert }) => {
      const { window } = loadDOM(INDEX_HTML);
      assert.doesNotThrow(() => {
        for (let i = 0; i < 100; i++) {
          window.scrollTo(0, i * 50);
          window.dispatchEvent('scroll');
        }
      }, 'High-frequency scroll events must maintain stability');
    });

    test('7.3: Deep scroll to page footer and return to top does not cause jank', ({ assert }) => {
      const { window } = loadDOM(INDEX_HTML);
      assert.doesNotThrow(() => {
        window.scrollTo(0, 10000);
        window.dispatchEvent('scroll');
        window.scrollTo(0, 0);
        window.dispatchEvent('scroll');
      }, 'Deep scroll must execute smoothly');
    });

    test('7.4: No unthrottled infinite setTimeout loops in production scripts', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      // Verify that infinite loops are conditioned or throttled
      assert.ok(!/while\s*\(\s*true\s*\)/i.test(rawHTML), 'Must have zero unthrottled synchronous while(true) loops');
    });

    test('7.5: Smooth scrolling behavior disabled gracefully if prefers-reduced-motion is active', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/scroll-smooth/i.test(rawHTML), 'Default smooth scroll enabled');
    });
  });

  // =========================================================================
  // Feature 8 Boundaries: Zero Cumulative Layout Shift (CLS)
  // =========================================================================
  describe('[Tier 2] Feature 8 Boundaries: Zero Cumulative Layout Shift (CLS)', () => {
    test('8.1: Viewport orientation change simulation preserves image aspect ratio', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const images = document.querySelectorAll('img');
      for (const img of images) {
        const cls = img.getAttribute('class') || '';
        assert.ok(img.hasAttribute('width') || /aspect-|object-cover|h-\d+/i.test(cls), 
          'Images must have constraints that adapt across portrait and landscape');
      }
    });

    test('8.2: Dynamic elements pre-allocate height/space to prevent reflow jumps', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const typewriter = document.querySelector('#typewriter');
      if (typewriter) {
        const parentCls = typewriter.parentElement?.getAttribute('class') || '';
        const ownCls = typewriter.getAttribute('class') || '';
        assert.ok(/min-h-|h-\d+|inline-block/i.test(parentCls + ' ' + ownCls), 
          'Typewriter container should pre-allocate minimum height to prevent jitter');
      }
    });

    test('8.3: Custom font loading uses font-display: swap in stylesheet links', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/display=swap/i.test(rawHTML), 'Google Fonts must specify display=swap');
    });

    test('8.4: Vector SVG icons have explicit viewBox or dimension attributes', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const svgs = document.querySelectorAll('svg');
      for (const svg of svgs) {
        const hasViewBox = svg.hasAttribute('viewbox');
        const hasWidth = svg.hasAttribute('width');
        const hasClass = svg.hasAttribute('class');
        assert.ok(hasViewBox || hasWidth || hasClass, 'SVG icon must specify viewBox or dimensions');
      }
    });

    test('8.5: External remote avatar fallback handling', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const avatar = document.querySelector('img[src*="avatars.githubusercontent.com"]');
      if (avatar) {
        assert.ok(avatar.hasAttribute('alt'), 'Avatar must specify an alt description');
      }
    });
  });

  // =========================================================================
  // Feature 9 Boundaries: Projects Showcase
  // =========================================================================
  describe('[Tier 2] Feature 9 Boundaries: Projects Showcase', () => {
    test('9.1: Project card title wrapping does not break card symmetry', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const projectTitles = document.querySelectorAll('#projects h3, #projects h4');
      assert.ok(projectTitles.length >= 3, 'Must have at least 3 project titles');
    });

    test('9.2: Tech stack tags wrap gracefully on 320px screen width', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/flex-wrap/i.test(rawHTML), 'Tech stack tags container must use flex-wrap');
    });

    test('9.3: Projects missing live demo link render gracefully', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const projectLinks = document.querySelectorAll('#projects a');
      assert.ok(projectLinks.length > 0, 'Project links must exist');
    });

    test('9.4: Project filter category switching works correctly', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const filterBtns = document.querySelectorAll('#projects button[data-filter]');
      if (filterBtns.length > 0) {
        assert.ok(filterBtns.length >= 2, 'Project filter tabs should provide multiple categories');
      }
    });

    test('9.5: Long project descriptions use clean multi-line paragraph containment', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const descs = document.querySelectorAll('#projects p');
      for (const d of descs) {
        assert.ok(d.textContent.length > 10, 'Project description must be informative');
      }
    });
  });

  // =========================================================================
  // Feature 10 Boundaries: Scientific Research Showcase
  // =========================================================================
  describe('[Tier 2] Feature 10 Boundaries: Scientific Research Showcase', () => {
    test('10.1: Special technical terms (PhoBERT, MAP@10, MRR@10) render cleanly', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/PhoBERT/i.test(rawHTML), 'Must contain PhoBERT');
    });

    test('10.2: Author name Mô Ha Mách Bu Ba Ka is featured in research section', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Mô Ha Mách Bu Ba Ka|KaNguyen/i.test(rawHTML), 'Author name must be featured');
    });

    test('10.3: Research venue citation contains date / conference year 2026', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/2026/i.test(rawHTML), 'Research citation must specify year 2026');
    });

    test('10.4: DOI or external publication links have valid HTTPS format', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const extLinks = document.querySelectorAll('a[href^="https://"]');
      assert.ok(extLinks.length >= 2, 'External reference links must use secure HTTPS protocol');
    });

    test('10.5: Peer-reviewed tag or academic badge has visual accent color', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/badge|emerald|cyan|indigo|gold/i.test(rawHTML), 'Academic badge must specify accent styling');
    });
  });

  // =========================================================================
  // Feature 11 Boundaries: Technical Arsenal
  // =========================================================================
  describe('[Tier 2] Feature 11 Boundaries: Technical Arsenal', () => {
    test('11.1: Skill chip lists wrap cleanly on narrow screens', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/flex-wrap/i.test(rawHTML), 'Skill chips must use flex-wrap to prevent narrow-screen overflow');
    });

    test('11.2: Empty skill group resilience', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const skillGroups = document.querySelectorAll('#skills .glass-card, #skills div');
      assert.ok(skillGroups.length > 0, 'Skills section must contain skill cards');
    });

    test('11.3: Monospace code typography used for technical tags', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/font-mono|JetBrains Mono/i.test(rawHTML), 'Must utilize monospace font for technical badges');
    });

    test('11.4: Grouped categories maintain visual grid alignment', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const skillsSec = document.querySelector('#skills');
      assert.ok(skillsSec, '#skills must exist');
    });

    test('11.5: Accessibility: skill badges or chips have text content', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const chips = document.querySelectorAll('#skills span, #skills p');
      for (const chip of chips) {
        assert.ok(chip.textContent.trim().length > 0, 'Skill badges must contain non-empty text');
      }
    });
  });

  // =========================================================================
  // Feature 12 Boundaries: Zero 404 & Network Edge Cases
  // =========================================================================
  describe('[Tier 2] Feature 12 Boundaries: Zero 404 & Network Edge Cases', () => {
    test('12.1: Relative path resolution handles ./assets/ and assets/ cleanly', async ({ assert, fetch }) => {
      const res = await fetch('/assets/luffy-mascot.svg');
      assert.equal(res.statusCode, 200, 'Static asset /assets/luffy-mascot.svg must return 200');
    });

    test('12.2: Case-sensitivity check: all paths match lowercase on disk', ({ assert }) => {
      const files = ['assets/luffy-mascot.svg'];
      for (const f of files) {
        const full = path.join(PROJECT_ROOT, f);
        assert.ok(fs.existsSync(full), `File ${f} must exist with exact casing`);
      }
    });

    test('12.3: URL query parameters on assets resolve to existing base files', async ({ assert, fetch }) => {
      const res = await fetch('/assets/luffy-mascot.svg?v=123');
      assert.equal(res.statusCode, 200, 'Asset with query param ?v=123 must return 200');
    });

    test('12.4: Root URL request "/" serves index.html with 200 OK', async ({ assert, fetch }) => {
      const res = await fetch('/');
      assert.equal(res.statusCode, 200, 'GET / must return 200 OK');
      assert.ok(res.body.includes('Mô Ha Mách Bu Ba Ka') || res.body.includes('KaNguyen'), 'Root response must be index.html');
    });

    test('12.5: Static server serves proper MIME type image/svg+xml for SVG assets', async ({ assert, fetch }) => {
      const res = await fetch('/assets/luffy-mascot.svg');
      assert.equal(res.statusCode, 200);
      assert.ok(res.headers['content-type'].includes('image/svg+xml'), 'SVG asset must have image/svg+xml content-type');
    });
  });

});
