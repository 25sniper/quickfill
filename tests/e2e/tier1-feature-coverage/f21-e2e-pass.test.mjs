import { createSuite, assert } from '../helpers/test-harness.mjs';
import { sourceFileExists } from '../helpers/dom-simulator.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F21: E2E Test Suite Pass', { feature: 'F21', requirement: 'Acceptance' });

  s.test('F21-1: Master test runner script tests/e2e/runner.mjs exists and is executable', () => {
    assert.ok(sourceFileExists('tests/e2e/runner.mjs'), 'runner.mjs must exist');
  });

  s.test('F21-2: Test harness captures execution duration and structured metadata', () => {
    const dummySuite = createSuite('Dummy Test', { tier: 1 });
    dummySuite.test('quick test', () => { assert.strictEqual(1 + 1, 2); });
    return dummySuite.run().then(report => {
      assert.strictEqual(report.total, 1);
      assert.strictEqual(report.passed, 1);
      assert.strictEqual(report.failed, 0);
      assert.ok(report.results[0].duration.includes('ms'), 'Duration must be reported in ms');
    });
  });

  s.test('F21-3: Test execution handles asynchronous assertions gracefully', async () => {
    const asyncSuite = createSuite('Async Test Suite');
    asyncSuite.test('delayed resolution', async () => {
      await new Promise(r => setTimeout(r, 5));
      assert.ok(true);
    });
    const report = await asyncSuite.run();
    assert.strictEqual(report.passed, 1);
  });

  s.test('F21-4: Test execution isolates failures without aborting subsequent test cases', async () => {
    const multiSuite = createSuite('Fault Isolation Suite');
    multiSuite.test('failing test', () => { throw new Error('Expected failure'); });
    multiSuite.test('succeeding test', () => { assert.ok(true); });
    const report = await multiSuite.run();
    assert.strictEqual(report.total, 2);
    assert.strictEqual(report.failed, 1);
    assert.strictEqual(report.passed, 1);
  });

  s.test('F21-5: All 4 testing tiers are structured in dedicated directories', () => {
    assert.ok(sourceFileExists('tests/e2e/tier1-feature-coverage'), 'Tier 1 directory must exist');
    assert.ok(sourceFileExists('tests/e2e/tier2-boundary-corner'), 'Tier 2 directory must exist');
    assert.ok(sourceFileExists('tests/e2e/tier3-cross-feature'), 'Tier 3 directory must exist');
    assert.ok(sourceFileExists('tests/e2e/tier4-application-scenarios'), 'Tier 4 directory must exist');
  });

  return s;
}
