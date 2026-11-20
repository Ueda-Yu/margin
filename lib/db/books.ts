import { getConnection, type SqliteConnection } from './connection';
import { parseBookRow, type Book, type NewBook } from '../contracts/books';

/** Bound parameters and explicit ID sort guarantee deterministic reads. */
export const BOOK_SQL = Object.freeze({
  insert: 'INSERT INTO books (title, author) VALUES (?, ?)',
  byId: 'SELECT id, title, author, status, created_at FROM books WHERE id = ?',
  list: 'SELECT id, title, author, status, created_at FROM books ORDER BY id ASC LIMIT ?',
});

export function findBook(id: number, db: SqliteConnection = getConnection()): Book | undefined {
  if (!Number.isSafeInteger(id) || id < 1) return undefined;
  const row = db.prepare(BOOK_SQL.byId).get(id);
  return row ? parseBookRow(row) : undefined;
}

export function listBooks(db: SqliteConnection = getConnection()): Book[] {
  return db.prepare(BOOK_SQL.list).all(50).map(parseBookRow);
}

export function createBook(input: NewBook, db: SqliteConnection = getConnection()): Book {
  const result = db.prepare(BOOK_SQL.insert).run(input.title, input.author);
  const book = findBook(Number(result.lastInsertRowid), db);
  if (!book) throw new Error('Inserted book is not readable');
  return book; // SQLite INSERT committed before any success response is returned
}
