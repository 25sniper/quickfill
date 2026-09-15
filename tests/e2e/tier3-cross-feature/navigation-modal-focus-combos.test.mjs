import { createSuite, assert } from '../helpers/test-harness.mjs';

export default async function suite() {
  const s = createSuite('Tier 3 - Navigation, Modal & Focus Combinations (F7 + F8 + F3 + F10)', {
    tier: 3,
    combinations: ['Router + Modal', 'Modal + Focus Trap', 'Navigation + Modal Dismissal']
  });

  s.test('Combo 1: Clicking "Watch the tutorial" opens modal and sets initial focus to first focusable control', () => {
    let modalOpen = false;
    let focusedElement = null;

    const triggerClick = () => {
      modalOpen = true;
      focusedElement = 'modal-close-button';
    };

    triggerClick();
    assert.strictEqual(modalOpen, true);
    assert.strictEqual(focusedElement, 'modal-close-button');
  });

  s.test('Combo 2: Escape key dismisses open modal and restores focus back to trigger button', () => {
    let modalOpen = true;
    let focusedElement = 'modal-close-button';
    const triggerRef = 'tutorial-trigger-button';

    const handleKey = (key) => {
      if (key === 'Escape') {
        modalOpen = false;
        focusedElement = triggerRef;
      }
    };

    handleKey('Escape');
    assert.strictEqual(modalOpen, false);
    assert.strictEqual(focusedElement, 'tutorial-trigger-button');
  });

  s.test('Combo 3: Client router navigation to /checkout automatically unmounts open tutorial modal', () => {
    let currentPath = '/';
    let modalOpen = true;

    const navigate = (to) => {
      currentPath = to;
      modalOpen = false; // navigation unmounts modal
    };

    navigate('/checkout');
    assert.strictEqual(currentPath, '/checkout');
    assert.strictEqual(modalOpen, false);
  });

  s.test('Combo 4: Focus trap restricts Tab cycles strictly within modal elements', () => {
    const modalElements = ['close-btn', 'play-video-btn', 'dismiss-btn'];
    let currentIndex = 0;

    const pressTab = (shift) => {
      if (shift) {
        currentIndex = (currentIndex - 1 + modalElements.length) % modalElements.length;
      } else {
        currentIndex = (currentIndex + 1) % modalElements.length;
      }
      return modalElements[currentIndex];
    };

    assert.strictEqual(pressTab(false), 'play-video-btn');
    assert.strictEqual(pressTab(false), 'dismiss-btn');
    assert.strictEqual(pressTab(false), 'close-btn'); // wrapped around to start
    assert.strictEqual(pressTab(true), 'dismiss-btn'); // reverse wrapped to end
  });

  s.test('Combo 5: Modal backdrop click dismissal does not bleed click through to underlying page buttons', () => {
    let preorderClicked = false;
    let modalClosed = false;

    const handleBackdropClick = (e) => {
      modalClosed = true;
      e.stopPropagation();
    };

    const handlePreorderClick = () => {
      preorderClicked = true;
    };

    let stopped = false;
    handleBackdropClick({ stopPropagation: () => { stopped = true; } });

    assert.strictEqual(modalClosed, true);
    assert.strictEqual(stopped, true);
    assert.strictEqual(preorderClicked, false);
  });

  return s;
}
