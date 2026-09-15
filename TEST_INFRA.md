# Test Infrastructure & Architecture Specification

**Project**: Presser Frontend Modernization & Overhaul  
**Target Path**: `a:\downloads\presser\TEST_INFRA.md`  
**Author**: E2E Test Writer (`test_writer_e2e_1`)  
**Status**: Ready & Operational  

---

## 1. Executive Summary & Philosophy

The Presser E2E Test Suite implements an opaque-box testing harness designed to independently verify all 22 core features (F1 through F22), requirements R1-R6, and acceptance criteria specified in `PROJECT.md` and `ORIGINAL_REQUEST.md`.

### Core Architectural Tenets:
1. **Opaque-Box Verification**: Tests assess observable system behaviors, interface contracts, DOM hierarchy, and mathematical outputs rather than private implementation details.
2. **Deterministic & Isolated**: Every test case sets up its own state, executes independently, and leaves no side effects on subsequent tests.
3. **Progressive Testability**: The test harness operates smoothly throughout milestone development (M1-M6), dynamically verifying current baseline assets, backward compatibility, and forward contract compliance.
4. **Zero-Dependency Native Architecture**: The runner and test suites execute directly on the Node.js runtime using standard ECMAScript Modules (`.mjs`) and `node:assert/strict`. No external binaries or elevated permissions are required.

---

## 2. Test Suite 4-Tier Hierarchy

The test suite is partitioned into four rigorous, non-overlapping tiers located under `tests/e2e/`:

```
tests/
└── e2e/
    ├── helpers/
    │   ├── contrast.mjs                   # WCAG 2.1 relative luminance & contrast ratio engine
    │   ├── dom-simulator.mjs              # Lightweight source & DOM structure inspector
    │   ├── mock-api.mjs                   # Mock API server simulating backend routes
    │   ├── scene-math.mjs                 # 3D keyframe interpolation oracle & canonical constants
    │   └── test-harness.mjs               # Zero-dependency test harness & assertion wrapper
    ├── tier1-feature-coverage/            # Tier 1: Feature Coverage (>=5 test cases per feature F1-F22)
    │   ├── f01-theme.test.mjs             # F1: Centralized Color Theme
    │   ├── f02-ui-primitives.test.mjs     # F2: Extract Repeated Tailwind Classes
    │   ├── f03-focus-rings.test.mjs       # F3: Accessible Focus Rings
    │   ├── f04-contrast.test.mjs          # F4: WCAG AA Color Contrast
    │   ├── f05-typography.test.mjs        # F5: Typography Hierarchy
    │   ├── f06-spinners.test.mjs          # F6: Loading Spinners
    │   ├── f07-router.test.mjs            # F7: React Router Navigation
    │   ├── f08-tutorial-modal.test.mjs    # F8: Tutorial Modal
    │   ├── f09-reduced-motion.test.mjs    # F9: Reduced-Motion Preferences
    │   ├── f10-aria-audit.test.mjs        # F10: ARIA Accessibility Audit
    │   ├── f11-modular-scene.test.mjs     # F11: Modularize ProductScene.tsx
    │   ├── f12-magic-numbers.test.mjs     # F12: Extract Magic Numbers
    │   ├── f13-memoize-keyframes.test.mjs # F13: Memoize Keyframe Evaluation
    │   ├── f14-frustum-culling.test.mjs   # F14: Frustum Culling & Visibility
    │   ├── f15-typescript-types.test.mjs  # F15: TypeScript Typings
    │   ├── f16-cdn-assets.test.mjs        # F16: CDN Asset Relocation
    │   ├── f17-lazy-loading.test.mjs      # F17: Lazy-Load 3D Scene & Code Splitting
    │   ├── f18-project-cleanup.test.mjs   # F18: Project Cleanup & Asset Structure
    │   ├── f19-docs.test.mjs              # F19: Architecture Documentation
    │   ├── f20-unit-tests.test.mjs        # F20: Unit Test Suite Integration
    │   ├── f21-e2e-pass.test.mjs          # F21: E2E Test Suite Pass (Tiers 1-4)
    │   └── f22-adversarial.test.mjs       # F22: Adversarial Coverage Hardening
    ├── tier2-boundary-corner/             # Tier 2: Boundary & Corner Cases (>=5 test cases per feature)
    │   ├── f01-f06-ui-boundaries.test.mjs                # 30 Boundary tests for UI & styles
    │   ├── f07-f10-nav-accessibility-boundaries.test.mjs # 20 Boundary tests for nav & a11y
    │   ├── f11-f15-scene-math-boundaries.test.mjs        # 25 Boundary tests for 3D scene & math
    │   └── f16-f22-system-asset-boundaries.test.mjs      # 35 Boundary tests for system & security
    ├── tier3-cross-feature/               # Tier 3: Pairwise Cross-Feature Combinations
    │   ├── theme-ui-contrast-combos.test.mjs             # F1 + F2 + F3 + F4 + F5
    │   ├── navigation-modal-focus-combos.test.mjs        # F7 + F8 + F3 + F10
    │   ├── motion-scene-performance-combos.test.mjs      # F9 + F11 + F13 + F14 + F6
    │   ├── checkout-api-feedback-combos.test.mjs         # F2 + F6 + F10 + F15 + F22
    │   └── admin-auth-table-combos.test.mjs              # F2 + F6 + F7 + F10 + F22
    ├── tier4-application-scenarios/       # Tier 4: Real-World Application User Journeys
    │   ├── journey-visitor-store.test.mjs                # Journey 1: Store discovery & browsing
    │   ├── journey-tutorial-modal.test.mjs               # Journey 2: Tutorial modal exploration
    │   ├── journey-preorder-checkout.test.mjs            # Journey 3: Preorder checkout & receipt
    │   ├── journey-admin-orders.test.mjs                 # Journey 4: Admin fulfillment workflow
    │   ├── journey-accessibility-reduced-motion.test.mjs # Journey 5: Assistive keyboard & a11y
    │   └── journey-error-recovery.test.mjs               # Journey 6: Network failure & recovery
    └── runner.mjs                         # Master Test Suite Runner
```

