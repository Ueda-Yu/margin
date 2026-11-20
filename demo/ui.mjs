// A self-contained local UI. Text is rendered with textContent, never innerHTML.
export const html = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Margin | Citation Reuse Demo</title>
<style>
:root { font: 16px/1.5 system-ui, -apple-system, sans-serif; color: #23313b; background: #f7f5f0 }
* { box-sizing: border-box }
body { margin: 0; padding: 24px }
main { max-width: 1020px; margin: 0 auto }
header { margin: 30px 0 24px }
h1 { font-family: Georgia, serif; font-size: clamp(32px, 6vw, 48px); margin: 4px 0 }
h2 { font-family: Georgia, serif; font-size: 23px; margin: 0 0 12px }
p { margin: 4px 0 12px }
.eyebrow { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; font-weight: 750; color: #57685a }
.muted { color: #626e73; font-size: 14px }
.stage { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0 28px }
.stage div { border: 1px solid #e2e4df; padding: 13px 15px; border-radius: 10px; background: #fff }
.stage strong { font-weight: 740 }
.control { background: #fff; padding: 22px; border-radius: 14px; border: 1px solid #e5e5e0; box-shadow: 0 3px 20px #25331b0b }
.controls { display: flex; gap: 18px; align-items: center; flex-wrap: wrap }
input[type=search] { width: min(100%, 490px); padding: 12px 14px; font: inherit; border: 1px solid #a4b3ad; border-radius: 9px }
input[type=checkbox] { width: 18px; height: 18px; vertical-align: middle }
label { font-weight: 650 }
.toggle { display: inline-flex; align-items: center; gap: 8px; cursor: pointer }
section { margin: 24px 0 }
.cards { display: grid; grid-template-columns: repeat(auto-fill,minmax(260px,1fr)); gap: 14px }
article { background: #fff; padding: 18px; border-radius: 12px; border: 1px solid #e2e4df; display: flex; flex-direction: column; gap: 8px; min-height: 180px }
article .book { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #52685b; font-weight: 800 }
article .quote { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 15px; flex: 1; margin: 0 }
article .source { color: #657278; font-size: 13px; white-space: pre-wrap; overflow-wrap: anywhere }
button { border: 0; border-radius: 8px; background: #325646; color: white; padding: 9px 13px; font: inherit; cursor: pointer; align-self: flex-start; font-weight: 650 }
button:focus-visible, input:focus-visible { outline: 3px solid #dcad56; outline-offset: 2px }
#suggestions { background: #e9efea; padding: 22px; border-radius: 12px }
#suggestions[hidden] { display: none }
.note { background: #fbf3df; padding: 14px 16px; border: 1px solid #ead8b4; border-radius: 10px }
#status { min-height: 1.5em }
.diagnostic { color: #6f5b37 }
@media (max-width:670px) { .stage { grid-template-columns:1fr } body { padding: 12px } .control { padding: 16px } }
</style>
</head>
<body>
<main>
<header>
  <div class="eyebrow">Margin / Local-only study</div>
  <h1>Finding a passage again</h1>
  <p>One corpus, two Margin modes. Compare against your usual editor separately — never an artificially weakened one.</p>
  <p class="muted">This is a synthetic-data prototype, not the main Margin app and not a demonstrated productivity gain.</p>
</header>
<div class="stage" aria-label="Comparison conditions">
  <div><strong>A · Existing editor</strong><p class="muted">Search the same files in your usual editor; verify the source manually. Record time separately.</p></div>
  <div><strong>B · Margin / history off</strong><p class="muted">Search the excerpt and copy its source-qualified citation.</p></div>
  <div><strong>C · Margin / history on</strong><p class="muted">Same results and copying, plus at most three previously copied matches.</p></div>
</div>
<div class="control">
  <div class="controls">
    <label for="search">Find a passage</label>
    <input id="search" type="search" placeholder="Japanese text, source, title, or location" autocomplete="off">
    <label class="toggle"><input id="history" type="checkbox"> Show prior-copy suggestions (C)</label>
  </div>
  <p class="muted">Try a previously copied phrase, then a first-time query. A copy event does not mean the passage was used in a manuscript.</p>
  <p id="status" role="status" class="muted"></p>
</div>
<section id="suggestions" hidden>
  <h2>Previously copied matches</h2>
  <p class="muted">Only items matching the current search; up to three. The ordinary search list below stays unchanged.</p>
  <div id="suggestion-list" class="cards"></div>
</section>
<section>
  <h2>All matching excerpts</h2>
  <p class="muted" id="count">Loading…</p>
  <div id="results" class="cards"></div>
</section>
<section class="note">
  <strong>Study boundary:</strong> Search accuracy, source sufficiency and time to a usable citation must be compared with the normal editor. Do not treat these copy events as writing use, user demand or evidence of improved productivity.
</section>
<section>
  <details>
    <summary class="muted">Unsupported Markdown entries</summary>
    <ul class="diagnostic" id="diagnostics"></ul>
  </details>
</section>
</main>
<script>
const byId = (id) => document.getElementById(id);
let requestNumber = 0;
let refreshDelay;
const status = (message) => { byId('status').textContent = message; };

function card(excerpt) {
  const element = document.createElement('article');
  const book = document.createElement('div');
  book.className = 'book';
  book.textContent = excerpt.book;
  const quote = document.createElement('p');
  quote.className = 'quote';
  quote.textContent = excerpt.text;
  const source = document.createElement('div');
  source.className = 'source';
  source.textContent = excerpt.source + ' · ' + excerpt.location;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Copy with source';
  button.onclick = async () => {
    button.disabled = true;
    try {
      await navigator.clipboard.writeText(excerpt.citation);
    } catch {
      status('Clipboard write failed. No citation_copied event was recorded.');
      button.disabled = false;
      return;
    }
    try {
      const response = await fetch('/api/copy', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ excerpt_id: excerpt.id })
      });
      if (!response.ok) throw new Error('History write failed');
      status('Citation copied and citation_copied event recorded. This is not proof of manuscript use.');
    } catch {
      status('Citation copied, but history could not be written. No durable copy-event evidence.');
    } finally {
      button.disabled = false;
      await refresh();
    }
  };
  element.append(book, quote, source, button);
  return element;
}
function render(container, excerpts) {
  container.replaceChildren(...excerpts.map(card));
}
async function refresh() {
  const myNumber = ++requestNumber;
  const q = byId('search').value;
  const historyEnabled = byId('history').checked;
  try {
    const response = await fetch('/api/excerpts?q=' + encodeURIComponent(q) + '&history=' + (historyEnabled ? '1' : '0'));
    if (!response.ok) throw new Error('Search unavailable (' + response.status + ')');
    const data = await response.json();
    if (myNumber !== requestNumber) return;
    render(byId('results'), data.results);
    render(byId('suggestion-list'), data.suggestions);
    byId('suggestions').hidden = !historyEnabled || data.suggestions.length === 0;
    byId('count').textContent = data.count + ' matching excerpts; showing ' + data.results.length + ' (maximum 100).';
    byId('diagnostics').replaceChildren(...data.diagnostics.map((d) => {
      const item = document.createElement('li');
      item.textContent = d.file + ': ' + d.reason;
      return item;
    }));
  } catch (error) {
    status('Unable to load excerpts: ' + error.message);
  }
}
byId('search').addEventListener('input', () => {
  clearTimeout(refreshDelay);
  refreshDelay = setTimeout(refresh, 100);
});
byId('history').addEventListener('change', refresh);
refresh();
</script>
</body>
</html>`;