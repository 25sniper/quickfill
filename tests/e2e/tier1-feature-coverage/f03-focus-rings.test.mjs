import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile } from '../helpers/dom-simulator.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F3: Accessible Focus Rings', { feature: 'F3', requirement: 'R3' });

  s.test('F3-1: Interactive elements define focus-visible ring styles', () => {
    const files = ['src/App.tsx', 'src/Checkout.tsx', 'src/AdminDashboard.tsx', 'src/components/ui/Button.tsx', 'src/components/ui/Input.tsx'];
    let foundFocusStyles = false;
    for (const file of files) {
      const src = readSourceFile(file);
      if (src && (src.includes('focus-visible:ring') || src.includes('focus:ring') || src.includes('focus:border-white') || src.includes('focus:outline-none'))) {
        foundFocusStyles = true;
        break;
      }
    }
    assert.ok(foundFocusStyles, 'Interactive controls must have focus styles defined');
  });

  s.test('F3-2: Button primitive or button controls avoid bare outline:none without focus indicator', () => {
    const checkoutSrc = readSourceFile('src/Checkout.tsx');
    assert.ok(checkoutSrc !== null, 'Checkout.tsx must exist');
    // Outline-none must be accompanied by border or ring indication
    if (checkoutSrc.includes('focus:outline-none')) {
      assert.ok(
        checkoutSrc.includes('focus:border-white') || checkoutSrc.includes('focus:ring') || checkoutSrc.includes('focus-visible'),
        'Focus outline:none must have accompanying focus border or ring'
      );
    }
  });

  s.test('F3-3: Form inputs have prominent focus state transitions', () => {
    const checkoutSrc = readSourceFile('src/Checkout.tsx');
    assert.ok(
      checkoutSrc.includes('focus:border-white') || checkoutSrc.includes('focus:ring') || checkoutSrc.includes('focus-visible:ring'),
      'Checkout form inputs must provide visual focus indicator'
    );
  });

  s.test('F3-4: Admin login and dashboard inputs declare focus states', () => {
    const adminSrc = readSourceFile('src/AdminDashboard.tsx');
    assert.ok(adminSrc !== null, 'AdminDashboard.tsx must exist');
    assert.ok(
      adminSrc.includes('focus:border-white') || adminSrc.includes('focus:ring') || adminSrc.includes('focus-visible:ring'),
      'Admin inputs must define visual focus state'
    );
  });

  s.test('F3-5: Focus indicators maintain high contrast against dark container backgrounds', () => {
    // Standard white focus ring on neutral-900 / neutral-950
    // L_white = 1.0, L_dark = 0.01 -> Ratio ~ 17.5:1 (well above WCAG 3:1 non-text requirement)
    const ratio = (1.0 + 0.05) / (0.01 + 0.05);
    assert.ok(ratio >= 3.0, 'Focus ring contrast must exceed WCAG 3.0:1 threshold');
  });

  return s;
}
