# Project: KaNguyen3005 Portfolio Modernization & Performance Overhaul

## Architecture
- **Repository Root**: `C:\Users\ACER\.gemini\antigravity\scratch\KaNguyen3005.github.io`
- **Hosting Environment**: GitHub Pages (static HTML, CSS, JS, image assets)
- **Design Paradigm**: Modern Bento Grid, Obsidian Dark Theme (`#080C14`), Precision Glassmorphism, Semantic Accent Badges
- **Performance Standard**: Locked 60 FPS scrolling, zero Cumulative Layout Shift (CLS < 0.01), zero runtime CDN JIT compilation, sub-second First Contentful Paint (FCP)
- **Visual Evidence**: Authentic photographic verification of ICPC Championships, PTITHCM Supreme Academic Scholarship, KADA Korea, Code4Future, Vovinam medal, and HD contest arena via an accessible interactive Lightbox modal

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Authentic Photo Pipeline | Copy, crop, optimize, and catalog 17 authentic images from Desktop and uploaded media into `assets/` and `assets/awards/` (WebP + high-res PNG) | M1 | Survey E1, E3 |
| F2 | Hero Arena Master HD Image | Replace blurry 590px `icpc_contest_2026.png` with 1024px master HD asset from `media_1794151967363_b3744fd4.jpg` | M1 | Survey E1, E3 |
| F3 | Digital Profile Badges | Generate crisp vector/SVG badge cards for Codeforces Specialist (rating 1400+) and ICPC Global ID | M1 | Survey E1, E2, E3 |
| F4 | Static Production CSS Engine | Replace client-side runtime `cdn.tailwindcss.com` Play CDN with precompiled static stylesheet (`assets/css/portfolio.css`), cutting ~360KB blocking script | M2 | Survey E1, E2 |
| F5 | GPU Compositor & Scroll Optimization | Replace animated `blur-3xl` divs with static CSS radial gradients; apply `transform: translateZ(0)` on navbar; add `content-visibility: auto` to offscreen sections | M2 | Survey E1, E2 |
| F6 | CLS Elimination & Aspect Ratios | Explicit HTML `width`, `height`, and CSS `aspect-ratio` on all images to eliminate layout shifts (CLS < 0.01) | M2 | Survey E1, E2 |
| F7 | Execution Loop Throttling | Wrap typewriter effect in `IntersectionObserver` so it pauses when offscreen; use passive scroll listeners | M2 | Survey E1 |
| F8 | Slim Glassmorphic Navigation | Streamline navbar from 80px to 64px (`h-16`) with active scrollspy, verified status pill, and clean navigation links | M3 | Survey E2 |
| F9 | Hero Bento Identity Anchor | Asymmetric 2-column hero: left column authoritative bio & verified CTAs; right column HD Arena Bento card with live status & Luffy quote | M3 | Survey E2 |
| F10 | 4-Cell Bento Matrix | Interactive metric showcase: ICPC Champion 2024, Codeforces Specialist, 100% Scholarship, I-SMAC '26 Author | M3 | Survey E2 |
| F11 | Honors & Awards Filter Tabs | Category filtering (`Tất Cả`, `ICPC & Giải Thuật`, `Công Nghệ & AI`, `Học Thuật & Rèn Luyện`) for seamless scanning | M3 | Survey E2 |
| F12 | Authentic Photographic Honors Cards | Integrate real certificates and stage photos for ICPC 2024, ICPC 2025, PTIT Scholarship, Code4Future, KADA, and Vovinam 2024 | M3 | Survey E2, E3 |
| F13 | Interactive Proof Lightbox Modal | Zero-dependency click-to-zoom modal allowing recruiters to inspect high-resolution certificates with keyboard navigation (Escape, click-outside) | M3 | Survey E2, E3 |
| F14 | Streamlined Projects & Research | Refined technical cards for Due Bro, LMS Microservices, Identity Service, CP Vault, and I-SMAC '26 PhoBERT research paper | M3 | Survey E2 |
| F15 | E2E Test Suite (Tiers 1-4) | Comprehensive opaque-box test harness validating DOM structure, assets, zero 404s, performance metrics, filter tabs, and modal interaction | E2E | Project Pattern |
| F16 | Adversarial Hardening (Tier 5) | White-box stress testing, responsive viewport audits (mobile/tablet/desktop), cross-browser compatibility, and edge-case verification | M4 | Project Pattern |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Asset Pipeline & Image Processing | Copy, optimize, and organize all contest/scholarship photos and badges in `assets/` and `assets/awards/`, zero 404s | none | PLANNED |
| M2 | CSS Architecture & Performance Engine | Eliminate Play CDN, compile static CSS, optimize GPU compositing, eliminate CLS, throttle event loops | none | PLANNED |
| M3 | UI/UX Redesign & Content Integration | Overhaul `index.html` with modern Bento Grid, filter tabs, authentic photo cards, interactive Lightbox modal | M1, M2 | PLANNED |
| M4 | Final E2E Pass & Adversarial Hardening | Pass 100% E2E test suite (Tiers 1-4), then execute Tier 5 adversarial hardening | M3, E2E | PLANNED |
| E2E | E2E Testing Track | Independent opaque-box test infrastructure and test cases (Tiers 1-4) derived from user requirements | none | IN_PROGRESS |

