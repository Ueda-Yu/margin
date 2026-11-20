// Verify the real Next.js -> repository -> SQLite path across server restarts.
import { spawn } from 'node:child_process';
import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import net from 'node:net';

const data = mkdtempSync(join(tmpdir(), 'margin-gate-'));
const title = 'A Field Guide to Vanishing Rivers'; // FICTIONAL TEST DATA ONLY
const port = await new Promise((resolve, reject) => {
  const server = net.createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});
const base = `http://127.0.0.1:${port}`;
let child;
let log = '';
async function start() {
  child = spawn(process.execPath,
    ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)],
    { cwd: process.cwd(), env: { ...process.env, MARGIN_DATA_DIR: data }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', chunk => { log += String(chunk); });
  child.stderr.on('data', chunk => { log += String(chunk); });
  for (let i = 0; i < 80; i++) {
    if (child.exitCode !== null) throw new Error(`Server exited: ${log}`);
    try { if ((await fetch(`${base}/api/books`)).ok) return; } catch { /* retry */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Server failed to start: ${log}`);
}
async function stop() {
  if (!child || child.exitCode !== null) return;
  const target = child;
  await new Promise(resolve => {
    const timeout = setTimeout(() => target.kill('SIGKILL'), 4000);
    target.once('exit', () => { clearTimeout(timeout); resolve(); });
    target.kill('SIGTERM');
  });
  child = undefined;
}
try {
  await start();
  const created = await fetch(`${base}/api/books`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title, author: 'M. Aoyama' }),
  });
  assert.equal(created.status, 201);
  const { book } = await created.json();
  assert.equal(book.title, title);
  console.log(`BEFORE restart: id=${book.id} title=${book.title}`);
  await stop();
  await start(); // Different Next.js OS process, same SQLite file.
  const response = await fetch(`${base}/api/books?id=${book.id}`);
  assert.equal(response.status, 200);
  const persisted = (await response.json()).book;
  assert.equal(persisted.id, book.id);
  assert.equal(persisted.title, title);
  const list = (await (await fetch(`${base}/api/books`)).json()).books;
  assert(list.some(row => row.id === book.id && row.title === title));
  const page = await (await fetch(base)).text();
  assert(page.includes(title) && page.includes(`data-book-id="${book.id}"`));
  console.log(`AFTER restart:  id=${persisted.id} title=${persisted.title}`);
  console.log('PASS: same book ID/title through API and Server Component after restart');
} finally {
  await stop();
  rmSync(data, { recursive: true, force: true });
}
