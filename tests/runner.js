/**
 * tests/runner.js
 * Opaque-box E2E Test Runner for KaNguyen3005 Portfolio.
 * Zero external dependencies. Uses Node.js standard runtime modules.
 *
 * Usage:
 *   node tests/runner.js                 # Run all 4 tiers
 *   node tests/runner.js --tier=1        # Run only Tier 1
 *   node tests/runner.js --tier=2        # Run only Tier 2
 *   node tests/runner.js --tier=3        # Run only Tier 3
 *   node tests/runner.js --tier=4        # Run only Tier 4
 *   node tests/runner.js --filter=icpc   # Run tests matching pattern
 */

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');

// ANSI Color Codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BLUE = '\x1b[34m';
const GRAY = '\x1b[90m';

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
  '.ico': 'image/x-icon'
};

class E2ETestRunner {
  constructor(options = {}) {
    this.projectRoot = path.resolve(__dirname, '..');
    this.suites = [];
    this.currentSuite = null;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      byTier: {
        'Tier 1': { total: 0, passed: 0, failed: 0 },
        'Tier 2': { total: 0, passed: 0, failed: 0 },
        'Tier 3': { total: 0, passed: 0, failed: 0 },
        'Tier 4': { total: 0, passed: 0, failed: 0 }
      },
      failures: []
    };
    this.server = null;
    this.serverPort = 0;
    this.serverUrl = '';
    this.options = options;
  }

  describe(name, fn) {
    const parent = this.currentSuite;
    const suite = {
      name,
      parent,
      tests: [],
      beforeHooks: [],
      afterHooks: [],
      beforeEachHooks: [],
      afterEachHooks: []
    };
    if (parent) {
      parent.tests.push(suite);
    } else {
      this.suites.push(suite);
    }
    this.currentSuite = suite;
    try {
      fn();
    } finally {
      this.currentSuite = parent;
    }
  }

  test(name, fn, options = {}) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => this.test(name, fn, options));
      return;
    }
    this.currentSuite.tests.push({
      type: 'test',
      name,
      fn,
      skip: options.skip || false,
      tier: options.tier || this._detectTier(name, this.currentSuite)
    });
  }

  _detectTier(name, suite) {
    let text = `${name}`;
    let curr = suite;
    while (curr) {
      text = `${curr.name} ${text}`;
      curr = curr.parent;
    }
    const match = text.match(/Tier\s*([1-4])/i);
    return match ? `Tier ${match[1]}` : 'Tier 1';
  }

  before(fn) {
    if (this.currentSuite) this.currentSuite.beforeHooks.push(fn);
  }

  after(fn) {
    if (this.currentSuite) this.currentSuite.afterHooks.push(fn);
  }

  beforeEach(fn) {
    if (this.currentSuite) this.currentSuite.beforeEachHooks.push(fn);
  }

  afterEach(fn) {
    if (this.currentSuite) this.currentSuite.afterEachHooks.push(fn);
  }

  startStaticServer() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        let reqPath = decodeURIComponent(req.url.split('?')[0]);
        if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
        const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, '');
        const filePath = path.join(this.projectRoot, safePath);

        fs.stat(filePath, (err, stats) => {
          if (err || !stats.isFile()) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(`404 Not Found: ${reqPath}`);
            return;
          }

          const ext = path.extname(filePath).toLowerCase();
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';
          res.statusCode = 200;
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Length', stats.size);

          if (req.method === 'HEAD') {
            res.end();
            return;
          }

          const stream = fs.createReadStream(filePath);
          stream.pipe(res);
        });
      });

      this.server.listen(0, '127.0.0.1', () => {
        const address = this.server.address();
        this.serverPort = address.port;
        this.serverUrl = `http://127.0.0.1:${this.serverPort}`;
        resolve(this.serverUrl);
      });

      this.server.on('error', reject);
    });
  }

  stopStaticServer() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  fetch(pathname) {
    return new Promise((resolve, reject) => {
      const url = `${this.serverUrl}${pathname.startsWith('/') ? pathname : '/' + pathname}`;
      http.get(url, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body
          });
        });
      }).on('error', reject);
    });
  }

  async run() {
    const startTime = Date.now();
    console.log(`\n${BOLD}${CYAN}==============================================================${RESET}`);
    console.log(`${BOLD}${CYAN}   KaNguyen3005 Portfolio E2E Test Suite (Tiers 1-4)          ${RESET}`);
    console.log(`${BOLD}${CYAN}==============================================================${RESET}\n`);

    await this.startStaticServer();
    console.log(`${GRAY}[Server] Local test HTTP server listening at ${this.serverUrl}${RESET}\n`);

    const filter = this.options.filter ? new RegExp(this.options.filter, 'i') : null;
    const tierFilter = this.options.tier ? `Tier ${this.options.tier}` : null;

    const executeSuite = async (suite, prefix = '') => {
      console.log(`${prefix}${BOLD}${BLUE}▸ ${suite.name}${RESET}`);

      for (const hook of suite.beforeHooks) {
        await hook();
      }

      for (const item of suite.tests) {
        if (item.type !== 'test') {
          // Nested suite
          await executeSuite(item, `${prefix}  `);
          continue;
        }

        const tierName = item.tier || 'Tier 1';
        if (tierFilter && tierName !== tierFilter) {
          continue;
        }
        if (filter && !filter.test(item.name) && !filter.test(suite.name)) {
          continue;
        }

        this.results.total++;
        if (this.results.byTier[tierName]) {
          this.results.byTier[tierName].total++;
        }

        if (item.skip) {
          this.results.skipped++;
          console.log(`${prefix}  ${YELLOW}○ SKIP${RESET} ${GRAY}${item.name}${RESET}`);
          continue;
        }

        for (const hook of suite.beforeEachHooks) {
          await hook();
        }

        try {
          await item.fn({
            assert,
            fetch: this.fetch.bind(this),
            serverUrl: this.serverUrl,
            projectRoot: this.projectRoot
          });
          this.results.passed++;
          if (this.results.byTier[tierName]) {
            this.results.byTier[tierName].passed++;
          }
          console.log(`${prefix}  ${GREEN}✔ PASS${RESET} ${item.name}`);
        } catch (err) {
          this.results.failed++;
          if (this.results.byTier[tierName]) {
            this.results.byTier[tierName].failed++;
          }
          console.log(`${prefix}  ${RED}✖ FAIL${RESET} ${item.name}`);
          console.log(`${prefix}    ${RED}${err.message}${RESET}`);
          this.results.failures.push({
            suite: suite.name,
            test: item.name,
            tier: tierName,
            error: err
          });

          if (this.options.bail) {
            console.log(`\n${YELLOW}[Bail] Stopping on first failure.${RESET}`);
            break;
          }
        } finally {
          for (const hook of suite.afterEachHooks) {
            await hook();
          }
        }
      }

      for (const hook of suite.afterHooks) {
        await hook();
      }
    };

    for (const suite of this.suites) {
      await executeSuite(suite);
    }

    await this.stopStaticServer();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    this._printSummary(duration);
    return this.results;
  }

  _printSummary(duration) {
    console.log(`\n${BOLD}${CYAN}--------------------------------------------------------------${RESET}`);
    console.log(`${BOLD}Test Execution Summary (${duration}s)${RESET}`);
    console.log(`${CYAN}--------------------------------------------------------------${RESET}`);
    console.log(`  ${BOLD}Total Tests:${RESET}   ${this.results.total}`);
    console.log(`  ${GREEN}Passed:${RESET}        ${this.results.passed}`);
    console.log(`  ${RED}Failed:${RESET}        ${this.results.failed}`);
    console.log(`  ${YELLOW}Skipped:${RESET}       ${this.results.skipped}`);
    console.log(`${CYAN}--------------------------------------------------------------${RESET}`);
    console.log(`${BOLD}Coverage Breakdown by Tier:${RESET}`);
    for (const [tier, stat] of Object.entries(this.results.byTier)) {
      if (stat.total > 0) {
        const rate = ((stat.passed / stat.total) * 100).toFixed(1);
        const col = stat.failed === 0 ? GREEN : RED;
        console.log(`  ${tier.padEnd(8)}: ${col}${stat.passed}/${stat.total} passed (${rate}%)${RESET}`);
      }
    }
    console.log(`${CYAN}--------------------------------------------------------------${RESET}\n`);

    if (this.results.failures.length > 0) {
      console.log(`${BOLD}${RED}Failures Detail (${this.results.failures.length}):${RESET}`);
      this.results.failures.forEach((f, idx) => {
        console.log(`\n  ${idx + 1}) [${f.tier}] ${f.suite} -> ${f.test}`);
        console.log(`     ${RED}${f.error.stack || f.error.message}${RESET}`);
      });
      console.log('');
    }
  }
}

