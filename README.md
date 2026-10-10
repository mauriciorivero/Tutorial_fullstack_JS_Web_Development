# Presentación interactiva · Personal Management

Recorrido guiado de **77 diapositivas** que reconstruye el proyecto paso a paso,
desde el modelo relacional hasta el frontend con Atomic Design.

> **Tres formas de verla, el mismo código en todas:** doble clic en `index.html`
> (sin servidor ni internet), `npm start` (servidor local) o publicada en
> GitHub Pages / Vercel. Ver [Ejecutar y publicar](#ejecutar-y-publicar).

---

## Ejecutar y publicar

Todas las rutas son relativas y no hay paso de build, así que cualquier hosting
estático sirve la carpeta tal cual.

### Local

| Opción | Comando | URL |
|---|---|---|
| Doble clic | abrir `index.html` | `file://…` |
| Servidor Node (sin dependencias) | `npm start` · `node tools/serve.js 8080` | http://localhost:3000 |
| Servidor Python | `python3 -m http.server 8000` | http://localhost:8000 |

### GitHub Pages

1. Sube esta carpeta como **raíz** del repositorio (rama `main`).
2. En *Settings → Pages → Source* elige **GitHub Actions**.
3. Cada push a `main` ejecuta `.github/workflows/pages.yml`, que publica solo
   `index.html`, `css/`, `js/`, `fonts/` y `vendor/`.

URL final: `https://<usuario>.github.io/<repositorio>/`. Funciona en subruta
porque ninguna ruta empieza con `/`. (Alternativa sin Actions: *Source → Deploy
from a branch → main / root*; `.nojekyll` ya está incluido.)

### Vercel

*Add New → Project →* importa el repositorio. `vercel.json` ya indica que no hay
framework ni build y que se sirve la raíz (`outputDirectory: "."`). O desde la
terminal: `npx vercel --prod`.

> Los enlaces profundos (`#paso-26-2`) usan el *hash*, no rutas, así que no
> necesitan reglas de reescritura en ningún hosting.

---

## Cómo usarla

| Acción | Tecla / gesto |
|---|---|
| Siguiente | `→` · `PageDown` · `Espacio` · deslizar a la izquierda |
| Anterior | `←` · `PageUp` · `Shift+Espacio` · deslizar a la derecha |
| Primera / última | `Home` / `End` |
| Abrir el índice | `i` |
| Cerrar el índice | `Esc` |
| Cambiar el tema | botón ☾ de la barra superior |
| Saludar a Bit | clic sobre la mascota |

Cada diapositiva tiene su propia URL: `index.html#paso-26-2`. Se puede compartir
y el botón **Atrás** del navegador funciona.

---

## Qué contiene

```
diapositivas_instruccion/
├── index.html              shell (100 líneas: solo los contenedores)
├── package.json            scripts: start, build:code, check:code (sin dependencias)
├── vercel.json             despliegue estático en Vercel
├── .nojekyll               evita que GitHub Pages procese el sitio con Jekyll
├── .github/workflows/pages.yml  despliegue a GitHub Pages
├── css/styles.css          todo el estilo
├── js/
│   ├── code-files.js       GENERADO · el texto de los 55 archivos reales
│   ├── slides.js           contenido: punteros a archivo + rango de líneas
│   ├── scene.js            motor three.js (campo de puntos, grafo, Bit)
│   └── app.js              renderizado, navegación e interfaz
├── tools/
│   ├── build-code-files.js herramienta de desarrollo (no corre en el navegador)
│   └── serve.js            servidor estático local (npm start)
├── fonts/                  Geist y Geist Mono  (OFL)
└── vendor/                 three.js r158 (MIT) · highlight.js 11.9 (BSD-3)
```

---

## El código NUNCA se escribe a mano en las diapositivas

Esa es la regla central del deck. En `slides.js` solo hay **punteros**:

```js
visual: {
  type: 'editor',
  tabs: [{
    file: 'persona-api/services/usuario.service.js',
    lang: 'javascript',
    range: [86, 137],        // líneas que se muestran
    focus: [[117, 126]]      // líneas resaltadas
  }]
}
```

El texto lo carga `js/code-files.js`, que genera una herramienta leyendo los
archivos **reales** del proyecto. Así la presentación **no puede** desincronizarse
del código.

### Regenerar `js/code-files.js`

Después de cambiar cualquier archivo del proyecto:

```bash
cd interactive_presentation/diapositivas_instruccion
node tools/build-code-files.js
```

```
[build-code-files] js/code-files.js generado
  archivos : 55
  lineas   : 10402
  tamanio  : 349.1 KB
  rangos   : 147 validados, 0 errores
  OK
```

Para **solo validar**, sin escribir nada:

```bash
node tools/build-code-files.js --check
```

El script **aborta** si un `range` o un `focus` se sale del archivo, si el foco
cae fuera del rango visible, o si una diapositiva apunta a un archivo que no
existe. Es imposible publicar un rango roto.

---

## Si WebGL no está disponible

La presentación sigue funcionando: se agrega la clase `no-webgl` al `<html>`,
los nodos del recorrido se pintan con CSS y Bit pasa a ser el robot SVG en línea
que vive dentro de `index.html`.

Con `prefers-reduced-motion: reduce` no hay flotación, ni paquetes en bucle, ni
ondas, ni animaciones de entrada.

---

## Librerías vendorizadas

| Archivo | Versión | Licencia |
|---|---|---|
| `vendor/three.min.js` | three.js r158 (build global, no módulo) | MIT · `vendor/three.LICENSE.txt` |
| `vendor/highlight.min.js` | highlight.js 11.9.0 + javascript, json, bash, sql, ini | BSD-3 · `vendor/highlight.LICENSE.txt` |
| `fonts/Geist-Variable.woff2` | Geist | OFL · `fonts/Geist.LICENSE.txt` |
| `fonts/GeistMono-Variable.woff2` | Geist Mono | OFL · `fonts/Geist.LICENSE.txt` |

> `three.min.js` imprime un **aviso de obsolescencia** en la consola al cargar
> (es el propio archivo de three.js r158, que anuncia la retirada de los builds
> no modulares en r160). Es un `console.warn`, no un error, y no afecta a nada.
> Se dejó el archivo vendorizado intacto a propósito: no se modifica código de
> terceros.

---

## Fuente de verdad

El orden y el contenido de las diapositivas reflejan
[`../../step_by_step.md`](../../step_by_step.md), sus 52 pasos y sus comandos.

| Fase | Diapositivas | Pasos |
|---|---|---|
| Inicio | 1 | portada |
| Fundamentos | 3 | 00 – 02 |
| Base de datos | 5 | 03 – 06 |
| Proyecto Node.js | 2 | 07 – 08 |
| Utilidades | 11 | 09 – 16 |
| Modelo y conexión | 16 | 17 – 25 |
| Capas de la API | 16 | 26 – 34 |
| Frontend | 17 | 35 – 49 |
| Probar y cerrar | 6 | 50 – 52 |
| **Total** | **77** | |
