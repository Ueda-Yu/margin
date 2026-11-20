import { afterAll, expect, test } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseNewBook } from '../lib/contracts/books';
import { getConnection } from '../lib/db/connection';
import { createBook, findBook, listBooks } from '../lib/db/books';

const directory = mkdtempSync(join(tmpdir(), 'margin-books-'));
process.env.MARGIN_DATA_DIR = directory;
afterAll(() => { getConnection().close(); rmSync(directory, { recursive: true, force: true }); });

test('typed book mapping preserves two independent IDs with identical titles', () => {
  const a = createBook(parseNewBook({ title: 'Same Title', author: 'A' }));
  const b = createBook(parseNewBook({ title: 'Same Title', author: 'B' }));
  expect(a.id).not.toBe(b.id);
  expect(listBooks().map(book => book.id)).toEqual([a.id, b.id]);
  expect(findBook(a.id)).toEqual(a);
  expect(findBook(b.id)).toEqual(b);
});

test('input contract rejects invalid values before SQL is called', () => {
  expect(() => parseNewBook({ title: '   ' })).toThrow(RangeError);
  expect(() => parseNewBook({ title: 42 })).toThrow(RangeError);
  expect(() => parseNewBook({ title: 'ok', author: {} })).toThrow(RangeError);
  expect(listBooks()).toHaveLength(2);
});
