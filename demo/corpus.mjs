// Small, standalone Markdown corpus adapter for the citation-reuse experiment.
// Intentionally not a migration or a replacement for Margin's canonical SQLite data.
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { resolve, join, relative, sep } from 'node:path';

const MAX_FILES = 300;
const MAX_BYTES_PER_FILE = 512 * 1024;
const MAX_DEPTH = 5;

function shortHash(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 20);
}

function lexical(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function clean(value) {
  return value.normalize('NFKC').toLowerCase();
}

export function parseNoteFile(markdown, filename) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const diagnostics = [];
  const excerpts = [];
  let book = '';
  let active = null;
  let count = 0;

  function finish() {
    if (!active) return;
    const text = active.quote.join('\n').trim();
    if (!text || !book || !active.source || !active.location) {
      const missing = [!book && 'book heading', !text && 'quoted text', !active.source && 'Source', !active.location && 'Location'].filter(Boolean).join(', ');
      diagnostics.push({ file: filename, reason: 'Excerpt at line ' + active.line + ': missing ' + missing });
    } else {
      const id = shortHash(JSON.stringify([filename, active.ordinal, book, active.source, active.location, text]));
      excerpts.push({ id, book, text, source: active.source, location: active.location, file: filename });
    }
    active = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h1 = /^#\s+(.+?)\s*$/.exec(line);
    if (h1) {
      finish();
      if (!book) book = h1[1].trim();
      continue;
    }
    // Every level-two heading closes the previous excerpt, including unsupported
    // sections such as "## Commentary". Only supported headings open a new one.
    // Otherwise commentary Source: lines and quotes could silently alter citations.
    const heading = /^ {0,3}##[ \t]+(.+?)\s*$/.exec(line);
    if (heading) {
      finish();
      if (/^(?:Excerpt|Passage)(?:\s*[:\-–]\s*.*)?$/i.test(heading[1])) {
        count++;
        active = { line: i + 1, ordinal: count, source: '', location: '', quote: [] };
      }
      continue;
    }
    if (!active) continue;
    const source = /^\s*Source:\s*(.*?)\s*$/i.exec(line);
    const location = /^\s*(?:Location|Page):\s*(.*?)\s*$/i.exec(line);
    const quoted = /^>\s?(.*)$/.exec(line);
    if (source) active.source = source[1];
    if (location) active.location = location[1];
    if (quoted) active.quote.push(quoted[1]);
  }
  finish();
  if (count === 0) diagnostics.push({ file: filename, reason: 'Unsupported format: no ## Excerpt or ## Passage sections' });
  if (count > 0 && !book) diagnostics.push({ file: filename, reason: 'Missing # Book heading' });
  return { excerpts, diagnostics };
}

export async function loadCorpus(directory) {
  const root = resolve(directory);
  const rootStat = await lstat(root);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw new Error('Notes path must be a directory, not a symlink');
  const diagnostics = [];
  const excerpts = [];
  let visited = 0;

  async function walk(folder, depth) {
    if (depth > MAX_DEPTH) {
      diagnostics.push({ file: relative(root, folder), reason: 'Directory depth limit exceeded' });
      return;
    }
    const entries = (await readdir(folder, { withFileTypes: true })).sort((a, b) => lexical(a.name, b.name));
    for (const entry of entries) {
      const path = join(folder, entry.name);
      const filename = relative(root, path).split(sep).join('/');
      if (entry.isSymbolicLink()) {
        diagnostics.push({ file: filename, reason: 'Symbolic link not followed' });
        continue;
      }
      if (entry.isDirectory()) { await walk(path, depth + 1); continue; }
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.md')) continue;
      if (++visited > MAX_FILES) throw new Error('Refusing to scan more than ' + MAX_FILES + ' Markdown files');
      const info = await lstat(path);
      if (info.size > MAX_BYTES_PER_FILE) {
        diagnostics.push({ file: filename, reason: 'File larger than 512 KiB; not imported' });
        continue;
      }
      const result = parseNoteFile(await readFile(path, 'utf8'), filename);
      excerpts.push(...result.excerpts);
      diagnostics.push(...result.diagnostics);
    }
  }
  await walk(root, 0);
  excerpts.sort((a, b) => lexical(a.file, b.file) || lexical(a.id, b.id));
  return { root, excerpts, diagnostics, filesScanned: visited };
}

export function searchExcerpts(excerpts, query) {
  const terms = clean(String(query).trim()).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return excerpts;
  return excerpts.filter((excerpt) => {
    const haystack = clean([excerpt.book, excerpt.text, excerpt.source, excerpt.location].join('\n'));
    return terms.every((term) => haystack.includes(term));
  });
}

export function formatCitation(excerpt) {
  return excerpt.text + '\n— ' + excerpt.book + ' | ' + excerpt.source + ' | ' + excerpt.location;
}

export function suggestCopied(matches, events, limit = 3) {
  const byId = new Map();
  for (const event of events) {
    if (event?.event !== 'citation_copied' || typeof event.excerpt_id !== 'string' || typeof event.timestamp !== 'string') continue;
    const previous = byId.get(event.excerpt_id) ?? { count: 0, latest: '' };
    previous.count++;
    if (event.timestamp > previous.latest) previous.latest = event.timestamp;
    byId.set(event.excerpt_id, previous);
  }
  return matches.filter((item) => byId.has(item.id))
    .sort((a, b) => lexical(byId.get(b.id).latest, byId.get(a.id).latest) ||
      byId.get(b.id).count - byId.get(a.id).count || lexical(a.id, b.id))
    .slice(0, Math.min(3, Math.max(0, limit)));
}
