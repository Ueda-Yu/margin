#!/usr/bin/env node
import { prepareDemoRun } from '../demo/seed-run.mjs';

const args = process.argv.slice(2);
if (args.length !== 3) {
  console.error('Usage: node scripts/prepare-demo-run.mjs <notes-dir> <seed.json> <fresh-run-data-dir>');
  process.exit(2);
}
try {
  const result = await prepareDemoRun(args[0], args[1], args[2]);
  console.log('Prepared a new, isolated demo run.');
  console.log('History seed event count: ' + result.events);
  console.log('Seed event checksum (SHA-256): ' + result.checksum);
  console.log('Set MARGIN_DEMO_DATA_DIR to this absolute directory: ' + result.directory);
  console.log('Then run: npm run demo -- ' + args[0]);
  console.log('Do not reuse this run directory for another scored task or arm.');
} catch (error) {
  console.error('Failed to prepare demo run: ' + error.message);
  process.exitCode = 1;
}
