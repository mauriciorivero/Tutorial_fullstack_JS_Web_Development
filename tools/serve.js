#!/usr/bin/env node
/**
 * tools/serve.js
 * ---------------------------------------------------------------------
 * Servidor estatico local SIN dependencias (solo modulos de Node).
 *
 * USO
 *     npm start                      http://localhost:3000
 *     node tools/serve.js 8080       otro puerto
 *     PORT=8080 node tools/serve.js  otro puerto
 *
 * Es solo para desarrollo. En produccion (GitHub Pages, Vercel) se sirven
 * los mismos archivos tal cual: la presentacion no tiene paso de build.
 */

'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.resolve(__dirname, '..');
const PUERTO = Number(process.argv[2] || process.env.PORT || 3000);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

const servidor = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  let relativa;
  try {
    relativa = decodeURIComponent(pathname);
  } catch (e) {
    res.writeHead(400).end('Bad request');
    return;
  }
  if (relativa.endsWith('/')) relativa += 'index.html';

  // Evita salir de la raiz con ../
  const archivo = path.join(RAIZ, path.normalize(relativa));
  if (archivo !== RAIZ && !archivo.startsWith(RAIZ + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(archivo, (err, datos) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 No encontrado');
      return;
    }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(datos);
  });
});

servidor.listen(PUERTO, () => {
  console.log(`\n  Presentacion en  http://localhost:${PUERTO}\n  (Ctrl+C para detener)\n`);
});
