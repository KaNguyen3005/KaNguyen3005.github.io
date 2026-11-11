/**
 * tests/capture_visuals.js
 * Automated Visual Verification & Layout Audit Harness for KaNguyen3005 Portfolio.
 * Zero external dependencies. Uses Node.js v24 standard runtime + Google Chrome CDP.
 *
 * Captures:
 *  - Desktop (1280px): Full-page and section screenshots (#hero, #honors, #projects, #skills)
 *  - Mobile (375px): Full-page and section screenshots (#hero, #honors, #projects)
 * Audits:
 *  - Horizontal overflow / clipping
 *  - Broken images or missing assets
 *  - Viewport responsive metrics
 *
 * Output:
 *  - Saved to .agents/teamwork/visual_audit/
 */

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const net = require('node:net');
const os = require('node:os');
const { spawn } = require('node:child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.resolve(PROJECT_ROOT, '.agents', 'teamwork', 'visual_audit');

// MIME types dictionary for static serving
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// ANSI Helpers
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';

/**
 * Locate Chrome / Edge executable on Windows
 */
function findBrowserExecutable() {
  const candidates = [
    process.env.CHROME_BIN,
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];

  for (const bin of candidates) {
    if (bin && fs.existsSync(bin)) {
      return bin;
    }
  }
  throw new Error('No compatible Chrome or Edge executable found on host system.');
}

/**
 * Get an available TCP port
 */
function getFreePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => {
      const port = s.address().port;
      s.close(() => resolve(port));
    });
    s.on('error', reject);
  });
}

/**
 * Start ephemeral static HTTP server
 */
function startStaticServer(projectRoot) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const parsedUrl = new URL(req.url, 'http://127.0.0.1');
        let pathname = decodeURIComponent(parsedUrl.pathname);
        if (pathname === '/') pathname = '/index.html';

        const safePath = path.normalize(path.join(projectRoot, pathname));
        if (!safePath.startsWith(projectRoot)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }

        if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
          const ext = path.extname(safePath).toLowerCase();
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';
          res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store'
          });
          fs.createReadStream(safePath).pipe(res);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`404 Not Found: ${pathname}`);
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`500 Internal Error: ${err.message}`);
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
    server.on('error', reject);
  });
}

/**
 * Wait for CDP endpoint to respond
 */
