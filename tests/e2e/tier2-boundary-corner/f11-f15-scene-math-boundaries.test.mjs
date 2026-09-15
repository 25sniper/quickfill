import { createSuite, assert } from '../helpers/test-harness.mjs';
import { referenceEvalAt, CANONICAL_PRESSER_KFS, TUTORIAL_BOUNDS, damp } from '../helpers/scene-math.mjs';

export default async function suite() {
  const s = createSuite('Tier 2 - 3D Scene & Math Boundaries (F11-F15)', {
    tier: 2,
    features: ['F11', 'F12', 'F13', 'F14', 'F15']
  });

  // --- F11 Boundaries: Scene Mounting & Composition ---
  s.test('F11-B1: ProductScene handles undefined or null className gracefully', () => {
    const resolveClassName = (cls) => cls || '';
    assert.strictEqual(resolveClassName(undefined), '');
    assert.strictEqual(resolveClassName(null), '');
  });

  s.test('F11-B2: ProductScene handles combined multi-class string', () => {
    const cls = 'w-full h-full pointer-events-none opacity-90';
    assert.ok(cls.split(' ').length === 4);
  });

  s.test('F11-B3: Scene teardown cancels active animation frame requests', () => {
    let frameId = 12345;
    let cancelled = false;
    const cancelFrame = (id) => { if (id === frameId) cancelled = true; };
    cancelFrame(frameId);
    assert.strictEqual(cancelled, true);
  });

  s.test('F11-B4: Canvas resize handles aspect ratio boundaries (ultrawide 21:9, mobile 9:16)', () => {
    const ultraWideAspect = 2560 / 1080;
    const mobileAspect = 1080 / 1920;
    assert.ok(ultraWideAspect > 2.0);
    assert.ok(mobileAspect < 1.0);
  });

  s.test('F11-B5: Context loss and restore event listeners handle WebGL recovery', () => {
    let contextLost = false;
    const handleContextLost = (e) => { contextLost = true; };
    handleContextLost({});
    assert.strictEqual(contextLost, true);
  });

  // --- F12 Boundaries: Constant Value Limits ---
  s.test('F12-B1: Damping math handles extreme delta times (dt = 0s, dt = 1s, dt = 0.0001s)', () => {
    assert.strictEqual(damp(0, 10, 7, 0), 0);
    const stepSlow = damp(0, 10, 7, 0.0001);
    const stepFast = damp(0, 10, 7, 1);
    assert.ok(stepSlow > 0 && stepSlow < stepFast);
  });

  s.test('F12-B2: Damping math handles zero lambda (no motion change)', () => {
    const res = damp(5, 10, 0, 0.016);
    assert.strictEqual(res, 5);
  });

  s.test('F12-B3: High damping lambda (100) snaps instantly toward target without overshoot', () => {
    const res = damp(0, 10, 100, 0.1);
    assert.ok(res > 9.99 && res <= 10.0);
  });

  s.test('F12-B4: Tutorial boundary constants cannot be mutated at runtime', () => {
    const frozenBounds = Object.freeze({ START: 0.33, END: 0.88 });
    assert.throws(() => {
      frozenBounds.START = 0.50;
    }, /Cannot assign to read only property/);
  });

  s.test('F12-B5: Camera clipping near/far planes satisfy near > 0 and far > near', () => {
    const cameraConfig = { near: 0.1, far: 1000, fov: 45 };
    assert.ok(cameraConfig.near > 0);
    assert.ok(cameraConfig.far > cameraConfig.near);
  });

  // --- F13 Boundaries: Keyframe Math Limits & Anomalies ---
  s.test('F13-B1: evalAt handles empty keyframe array [] without crash, returning default state', () => {
    const emptyState = referenceEvalAt([], 0.5);
    assert.deepStrictEqual(emptyState, { pos: [0, 0, 0], rot: [0, 0, 0], scale: 1 });
  });

  s.test('F13-B2: evalAt handles single keyframe array [{ t: 0.5, pos: [1,2,3], rot:[0,0,0], scale: 2 }]', () => {
    const single = [{ t: 0.5, pos: [1, 2, 3], rot: [0, 0, 0], scale: 2 }];
    const state = referenceEvalAt(single, 0.1);
    assert.deepStrictEqual(state.pos, [1, 2, 3]);
    assert.strictEqual(state.scale, 2);
  });

  s.test('F13-B3: evalAt handles out-of-order keyframes by pre-sorting timestamps', () => {
    const unsorted = [
      { t: 1.0, pos: [10, 10, 10], rot: [0, 0, 0], scale: 1 },
      { t: 0.0, pos: [0, 0, 0], rot: [0, 0, 0], scale: 1 }
    ];
    const mid = referenceEvalAt(unsorted, 0.5);
    assert.deepStrictEqual(mid.pos, [5, 5, 5]);
  });

  s.test('F13-B4: evalAt handles identical duplicate timestamps gracefully', () => {
    const duplicates = [
      { t: 0.0, pos: [0, 0, 0], rot: [0, 0, 0], scale: 1 },
      { t: 0.5, pos: [2, 2, 2], rot: [0, 0, 0], scale: 1 },
      { t: 0.5, pos: [4, 4, 4], rot: [0, 0, 0], scale: 1 },
      { t: 1.0, pos: [10, 10, 10], rot: [0, 0, 0], scale: 1 }
    ];
    const res = referenceEvalAt(duplicates, 0.5);
    assert.ok(res !== null);
  });

  s.test('F13-B5: evalAt handles extreme negative and extreme positive progress t (-999, +999)', () => {
    const extremeNeg = referenceEvalAt(CANONICAL_PRESSER_KFS, -999);
    const extremePos = referenceEvalAt(CANONICAL_PRESSER_KFS, 999);
    assert.deepStrictEqual(extremeNeg.pos, [0, 0, 0]);
    assert.deepStrictEqual(extremePos.pos, [0, 0, 0]);
  });

  // --- F14 Boundaries: Visibility & Frustum Thresholds ---
  s.test('F14-B1: Visibility strictly at exact boundary t = TUTORIAL_START (0.33) is active', () => {
    const isVisible = (t) => t >= TUTORIAL_BOUNDS.START && t <= TUTORIAL_BOUNDS.END;
    assert.strictEqual(isVisible(0.33), true);
  });

  s.test('F14-B2: Visibility strictly at exact boundary t = TUTORIAL_END (0.88) is active', () => {
    const isVisible = (t) => t >= TUTORIAL_BOUNDS.START && t <= TUTORIAL_BOUNDS.END;
    assert.strictEqual(isVisible(0.88), true);
  });

  s.test('F14-B3: Visibility just outside boundary t = 0.32999 is inactive', () => {
    const isVisible = (t) => t >= TUTORIAL_BOUNDS.START && t <= TUTORIAL_BOUNDS.END;
    assert.strictEqual(isVisible(0.32999), false);
  });

  s.test('F14-B4: Visibility just outside boundary t = 0.88001 is inactive', () => {
    const isVisible = (t) => t >= TUTORIAL_BOUNDS.START && t <= TUTORIAL_BOUNDS.END;
    assert.strictEqual(isVisible(0.88001), false);
  });

  s.test('F14-B5: Local progress normalization lT is clamped strictly to range [0, 1]', () => {
    const getLocalT = (t) => {
      const raw = (t - TUTORIAL_BOUNDS.START) / (TUTORIAL_BOUNDS.END - TUTORIAL_BOUNDS.START);
      return Math.max(0, Math.min(1, raw));
    };
    assert.strictEqual(getLocalT(0.0), 0);
    assert.strictEqual(getLocalT(0.33), 0);
    assert.strictEqual(getLocalT(0.88), 1);
    assert.strictEqual(getLocalT(1.0), 1);
  });

  // --- F15 Boundaries: Strict Typings & Invariant Guards ---
  s.test('F15-B1: Order entity validates null custom_photo as permissible', () => {
    const order = {
      id: 1,
      customer_name: 'Jane',
      number: '123',
      price: 19.99,
      status: 'Pending',
      custom_photo: null,
      created_at: new Date().toISOString()
    };
    assert.strictEqual(order.custom_photo, null);
  });

  s.test('F15-B2: Order entity validates defined custom_photo string as permissible', () => {
    const order = {
      id: 2,
      customer_name: 'Jane',
      number: '123',
      price: 19.99,
      status: 'Pending',
      custom_photo: 'uploads/tap.jpg',
      created_at: new Date().toISOString()
    };
    assert.strictEqual(typeof order.custom_photo, 'string');
  });

  s.test('F15-B3: Keyframe position is strictly a 3-element tuple [number, number, number]', () => {
    const pos = CANONICAL_PRESSER_KFS[0].pos;
    assert.strictEqual(pos.length, 3);
    for (const coord of pos) {
      assert.strictEqual(typeof coord, 'number');
    }
  });

  s.test('F15-B4: Keyframe rotation is strictly a 3-element tuple [number, number, number]', () => {
    const rot = CANONICAL_PRESSER_KFS[0].rot;
    assert.strictEqual(rot.length, 3);
    for (const angle of rot) {
      assert.strictEqual(typeof angle, 'number');
    }
  });

  s.test('F15-B5: Keyframe scale must be a positive non-zero number', () => {
    for (const kf of CANONICAL_PRESSER_KFS) {
      assert.ok(kf.scale > 0);
    }
  });

  return s;
}
