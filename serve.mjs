import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
const publicFiles = new Set(['/', '/index.html', '/styles.css', '/hero-font.css', '/site.js', '/favicon.svg']);
const port = Number(process.env.PORT || 8000);

createServer(async (request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }
  if (request.method !== 'GET') {
    response.writeHead(404).end('Not found');
    return;
  }
  const pageName = pathname.match(/^\/(home|about|programs|approach|contact)\/?$/)?.[1];
  if (!publicFiles.has(pathname) && !pageName) {
    response.writeHead(404).end('Not found');
    return;
  }
  const file = pageName ? join(root, pageName, 'index.html') : join(root, pathname === '/' ? 'index.html' : pathname.slice(1));
  try {
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' }).end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, () => console.log(`http://localhost:${port}`));
