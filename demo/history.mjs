import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { mkdir, appendFile, readFile, stat } from 'node:fs/promises';

export function historyFile(notesDirectory, dataDirectory = process.env.MARGIN_DEMO_DATA_DIR) {
  const stableCorpusKey = createHash('sha256').update(resolve(notesDirectory)).digest('hex').slice(0, 16);
  const root = dataDirectory ? resolve(dataDirectory) : join(homedir(), '.margin', 'reuse-demo');
  return join(root, stableCorpusKey, 'citation-events.jsonl');
}

export async function readHistory(path) {
  let contents;
  try {
    const info = await stat(path);
    if (info.size > 2 * 1024 * 1024) throw new Error('History exceeds 2 MiB: archive it before continuing');
    contents = await readFile(path, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
  return contents.split('\n').filter(Boolean).flatMap((line) => {
    try {
      const record = JSON.parse(line);
      if (record.event === 'citation_copied' && /^[a-f0-9]{20}$/.test(record.excerpt_id) &&
          typeof record.timestamp === 'string' && !Number.isNaN(Date.parse(record.timestamp))) return [record];
    } catch { /* Skip a damaged tail event without fabricating an action. */ }
    return [];
  });
}

export async function recordCitationCopy(path, excerptId) {
  if (!/^[a-f0-9]{20}$/.test(excerptId)) throw new TypeError('Invalid excerpt ID');
  const event = { event: 'citation_copied', excerpt_id: excerptId, timestamp: new Date().toISOString() };
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  await appendFile(path, JSON.stringify(event) + '\n', { encoding: 'utf8', mode: 0o600 });
  return event;
}
