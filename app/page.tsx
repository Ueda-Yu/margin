import { revalidatePath } from 'next/cache';
import { parseNewBook } from '../lib/contracts/books';
import { createBook, listBooks } from '../lib/db/books';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function addBook(form: FormData) {
  'use server';
  const input = parseNewBook({ title: form.get('title'), author: form.get('author') });
  createBook(input);
  revalidatePath('/'); // Only after SQLite commits.
}

export default function Home() {
  const books = listBooks(); // Server Component -> typed repository -> SQLite.
  return (
    <main style={{ maxWidth: 680, margin: '48px auto', fontFamily: 'system-ui' }}>
      <h1>Margin</h1>
      <p>Local reading notes. First gate: persistent book IDs.</p>
      <form action={addBook} style={{ display: 'grid', gap: 8 }}>
        <label>Title <input name="title" required maxLength={500} /></label>
        <label>Author <input name="author" maxLength={500} /></label>
        <button type="submit">Add book</button>
      </form>
      <h2>Books</h2>
      <ol>{books.map(book => (
        <li data-book-id={book.id} key={book.id}>#{book.id} — {book.title}</li>
      ))}</ol>
    </main>
  );
}
