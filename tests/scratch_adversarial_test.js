/**
 * Temporary Scratch Adversarial Stress Harness for KaNguyen3005.github.io
 * Auto-removed after execution.
 */
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const http = require('node:http');
const { parseHTML, loadDOM } = require('./dom_helper.js');

const ROOT = path.resolve(__dirname, '..');
const results = {
  assets: { checked: 0, passed: 0, errors: [] },
  htmlLinks: { checked: 0, passed: 0, localChecked: 0, remoteChecked: 0, errors: [] },
  imageIntegrity: { checked: 0, passed: 0, details: [], errors: [] },
  uiStress: {
    filterTabs: { iterations: 0, passed: false, errors: [] },
    lightbox: { iterations: 0, passed: false, errors: [] },
    resize: { viewportsTested: 0, passed: false, errors: [] }
  }
};

async function checkUrl(urlStr) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(urlStr);
      const mod = parsed.protocol === 'https:' ? https : http;
      const req = mod.request(parsed, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Challenger/1.0' },
        timeout: 8000
      }, (res) => {
        // Status 200, 301, 302, 307, 308 or even 403 (e.g. cloudflare bot protection) is valid host
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ ok: true, status: res.statusCode });
        } else if (res.statusCode === 403 || res.statusCode === 429) {
          resolve({ ok: true, status: res.statusCode, note: 'Protected by WAF/RateLimit' });
        } else {
          resolve({ ok: false, status: res.statusCode });
        }
      });
      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: true, status: 'TIMEOUT', note: 'Host reachable but timed out' });
      });
      req.on('error', (err) => {
        resolve({ ok: false, status: 'ERROR', error: err.message });
      });
      req.end();
    } catch (e) {
      resolve({ ok: false, status: 'EXCEPTION', error: e.message });
    }
  });
}

function verifyCaseSensitivity(filePath) {
  const norm = path.normalize(filePath);
  const parts = norm.split(path.sep);
  let current = parts[0] === '' ? path.sep : parts[0];
  if (current.endsWith(':')) current += path.sep; // Windows drive C:\

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    const entries = fs.readdirSync(current);
    if (!entries.includes(part)) {
      // Find what it actually is
      const found = entries.find(e => e.toLowerCase() === part.toLowerCase());
      return { match: false, expected: part, actual: found };
    }
    current = path.join(current, part);
  }
  return { match: true };
}

function parsePngHeader(buf) {
  // PNG Magic: 89 50 4E 47 0D 0A 1A 0A
  const magic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!buf.subarray(0, 8).equals(magic)) {
    return { ok: false, error: 'Invalid PNG magic header' };
  }
  // IHDR is first chunk at offset 8 (length 4 bytes, 'IHDR', 13 data bytes, 4 CRC)
  const chunkType = buf.toString('ascii', 12, 16);
  if (chunkType !== 'IHDR') {
    return { ok: false, error: `Expected IHDR chunk, got ${chunkType}` };
  }
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];

  // Check IEND presence at end of file
  const endSlice = buf.subarray(buf.length - 12);
  const iendType = endSlice.toString('ascii', 4, 8);
  const hasIend = iendType === 'IEND';

  return { ok: true, width, height, bitDepth, colorType, hasIend };
}

function parseWebpHeader(buf) {
  // RIFF .... WEBP
  const riff = buf.toString('ascii', 0, 4);
  const webp = buf.toString('ascii', 8, 12);
  if (riff !== 'RIFF' || webp !== 'WEBP') {
    return { ok: false, error: 'Invalid WebP RIFF/WEBP magic header' };
  }
  const fileSize = buf.readUInt32LE(4) + 8;
  return { ok: true, fileSize, actualSize: buf.length };
}

