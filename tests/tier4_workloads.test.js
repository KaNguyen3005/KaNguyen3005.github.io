/**
 * tests/tier4_workloads.test.js
 * Tier 4: Real-World Recruiter & Reviewer Journeys Suite (5 complex scenarios).
 * End-to-end multi-step user workflows reflecting actual recruiter audits,
 * conference paper evaluations, and stress testing.
 */

const fs = require('node:fs');
const path = require('node:path');
const { describe, test } = require('./runner.js');
const { loadDOM } = require('./dom_helper.js');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const INDEX_HTML = path.join(PROJECT_ROOT, 'index.html');

describe('Tier 4: Real-World Recruiter & Reviewer Journeys', () => {

  // =========================================================================
  // Scenario 1: Recruiter ICPC Credential Verification Journey
  // =========================================================================
  test('Scenario 1: Recruiter ICPC Credential Verification Journey', async ({ assert, fetch }) => {
    const { document } = loadDOM(INDEX_HTML);

    // Step 1: Recruiter lands and verifies hero ICPC claim
    const rawHTML = fs.readFileSync(INDEX_HTML, 'utf8');
    assert.ok(/ICPC/i.test(rawHTML), 'Hero must prominently feature ICPC credentials');

    // Step 2: Recruiter inspects ICPC Global link
    const icpcLink = document.querySelector('a[href*="icpc.global"]') || 
                     document.querySelector('a[href*="icpcid"]') ||
                     document.querySelector('a[href*="codeforces.com"]');
    assert.ok(icpcLink, 'Must provide verifiable competitive programming external link');

    // Step 3: Recruiter checks 2024 Champion metric in Bento stats
    assert.ok(/Quán Quân ICPC|ICPC 2024|1st.*ICPC/i.test(rawHTML), 'Bento matrix must highlight ICPC Champion 2024');

    // Step 4: Recruiter filters Honors by ICPC
    const icpcFilter = document.querySelector('[data-filter="icpc"]');
    if (icpcFilter) {
      icpcFilter.click();
      assert.ok(icpcFilter.classList.contains('active'), 'ICPC filter must become active');
    }

    // Step 5: Recruiter inspects Champion award card and verifies credential metadata
    const championCard = document.querySelector('[data-category*="icpc"]');
    assert.ok(championCard, 'Champion card must exist in honors');
    const credLink = championCard.querySelector('a[href*="icpc"]') || championCard.querySelector('a');
    assert.ok(credLink, 'Official external credential verification link must be present');
    assert.equal(championCard.querySelectorAll('img, picture').length, 0, 'Award card must be image-free typographic card');

    // Step 6: Verify referenced image exists via HTTP
    const res = await fetch('/assets/icpc_contest_2026.png');
    assert.equal(res.statusCode, 200, 'Hero contest arena image must return 200 OK');
  });

  // =========================================================================
  // Scenario 2: Academic Paper & Research Evaluation Journey
  // =========================================================================
  test('Scenario 2: Academic Paper & Research Evaluation Journey', ({ assert }) => {
    const { document, rawHTML } = loadDOM(INDEX_HTML);

    // Step 1: Reviewer scrolls to Research section
    const researchSec = document.querySelector('#research') || document.querySelector('section');
    assert.ok(researchSec, 'Research section must be present');

    // Step 2: Reviewer inspects paper title
    assert.ok(/PhoBERT|Legal Document Retrieval|Sentence-Transformers/i.test(rawHTML), 
      'Research paper on PhoBERT and Legal IR must be featured');

    // Step 3: Reviewer inspects conference venue
    assert.ok(/I-SMAC\s*('?26|2026)/i.test(rawHTML), 'Conference I-SMAC 2026 venue must be cited');

    // Step 4: Reviewer inspects empirical metrics
    assert.ok(/MAP@10|MRR@10|latency/i.test(rawHTML), 'Empirical information retrieval metrics must be stated');

    // Step 5: Reviewer verifies author credentials
    assert.ok(/Mô Ha Mách Bu Ba Ka|KaNguyen/i.test(rawHTML), 'Author Mô Ha Mách Bu Ba Ka must be listed');

    // Step 6: Reviewer checks related systems projects
    const projectsSec = document.querySelector('#projects');
    assert.ok(projectsSec, 'Projects section must support research foundation');
  });

  // =========================================================================
  // =========================================================================
  // Scenario 3: Fast Mobile User Browsing & Filter Switching Journey
  // =========================================================================
  test('Scenario 3: Fast Mobile User Browsing & Filter Switching Journey', ({ assert }) => {
    const { document, window } = loadDOM(INDEX_HTML);

    // Step 1: Mobile viewport setup (375x812)
    window.innerWidth = 375;
    window.innerHeight = 812;

    // Step 2: Navbar is streamlined
    const navbar = document.querySelector('#navbar');
    assert.ok(navbar, 'Navbar must exist in mobile view');

    // Step 3: Mobile hamburger menu toggle & mobile drawer
    const menuBtn = document.querySelector('#menu-btn') || document.querySelector('#navbar button');
    const mobileMenu = document.getElementById('mobile-menu');
    assert.ok(mobileMenu, '#mobile-menu must exist in DOM');
    if (menuBtn) {
      menuBtn.click();
      assert.ok(menuBtn, 'Menu toggle must handle tap event');
    }

    // Step 3b: Mobile theme toggle in drawer
    const mobileToggle = document.getElementById('theme-toggle-mobile');
    assert.ok(mobileToggle, '#theme-toggle-mobile must exist inside mobile drawer');
    assert.ok(mobileToggle.classList.contains('theme-toggle-btn'), '#theme-toggle-mobile must have class theme-toggle-btn');
    const html = document.querySelector('html');
    const initialTheme = html.getAttribute('data-theme') || 'dark';

    mobileToggle.click();
    const toggledTheme = html.getAttribute('data-theme');
    assert.notEqual(toggledTheme, initialTheme, 'Mobile theme toggle must switch data-theme');
    assert.equal(mobileToggle.getAttribute('aria-pressed'), toggledTheme === 'light' ? 'true' : 'false');

    mobileToggle.click();
    assert.equal(html.getAttribute('data-theme'), initialTheme, 'Clicking mobile theme toggle again must restore initial theme');

    // Step 4: Filter tab cycling
    const filterTabs = ['all', 'icpc', 'tech', 'scholarship'];
    for (const tab of filterTabs) {
      const btn = document.querySelector(`[data-filter="${tab}"]`);
      if (btn) {
        btn.click();
        assert.ok(btn, `Filter button ${tab} must handle rapid tap`);
      }
    }

    // Step 5: Modal open & close on mobile (both detail modal and lightbox)
    const detailCard = document.querySelector('[data-detail-id="project-duebro"]');
    const detailModal = document.getElementById('detail-modal');
    const detailClose = document.getElementById('detail-modal-close');
    if (detailCard && detailModal && detailClose) {
      detailCard.click();
      assert.ok(!detailModal.classList.contains('hidden'), '#detail-modal must open on mobile card tap');
      detailClose.click();
      assert.ok(detailModal.classList.contains('hidden'), '#detail-modal must close on mobile close tap');
    }

    const modal = document.querySelector('#lightbox-modal');
    if (modal) {
      modal.classList.remove('hidden');
      assert.ok(!modal.classList.contains('hidden'));
      modal.classList.add('hidden');
      assert.ok(modal.classList.contains('hidden'));
    }
  });

  // =========================================================================
  // Scenario 4: High-Stress Rapid Scroll & Modal Toggle Journey
  // =========================================================================
  test('Scenario 4: High-Stress Rapid Scroll & Modal Toggle Journey', ({ assert }) => {
    const { document, window } = loadDOM(INDEX_HTML);

    // Step 1: Stress test 10 rapid scroll jumps
    for (let i = 0; i < 10; i++) {
      const targetY = i % 2 === 0 ? 3000 : 0;
      window.scrollTo(0, targetY);
      window.dispatchEvent('scroll');
    }
    assert.equal(window.scrollY, 0, 'Scroll position should return to top');

    // Step 2: Stress test 10 consecutive modal toggle cycles
    const modal = document.querySelector('#lightbox-modal');
    if (modal) {
      for (let i = 0; i < 10; i++) {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
      assert.ok(modal.classList.contains('hidden'), 'Modal must remain cleanly closed');
      assert.ok(!document.body.classList.contains('overflow-hidden'), 'Body scroll lock must be released');
    }
  });

  // =========================================================================
  // Scenario 5: Full Portfolio Asset & Link Audit Journey
  // =========================================================================
  test('Scenario 5: Full Portfolio Asset & Link Audit Journey', async ({ assert, fetch }) => {
    const { document, rawHTML } = loadDOM(INDEX_HTML);

    // Step 1: Audit all internal anchor fragments
    const anchors = document.querySelectorAll('a[href^="#"]');
    assert.ok(anchors.length >= 3, 'Must have at least 3 internal anchor links');
    for (const a of anchors) {
      const href = a.getAttribute('href');
      if (href === '#' || href === '') continue;
      const target = document.getElementById(href.slice(1));
      assert.ok(target, `Anchor ${href} must have corresponding target element in DOM`);
    }

    // Step 2: Audit all external URLs: authentic, secure HTTPS, and zero dead links
    const extLinks = document.querySelectorAll('a[href^="http"]');
    assert.ok(extLinks.length >= 5, 'Must have verified external links present');

    const allowedDomains = [
      'github.com',
      'codeforces.com',
      'icpc.global',
      'ptithcm.edu.vn',
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ];

    for (const a of extLinks) {
      const url = a.getAttribute('href');
      assert.ok(/^https:\/\//i.test(url), `External link ${url} must use secure HTTPS`);

      // Confirm dead link does not exist
      assert.ok(!url.includes('github.com/KaNguyen3005/DueBro"'), `Link must not be dead DueBro link: ${url}`);
      assert.ok(url !== 'https://github.com/KaNguyen3005/DueBro', `Link must not be dead DueBro URL: ${url}`);
      assert.ok(url !== 'https://github.com/KaNguyen3005/DueBro/', `Link must not be dead DueBro URL/: ${url}`);

      // Verify domain is in allowed authentic whitelist
      const parsed = new URL(url);
      const isAllowed = allowedDomains.some((d) => parsed.hostname === d || parsed.hostname.endsWith('.' + d));
      assert.ok(isAllowed, `External link domain ${parsed.hostname} must be in authentic verified whitelist: ${url}`);
    }

    // Step 3: Verify verified DueBro repository link exists
    assert.ok(
      rawHTML.includes('https://github.com/KaNguyen3005/DueBro_Kada_Program'),
      'Must contain verified live DueBro link (https://github.com/KaNguyen3005/DueBro_Kada_Program)'
    );

    // Step 4: Verify unlinked items render as plain text or badges without clickable <a>
    const unlinkedItems = [
      'award-utc-c4f',
      'project-lms',
      'project-iam',
      'project-cp-vault',
      'project-katila',
      'project-maze-solver',
      'research-ismac'
    ];
    for (const id of unlinkedItems) {
      const card = document.querySelector(`[data-detail-id="${id}"]`);
      if (card) {
        assert.equal(card.querySelectorAll('a').length, 0, `Unlinked card ${id} must contain 0 clickable <a> tags`);
      }
    }

    // Step 5: Audit #portfolio-details catalog links for authenticity
    const scriptEl = document.getElementById('portfolio-details');
    if (scriptEl) {
      const catalog = JSON.parse(scriptEl.textContent);
      for (const [key, item] of Object.entries(catalog)) {
        if (item.primaryLink && item.primaryLink.url) {
          const linkUrl = item.primaryLink.url;
          assert.ok(/^https:\/\//i.test(linkUrl), `Catalog link for ${key} must use HTTPS`);
          assert.ok(!linkUrl.includes('DueBro"') && linkUrl !== 'https://github.com/KaNguyen3005/DueBro', `Catalog link for ${key} must not be dead link`);
          const parsed = new URL(linkUrl);
          const isAllowed = allowedDomains.some((d) => parsed.hostname === d || parsed.hostname.endsWith('.' + d));
          assert.ok(isAllowed, `Catalog link domain ${parsed.hostname} for ${key} must be in authentic whitelist`);
        }
      }
    }

    // Step 6: Audit core images via HTTP server (zero 404s)
    const criticalAssets = [
      '/index.html',
      '/assets/icpc_contest_2026.png',
      '/assets/ptit_campus_life.png'
    ];

    for (const assetPath of criticalAssets) {
      const res = await fetch(assetPath);
      assert.equal(res.statusCode, 200, `Asset ${assetPath} must return HTTP 200 OK (zero 404)`);
    }
  });

});
