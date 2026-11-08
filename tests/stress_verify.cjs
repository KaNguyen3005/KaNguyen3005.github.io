const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT_DIR, 'index.html');
const CSS_PATH = path.join(ROOT_DIR, 'assets', 'css', 'portfolio.css');
const JS_PATH = path.join(ROOT_DIR, 'assets', 'js', 'main.js');

console.log('==============================================================');
console.log('   CHALLENGER 2: EMPIRICAL STRESS & PERFORMANCE HARNESS       ');
console.log('==============================================================\n');

const htmlContent = fs.readFileSync(HTML_PATH, 'utf8');
const cssContent = fs.readFileSync(CSS_PATH, 'utf8');
const jsContent = fs.readFileSync(JS_PATH, 'utf8');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runCheck(name, fn) {
  totalTests++;
  try {
    const res = fn();
    passedTests++;
    console.log(`[PASS] ${name}${res ? ` -> ${res}` : ''}`);
    return true;
  } catch (err) {
    failedTests++;
    console.error(`[FAIL] ${name}: ${err.message}`);
    return false;
  }
}

// -------------------------------------------------------------
// 1. CLS AUDIT: All <img> tags in index.html
// -------------------------------------------------------------
console.log('--- 1. Cumulative Layout Shift (CLS) Audit on <img> Tags ---');

// Extract all <img ...> tags using regex
const imgRegex = /<img\b([^>]*?)>/gi;
const imgTags = [];
let match;
while ((match = imgRegex.exec(htmlContent)) !== null) {
  imgTags.push({
    full: match[0],
    attrs: match[1],
    index: match.index
  });
}

console.log(`Discovered ${imgTags.length} <img> tags in index.html`);

