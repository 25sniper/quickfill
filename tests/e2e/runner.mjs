/**
 * Master E2E Test Suite Runner
 * Usage:
 *   node tests/e2e/runner.mjs
 *   node tests/e2e/runner.mjs --tier=1
 *   node tests/e2e/runner.mjs --tier=2
 *   node tests/e2e/runner.mjs --tier=3
 *   node tests/e2e/runner.mjs --tier=4
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PROJECT_ROOT = path.resolve(process.cwd());
const E2E_ROOT = path.resolve(PROJECT_ROOT, 'tests', 'e2e');

async function findTestFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findTestFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.test.mjs')) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const args = process.argv.slice(2);
  let targetTier = null;
  for (const arg of args) {
    if (arg.startsWith('--tier=')) {
      targetTier = parseInt(arg.split('=')[1], 10);
    }
  }

  const tierDirs = {
    1: path.join(E2E_ROOT, 'tier1-feature-coverage'),
    2: path.join(E2E_ROOT, 'tier2-boundary-corner'),
    3: path.join(E2E_ROOT, 'tier3-cross-feature'),
    4: path.join(E2E_ROOT, 'tier4-application-scenarios')
  };

  console.log('================================================================================');
  console.log('                 PRESSER FRONTEND OVERHAUL — E2E TEST SUITE                     ');
  console.log('================================================================================');
  console.log(`Working Directory : ${PROJECT_ROOT}`);
  console.log(`Execution Mode    : ${targetTier ? `Tier ${targetTier} Only` : 'All 4 Tiers'}`);
  console.log(`Start Time        : ${new Date().toISOString()}\n`);

  const activeTiers = targetTier ? [targetTier] : [1, 2, 3, 4];
  let overallTotal = 0;
  let overallPassed = 0;
  let overallFailed = 0;
  const tierReports = [];
  const allFailures = [];

  const startTime = performance.now();

  for (const tierNum of activeTiers) {
    const tierDir = tierDirs[tierNum];
    const testFiles = await findTestFiles(tierDir);
    let tierTotal = 0;
    let tierPassed = 0;
    let tierFailed = 0;

    console.log(`--------------------------------------------------------------------------------`);
    console.log(`[TIER ${tierNum}] Starting execution (${testFiles.length} test files)...`);
    console.log(`--------------------------------------------------------------------------------`);

    for (const file of testFiles) {
      const relPath = path.relative(PROJECT_ROOT, file);
      try {
        const moduleUrl = pathToFileURL(file).href;
        const mod = await import(moduleUrl);
        if (typeof mod.default !== 'function') {
          console.warn(`[WARN] File ${relPath} does not export default suite factory`);
          continue;
        }

        const suite = await mod.default();
        const suiteReport = await suite.run();

        tierTotal += suiteReport.total;
        tierPassed += suiteReport.passed;
        tierFailed += suiteReport.failed;

        const statusSymbol = suiteReport.failed === 0 ? '✓ PASS' : '✗ FAIL';
        console.log(`  ${statusSymbol} [${suiteReport.passed}/${suiteReport.total}] ${suiteReport.suiteName} (${relPath})`);

        for (const res of suiteReport.results) {
          if (!res.passed) {
            allFailures.push({
              tier: tierNum,
              suite: suiteReport.suiteName,
              file: relPath,
              name: res.name,
              error: res.error,
              stack: res.stack
            });
          }
        }
      } catch (err) {
        tierFailed++;
        tierTotal++;
        allFailures.push({
          tier: tierNum,
          suite: 'Module Import / Execution',
          file: relPath,
          name: 'Module Load',
          error: err.message || String(err),
          stack: err.stack
        });
        console.error(`  ✗ FAIL [0/1] ${relPath} (Execution Error: ${err.message})`);
      }
    }

    tierReports.push({
      tier: tierNum,
      total: tierTotal,
      passed: tierPassed,
      failed: tierFailed
    });

    overallTotal += tierTotal;
    overallPassed += tierPassed;
    overallFailed += tierFailed;
  }

  const durationSec = ((performance.now() - startTime) / 1000).toFixed(2);

  console.log('\n================================================================================');
  console.log('                             TEST EXECUTION SUMMARY                             ');
  console.log('================================================================================');
  for (const report of tierReports) {
    const rate = report.total > 0 ? ((report.passed / report.total) * 100).toFixed(1) : '0.0';
    console.log(`Tier ${report.tier} Summary : ${report.passed}/${report.total} passed (${rate}%) [${report.failed} failed]`);
  }
  console.log('--------------------------------------------------------------------------------');
  const passRate = overallTotal > 0 ? ((overallPassed / overallTotal) * 100).toFixed(1) : '0.0';
  console.log(`Total Tests Executed : ${overallTotal}`);
  console.log(`Total Tests Passed   : ${overallPassed}`);
  console.log(`Total Tests Failed   : ${overallFailed}`);
  console.log(`Pass Rate            : ${passRate}%`);
  console.log(`Total Execution Time : ${durationSec}s`);
  console.log('================================================================================\n');

  if (allFailures.length > 0) {
    console.error('FAILURES:');
    for (const f of allFailures) {
      console.error(`\n[Tier ${f.tier}] ${f.suite} -> ${f.name}`);
      console.error(`File  : ${f.file}`);
      console.error(`Error : ${f.error}`);
      if (f.stack) {
        console.error(f.stack.split('\n').slice(0, 4).join('\n'));
      }
    }
  }

  // Save report to tests/e2e/summary.json
  const summaryJson = {
    timestamp: new Date().toISOString(),
    durationSeconds: parseFloat(durationSec),
    overall: {
      total: overallTotal,
      passed: overallPassed,
      failed: overallFailed,
      passRate: parseFloat(passRate)
    },
    tiers: tierReports,
    failures: allFailures
  };

  fs.writeFileSync(
    path.join(E2E_ROOT, 'summary.json'),
    JSON.stringify(summaryJson, null, 2),
    'utf8'
  );

  if (overallFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
