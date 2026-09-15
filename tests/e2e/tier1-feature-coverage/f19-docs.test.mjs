import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile, sourceFileExists } from '../helpers/dom-simulator.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F19: Architecture Documentation', { feature: 'F19', requirement: 'R6' });

  s.test('F19-1: README.md exists at project root', () => {
    assert.ok(sourceFileExists('README.md'), 'README.md must exist');
    const readme = readSourceFile('README.md');
    assert.ok(readme.length > 50, 'README.md must contain informative project description');
  });

  s.test('F19-2: README.md documents running development server and build scripts', () => {
    const readme = readSourceFile('README.md');
    assert.ok(readme.includes('npm') || readme.includes('dev') || readme.includes('build'),
      'README.md must document build and dev workflow');
  });

  s.test('F19-3: PROJECT.md documents architecture and milestone plan (M1-M6)', () => {
    const projectDoc = readSourceFile('PROJECT.md');
    assert.ok(projectDoc !== null, 'PROJECT.md must exist');
    assert.ok(projectDoc.includes('M1') && projectDoc.includes('M6'),
      'PROJECT.md must define complete milestone sequence M1 to M6');
  });

  s.test('F19-4: PROJECT.md documents feature inventory F1 through F22', () => {
    const projectDoc = readSourceFile('PROJECT.md');
    assert.ok(projectDoc.includes('F1') && projectDoc.includes('F22'),
      'PROJECT.md must define feature inventory F1 through F22');
  });

  s.test('F19-5: PROJECT.md defines interface contracts for UI primitives and 3D scene', () => {
    const projectDoc = readSourceFile('PROJECT.md');
    assert.ok(projectDoc.includes('Interface Contracts'), 'PROJECT.md must document interface contracts');
    assert.ok(projectDoc.includes('Button') && projectDoc.includes('ProductScene'),
      'Contracts must specify Button and ProductScene interfaces');
  });

  return s;
}
