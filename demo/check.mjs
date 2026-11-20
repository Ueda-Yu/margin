import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCorpus, parseNoteFile, searchExcerpts, suggestCopied, formatCitation } from './corpus.mjs';
import { historyFile, readHistory, recordCitationCopy } from './history.mjs';
import { startDemo } from './server.mjs';
import { prepareDemoRun } from './seed-run.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const corpusA = join(here, 'fixtures', 'corpus-a');
const corpusB = join(here, 'fixtures', 'corpus-b');

test('two independent Markdown corpora load without corpus-specific code', async () => {
  const a = await loadCorpus(corpusA);
  const b = await loadCorpus(corpusB);
  assert.equal(a.excerpts.length, 5);
  assert.equal(b.excerpts.length, 2);
  assert.equal(b.diagnostics.length, 1);
  assert.match(b.diagnostics[0].reason, /missing Location/);
  assert(a.excerpts.every((x) => !x.file.startsWith('/') && !x.file.includes(':')));
  assert(b.excerpts.some((x) => x.location === 'chapter 1, line 24'));
  assert.deepEqual((await loadCorpus(corpusA)).excerpts, a.excerpts);
});

test('strict parsing makes incomplete sources explicit, not invented', () => {
  const item = parseNoteFile('# A\n## Excerpt\n> phrase without a source', 'demo.md');
  assert.equal(item.excerpts.length, 0);
  assert.match(item.diagnostics[0].reason, /Source/);
  assert.match(item.diagnostics[0].reason, /Location/);
  const valid = parseNoteFile('# A\n## Excerpt\nSource: First\nLocation: p. 1\n> preserved\n> line', 'demo.md');
  assert.equal(valid.excerpts.length, 1);
  assert.equal(valid.excerpts[0].text, 'preserved\nline');
});

test('substring search handles Japanese, source and title without using copy history', async () => {
  const a = (await loadCorpus(corpusA)).excerpts;
  assert.equal(searchExcerpts(a, '地図').length, 2);
  assert.equal(searchExcerpts(a, 'WAVES p. 48').length, 1);
  assert.equal(searchExcerpts(a, 'nonexistent').length, 0);
  assert.match(formatCitation(a[0]), / \| /);
  assert.deepEqual(searchExcerpts(a, '地図'), searchExcerpts(a, '地図'));
});

test('history only suggests matching previously copied excerpts, at most three', async () => {
  const a = (await loadCorpus(corpusA)).excerpts;
  const events = a.slice(0, 4).map((item, i) => ({
    event: 'citation_copied',
    excerpt_id: item.id,
    timestamp: new Date(Date.UTC(2026, 0, i + 1)).toISOString(),
  }));
  const original = searchExcerpts(a, '');
  const recommended = suggestCopied(original, events, 10);
  assert.equal(recommended.length, 3);
  assert.equal(recommended[0].id, a[3].id);
  assert.equal(suggestCopied(searchExcerpts(a, '地図'), events).length <= 2, true);
  assert.deepEqual(searchExcerpts(a, ''), original);
  assert.equal(suggestCopied(original, [], 3).length, 0);
});

