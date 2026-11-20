import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, join } from 'node:path';
import { createRequire } from 'node:module';

// Database adapter: no HTTP concerns. All SQL belongs to repository modules.
export type SqlValue = string | number | bigint | null;
export interface SqlStatement<Row> {
  run(...params: SqlValue[]): { changes: number; lastInsertRowid: number | bigint };
  get(...params: SqlValue[]): Row | undefined;
  all(...params: SqlValue[]): Row[];
}
export interface SqliteConnection {
  prepare<Row = unknown>(sql: string): SqlStatement<Row>;
  exec(sql: string): void;
  pragma(sql: string, options?: { simple: boolean }): unknown;
  close(): void;
}
const Sqlite = createRequire(join(process.cwd(), 'package.json'))('better-sqlite3') as new (file: string) => SqliteConnection;
let connection: SqliteConnection | undefined;

export function getConnection(): SqliteConnection {
  if (connection) return connection;
  const directory = process.env.MARGIN_DATA_DIR || join(homedir(), '.margin');
  if (!isAbsolute(directory)) throw new Error('MARGIN_DATA_DIR must be an absolute path');
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const file = join(directory, 'margin.sqlite');
  const existing = existsSync(file);
  const db = new Sqlite(file);
  try {
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');
    if (existing) {
      if (db.pragma('quick_check', { simple: true }) !== 'ok') {
        throw new Error('Existing database failed integrity check; refusing writes');
      }
      if (!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='books'").get()) {
        throw new Error('Existing database lacks the required books table; refusing writes');
      }
    } else {
      // First-run schema only. No destructive auto-migration or silent resets.
      db.exec(readFileSync(join(process.cwd(), 'lib/schema.sql'), 'utf8'));
    }
    connection = db;
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}
