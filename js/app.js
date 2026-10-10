/**
 * js/app.js  ·  Renderizado, navegación e interfaz
 * ---------------------------------------------------------------------
 * IIFE con globales de window: NO usamos módulos ES porque el deck
 * tiene que abrir con doble clic (file://), y ahí los módulos están
 * bloqueados por la política de mismo origen.
 *
 * Depende de: window.SLIDES, window.PHASES, window.PIPELINE,
 * window.ARCHITECTURE, window.CODE_FILES, window.Scene y window.hljs.
 */
/* global window, document, hljs */
(function () {
  'use strict';

  var SLIDES = window.SLIDES || [];
  var PHASES = window.PHASES || [];
  var PIPELINE = window.PIPELINE || { main: [], side: [] };
  var ARCH = window.ARCHITECTURE || { main: [], side: [] };
  var CODE = window.CODE_FILES || {};
  var CLAVE_TEMA = 'personal-management-diapositivas-tema';

  // =====================================================================
  // AYUDANTES
  // =====================================================================

  /**
   * Crea un elemento del DOM.
   *
   * `props` admite: class, text, html, manejadores onClick/onInput,
   * atributos con guion (data-x, aria-x) y cualquier propiedad del DOM.
   */
  function el(tag, props, ...kids) {
    var node = document.createElement(tag);
    props = props || {};

    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v === null || v === undefined || v === false) return;

      if (k === 'class') { node.className = v; return; }
      if (k === 'text') { node.textContent = v; return; }
      if (k === 'html') { node.innerHTML = v; return; }       // solo marcado nuestro
      if (k.slice(0, 2) === 'on' && typeof v === 'function') {
        node.addEventListener(k.slice(2).toLowerCase(), v);
        return;
      }
      if (k.indexOf('-') > -1 || k.slice(0, 4) === 'aria' || k.slice(0, 4) === 'data') {
        node.setAttribute(k, v);
        return;
      }
      if (k in node) { node[k] = v; } else { node.setAttribute(k, v); }
    });

    kids.flat(Infinity).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
    });

    return node;
  }

  /** Iconos en línea: 16px, trazo 1.5, extremos redondeados. */
  var ICON = {
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v6h6"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>'
  };

  function icon(name) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = ICON[name] || '';
    return svg;
  }

  /** Extensión → clase del distintivo de color de la pestaña. */
  function badgeKind(path) {
    var ext = (path || '').split('.').pop().toLowerCase();
    if (ext === 'js') return 'js';
    if (ext === 'json') return 'json';
    if (ext === 'sql') return 'sql';
    if (ext === 'css') return 'css';
    if (ext === 'md') return 'md';
    if (ext === 'html') return 'xml';
    if (path === 'persona-api/.env' || ext === 'env' || ext === 'ini') return 'env';
    if ((path || '').indexOf('gitignore') > -1) return 'git';
    return 'txt';
  }
  function badgeText(kind) {
    return { js: 'JS', json: '{ }', sql: 'SQL', css: 'CSS', md: 'MD', env: 'ENV', git: 'GIT', xml: '<>' }[kind] || 'TXT';
  }

  /** Copia al portapapeles con respaldo por selección. */
  function copiar(texto, boton) {
    function exito() {
      var previo = boton.textContent;
      boton.textContent = 'Copiado';
      boton.classList.add('ok');
      setTimeout(function () {
        boton.textContent = previo;
        boton.classList.remove('ok');
      }, 1800);
    }

    if (window.navigator.clipboard && window.navigator.clipboard.writeText) {
      window.navigator.clipboard.writeText(texto).then(exito, respaldo);
    } else {
      respaldo();
    }

    // Si el portapapeles está bloqueado, seleccionamos el texto para que
    // el usuario pueda copiarlo a mano.
    function respaldo() {
      var tmp = el('pre', { text: texto, style: 'position:fixed;left:-9999px;top:0;' });
      document.body.appendChild(tmp);
      try {
        var rango = document.createRange();
        rango.selectNodeContents(tmp);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(rango);
      } catch (e) { /* sin selección disponible */ }
      boton.textContent = 'Selecciona y copia';
      setTimeout(function () {
        boton.textContent = 'Copiar';
        if (tmp.parentNode) tmp.parentNode.removeChild(tmp);
      }, 2600);
    }
  }

  /** Divide el texto de un archivo en líneas (sin la vacía final). */
  function lineasDe(path) {
    var t = CODE[path];
    if (typeof t !== 'string') return null;
    var ls = t.split('\n');
    if (ls.length && ls[ls.length - 1] === '') ls.pop();
    return ls;
  }

  // =====================================================================
  // EDITOR
  // =====================================================================

  /**
   * Construye una ventana de editor con pestañas, numeración real de
   * líneas, resaltado y bandas de foco.
   */
  function Editor(visual) {
    var tabs = visual.tabs || [];
    var activo = 0;

    var cuerpo = el('div', { class: 'ed-body', tabIndex: 0, 'aria-label': 'Código fuente, desplazable' });
    var migas = el('div', { class: 'ed-crumbs' });
    var estado = el('div', { class: 'ed-status' });
    var listaTabs = el('div', { class: 'ed-tabs', role: 'tablist', 'aria-label': 'Archivos' });

    var botones = tabs.map(function (t, i) {
      var nombre = t.file || t.name || 'ejemplo.txt';
      var kind = badgeKind(nombre);
      return el('button', {
        class: 'ed-tab',
        role: 'tab',
        type: 'button',
        'aria-selected': i === 0 ? 'true' : 'false',
        tabIndex: i === 0 ? 0 : -1,
        onclick: function () { seleccionar(i); }
      },
        el('span', { class: 'badge ' + kind, text: badgeText(kind) }),
        nombre.split('/').pop()
      );
    });
    botones.forEach(function (b) { listaTabs.appendChild(b); });

    // Flechas izquierda/derecha cambian de pestaña (roving tabindex).
    listaTabs.addEventListener('keydown', function (ev) {
      if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
      ev.preventDefault();
      ev.stopPropagation();
      var paso = ev.key === 'ArrowRight' ? 1 : -1;
      seleccionar((activo + paso + tabs.length) % tabs.length);
      botones[activo].focus();
    });

    function seleccionar(i) {
      activo = i;
      botones.forEach(function (b, k) {
        b.setAttribute('aria-selected', k === i ? 'true' : 'false');
        b.tabIndex = k === i ? 0 : -1;
      });
      pintar();
    }

    function pintar() {
      var t = tabs[activo];
      var esInline = typeof t.inline === 'string';
      var todas = esInline ? t.inline.split('\n') : lineasDe(t.file);

      cuerpo.textContent = '';
      estado.textContent = '';
      migas.textContent = '';

      if (!todas) {
        cuerpo.appendChild(el('div', {
          class: 'term-body',
          text: 'No se encontró ' + t.file + ' en code-files.js.\nEjecuta:  node tools/build-code-files.js'
        }));
        return;
      }

      var desde = t.range ? t.range[0] : 1;
      var hasta = t.range ? t.range[1] : todas.length;
      var trozo = todas.slice(desde - 1, hasta);
      var lenguaje = t.lang || 'plaintext';

      // ---- Migas de pan: proyecto › carpeta › archivo ----
      var ruta = (t.file || t.name || '').split('/');
      var hojas = [];
      ruta.forEach(function (p, i) {
        if (i) hojas.push(el('span', { text: ' › ' }));
        hojas.push(i === ruta.length - 1 ? el('b', { text: p }) : el('span', { text: p }));
      });
      migas.appendChild(el('span', {}, hojas));

      // ---- Numeración con los números REALES del archivo ----
      var gutter = el('div', { class: 'ed-gutter', 'aria-hidden': 'true' });
      var enfocada = {};
      (t.focus || []).forEach(function (f) {
        for (var n = f[0]; n <= f[1]; n++) enfocada[n] = true;
      });
      for (var n = desde; n <= hasta; n++) {
        gutter.appendChild(el('b', { class: enfocada[n] ? 'on' : '', text: String(n) }));
      }

      // ---- Código resaltado, línea por línea ----
      var codigo = el('div', { class: 'ed-code' });
      var resaltado;
      try {
        resaltado = hljs.highlight(trozo.join('\n'), { language: lenguaje, ignoreIllegals: true }).value;
      } catch (e) {
        resaltado = trozo.join('\n').replace(/[&<>]/g, function (c) {
          return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
        });
      }
      // Partimos el HTML resaltado por líneas respetando las etiquetas abiertas.
      // Cada línea es un <span class="ln"> aparte. Las vacías quedan
      // vacías de verdad: el alto lo da .ln { min-height: 1.6em } del CSS.
      // Si aquí insertáramos "\n", el textContent dejaría de coincidir
      // byte a byte con el archivo real.
      partirLineas(resaltado).forEach(function (linea) {
        codigo.appendChild(el('span', { class: 'ln', html: linea }));
      });

      var grid = el('div', { class: 'ed-grid' }, gutter, codigo);

      // ---- Bandas de foco ----
      (t.focus || []).forEach(function (f) {
        var i = f[0] - desde;
        var cuantas = f[1] - f[0] + 1;
        grid.appendChild(el('div', {
          class: 'ed-focus',
          style: 'top: calc(12px + ' + i + ' * 1.6em); height: calc(' + cuantas + ' * 1.6em);'
        }));
      });

      cuerpo.appendChild(grid);

      // Desplazamos para que el foco quede visible.
      if (t.focus && t.focus.length) {
        requestAnimationFrame(function () {
          var alturaLinea = 1.6 * parseFloat(getComputedStyle(grid).fontSize);
          var y = (t.focus[0][0] - desde) * alturaLinea;
          cuerpo.scrollTop = Math.max(0, y - cuerpo.clientHeight / 2 + alturaLinea * 2);
        });
      }

      // ---- Barra de estado ----
      var info = t.range
        ? 'Líneas ' + desde + '–' + hasta + ' de ' + todas.length
        : todas.length + ' líneas';

      var btnCopiar = el('button', {
        type: 'button', class: 'copy-btn', text: 'Copiar',
        onclick: function () { copiar(trozo.join('\n'), btnCopiar); }
      });

      estado.appendChild(el('span', { text: 'main' }));
      estado.appendChild(el('span', { class: 'hide-sm', text: lenguaje }));
      estado.appendChild(el('span', { class: 'hide-sm', text: 'UTF-8' }));
      estado.appendChild(el('span', { class: 'hide-sm', text: 'Spaces: 2' }));
      estado.appendChild(el('span', { text: info }));

      var acciones = el('div', { class: 'grow' }, btnCopiar);
      if (t.range && !esInline) {
        var btnTodo = el('button', {
          type: 'button', class: 'copy-btn', text: 'Archivo completo',
          onclick: function () { copiar(todas.join('\n'), btnTodo); }
        });
        acciones.appendChild(btnTodo);
      }
      estado.appendChild(acciones);
    }

    pintar();

    return el('div', { class: 'editor on-dark' },
      el('div', { class: 'ed-chrome' },
        el('div', { class: 'dots' }, el('i'), el('i'), el('i')),
        listaTabs
      ),
      migas, cuerpo, estado
    );
  }

  /**
   * Parte HTML resaltado en líneas sin romper las etiquetas <span>.
   * highlight.js puede abrir un span en una línea y cerrarlo en otra.
   */
  function partirLineas(html) {
    var out = [];
    var abiertas = [];
    var buffer = '';
    var i = 0;

    while (i < html.length) {
      if (html[i] === '<') {
        var fin = html.indexOf('>', i);
        if (fin === -1) { buffer += html.slice(i); break; }
        var tag = html.slice(i, fin + 1);
        buffer += tag;
        if (tag.slice(0, 2) === '</') abiertas.pop();
        else if (tag.slice(-2) !== '/>') abiertas.push(tag);
        i = fin + 1;
      } else if (html[i] === '\n') {
        out.push(buffer + abiertas.map(function () { return '</span>'; }).join(''));
        buffer = abiertas.join('');
        i++;
      } else {
        buffer += html[i];
        i++;
      }
    }
    out.push(buffer);
    return out;
  }

  // =====================================================================
  // OTROS COMPONENTES VISUALES
  // =====================================================================

  /** Terminal con prompt "$" no seleccionable y continuación con "\". */
  function Terminal(comandos, titulo) {
    var cuerpo = el('div', { class: 'term-body', tabIndex: 0, 'aria-label': 'Comandos de terminal' });

    comandos.forEach(function (c) {
      var grupo = el('div', { class: 'cmd-group' });
      if (c.label) grupo.appendChild(el('div', { class: 'term-label', text: c.label }));

      var lineas = String(c.code).split('\n');
      var continua = false;

      lineas.forEach(function (linea) {
        var marca = continua ? '>' : '$';
        var resaltada;
        try {
          resaltada = hljs.highlight(linea, { language: 'bash', ignoreIllegals: true }).value;
        } catch (e) {
          resaltada = linea.replace(/[&<>]/g, function (ch) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch];
          });
        }
        grupo.appendChild(el('div', { class: 'term-line' },
          el('span', { class: 'p', text: marca, 'aria-hidden': 'true' }),
          el('span', { html: resaltada })
        ));
        // Una línea que termina en "\" continúa en la siguiente.
        continua = /\\\s*$/.test(linea);
      });

      var texto = lineas.join('\n');
      var btn = el('button', {
        type: 'button', class: 'copy-btn', text: 'Copiar',
        onclick: function () { copiar(texto, btn); }     // sin los prompts
      });
      grupo.appendChild(el('div', { style: 'margin-top:6px;' }, btn));
      cuerpo.appendChild(grupo);
    });

    return el('div', { class: 'terminal on-dark' },
      el('div', { class: 'term-head' }, 'terminal · ' + (titulo || 'persona-api')),
      cuerpo
    );
  }

  /** Consola simulada con cursor parpadeante. */
  function Output(o) {
    var cuerpo = el('div', { class: 'term-body', tabIndex: 0, 'aria-label': 'Salida de la consola' });
    (o.lines || []).forEach(function (l) {
      cuerpo.appendChild(el('div', { class: 'term-line' }, el('span', { text: l || ' ' })));
    });
    cuerpo.appendChild(el('div', { class: 'term-line' }, el('span', { class: 'cursor' })));

    return el('div', {},
      o.label ? el('div', { class: 'term-label', text: o.label }) : null,
      el('div', { class: 'output on-dark' },
        el('div', { class: 'term-head' }, 'salida'),
        cuerpo
      )
    );
  }

  /** Árbol de archivos con sangría, iconos y notas. */
  function Explorer(v) {
    var caja = el('div', { class: 'tree-wrap', tabIndex: 0, 'aria-label': 'Árbol de archivos' });
    (v.tree || []).forEach(function (row) {
      var kind = row.kind === 'folder' ? null : (row.kind || badgeKind(row.name));
      caja.appendChild(el('div', {
        class: 'tree-row' + (row.muted ? ' is-muted' : ''),
        style: '--depth:' + (row.depth || 0)
      },
        row.kind === 'folder' ? icon('folder')
          : el('span', { class: 'badge ' + kind, text: badgeText(kind) }),
        el('span', { text: row.name }),
        row.note ? el('span', { class: 'note', text: row.note }) : null
      ));
    });
    return caja;
  }

  /** Diagrama de arquitectura. Los nodos son DOM; three.js dibuja los enlaces. */
  function Architecture() {
    var caja = el('div', { class: 'arch', 'data-graph': 'vertical' });

    ARCH.main.forEach(function (m, fila) {
      var lado = ARCH.side.filter(function (s) { return s.row === fila; });
      caja.appendChild(el('div', { class: 'arch-row' },
        el('div', { class: 'arch-box', 'data-node': m.id },
          el('div', { class: 'lbl', text: m.label }),
          el('div', { class: 'note', text: m.note })
        ),
        lado.length
          ? el('div', { class: 'arch-box arch-side', 'data-node': lado[0].id },
              el('div', { class: 'lbl', text: lado[0].label }),
              el('div', { class: 'note', text: lado[0].note })
            )
          : el('div')
      ));
    });

    return caja;
  }

  /** Tabla de dependencias con etiqueta producción/desarrollo. */
  function Packages(lista) {
    var tabla = el('table', { class: 'pkg-table' });
    lista.forEach(function (p) {
      tabla.appendChild(el('tr', {},
        el('td', { class: 'pkg-name', text: p.name }),
        el('td', {}, el('span', { class: 'pkg-tag' + (p.tag === 'desarrollo' ? ' is-dev' : ''), text: p.tag })),
        el('td', { class: 'pkg-detail', text: p.detail })
      ));
    });
    return tabla;
  }

  /** Peticiones de ejemplo que usa la colección y el probador. */
  var PETICIONES = [
    {
      verb: 'GET', label: 'Listar usuarios', path: '/api/usuarios?limite=2',
      curl: 'curl -s "http://localhost:3000/api/usuarios?limite=2"',
      status: 200, ok: true,
      body: '{\n  "ok": true,\n  "mensaje": "Lista de usuarios obtenida correctamente.",\n  "datos": [\n    {\n      "id": 5,\n      "nombreCompleto": "Grace Brewster Hopper Murray",\n      "fechaNacimiento": "1906-12-09",\n      "edad": 119,\n      "totalTelefonos": 1,\n      "totalPerfilesSociales": 1\n    }\n  ],\n  "meta": { "total": 5, "pagina": 1, "totalPaginas": 3 }\n}'
    },
    {
      verb: 'GET', label: 'Detalle con relaciones', path: '/api/usuarios/5',
      curl: 'curl -s http://localhost:3000/api/usuarios/5',
      status: 200, ok: true,
      body: '{\n  "ok": true,\n  "datos": {\n    "id": 5,\n    "nombreCompleto": "Grace Brewster Hopper Murray",\n    "edad": 119,\n    "telefonos": [\n      { "id": 3, "numeroTelefono": "3001234567", "tipoTelefono": "Celular" }\n    ],\n    "perfilesSociales": [\n      { "redSocialId": 7, "usuarioId": 5,\n        "redSocial": { "nombre": "LinkedIn" } }\n    ]\n  }\n}'
    },
    {
      verb: 'POST', label: 'Crear usuario', path: '/api/usuarios',
      curl: 'curl -s -X POST http://localhost:3000/api/usuarios \\\n  -H \'Content-Type: application/json\' \\\n  -d \'{"primerNombre":"ada","primerApellido":"lovelace",\n       "fechaNacimiento":"1815-12-10","ciudadDomicilio":"londres"}\'',
      status: 201, ok: true,
      body: '{\n  "ok": true,\n  "mensaje": "Usuario creado correctamente.",\n  "datos": {\n    "id": 7,\n    "nombreCompleto": "Ada Lovelace",\n    "edad": 210,\n    "ciudadDomicilio": "Londres"\n  }\n}'
    },
    {
      verb: 'POST', label: 'Validación fallida', path: '/api/usuarios',
      curl: 'curl -s -X POST http://localhost:3000/api/usuarios \\\n  -H \'Content-Type: application/json\' -d \'{"primerNombre": "Ana"}\'',
      status: 400, ok: false,
      body: '{\n  "ok": false,\n  "error": {\n    "codigo": "VALIDACION",\n    "mensaje": "No se pudo crear el usuario porque hay datos invalidos.",\n    "detalles": [\n      { "campo": "primerApellido",  "mensaje": "El campo \\"primerApellido\\" es obligatorio." },\n      { "campo": "ciudadDomicilio", "mensaje": "El campo \\"ciudadDomicilio\\" es obligatorio." },\n      { "campo": "fechaNacimiento", "mensaje": "El campo \\"fechaNacimiento\\" es obligatorio." }\n    ]\n  }\n}'
    },
    {
      verb: 'GET', label: 'Usuario inexistente', path: '/api/usuarios/99999',
      curl: 'curl -s http://localhost:3000/api/usuarios/99999',
      status: 404, ok: false,
      body: '{\n  "ok": false,\n  "error": {\n    "codigo": "NO_ENCONTRADO",\n    "mensaje": "No existe un usuario con id 99999."\n  }\n}'
    },
    {
      verb: 'DELETE', label: 'Red social en uso', path: '/api/redes-sociales/2',
      curl: 'curl -s -X DELETE http://localhost:3000/api/redes-sociales/2',
      status: 409, ok: false,
      body: '{\n  "ok": false,\n  "error": {\n    "codigo": "DUPLICADO",\n    "mensaje": "No se puede eliminar la red social 2 porque tiene perfiles sociales asociados. Perfiles asociados: 1."\n  }\n}'
    },
    {
      verb: 'DELETE', label: 'Borrado en cascada', path: '/api/usuarios/7',
      curl: 'curl -s -X DELETE http://localhost:3000/api/usuarios/7',
      status: 200, ok: true,
      body: '{\n  "ok": true,\n  "mensaje": "Usuario eliminado correctamente.",\n  "datos": {\n    "id": 7,\n    "nombreCompleto": "Ada Lovelace",\n    "perfilesEliminados": 1,\n    "telefonosEliminados": 2\n  }\n}'
    }
  ];

  /** Panel de colección: la variable y la lista de peticiones. */
  function Collection() {
    var lista = el('div', { class: 'req-list' });
    PETICIONES.forEach(function (p) {
      lista.appendChild(el('div', { class: 'req' },
        el('span', { class: 'verb ' + p.verb.toLowerCase(), text: p.verb }),
        el('span', { class: 'lbl', text: p.label }),
        el('span', { class: 'pth', text: '{{base_url}}' + p.path })
      ));
    });

    return el('div', { class: 'collection' },
      el('div', { class: 'coll-head' }, 'variable  ', el('b', { text: '{{base_url}}' }), '  =  http://localhost:3000'),
      lista
    );
  }

  /** Probador interactivo: elige una petición y "envíala". */
  function Tester() {
    var sel = 0;

    var lista = el('div', { class: 'req-list', role: 'listbox', tabIndex: 0, 'aria-label': 'Peticiones de ejemplo' });
    var panelCurl = el('div', {});
    var panelResp = el('div', {});
    var botones = [];

    function pintarSeleccion() {
      botones.forEach(function (b, i) { b.setAttribute('aria-selected', i === sel ? 'true' : 'false'); });

      var p = PETICIONES[sel];
      panelCurl.textContent = '';
      panelCurl.appendChild(Terminal([{ code: p.curl }], 'probador'));
      panelResp.textContent = '';
      panelResp.appendChild(el('div', { class: 'term-label', text: 'Pulsa Enviar para ver la respuesta' }));
    }

    PETICIONES.forEach(function (p, i) {
      var b = el('button', {
        type: 'button', class: 'req', role: 'option', 'aria-selected': 'false',
        onclick: function () { sel = i; pintarSeleccion(); }
      },
        el('span', { class: 'verb ' + p.verb.toLowerCase(), text: p.verb }),
        el('span', { class: 'lbl', text: p.label }),
        el('span', { class: 'pth', text: p.path })
      );
      botones.push(b);
      lista.appendChild(b);
    });

    lista.addEventListener('keydown', function (ev) {
      if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') return;
      ev.preventDefault();
      ev.stopPropagation();
      sel = (sel + (ev.key === 'ArrowDown' ? 1 : -1) + PETICIONES.length) % PETICIONES.length;
      pintarSeleccion();
    });

    var btnEnviar = el('button', { class: 'btn btn-primary', type: 'button' }, icon('play'), 'Enviar');

    btnEnviar.addEventListener('click', function () {
      var p = PETICIONES[sel];
      btnEnviar.disabled = true;
      btnEnviar.textContent = 'Enviando…';

      var viaje = (window.Scene && window.Scene.ready)
        ? window.Scene.send({ verb: p.verb, ok: p.ok })
        : Promise.resolve();

      viaje.then(function () {
        var pastilla = el('span', {
          class: 'pill ' + (p.ok ? 'ok' : 'err') + ' pulse',
          text: 'HTTP ' + p.status
        });
        panelResp.textContent = '';
        panelResp.appendChild(el('div', { class: 'term-label' }, 'Respuesta  ', pastilla));
        panelResp.appendChild(el('div', { class: 'output on-dark' },
          el('div', { class: 'term-body', tabIndex: 0, 'aria-label': 'Respuesta JSON' },
            el('pre', { style: 'margin:0;white-space:pre-wrap;', html: resaltarJSON(p.body) })
          )
        ));
        btnEnviar.disabled = false;
        btnEnviar.textContent = '';
        btnEnviar.appendChild(icon('play'));
        btnEnviar.appendChild(document.createTextNode('Enviar'));
      });
    });

    pintarSeleccion();

    var caja = el('div', { class: 'tester' },
      el('div', { class: 'coll-head' }, 'Elige con ↑ ↓ y pulsa Enviar'),
      lista,
      el('div', { class: 'tester-run' }, panelCurl, btnEnviar, panelResp)
    );

    // app.js lo usa para reiniciar el botón al cambiar de diapositiva.
    caja._reset = function () {
      btnEnviar.disabled = false;
      pintarSeleccion();
    };

    return caja;
  }

  function resaltarJSON(txt) {
    try { return hljs.highlight(txt, { language: 'json', ignoreIllegals: true }).value; }
    catch (e) { return txt.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  }

  // =====================================================================
  // CONSTRUCCIÓN DE UNA DIAPOSITIVA
  // =====================================================================

  function construirVisual(s) {
    var v = s.visual || {};
    var nodo = null;

    if (v.type === 'editor') nodo = Editor(v);
    else if (v.type === 'terminal') nodo = Terminal(v.commands || s.commands || [], v.title);
    else if (v.type === 'output') nodo = Output(v);
    else if (v.type === 'explorer') nodo = Explorer(v);
    else if (v.type === 'architecture') nodo = Architecture();
    else if (v.type === 'collection') nodo = Collection();
    else if (v.type === 'tester') nodo = Tester();
    else if (v.type === 'celebrate') nodo = el('div', { class: 'celebrate-slot', 'data-bit-slot': '' });

    var envoltura = el('div', { class: 'col-visual' });
    if (nodo) envoltura.appendChild(nodo);
    if (v.caption) envoltura.appendChild(el('div', { class: 'caption', text: v.caption }));

    // Algunas diapositivas añaden una consola debajo del visual principal.
    if (s.output && v.type !== 'output') envoltura.appendChild(Output(s.output));

    return envoltura;
  }

  function construirTexto(s, indice) {
    var col = el('div', { class: 'col-text' });
    var i = 0;
    function add(n) {
      if (!n) return;
      n.classList.add('reveal');
      n.style.setProperty('--i', i++);
      col.appendChild(n);
    }

    // ---------- PORTADA ----------
    if (s.kind === 'cover') {
      add(el('p', { class: 'kicker', text: s.kicker }));
      add(el('h1', { class: 'cover-title' }, s.title, el('span', { class: 'mono', text: s.titleAccent })));
      (s.lead || []).forEach(function (p) { add(el('p', { class: 'lead', html: p })); });
      add(el('div', { class: 'chips' }, (s.chips || []).map(function (c) {
        return el('span', { class: 'chip', text: c });
      })));
      add(el('div', { class: 'cta-row' },
        el('button', {
          class: 'btn btn-primary btn-lg', type: 'button',
          onclick: function () { ir(indice + 1); }
        }, s.cta.label, icon('right')),
        el('span', { class: 'cta-hint', text: s.cta.hint })
      ));
      add(el('div', { class: 'bit-home', 'data-bit-slot': '' }));
      return col;
    }

    // ---------- ENCABEZADO ----------
    var paso = s.step !== undefined ? 'Paso ' + String(s.step).padStart(2, '0') : '';
    add(el('p', { class: 'eyebrow' },
      paso,
      s.layer ? el('span', { class: 'layer', text: (paso ? ' / ' : '') + s.layer }) : null
    ));
    add(el('h2', { text: s.title }));

    if (s.part) {
      var puntos = el('div', { class: 'parts-dots' });
      for (var k = 1; k <= s.part.of; k++) {
        puntos.appendChild(el('span', {
          class: 'pdot ' + (k < s.part.n ? 'is-done' : k === s.part.n ? 'is-now' : '')
        }));
      }
      add(el('div', { class: 'parts' },
        puntos,
        el('span', { class: 'parts-label', text: 'Parte ' + s.part.n + ' de ' + s.part.of + (s.part.label ? ' · ' + s.part.label : '') })
      ));
    }

    if (s.file) add(el('span', { class: 'file-chip' }, icon('file'), el('span', { text: s.file })));

    (s.lead || []).forEach(function (p) { add(el('p', { class: 'lead', html: p })); });

    // ---------- BLOQUES ----------
    if (s.table) {
      var tabla = el('table', { class: 'data' });
      tabla.appendChild(el('tr', {}, s.table.head.map(function (h) { return el('th', { text: h }); })));
      s.table.rows.forEach(function (r) {
        tabla.appendChild(el('tr', {}, r.map(function (c) { return el('td', { html: c }); })));
      });
      add(el('div', { class: 'block' }, tabla));
    }

    if (s.list) {
      add(el('ul', { class: 'bullets block' }, s.list.map(function (t) {
        return el('li', { class: 'li', html: t });
      })));
    }

    if (s.ordered) {
      add(el('ol', { class: 'ordered block' }, s.ordered.map(function (t) {
        return el('li', { class: 'li', html: t });
      })));
    }

    if (s.checklist) {
      add(el('div', { class: 'checklist block' }, s.checklist.map(function (c) {
        return el('div', { class: 'check-card' },
          el('div', { class: 'cc-name', text: c.name }),
          el('div', { class: 'cc-detail', text: c.detail }),
          c.command ? el('div', { class: 'cc-cmd', text: c.command }) : null
        );
      })));
    }

    if (s.packages) add(el('div', { class: 'block' }, Packages(s.packages)));

    if (s.endpoints) {
      var te = el('table', { class: 'endpoints' });
      s.endpoints.forEach(function (e) {
        te.appendChild(el('tr', {},
          el('td', {}, el('span', { class: 'verb ' + e.verb.toLowerCase(), text: e.verb })),
          el('td', { class: 'ep-path', text: e.path }),
          el('td', { class: 'ep-desc', text: e.desc })
        ));
      });
      add(el('div', { class: 'block' }, te));
    }

    if (s.commands && (!s.visual || s.visual.type !== 'terminal')) {
      add(el('div', { class: 'block on-dark' }, Terminal(s.commands, 'persona-api')));
    }

    if (s.exercises) {
      s.exercises.forEach(function (g) {
        add(el('div', { class: 'ex-group' },
          el('div', { class: 'ex-level', text: g.level }),
          el('ol', {}, g.items.map(function (t) { return el('li', { text: t }); }))
        ));
      });
    }

    return col;
  }

  function construirSlide(s, indice) {
    var sec = el('section', {
      class: 'slide',
      id: 'slide-' + s.id,
      hidden: true,
      'aria-roledescription': 'diapositiva',
      'aria-label': (s.step !== undefined ? 'Paso ' + s.step + ': ' : '') + s.title
    });
    sec.appendChild(construirTexto(s, indice));
    sec.appendChild(construirVisual(s));
    return sec;
  }

  // =====================================================================
  // ESTADO Y REFERENCIAS
  // =====================================================================
  var $ = function (id) { return document.getElementById(id); };
  var stage = $('stage');
  var nodos = [];
  var actual = -1;
  var nodosPipeline = {};

  // =====================================================================
  // TIRA DEL RECORRIDO
  // =====================================================================
  function montarPipeline() {
    var cont = $('pipeline');
    PIPELINE.main.forEach(function (n) {
      var d = el('div', { class: 'pnode', 'data-node': n.id, title: n.hint, text: n.label });
      nodosPipeline[n.id] = d;
      cont.appendChild(d);
    });
    PIPELINE.side.forEach(function (n) {
      var d = el('div', { class: 'pnode is-side', 'data-node': n.id, title: n.hint, text: n.label });
      nodosPipeline[n.id] = d;
      cont.appendChild(d);
    });
  }

  // =====================================================================
  // ÍNDICE
  // =====================================================================
  var itemsIndice = [];

  function montarIndice() {
    var cuerpo = $('index-body');

    PHASES.forEach(function (ph) {
      var deFase = SLIDES.filter(function (s) { return s.phase === ph.id; });
      if (!deFase.length) return;

      cuerpo.appendChild(el('div', { class: 'index-phase', text: ph.label }));

      deFase.forEach(function (s) {
        var idx = SLIDES.indexOf(s);
        // En las sub-partes solo la primera muestra el número.
        var oculto = s.part && s.part.n > 1;
        var item = el('button', {
          class: 'index-item', type: 'button',
          onclick: function () { ir(idx); cerrarIndice(); }
        },
          el('span', { class: 'n' + (oculto ? ' hidden' : ''), text: s.step !== undefined ? String(s.step).padStart(2, '0') : '—' }),
          el('span', { text: s.title }),
          s.part ? el('span', { class: 'pn', text: s.part.n + '/' + s.part.of }) : null
        );
        itemsIndice[idx] = item;
        cuerpo.appendChild(item);
      });
    });
  }

  var indiceAbierto = false;

  function abrirIndice() {
    indiceAbierto = true;
    $('index').hidden = false;
    var destino = itemsIndice[actual] || itemsIndice.find(Boolean);
    if (destino) destino.focus();
  }

  function cerrarIndice() {
    if (!indiceAbierto) return;
    indiceAbierto = false;
    $('index').hidden = true;
    $('btn-index').focus();
  }

  // Atrapa el foco dentro del panel mientras está abierto.
  $('index').addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { ev.preventDefault(); cerrarIndice(); return; }
    if (ev.key !== 'Tab') return;

    var focos = $('index').querySelectorAll('button');
    if (!focos.length) return;
    var primero = focos[0];
    var ultimo = focos[focos.length - 1];

    if (ev.shiftKey && document.activeElement === primero) { ev.preventDefault(); ultimo.focus(); }
    else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primero.focus(); }
  });

  $('index').addEventListener('click', function (ev) {
    if (ev.target === $('index')) cerrarIndice();
  });

  // =====================================================================
  // NAVEGACIÓN
  // =====================================================================

  function ir(indice, direccion) {
    if (indice < 0 || indice >= SLIDES.length || indice === actual) return;

    var dir = direccion !== undefined ? direccion : (indice > actual ? 1 : -1);
    var s = SLIDES[indice];

    // 1. Ocultar la anterior y reiniciar el probador si lo tenía.
    if (actual >= 0 && nodos[actual]) {
      var testerPrevio = nodos[actual].querySelector('.tester');
      if (testerPrevio && testerPrevio._reset) testerPrevio._reset();
      nodos[actual].hidden = true;
    }

    actual = indice;

    var nodo = nodos[indice];
    nodo.hidden = false;
    nodo.style.setProperty('--dir', dir);

    // Reiniciamos la animación de entrada.
    nodo.querySelectorAll('.reveal').forEach(function (r) {
      r.style.animation = 'none';
      void r.offsetWidth;                 // fuerza un reflow
      r.style.animation = '';
    });

    // 2. Migas, contador, progreso y botones.
    pintarMigas(s);
    $('counter').textContent = s.kind === 'cover'
      ? 'Portada'
      : (s.step !== undefined ? 'Paso ' + String(s.step).padStart(2, '0') + ' · ' : '') + (indice + 1) + '/' + SLIDES.length;
    $('progress-bar').style.width = (indice / Math.max(1, SLIDES.length - 1) * 100) + '%';
    $('btn-prev').disabled = indice === 0;
    $('btn-next').disabled = indice === SLIDES.length - 1;

    // 3. Elemento actual del índice.
    itemsIndice.forEach(function (it, k) {
      if (!it) return;
      if (k === indice) it.setAttribute('aria-current', 'step');
      else it.removeAttribute('aria-current');
    });

    // 4. Nodos encendidos de la tira (respaldo sin WebGL).
    var encendidos = (s.flow && s.flow.lit) || [];
    Object.keys(nodosPipeline).forEach(function (id) {
      nodosPipeline[id].classList.toggle('is-lit', encendidos.indexOf(id) > -1);
    });

    // 5. Burbuja del narrador.
    var b = s.bubble || {};
    $('bubble-title').textContent = b.title || 'Punto clave';
    $('bubble-text').textContent = b.text || '';
    var burbuja = $('bubble');
    burbuja.classList.remove('pop');
    void burbuja.offsetWidth;
    burbuja.classList.add('pop');

    // 6. Mascota: si la diapositiva tiene su propio hueco, Bit vuela allí
    //    y el hueco del pie se colapsa.
    //
    //    SOLO con WebGL. Sin él, Bit es el SVG de respaldo que vive
    //    dentro del pie: si colapsáramos el hueco, desaparecería.
    var hayWebgl = !document.documentElement.classList.contains('no-webgl');
    var hueco = nodo.querySelector('[data-bit-slot]');
    $('bit-slot').classList.toggle('is-bit-away', hayWebgl && !!hueco);

    // 7. Escena.
    if (window.Scene && window.Scene.ready) {
      window.Scene.setSlide({
        slideEl: nodo,
        slot: hueco || $('bit-slot'),
        flow: s.flow || { lit: [], mode: 'idle' },
        mood: s.mood || 'talk',
        ripple: true
      });
      var palabras = (b.text || '').split(/\s+/).length;
      window.Scene.talk(Math.min(5200, 600 + palabras * 150));
    }

    // 8. Enlace profundo. En try/catch: file:// puede bloquearlo.
    try {
      window.history.replaceState(null, '', '#' + s.id);
    } catch (e) { /* sin historial disponible */ }
  }

  function pintarMigas(s) {
    var c = $('crumbs');
    c.textContent = '';
    var ruta = s.file || s.layer || '';
    if (!ruta) return;

    ruta.split('/').filter(Boolean).forEach(function (p, i, arr) {
      if (i) c.appendChild(el('span', { class: 'sep', text: '/' }));
      c.appendChild(el('span', { class: i === arr.length - 1 ? 'leaf' : '', text: p }));
    });
  }

  var siguiente = function () { ir(actual + 1, 1); };
  var anterior = function () { ir(actual - 1, -1); };

  // =====================================================================
  // TECLADO
  // =====================================================================

  /** No secuestramos las teclas dentro de paneles desplazables ni pestañas. */
  function enPanel(destino) {
    if (!destino || !destino.closest) return false;
    return !!destino.closest('.ed-body, .term-body, .tree-wrap, [role="tablist"], [role="listbox"]');
  }

  document.addEventListener('keydown', function (ev) {
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;

    if (ev.key === 'Escape' && indiceAbierto) { ev.preventDefault(); cerrarIndice(); return; }
    if (indiceAbierto) return;

    if (ev.key === 'i' || ev.key === 'I') {
      if (enPanel(ev.target)) return;
      ev.preventDefault(); abrirIndice(); return;
    }

    var enFoco = enPanel(ev.target);
    var esBoton = ev.target && ev.target.tagName === 'BUTTON';

    switch (ev.key) {
      case 'ArrowRight':
      case 'PageDown':
        if (enFoco) return;
        ev.preventDefault(); siguiente(); break;

      case 'ArrowLeft':
      case 'PageUp':
        if (enFoco) return;
        ev.preventDefault(); anterior(); break;

      case ' ':
        // El espacio activa el botón enfocado, no avanza.
        if (enFoco || esBoton) return;
        ev.preventDefault();
        if (ev.shiftKey) anterior(); else siguiente();
        break;

      case 'Home':
        if (enFoco) return;
        ev.preventDefault(); ir(0, -1); break;

      case 'End':
        if (enFoco) return;
        ev.preventDefault(); ir(SLIDES.length - 1, 1); break;
    }
  });

  // =====================================================================
  // GESTOS TÁCTILES
  // =====================================================================
  var tX = 0, tY = 0, tActivo = false;

  stage.addEventListener('pointerdown', function (ev) {
    if (ev.pointerType === 'mouse') return;          // solo dedo o lápiz
    if (enPanel(ev.target)) return;
    tX = ev.clientX; tY = ev.clientY; tActivo = true;
  }, { passive: true });

  stage.addEventListener('pointerup', function (ev) {
    if (!tActivo) return;
    tActivo = false;
    var dx = ev.clientX - tX;
    var dy = ev.clientY - tY;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) siguiente(); else anterior();
    }
  }, { passive: true });

  // =====================================================================
  // TEMA
  // =====================================================================
  function temaGuardado() {
    try { return window.localStorage.getItem(CLAVE_TEMA); }
    catch (e) { return null; }     // modo incógnito o almacenamiento bloqueado
  }

  function guardarTema(v) {
    try { window.localStorage.setItem(CLAVE_TEMA, v); }
    catch (e) { /* no es crítico perder la preferencia */ }
  }

  function temaEfectivo() {
    var g = temaGuardado();
    if (g === 'light' || g === 'dark') return g;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function pintarIconoTema() {
    var b = $('btn-theme');
    b.textContent = '';
    b.appendChild(icon(temaEfectivo() === 'dark' ? 'sun' : 'moon'));
  }

  $('btn-theme').addEventListener('click', function () {
    var nuevo = temaEfectivo() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nuevo);
    guardarTema(nuevo);
    pintarIconoTema();
  });

  // =====================================================================
  // ARRANQUE
  // =====================================================================
  function iniciar() {
    // Tema: por defecto sigue al sistema.
    var g = temaGuardado();
    if (g === 'light' || g === 'dark') document.documentElement.setAttribute('data-theme', g);
    pintarIconoTema();

    // Iconos de los botones.
    $('btn-index').appendChild(icon('list'));
    $('btn-close-index').appendChild(icon('close'));
    $('btn-prev').prepend(icon('left'));
    $('btn-next').appendChild(icon('right'));

    montarPipeline();

    // Diapositivas.
    SLIDES.forEach(function (s, i) {
      var n = construirSlide(s, i);
      nodos.push(n);
      stage.appendChild(n);
    });

    montarIndice();

    $('btn-prev').addEventListener('click', anterior);
    $('btn-next').addEventListener('click', siguiente);
    $('btn-index').addEventListener('click', abrirIndice);
    $('btn-close-index').addEventListener('click', cerrarIndice);
    $('bit-hit').addEventListener('click', function () {
      if (window.Scene && window.Scene.ready) window.Scene.poke();
    });

    // Escena 3D. Si falla, marcamos el respaldo sin WebGL.
    var ok = false;
    if (window.Scene) {
      ok = window.Scene.init({
        back: $('scene-back'),
        front: $('scene-front'),
        stage: stage,
        pipeline: $('pipeline')
      });
    }
    if (!ok) document.documentElement.classList.add('no-webgl');

    // Enlace profundo: leemos el hash al cargar.
    var destino = 0;
    try {
      var hash = window.location.hash.slice(1);
      var encontrado = SLIDES.findIndex(function (s) { return s.id === hash; });
      if (encontrado > -1) destino = encontrado;
    } catch (e) { /* sin hash */ }

    ir(destino, 1);

    // Cambiar el hash a mano, o usar el botón Atrás del navegador, NO
    // recarga la página. Sin este oyente, un enlace profundo escrito
    // sobre la marcha no haría nada.
    //
    // Nuestro propio history.replaceState() no dispara 'hashchange',
    // así que no hay riesgo de bucle.
    window.addEventListener('hashchange', function () {
      var h = window.location.hash.slice(1);
      var i = SLIDES.findIndex(function (s) { return s.id === h; });
      if (i > -1 && i !== actual) ir(i);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
