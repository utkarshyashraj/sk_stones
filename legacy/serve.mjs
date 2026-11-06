// Local dev server that mimics Netlify "pretty URLs":
//   /kota-stones  -> kota-stones.html
//   /             -> index.html
// Usage: node serve.mjs [port]   (default 8080)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2]) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.gif': 'image/gif',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.xml': 'application/xml', '.txt': 'text/plain',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
};

function resolve(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0]);
  const full = path.normalize(path.join(ROOT, p));
  if (!full.startsWith(ROOT)) return null;
  const candidates = [full, full + '.html', path.join(full, 'index.html')];
  return candidates.find(f => fs.existsSync(f) && fs.statSync(f).isFile()) || null;
}

http.createServer((req, res) => {
  const file = resolve(req.url);
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('404 Not Found: ' + req.url);
  }
  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const size = fs.statSync(file).size;
  const range = req.headers.range; // needed for <video> seeking
  if (range) {
    const [s, e] = range.replace('bytes=', '').split('-');
    const start = Number(s), end = e ? Number(e) : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`S K Stones site running at http://localhost:${PORT}`));