---

## 3. Authoritative Derivation & Oracles

Every test in the suite is backed by an explicit authoritative source:

### 3.1 WCAG 2.1 Relative Luminance & Contrast Oracle (`tests/e2e/helpers/contrast.mjs`)
Calculates mathematical color contrast ratios per W3C WCAG 2.1 specifications:
- Relative luminance formula:
  $$L = 0.2126 \times R + 0.7152 \times G + 0.0722 \times B$$
- Normal body text passes if ratio $\ge 4.5:1$.
- Large text ($\ge 18\text{pt}$ or $\ge 14\text{pt}$ bold) passes if ratio $\ge 3.0:1$.
- Non-text UI components and focus indicators pass if ratio $\ge 3.0:1$.

### 3.2 3D Keyframe Interpolation Oracle (`tests/e2e/helpers/scene-math.mjs`)
Implements authoritative mathematical linear interpolation (`lerp`) and exponential damping (`damp`) across 3D vector spaces `[x, y, z]` for position, rotation, and scalar scale.
- Validates canonical keyframes (`PRESSER_KFS`, `TAP_KFS`).
- Validates tutorial active scroll window $[0.33, 0.88]$.
- Verifies sub-millisecond evaluation efficiency and memory allocation limits.

### 3.3 Mock API Backend Oracle (`tests/e2e/helpers/mock-api.mjs`)
Emulates backend HTTP services defined in `src/api.ts`:
- `POST /upload/`: Validates file extensions, returns uploaded path.
- `POST /orders/`: Validates required fields (`customer_name`, `number`, `price > 0`), creates order with status `Pending`.
- `POST /token`: Authenticates admin credentials, issues Bearer token.
- `GET /orders/`: Authorizes Bearer token, returns orders collection.
- `PUT /orders/:id`: Validates state transitions (`Pending` $\rightarrow$ `Processing` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered` $\rightarrow$ `Cancelled`).

---

## 4. Test Execution & Usage

### 4.1 Running via npm Scripts
The test suite is integrated into `package.json`:

```bash
# Run all 4 Tiers of the E2E Test Suite
npm run test:e2e

# Standard test alias
npm test
```

### 4.2 Running via Node Directly
The master runner supports granular execution by tier:

```bash
# Run all tiers
node tests/e2e/runner.mjs

# Run Tier 1 only (Feature Coverage)
node tests/e2e/runner.mjs --tier=1

# Run Tier 2 only (Boundaries & Corners)
node tests/e2e/runner.mjs --tier=2

# Run Tier 3 only (Cross-Feature Combinations)
node tests/e2e/runner.mjs --tier=3

# Run Tier 4 only (Application User Journeys)
node tests/e2e/runner.mjs --tier=4
```

### 4.3 Output & Exit Codes
- **Standard Out**: Formatted ASCII table detailing test execution per suite, total counts, duration, and pass rate.
- **Machine-Readable Summary**: Written to `tests/e2e/summary.json` containing timestamp, durations, tier summaries, and failure diagnostics.
- **Exit Code 0**: All executed tests passed successfully.
- **Exit Code 1**: One or more test assertions failed, providing full error details and stack traces.

---

## 5. Coverage Statistics

| Tier | Description | Files | Tests |
|------|-------------|-------|-------|
| **Tier 1** | Feature Coverage (F1 to F22) | 22 | 110 |
| **Tier 2** | Boundary & Corner Cases (Limits, zero/negative, extremes) | 4 | 110 |
| **Tier 3** | Cross-Feature Combinations (Pairwise interactions) | 5 | 26 |
| **Tier 4** | Real-World Application Scenarios (End-to-end user journeys) | 6 | 30 |
| **Total** | Full E2E Test Suite | **37 files** | **276 tests** |
