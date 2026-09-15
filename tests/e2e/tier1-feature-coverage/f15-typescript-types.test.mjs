import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile } from '../helpers/dom-simulator.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F15: TypeScript Typings', { feature: 'F15', requirement: 'R5' });

  s.test('F15-1: TypeScript configuration tsconfig.json is valid and references tsconfig.app.json', () => {
    const tsconfig = readSourceFile('tsconfig.json');
    assert.ok(tsconfig !== null, 'tsconfig.json must exist');
    assert.ok(tsconfig.includes('tsconfig.app.json'), 'tsconfig.json must reference tsconfig.app.json');
  });

  s.test('F15-2: Keyframe interface structure enforces t, pos, rot, scale fields', () => {
    const sceneSrc = readSourceFile('src/components/ProductScene.tsx');
    const typesSrc = readSourceFile('src/components/scene/types.ts');
    const combined = (sceneSrc || '') + (typesSrc || '');
    assert.ok(combined.includes('pos:') || combined.includes('pos: ['), 'Keyframe must define pos tuple');
    assert.ok(combined.includes('rot:') || combined.includes('rot: ['), 'Keyframe must define rot tuple');
    assert.ok(combined.includes('scale:'), 'Keyframe must define scale number');
  });

  s.test('F15-3: Order interface in AdminDashboard defines strict field typings', () => {
    const adminSrc = readSourceFile('src/AdminDashboard.tsx');
    assert.ok(adminSrc.includes('interface Order') || adminSrc.includes('type Order'),
      'AdminDashboard must define Order type');
    assert.ok(adminSrc.includes('customer_name:') && adminSrc.includes('status:') && adminSrc.includes('price:'),
      'Order must strongly type customer_name, status, and price');
  });

  s.test('F15-4: API module declares typed request parameters for createOrder', () => {
    const apiSrc = readSourceFile('src/api.ts');
    assert.ok(apiSrc.includes('createOrder'), 'api.ts must export createOrder');
    assert.ok(apiSrc.includes('customer_name') && apiSrc.includes('price: number'),
      'createOrder must strictly type customer_name and price');
  });

  s.test('F15-5: App entry point declares typed React root binding', () => {
    const mainSrc = readSourceFile('src/main.tsx');
    assert.ok(mainSrc.includes('document.getElementById(\'root\')!'),
      'main.tsx must use non-null assertion or typecheck for root element');
  });

  return s;
}
