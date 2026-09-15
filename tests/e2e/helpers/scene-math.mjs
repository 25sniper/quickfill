/**
 * 3D Scene Math & Keyframe Interpolation Reference Oracle
 * Derived from PROJECT.md § Scene Architecture & ProductScene.tsx
 */

export function lerp(a, b, t) {
  if (t <= 0) return a;
  if (t >= 1) return b;
  return a + (b - a) * t;
}

export function damp(current, target, lambda, dt) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/**
 * Reference implementation of keyframe evaluation
 */
export function referenceEvalAt(kfs, t) {
  if (!kfs || !kfs.length) {
    return { pos: [0, 0, 0], rot: [0, 0, 0], scale: 1 };
  }
  const s = [...kfs].sort((a, b) => a.t - b.t);
  if (t <= s[0].t) {
    return { pos: [...s[0].pos], rot: [...s[0].rot], scale: s[0].scale };
  }
  const last = s[s.length - 1];
  if (t >= last.t) {
    return { pos: [...last.pos], rot: [...last.rot], scale: last.scale };
  }
  for (let i = 0; i < s.length - 1; i++) {
    if (t >= s[i].t && t <= s[i + 1].t) {
      const f = (t - s[i].t) / (s[i + 1].t - s[i].t);
      return {
        pos: [
          lerp(s[i].pos[0], s[i + 1].pos[0], f),
          lerp(s[i].pos[1], s[i + 1].pos[1], f),
          lerp(s[i].pos[2], s[i + 1].pos[2], f)
        ],
        rot: [
          lerp(s[i].rot[0], s[i + 1].rot[0], f),
          lerp(s[i].rot[1], s[i + 1].rot[1], f),
          lerp(s[i].rot[2], s[i + 1].rot[2], f)
        ],
        scale: lerp(s[i].scale, s[i + 1].scale, f)
      };
    }
  }
  return { pos: [...last.pos], rot: [...last.rot], scale: last.scale };
}

/**
 * Standard presser keyframes as defined in source
 */
export const CANONICAL_PRESSER_KFS = [
  { t: 0.00, pos: [ 0.000,  0.000,  0.000], rot: [ 2.000, 0.000, 0.000], scale: 1.000 },
  { t: 0.40, pos: [-2.469, -0.007, -0.263], rot: [ 3.140, 0.000, 1.575], scale: 1.000 },
  { t: 0.50, pos: [-2.401,  0.482,  0.046], rot: [ 1.575, 0.000, 1.575], scale: 1.000 },
  { t: 0.60, pos: [-2.401,  0.482,  0.046], rot: [ 0.000, 0.000, 1.575], scale: 1.000 },
  { t: 1.00, pos: [ 0.000,  0.000,  0.000], rot: [ 0.000, 0.000, 0.000], scale: 1.000 }
];

export const CANONICAL_TAP_KFS = [
  { t: 0.00, pos: [ 0.000,  0.000,  0.000], rot: [0, 0, 0], scale: 0.050 },
  { t: 0.40, pos: [-0.084, -0.463, -0.522], rot: [0, 0, 0], scale: 2.000 },
  { t: 0.50, pos: [-0.084, -0.463, -0.522], rot: [0, 0, 0], scale: 2.000 },
  { t: 0.60, pos: [-0.084, -0.463, -0.522], rot: [0, 0, 0], scale: 2.000 },
  { t: 1.00, pos: [ 0.000,  0.000,  0.000], rot: [0, 0, 0], scale: 0.050 }
];

export const TUTORIAL_BOUNDS = {
  START: 0.33,
  END: 0.88
};
