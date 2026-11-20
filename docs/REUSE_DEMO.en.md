# Margin source-reuse demo (experimental, not the production app)

This demo tests **whether prior source-qualified copies add anything beyond ordinary search**. It does not claim that the app improves writing or that copied excerpts appeared in a manuscript. No Devin Bot work or Poke credit award is implied.

## One command

Prerequisite: Node.js 22+; no additional npm install required for the standalone demo.

```sh
npm run demo -- demo/fixtures/corpus-a
```

On Windows PowerShell, use `npm.cmd run demo -- demo/fixtures/corpus-a` if `npm.ps1` is blocked. Open the printed `http://127.0.0.1:<port>` URL. Stop with Ctrl+C. A different corpus runs through the same command:

```sh
npm run demo -- demo/fixtures/corpus-b
```

The app is bound only to loopback. Each run scans its Markdown corpus at startup, not continuously; restart after editing files. No public service, hosted account, SQLite schema migration, or network sync is involved.

## Supported Markdown (strict by design)

Each `.md` file has a `# Book title`, then one or more `## Excerpt` or `## Passage` sections. Every section needs a `Source:` label, a `Location:` (or `Page:`) label and one or more `> quoted lines`:

```md
# A Fictional Book

## Excerpt: Morning
Source: Fictional edition, 2026
Location: chapter 2, p. 12
> 朝の窓から光が差し込んだ。
> 机の上には古い地図が残っていた。
```

Missing fields are reported under **Unsupported Markdown entries**; they are not guessed. The reader traverses up to five nested directory levels and skips symbolic links. Individual Markdown files over 512 KiB and collections over 300 Markdown files are unsupported. This is not a general Markdown importer, OCR engine, production FTS5 implementation, or lossless converter. It never modifies input Markdown.

## One screen, one persisted event

The screen contains a search box, **Show prior-copy suggestions** toggle and **Copy with source** buttons. Plain search (B) is identical when the toggle is off/on; with the toggle on (C), at most three **matching** excerpts previously copied with a source are shown in a separate area. The base search results do not change. Search currently performs Unicode-normalized, case-insensitive substring matching across book, text, source and location.

The only persisted action event is:

```json
{"event":"citation_copied","excerpt_id":"<stable 20-hex ID>","timestamp":"<UTC ISO-8601>"}
```

A successful clipboard write precedes the browser's event POST. A direct local API client can generate an event without an actual clipboard operation, so **the log proves neither actual manuscript use nor independent productivity gain**. No click-interest label, notes text, manuscript content, or path is stored in this event.

Default local history path: `~/.margin/reuse-demo/<corpus-hash>/citation-events.jsonl`; override its base directory using `MARGIN_DEMO_DATA_DIR`. Each corpus gets a separate history stream. The log is never committed; synthetic tests use temporary directories and delete them. IDs depend on the relative file path, excerpt order and text/source values, so editing those fields creates a new ID.

## Fair A/B/C comparison

| Condition | What the participant actually uses | What is measured |
| --- | --- | --- |
| A | Their normal editor/OSS with normal search and source verification | Existing-workflow elapsed time + correct source |
| B | This demo with history **off** | Added value of search plus source-qualified copying |
| C | Exactly the same demo with history **on** | Increment from prior source-qualified copies only |

Use the [synthetic task sheet](../demo/fixtures/tasks.csv) for a rehearsal. It supplies tasks and expected sources, **not measured results**. A real evaluation must counterbalance task difficulty and tool order; avoid using the exact same answer immediately after finding it in another arm. Time from a legitimate need until a **correct, usable** citation is ready, and record cases abandoned for a missing source. Count first-time tasks as well as repeated-use tasks, to expose suggestions that distract.

Compare A→B and B→C separately. Each result needs setup, logging and ongoing maintenance time subtracted; do not call gross task savings net savings. Copy history is **not** evidence of use in writing; confirm usefulness separately with the user. Afterward, freeze the code and repeat with corpus-b (or a permission-cleared independent corpus). Report unsupported formats, required manual adaptation and negative outcomes. A second corpus passing is portability evidence, not a second person's adoption.

**Stop rule:** If C fails to improve on B after overhead and citation accuracy, disable/remove C; do not expand the app to hide a negative result. No natural reuse opportunity means value is unverified, not a successful comparison.

## Verification

```sh
npm run test:demo
npm test
npx tsc --noEmit
npm run build
```

`test:demo` uses Node's built-in test runner and covers both corpora, source diagnostics, history toggle, local HTTP, event persistence and restart. These are engineering correctness tests, **not** user-value measurements. Production storage, backup/restore and migration acceptance remain in the main plan; [Issue #2](https://github.com/Ueda-Yu/margin/issues/2) is unchanged and takes priority.

**Change control:** This is a separate, synthetic-data experimental branch. Do not merge it into production without evaluating its independence and size against `docs/CHANGE_POLICY.en.md`. In particular, do not combine schema-guard or recovery changes with this demo.
