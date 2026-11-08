# E2E Test Infra: KaNguyen3005 Portfolio

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Testing.
- Target: Verify interface correctness, asset availability (zero 404s), scrolling smoothness, CLS prevention, and interactive elements.

## Feature Inventory
| # | Feature | Source (Requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|----------------------|:------:|:------:|:------:|
| 1 | Navigation & Brand Identity | ORIGINAL_REQUEST §2 | 5 | 5 | ✓ |
| 2 | Hero Section & CTAs | ORIGINAL_REQUEST §2 | 5 | 5 | ✓ |
| 3 | Bento Stats Matrix | ORIGINAL_REQUEST §2 | 5 | 5 | ✓ |
| 4 | Contest & Award Photos Integration | ORIGINAL_REQUEST §4 | 5 | 5 | ✓ |
| 5 | Honors Category Filter Tabs | ORIGINAL_REQUEST §2 | 5 | 5 | ✓ |
| 6 | Interactive Lightbox Proof Modal | ORIGINAL_REQUEST §2, 4 | 5 | 5 | ✓ |
| 7 | Scrolling Smoothness & 60fps Animation | ORIGINAL_REQUEST §3 | 5 | 5 | ✓ |
| 8 | Zero Cumulative Layout Shift (CLS) | ORIGINAL_REQUEST §3 | 5 | 5 | ✓ |
| 9 | Projects & Systems Showcase | ORIGINAL_REQUEST §2 | 5 | 5 | ✓ |
| 10 | Scientific Research (I-SMAC '26) | ORIGINAL_REQUEST §2 | 5 | 5 | ✓ |
| 11 | Technical Arsenal / Skills | ORIGINAL_REQUEST §2 | 5 | 5 | ✓ |
| 12 | Zero 404 Network Errors | ORIGINAL_REQUEST §2, 4 | 5 | 5 | ✓ |

## Test Architecture
- Test Runner: Node.js standard runtime script (`tests/runner.js`) requiring no bulky dependencies.
- Assertion Engine: Lightweight DOM/HTML static & runtime assertions via regex/JSDOM parsing and headless HTTP/browser checks.
- Test Suite Layout:
  * `tests/tier1_features.test.js`: Feature coverage (≥5 per feature, 60+ tests).
  * `tests/tier2_boundaries.test.js`: Boundary, edge cases, responsive dimensions, and error recovery.
  * `tests/tier3_interactions.test.js`: Cross-feature combinations (filter + lightbox, scroll + navbar, etc.).
  * `tests/tier4_workloads.test.js`: Real-world end-to-end recruiter audit journeys and candidate evaluation workflows.
- Execution Command: `node tests/runner.js`
- Pass/Fail Semantics: Exit code 0 on all tests passing, exit code 1 on any failure.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Recruiter ICPC Credential Verification Journey | F1, F2, F4, F5, F6, F12 | High |
| 2 | Academic Paper & Research Evaluation | F9, F10 | Medium |
| 3 | Fast Mobile User Browsing & Filter Switching | F1, F5, F7, F8, F12 | High |
| 4 | High-Stress Rapid Scroll & Modal Toggle | F6, F7, F8 | High |
| 5 | Full Portfolio Asset & Link Audit | F4, F9, F11, F12 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature (≥60 tests across 12 features)
- Tier 2: ≥5 per feature (where boundaries exist, ≥60 tests)
- Tier 3: Pairwise coverage of major feature interactions (≥12 tests)
- Tier 4: ≥5 realistic application scenarios
- Total Target: ≥140 test cases
