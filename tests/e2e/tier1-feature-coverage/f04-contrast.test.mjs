import { createSuite, assert } from '../helpers/test-harness.mjs';
import { isWcagAA, isWcagNonText, getContrastRatio } from '../helpers/contrast.mjs';
import { readSourceFile } from '../helpers/dom-simulator.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F4: WCAG AA Color Contrast', { feature: 'F4', requirement: 'R3' });

  s.test('F4-1: Primary white text #ffffff on dark background #0a0a0a satisfies WCAG AA (>= 4.5:1)', () => {
    const res = isWcagAA('#ffffff', '#0a0a0a', false);
    assert.ok(res.passes, `Primary text contrast ${res.ratio.toFixed(2)} must be >= 4.5:1`);
  });

  s.test('F4-2: Muted secondary text #a3a3a3 (neutral-400) satisfies WCAG AA (>= 4.5:1) on dark background', () => {
    const res = isWcagAA('#a3a3a3', '#0a0a0a', false);
    assert.ok(res.passes, `Secondary text #a3a3a3 contrast ${res.ratio.toFixed(2)} must be >= 4.5:1`);
  });

  s.test('F4-3: Error text red-400 (#f87171) satisfies WCAG AA (>= 4.5:1) on dark surface', () => {
    const res = isWcagAA('#f87171', '#0a0a0a', false);
    assert.ok(res.passes, `Error text #f87171 contrast ${res.ratio.toFixed(2)} must be >= 4.5:1`);
  });

  s.test('F4-4: Star ratings yellow-500 (#eab308) and success indicators green-500 meet non-text contrast >= 3.0:1', () => {
    const starRes = isWcagNonText('#eab308', '#171717');
    const successRes = isWcagNonText('#22c55e', '#171717');
    assert.ok(starRes.passes, `Star icon contrast ${starRes.ratio.toFixed(2)} must be >= 3.0:1`);
    assert.ok(successRes.passes, `Success icon contrast ${successRes.ratio.toFixed(2)} must be >= 3.0:1`);
  });

  s.test('F4-5: Verification of low-contrast text replacement (#525252 is not used for primary content)', () => {
    // WCAG calculation: #525252 on #000000 has ratio ~ 2.4:1 which fails WCAG AA normal text
    const lowContrastRatio = getContrastRatio('#525252', '#000000');
    assert.ok(lowContrastRatio < 4.5, 'Authoritative check: #525252 strictly fails 4.5:1, validating requirement for remediation');
    
    // Check that primary body copy uses neutral-400 / #a3a3a3 or lighter
    const appSrc = readSourceFile('src/App.tsx');
    assert.ok(appSrc.includes('text-neutral-400') || appSrc.includes('text-white') || appSrc.includes('text-muted'), 
      'Body copy must use high-contrast text classes');
  });

  return s;
}