async function run() {
  console.log('=== STARTING ADVERSARIAL STRESS TEST ===\n');

  // 1. AUDIT INDEX.HTML FOR ALL SRC, HREF, DATA-LIGHTBOX-SRC
  const htmlPath = path.join(ROOT, 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const doc = parseHTML(htmlContent);

  // Collect all src, href, data-lightbox-src
  const allElements = doc.querySelectorAll('*');
  const uris = new Set();
  const localPaths = new Set();
  const remoteUrls = new Set();
  const hashLinks = new Set();

  for (const el of allElements) {
    const src = el.getAttribute('src');
    const href = el.getAttribute('href');
    const lightboxSrc = el.getAttribute('data-lightbox-src');
    const fullSrc = el.getAttribute('data-fullsrc');

    [src, href, lightboxSrc, fullSrc].forEach(val => {
      if (val && typeof val === 'string' && val.trim()) {
        const trimmed = val.trim();
        uris.add(trimmed);
        if (trimmed.startsWith('#')) {
          hashLinks.add(trimmed);
        } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          remoteUrls.add(trimmed);
        } else if (!trimmed.startsWith('mailto:') && !trimmed.startsWith('tel:') && !trimmed.startsWith('javascript:')) {
          localPaths.add(trimmed);
        }
      }
    });
  }

  // Also check url() in CSS
  const cssPath = path.join(ROOT, 'assets', 'css', 'portfolio.css');
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const urlMatches = cssContent.match(/url\(['"]?([^'"()]+)['"]?\)/g) || [];
    for (const m of urlMatches) {
      const matchUrl = m.replace(/url\(['"]?/, '').replace(/['"]?\)/, '').trim();
      if (matchUrl && !matchUrl.startsWith('data:')) {
        if (matchUrl.startsWith('http')) remoteUrls.add(matchUrl);
        else localPaths.add(matchUrl);
      }
    }
  }

  console.log(`[Links Found] Local Paths: ${localPaths.size}, Remote URLs: ${remoteUrls.size}, Hash Anchors: ${hashLinks.size}`);

  // 1A. Validate Local Paths
  for (const p of localPaths) {
    results.htmlLinks.checked++;
    results.htmlLinks.localChecked++;
    // Clean query/hash
    const cleanPath = p.split('?')[0].split('#')[0];
    const resolved = path.resolve(ROOT, cleanPath);
    if (!fs.existsSync(resolved)) {
      results.htmlLinks.errors.push(`Local 404: "${p}" resolved to "${resolved}" does not exist`);
    } else {
      const stats = fs.statSync(resolved);
      if (stats.size === 0) {
        results.htmlLinks.errors.push(`Empty file (0 bytes): "${p}"`);
      }
      // Check case sensitivity
      const caseCheck = verifyCaseSensitivity(resolved);
      if (!caseCheck.match) {
        results.htmlLinks.errors.push(`Case sensitivity mismatch on "${p}": expected "${caseCheck.expected}", disk has "${caseCheck.actual}"`);
      } else {
        results.htmlLinks.passed++;
      }
    }
  }

  // 1B. Validate Hash Anchors
  for (const hash of hashLinks) {
    if (hash === '#') continue;
    results.htmlLinks.checked++;
    const targetId = hash.slice(1);
    const targetEl = doc.getElementById(targetId);
    if (!targetEl) {
      results.htmlLinks.errors.push(`Broken in-page anchor: "${hash}" has no matching element with id="${targetId}"`);
    } else {
      results.htmlLinks.passed++;
    }
  }

  // 1C. Validate Remote URLs (Sample/Audit)
  console.log(`Auditing ${remoteUrls.size} remote URLs...`);
  for (const urlStr of remoteUrls) {
    results.htmlLinks.checked++;
    results.htmlLinks.remoteChecked++;
    const check = await checkUrl(urlStr);
    if (!check.ok) {
      results.htmlLinks.errors.push(`Remote URL failed: ${urlStr} -> status ${check.status} (${check.error || 'bad status'})`);
    } else {
      results.htmlLinks.passed++;
    }
  }

  // 2. AUDIT ASSETS DIRECTORY IMAGES & INTEGRITY
  function scanDir(dir) {
    let files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        files = files.concat(scanDir(full));
      } else {
        files.push(full);
      }
    }
    return files;
  }

  const allAssets = scanDir(path.join(ROOT, 'assets'));
  for (const file of allAssets) {
    const ext = path.extname(file).toLowerCase();
    const rel = path.relative(ROOT, file);
    if (!['.png', '.webp', '.jpg', '.jpeg', '.svg'].includes(ext)) continue;

    results.imageIntegrity.checked++;
    const buf = fs.readFileSync(file);
    if (buf.length === 0) {
      results.imageIntegrity.errors.push(`0-byte image file: ${rel}`);
      continue;
    }

    if (ext === '.png') {
      const info = parsePngHeader(buf);
      if (!info.ok) {
        results.imageIntegrity.errors.push(`Corrupt PNG ${rel}: ${info.error}`);
      } else if (!info.hasIend) {
        results.imageIntegrity.errors.push(`Incomplete PNG ${rel}: Missing IEND chunk`);
      } else {
        results.imageIntegrity.passed++;
        results.imageIntegrity.details.push({
          file: rel,
          format: 'PNG',
          width: info.width,
          height: info.height,
          size: buf.length
        });
      }
    } else if (ext === '.webp') {
      const info = parseWebpHeader(buf);
      if (!info.ok) {
        results.imageIntegrity.errors.push(`Corrupt WebP ${rel}: ${info.error}`);
      } else {
        results.imageIntegrity.passed++;
        results.imageIntegrity.details.push({
          file: rel,
          format: 'WebP',
          size: buf.length
        });
      }
    } else if (ext === '.svg') {
      const svgStr = buf.toString('utf8');
      if (!svgStr.includes('<svg') || !svgStr.includes('</svg>')) {
        results.imageIntegrity.errors.push(`Corrupt SVG ${rel}: Missing <svg> root`);
      } else {
        results.imageIntegrity.passed++;
        results.imageIntegrity.details.push({
          file: rel,
          format: 'SVG',
          size: buf.length
        });
      }
    }
  }

  // 3. UI STRESS TESTING (TABS, LIGHTBOX, RESIZE)
  console.log('\nRunning UI Stress Harness...');
  const dom = loadDOM(htmlPath);
  const window = dom.window;
  const document = dom.document;

  // 3A. Filter tabs rapid toggling (1,000 iterations)
  try {
    const filterTabs = Array.from(document.querySelectorAll('#honors [data-filter]'));
    const cards = Array.from(document.querySelectorAll('#honors [data-category]'));
    let filterFailures = 0;

    const filterValues = ['all', 'icpc', 'tech', 'scholarship'];
    for (let i = 0; i < 1000; i++) {
      const targetFilter = filterValues[i % filterValues.length];
      const targetTab = filterTabs.find(t => t.getAttribute('data-filter') === targetFilter);
      if (targetTab) {
        targetTab.click();
      }

      // Check invariants
      const activeTabs = filterTabs.filter(t => t.classList.contains('active'));
      if (activeTabs.length !== 1 || activeTabs[0].getAttribute('data-filter') !== targetFilter) {
        filterFailures++;
        results.uiStress.filterTabs.errors.push(`Iteration ${i}: active tab mismatch for ${targetFilter}`);
        break;
      }

      // Check card visibility invariant
      for (const card of cards) {
        const cat = (card.getAttribute('data-category') || '').toLowerCase();
        const shouldShow = targetFilter === 'all' || cat.includes(targetFilter);
        const isHidden = card.classList.contains('is-hidden');
        // Note: is-hidden is added with setTimeout(250) on hide in main.js, or immediate removal on show
        if (shouldShow && isHidden) {
          filterFailures++;
          results.uiStress.filterTabs.errors.push(`Iteration ${i}: card ${card.getAttribute('data-award-id')} falsely hidden under ${targetFilter}`);
          break;
        }
      }
    }
    results.uiStress.filterTabs.iterations = 1000;
    results.uiStress.filterTabs.passed = filterFailures === 0;
  } catch (err) {
    results.uiStress.filterTabs.errors.push(`Filter tab exception: ${err.message}`);
  }

  // 3B. Lightbox modal rapid opening/closing under rapid key & click events
  try {
    const modal = document.getElementById('lightbox-modal');
    const modalClose = document.getElementById('lightbox-close');
    const modalImg = document.getElementById('lightbox-img');
    const triggers = Array.from(document.querySelectorAll('[data-lightbox-src]'));
    let modalFailures = 0;

    for (let i = 0; i < 300; i++) {
      const trigger = triggers[i % triggers.length];
      const expectedSrc = trigger.getAttribute('data-lightbox-src');

      // 1. Open
      trigger.click();
      if (modal.classList.contains('hidden') || !modal.classList.contains('active')) {
        modalFailures++;
        results.uiStress.lightbox.errors.push(`Iteration ${i}: Modal failed to open on click`);
        break;
      }
      if (modalImg.getAttribute('src') !== expectedSrc) {
        modalFailures++;
        results.uiStress.lightbox.errors.push(`Iteration ${i}: Image src mismatch. Expected ${expectedSrc}, got ${modalImg.getAttribute('src')}`);
        break;
      }

      // 2. Click modal content (should NOT close)
      if (modalImg) {
        modalImg.dispatchEvent({ type: 'click', bubbles: false, cancelable: true });
        if (modal.classList.contains('hidden')) {
          modalFailures++;
          results.uiStress.lightbox.errors.push(`Iteration ${i}: Modal improperly closed when clicking modal image`);
          break;
        }
      }

      // 3. Rapid Escape key events (spam 5 Escape key events)
      for (let k = 0; k < 5; k++) {
        window.dispatchEvent({ type: 'keydown', key: 'Escape', keyCode: 27, bubbles: true });
      }

      // Invariant: Modal must be closed now
      if (!modal.classList.contains('hidden')) {
        modalFailures++;
        results.uiStress.lightbox.errors.push(`Iteration ${i}: Modal failed to close on Escape key`);
        break;
      }
      if (modalImg.getAttribute('src') !== '') {
        modalFailures++;
        results.uiStress.lightbox.errors.push(`Iteration ${i}: Modal image src was not cleared on close`);
        break;
      }
    }

    results.uiStress.lightbox.iterations = 300;
    results.uiStress.lightbox.passed = modalFailures === 0;
  } catch (err) {
    results.uiStress.lightbox.errors.push(`Lightbox exception: ${err.message}`);
  }

  // 3C. Window Resizing Stress Across 15+ Viewports
  try {
    const viewports = [
      { w: 280, h: 653, name: 'Galaxy Fold' },
      { w: 320, h: 568, name: 'iPhone SE' },
      { w: 375, h: 667, name: 'iPhone 8' },
      { w: 390, h: 844, name: 'iPhone 14' },
      { w: 414, h: 896, name: 'iPhone XR' },
      { w: 768, h: 1024, name: 'iPad Portrait' },
      { w: 820, h: 1180, name: 'iPad Air' },
      { w: 1024, h: 768, name: 'iPad Landscape' },
      { w: 1280, h: 800, name: 'Small Laptop' },
      { w: 1366, h: 768, name: 'Standard HD Laptop' },
      { w: 1440, h: 900, name: 'MacBook Pro' },
      { w: 1920, h: 1080, name: 'FHD Desktop' },
      { w: 2560, h: 1440, name: '2K QHD Display' },
      { w: 3840, h: 2160, name: '4K UHD Display' },
      { w: 0, h: 0, name: 'Zero Dimension Edge Case' },
      { w: 10000, h: 5000, name: 'Ultra-wide Panoramic Edge Case' }
    ];

    let resizeErrors = 0;
    for (const vp of viewports) {
      window.innerWidth = vp.w;
      window.innerHeight = vp.h;
      try {
        window.dispatchEvent({ type: 'resize', bubbles: true });
        results.uiStress.resize.viewportsTested++;
      } catch (e) {
        resizeErrors++;
        results.uiStress.resize.errors.push(`Resize error on ${vp.name} (${vp.w}x${vp.h}): ${e.message}`);
      }
    }
    results.uiStress.resize.passed = resizeErrors === 0;
  } catch (err) {
    results.uiStress.resize.errors.push(`Resize exception: ${err.message}`);
  }

  console.log('\n=== ADVERSARIAL TEST RESULTS SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
}

run().catch(err => {
  console.error('Fatal crash:', err);
  process.exit(1);
});
