// Restart test for Margin's Week 1 storage scope.
// Run as two separate processes — that separation IS the restart:
//
//   node scripts/restart-test.mjs seed
//   node scripts/restart-test.mjs verify <highlightId>
//
// seed:   create the DB from lib/schema.sql, store one fictional book and
//         one fictional passage, print their ids, close the DB, exit.
// verify: open the DB cold, read the passage back by id, and check that the
//         body and its book still match what seed stored.

import Database from 'better-sqlite3';
import { readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DB_PATH = join(root, 'data-restart-test.db');
const SCHEMA = readFileSync(join(root, 'lib', 'schema.sql'), 'utf8');

const FICTIONAL_BOOK = { title: 'A Field Guide to Vanishing Rivers', author: 'M. Aoyama' };
const FICTIONAL_PASSAGE = '川は、地図の上では青い線にすぎない。けれど歩いてみると、水は昨日の雨の色をしていた。';

const [command, arg] = process.argv.slice(2);

if (command === 'seed') {
  rmSync(DB_PATH, { force: true });
  const db = new Database(DB_PATH);
  db.exec(SCHEMA);
  const bookId = db
    .prepare('INSERT INTO books (title, author) VALUES (?, ?)')
    .run(FICTIONAL_BOOK.title, FICTIONAL_BOOK.author).lastInsertRowid;
  const highlightId = db
    .prepare('INSERT INTO highlights (book_id, body, page) VALUES (?, ?, ?)')
    .run(bookId, FICTIONAL_PASSAGE, 42).lastInsertRowid;
  console.log(`seeded: book_id=${bookId} highlight_id=${highlightId}`);
  db.close();
  console.log('db closed. process exiting.');
} else if (command === 'verify') {
  const id = Number(arg);
  const db = new Database(DB_PATH, { readonly: true });
  const row = db
    .prepare(
      `SELECT h.id, h.body, h.page, b.title AS book_title
       FROM highlights h JOIN books b ON b.id = h.book_id
       WHERE h.id = ?`
    )
    .get(id);
  db.close();
  if (!row) {
    console.log(`FAIL: no highlight with id=${id} after restart`);
    process.exit(1);
  }
  const match = row.body === FICTIONAL_PASSAGE && row.book_title === FICTIONAL_BOOK.title;
  console.log(`read back after restart: highlight_id=${row.id} page=${row.page} book="${row.book_title}"`);
  console.log(`body: ${row.body}`);
  console.log(match ? 'PASS: same id, same body, same book' : 'FAIL: content mismatch');
  process.exit(match ? 0 : 1);
} else {
  console.log('usage: node scripts/restart-test.mjs seed | verify <highlightId>');
  process.exit(2);
}
