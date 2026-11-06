// Local static server for the production export (out/), mimicking Netlify:
//   pretty URLs (/kota-stones -> kota-stones.html), _redirects 301s, 404.html, gzip-free range support for video.
// Usage: node scripts/serve-out.mjs [port]   (default 4321)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = path.resolve(import.meta.dirname, '..', 'out');
const PORT = Number(process.argv[2]) || 4321;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
};

const compressed = new Map();
const redirects = new Map();
const redirectsFile = path.join(ROOT, '_redirects');
if (fs.existsSync(redirectsFile)) {
  for (const line of fs.readFileSync(redirectsFile, 'utf8').split('\n')) {
    const m = line.match(/^(\S+)\s+(\S+)\s+301!?$/);
    if (m) redirects.set(m[1], m[2]);
  }
}

function resolve(urlPath) {
  const p = decodeURIComponent(urlPath);
  const full = path.normalize(path.join(ROOT, p));
  if (!full.startsWith(ROOT)) return null;
  const candidates = p.endsWith('/')
    ? [path.join(full, 'index.html')]
    : [full, `${full}.html`, path.join(full, 'index.html')];
  return candidates.find((f) => fs.existsSync(f) && fs.statSync(f).isFile()) ?? null;
}

http
  .createServer((req, res) => {
    const [pathname, query] = (req.url ?? '/').split('?');
    const to = redirects.get(pathname);
    if (to) {
      res.writeHead(301, { Location: to + (query ? `?${query}` : '') });
      return res.end();
    }
    const file = resolve(pathname);
    if (!file) {
      const nf = path.join(ROOT, '404.html');
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      return fs.existsSync(nf) ? fs.createReadStream(nf).pipe(res) : res.end('404');
    }
    const type = TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
    const size = fs.statSync(file).size;
    const range = req.headers.range;
    if (range) {
      const [s, e] = range.replace('bytes=', '').split('-');
      const start = Number(s);
      const end = e ? Number(e) : size - 1;
      res.writeHead(206, {
        'Content-Type': type,
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
      });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    // Compress text like Netlify does (brotli preferred, then gzip).
    const enc = String(req.headers['accept-encoding'] ?? '');
    if (/^(text|application\/(javascript|json|xml))|svg/.test(type)) {
      const coding = enc.includes('br') ? 'br' : enc.includes('gzip') ? 'gzip' : null;
      if (coding) {
        // Compress each file once and keep it in memory (the export is immutable while serving).
        const key = `${coding}:${file}:${fs.statSync(file).mtimeMs}`; // invalidated by rebuilds
        let body = compressed.get(key);
        if (!body) {
          const raw = fs.readFileSync(file);
          body =
            coding === 'br'
              ? zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } })
              : zlib.gzipSync(raw, { level: 9 });
          compressed.set(key, body);
        }
        res.writeHead(200, {
          'Content-Type': type,
          'Content-Encoding': coding,
          'Content-Length': body.length,
          Vary: 'Accept-Encoding',
        });
        return res.end(body);
      }
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`Serving out/ at http://localhost:${PORT}`));
