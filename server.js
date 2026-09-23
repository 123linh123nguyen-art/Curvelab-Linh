const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT || 3000);

function findPublicDirectory() {
  const configured = process.env.CURVELAB_PUBLIC_DIR
    ? path.resolve(__dirname, process.env.CURVELAB_PUBLIC_DIR)
    : null;
  const candidates = [
    configured,
    path.resolve(__dirname, 'dist'),
    path.resolve(__dirname, 'CurveLab-Render', 'dist'),
    path.resolve(__dirname, 'curvelab-site', 'dist'),
    __dirname
  ].filter(Boolean);

  for (const directory of candidates) {
    if (fs.existsSync(path.join(directory, 'index.html'))) return directory;
  }

  // Render's “Add files via upload” can add one wrapper folder. Search only
  // two levels deep and never descend into dependency or hidden directories.
  let level = [__dirname];
  for (let depth = 0; depth < 2; depth += 1) {
    const next = [];
    for (const parent of level) {
      let entries = [];
      try {
        entries = fs.readdirSync(parent, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const directory = path.join(parent, entry.name);
        if (fs.existsSync(path.join(directory, 'index.html'))) return directory;
        next.push(directory);
      }
    }
    level = next;
  }

  return path.resolve(__dirname, 'dist');
}

const publicDirectory = findPublicDirectory();

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

function sendFile(response, filePath, method) {
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(method === 'HEAD' ? undefined : '404 - Khong tim thay trang');
      return;
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stats.size,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });

    if (method === 'HEAD') {
      response.end();
      return;
    }

    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Yeu cau khong hop le');
    return;
  }

  if (pathname === '/') pathname = '/index.html';
  if (pathname === '/studio' || pathname === '/studio/') pathname = '/studio.html';

  const requestedPath = path.resolve(publicDirectory, '.' + pathname);
  if (requestedPath !== publicDirectory && !requestedPath.startsWith(publicDirectory + path.sep)) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Khong duoc phep');
    return;
  }

  sendFile(response, requestedPath, request.method);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`CurveLab dang chay tai cong ${port}`);
  console.log(`Thu muc web: ${publicDirectory}`);
  console.log(`Trang chu: ${fs.existsSync(path.join(publicDirectory, 'index.html')) ? 'da tim thay' : 'KHONG TIM THAY index.html'}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
