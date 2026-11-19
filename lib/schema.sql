-- Margin schema draft (SQLite)

CREATE TABLE books (
  id          INTEGER PRIMARY KEY,
  title       TEXT NOT NULL,
  author      TEXT,
  status      TEXT NOT NULL DEFAULT 'reading'
              CHECK (status IN ('reading', 'finished', 'shelved')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE highlights (
  id            INTEGER PRIMARY KEY,
  book_id       INTEGER NOT NULL REFERENCES books(id),
  body          TEXT NOT NULL,
  page          INTEGER,
  source        TEXT NOT NULL DEFAULT 'paste'
                CHECK (source IN ('paste', 'ocr')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE notes (
  id            INTEGER PRIMARY KEY,
  highlight_id  INTEGER NOT NULL REFERENCES highlights(id),
  body          TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE tags (
  highlight_id  INTEGER NOT NULL REFERENCES highlights(id),
  tag           TEXT NOT NULL,
  PRIMARY KEY (highlight_id, tag)
);

-- Review queue state: how often a highlight has resurfaced, and when last.
CREATE TABLE review_state (
  highlight_id   INTEGER PRIMARY KEY REFERENCES highlights(id),
  times_shown    INTEGER NOT NULL DEFAULT 0,
  last_shown_at  TEXT,
  dropped        INTEGER NOT NULL DEFAULT 0
);

CREATE VIRTUAL TABLE search_index USING fts5(
  body, note_body, tag, book_title
);
