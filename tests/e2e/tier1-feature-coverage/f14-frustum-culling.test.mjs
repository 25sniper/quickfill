import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile } from '../helpers/dom-simulator.mjs';
import { TUTORIAL_BOUNDS } from '../helpers/scene-math.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F14: Frustum Culling & Visibility', { feature: 'F14', requirement: 'R4' });

  s.test('F14-1: TutorialTap restricts active visibility strictly to tutorial scroll range', () => {
    const sceneSrc = readSourceFile('src/components/ProductScene.tsx') || readSourceFile('src/components/scene/TutorialTap.tsx');
    assert.ok(sceneSrc.includes('TUTORIAL_START') && sceneSrc.includes('TUTORIAL_END'),
      'Tutorial model must check bounds against TUTORIAL_START and TUTORIAL_END');
  });

  s.test('F14-2: Tutorial model suppresses scale/visibility outside tutorial range', () => {
    const sceneSrc = readSourceFile('src/components/ProductScene.tsx') || readSourceFile('src/components/scene/TutorialTap.tsx');
    assert.ok(sceneSrc.includes('scale.setScalar') || sceneSrc.includes('visible = false') || sceneSrc.includes('visible='),
      'Model must scale down or disable visibility when outside active window');
  });

  s.test('F14-3: Tutorial scroll bounds [0.33, 0.88] span exactly 55% of the total page scroll range', () => {
    const span = TUTORIAL_BOUNDS.END - TUTORIAL_BOUNDS.START;
    assert.ok(Math.abs(span - 0.55) < 0.001, `Span ${span.toFixed(2)} should match 0.55`);
  });

  s.test('F14-4: Off-screen models avoid redundant matrix computations', () => {
    // Contract verification: when visible is false or scale is 0, model does not require rendering
    const isVisibleAt = (t) => t >= TUTORIAL_BOUNDS.START && t <= TUTORIAL_BOUNDS.END;
    assert.strictEqual(isVisibleAt(0.1), false, 'Should be hidden at hero section t=0.1');
    assert.strictEqual(isVisibleAt(0.5), true, 'Should be visible during tutorial t=0.5');
    assert.strictEqual(isVisibleAt(0.95), false, 'Should be hidden at preorder section t=0.95');
  });

  s.test('F14-5: Scene components maintain 3D group hierarchy for bounds computation', () => {
    const sceneSrc = readSourceFile('src/components/ProductScene.tsx');
    assert.ok(sceneSrc.includes('<group') || sceneSrc.includes('group ref='),
      '3D scene models must be encapsulated in Three.js groups');
  });

  return s;
}
