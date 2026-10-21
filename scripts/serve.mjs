// Zero-dependency static server for site/ (used by `npm start` and Playwright's webServer)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const ROOT = resolve('site');
const PORT = Number(process.env.PORT) || 4173;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.zip': 'application/zip',
};

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  let file = normalize(join(ROOT, decodeURIComponent(pathname)));
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return res.writeHead(403).end();
  if (pathname.endsWith('/')) file = join(file, 'index.html');
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
}).listen(PORT, () => console.log(`Serving site/ at http://localhost:${PORT}`));
