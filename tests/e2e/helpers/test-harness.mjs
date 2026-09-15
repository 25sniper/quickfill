/**
 * Zero-Dependency E2E Test Suite Harness
 * Provides describe/test/expect style testing directly on Node.js runtime.
 */
import assert from 'node:assert/strict';

export { assert };

export class TestSuite {
  constructor(name, metadata = {}) {
    this.name = name;
    this.metadata = metadata;
    this.cases = [];
  }

  test(name, fn) {
    this.cases.push({ name, fn });
  }

  async run() {
    const results = [];
    for (const testCase of this.cases) {
      const start = performance.now();
      try {
        await testCase.fn();
        const duration = (performance.now() - start).toFixed(2);
        results.push({
          name: testCase.name,
          passed: true,
          duration: `${duration}ms`
        });
      } catch (error) {
        const duration = (performance.now() - start).toFixed(2);
        results.push({
          name: testCase.name,
          passed: false,
          duration: `${duration}ms`,
          error: error.message || String(error),
          stack: error.stack
        });
      }
    }
    return {
      suiteName: this.name,
      metadata: this.metadata,
      results,
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length
    };
  }
}

export function createSuite(name, metadata = {}) {
  return new TestSuite(name, metadata);
}
