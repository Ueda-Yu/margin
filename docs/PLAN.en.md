# Margin — 4-Week Build Plan

## Purpose and boundaries

Let the owner save a passage they read in a few seconds, find it again weeks
later together with its source, and take it out in a form readable without
Margin. Priority order: **never lose a record → never block capture → make
it findable → encourage re-reading**. Daily usage is not an acceptance
condition.

Version 1 is a single-user local web app on the owner's own PC (Next.js,
SQLite, localhost only). Persistent data lives in a user directory separate
from the build/deploy location. Cloud sync, collaboration, public URLs, and
notifications are out of scope. At the start of Week 1, check whether the
owner can actually paste a passage into the PC in their usual reading spot.
If their main device is a phone and transcription to PC is required, that is
not something input-screen polish can fix: keep the data format and decide
device support separately.

## Demand hypotheses — and what happens if they're wrong

- **Capture happens in a hurry, mid-reading.** Preselect the most recent
  book; the only required fields are book title and passage text. Paper books
  must still work by manual entry, but OCR demand is judged from the actual
  capture burden, not assumed.
- **Search-on-need may matter more than the periodic review.** The review
  can be hidden. Pausing it must not pile up overdue items or deadlines;
  search, quoting, and export keep working independently.
- **Old notes may outnumber new captures.** Before importing, show how many
  records were recognized and which parts could not be interpreted; never
  modify the source file.
- **The owner may stop using it.** Markdown must stay readable in a normal
  editor, and leaving or resuming must require no account and no external
  service.

## Data and failure promises

The source of truth is SQLite: books, highlights, notes, tags, review state.
Books and highlights get immutable IDs, so renames and same-title books
can't break links. Location (page etc.) is optional. Creation/update times,
reading status, and trash state are kept. The search index is derived data
and can always be rebuilt from the source of truth. Saves and their related
updates are transactional. Never display "saved" before the commit lands.

- **Mistakes:** Delete means move to trash. Restoring a book restores access
  to everything under it, in its original state. Removing an item from the
  review queue touches neither its text nor the trash.
- **Backups:** Use SQLite's online backup for consistent snapshots. Taken
  before the first write of a day of use, before migrations and bulk
  imports, and on manual runs. Only after a new copy passes an integrity
  check is the set rotated to the latest 7 generations. On failure, keep the
  existing copies and do not start the bulk change or migration.
- **Recovery:** If startup checks find corruption, stop writes and never
  replace the database with an empty one. Set the closed database and its
  sidecar files aside, restore the chosen backup to a separate path, verify
  it, then switch. Changes after the restore point may be lost, so show its
  timestamp before switching.
- **Device loss and migration:** Generations on the same disk don't survive
  losing the device. Provide a procedure for the owner to copy a verified
  backup to an external drive and check the last-copy date. The SQLite
  backup is for full recovery; versioned Markdown is for long-term
  readability and logical migration. Markdown also carries IDs, links, and
  state, so everything except the index round-trips.

## Week 1 — Storage, evacuation, and recovery first

Implement book registration, list, reading-status changes, editing, trash,
and restore. In the same week, fix the migration approach, the backup
procedure, and the format and samples for full Markdown export. Record the
owner's PC, browser, and run mode as the measurement environment for
everything after.

**Acceptance criteria**
- Register two books with the same title; rename, delete, and restore one —
  the other's ID and state do not change, including after a restart.
- Export samples whose text contains Japanese, line breaks, Markdown
  headings, and code fences; in a normal editor, title, text, and source are
  readable.
- Restore a backup into an empty working directory; IDs, values, and links
  match the moment the backup was taken. Simulate a failed migration and
  re-read the old records. A corrupt sample must never trigger automatic
  replacement with a new database.

## Week 2 — Capture and search, tested in real reading

Implement paste capture, optional location/note/tags, search across book,
text, and notes, and copy-with-source. Store passage text verbatim. Use an
FTS5 index that can find terms inside unspaced Japanese text; for short
terms the index handles badly, fall back to per-page substring search. OCR
is off by default, and no capture path may depend on it.

**Acceptance criteria**
- The owner saves 3 real passages to an existing book. Median time from
  opening the capture screen to save confirmation is 15 seconds or less
  (text selection/transcription time recorded separately). After a restart,
  text and source match.
- A fixed sample set — a few words from inside a Japanese sentence, a single
  character, a book title, a word that appears only in a note — returns the
  expected IDs. Deleting and rebuilding the index returns the same results.
- On a write failure, show "not saved", keep the input intact and copyable.
  After retry, exactly one copy of the highlight exists.

## Week 3 — Optional review and browser verification

At most 5 items per session. Prioritize items not shown for the longest
time; break ties by fewest times shown, then by ID. Actions: keep, annotate,
never review again. Save only completed actions; ending mid-session or being
away for months must not accumulate homework.

**Acceptance criteria**
- With a fixed clock in tests: an empty library yields 0 items; after six
  months away, still at most 5. With enough candidates, no ID repeats within
  one session. Items marked "never review again" are never resurfaced but
  remain in search and export.
- Playwright runs: add book → paste → search → annotate → restart → view.
  The same records stay searchable and editable with the review hidden.
- The owner tries it once and records one line each on the value and the
  burden of resurfacing. If the value is thin, don't invest in tuning the
  intervals — make search the primary path.

## Week 4 — Migration, load testing, handover

For Margin-format imports: identical ID and content is skipped; identical ID
with different content is reported as a conflict and never silently
overwritten. For general Markdown, show examples of the heading/quote
structure that maps; anything else is previewed as an unclassified note with
its original text preserved. Bulk application happens only after the owner
confirms.

**Acceptance criteria**
- Take the Week 1 samples, add highlights, tags, annotations, hidden and
  trashed states; export → import into an empty database → compare the full
  source of truth for a match. Re-importing the same file adds 0 records;
  general Markdown re-imports are also detected. Killing a bulk operation
  mid-way leaves either everything applied or nothing applied.
- On the Week 1 environment's production build, with 10,000 records
  (Japanese-dominant, average passage 300 characters): after warm-up,
  measure save confirmation, first-50 book list rendering, and first-50
  results of a fixed search set, 30 runs each; p95 from action to display is
  500 ms or less for each. Export and index-rebuild times are recorded
  separately.
- At 100,000 records the same speed is not promised. Never render a full
  list at once or compute full counts instantly; page in chunks of 50. Slow
  searches are cancellable; during an index rebuild, show that search is
  limited while per-book browsing and capture keep working. Export streams
  in chunks to a temporary file and is published only on completion. Verify
  at 100k: a record on a deep page opens, a save succeeds after cancelling a
  search, and an interrupted export does not corrupt the previous completed
  file.
- CI is green: lint, types, unit tests, migration tests, round-trip tests,
  Playwright. Using only the written procedure, the owner completes a
  restore into a different directory and a copy-with-source.

## How the Bot works, and how completion is judged

Three parallel workstreams — features, QA, usability/performance — but
schema and sample-data PRs have a single owner. Each PR is small and carries
the acceptance criteria it addresses, reproduction steps, and test results.
Daily reports lead with data-loss risks and unverified items, ahead of
completed work. The Bot decides implementation details; changes to data
meaning, the owner's devices, external sending, or irreversible operations
are confirmed with the owner first.

If the schedule slips, cut in this order: OCR, visual polish, review
ordering improvements. Never cut verification of storage, recovery, search,
or migration. After Week 4, report **delivery pass/fail** by the tests above
and **demand pass/fail** separately, from passages the owner actually saved
and later found again. If no re-finding has happened yet, demand is
"unverified" — daily launches are not a substitute.
