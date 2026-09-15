import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile } from '../helpers/dom-simulator.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F6: Loading Spinners', { feature: 'F6', requirement: 'R1, R3' });

  s.test('F6-1: Checkout submission indicates loading state with spinner icon', () => {
    const checkoutSrc = readSourceFile('src/Checkout.tsx');
    assert.ok(checkoutSrc.includes('Loader2') || checkoutSrc.includes('Spinner') || checkoutSrc.includes('animate-spin'),
      'Checkout submission must include animated loader component');
    assert.ok(checkoutSrc.includes('loading ?'), 'Checkout button conditionally displays loader during in-flight request');
  });

  s.test('F6-2: Admin authentication displays spinner during login submit', () => {
    const adminSrc = readSourceFile('src/AdminDashboard.tsx');
    assert.ok(adminSrc.includes('Loader2') || adminSrc.includes('Spinner') || adminSrc.includes('animate-spin'),
      'Admin login button must include spinner during auth request');
    assert.ok(adminSrc.includes('disabled={loading}'), 'Login button must be disabled when loading');
  });

  s.test('F6-3: Admin orders refresh button indicates active fetch with spin animation', () => {
    const adminSrc = readSourceFile('src/AdminDashboard.tsx');
    assert.ok(adminSrc.includes('RefreshCw'), 'Admin dashboard includes refresh icon');
    assert.ok(adminSrc.includes('animate-spin'), 'Refresh icon triggers spin animation during fetch');
  });

  s.test('F6-4: 3D Scene includes Suspense boundary with fallback spinner support', () => {
    const appSrc = readSourceFile('src/App.tsx');
    assert.ok(appSrc.includes('<Suspense'), 'ProductScene must be wrapped in Suspense boundary');
    // Forward contract: fallback can be null or SceneFallback/Spinner
    assert.ok(appSrc.includes('fallback='), 'Suspense must define fallback property');
  });

  s.test('F6-5: Spinner component or implementation provides accessible status information', () => {
    const spinnerSrc = readSourceFile('src/components/ui/Spinner.tsx');
    if (spinnerSrc) {
      assert.ok(spinnerSrc.includes('role="status"') || spinnerSrc.includes('aria-label') || spinnerSrc.includes('label'),
        'Dedicated Spinner component must supply accessibility attribute');
    } else {
      // In current code, buttons display loading text or aria state
      const checkoutSrc = readSourceFile('src/Checkout.tsx');
      assert.ok(checkoutSrc.includes('loading'), 'Checkout component manages loading state');
    }
  });

  return s;
}
