#!/usr/bin/env node
import { startDemo } from '../demo/server.mjs';

function usage() {
  console.error('Usage: npm run demo -- <notes-dir> [--port 0..65535]');
  console.error('Or: node scripts/demo.mjs <notes-dir> [--port 0..65535]');
}
const args = process.argv.slice(2);
if (!args.length || args[0].startsWith('-')) { usage(); process.exit(2); }
let port = 0;
if (args.length > 1) {
  if (args.length !== 3 || args[1] !== '--port' || !/^\d+$/.test(args[2])) {
    usage();
    process.exit(2);
  }
  port = Number(args[2]);
}
try {
  const demo = await startDemo({ notesDir: args[0], port });
  console.log('Margin citation-reuse demo:', demo.url);
  console.log('Loaded ' + demo.excerpts + ' excerpts from ' + demo.filesScanned + ' Markdown files.');
  console.log('Unsupported entries: ' + demo.unsupported + ' (see page diagnostics).');
  console.log('Local citation-copy events: ' + demo.eventPath);
  console.log('Only 127.0.0.1 is bound. Press Ctrl+C to stop.');
} catch (error) {
  console.error('Unable to start demo:', error.message);
  process.exitCode = 1;
}
