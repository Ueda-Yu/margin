/** Stable book contract. No Node, HTTP, or SQLite dependencies. */
export type BookStatus = 'reading' | 'finished' | 'shelved';
export interface Book {
  id: number;
  title: string;
  author: string | null;
  status: BookStatus;
  created_at: string;
}
export interface NewBook { title: string; author: string | null }

export function parseNewBook(value: unknown): NewBook {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new RangeError('Expected a book object');
  }
  const { title, author = null } = value as Record<string, unknown>;
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 500) {
    throw new RangeError('title must contain 1–500 characters');
  }
  if (author !== null && (typeof author !== 'string' || author.trim().length > 500)) {
    throw new RangeError('author must contain at most 500 characters');
  }
  return { title: title.trim(), author: author?.trim() || null };
}

/** Verify SQLite's actual row shape rather than trusting a generic cast. */
export function parseBookRow(value: unknown): Book {
  if (!value || typeof value !== 'object') throw new Error('Invalid SQLite book row');
  const row = value as Record<string, unknown>;
  if (!Number.isSafeInteger(row.id) || (row.id as number) < 1 ||
      typeof row.title !== 'string' || !row.title ||
      (row.author !== null && typeof row.author !== 'string') ||
      !['reading', 'finished', 'shelved'].includes(String(row.status)) ||
      typeof row.created_at !== 'string') {
    throw new Error('SQLite book row does not match the book contract');
  }
  return row as unknown as Book;
}
