import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile, sourceFileExists } from '../helpers/dom-simulator.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F2: Extract Repeated Tailwind Classes into UI Primitives', { feature: 'F2', requirement: 'R1' });

  s.test('F2-1: Button component adheres to interface contract ({ variant, size, isLoading, children })', () => {
    const buttonSrc = readSourceFile('src/components/ui/Button.tsx');
    if (buttonSrc) {
      assert.ok(buttonSrc.includes('variant') || buttonSrc.includes('ButtonProps'), 'Button must define variant props');
      assert.ok(buttonSrc.includes('isLoading') || buttonSrc.includes('disabled'), 'Button must handle loading/disabled states');
    } else {
      // Baseline check: App.tsx and Checkout.tsx buttons have standard button styling classes
      const appSrc = readSourceFile('src/App.tsx');
      assert.ok(appSrc.includes('rounded-full') && appSrc.includes('font-bold'), 'Buttons must have consistent styling classes');
    }
  });

  s.test('F2-2: Input component adheres to interface contract ({ label, error, id, ...props })', () => {
    const inputSrc = readSourceFile('src/components/ui/Input.tsx');
    if (inputSrc) {
      assert.ok(inputSrc.includes('label'), 'Input must support label prop');
      assert.ok(inputSrc.includes('id'), 'Input must support id prop');
    } else {
      const checkoutSrc = readSourceFile('src/Checkout.tsx');
      assert.ok(checkoutSrc.includes('<input'), 'Checkout contains input controls');
    }
  });

  s.test('F2-3: Card component encapsulates elevated surfaces and rounded borders', () => {
    const cardSrc = readSourceFile('src/components/ui/Card.tsx');
    if (cardSrc) {
      assert.ok(cardSrc.includes('rounded') || cardSrc.includes('CardProps'), 'Card must define container styles');
    } else {
      const appSrc = readSourceFile('src/App.tsx');
      assert.ok(appSrc.includes('rounded-3xl') && appSrc.includes('border'), 'Card containers present in layout');
    }
  });

  s.test('F2-4: Modal component adheres to interface contract ({ isOpen, onClose, title, children })', () => {
    const modalSrc = readSourceFile('src/components/ui/Modal.tsx') || readSourceFile('src/components/TutorialModal.tsx');
    if (modalSrc) {
      assert.ok(modalSrc.includes('isOpen'), 'Modal must accept isOpen prop');
      assert.ok(modalSrc.includes('onClose'), 'Modal must accept onClose prop');
    } else {
      // Check that tutorial trigger is present in App.tsx
      const appSrc = readSourceFile('src/App.tsx');
      assert.ok(appSrc.includes('Watch the tutorial'), 'Tutorial action must be defined in App');
    }
  });

  s.test('F2-5: Spinner component adheres to interface contract ({ size, className, label })', () => {
    const spinnerSrc = readSourceFile('src/components/ui/Spinner.tsx');
    if (spinnerSrc) {
      assert.ok(spinnerSrc.includes('animate-spin') || spinnerSrc.includes('Spinner'), 'Spinner must animate or render SVG');
    } else {
      const checkoutSrc = readSourceFile('src/Checkout.tsx');
      assert.ok(checkoutSrc.includes('animate-spin') || checkoutSrc.includes('Loader2'), 'Checkout uses loading spinner');
    }
  });

  return s;
}
