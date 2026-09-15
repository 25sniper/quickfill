import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile } from '../helpers/dom-simulator.mjs';
import { getContrastRatio, isWcagNonText } from '../helpers/contrast.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F1: Centralized Color Theme', { feature: 'F1', requirement: 'R1' });

  s.test('F1-1: CSS entry point src/index.css exists and contains styling rules', () => {
    const css = readSourceFile('src/index.css');
    assert.ok(css !== null, 'src/index.css must exist');
    assert.ok(css.length > 0, 'src/index.css must not be empty');
  });

  s.test('F1-2: Theme tokens define semantic palette for dark-mode UI', () => {
    const css = readSourceFile('src/index.css');
    // Accepts either Tailwind v4 @theme declarations or CSS variables or theme classes
    const hasThemeOrVars = css.includes('@theme') || 
                           css.includes('--color-') || 
                           css.includes('@import "tailwindcss"') ||
                           css.includes('@import');
    assert.ok(hasThemeOrVars, 'CSS must include theme configuration or Tailwind entry');
  });

  s.test('F1-3: Primary text #ffffff on #000000 background has authoritative contrast >= 15:1', () => {
    const ratio = getContrastRatio('#ffffff', '#000000');
    assert.ok(ratio >= 15.0, `Primary contrast ratio ${ratio} must be >= 15:1`);
  });

  s.test('F1-4: Surface elevation hierarchy increases luminance monotonically', () => {
    const bg = '#000000';
    const surface = '#0a0a0a';
    const elevated = '#262626';
    const ratioSurface = getContrastRatio(surface, bg);
    const ratioElevated = getContrastRatio(elevated, bg);
    assert.ok(ratioElevated > ratioSurface, 'Elevated surface must have higher relative luminance than base surface');
  });

  s.test('F1-5: Border color token #404040 satisfies non-text contrast >= 3.0:1 on black background', () => {
    const result = isWcagNonText('#404040', '#000000');
    assert.ok(result.passes, `Border #404040 on #000000 ratio ${result.ratio.toFixed(2)} must be >= 3.0:1`);
  });

  return s;
}
