#!/usr/bin/env node
/**
 * tools/build-code-files.js
 * ---------------------------------------------------------------------
 * HERRAMIENTA DE DESARROLLO. No se ejecuta en el navegador.
 *
 * QUE HACE
 * Lee js/slides.js, busca todas las referencias `file: '...'`, carga esos
 * archivos REALES del proyecto y genera js/code-files.js con este formato:
 *
 *     window.CODE_FILES = { "persona-api/utils/fechas.js": "<texto completo>" };
 *
 * POR QUE EXISTE
 * Para que el codigo de las diapositivas NUNCA se escriba a mano dentro de
 * slides.js. Si alguien edita persona-api/utils/fechas.js y vuelve a correr
 * este script, la presentacion se actualiza sola. La presentacion no puede
 * desincronizarse del proyecto.
 *
 * ADEMAS VALIDA que cada rango `range:[a,b]` y cada `focus:[[a,b]]` este
 * dentro del numero de lineas del archivo. Si no, aborta con error.
 *
 * USO
 *     node tools/build-code-files.js
 *     node tools/build-code-files.js --check    (solo valida, no escribe)
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

// ---------------------------------------------------------------------
// Rutas. El script vive en OUTPUT_DIR/tools/, y la raiz del proyecto
// esta tres niveles arriba:
//   personal_management_fullstack/
//     interactive_presentation/
//       diapositivas_instruccion/
//         tools/build-code-files.js   <- aqui
// ---------------------------------------------------------------------
const DIR_DECK = path.resolve(__dirname, '..');
const RAIZ_PROYECTO = path.resolve(DIR_DECK, '..', '..');
const ARCHIVO_SLIDES = path.join(DIR_DECK, 'js', 'slides.js');
const ARCHIVO_SALIDA = path.join(DIR_DECK, 'js', 'code-files.js');

const SOLO_VALIDAR = process.argv.includes('--check');

// Colores ANSI para que el reporte se lea de un vistazo.
const C = {
  gris: '\x1b[90m', verde: '\x1b[32m', rojo: '\x1b[31m',
  amarillo: '\x1b[33m', cian: '\x1b[36m', fin: '\x1b[0m'
};

/** Termina el proceso con un mensaje de error claro. */
function abortar(mensaje) {
  console.error(`\n${C.rojo}[build-code-files] ${mensaje}${C.fin}\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------
// 1. Leer slides.js
// ---------------------------------------------------------------------
if (!fs.existsSync(ARCHIVO_SLIDES)) {
  abortar(`No existe ${path.relative(process.cwd(), ARCHIVO_SLIDES)}`);
}

const textoSlides = fs.readFileSync(ARCHIVO_SLIDES, 'utf8');

// ---------------------------------------------------------------------
// 2. Extraer todas las rutas referenciadas
//
//    Dos formas en slides.js:
//      file: 'persona-api/utils/fechas.js'          (chip del encabezado)
//      tabs: [{ file: 'persona-api/index.js', ... }] (pestana del editor)
//
//    Un Set elimina los duplicados automaticamente.
// ---------------------------------------------------------------------
const rutas = new Set();
const RE_ARCHIVO = /\bfile:\s*'([^']+)'/g;

let coincidencia;
while ((coincidencia = RE_ARCHIVO.exec(textoSlides)) !== null) {
  rutas.add(coincidencia[1]);
}

if (rutas.size === 0) {
  abortar('slides.js no referencia ningun archivo con la forma  file: \'...\'');
}

// ---------------------------------------------------------------------
// 3. Cargar cada archivo y contar sus lineas
// ---------------------------------------------------------------------
const contenidos = {};
const totalLineas = {};
const faltantes = [];

for (const rel of [...rutas].sort()) {
  const absoluta = path.join(RAIZ_PROYECTO, rel);

  if (!fs.existsSync(absoluta)) {
    faltantes.push(rel);
    continue;
  }

  const texto = fs.readFileSync(absoluta, 'utf8');
  contenidos[rel] = texto;

  // Contamos como lo hace un editor: si el archivo termina en salto de
  // linea, esa ultima linea vacia no cuenta.
  const partes = texto.split('\n');
  if (partes.length > 0 && partes[partes.length - 1] === '') partes.pop();
  totalLineas[rel] = partes.length;
}

if (faltantes.length > 0) {
  abortar(
    'slides.js referencia archivos que no existen:\n  - ' + faltantes.join('\n  - ')
  );
}

// ---------------------------------------------------------------------
// 4. VALIDAR los rangos y las lineas de foco
//
//    Recorremos cada bloque `{ file: '...', ... range: [a,b], focus: [[c,d]] }`
//    y comprobamos que todos los numeros caigan dentro del archivo.
// ---------------------------------------------------------------------
const errores = [];

// Partimos el texto por cada aparicion de `file:` para analizar su bloque.
const bloques = textoSlides.split(/\bfile:\s*'/).slice(1);

for (const bruto of bloques) {
  const finRuta = bruto.indexOf("'");
  const rel = bruto.slice(0, finRuta);

  // Nos quedamos con el fragmento hasta el siguiente `file:` o 600 chars,
  // que es donde viven range y focus de ESTA pestana.
  const fragmento = bruto.slice(finRuta, finRuta + 600);
  const total = totalLineas[rel];
  if (total === undefined) continue;

  // range: [a, b]
  const mRango = /\brange:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]/.exec(fragmento);
  if (mRango) {
    const a = Number(mRango[1]);
    const b = Number(mRango[2]);

    if (a < 1) errores.push(`${rel}: range empieza en ${a} (minimo 1)`);
    if (b > total) errores.push(`${rel}: range llega a ${b} pero el archivo tiene ${total} lineas`);
    if (a > b) errores.push(`${rel}: range [${a}, ${b}] esta invertido`);
  }

  // focus: [[c, d], [e, f]]
  const mFoco = /\bfocus:\s*\[([\s\S]{0,220}?)\]\s*[,}]/.exec(fragmento);
  if (mFoco) {
    const pares = [...mFoco[1].matchAll(/\[\s*(\d+)\s*,\s*(\d+)\s*\]/g)];

    for (const par of pares) {
      const c = Number(par[1]);
      const d = Number(par[2]);

      if (c < 1) errores.push(`${rel}: focus empieza en ${c} (minimo 1)`);
      if (d > total) errores.push(`${rel}: focus llega a ${d} pero el archivo tiene ${total} lineas`);
      if (c > d) errores.push(`${rel}: focus [${c}, ${d}] esta invertido`);

      // El foco tiene que caer DENTRO del rango visible, o no se veria.
      if (mRango) {
        const a = Number(mRango[1]);
        const b = Number(mRango[2]);
        if (c < a || d > b) {
          errores.push(`${rel}: focus [${c}, ${d}] se sale del range [${a}, ${b}]`);
        }
      }
    }
  }
}

if (errores.length > 0) {
  abortar(
    `${errores.length} rango(s) invalido(s):\n  - ` + [...new Set(errores)].join('\n  - ')
  );
}

// ---------------------------------------------------------------------
// 5. Emitir js/code-files.js
// ---------------------------------------------------------------------
const cabecera = `/**
 * js/code-files.js  ·  ARCHIVO GENERADO, NO EDITAR A MANO
 * ---------------------------------------------------------------------
 * Lo produce  node tools/build-code-files.js  leyendo los archivos reales
 * del proyecto. Si cambias el codigo fuente, vuelve a ejecutarlo.
 *
 * Generado: ${new Date().toISOString()}
 * Archivos: ${Object.keys(contenidos).length}
 */
window.CODE_FILES = `;

// JSON.stringify escapa comillas, saltos de linea y acentos por nosotros.
const cuerpo = JSON.stringify(contenidos, null, 0);

const salida = `${cabecera}${cuerpo};\n`;

if (SOLO_VALIDAR) {
  console.log(`${C.verde}[build-code-files] Validacion correcta.${C.fin}`);
  console.log(`  Archivos referenciados : ${Object.keys(contenidos).length}`);
  console.log(`  Rangos revisados       : ${bloques.length}`);
  process.exit(0);
}

fs.writeFileSync(ARCHIVO_SALIDA, salida, 'utf8');

// ---------------------------------------------------------------------
// 6. Reporte
// ---------------------------------------------------------------------
const pesoKB = (Buffer.byteLength(salida, 'utf8') / 1024).toFixed(1);

console.log(`\n${C.cian}[build-code-files]${C.fin} js/code-files.js generado`);
console.log(`  ${C.gris}archivos :${C.fin} ${Object.keys(contenidos).length}`);
console.log(`  ${C.gris}lineas   :${C.fin} ${Object.values(totalLineas).reduce((a, b) => a + b, 0)}`);
console.log(`  ${C.gris}tamanio  :${C.fin} ${pesoKB} KB`);
console.log(`  ${C.gris}rangos   :${C.fin} ${bloques.length} validados, 0 errores`);
console.log(`${C.verde}  OK${C.fin}\n`);