test('copy events persist only event, excerpt ID, and timestamp', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'margin-copylog-'));
  try {
    const id = 'a'.repeat(20);
    const path = historyFile(corpusA, temp);
    await recordCitationCopy(path, id);
    const lines = (await readFile(path, 'utf8')).trim().split('\n');
    const row = JSON.parse(lines[0]);
    assert.deepEqual(Object.keys(row), ['event', 'excerpt_id', 'timestamp']);
    assert.equal(row.excerpt_id, id);
    assert.deepEqual(await readHistory(path), [row]);
    assert(!lines[0].includes('Lantern'));
    await assert.rejects(recordCitationCopy(path, '../../../nope'));
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('one-screen HTTP demo: search, valid copy event, restart, history toggle, cross-origin guard', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'margin-demo-http-'));
  let demo;
  try {
    demo = await startDemo({ notesDir: corpusA, dataDirectory: temp });
    const home = await fetch(demo.url);
    assert.equal(home.status, 200);
    assert.match(await home.text(), /Previously copied matches/);

    const before = await (await fetch(demo.url + '/api/excerpts?q=%E5%9C%B0%E5%9B%B3&history=1')).json();
    assert.equal(before.results.length, 2);
    assert.equal(before.suggestions.length, 0);
    const chosen = before.results[0];

    const invalidOrigin = await fetch(demo.url + '/api/copy', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://example.org' },
      body: JSON.stringify({ excerpt_id: chosen.id }),
    });
    assert.equal(invalidOrigin.status, 403);
    const unknown = await fetch(demo.url + '/api/copy', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ excerpt_id: 'a'.repeat(20) }),
    });
    assert.equal(unknown.status, 400);

    const copied = await fetch(demo.url + '/api/copy', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ excerpt_id: chosen.id }),
    });
    assert.equal(copied.status, 201);
    const copiedResult = await copied.json();
    assert.equal(copiedResult.event, 'citation_copied');

    const off = await (await fetch(demo.url + '/api/excerpts?q=%E5%9C%B0%E5%9B%B3&history=0')).json();
    const on = await (await fetch(demo.url + '/api/excerpts?q=%E5%9C%B0%E5%9B%B3&history=1')).json();
    assert.deepEqual(off.results, on.results);
    assert.equal(off.suggestions.length, 0);
    assert.equal(on.suggestions.length, 1);
    assert.equal(on.suggestions[0].id, chosen.id);
    const newQuery = await (await fetch(demo.url + '/api/excerpts?q=%E6%99%82%E8%A8%88&history=1')).json();
    assert.equal(newQuery.suggestions.length, 0);

    await demo.stop();
    demo = await startDemo({ notesDir: corpusA, dataDirectory: temp });
    const afterRestart = await (await fetch(demo.url + '/api/excerpts?q=%E5%9C%B0%E5%9B%B3&history=1')).json();
    assert.equal(afterRestart.suggestions[0].id, chosen.id);
  } finally {
    if (demo?.server.listening) await demo.stop();
    await rm(temp, { recursive: true, force: true });
  }
});


test('unsupported level-two commentary never changes original citation or excerpt text', () => {
  const original = [
    '# A Fictional Book',
    '## Excerpt: Original',
    'Source: Verified edition',
    'Location: page 7',
    '> Original quoted line',
  ].join('\n');
  const baseline = parseNoteFile(original, 'same.md');
  const attacked = parseNoteFile([
    original,
    '## Commentary',
    'Source: Misleading replacement',
    'Location: page 999',
    '> This is commentary, not a quote.',
    '## Passage: Next real excerpt',
    'Source: Second edition',
    'Location: page 8',
    '> Next valid quote.',
  ].join('\n'), 'same.md');
  assert.deepEqual(attacked.excerpts[0], baseline.excerpts[0],
    'the ID, body, source, and location of the first citation must not change');
  assert.equal(attacked.excerpts.length, 2);
  assert.equal(attacked.excerpts[0].source, 'Verified edition');
  assert.equal(attacked.excerpts[0].text, 'Original quoted line');
  assert.equal(attacked.excerpts[1].text, 'Next valid quote.');

  const incomplete = parseNoteFile([
    '# A Fictional Book',
    '## Excerpt',
    '> Missing its own citation',
    '## Commentary',
    'Source: Misleading replacement',
    'Location: page 999',
    '> Not a valid excerpt.',
  ].join('\n'), 'same.md');
  assert.equal(incomplete.excerpts.length, 0);
  assert.match(incomplete.diagnostics[0].reason, /missing Source, Location/);
});

