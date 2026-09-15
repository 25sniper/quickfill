import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile } from '../helpers/dom-simulator.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F5: Typography Hierarchy', { feature: 'F5', requirement: 'R1' });

  s.test('F5-1: App hero declares a unique, prominent H1 heading ("The Perfect Pour.")', () => {
    const appSrc = readSourceFile('src/App.tsx');
    assert.ok(appSrc.includes('<motion.h1') || appSrc.includes('<h1'), 'Hero must contain an H1 heading');
    assert.ok(appSrc.includes('The Perfect Pour.'), 'H1 must contain product headline');
  });

  s.test('F5-2: Section titles use H2 headings with consistent hierarchy', () => {
    const appSrc = readSourceFile('src/App.tsx');
    assert.ok(appSrc.includes('<h2'), 'Page sections must use H2');
    assert.ok(appSrc.includes('Loved by thousands') || appSrc.includes('How it works') || appSrc.includes('Ready to upgrade?'),
      'H2 headings must organize key sections');
  });

  s.test('F5-3: Tutorial steps use H3 subheadings for steps Attach, Lock, Fill', () => {
    const appSrc = readSourceFile('src/App.tsx');
    assert.ok(appSrc.includes('<h3'), 'Tutorial steps must use H3 headings');
    assert.ok(appSrc.includes('Attach') && appSrc.includes('Lock') && appSrc.includes('Fill'),
      'Tutorial steps must be named Attach, Lock, Fill');
  });

  s.test('F5-4: Checkout and Admin views declare view-level H1 headings', () => {
    const checkoutSrc = readSourceFile('src/Checkout.tsx');
    const adminSrc = readSourceFile('src/AdminDashboard.tsx');
    assert.ok(checkoutSrc.includes('<h1') && checkoutSrc.includes('Checkout'), 'Checkout view must have H1');
    assert.ok(adminSrc.includes('<h1') && (adminSrc.includes('Admin Login') || adminSrc.includes('Orders Dashboard')),
      'Admin view must have H1');
  });

  s.test('F5-5: Strict scale descending order is maintained (H1 text size > H2 text size > H3 text size)', () => {
    const appSrc = readSourceFile('src/App.tsx');
    assert.ok(appSrc.includes('text-6xl') || appSrc.includes('text-8xl'), 'H1 uses dominant scale (text-6xl+)');
    assert.ok(appSrc.includes('text-4xl') || appSrc.includes('text-5xl'), 'H2 uses secondary scale (text-4xl/text-5xl)');
    assert.ok(appSrc.includes('text-xl'), 'H3 uses tertiary scale (text-xl)');
  });

  return s;
}
