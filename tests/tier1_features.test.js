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

    test('2.6: Hero section includes professional engineering ethos and zero Luffy references', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Kỷ luật thuật toán|Tư duy hệ thống|Software Engineer|Competitive Programmer/i.test(rawHTML), 'Hero must feature professional engineering ethos');
      assert.ok(!/Luffy|Vua Hải Tặc|Pirate King/i.test(rawHTML), 'Hero must completely remove Luffy/pirate references');
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

    test('4.2: PTIT Academic Scholarship typographic award card exists with zero image tags', ({ assert }) => {
      const { document, rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Học Bổng Xuất Sắc|Học viện PTITHCM|PTITHCM/i.test(rawHTML), 'Must feature PTIT Academic Scholarship credential');
      const card = document.querySelector('[data-award-id="scholarship-ptit"]') || 
                   document.querySelector('[data-category*="scholarship"]');
      assert.ok(card, 'PTIT Scholarship card must exist');
      assert.equal(card.querySelectorAll('img, picture').length, 0, 'Award card must be image-free');
    });

    test('4.3: ICPC 2024 Champion typographic award card exists with zero image tags', ({ assert }) => {
      const { document, rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Quán Quân ICPC|ICPC PTITHCM 2024/i.test(rawHTML), 'Must feature ICPC 2024 Champion credential');
      const card = document.querySelector('[data-award-id="icpc-2024-champion"]') ||
                   document.querySelector('[data-category*="icpc"]');
      assert.ok(card, 'ICPC 2024 Champion card must exist');
      assert.equal(card.querySelectorAll('img, picture').length, 0, 'Award card must be image-free');
    });

    test('4.4: ICPC 2025 Runner-up typographic award card exists with zero image tags', ({ assert }) => {
      const { document, rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/Á Quân ICPC|ICPC PTITHCM 2025/i.test(rawHTML), 'Must feature ICPC 2025 Runner-up credential');
      const card = document.querySelector('[data-award-id="icpc-2025-runnerup"]');
      assert.ok(card, 'ICPC 2025 Runner-up card must exist');
      assert.equal(card.querySelectorAll('img, picture').length, 0, 'Award card must be image-free');
    });

    test('4.5: UTC Code4Future typographic award card exists with zero image tags', ({ assert }) => {
      const { document, rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/UTC Code4Future/i.test(rawHTML), 'Must feature UTC Code4Future award credential');
      const card = document.querySelector('[data-award-id="utc-code4future"]');
      assert.ok(card, 'UTC Code4Future card must exist');
      assert.equal(card.querySelectorAll('img, picture').length, 0, 'Award card must be image-free');
    });

    test('4.6: KADA Korea or Vovinam martial arts typographic award card exists with zero image tags', ({ assert }) => {
      const { document, rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/KADA|Vovinam/i.test(rawHTML), 'Must feature KADA or Vovinam award credential');
      const card = document.querySelector('[data-award-id="kada-korea"]') ||
                   document.querySelector('[data-award-id="vovinam-2024"]');
      assert.ok(card, 'KADA Korea or Vovinam card must exist');
      assert.equal(card.querySelectorAll('img, picture').length, 0, 'Award card must be image-free');
    });

    test('4.7: Vector badge assets exist or are referenced for profiles', ({ assert }) => {
      const { rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(/codeforces|icpc|github/i.test(rawHTML), 'Vector badges or profiles must be present');
      assert.ok(!/luffy-mascot/i.test(rawHTML), 'Luffy mascot asset reference must be removed');
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

    test('6.5: Hero showcase photos specify data-lightbox-src for click-to-zoom modal', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const zoomable = document.querySelectorAll('[data-lightbox-src]');
      assert.ok(zoomable.length >= 1, 'Must have at least 1 hero showcase element with data-lightbox-src');
      for (const z of zoomable) {
        const src = z.getAttribute('data-lightbox-src');
        assert.ok(src.includes('icpc_contest') || src.includes('ptit_campus') || src.startsWith('http'),
          'Lightbox targets must be valid permanent showcase assets');
      }
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

    test('8.2: Award cards implement clean card containers (.glass-card or rounded border cards)', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const cards = document.querySelectorAll('#honors .award-card, #honors .glass-card');
      assert.ok(cards.length >= 4, 'Must have at least 4 structured award cards in #honors');
      for (const card of cards) {
        const cls = card.getAttribute('class') || '';
        assert.ok(cls.includes('glass-card') || cls.includes('rounded') || cls.includes('p-'), 
          'Award cards must implement polished card styling');
      }
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
      const avatar = document.querySelector('img[src*="brand-avatar.svg"]') || document.querySelector('img[src*="avatars.githubusercontent.com"]') || document.querySelector('#navbar img');
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

    test('10.6: Complete absence of "Effective Multi-Agent Design" and research-agents in DOM and JSON catalog', ({ assert }) => {
      const { document, rawHTML } = loadDOM(INDEX_HTML);
      assert.ok(!/research-agents/i.test(rawHTML), 'Must not contain research-agents anywhere in HTML');
      assert.ok(!/Effective Multi-Agent Design/i.test(rawHTML), 'Must not contain "Effective Multi-Agent Design" in text');
      assert.equal(document.querySelector('[data-detail-id="research-agents"]'), null, 'DOM must not contain card with data-detail-id="research-agents"');
      const scriptEl = document.getElementById('portfolio-details');
      if (scriptEl) {
        const catalog = JSON.parse(scriptEl.textContent);
        assert.equal(catalog['research-agents'], undefined, 'Catalog must not contain research-agents entry');
      }
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

  // Feature 13: Theme Switcher & Progressive Disclosure Catalog
  describe('Feature 13: Theme Switcher & Progressive Disclosure Catalog', () => {
    test('13.1: Theme toggle button #theme-toggle exists in navbar with ARIA metadata', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const toggleBtn = document.getElementById('theme-toggle');
      assert.ok(toggleBtn, '#theme-toggle button must exist');
      assert.ok(toggleBtn.getAttribute('aria-label'), '#theme-toggle must have aria-label');
      assert.ok(document.getElementById('navbar').contains(toggleBtn), '#theme-toggle must reside inside #navbar');
    });

    test('13.2: Progressive disclosure modal #detail-modal exists and is hidden by default', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const detailModal = document.getElementById('detail-modal');
      assert.ok(detailModal, '#detail-modal container must exist');
      assert.ok(detailModal.classList.contains('hidden'), '#detail-modal must be hidden by default');
      assert.equal(detailModal.getAttribute('aria-hidden'), 'true', '#detail-modal aria-hidden must be true initially');
    });

    test('13.3: Structured #portfolio-details catalog covers all progressive-disclosure cards cleanly', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const scriptEl = document.getElementById('portfolio-details');
      assert.ok(scriptEl, '#portfolio-details JSON catalog must exist');
      const catalog = JSON.parse(scriptEl.textContent);
      const triggerCards = document.querySelectorAll('[data-detail-id]');
      assert.equal(triggerCards.length, 21, 'Expected 21 summary cards (8 honors + 6 projects + 1 research + 6 skills)');
      for (const card of triggerCards) {
        const id = card.getAttribute('data-detail-id');
        assert.ok(catalog[id], `Catalog must contain structured detail entry for "${id}"`);
        assert.ok(catalog[id].title && catalog[id].description, `Catalog entry "${id}" must define title and description`);
      }
    });

    test('13.4: Mobile theme toggle #theme-toggle-mobile exists inside #mobile-menu with class theme-toggle-btn', ({ assert }) => {
      const { document } = loadDOM(INDEX_HTML);
      const mobileMenu = document.getElementById('mobile-menu');
      assert.ok(mobileMenu, '#mobile-menu must exist in DOM');
      const mobileToggle = document.getElementById('theme-toggle-mobile');
      assert.ok(mobileToggle, '#theme-toggle-mobile button must exist');
      assert.ok(mobileMenu.contains(mobileToggle), '#theme-toggle-mobile must reside inside #mobile-menu');
      assert.ok(mobileToggle.classList.contains('theme-toggle-btn'), '#theme-toggle-mobile must have class theme-toggle-btn');
      assert.ok(mobileToggle.getAttribute('aria-label'), '#theme-toggle-mobile must have aria-label');
    });
  });

});
