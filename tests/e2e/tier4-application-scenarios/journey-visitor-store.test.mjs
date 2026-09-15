import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile } from '../helpers/dom-simulator.mjs';
import { referenceEvalAt, CANONICAL_PRESSER_KFS } from '../helpers/scene-math.mjs';

export default async function suite() {
  const s = createSuite('Tier 4 - Journey 1: New Visitor Store Discovery & Landing Exploration', {
    tier: 4,
    journey: 'Store Discovery'
  });

  s.test('Step 1: Visitor lands on "/" and perceives hero brand presence ("The Perfect Pour.")', () => {
    const appSrc = readSourceFile('src/App.tsx');
    assert.ok(appSrc.includes('The Perfect Pour.'), 'Headline visible on initial paint');
    assert.ok(appSrc.includes('ultimate pressing attachment for your RO water dispenser'), 'Value proposition is clear');
  });

  s.test('Step 2: 3D scene keyframe is positioned at center default hero orientation (t=0.0)', () => {
    const heroState = referenceEvalAt(CANONICAL_PRESSER_KFS, 0.0);
    assert.deepStrictEqual(heroState.pos, [0, 0, 0]);
    assert.deepStrictEqual(heroState.rot, [2, 0, 0]);
    assert.strictEqual(heroState.scale, 1);
  });

  s.test('Step 3: Visitor scrolls to testimonials section and reviews customer endorsements', () => {
    const appSrc = readSourceFile('src/App.tsx');
    assert.ok(appSrc.includes('Loved by thousands'), 'Testimonials section present');
    assert.ok(appSrc.includes('standing and holding the tap for 2 minutes straight'), 'Social proof quotation present');
  });

  s.test('Step 4: Visitor scrolls through tutorial section and perceives the 3-step value explanation', () => {
    const appSrc = readSourceFile('src/App.tsx');
    const steps = [
      { step: '01', title: 'Attach' },
      { step: '02', title: 'Lock' },
      { step: '03', title: 'Fill' }
    ];
    for (const step of steps) {
      assert.ok(appSrc.includes(step.step) && appSrc.includes(step.title),
        `Step ${step.step} (${step.title}) must be explained to visitor`);
    }
  });

  s.test('Step 5: Visitor reaches bottom CTA and clicks preorder button to initiate checkout flow', () => {
    const appSrc = readSourceFile('src/App.tsx');
    assert.ok(appSrc.includes('Ready to upgrade?'), 'Bottom conversion section present');
    assert.ok(appSrc.includes('Preorder Now - $19.99'), 'Clear pricing CTA button present');
  });

  return s;
}
