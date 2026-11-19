# Margin — a reading-notes app

A personal reading-notes app that doesn't let highlights rot in a database.

Log the books you read, capture the passages that matter, attach a note to
each one, and get a weekly review queue that resurfaces old highlights so
they stay alive.

## Why

Every notes app can *store* highlights. Almost none make you *revisit* them.
Margin is built around the review loop: capture is the easy half, resurfacing
is the product.

## Core features

- **Book log** — title, author, status (reading / finished / shelved)
- **Highlight capture** — paste text, or OCR a photo of a physical page
- **Notes on highlights** — every highlight carries your own note, tags,
  and full-text search across books, tags, and note bodies
- **Weekly review queue** — a spaced resurfacing screen: old highlights come
  back a few at a time, and you keep, annotate, or drop them
- **Markdown export** — everything exportable, always. Local-first means
  your data is yours

## Principles

- Single-user, local-first. SQLite on disk, no account, no cloud sync v1.
- Boring stack, fast pages. If a screen isn't instant, that's a bug.
- The bar: the owner uses it daily. Not a demo — a tool to live in.

## Stack

- Next.js (App Router) + TypeScript
- SQLite (better-sqlite3), one file, zero config
- Tests: Vitest for units, Playwright for the core flows

## Status

Skeleton. Data model and week-by-week build plan are in
[docs/PLAN.md](docs/PLAN.md). Schema draft is in
[lib/schema.sql](lib/schema.sql).
