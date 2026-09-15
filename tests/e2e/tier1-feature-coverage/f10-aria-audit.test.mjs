import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile } from '../helpers/dom-simulator.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F10: ARIA Accessibility Audit', { feature: 'F10', requirement: 'R3' });

  s.test('F10-1: Checkout form inputs have descriptive labels for screen readers', () => {
    const checkoutSrc = readSourceFile('src/Checkout.tsx');
    assert.ok(checkoutSrc.includes('Full Name'), 'Full Name label exists');
    assert.ok(checkoutSrc.includes('Phone Number'), 'Phone Number label exists');
    assert.ok(checkoutSrc.includes('<label'), 'Form uses semantic <label> tags');
  });

  s.test('F10-2: Admin dashboard order table uses semantic table headers (th)', () => {
    const adminSrc = readSourceFile('src/AdminDashboard.tsx');
    assert.ok(adminSrc.includes('<th'), 'Table uses <th> elements for headers');
    assert.ok(adminSrc.includes('Customer') && adminSrc.includes('Status') && adminSrc.includes('Price'),
      'Headers provide contextual column names');
  });

  s.test('F10-3: Checkout and login error states provide clear text feedback', () => {
    const checkoutSrc = readSourceFile('src/Checkout.tsx');
    const adminSrc = readSourceFile('src/AdminDashboard.tsx');
    assert.ok(checkoutSrc.includes('{error}'), 'Checkout provides dynamic error display');
    assert.ok(adminSrc.includes('{loginError}'), 'Admin login provides dynamic error display');
  });

  s.test('F10-4: Icon buttons include title or aria-label attributes', () => {
    const adminSrc = readSourceFile('src/AdminDashboard.tsx');
    assert.ok(adminSrc.includes('title="Refresh"') || adminSrc.includes('aria-label'),
      'Refresh icon button must provide accessible tooltip or label');
  });

  s.test('F10-5: Interactive links have descriptive target text (avoiding bare "click here")', () => {
    const adminSrc = readSourceFile('src/AdminDashboard.tsx');
    assert.ok(adminSrc.includes('View') || adminSrc.includes('Download'),
      'Custom photo links use descriptive link text');
  });

  return s;
}