## Interface Contracts
### M1 ↔ M3 (Assets to HTML)
- Award image files in `assets/awards/`:
  * `scholarship_ptit.png` / `scholarship_ptit.webp` (PTITHCM 100% Supreme Scholarship)
  * `icpc_champion_2024.png` / `icpc_champion_2024.webp` (HCMPTIT ICPC 2024 Champion)
  * `icpc_runnerup_2025.png` / `icpc_runnerup_2025.webp` (PTITHCM ICPC 2025 2nd Prize)
  * `utc_code4future.png` / `utc_code4future.webp` (UTC Code4Future 2nd Prize)
  * `kada_korea.png` / `kada_korea.webp` (KADA Program 3rd Prize - Due Bro)
  * `vovinam_2024.png` / `vovinam_2024.webp` (Vovinam 2024 Martial Arts Award)
  * `icpc_national_2025.png` / `icpc_national_2025.webp` (ICPC Vietnam National Finalist)
- Hero image: `assets/icpc_contest_2026.png` (Master HD 1024x682)
- Badges: `assets/badges/codeforces.svg`, `assets/badges/icpc_global.svg`
- Metadata: All images provide known native dimensions (width, height, aspect-ratio 16:9 or 4:3).

### M2 ↔ M3 (CSS & Performance to HTML)
- Precompiled stylesheet path: `assets/css/portfolio.css` (or `assets/css/style.min.css`)
- Color tokens: `--bg-canvas`, `--bg-surface`, `--bg-surface-elevated`, `--text-primary`, `--accent-gold`, `--accent-cyan`, `--accent-emerald`, `--accent-indigo`
- Class contracts: `.glass-card`, `.bento-matrix`, `.badge-gold`, `.badge-cyan`, `.aspect-card`
- Global styles include zero layout shift definitions, `content-visibility: auto` on offscreen sections, and hardware-accelerated transforms.

### M3 ↔ E2E (HTML Entry Points to Test Runner)
- Filter buttons: `[data-filter="all"]`, `[data-filter="icpc"]`, `[data-filter="tech"]`, `[data-filter="scholarship"]`
- Award cards: `[data-category="..."]`, `[data-award-id="..."]`
- Lightbox trigger: `[data-lightbox-src="..."]`, modal container `#lightbox-modal`, close button `#lightbox-close`
- Navbar: `#navbar`, nav links `a[href^="#"]`
- Typewriter element: `#typewriter`

## Code Layout
```
KaNguyen3005.github.io/
├── index.html                    # Main streamlined portfolio entry point
├── assets/
│   ├── icpc_contest_2026.png     # Upgraded HD arena image
│   ├── css/
│   │   └── portfolio.css         # Precompiled zero-lag production stylesheet
│   ├── js/
│   │   └── main.js               # Modular JS (typewriter observer, lightbox, filter tabs, scrollspy)
│   ├── awards/                   # Authentic contest & scholarship photographic proof
│   │   ├── scholarship_ptit.png
│   │   ├── icpc_champion_2024.png
│   │   ├── icpc_runnerup_2025.png
│   │   ├── utc_code4future.png
│   │   ├── kada_korea.png
│   │   ├── vovinam_2024.png
│   │   └── icpc_national_2025.png
│   └── badges/                   # Clean vector badges
│       ├── codeforces.svg
│       └── icpc_global.svg
├── tests/                        # E2E test suite (Tiers 1-4 + Tier 5)
│   ├── runner.js                 # Node-based E2E test runner
│   ├── tier1_features.test.js
│   ├── tier2_boundaries.test.js
│   ├── tier3_interactions.test.js
│   └── tier4_workloads.test.js
├── PROJECT.md                    # Project blueprint & milestone tracking
└── TEST_READY.md                 # Signal from E2E Testing Track when test suite is complete
```