// Global instance for DSL
const runner = new E2ETestRunner();

function parseCLIArgs() {
  const args = process.argv.slice(2);
  const options = {};
  for (const arg of args) {
    if (arg.startsWith('--tier=')) {
      options.tier = arg.split('=')[1];
    } else if (arg.startsWith('--filter=')) {
      options.filter = arg.split('=')[1];
    } else if (arg === '--bail') {
      options.bail = true;
    }
  }
  return options;
}

// Export module methods
module.exports = {
  runner,
  E2ETestRunner,
  describe: (name, fn) => runner.describe(name, fn),
  test: (name, fn, opts) => runner.test(name, fn, opts),
  it: (name, fn, opts) => runner.test(name, fn, opts),
  before: (fn) => runner.before(fn),
  after: (fn) => runner.after(fn),
  beforeEach: (fn) => runner.beforeEach(fn),
  afterEach: (fn) => runner.afterEach(fn),
  assert
};

// Auto-run if executed directly
if (require.main === module) {
  const options = parseCLIArgs();
  runner.options = { ...runner.options, ...options };

  // Load all test files in order
  const testFiles = [
    path.join(__dirname, 'tier1_features.test.js'),
    path.join(__dirname, 'tier2_boundaries.test.js'),
    path.join(__dirname, 'tier3_interactions.test.js'),
    path.join(__dirname, 'tier4_workloads.test.js')
  ];

  for (const file of testFiles) {
    if (fs.existsSync(file)) {
      require(file);
    }
  }

  runner.run().then((res) => {
    process.exit(res.failed > 0 ? 1 : 0);
  }).catch((err) => {
    console.error('Fatal Test Runner Error:', err);
    process.exit(1);
  });
}
