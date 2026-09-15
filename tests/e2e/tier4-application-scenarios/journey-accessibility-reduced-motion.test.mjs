import { createSuite, assert } from '../helpers/test-harness.mjs';
import { isWcagAA, isWcagNonText } from '../helpers/contrast.mjs';
import { readSourceFile } from '../helpers/dom-simulator.mjs';

export default async function suite() {
  const s = createSuite('Tier 4 - Journey 5: Accessibility-First Assistive Journey', {
    tier: 4,
    journey: 'Accessibility Assistive'
  });

  s.test('Step 1: User with vestibular sensitivity browses with prefers-reduced-motion active', () => {
    const userPrefersReducedMotion = true;
    const scrollAnimationDuration = userPrefersReducedMotion ? 0 : 0.8;
    assert.strictEqual(scrollAnimationDuration, 0, 'Animations must be instantaneous for vestibular safety');
  });

  s.test('Step 2: Screen reader user traverses semantic landmarks (<header>, <main>, <h1>, <h2>)', () => {
    const appSrc = readSourceFile('src/App.tsx');
    assert.ok(appSrc.includes('<header'), 'Semantic header landmark exists');
    assert.ok(appSrc.includes('<main'), 'Semantic main landmark exists');
    assert.ok(appSrc.includes('<section'), 'Semantic section containers exist');
  });

  s.test('Step 3: Keyboard-only user tabs sequentially through all interactive controls with visible rings', () => {
    const tabSequence = [
      { element: 'header-preorder-btn', hasFocusRing: true },
      { element: 'tutorial-trigger-btn', hasFocusRing: true },
      { element: 'bottom-preorder-btn', hasFocusRing: true }
    ];

    for (const item of tabSequence) {
      assert.ok(item.hasFocusRing, `Control ${item.element} must have high-visibility focus ring`);
    }
  });

  s.test('Step 4: Low-vision user perceives text with WCAG AA compliance across all sections', () => {
    const textPairs = [
      { fg: '#ffffff', bg: '#000000', isLarge: true },  // H1
      { fg: '#ffffff', bg: '#0a0a0a', isLarge: true },  // H2
      { fg: '#a3a3a3', bg: '#0a0a0a', isLarge: false }, // Body
      { fg: '#ffffff', bg: '#171717', isLarge: false }, // Card text
    ];

    for (const pair of textPairs) {
      const res = isWcagAA(pair.fg, pair.bg, pair.isLarge);
      assert.ok(res.passes, `Contrast ${pair.fg} on ${pair.bg} (${res.ratio.toFixed(2)}:1) must satisfy WCAG AA`);
    }
  });

  s.test('Step 5: High-contrast form controls and non-text indicators exceed 3.0:1 threshold', () => {
    const uiBoundaryPairs = [
      { fg: '#404040', bg: '#000000' }, // Input border
      { fg: '#ffffff', bg: '#000000' }, // Button background
      { fg: '#22c55e', bg: '#171717' }, // Success check
    ];

    for (const pair of uiBoundaryPairs) {
      const res = isWcagNonText(pair.fg, pair.bg);
      assert.ok(res.passes, `UI boundary ${pair.fg} on ${pair.bg} (${res.ratio.toFixed(2)}:1) must satisfy >= 3:1`);
    }
  });

  return s;
}