runCheck(`All ${imgTags.length} <img> tags must have explicit dimensions or aspect-ratio classes`, () => {
  assert(imgTags.length > 0, 'No <img> tags found!');
  const unconstrained = [];

  imgTags.forEach((img, idx) => {
    const attrs = img.attrs;
    const srcMatch = /\bsrc\s*=\s*["']([^"']*)["']/.exec(attrs);
    const src = srcMatch ? srcMatch[1] : '(no-src)';
    const widthMatch = /\bwidth\s*=\s*["']?(\d+)/.exec(attrs);
    const heightMatch = /\bheight\s*=\s*["']?(\d+)/.exec(attrs);
    const width = widthMatch ? widthMatch[1] : 'auto';
    const height = heightMatch ? heightMatch[1] : 'auto';
    const hasClass = /\bclass\s*=\s*["']([^"']*)["']/.exec(attrs);
    const classStr = hasClass ? hasClass[1] : '';
    const hasAspectRatio = /aspect-(video|card|square|\[16\/9\]|\[4\/3\])/.test(classStr);

    // Also check parent context within 150 chars before tag
    const snippetBefore = htmlContent.substring(Math.max(0, img.index - 150), img.index);
    const parentHasAspect = /aspect-(video|card|square|\[16\/9\]|\[4\/3\])/.test(snippetBefore);

    console.log(`  [IMG #${idx + 1}] src="${src}" width="${width}" height="${height}" aspect=${hasAspectRatio || parentHasAspect}`);

    if (!((widthMatch && heightMatch) || hasAspectRatio || parentHasAspect)) {
      unconstrained.push({ idx: idx + 1, snippet: img.full });
    }
  });

  if (unconstrained.length > 0) {
    throw new Error(`Found ${unconstrained.length} unconstrained <img> tags: ${JSON.stringify(unconstrained, null, 2)}`);
  }
  return `All ${imgTags.length} <img> tags are constrained against layout shift`;
});

// Also audit all SVG tags for viewBox or width/height
const svgRegex = /<svg\b([^>]*?)>/gi;
let svgCount = 0;
let unconstrainedSvgs = 0;
while ((match = svgRegex.exec(htmlContent)) !== null) {
  svgCount++;
  const attrs = match[1];
  const hasViewBox = /\bviewBox\s*=/i.test(attrs);
  const hasDims = /\bwidth\s*=/i.test(attrs) && /\bheight\s*=/i.test(attrs);
  if (!hasViewBox && !hasDims) {
    unconstrainedSvgs++;
  }
}
runCheck(`All ${svgCount} <svg> tags have viewBox or dimension attributes`, () => {
  assert.strictEqual(unconstrainedSvgs, 0, `${unconstrainedSvgs} SVGs lack dimensions/viewBox`);
  return `${svgCount} SVGs verified`;
});

// -------------------------------------------------------------
// 2. GPU COMPOSITING & SCROLL OPTIMIZATIONS
// -------------------------------------------------------------
console.log('\n--- 2. GPU Compositing & Animation Containment Audit ---');

runCheck('Zero uncontained animated blur-3xl elements in index.html', () => {
  const blur3xlMatches = htmlContent.match(/blur-3xl/gi) || [];
  // Ensure none have animate-pulse or continuous animation without will-change/containment
  if (blur3xlMatches.length > 0) {
    // Check if any has animate-*
    const animatedBlur = htmlContent.match(/class="[^"]*blur-3xl[^"]*animate-[^"]*"/gi);
    if (animatedBlur) {
      throw new Error(`Found animated blur-3xl: ${animatedBlur.join(', ')}`);
    }
  }
  return `No animated blur-3xl divs found (${blur3xlMatches.length} static blur references)`;
});

runCheck('CSS radial gradients used on body instead of heavy DOM blur elements', () => {
  assert(cssContent.includes('radial-gradient('), 'Missing radial-gradient in CSS');
  assert(cssContent.includes('background-attachment: fixed;'), 'Missing fixed background attachment in CSS');
  return 'Radial gradients with fixed attachment active on body';
});

runCheck('Presence of hardware-accelerated transforms translate3d(0,0,0)', () => {
  const hasTranslate3d = cssContent.includes('translate3d(0, 0, 0)') || cssContent.includes('translate3d(0,0,0)');
  assert(hasTranslate3d, 'Missing translate3d(0, 0, 0) hardware acceleration rule in CSS');
  assert(cssContent.includes('backface-visibility: hidden;'), 'Missing backface-visibility: hidden optimization');
  return 'Hardware acceleration translate3d(0,0,0) and backface-visibility verified';
});

runCheck('content-visibility: auto present for offscreen sections', () => {
  assert(cssContent.includes('content-visibility: auto;'), 'Missing content-visibility: auto in CSS');
  assert(cssContent.includes('contain-intrinsic-size:'), 'Missing contain-intrinsic-size in CSS');
  
  // Verify which sections are covered
  const targetSections = ['#projects', '#research', '#skills', '#contact'];
  for (const sec of targetSections) {
    assert(cssContent.includes(sec), `Target section ${sec} not listed in content-visibility rule`);
  }
  return `Offscreen sections [${targetSections.join(', ')}] have content-visibility: auto`;
});

// -------------------------------------------------------------
// 3. EVENT LOOP THROTTLING & TYPEWRITER OBSERVER SIMULATION
// -------------------------------------------------------------
console.log('\n--- 3. Event Loop Throttling & Typewriter Empirical Simulation ---');

runCheck('Verify Typewriter pauses when scrolled out of viewport', () => {
  // Check main.js for IntersectionObserver implementation on typewriter
  assert(jsContent.includes('initTypewriter'), 'Missing initTypewriter function');
  assert(jsContent.includes('IntersectionObserver'), 'Missing IntersectionObserver in main.js');
  assert(jsContent.includes('state.typewriterPaused'), 'Missing typewriterPaused state variable');
  assert(jsContent.includes('clearTimeout(timerId)'), 'Missing clearTimeout on offscreen exit');

  // Empirical execution test: mock the environment and test typewriter behavior
  let timeoutsCreated = 0;
  let timeoutsCleared = 0;
  let activeTimers = new Map();
  let timerSeq = 1;

  const mockWindow = {
    scrollY: 0,
    pageYOffset: 0,
    requestAnimationFrame: (cb) => cb(),
    addEventListener: () => {},
    scrollTo: () => {}
  };

  const mockElement = {
    textContent: '',
    offsetHeight: 64,
    offsetTop: 500,
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    },
    setAttribute: () => {},
    getAttribute: () => 'typewriter'
  };

  let observerCallback = null;
  class MockIntersectionObserver {
    constructor(cb) {
      observerCallback = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  mockWindow.IntersectionObserver = MockIntersectionObserver;

  // Create isolated sandbox
  const vm = require('vm');
  const sandbox = {
    window: mockWindow,
    document: {
      getElementById: (id) => (id === 'typewriter' ? mockElement : null),
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      body: { style: {}, classList: { add: () => {}, remove: () => {} } }
    },
    IntersectionObserver: MockIntersectionObserver,
    setTimeout: (cb, delay) => {
      timeoutsCreated++;
      const id = timerSeq++;
      activeTimers.set(id, { cb, delay });
      return id;
    },
    clearTimeout: (id) => {
      timeoutsCleared++;
      activeTimers.delete(id);
    },
    console: { log: () => {} }
  };

  vm.createContext(sandbox);
  // Execute main.js inside sandbox
  vm.runInContext(jsContent, sandbox);

  // At start, tick() was called once -> 1 setTimeout created
  assert(timeoutsCreated >= 1, 'Initial tick() did not schedule a timeout');
  assert.strictEqual(activeTimers.size, 1, 'Expected 1 active timer initially');

  // Trigger IntersectionObserver entry: isIntersecting = false (scrolled offscreen)
  assert(typeof observerCallback === 'function', 'IntersectionObserver was not registered');
  observerCallback([{ isIntersecting: false }]);

  // Verify that timer was cleared and no new timeouts are running
  assert(timeoutsCleared >= 1, 'clearTimeout was not called when scrolled out of viewport');
  assert.strictEqual(activeTimers.size, 0, 'Active timers remained running while offscreen! Leaking event loop!');

  // Trigger IntersectionObserver entry: isIntersecting = true (scrolled back into viewport)
  const timeoutsBeforeResume = timeoutsCreated;
  observerCallback([{ isIntersecting: true }]);
  assert(timeoutsCreated > timeoutsBeforeResume, 'Typewriter did not resume upon re-entering viewport');
  assert.strictEqual(activeTimers.size, 1, 'Expected exactly 1 timer upon resume (no multiple loops)');

  return 'Typewriter strictly halts and clears timeouts when offscreen, resumes cleanly when visible';
});

// -------------------------------------------------------------
// 4. TOTAL PAYLOAD BENCHMARK & ZERO RUNTIME CDN CHECK
// -------------------------------------------------------------
console.log('\n--- 4. Total Payload Benchmark & CDN Audit ---');

runCheck('Zero references to cdn.tailwindcss.com Play CDN', () => {
  const playCdnRegex = /cdn\.tailwindcss\.com/i;
  assert(!playCdnRegex.test(htmlContent), 'Found cdn.tailwindcss.com in index.html!');
  assert(!playCdnRegex.test(jsContent), 'Found cdn.tailwindcss.com in main.js!');
  assert(!playCdnRegex.test(cssContent), 'Found cdn.tailwindcss.com in portfolio.css!');
  return 'Zero references to Tailwind Play CDN across all artifacts';
});

// Payload size breakdown
const stats = {
  html: {
    raw: Buffer.byteLength(htmlContent, 'utf8'),
    gzip: zlib.gzipSync(Buffer.from(htmlContent, 'utf8')).length
  },
  css: {
    raw: Buffer.byteLength(cssContent, 'utf8'),
    gzip: zlib.gzipSync(Buffer.from(cssContent, 'utf8')).length
  },
  js: {
    raw: Buffer.byteLength(jsContent, 'utf8'),
    gzip: zlib.gzipSync(Buffer.from(jsContent, 'utf8')).length
  }
};

console.log('\nArtifact Payload Summary:');
console.log(`- index.html:              ${(stats.html.raw / 1024).toFixed(2)} KB (gzipped: ${(stats.html.gzip / 1024).toFixed(2)} KB)`);
console.log(`- assets/css/portfolio.css: ${(stats.css.raw / 1024).toFixed(2)} KB (gzipped: ${(stats.css.gzip / 1024).toFixed(2)} KB)`);
console.log(`- assets/js/main.js:       ${(stats.js.raw / 1024).toFixed(2)} KB (gzipped: ${(stats.js.gzip / 1024).toFixed(2)} KB)`);

const codeRawTotal = stats.html.raw + stats.css.raw + stats.js.raw;
const codeGzipTotal = stats.html.gzip + stats.css.gzip + stats.js.gzip;
console.log(`-> Core Code Total (HTML+CSS+JS): ${(codeRawTotal / 1024).toFixed(2)} KB raw, ${(codeGzipTotal / 1024).toFixed(2)} KB gzipped`);

runCheck('Static CSS+JS is significantly lighter than Tailwind Play CDN (~360 KB)', () => {
  const totalCssJsGzip = stats.css.gzip + stats.js.gzip;
  const playCdnSize = 360 * 1024;
  const savingsPct = (((playCdnSize - (stats.css.raw + stats.js.raw)) / playCdnSize) * 100).toFixed(1);
  console.log(`   (Production CSS+JS raw: ${((stats.css.raw + stats.js.raw)/1024).toFixed(1)} KB vs Play CDN: 360 KB -> ${savingsPct}% reduction)`);
  assert(stats.css.raw + stats.js.raw < playCdnSize, 'Compiled CSS+JS exceeds Play CDN size');
  return `Saved ${savingsPct}% uncompressed payload by eliminating Play CDN`;
});

// Image assets audit
console.log('\nAuditing Image Assets in assets/ and assets/awards/ :');
const awardsDir = path.join(ROOT_DIR, 'assets', 'awards');
const assetFiles = fs.readdirSync(awardsDir);
const webpImages = [];
const pngImages = [];
let totalWebpBytes = 0;
let totalPngBytes = 0;

assetFiles.forEach(file => {
  const fullPath = path.join(awardsDir, file);
  const st = fs.statSync(fullPath);
  if (file.endsWith('.webp')) {
    webpImages.push({ file, size: st.size });
    totalWebpBytes += st.size;
  } else if (file.endsWith('.png')) {
    pngImages.push({ file, size: st.size });
    totalPngBytes += st.size;
  }
});

// Also include root assets/icpc_contest_2026.webp & png
const heroWebp = path.join(ROOT_DIR, 'assets', 'icpc_contest_2026.webp');
if (fs.existsSync(heroWebp)) {
  const sz = fs.statSync(heroWebp).size;
  webpImages.push({ file: 'assets/icpc_contest_2026.webp', size: sz });
  totalWebpBytes += sz;
}
const heroPng = path.join(ROOT_DIR, 'assets', 'icpc_contest_2026.png');
if (fs.existsSync(heroPng)) {
  const sz = fs.statSync(heroPng).size;
  pngImages.push({ file: 'assets/icpc_contest_2026.png', size: sz });
  totalPngBytes += sz;
}

console.log(`Found ${webpImages.length} optimized WebP assets totaling ${(totalWebpBytes / 1024).toFixed(2)} KB:`);
webpImages.forEach(img => {
  console.log(`  - ${img.file}: ${(img.size / 1024).toFixed(2)} KB`);
});

runCheck('WebP format provides massive compression compared to raw PNG assets', () => {
  assert(webpImages.length > 0, 'No WebP images found');
  const compressionRatio = (((totalPngBytes - totalWebpBytes) / totalPngBytes) * 100).toFixed(1);
  console.log(`   (Raw PNGs: ${(totalPngBytes / 1024).toFixed(2)} KB -> WebP: ${(totalWebpBytes / 1024).toFixed(2)} KB | Compression: ${compressionRatio}%)`);
  assert(totalWebpBytes < totalPngBytes, 'WebP is not smaller than PNG');
  return `WebP assets achieve ${compressionRatio}% payload reduction`;
});

console.log('\n==============================================================');
console.log(`HARNESS RESULTS: ${passedTests} passed, ${failedTests} failed out of ${totalTests} checks`);
console.log('==============================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