async function waitForCDPEndpoint(port, timeoutMs = 12000) {
  const start = Date.now();
  const url = `http://127.0.0.1:${port}/json/version`;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Continue polling
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Chrome CDP endpoint failed to respond at ${url} within ${timeoutMs}ms`);
}

/**
 * Lightweight CDP Client using native globalThis.WebSocket
 */
class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 0;
    this.pending = new Map();
    this.eventListeners = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new globalThis.WebSocket(this.wsUrl);

      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.id && this.pending.has(msg.id)) {
            const { resolve: res, reject: rej } = this.pending.get(msg.id);
            this.pending.delete(msg.id);
            if (msg.error) {
              rej(new Error(`CDP Error [${msg.error.code}]: ${msg.error.message}`));
            } else {
              res(msg.result);
            }
          } else if (msg.method) {
            const listeners = this.eventListeners.get(msg.method) || [];
            for (const l of listeners) l(msg.params);
          }
        } catch (err) {
          console.error('Error handling CDP message:', err);
        }
      };

      this.ws.onclose = () => {
        for (const { reject: rej } of this.pending.values()) {
          rej(new Error('WebSocket closed'));
        }
        this.pending.clear();
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  close() {
    if (this.ws && this.ws.readyState === globalThis.WebSocket.OPEN) {
      this.ws.close();
    }
  }
}

/**
 * Main Visual Capture and Audit Workflow
 */
async function runVisualAudit() {
  const startTime = Date.now();
  console.log(`\n${BOLD}${CYAN}==============================================================${RESET}`);
  console.log(`${BOLD}  KaNguyen3005 Automated Visual Verification & Audit Harness   ${RESET}`);
  console.log(`${BOLD}${CYAN}==============================================================${RESET}\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. Start local static HTTP server
  console.log(`[1/6] Starting local ephemeral HTTP server...`);
  const { server, port: serverPort } = await startStaticServer(PROJECT_ROOT);
  const siteUrl = `http://127.0.0.1:${serverPort}/`;
  console.log(`      ${GREEN}✓${RESET} Serving site at ${siteUrl}`);

  // 2. Prepare headless Chrome
  const browserBin = findBrowserExecutable();
  const cdpPort = await getFreePort();
  const tempUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp_visual_'));

  console.log(`[2/6] Launching Headless Chrome via CDP on port ${cdpPort}...`);
  console.log(`      ${DIM}Binary: ${browserBin}${RESET}`);

  const chromeProcess = spawn(
    browserBin,
    [
      '--headless=new',
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${tempUserDataDir}`,
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--hide-scrollbars',
      '--window-size=1280,800',
      'about:blank'
    ],
    { stdio: 'ignore', detached: false }
  );

  let cdp = null;
  const auditReport = {
    timestamp: new Date().toISOString(),
    siteUrl,
    desktop: {},
    mobile: {},
    summary: { passed: true, issues: [] }
  };

  try {
    // 3. Connect to Chrome CDP
    await waitForCDPEndpoint(cdpPort);
    const targetsRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];

    if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
      throw new Error('No page target available in Chrome CDP');
    }

    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    console.log(`      ${GREEN}✓${RESET} Connected to Chrome CDP WebSocket`);

    // Enable domains
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    // 4. Desktop Audit & Captures (1280px)
    console.log(`\n[3/6] Capturing Desktop Viewport (1280x800)...`);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });

    await cdp.send('Page.navigate', { url: siteUrl });
    // Wait for load and settling
    await new Promise((r) => setTimeout(r, 1500));

    // Audit desktop layout integrity
    const desktopAudit = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const elements = Array.from(document.querySelectorAll('*'));
        const overflowing = [];

        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          if (rect.right > docWidth + 3) {
            overflowing.push({
              tag: el.tagName.toLowerCase(),
              id: el.id || null,
              classes: el.className || '',
              right: Math.round(rect.right),
              excess: Math.round(rect.right - docWidth)
            });
          }
        }

        const imgs = Array.from(document.querySelectorAll('img')).map(i => {
          const rawSrc = (i.getAttribute('src') || '').trim();
          const isModalPlaceholder = !rawSrc || i.id === 'lightbox-img';
          return {
            src: i.src,
            rawSrc,
            complete: i.complete,
            naturalWidth: i.naturalWidth,
            naturalHeight: i.naturalHeight,
            broken: !isModalPlaceholder && i.complete && i.naturalWidth === 0
          };
        });

        const honorsImgs = Array.from(document.querySelectorAll('#honors img')).length;
        const honorsPictures = Array.from(document.querySelectorAll('#honors picture')).length;

        return {
          viewport: { width: docWidth, scrollWidth, height: window.innerHeight },
          hasHorizontalOverflow: scrollWidth > docWidth + 1,
          overflowingCount: overflowing.length,
          overflowingSamples: overflowing.slice(0, 5),
          totalImages: imgs.length,
          brokenImagesCount: imgs.filter(i => i.broken).length,
          honorsImagesCount: honorsImgs,
          honorsPicturesCount: honorsPictures
        };
      })()`,
      returnByValue: true
    });

    auditReport.desktop.metrics = desktopAudit.result.value;
    console.log(`      Viewport width: ${desktopAudit.result.value.viewport.width}px (scroll: ${desktopAudit.result.value.viewport.scrollWidth}px)`);
    console.log(`      Horizontal overflow: ${desktopAudit.result.value.hasHorizontalOverflow ? RED + 'DETECTED' : GREEN + 'NONE'}${RESET}`);
    console.log(`      Total images rendered: ${desktopAudit.result.value.totalImages} (Broken: ${desktopAudit.result.value.brokenImagesCount})`);
    console.log(`      Honors section images: ${desktopAudit.result.value.honorsImagesCount} (Pictures: ${desktopAudit.result.value.honorsPicturesCount})`);

    // Desktop Full-page screenshot
    const desktopFullShot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'desktop_full.png'), Buffer.from(desktopFullShot.data, 'base64'));
    console.log(`      ${GREEN}✓${RESET} Saved desktop_full.png`);

    // Helper for top-of-page hero screenshot (includes fixed navbar + #about header)
    async function captureTopHero(filename, viewportWidth) {
      await cdp.send('Runtime.evaluate', {
        expression: `(() => { window.scrollTo({ top: 0, behavior: 'instant' }); })()`
      });
      await new Promise((r) => setTimeout(r, 350));

      const foldRes = await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const about = document.querySelector('#about');
          const bottom = about ? about.getBoundingClientRect().bottom : 820;
          return {
            width: ${viewportWidth},
            height: Math.max(${viewportWidth >= 1024 ? 820 : 860}, Math.round(bottom + 24))
          };
        })()`,
        returnByValue: true
      });

      const rect = foldRes.result.value || { width: viewportWidth, height: 850 };
      const shot = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: rect.width, height: rect.height, scale: 1 },
        captureBeyondViewport: true
      });
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), Buffer.from(shot.data, 'base64'));
      console.log(`      ${GREEN}✓${RESET} Saved ${filename} (${Math.round(rect.width)}x${Math.round(rect.height)}px)`);
      return true;
    }

    // Helper for section clipping screenshot
    async function captureSection(selector, filename) {
      await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const el = document.querySelector('${selector}');
          if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' });
        })()`
      });
      await new Promise((r) => setTimeout(r, 450));

      const rectRes = await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const el = document.querySelector('${selector}');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            x: Math.max(0, r.x + window.scrollX),
            y: Math.max(0, r.y + window.scrollY),
            width: Math.max(1, r.width),
            height: Math.max(1, r.height)
          };
        })()`,
        returnByValue: true
      });

      if (rectRes.result.value) {
        const r = rectRes.result.value;
        const shot = await cdp.send('Page.captureScreenshot', {
          format: 'png',
          clip: { x: r.x, y: r.y, width: r.width, height: r.height, scale: 1 },
          captureBeyondViewport: true
        });
        fs.writeFileSync(path.join(OUTPUT_DIR, filename), Buffer.from(shot.data, 'base64'));
        console.log(`      ${GREEN}✓${RESET} Saved ${filename} (${Math.round(r.width)}x${Math.round(r.height)}px)`);
        return true;
      } else {
        console.log(`      ${YELLOW}⚠${RESET} Element ${selector} not found for ${filename}`);
        return false;
      }
    }

    // Capture desktop sections
    console.log(`\n[4/6] Capturing Desktop Section Screenshots...`);
    await captureTopHero('desktop_hero.png', 1280);
    await captureSection('#honors', 'desktop_honors.png');
    await captureSection('#projects', 'desktop_projects.png');
    await captureSection('#research', 'desktop_research.png');
    await captureSection('#skills', 'desktop_skills.png');

    // Interactive Desktop Checks (Hero Tabs, Lightbox Modal, Honors Filter, Luffy Cleanliness)
    const desktopInteractionsRes = await cdp.send('Runtime.evaluate', {
      expression: `(async () => {
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));
        const results = {
          heroTabSwitchOk: false,
          lightboxOpenCloseOk: false,
          honorsFilterOk: false,
          zeroLuffyRefs: false,
          heroSplitColumnsOk: false,
          honorsFourColOk: false
        };

        const heroGrid = document.querySelector('#about .grid');
        const col7 = document.querySelector('#about .lg\\\\:col-span-7');
        const col5 = document.querySelector('#about .lg\\\\:col-span-5');
        if (heroGrid && col7 && col5) {
          const r7 = col7.getBoundingClientRect();
          const r5 = col5.getBoundingClientRect();
          results.heroSplitColumnsOk = r5.left > r7.left + 100 && Math.abs(r5.top - r7.top) < 80;
        }
        const honorsGrid = document.querySelector('#honors-grid') || document.querySelector('#honors .grid');
        if (honorsGrid) {
          const cols = getComputedStyle(honorsGrid).gridTemplateColumns.trim().split(/\\s+/).length;
          results.honorsFourColOk = cols === 4;
        }

        window.scrollTo({ top: 0, behavior: 'instant' });
        const tabCampus = document.getElementById('hero-tab-campus');
        const tabArena = document.getElementById('hero-tab-arena');
        const picCampus = document.getElementById('hero-pic-campus');
        const picArena = document.getElementById('hero-pic-arena');
        const heroWrap = document.getElementById('hero-image-wrap');
        if (tabCampus && tabArena && picCampus && picArena && heroWrap) {
          tabCampus.click();
          await sleep(120);
          const campusActive = !picCampus.classList.contains('hidden') && picArena.classList.contains('hidden') &&
            (heroWrap.getAttribute('data-lightbox-src') || '').includes('ptit_campus_life');
          tabArena.click();
          await sleep(120);
          const arenaRestored = !picArena.classList.contains('hidden') && picCampus.classList.contains('hidden');
          results.heroTabSwitchOk = campusActive && arenaRestored;
        }

        const modal = document.getElementById('lightbox-modal');
        const modalImg = document.getElementById('lightbox-img');
        const closeBtn = document.getElementById('lightbox-close');
        if (heroWrap && modal && modalImg && closeBtn) {
          heroWrap.click();
          await sleep(220);
          const opened = !modal.classList.contains('hidden') && Boolean(modalImg.getAttribute('src'));
          closeBtn.click();
          await sleep(150);
          const closed = modal.classList.contains('hidden');
          results.lightboxOpenCloseOk = opened && closed;
        }

        const allCards = Array.from(document.querySelectorAll('#honors .award-card'));
        const filterIcpc = document.querySelector('#honors [data-filter="icpc"]');
        const filterAll = document.querySelector('#honors [data-filter="all"]');
        if (allCards.length > 0 && filterIcpc && filterAll) {
          filterIcpc.click();
          await sleep(380);
          const visibleIcpc = allCards.filter(c => getComputedStyle(c).display !== 'none' && !c.classList.contains('hidden')).length;
          filterAll.click();
          await sleep(220);
          const visibleAll = allCards.filter(c => getComputedStyle(c).display !== 'none' && !c.classList.contains('hidden')).length;
          results.honorsFilterOk = visibleIcpc > 0 && visibleIcpc < allCards.length && visibleAll === allCards.length;
        }

        const rawHtml = document.documentElement.outerHTML;
        results.zeroLuffyRefs = !/luffy|pirate king|vua hải tặc|142709831/i.test(rawHtml);

        return results;
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    const desktopInteractions = desktopInteractionsRes.result.value || {};

    // 5. Mobile Audit & Captures (375px)
    console.log(`\n[5/6] Capturing Mobile Viewport (375x812)...`);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });
    await cdp.send('Runtime.evaluate', {
      expression: `(() => { window.scrollTo({ top: 0, behavior: 'instant' }); })()`
    });
    await new Promise((r) => setTimeout(r, 800));

    // Audit mobile layout
    const mobileAudit = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const elements = Array.from(document.querySelectorAll('*'));
        const overflowing = [];

        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          if (rect.right > docWidth + 3) {
            overflowing.push({
              tag: el.tagName.toLowerCase(),
              id: el.id || null,
              classes: el.className || '',
              right: Math.round(rect.right),
              excess: Math.round(rect.right - docWidth)
            });
          }
        }

        const menuBtn = document.querySelector('#menu-btn') || document.querySelector('#navbar button');

        return {
          viewport: { width: docWidth, scrollWidth, height: window.innerHeight },
          hasHorizontalOverflow: scrollWidth > docWidth + 1,
          overflowingCount: overflowing.length,
          overflowingSamples: overflowing.slice(0, 5),
          hasMobileMenuButton: Boolean(menuBtn)
        };
      })()`,
      returnByValue: true
    });

    auditReport.mobile.metrics = mobileAudit.result.value;
    console.log(`      Viewport width: ${mobileAudit.result.value.viewport.width}px (scroll: ${mobileAudit.result.value.viewport.scrollWidth}px)`);
    console.log(`      Horizontal overflow: ${mobileAudit.result.value.hasHorizontalOverflow ? RED + 'DETECTED' : GREEN + 'NONE'}${RESET}`);
    console.log(`      Mobile navigation button present: ${mobileAudit.result.value.hasMobileMenuButton ? GREEN + 'YES' : RED + 'NO'}${RESET}`);

    // Capture mobile hero first at y=0, then full-page, then sections
    await captureTopHero('mobile_hero.png', 375);
    await cdp.send('Runtime.evaluate', {
      expression: `(() => { window.scrollTo({ top: 0, behavior: 'instant' }); })()`
    });
    await new Promise((r) => setTimeout(r, 250));

    // Mobile Full-page screenshot
    const mobileFullShot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'mobile_full.png'), Buffer.from(mobileFullShot.data, 'base64'));
    console.log(`      ${GREEN}✓${RESET} Saved mobile_full.png`);

    // Capture mobile sections
    await captureSection('#honors', 'mobile_honors.png');
    await captureSection('#projects', 'mobile_projects.png');

    // Interactive Mobile Check (Menu drawer toggle)
    const mobileMenuRes = await cdp.send('Runtime.evaluate', {
      expression: `(async () => {
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));
        const btn = document.getElementById('menu-btn');
        const menu = document.getElementById('mobile-menu');
        if (!btn || !menu) return { mobileMenuToggleOk: false };
        btn.click();
        await sleep(120);
        const opened = !menu.classList.contains('hidden') && menu.getBoundingClientRect().height > 20;
        btn.click();
        await sleep(120);
        const closed = menu.classList.contains('hidden');
        return { mobileMenuToggleOk: opened && closed };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    auditReport.interactions = {
      ...desktopInteractions,
      ...(mobileMenuRes.result.value || {})
    };
    console.log(`      Interactions: ${JSON.stringify(auditReport.interactions)}`);

    // 6. Synthesize Audit Report
    console.log(`\n[6/6] Generating Audit Report & Summary...`);
    if (desktopAudit.result.value.hasHorizontalOverflow) {
      auditReport.summary.passed = false;
      auditReport.summary.issues.push(`Desktop viewport exhibits horizontal overflow (${desktopAudit.result.value.viewport.scrollWidth}px > ${desktopAudit.result.value.viewport.width}px)`);
    }
    if (mobileAudit.result.value.hasHorizontalOverflow) {
      auditReport.summary.passed = false;
      auditReport.summary.issues.push(`Mobile viewport exhibits horizontal overflow (${mobileAudit.result.value.viewport.scrollWidth}px > ${mobileAudit.result.value.viewport.width}px)`);
    }
    if (desktopAudit.result.value.brokenImagesCount > 0) {
      auditReport.summary.passed = false;
      auditReport.summary.issues.push(`Found ${desktopAudit.result.value.brokenImagesCount} broken images`);
    }
    if (desktopAudit.result.value.honorsImagesCount > 0) {
      auditReport.summary.passed = false;
      auditReport.summary.issues.push(`Found ${desktopAudit.result.value.honorsImagesCount} images inside #honors (expected 0)`);
    }
    for (const [checkName, ok] of Object.entries(auditReport.interactions)) {
      if (!ok) {
        auditReport.summary.passed = false;
        auditReport.summary.issues.push(`Interaction/layout check failed: ${checkName}`);
      }
    }

    auditReport.durationMs = Date.now() - startTime;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'audit_report.json'), JSON.stringify(auditReport, null, 2), 'utf8');
    console.log(`      ${GREEN}✓${RESET} Saved audit_report.json`);

    console.log(`\n${BOLD}${CYAN}--------------------------------------------------------------${RESET}`);
    console.log(`${BOLD}Visual Verification Completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s${RESET}`);
    console.log(`All artifacts saved to: ${OUTPUT_DIR}`);
    console.log(`${CYAN}--------------------------------------------------------------${RESET}\n`);

    return auditReport;
  } finally {
    // Teardown
    if (cdp) {
      try { cdp.close(); } catch {}
    }
    try {
      chromeProcess.kill('SIGKILL');
    } catch {}

    server.close();

    // Clean up temporary profile
    try {
      fs.rmSync(tempUserDataDir, { recursive: true, force: true });
    } catch {}
  }
}

// Execute CLI
if (require.main === module) {
  runVisualAudit()
    .then((report) => {
      process.exit(report.summary.passed ? 0 : 1);
    })
    .catch((err) => {
      console.error(`\n${BOLD}${RED}Fatal Visual Audit Error:${RESET}`, err);
      process.exit(1);
    });
}

module.exports = { runVisualAudit };
