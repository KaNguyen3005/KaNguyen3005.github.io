# Project: KaNguyen3005.github.io Modern Professional UI/UX Overhaul

## Architecture
- **Client Frontend**: Zero-dependency static architecture (`index.html`, `assets/css/portfolio.css`, `assets/js/main.js`).
- **Hero Showcase**: Dual-tab bento switcher (ICPC live arena and PTIT campus life) with high-res photos and Lightbox zoom modal.
- **Achievements Section (`#honors`)**: Zero-image typographic grid with semantic category badges, issuing dates, and external verification links.
- **Testing Track**: Zero-dependency automated test runner in `tests/runner.js` (Tiers 1-4) + Chrome CDP automated visual screenshot capture (`tests/capture_visuals.js`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Eradicate Luffy mascot SVG from Hero | Replace `assets/luffy-mascot.svg` in Hero chrome with technical terminal/code SVG icon | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Replace Hero Luffy ethos quote | Replace "Tinh thần Luffy: Vươn ra biển lớn 🏴‍☠️" with "Kỷ luật thuật toán & Tư duy hệ thống ⚡" in HTML & JS | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Eradicate Footer Luffy quote and mascot | Remove straw hat mascot and One Piece quote in footer, replace with professional engineering motto | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Clean Project & Research text | Replace "Mascot Bro" in Due Bro and AI research cards with "AI Copilot / Assistant" | M1 | ORIGINAL_REQUEST §R1 |
| 5 | Clean JS tab switcher strings | Replace Luffy references in `assets/js/main.js` `setView('arena')` and `setView('campus')` | M1 | ORIGINAL_REQUEST §R1 |
| 6 | Remove images from 8 Achievement Cards | Completely remove `<picture>`, `<source>`, `<img>` and aspect wrappers from all 8 cards in `#honors` | M1 | ORIGINAL_REQUEST §R2 |
| 7 | Typographic Achievement Cards Design | Rebuild `#honors` cards with category badges, issue dates, bold titles, context, and verification links | M1 | ORIGINAL_REQUEST §R2 |
| 8 | Preserve Hero Dual-Tab Showcase | Retain `#hero-tab-arena`, `#hero-tab-campus`, photos, and lightbox zoom for arena and campus views | M1 | ORIGINAL_REQUEST §R2 |
| 9 | Preserve Bilingual Technical Branding | Retain Vietnamese narrative and English technical branding without regression | M1 | ORIGINAL_REQUEST §R2 |
| 10 | Executive Typography & Hierarchy | Refine heading scales, sans-serif nav links, authoritative eyebrow tags (`Plus Jakarta Sans` & `JetBrains Mono`) | M2 | ORIGINAL_REQUEST §R1 |
| 11 | Color Hierarchy & Semantic Glow | Enhance glassmorphic card borders, category-specific hover glows (gold, cyan, emerald, indigo) | M2 | ORIGINAL_REQUEST §R1 |
| 12 | Spacing & Grid Standardization | Standardize container padding, card alignment, and gutters across all sections | M2 | ORIGINAL_REQUEST §R1 |
| 13 | Responsive Mobile Hygiene (375px–414px) | Flex-wrapping for pills/badges, responsive padding, zero horizontal scrollbar | M2 | ORIGINAL_REQUEST §R1 |
| 14 | Smooth Micro-Interactions | Tactile `active:scale-[0.98]` button states, accessible focus indicators, smooth transitions | M2 | ORIGINAL_REQUEST §R1 |
| 15 | Test Suite Alignment | Update 16 assertions in `tests/tier1_features.test.js`, `tier2_boundaries.test.js`, `tier3_interactions.test.js`, `tier4_workloads.test.js` | M-TEST | ORIGINAL_REQUEST §R3 |
| 16 | Zero Test Failures Verification | Verify `node tests/runner.js` passes 150/150 tests with 0 failures | M-FINAL | ORIGINAL_REQUEST §R3 |
| 17 | Automated Visual Browser Verification Script | Zero-dependency Node.js + Chrome CDP script (`tests/capture_visuals.js`) to capture full-page & section screenshots | M-TEST | ORIGINAL_REQUEST §R4 |
| 18 | Multi-Viewport Screenshot Audit | Capture and audit desktop (1280px+) and mobile (375px) screenshots for overlap, clipping, or breakage | M-FINAL | ORIGINAL_REQUEST §R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M-TEST | E2E Testing & Verification Track | Update test assertions in `tests/` to match de-Luffy & image-free specs, implement `tests/capture_visuals.js`, and publish `TEST_READY.md` | Survey complete | DONE |
| M1 | Content & Theme De-Luffy & Achievement Typographic Overhaul | Update `index.html` and `assets/js/main.js` to eradicate all Luffy elements, remove achievement images, rebuild typographic cards, preserve hero tabs | Survey complete | DONE |
| M2 | UI/UX Modernization & Responsive Styling Polish | Modernize `assets/css/portfolio.css`, refine typography hierarchy, add semantic card hover glows, ensure mobile responsiveness | M1 | DONE |
| M-FINAL | Final Verification, E2E Pass & Visual Audit | Run `node tests/runner.js` (100% pass), execute `tests/capture_visuals.js`, inspect desktop & mobile screenshots, verify zero layout regressions | M-TEST, M1, M2 | DONE |

## Interface Contracts
### HTML (`index.html`) ↔ Test Harness (`tests/*`)
- Hero quote element ID: `#hero-ethos-quote` containing professional engineering ethos.
- Vector badges check: `#skills` or `#hero` references `assets/badges/codeforces.svg` or `assets/badges/icpc_global.svg`.
- Award cards in `#honors`: Contain `.award-card.glass-card`, attributes `data-category` and `data-award-id`, zero `<img>` tags inside `#honors`.
- Hero showcase: Retains `#hero-tab-arena`, `#hero-tab-campus`, `#hero-pic-arena`, `#hero-pic-campus`, `#hero-image-wrap[data-lightbox-src]`.
- Lightbox modal: `#lightbox-modal` retained for hero showcase.

### HTML (`index.html`) ↔ Stylesheet (`assets/css/portfolio.css`)
- Glass cards: `.glass-card` with refined top border highlight and semantic category hover shadows.
- Typographic award cards: `.award-card` with clean padding, typography hierarchy, and badge styles.
- Navigation links: `font-sans` with smooth hover states.

### Visual Capture Runner (`tests/capture_visuals.js`)
- Output directory: `.agents/teamwork/visual_audit/`
- Captured viewports:
  - Desktop: 1280x800 (`desktop_full.png`, `desktop_hero.png`, `desktop_honors.png`, `desktop_projects.png`, `desktop_skills.png`, `desktop_contact.png`)
  - Mobile: 375x812 (`mobile_full.png`, `mobile_hero.png`, `mobile_honors.png`, `mobile_projects.png`, `mobile_skills.png`, `mobile_contact.png`)

## Code Layout
- `index.html`: Main portfolio structure, semantic HTML markup. Owned by Worker M1.
- `assets/js/main.js`: Client runtime, hero switcher, typewriter, filter logic. Owned by Worker M1.
- `assets/css/portfolio.css`: Design tokens, typography, glassmorphism, responsive utilities. Owned by Worker M2.
- `tests/*.test.js`: Automated test suites. Owned by Worker M-TEST.
- `tests/capture_visuals.js`: Automated browser screenshot capture runner. Owned by Worker M-TEST.
- `.agents/teamwork/visual_audit/*.png`: Visual audit artifacts. Produced by M-TEST / M-FINAL.
