# Test Infrastructure & Verification Architecture: KaNguyen3005 Portfolio

## 1. Test Philosophy & Engineering Principles
- **Opaque-Box & Behavior-Driven**: Evaluates user-facing outcomes, accessibility, and visual/DOM states without hardcoded bypasses or mock facades.
- **Methodology**: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Scenarios + Automated Visual CDP Auditing.
- **Modern Technical Ethos**: Asserts complete removal of all Monkey D. Luffy/anime mascot graphics and quotes, strictly verifying high-density software engineering branding, systems architecture, and algorithmic discipline.
- **Image-Free Typographic Honors**: Asserts all 8 cards in `#honors` are built with semantic badge headers (`.badge-gold`, `.badge-cyan`, `.badge-emerald`, etc.), titles, credential metadata, and external verification links with zero `<img>` or `<picture>` elements.
- **Permanent Asset Preservation**: Asserts high-definition hero contest arena (`assets/icpc_contest_2026.png`) and campus life (`assets/ptit_campus_life.png`) dual-tab showcase with click-to-zoom Lightbox.

---

## 2. Feature Inventory & Coverage Matrix

| # | Feature Domain | Specification Source | Tier 1 (Features) | Tier 2 (Boundaries) | Tier 3 (Interactions) |
|---|----------------|----------------------|:-----------------:|:-------------------:|:---------------------:|
| 1 | Navigation & Brand Identity | ORIGINAL_REQUEST §2, R1 | 6 | 5 | ✓ |
| 2 | Hero Section & Modern Ethos CTAs | ORIGINAL_REQUEST §2, R1 | 6 | 5 | ✓ |
| 3 | Bento Stats Matrix | ORIGINAL_REQUEST §2 | 6 | 5 | ✓ |
| 4 | Typographic Honors & Contest Assets | ORIGINAL_REQUEST §4, R2 | 7 | 5 | ✓ |
| 5 | Honors Category Filter Tabs | ORIGINAL_REQUEST §2 | 6 | 5 | ✓ |
| 6 | Interactive Lightbox Showcase Modal | ORIGINAL_REQUEST §2, R2 | 6 | 6 | ✓ |
| 7 | Scrolling Smoothness & 60fps Animation | ORIGINAL_REQUEST §3 | 5 | 5 | ✓ |
| 8 | Zero Cumulative Layout Shift (CLS) | ORIGINAL_REQUEST §3 | 5 | 5 | ✓ |
| 9 | Systems & Distributed Projects Showcase | ORIGINAL_REQUEST §2 | 6 | 5 | ✓ |
| 10 | Scientific Research (I-SMAC '26) | ORIGINAL_REQUEST §2 | 5 | 5 | ✓ |
| 11 | Technical Arsenal & Skill Badges | ORIGINAL_REQUEST §2 | 5 | 5 | ✓ |
| 12 | Zero 404 & Network Edge Cases | ORIGINAL_REQUEST §2, 4 | 6 | 5 | ✓ |

---

## 3. Test Harness Architecture

```
                    ┌────────────────────────────────────────┐
                    │      node tests/runner.js              │
                    └───────────────────┬────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
  │ Ephemeral HTTP   │         │ DOM Helper ($O(N)$│        │ Tier 1-4 Test    │
  │ Server (Port 0)  │         │ Tokenizer & Tree)│         │ Suites (150 tests│
  └──────────────────┘         └──────────────────┘         └──────────────────┘
```

- **Zero External Dependencies**: Operates entirely on Node.js v24 standard runtime (`node:http`, `node:fs`, `node:path`, `node:assert/strict`).
- **Linear-Time HTML Parser & DOM Helper** (`tests/dom_helper.js`): $O(N)$ safe tokenizer, document query engine (`querySelector`, `querySelectorAll`), class list manipulation, and synthetic event dispatching (`click`, `keydown`, `scroll`, `resize`).
- **Built-in Ephemeral HTTP Server**: Random port binding (`127.0.0.1:<port>`), accurate MIME serving, query parameter resolution, case-sensitivity testing, and static asset streaming.

---

## 4. Automated Visual Verification Harness (`tests/capture_visuals.js`)

```
   Node.js v24 Script                     Headless Google Chrome
 ┌─────────────────────┐   WebSocket CDP ┌───────────────────────────┐
 │ capture_visuals.js  │ ─────────────── │ Chrome v157 (--headless=new)│
 └──────────┬──────────┘                 └─────────────┬─────────────┘
            │                                          │
            ▼                                          ▼
   .agents/teamwork/visual_audit/              Viewport Emulation & Layout Audit:
   - desktop_full.png                          - Desktop: 1280x800
   - desktop_hero.png                          - Mobile: 375x812 (Scale 2)
   - desktop_honors.png                        - Horizontal Overflow Audit: 0px
   - desktop_projects.png                      - Honors Broken Images: 0
   - desktop_skills.png                        - Honors <img> tags: 0
   - mobile_full.png
   - mobile_hero.png
   - mobile_honors.png
   - mobile_projects.png
   - audit_report.json
```

### Protocol & Capabilities:
- Connects directly to Google Chrome via Chrome DevTools Protocol (CDP) using native `globalThis.WebSocket`.
- Zero npm dependencies (Puppeteer/Playwright not needed).
- Emulates responsive viewports, executes full-page (`captureBeyondViewport: true`) and section screenshots (`clip` rects with automated `scrollIntoView` for `content-visibility: auto` stability).
- Performs automated layout integrity checks: computes DOM element bounding boxes against `clientWidth` to flag clipping, horizontal scrollbars, and broken images.

---

## 5. Execution Commands

```bash
# Run all 150 automated tests across Tiers 1-4
node tests/runner.js

# Run individual tiers
node tests/runner.js --tier=1
node tests/runner.js --tier=2
node tests/runner.js --tier=3
node tests/runner.js --tier=4

# Filter tests by keyword
node tests/runner.js --filter=icpc
node tests/runner.js --filter=lightbox
node tests/runner.js --filter=honors

# Run automated browser visual verification & layout audit
node tests/capture_visuals.js
```