test('A03 uniquely identifies the star-mark passage rather than any 地図 match', async () => {
  const corpus = (await loadCorpus(corpusA)).excerpts;
  assert.equal(searchExcerpts(corpus, '地図').length, 2,
    'the previous task prompt was ambiguous');
  const candidate = searchExcerpts(corpus, '星印');
  assert.equal(candidate.length, 1);
  assert.equal(candidate[0].book, 'The Waves Remember');
  assert.equal(candidate[0].source, 'Pocket edition, 2025');
  assert.equal(candidate[0].location, 'section 5, p. 48');
  const tasks = await readFile(join(here, 'fixtures', 'tasks.csv'), 'utf8');
  assert.match(tasks, /corpus-a,A03,Find the passage describing a small star mark in the map's margin,The Waves Remember/);
});

test('fixed seeds create isolated and non-overwritable histories for each scored run', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'margin-scoring-seeds-'));
  const seedA = join(here, 'fixtures', 'seed-a.json');
  const seedB = join(here, 'fixtures', 'seed-b.json');
  try {
    const bArm = await prepareDemoRun(corpusA, seedA, join(temp, 'A03-B'));
    const cArm = await prepareDemoRun(corpusA, seedA, join(temp, 'A03-C'));
    assert.equal(bArm.events, 1);
    assert.equal(bArm.checksum, cArm.checksum);
    assert.deepEqual(await readHistory(bArm.historyPath), await readHistory(cArm.historyPath));
    const prior = await readHistory(bArm.historyPath);
    const matched = (await loadCorpus(corpusA)).excerpts.find(
      (entry) => entry.file === 'waves.md' && entry.location === 'section 5, p. 48');
    assert.equal(prior[0].excerpt_id, matched.id);

    const newEntry = (await loadCorpus(corpusA)).excerpts.find((entry) =>
      entry.location === 'chapter 4, p. 31');
    await recordCitationCopy(bArm.historyPath, newEntry.id);
    assert.equal((await readHistory(bArm.historyPath)).length, 2);
    assert.deepEqual(await readHistory(cArm.historyPath), prior,
      'a B-arm copy must not leak into a fresh C-arm baseline');
    const seededDemo = await startDemo({ notesDir: corpusA, dataDirectory: cArm.directory });
    try {
      const base = seededDemo.url + '/api/excerpts?q=' + encodeURIComponent('星印');
      const bMode = await (await fetch(base + '&history=0')).json();
      const cMode = await (await fetch(base + '&history=1')).json();
      assert.deepEqual(bMode.results, cMode.results);
      assert.equal(bMode.suggestions.length, 0);
      assert.equal(cMode.suggestions.length, 1);
      assert.equal(cMode.suggestions[0].id, matched.id);
    } finally {
      await seededDemo.stop();
    }
    await assert.rejects(prepareDemoRun(corpusA, seedA, join(temp, 'A03-B')), /EEXIST/);
    assert.equal((await readHistory(bArm.historyPath)).length, 2,
      'a failed re-preparation must not erase previous trial data');
    await assert.rejects(prepareDemoRun(corpusB, seedA, join(temp, 'wrong-seed')), /exactly one/);

    const otherCorpus = await prepareDemoRun(corpusB, seedB, join(temp, 'B02-C'));
    assert.equal(otherCorpus.events, 1);
    assert.equal((await readHistory(otherCorpus.historyPath))[0].excerpt_id,
      (await loadCorpus(corpusB)).excerpts.find((entry) => entry.location === 'chapter 3, line 9').id);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});


test('bare level-two headings are section boundaries and preserve the prior citation ID', () => {
  const original = [
    '# A Fictional Book',
    '## Excerpt: Original',
    'Source: Verified edition',
    'Location: page 7',
    '> Original quoted line',
  ].join('\n');
  const baseline = parseNoteFile(original, 'same.md');
  assert.equal(baseline.excerpts.length, 1);
  for (const boundary of ['##', '##   ', '  ##\t']) {
    const parsed = parseNoteFile([
      original,
      boundary,
      'Source: Tampered citation',
      'Location: page 999',
      '> This is unrelated commentary, not a quotation.',
      '## Passage: Next',
      'Source: Second edition',
      'Location: page 8',
      '> The next actual quotation.',
    ].join('\n'), 'same.md');
    assert.equal(parsed.excerpts.length, 2, 'expected exactly two excerpts for ' + JSON.stringify(boundary));
    assert.deepEqual(parsed.excerpts[0], baseline.excerpts[0],
      'bare h2 must preserve first excerpt ID, source, location and text');
    assert.equal(parsed.excerpts[1].text, 'The next actual quotation.');
    assert(!parsed.excerpts.some((item) => item.text.includes('unrelated commentary')));
  }

  const incomplete = parseNoteFile([
    '# A Fictional Book',
    '## Excerpt',
    '> Text without its own source or location',
    '##',
    'Source: Fake later source',
    'Location: page 999',
    '> Must not be treated as part of the excerpt',
  ].join('\n'), 'same.md');
  assert.equal(incomplete.excerpts.length, 0);
  assert.match(incomplete.diagnostics[0].reason, /missing Source, Location/);
});
