import { createSuite, assert } from '../helpers/test-harness.mjs';
import { getContrastRatio, isWcagAA, isWcagNonText } from '../helpers/contrast.mjs';

export default async function suite() {
  const s = createSuite('Tier 3 - Theme, UI Primitives & Contrast Combinations (F1 + F2 + F3 + F4 + F5)', {
    tier: 3,
    combinations: ['Theme + Button + Contrast', 'Input + Focus + Contrast', 'Card + Typography + Surface']
  });

  s.test('Combo 1: Primary button (pure white bg #ffffff + black text #000000) achieves 21:1 contrast on dark surface', () => {
    const textContrast = getContrastRatio('#000000', '#ffffff');
    assert.strictEqual(textContrast, 21.0, 'Button text contrast must be maximal 21:1');
    const bgContrast = isWcagNonText('#ffffff', '#0a0a0a');
    assert.ok(bgContrast.passes, 'Button background against surface must pass non-text contrast >= 3:1');
  });

  s.test('Combo 2: Secondary button (#262626 surface + #ffffff text) satisfies WCAG AA >= 4.5:1 text contrast', () => {
    const textContrast = isWcagAA('#ffffff', '#262626', false);
    assert.ok(textContrast.passes, `Secondary button text contrast ${textContrast.ratio.toFixed(2)} must be >= 4.5:1`);
  });

  s.test('Combo 3: Form input border (#404040) on background (#000000) achieves >= 3.0:1 non-text contrast', () => {
    const borderContrast = isWcagNonText('#404040', '#000000');
    assert.ok(borderContrast.passes, `Input border contrast ${borderContrast.ratio.toFixed(2)} must be >= 3.0:1`);
  });

  s.test('Combo 4: Active focus ring (#ffffff) on input border (#404040) achieves >= 3.0:1 contrast delta', () => {
    const ringDelta = getContrastRatio('#ffffff', '#404040');
    assert.ok(ringDelta >= 3.0, `Focus ring delta ${ringDelta.toFixed(2)} must be >= 3.0:1`);
  });

  s.test('Combo 5: Card elevated surface (#171717) with heading H2 (#ffffff) and body (#a3a3a3) both satisfy WCAG AA', () => {
    const headingContrast = isWcagAA('#ffffff', '#171717', true);
    const bodyContrast = isWcagAA('#a3a3a3', '#171717', false);
    assert.ok(headingContrast.passes, 'H2 heading on card must pass WCAG AA');
    assert.ok(bodyContrast.passes, 'Body text on card must pass WCAG AA');
  });

  s.test('Combo 6: Error alert box (border red-500/50, text red-400 #f87171) on dark surface meets WCAG AA', () => {
    const errTextContrast = isWcagAA('#f87171', '#171717', false);
    assert.ok(errTextContrast.passes, 'Error message text must meet 4.5:1');
  });

  return s;
}
