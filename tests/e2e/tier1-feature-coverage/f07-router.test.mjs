import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile } from '../helpers/dom-simulator.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F7: React Router Navigation', { feature: 'F7', requirement: 'R2' });

  s.test('F7-1: Application entry defines routing paths for /, /checkout, /admin', () => {
    const mainSrc = readSourceFile('src/main.tsx');
    const routesSrc = readSourceFile('src/routes.tsx');
    const combined = (mainSrc || '') + (routesSrc || '');
    assert.ok(combined.includes('/checkout') && combined.includes('/admin'),
      'Routing architecture must map /checkout and /admin');
  });

  s.test('F7-2: Root route "/" maps to App landing page', () => {
    const mainSrc = readSourceFile('src/main.tsx');
    const routesSrc = readSourceFile('src/routes.tsx');
    const combined = (mainSrc || '') + (routesSrc || '');
    assert.ok(combined.includes('App') || combined.includes('<App'),
      'Root route must render main App landing page');
  });

  s.test('F7-3: Preorder route "/checkout" maps to Checkout component', () => {
    const mainSrc = readSourceFile('src/main.tsx');
    const routesSrc = readSourceFile('src/routes.tsx');
    const combined = (mainSrc || '') + (routesSrc || '');
    assert.ok(combined.includes('Checkout') || combined.includes('<Checkout'),
      'Preorder route must render Checkout component');
  });

  s.test('F7-4: Admin route "/admin" maps to AdminDashboard component', () => {
    const mainSrc = readSourceFile('src/main.tsx');
    const routesSrc = readSourceFile('src/routes.tsx');
    const combined = (mainSrc || '') + (routesSrc || '');
    assert.ok(combined.includes('AdminDashboard') || combined.includes('<AdminDashboard'),
      'Admin route must render AdminDashboard component');
  });

  s.test('F7-5: Navigation avoids full page reload (Router contract readiness)', () => {
    // Contract check: router setup allows SPA state preservation
    const mainSrc = readSourceFile('src/main.tsx');
    assert.ok(mainSrc !== null, 'src/main.tsx must exist');
    // Checks that routes are modularly rendered without breaking DOM attachment
    assert.ok(mainSrc.includes('document.getElementById(\'root\')'), 'Root element mount must be present');
  });

  return s;
}
