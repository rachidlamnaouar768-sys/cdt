'use strict';
// Local test server:  LOCAL_DEV=1 node dev-server.js   (in-memory storage, NOT for production)
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 3000;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const routes = {};
fs.readdirSync(path.join(__dirname, 'api')).filter((f) => f.endsWith('.js')).forEach((f) => {
  routes['/api/' + f.slice(0, -3)] = require('./api/' + f);
});
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (routes[u.pathname]) return routes[u.pathname](req, res);
  let p = u.pathname === '/' ? '/index.html' : u.pathname;
  const file = path.join(__dirname, 'public', path.normalize(p).replace(/^(\.\.[\/\\])+/, ''));
  fs.readFile(file, (err, buf) => {
    if (err) { res.statusCode = 404; return res.end('not found'); }
    res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
    res.end(buf);
  });
}).listen(PORT, () => console.log('dev server on http://localhost:' + PORT + (process.env.LOCAL_DEV === '1' ? ' (in-memory store)' : '')));
