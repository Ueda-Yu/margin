import { NextResponse } from 'next/server';
import { parseNewBook } from '../../../lib/contracts/books';
import { createBook, findBook, listBooks } from '../../../lib/db/books';

export const runtime = 'nodejs'; // Native SQLite cannot run on the Edge runtime.
export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  const rawId = new URL(request.url).searchParams.get('id');
  if (rawId === null) return NextResponse.json({ books: listBooks() });
  if (!/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(Number(rawId))) {
    return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
  }
  const book = findBook(Number(rawId));
  return book ? NextResponse.json({ book }) :
    NextResponse.json({ error: 'Book not found' }, { status: 404 });
}

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ error: 'Expected JSON' }, { status: 415 });
  }
  // Browser-origin writes must be same-origin, even on a loopback-only service.
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Cross-origin write blocked' }, { status: 403 });
  }
  try {
    const input = parseNewBook(await request.json());
    return NextResponse.json({ book: createBook(input) }, { status: 201 });
  } catch (error) {
    if (error instanceof RangeError || error instanceof SyntaxError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error; // DB failure is not a successful save.
  }
}
