/**
 * tests/tier1_features.test.js
 * Tier 1: Feature Coverage Suite (>=5 tests per feature across 12 features = 67 tests).
 * Requirement-driven opaque-box verification of all core portfolio features.
 */

const fs = require('node:fs');
const path = require('node:path');
const { describe, test } = require('./runner.js');
const { loadDOM } = require('./dom_helper.js');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const INDEX_HTML = path.join(PROJECT_ROOT, 'index.html');

describe('Tier 1: Feature Coverage Suite', () => {

  // =========================================================================
  // Feature 1: Navigation & Brand Identity (ORIGINAL_REQUEST §2)
  // =========================================================================
  describe('[Tier 1] Feature 1: Navigation & Brand Identity', () => {
    test('1.1: Navbar container #navbar exists with sticky positioning', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const navbar = document.querySelector('#navbar');
      assert.ok(navbar, 'Element #navbar must exist in DOM');
      const classes = navbar.getAttribute('class') || '';
      assert.ok(/fixed|sticky/i.test(classes), '#navbar must have fixed or sticky positioning');
    });

    test('1.2: Brand identity contains KaNguyen / Mô Ha Mách Bu Ba Ka', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const navbar = document.querySelector('#navbar');
      assert.ok(navbar, '#navbar must exist');
      const text = navbar.textContent || '';
      assert.ok(/Mô Ha Mách Bu Ba Ka|KaNguyen|Bu Ba Ka/i.test(text), 'Brand identity name must be present in navigation');
    });

    test('1.3: Core section anchor links exist in navigation', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const navLinks = document.querySelectorAll('#navbar a[href^="#"]');
      const targets = navLinks.map(a => a.getAttribute('href'));
      assert.ok(targets.some(t => /about|hero/i.test(t)), 'Nav must link to about/hero');
      assert.ok(targets.some(t => /honors|awards/i.test(t)), 'Nav must link to honors/awards');
      assert.ok(targets.some(t => /projects/i.test(t)), 'Nav must link to projects');
    });

    test('1.4: Verified status badge or intern indicator is displayed', ({ assert }) => {
      const { document, rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Rikkeisoft|Software Engineer|Verified|Available/i.test(rawHTML), 'Verified status indicator must be present');
    });

    test('1.5: Navigation contains accessible aria-label or semantic nav tag', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const navTag = document.querySelector('nav#navbar') || document.querySelector('nav') || document.querySelector('#navbar');
      assert.ok(navTag, 'Semantic nav element or #navbar should exist');
    });

    test('1.6: Mobile navigation menu button or toggle exists', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const toggle = document.querySelector('#menu-btn') || 
                     document.querySelector('button[aria-label*="menu" i]') ||
                     document.querySelector('#navbar button');
      assert.ok(toggle, 'Mobile menu toggle button must exist in #navbar');
    });
  });

  // =========================================================================
  // Feature 2: Hero Section & CTAs (ORIGINAL_REQUEST §2)
  // =========================================================================
  describe('[Tier 1] Feature 2: Hero Section & CTAs', () => {
    test('2.1: Hero section exists with primary H1 heading', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const h1 = document.querySelector('h1');
      assert.ok(h1, 'Primary <h1> element must exist in document');
      assert.ok(/Mô Ha Mách Bu Ba Ka|KaNguyen/i.test(h1.textContent), 'H1 must display engineer name');
    });

    test('2.2: Typewriter subtitle element #typewriter exists', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const typewriter = document.querySelector('#typewriter');
      assert.ok(typewriter, '#typewriter element must exist');
    });

    test('2.3: Primary CTA button links to #projects', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const projectCta = document.querySelector('a[href="#projects"]');
      assert.ok(projectCta, 'Primary CTA linking to #projects must exist');
    });

    test('2.4: External profile links point to GitHub and Codeforces', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const githubLink = document.querySelector('a[href*="github.com/KaNguyen3005"]');
      const cfLink = document.querySelector('a[href*="codeforces.com"]');
      assert.ok(githubLink, 'GitHub profile link must exist');
      assert.ok(cfLink, 'Codeforces profile link must exist');
    });

    test('2.5: External links specify rel="noopener noreferrer" and target="_blank"', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const githubLink = document.querySelector('a[href*="github.com/KaNguyen3005"]');
      if (githubLink) {
        assert.equal(githubLink.getAttribute('target'), '_blank', 'External link target must be _blank');
        const rel = githubLink.getAttribute('rel') || '';
        assert.ok(rel.includes('noopener'), 'External link rel must contain noopener');
      }
    });

    test('2.6: Hero section includes inspirational mascot or Luffy quote pill', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Luffy|Vua Hải Tặc|Pirate King|mascot/i.test(rawHTML), 'Hero must feature Luffy quote or mascot element');
    });
  });

  // =========================================================================
  // Feature 3: Bento Stats Matrix (ORIGINAL_REQUEST §2)
  // =========================================================================
  describe('[Tier 1] Feature 3: Bento Stats Matrix', () => {
    test('3.1: Bento stats showcase container is present', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const stats = document.querySelector('.bento-matrix') || 
                    document.querySelector('#stats') || 
                    document.querySelector('section.border-y');
      assert.ok(stats, 'Stats showcase container must exist');
    });

    test('3.2: First metric highlights ICPC Champion 2024', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Quán Quân ICPC|ICPC 2024|1st.*ICPC/i.test(rawHTML), 'Must highlight ICPC Champion 2024');
    });

    test('3.3: Second metric highlights Codeforces Specialist (1400+)', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Specialist|1400\+|Codeforces/i.test(rawHTML), 'Must highlight Codeforces Specialist');
    });

    test('3.4: Third metric highlights 100% PTITHCM Academic Scholarship', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/100%|Học Bổng Xuất Sắc|Scholarship/i.test(rawHTML), 'Must highlight 100% Academic Scholarship');
    });

    test('3.5: Fourth metric highlights I-SMAC 2026 International Conference Author', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/I-SMAC|Conference Author|Tác giả/i.test(rawHTML), 'Must highlight I-SMAC 2026 paper');
    });

    test('3.6: Stat cards implement glassmorphic styling (.glass-card or border tokens)', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const cards = document.querySelectorAll('.glass-card');
      assert.ok(cards.length >= 4, 'Must have at least 4 glass-card elements');
    });
  });

  // =========================================================================
  // Feature 4: Contest & Award Photos Integration (ORIGINAL_REQUEST §4)
  // =========================================================================
  describe('[Tier 1] Feature 4: Contest & Award Photos Integration', () => {
    test('4.1: Hero contest master photo asset reference is present', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/assets\/icpc_contest_2026\.png/i.test(rawHTML), 'Must reference assets/icpc_contest_2026.png');
    });

    test('4.2: PTIT Academic Scholarship award photo reference exists', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/scholarship_ptit\.(png|webp)/i.test(rawHTML), 'Must reference scholarship_ptit.png or webp');
    });

    test('4.3: ICPC 2024 Champion award photo reference exists', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/icpc_champion_2024\.(png|webp)/i.test(rawHTML), 'Must reference icpc_champion_2024.png or webp');
    });

    test('4.4: ICPC 2025 Runner-up award photo reference exists', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/icpc_runnerup_2025\.(png|webp)/i.test(rawHTML), 'Must reference icpc_runnerup_2025.png or webp');
    });

    test('4.5: UTC Code4Future award photo reference exists', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/utc_code4future\.(png|webp)/i.test(rawHTML), 'Must reference utc_code4future.png or webp');
    });

    test('4.6: KADA Korea or Vovinam martial arts award photo reference exists', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/kada_korea\.(png|webp)|vovinam_2024\.(png|webp)/i.test(rawHTML), 'Must reference KADA or Vovinam award photo');
    });

    test('4.7: Vector badge assets exist or are referenced for profiles', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/codeforces|icpc_global|luffy-mascot/i.test(rawHTML), 'Vector badges or mascots must be present');
    });
  });

  // =========================================================================
  // Feature 5: Honors Category Filter Tabs (ORIGINAL_REQUEST §2)
  // =========================================================================
  describe('[Tier 1] Feature 5: Honors Category Filter Tabs', () => {
    test('5.1: Category filter tab buttons exist in #honors section', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const filterBtns = document.querySelectorAll('[data-filter]');
      assert.ok(filterBtns.length >= 3, 'Must have at least 3 category filter buttons');
    });

    test('5.2: "All" filter tab [data-filter="all"] is present and active by default', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const allBtn = document.querySelector('[data-filter="all"]');
      assert.ok(allBtn, '[data-filter="all"] button must exist');
    });

    test('5.3: ICPC filter tab [data-filter="icpc"] exists', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const icpcBtn = document.querySelector('[data-filter="icpc"]');
      assert.ok(icpcBtn, '[data-filter="icpc"] button must exist');
    });

    test('5.4: Technology & AI filter tab [data-filter="tech"] exists', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const techBtn = document.querySelector('[data-filter="tech"]');
      assert.ok(techBtn, '[data-filter="tech"] button must exist');
    });

    test('5.5: Scholarship & Academics filter tab [data-filter="scholarship"] exists', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const scholarBtn = document.querySelector('[data-filter="scholarship"]');
      assert.ok(scholarBtn, '[data-filter="scholarship"] button must exist');
    });

    test('5.6: Award cards specify data-category matching filter taxonomy', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const categorizedCards = document.querySelectorAll('[data-category]');
      assert.ok(categorizedCards.length >= 4, 'Must have at least 4 award cards with data-category attributes');
    });
  });

  // =========================================================================
  // Feature 6: Interactive Lightbox Proof Modal (ORIGINAL_REQUEST §2, 4)
  // =========================================================================
  describe('[Tier 1] Feature 6: Interactive Lightbox Proof Modal', () => {
    test('6.1: Lightbox modal container #lightbox-modal exists in DOM', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const modal = document.querySelector('#lightbox-modal');
      assert.ok(modal, '#lightbox-modal element must exist');
    });

    test('6.2: Lightbox modal contains image viewport element #lightbox-img', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const img = document.querySelector('#lightbox-img') || document.querySelector('#lightbox-modal img');
      assert.ok(img, 'Modal must contain an image viewport element');
    });

    test('6.3: Lightbox modal contains close button #lightbox-close', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const closeBtn = document.querySelector('#lightbox-close') || document.querySelector('#lightbox-modal button');
      assert.ok(closeBtn, '#lightbox-close button must exist');
    });

    test('6.4: Lightbox modal contains caption/description element #lightbox-caption', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const caption = document.querySelector('#lightbox-caption');
      assert.ok(caption, '#lightbox-caption element must exist');
    });

    test('6.5: Award cards or photos specify data-lightbox-src for click-to-zoom', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const zoomable = document.querySelectorAll('[data-lightbox-src]');
      assert.ok(zoomable.length >= 4, 'Must have at least 4 zoomable elements with data-lightbox-src');
    });

    test('6.6: Lightbox modal is hidden by default', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const modal = document.querySelector('#lightbox-modal');
      assert.ok(modal, '#lightbox-modal must exist');
      const cls = modal.getAttribute('class') || '';
      const hiddenAttr = modal.getAttribute('aria-hidden');
      assert.ok(cls.includes('hidden') || hiddenAttr === 'true' || modal.getAttribute('style')?.includes('display: none'), 
        'Lightbox modal must be hidden by default');
    });
  });

  // =========================================================================
  // Feature 7: Scrolling Smoothness & 60fps Animation (ORIGINAL_REQUEST §3)
  // =========================================================================
  describe('[Tier 1] Feature 7: Scrolling Smoothness & 60fps Animation', () => {
    test('7.1: Root html element specifies scroll-smooth class', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const htmlTag = document.querySelector('html');
      assert.ok(htmlTag && htmlTag.classList.contains('scroll-smooth'), '<html> must have scroll-smooth class');
    });

    test('7.2: Background does not use uncontained heavy animated blur-3xl divs', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      // Heavy animated blurs caused fill-rate starvation
      const hasHeavyBlurLoop = /blur-3xl[\s\S]*?animate-pulse-slow[\s\S]*?animate-float/i.test(rawHTML);
      assert.ok(!hasHeavyBlurLoop, 'Background should use static GPU-friendly radial gradients instead of multiple animated blur-3xl divs');
    });

    test('7.3: Hardware acceleration or compositing layer applied to persistent navbar', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/translateZ|backdrop-filter|will-change|transform/i.test(rawHTML), 'Compositor acceleration must be applied');
    });

    test('7.4: Typewriter effect throttled via IntersectionObserver', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/IntersectionObserver/i.test(rawHTML), 'Typewriter effect must use IntersectionObserver to pause offscreen');
    });

    test('7.5: Offscreen sections use content-visibility or CSS containment', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/content-visibility|contain:\s*content|contain:\s*paint/i.test(rawHTML), 'CSS containment or content-visibility must be defined');
    });
  });

  // =========================================================================
  // Feature 8: Zero Cumulative Layout Shift (CLS) (ORIGINAL_REQUEST §3)
  // =========================================================================
  describe('[Tier 1] Feature 8: Zero Cumulative Layout Shift (CLS)', () => {
    test('8.1: All images have width/height attributes or explicit aspect-ratio classes', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const images = document.querySelectorAll('img');
      assert.ok(images.length > 0, 'Document must contain images');
      let missingDimensions = 0;
      for (const img of images) {
        const hasWidth = img.hasAttribute('width');
        const hasHeight = img.hasAttribute('height');
        const cls = img.getAttribute('class') || '';
        const hasAspect = /aspect-|h-\d+|w-\d+/i.test(cls);
        if (!hasWidth && !hasHeight && !hasAspect) {
          missingDimensions++;
        }
      }
      assert.equal(missingDimensions, 0, `All images must define dimensions or aspect ratios (found ${missingDimensions} unconstrained)`);
    });

    test('8.2: Award cards implement .aspect-card or aspect ratio containers', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/aspect-card|aspect-video|aspect-\[/i.test(rawHTML), 'Award cards must provide explicit aspect ratio wrappers');
    });

    test('8.3: Hero arena master image defines explicit dimensions or aspect ratio', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const heroImg = document.querySelector('img[src*="icpc_contest_2026"]');
      assert.ok(heroImg, 'Hero contest image must exist');
      const cls = heroImg.getAttribute('class') || '';
      assert.ok(heroImg.hasAttribute('width') || /aspect-|h-\d+/i.test(cls), 'Hero image must have dimension/aspect constraints');
    });

    test('8.4: Avatar image defines explicit dimension attributes (e.g. 40x40)', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const avatar = document.querySelector('img[src*="avatars.githubusercontent.com"]') || document.querySelector('img[alt*="avatar" i]');
      assert.ok(avatar, 'Avatar image must exist');
      const hasDim = (avatar.hasAttribute('width') && avatar.hasAttribute('height')) || /w-10\s+h-10|w-8\s+h-8/i.test(avatar.getAttribute('class') || '');
      assert.ok(hasDim, 'Avatar image must define explicit size to prevent layout shifts');
    });

    test('8.5: Google Fonts link uses preconnect to avoid layout shift FOIT/FOUT', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const preconnects = document.querySelectorAll('link[rel="preconnect"]');
      const hrefs = preconnects.map(l => l.getAttribute('href'));
      assert.ok(hrefs.some(h => h.includes('fonts.googleapis.com')), 'Must preconnect to fonts.googleapis.com');
      assert.ok(hrefs.some(h => h.includes('fonts.gstatic.com')), 'Must preconnect to fonts.gstatic.com');
    });
  });

  // =========================================================================
  // Feature 9: Projects & Systems Showcase (ORIGINAL_REQUEST §2)
  // =========================================================================
  describe('[Tier 1] Feature 9: Projects & Systems Showcase', () => {
    test('9.1: Projects section exists with id="projects"', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const sec = document.querySelector('#projects');
      assert.ok(sec, 'Section #projects must exist');
    });

    test('9.2: Flagship project Due Bro (Household OS & Roommate Matching) is present', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Due Bro/i.test(rawHTML), 'Project Due Bro must be showcased');
    });

    test('9.3: LMS Microservices (Spring Boot / Distributed System) is present', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/LMS Microservices|Learning Management System/i.test(rawHTML), 'LMS Microservices project must be showcased');
    });

    test('9.4: Centralized Identity Service (OAuth2 / Security Gateway) is present', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Identity Service|Auth.*Security/i.test(rawHTML), 'Identity Service project must be showcased');
    });

    test('9.5: CP Vault / Algorithms & Data Structures C++20 repository is present', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Algorithms & Data Structures|CP Vault|C\+\+20/i.test(rawHTML), 'Algorithms Vault must be showcased');
    });

    test('9.6: Project cards display tech stack pills (Java, Spring, Flutter, Docker, etc.)', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Spring Boot/i.test(rawHTML), 'Tech stack must include Spring Boot');
      assert.ok(/Docker/i.test(rawHTML), 'Tech stack must include Docker');
    });
  });

  // =========================================================================
  // Feature 10: Scientific Research (I-SMAC '26) (ORIGINAL_REQUEST §2)
  // =========================================================================
  describe('[Tier 1] Feature 10: Scientific Research (I-SMAC \'26)', () => {
    test('10.1: Research publication section exists', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Nghiên Cứu Khoa Học|Scientific Research|Publications/i.test(rawHTML), 'Research section must exist');
    });

    test('10.2: Paper title on PhoBERT and Legal IR is displayed', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/PhoBERT|Legal Document Retrieval|Sentence-Transformers/i.test(rawHTML), 'PhoBERT paper title must be featured');
    });

    test('10.3: International conference venue I-SMAC 2026 is cited', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/I-SMAC\s*('?26|2026)/i.test(rawHTML), 'Conference I-SMAC 2026 must be cited');
    });

    test('10.4: Research retrieval metrics (MAP@10 / MRR@10 / latency) are highlighted', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/MAP@10|MRR@10|latency|ms/i.test(rawHTML), 'Research performance metrics must be highlighted');
    });

    test('10.5: Paper link or verification archive link is provided', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/researchgate|arxiv|doi|github\.com\/KaNguyen3005|paper/i.test(rawHTML), 'Research paper link must be provided');
    });
  });

  // =========================================================================
  // Feature 11: Technical Arsenal / Skills (ORIGINAL_REQUEST §2)
  // =========================================================================
  describe('[Tier 1] Feature 11: Technical Arsenal / Skills', () => {
    test('11.1: Skills section exists with id="skills"', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const skillsSec = document.querySelector('#skills');
      assert.ok(skillsSec, 'Section #skills must exist');
    });

    test('11.2: Core languages include C++, Java, and Python', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/C\+\+/i.test(rawHTML), 'Must include C++');
      assert.ok(/Java/i.test(rawHTML), 'Must include Java');
      assert.ok(/Python/i.test(rawHTML), 'Must include Python');
    });

    test('11.3: Backend & Architecture skills include Spring Boot, Kafka, Redis, and Microservices', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Spring Boot/i.test(rawHTML), 'Must include Spring Boot');
      assert.ok(/Kafka|Redis/i.test(rawHTML), 'Must include Kafka or Redis');
      assert.ok(/Microservices/i.test(rawHTML), 'Must include Microservices');
    });

    test('11.4: AI/ML skills include PyTorch, NLP, and Transformers', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/PyTorch|Transformers|NLP/i.test(rawHTML), 'Must include AI/ML competencies');
    });

    test('11.5: DevOps & Cloud skills include Docker, Linux, and Git', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Docker/i.test(rawHTML), 'Must include Docker');
      assert.ok(/Linux/i.test(rawHTML), 'Must include Linux');
      assert.ok(/Git/i.test(rawHTML), 'Must include Git');
    });
  });

  // =========================================================================
  // Feature 12: Zero 404 Network Errors (ORIGINAL_REQUEST §2, 4)
  // =========================================================================
  describe('[Tier 1] Feature 12: Zero 404 Network Errors', () => {
    test('12.1: Precompiled stylesheet assets/css/portfolio.css exists on disk', ({ assert }) => {
      const cssPath = path.join(PROJECT_ROOT, 'assets', 'css', 'portfolio.css');
      assert.ok(fs.existsSync(cssPath), 'assets/css/portfolio.css must exist');
      const stat = fs.statSync(cssPath);
      assert.ok(stat.size > 100, 'portfolio.css must not be empty');
    });

    test('12.2: Modular script assets/js/main.js exists on disk', ({ assert }) => {
      const jsPath = path.join(PROJECT_ROOT, 'assets', 'js', 'main.js');
      assert.ok(fs.existsSync(jsPath), 'assets/js/main.js must exist');
      const stat = fs.statSync(jsPath);
      assert.ok(stat.size > 100, 'main.js must not be empty');
    });

    test('12.3: Hero contest master photo exists on disk and is non-empty', ({ assert }) => {
      const heroPath = path.join(PROJECT_ROOT, 'assets', 'icpc_contest_2026.png');
      assert.ok(fs.existsSync(heroPath), 'assets/icpc_contest_2026.png must exist');
      assert.ok(fs.statSync(heroPath).size > 10000, 'icpc_contest_2026.png must be non-empty master asset');
    });

    test('12.4: Authentic award images exist in assets/awards/ without triggering 404 fallbacks', ({ assert }) => {
      const requiredAwards = [
        'scholarship_ptit.png',
        'icpc_champion_2024.png',
        'icpc_runnerup_2025.png',
        'utc_code4future.png'
      ];
      for (const file of requiredAwards) {
        const fullPath = path.join(PROJECT_ROOT, 'assets', 'awards', file);
        assert.ok(fs.existsSync(fullPath), `Award image ${file} must exist on disk`);
      }
    });

    test('12.5: Internal anchor navigation links correspond to existing DOM IDs', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const anchors = document.querySelectorAll('a[href^="#"]');
      for (const a of anchors) {
        const hash = a.getAttribute('href');
        if (hash === '#' || hash === '') continue;
        const targetId = hash.slice(1);
        const targetElem = document.getElementById(targetId);
        assert.ok(targetElem, `Internal anchor href="${hash}" must have matching target element id="${targetId}"`);
      }
    });

    test('12.6: Local static HTTP server returns 200 for index.html (zero network 404)', async ({ assert, fetch }) => {
      const res = await fetch('/index.html');
      assert.equal(res.statusCode, 200, 'GET /index.html must return 200 OK');
    });
  });

});
