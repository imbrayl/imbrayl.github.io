// Turns Playwright's JSON report into the small summary the hero's CI badge reads
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const { stats } = JSON.parse(readFileSync('test-output/results.json', 'utf8'));
const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID, GITHUB_SHA } = process.env;

const summary = {
  status: stats.unexpected === 0 ? 'passed' : 'failed',
  passed: stats.expected,
  failed: stats.unexpected,
  flaky: stats.flaky,
  skipped: stats.skipped,
  durationMs: Math.round(stats.duration),
  finishedAt: new Date(Date.parse(stats.startTime) + stats.duration).toISOString(),
  commit: GITHUB_SHA?.slice(0, 7) ?? null,
  runUrl: GITHUB_RUN_ID ? `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}` : null,
};

mkdirSync('site/ci', { recursive: true });
writeFileSync('site/ci/summary.json', JSON.stringify(summary, null, 2) + '\n');
console.log(summary);
