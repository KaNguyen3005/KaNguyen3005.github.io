# Project: KaNguyen3005.github.io Portfolio Refinement & Verification

## Architecture
- **Client Frontend**: Zero-dependency static architecture (`index.html`, `assets/css/portfolio.css`, `assets/js/main.js`).
- **Hero Showcase**: Dual-tab bento switcher (ICPC live arena and PTIT campus life) featuring 16:9 chilling anime illustrations and Lightbox zoom modal.
- **Theme Engine**: Unified CSS custom properties (`--bg-canvas`, `--bg-surface`, `--text-primary`, etc.) toggled via `html[data-theme="light"]` and `html[data-theme="dark"]`, controlled across desktop and mobile viewports with localStorage persistence.
- **Progressive Disclosure Modal**: Document-level event delegation opening `#detail-modal` for 21 summary cards (8 honors, 6 projects, 1 research, 6 skills) reading from `<script type="application/json" id="portfolio-details">`.
- **Typographic Grid (`#honors`)**: Zero-image typographic grid with semantic category badges, issuing dates, and authentic verification links.
- **Testing & Visual Audit**: Zero-dependency Node.js test runner in `tests/runner.js` (Tiers 1-4) and automated Chrome CDP visual screenshot auditor in `tests/capture_visuals.js`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Remove Multi-Agent Section | Remove "Effective Multi-Agent Design" card (`research-agents`) and JSON catalog entry; expand Card 1 to `lg:col-span-12` | M1 | ORIGINAL_REQUEST §R3 |
| 2 | Link Verification & Anti-Fabrication | Update verified live links (`DueBro_Kada_Program`), convert unverified links (LMS, IAM, CP-Vault, KaTiLa, Maze Solver, ISMAC, UTC C4F, LinkedIn) to plain text / badges without clickable `<a>` tags | M1 | ORIGINAL_REQUEST §R4 |
| 3 | Desktop & Mobile Theme Switcher | Restore functional light/dark theme switcher across desktop navbar and mobile drawer `#mobile-menu` with localStorage persistence | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Navbar Mobile Menu Clipping Fix | Remove `contain: paint` and adjust navbar overflow so mobile drawer `#mobile-menu` renders cleanly | M1 | ORIGINAL_REQUEST §R1 |
| 5 | Card Detail Modal Delegation | Implement robust document-level event delegation opening `#detail-modal` for all 21 cards (honors, projects, research, skills) | M1 | ORIGINAL_REQUEST §R1 |
| 6 | Modal Content Robustness | Cleanly handle empty metrics, highlights, and tags without rendering empty orphaned sections in `#detail-modal` | M1 | ORIGINAL_REQUEST §R1 |
| 7 | Chilling Anime ICPC Arena Asset | Generate 16:9 atmospheric, chilling anime illustration for ICPC contest arena, replacing existing 3:2 photo | M2 | ORIGINAL_REQUEST §R2 |
| 8 | Chilling Anime PTIT Campus Life Asset | Generate 16:9 atmospheric, chilling anime illustration for PTIT student life, replacing existing 1:1 photo | M2 | ORIGINAL_REQUEST §R2 |
| 9 | Maintain Image-Free Honors Section | Guarantee zero `<img>` or `<picture>` elements in `#honors` section cards | M2 | ORIGINAL_REQUEST §R2 |
| 10 | Test Suite Alignment (Tiers 1-4) | Update test assertions in `tests/tier1_features.test.js`, `tier2_boundaries.test.js`, `tier3_interactions.test.js`, `tier4_workloads.test.js` to match 21 cards, mobile theme toggle, and verified links | M3 | ORIGINAL_REQUEST §R5 |
| 11 | Visual Capture Audit Alignment | Update `tests/capture_visuals.js` to verify mobile theme toggle, 21 cards, zero overflow, and visual layout stability | M3 | ORIGINAL_REQUEST §R5 |
| 12 | Zero Test Failures Verification | Verify `node tests/runner.js` passes 100% of tests with 0 failures (161/161 passed) | M3 | ORIGINAL_REQUEST §R5 |
| 13 | Layout & Visual Screenshot Audit | Execute `node tests/capture_visuals.js`, inspect desktop & mobile screenshots, verify zero visual clipping, overlap, or broken layouts | M3 | ORIGINAL_REQUEST §R5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Frontend Core Overhaul: Theme, Modals, Multi-Agent & Links | Remove Multi-Agent section, expand Card 1 to 12 cols, audit links to real-only / plain text, restore dual desktop/mobile theme toggle with persistence, fix navbar containment, and implement card detail modal event delegation across all 21 cards | Survey complete | DONE |
| M2 | Visual Assets: 16:9 Chilling Anime Illustrations | Generate 16:9 chilling anime illustrations for ICPC arena and PTIT student life, integrate into Hero dual-tab showcase, preserve image-free honors cards | Survey complete | DONE |
| M3 | Test Suite Alignment, Final E2E Pass & Visual Audit | Update test assertions across Tiers 1-4 and visual capture runner; pass 100% automated tests (161/161); verify CDP screenshots (12/12 checks, 0 overflow); Challenger & Forensic Audit review | M1, M2 | DONE |

## Interface Contracts
### HTML (`index.html`) ↔ Test Harness (`tests/*`)
- Desktop theme toggle ID: `#theme-toggle` (class `theme-toggle-btn`)
- Mobile theme toggle ID: `#theme-toggle-mobile` (class `theme-toggle-btn`) inside `#mobile-menu`
- Total cards with `data-detail-id`: Exactly 21 cards (8 honors + 6 projects + 1 research + 6 skills)
- Multi-Agent absence: Zero occurrences of `"research-agents"` in DOM and catalog
- Dead link absence: Zero occurrences of `https://github.com/KaNguyen3005/DueBro` (replaces with `DueBro_Kada_Program` or plain badge)
- Hero showcase assets: `assets/icpc_contest_2026.png` and `assets/ptit_campus_life.png` with 16:9 aspect ratio
- Honors cards: Zero `<img>` or `<picture>` elements inside `#honors`
- Detail modal: `#detail-modal` with `.close-detail-modal` trigger

### HTML (`index.html`) ↔ Stylesheet (`assets/css/portfolio.css`)
- Theme tokens: `html[data-theme="light"]` and `html[data-theme="dark"]` define all surface and text variables
- Navbar glass: `.glass` on `#navbar` must not clip mobile drawer `#mobile-menu`

## Code Layout
- `index.html`: Main portfolio structure, semantic HTML markup, `#portfolio-details` JSON catalog. Owned by Worker M1.
- `assets/js/main.js`: Client runtime, theme switcher, modal delegation, hero tab switcher. Owned by Worker M1.
- `assets/css/portfolio.css`: Design tokens, theme styling, navbar styles. Owned by Worker M1.
- `assets/icpc_contest_2026.*`, `assets/ptit_campus_life.*`: Visual assets in Hero showcase. Owned by Worker M2.
- `tests/*.test.js`: Automated test suites (Tiers 1-4). Owned by Worker M3.
- `tests/capture_visuals.js`: Automated browser screenshot capture runner. Owned by Worker M3.
