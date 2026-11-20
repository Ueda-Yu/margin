// Prepare an isolated, reproducible citation-copy history for a scored run.
// Run directories are create-only. Never overwrite an earlier trial's events.
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { loadCorpus } from './corpus.mjs';
import { historyFile, readHistory } from './history.mjs';

function inside(parent, child) {
  const rel = relative(parent, child);
  return rel === '' || (rel !== '..' && !rel.startsWith('..' + sep) && !isAbsolute(rel));
}

export async function prepareDemoRun(notesDir, manifestPath, runDir) {
  const corpus = await loadCorpus(notesDir);
  const output = resolve(runDir);
  if (inside(corpus.root, output)) throw new Error('Run data directory must be outside the Markdown corpus');
  const raw = await readFile(resolve(manifestPath), 'utf8');
  const entries = JSON.parse(raw);
  if (!Array.isArray(entries) || entries.length > 200) throw new TypeError('Seed manifest must contain at most 200 events');

  const events = entries.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry) ||
        typeof entry.file !== 'string' || typeof entry.location !== 'string' ||
        typeof entry.timestamp !== 'string') {
      throw new TypeError('Seed entry ' + index + ' requires file, location, timestamp');
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(entry.timestamp) ||
        new Date(entry.timestamp).toISOString() !== entry.timestamp) {
      throw new RangeError('Seed entry ' + index + ' needs a valid UTC ISO timestamp');
    }
    const matches = corpus.excerpts.filter((excerpt) =>
      excerpt.file === entry.file && excerpt.location === entry.location);
    if (matches.length !== 1) {
      throw new Error('Seed entry ' + index + ' must identify exactly one supported excerpt: ' +
        entry.file + ' / ' + entry.location + ' (found ' + matches.length + ')');
    }
    return { event: 'citation_copied', excerpt_id: matches[0].id, timestamp: entry.timestamp };
  });

  // The manifest is fully checked before creating any output. No copying of
  // original user data and no modification of previous trial directories.
  await mkdir(dirname(output), { recursive: true });
  await mkdir(output); // EEXIST deliberately blocks accidental reuse.
  const path = historyFile(corpus.root, output);
  try {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, events.map((event) => JSON.stringify(event)).join('\n') +
      (events.length ? '\n' : ''), { flag: 'wx', mode: 0o600 });
    const restored = await readHistory(path);
    if (JSON.stringify(events) !== JSON.stringify(restored)) {
      throw new Error('Seed history mismatch after writing');
    }
    return {
      directory: output,
      events: events.length,
      checksum: createHash('sha256').update(JSON.stringify(events)).digest('hex'),
      historyPath: path,
    };
  } catch (error) {
    await rm(output, { recursive: true, force: true });
    throw error;
  }
}
