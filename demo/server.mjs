import { createServer } from 'node:http';
import { loadCorpus, searchExcerpts, suggestCopied, formatCitation } from './corpus.mjs';
import { historyFile, readHistory, recordCitationCopy } from './history.mjs';
import { html } from './ui.mjs';

function respond(res, status, value, contentType = 'application/json; charset=utf-8') {
  res.writeHead(status, {
    'content-type': contentType,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
  });
  res.end(contentType.startsWith('application/json') ? JSON.stringify(value) : value);
}

async function jsonBody(request, maxBytes = 4096) {
  let size = 0;
  const buffers = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new RangeError('Request body too large');
    buffers.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(buffers).toString('utf8')); }
  catch { throw new SyntaxError('Invalid JSON'); }
}

function publicExcerpt(item) {
  return {
    id: item.id,
    book: item.book,
    text: item.text,
    source: item.source,
    location: item.location,
    citation: formatCitation(item),
  };
}

export async function startDemo({ notesDir, port = 0, dataDirectory } = {}) {
  if (typeof notesDir !== 'string' || !notesDir.trim()) throw new TypeError('notesDir is required');
  if (!Number.isSafeInteger(port) || port < 0 || port > 65535) throw new RangeError('Invalid TCP port');
  const corpus = await loadCorpus(notesDir);
  if (corpus.excerpts.length === 0) {
    const reasons = corpus.diagnostics.slice(0, 5).map((item) => item.file + ': ' + item.reason).join('\n');
    throw new Error('No supported excerpts found. See the documented Markdown format.\n' + reasons);
  }
  const knownIDs = new Set(corpus.excerpts.map((item) => item.id));
  const eventPath = historyFile(corpus.root, dataDirectory);

  const server = createServer(async (request, res) => {
    try {
      const boundPort = server.address().port;
      const origin = 'http://127.0.0.1:' + boundPort;
      if (request.headers.host !== '127.0.0.1:' + boundPort) {
        respond(res, 403, { error: 'Invalid host' }); return;
      }
      const url = new URL(request.url, origin);
      if (request.method === 'GET' && url.pathname === '/') {
        res.writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
          'referrer-policy': 'no-referrer',
          'content-security-policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'",
        });
        res.end(html); return;
      }
      if (request.method === 'GET' && url.pathname === '/api/excerpts') {
        const query = url.searchParams.get('q') ?? '';
        if (query.length > 160) { respond(res, 400, { error: 'Search term too long' }); return; }
        const matches = searchExcerpts(corpus.excerpts, query);
        const withHistory = url.searchParams.get('history') === '1';
        const suggestions = withHistory ? suggestCopied(matches, await readHistory(eventPath)) : [];
        respond(res, 200, {
          count: matches.length,
          results: matches.slice(0, 100).map(publicExcerpt),
          suggestions: suggestions.map(publicExcerpt),
          diagnostics: corpus.diagnostics.slice(0, 50),
        });
        return;
      }
      if (request.method === 'POST' && url.pathname === '/api/copy') {
        if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) {
          respond(res, 415, { error: 'JSON required' }); return;
        }
        if (request.headers.origin && request.headers.origin !== origin) {
          respond(res, 403, { error: 'Cross-origin write blocked' }); return;
        }
        const payload = await jsonBody(request);
        if (!payload || typeof payload.excerpt_id !== 'string' || !knownIDs.has(payload.excerpt_id)) {
          respond(res, 400, { error: 'Unknown excerpt ID' }); return;
        }
        const event = await recordCitationCopy(eventPath, payload.excerpt_id);
        respond(res, 201, { event: event.event, excerpt_id: event.excerpt_id, timestamp: event.timestamp });
        return;
      }
      respond(res, 404, { error: 'Not found' });
    } catch (error) {
      if (error instanceof RangeError || error instanceof SyntaxError) {
        respond(res, 400, { error: error.message }); return;
      }
      // The error is logged locally, never sent to a browser with filesystem paths.
      console.error('Reuse demo request failed:', error);
      respond(res, 500, { error: 'Local request failed' });
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolve();
    });
  });
  const address = server.address();
  return {
    url: 'http://127.0.0.1:' + address.port,
    server,
    excerpts: corpus.excerpts.length,
    filesScanned: corpus.filesScanned,
    unsupported: corpus.diagnostics.length,
    eventPath,
    stop: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}
