/**
 * js/scene.js  ·  Motor three.js  (expone window.Scene)
 * ---------------------------------------------------------------------
 * Dibuja SOLO movimiento: el campo de puntos del fondo, las conexiones
 * del diagrama, los paquetes que viajan y la mascota Bit.
 * TODO el texto vive en el DOM, nunca aquí.
 *
 * IDEA CENTRAL: una cámara ortográfica en PÍXELES CSS
 *   left 0 · right ancho · top 0 · bottom -alto
 * Así las coordenadas de getBoundingClientRect() se usan tal cual
 * (negando la y), y los dibujos quedan pegados a los elementos reales.
 */
/* global window, document, THREE */
(function () {
  'use strict';

  var API = { ready: false };
  window.Scene = API;

  if (typeof THREE === 'undefined') return;   // app.js activará .no-webgl

  // ---------------------------------------------------------------------
  // Estado
  // ---------------------------------------------------------------------
  var rBack, rFront;                 // los dos renderizadores
  var camara;
  var backFull, frontFull, backStage, frontStage;
  var elBack, elFront, elStage, elPipeline;

  var W = 0, H = 0;
  var reloj = null;
  var tiempo = 0;
  var puntero = { x: -9999, y: -9999 };

  var reduceMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COL = {};                      // colores leídos de los tokens CSS

  // ---------------------------------------------------------------------
  // Colores desde los tokens CSS
  // ---------------------------------------------------------------------
  function leerColores() {
    var cs = getComputedStyle(document.documentElement);
    function c(nombre, respaldo) {
      var v = cs.getPropertyValue(nombre).trim();
      try { return new THREE.Color(v || respaldo); }
      catch (e) { return new THREE.Color(respaldo); }
    }
    COL.dot = c('--bg-dot', '#c3c9d4');
    COL.accent = c('--accent', '#0b5fff');
    COL.accentTint = c('--accent-tint', '#e6eeff');
    COL.line = c('--line-strong', '#c9ced7');
    COL.surface = c('--surface', '#ffffff');
    COL.success = c('--success', '#17924d');
    COL.danger = c('--danger', '#dc2f35');
    COL.botBody = c('--bot-body', '#ffffff');
    COL.botEdge = c('--bot-edge', '#c5ccd8');
    COL.botShade = c('--bot-shade', '#d9dfe8');
    COL.botScreen = c('--bot-screen', '#0d1321');
    COL.botEye = c('--bot-eye', '#6ee7ff');
    COL.botCheek = c('--bot-cheek', '#ff8fb3');
    COL.botShadow = c('--bot-shadow', '#0a0c10');
    COL.get = c('--m-get', '#1f6fe0');
    COL.post = c('--m-post', '#17924d');
    COL.put = c('--m-put', '#b86200');
    COL.del = c('--m-delete', '#d02a30');
  }

  /** Aplica los colores nuevos a todos los materiales ya creados. */
  function repintar() {
    leerColores();
    if (campoPuntos) {
      campoPuntos.material.uniforms.uColor.value.copy(COL.dot);
      campoPuntos.material.uniforms.uAccent.value.copy(COL.accent);
    }
    grafos.forEach(function (g) { g.repintar(); });
    if (bit) bit.repintar();
  }

  // ---------------------------------------------------------------------
  // Utilidades de geometría
  // ---------------------------------------------------------------------

  /** Rectángulo redondeado como THREE.Shape, en píxeles CSS. */
  function formaRedondeada(w, h, r) {
    r = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    var s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  }

  function mallaPlana(geo, color, opacidad, orden) {
    var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: color, transparent: true, opacity: opacidad === undefined ? 1 : opacidad, depthTest: false
    }));
    m.renderOrder = orden || 0;
    return m;
  }

  /**
   * Convierte una lista de puntos en una tira de triángulos con grosor
   * real en píxeles, más el atributo de distancia acumulada que usa el
   * shader de guiones.
   */
  function geometriaTrazo(puntos, grosor) {
    var pos = [], dist = [], idx = [];
    var acumulado = 0;

    for (var i = 0; i < puntos.length; i++) {
      var p = puntos[i];
      var anterior = puntos[i - 1] || p;
      var siguiente = puntos[i + 1] || p;

      var dx = siguiente.x - anterior.x;
      var dy = siguiente.y - anterior.y;
      var largo = Math.hypot(dx, dy) || 1;

      // Normal perpendicular, escalada a medio grosor.
      var nx = -dy / largo * grosor / 2;
      var ny = dx / largo * grosor / 2;

      if (i > 0) acumulado += Math.hypot(p.x - puntos[i - 1].x, p.y - puntos[i - 1].y);

      pos.push(p.x + nx, p.y + ny, 0, p.x - nx, p.y - ny, 0);
      dist.push(acumulado, acumulado);

      if (i < puntos.length - 1) {
        var b = i * 2;
        idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
      }
    }

    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aDist', new THREE.Float32BufferAttribute(dist, 1));
    g.setIndex(idx);
    return g;
  }

  /** Material de guiones: dash 3, gap 4, se desplaza si hay paquete. */
  function materialTrazo(color) {
    return new THREE.ShaderMaterial({
      transparent: true, depthTest: false,
      uniforms: {
        uColor: { value: color.clone() },
        uOpacity: { value: 0.55 },
        uOffset: { value: 0 },
        uDash: { value: 3 },
        uGap: { value: 4 }
      },
      vertexShader:
        'attribute float aDist; varying float vD;' +
        'void main(){ vD = aDist; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader:
        'uniform vec3 uColor; uniform float uOpacity, uOffset, uDash, uGap; varying float vD;' +
        'void main(){' +
        '  float ciclo = uDash + uGap;' +
        '  float p = mod(vD + uOffset, ciclo);' +
        '  if (p > uDash) discard;' +
        '  gl_FragColor = vec4(uColor, uOpacity);' +
        '}'
    });
  }

  /** Material de trazo continuo (sin guiones), para los contornos. */
  function materialContorno(color) {
    return new THREE.MeshBasicMaterial({
      color: color.clone(), transparent: true, opacity: 0.4, depthTest: false
    });
  }

  /**
   * Contorno de un rectángulo redondeado como tira de triángulos.
   *
   * OJO: THREE.ShapeGeometry rellena la forma. Para dibujar SOLO el
   * borde hay que recorrer el perímetro y construir un trazo con
   * grosor real, que es lo que hace esta función.
   */
  function geometriaContorno(forma, grosor) {
    var pts = forma.getPoints(64).map(function (p) { return { x: p.x, y: p.y }; });
    pts.push(pts[0]);                      // cerramos el recorrido
    return geometriaTrazo(pts, grosor);
  }

  /** Textura de resplandor radial, generada en un canvas (sin archivos). */
  var texGlow = null;
  function glowTexture() {
    if (texGlow) return texGlow;
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var g = c.getContext('2d');
    var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.35)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    texGlow = new THREE.CanvasTexture(c);
    return texGlow;
  }

  // ---------------------------------------------------------------------
  // Conversión DOM → coordenadas de la escena
  // ---------------------------------------------------------------------
  function rectDe(nodo) {
    var r = nodo.getBoundingClientRect();
    return {
      x: r.left + r.width / 2,
      y: -(r.top + r.height / 2),      // la y se niega
      w: r.width,
      h: r.height,
      left: r.left, right: r.right,
      top: -r.top, bottom: -r.bottom,
      radio: parseFloat(getComputedStyle(nodo).borderRadius) || 8
    };
  }

  // ---------------------------------------------------------------------
  // Inicialización
  // ---------------------------------------------------------------------
  function crearRenderer(canvas) {
    var r = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    r.autoClear = false;
    r.setClearColor(0x000000, 0);
    return r;
  }

  function redimensionar() {
    W = elBack.clientWidth || window.innerWidth;
    H = elBack.clientHeight || window.innerHeight;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    [rBack, rFront].forEach(function (r) {
      r.setPixelRatio(dpr);
      r.setSize(W, H, false);
    });

    camara.left = 0; camara.right = W;
    camara.top = 0; camara.bottom = -H;
    camara.updateProjectionMatrix();

    if (campoPuntos) construirCampo();
  }

  API.init = function (refs) {
    try {
      elBack = refs.back; elFront = refs.front;
      elStage = refs.stage; elPipeline = refs.pipeline;

      if (THREE.ColorManagement) THREE.ColorManagement.enabled = false;

      rBack = crearRenderer(elBack);
      rFront = crearRenderer(elFront);

      // Sin conversión de espacio de color a la salida: los valores de
      // los tokens CSS se dibujan exactamente como están escritos.
      if (THREE.LinearSRGBColorSpace) {
        rBack.outputColorSpace = THREE.LinearSRGBColorSpace;
        rFront.outputColorSpace = THREE.LinearSRGBColorSpace;
      }

      camara = new THREE.OrthographicCamera(0, 1, 0, -1, -1000, 1000);
      camara.position.z = 10;

      backFull = new THREE.Scene();
      frontFull = new THREE.Scene();
      backStage = new THREE.Scene();
      frontStage = new THREE.Scene();

      leerColores();
      redimensionar();

      construirCampo();
      grafoTira = crearGrafo(elPipeline, 'strip', backFull);
      grafos.push(grafoTira);
      bit = crearBit();
      crearConfeti();

      // Reaccionar al cambio de tema y de tamaño.
      new MutationObserver(repintar).observe(document.documentElement, {
        attributes: true, attributeFilter: ['data-theme']
      });
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', repintar);
      window.addEventListener('resize', redimensionar);
      new ResizeObserver(redimensionar).observe(document.body);

      if (!reduceMovimiento) {
        window.addEventListener('pointermove', function (ev) {
          puntero.x = ev.clientX; puntero.y = -ev.clientY;
        }, { passive: true });
        window.addEventListener('pointerdown', function (ev) {
          lanzarOnda(ev.clientX, -ev.clientY);
        }, { passive: true });
      }

      reloj = new THREE.Clock();
      requestAnimationFrame(bucle);

      API.ready = true;
      return true;
    } catch (e) {
      if (window.console) window.console.warn('[Scene] WebGL no disponible:', e.message);
      return false;
    }
  };

  // ---------------------------------------------------------------------
  // Bucle principal
  // ---------------------------------------------------------------------
  function bucle() {
    requestAnimationFrame(bucle);
    if (document.hidden) return;              // no gastamos CPU en segundo plano

    var dt = Math.min(reloj.getDelta(), 0.05);
    tiempo += dt;

    actualizarCampo(dt);
    grafos.forEach(function (g) { g.actualizar(dt); });
    actualizarDirector(dt);
    if (bit) bit.actualizar(dt);
    actualizarConfeti(dt);

    // ---- Dibujo ----
    rBack.clear();
    rBack.setScissorTest(false);
    rBack.setViewport(0, 0, W, H);
    rBack.render(backFull, camara);

    rFront.clear();
    rFront.setScissorTest(false);
    rFront.setViewport(0, 0, W, H);
    rFront.render(frontFull, camara);

    // Las escenas de "escenario" se recortan al área de la diapositiva.
    if (elStage) {
      var r = elStage.getBoundingClientRect();
      var sx = r.left;
      var sy = H - r.bottom;              // WebGL cuenta la y desde abajo
      if (r.width > 0 && r.height > 0) {
        [[rBack, backStage], [rFront, frontStage]].forEach(function (par) {
          par[0].setScissorTest(true);
          par[0].setScissor(sx, sy, r.width, r.height);
          par[0].setViewport(0, 0, W, H);
          par[0].render(par[1], camara);
          par[0].setScissorTest(false);
        });
      }
    }
  }

  // =====================================================================
  // CAMPO DE PUNTOS  (lienzo de fondo)
  // =====================================================================
  var campoPuntos = null;
  var inicioCampo = 0;
  var ondas = [];          // ondas de clic / cambio de diapositiva

  function construirCampo() {
    if (campoPuntos) {
      backFull.remove(campoPuntos);
      campoPuntos.geometry.dispose();
    }

    var paso = W < 700 ? 22 : 28;
    var pos = [], semilla = [];

    for (var y = paso / 2; y < H; y += paso) {
      for (var x = paso / 2; x < W; x += paso) {
        pos.push(x, -y, 0);
        semilla.push(Math.random() * 6.283);
      }
    }

    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(semilla, 1));

    var mat = new THREE.ShaderMaterial({
      transparent: true, depthTest: false,
      uniforms: {
        uColor: { value: COL.dot.clone() },
        uAccent: { value: COL.accent.clone() },
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(-9999, -9999) },
        uReveal: { value: 0 },            // 0→1 en 1,6 s al entrar
        uCenter: { value: new THREE.Vector2(W / 2, -H / 2) },
        uRadio: { value: Math.hypot(W, H) },
        uDpr: { value: Math.min(window.devicePixelRatio || 1, 2) },
        uRipple: { value: new THREE.Vector4(0, 0, -1, 0) },  // x, y, radio, fuerza
        uQuieto: { value: reduceMovimiento ? 1 : 0 }
      },
      vertexShader: [
        'attribute float aSeed;',
        'uniform float uTime, uReveal, uRadio, uDpr, uQuieto;',
        'uniform vec2 uPointer, uCenter;',
        'uniform vec4 uRipple;',
        'varying float vAlpha, vHeat;',
        'void main(){',
        '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
        '  gl_Position = projectionMatrix * mv;',
        // Latido suave e individual por punto.
        '  float latido = uQuieto > 0.5 ? 0.6 : 0.55 + 0.45 * sin(uTime * 0.9 + aSeed);',
        // Aparición radial desde el centro, en 1,6 s.
        '  float d0 = distance(position.xy, uCenter) / uRadio;',
        '  float revelado = smoothstep(d0 - 0.12, d0 + 0.12, uReveal);',
        // Resplandor que sigue al puntero (radio 150 px).
        '  float dp = distance(position.xy, uPointer);',
        '  float hover = 1.0 - smoothstep(0.0, 150.0, dp);',
        // Anillo de onda expansiva.
        '  float dr = abs(distance(position.xy, uRipple.xy) - uRipple.z);',
        '  float onda = uRipple.w * (1.0 - smoothstep(0.0, 42.0, dr));',
        '  vHeat = clamp(hover * 0.9 + onda, 0.0, 1.0);',
        '  vAlpha = revelado * (0.30 * latido + 0.55 * vHeat);',
        '  gl_PointSize = (1.9 + 2.3 * vHeat) * uDpr;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor, uAccent;',
        'varying float vAlpha, vHeat;',
        'void main(){',
        // Punto redondo con borde suave.
        '  float d = length(gl_PointCoord - vec2(0.5));',
        '  if (d > 0.5) discard;',
        '  float borde = 1.0 - smoothstep(0.34, 0.5, d);',
        '  vec3 col = mix(uColor, uAccent, vHeat);',
        '  gl_FragColor = vec4(col, vAlpha * borde);',
        '}'
      ].join('\n')
    });

    campoPuntos = new THREE.Points(g, mat);
    campoPuntos.renderOrder = 0;
    backFull.add(campoPuntos);
    inicioCampo = tiempo;
  }

  function lanzarOnda(x, y) {
    if (reduceMovimiento) return;
    ondas.push({ x: x, y: y, r: 0, vida: 1 });
    if (ondas.length > 3) ondas.shift();
  }

  function actualizarCampo(dt) {
    if (!campoPuntos) return;
    var u = campoPuntos.material.uniforms;

    u.uTime.value = tiempo;
    u.uReveal.value = Math.min(1, (tiempo - inicioCampo) / 1.6);
    u.uPointer.value.set(
      reduceMovimiento ? -9999 : puntero.x,
      reduceMovimiento ? -9999 : puntero.y
    );

    // Solo animamos la onda más reciente.
    var activa = ondas[ondas.length - 1];
    if (activa) {
      activa.r += 1100 * dt;             // ~1100 px/s
      activa.vida -= dt * 0.75;
      if (activa.vida <= 0) ondas.pop();
      u.uRipple.value.set(activa.x, activa.y, activa.r, Math.max(0, activa.vida));
    } else {
      u.uRipple.value.set(0, 0, -1, 0);
    }
  }

  // =====================================================================
  // GRAFO DE FLUJO
  // =====================================================================
  var grafos = [];
  var grafoTira = null;

  /**
   * Lee los [data-node] de un contenedor cada cuadro y dibuja relleno,
   * anillo, halo y enlaces. La geometría solo se reconstruye cuando
   * cambian los rectángulos (se compara una "firma").
   */
  function crearGrafo(contenedor, disposicion, escena) {
    var grupo = new THREE.Group();
    escena.add(grupo);

    var cajas = {};          // id → { relleno, anillo, halo, rect }
    var trazos = [];
    var firma = '';
    var encendidos = {};
    var dashActivo = false;

    function ids() {
      return Array.prototype.map.call(
        contenedor.querySelectorAll('[data-node]'),
        function (n) { return n.getAttribute('data-node'); }
      );
    }

    function reconstruir() {
      // Limpiamos lo anterior.
      Object.keys(cajas).forEach(function (k) {
        grupo.remove(cajas[k].relleno, cajas[k].anillo, cajas[k].halo);
        cajas[k].relleno.geometry.dispose();
        cajas[k].anillo.geometry.dispose();
      });
      trazos.forEach(function (t) { grupo.remove(t); t.geometry.dispose(); });
      cajas = {}; trazos = [];

      var nodos = contenedor.querySelectorAll('[data-node]');

      Array.prototype.forEach.call(nodos, function (n) {
        var id = n.getAttribute('data-node');
        var r = rectDe(n);

        var forma = formaRedondeada(r.w, r.h, r.radio);

        // Relleno: la forma completa, arranca invisible.
        var relleno = mallaPlana(new THREE.ShapeGeometry(forma), COL.surface.clone(), 0, 1);

        // Contorno: SOLO el borde, con 1,5 px de grosor real.
        var anillo = new THREE.Mesh(geometriaContorno(forma, 1.5), materialContorno(COL.line));
        anillo.renderOrder = 2;

        var halo = new THREE.Sprite(new THREE.SpriteMaterial({
          map: glowTexture(), color: COL.accent.clone(),
          transparent: true, opacity: 0, depthTest: false
        }));
        halo.scale.set(r.w * 1.8, r.h * 3.2, 1);
        halo.renderOrder = 0;

        [relleno, anillo, halo].forEach(function (m) {
          m.position.set(r.x, r.y, 0);
          grupo.add(m);
        });

        cajas[id] = { relleno: relleno, anillo: anillo, halo: halo, rect: r };
      });

      construirEnlaces();
    }

    function construirEnlaces() {
      var principales = (disposicion === 'strip' ? window.PIPELINE.main : window.ARCHITECTURE.main)
        .map(function (m) { return m.id; })
        .filter(function (id) { return cajas[id]; });

      var laterales = (disposicion === 'strip' ? window.PIPELINE.side : window.ARCHITECTURE.side)
        .filter(function (s) { return cajas[s.id]; });

      // --- Enlaces entre nodos principales consecutivos ---
      for (var i = 0; i < principales.length - 1; i++) {
        var a = cajas[principales[i]].rect;
        var b = cajas[principales[i + 1]].rect;
        var pts;

        if (disposicion === 'strip') {
          pts = [{ x: a.x + a.w / 2, y: a.y }, { x: b.x - b.w / 2, y: b.y }];
        } else {
          pts = [{ x: a.x, y: a.y - a.h / 2 }, { x: b.x, y: b.y + b.h / 2 }];
        }
        agregarTrazo(pts);
      }

      // --- Capas transversales ---
      laterales.forEach(function (s) {
        var a = cajas[s.id].rect;
        var destino = cajas[s.link] || cajas[(window.ARCHITECTURE.main[s.row] || {}).id];
        if (!destino) return;
        var b = destino.rect;

        if (disposicion === 'strip') {
          // Línea de "bus" por debajo de la tira, con esquinas de 5 px.
          var yBus = Math.min(a.y, b.y) - Math.max(a.h, b.h) / 2 - 12;
          agregarTrazo(esquinas([
            { x: a.x, y: a.y - a.h / 2 },
            { x: a.x, y: yBus },
            { x: b.x, y: yBus },
            { x: b.x, y: b.y - b.h / 2 }
          ], 5));
        } else {
          // Curva en S hacia el nodo principal de su fila.
          agregarTrazo(curvaS(
            { x: a.x - a.w / 2, y: a.y },
            { x: b.x + b.w / 2, y: b.y }
          ));
        }
      });
    }

    function agregarTrazo(pts) {
      var t = new THREE.Mesh(geometriaTrazo(pts, 1.5), materialTrazo(COL.line));
      t.renderOrder = 0;
      grupo.add(t);
      trazos.push(t);
    }

    /** Redondea las esquinas de una polilínea ortogonal. */
    function esquinas(pts, r) {
      var out = [pts[0]];
      for (var i = 1; i < pts.length - 1; i++) {
        var p = pts[i], a = pts[i - 1], b = pts[i + 1];
        var da = Math.hypot(p.x - a.x, p.y - a.y) || 1;
        var db = Math.hypot(b.x - p.x, b.y - p.y) || 1;
        var ra = Math.min(r, da / 2), rb = Math.min(r, db / 2);
        out.push({ x: p.x + (a.x - p.x) / da * ra, y: p.y + (a.y - p.y) / da * ra });
        out.push({ x: p.x + (b.x - p.x) / db * rb, y: p.y + (b.y - p.y) / db * rb });
      }
      out.push(pts[pts.length - 1]);
      return out;
    }

    /** Curva cúbica en S entre dos puntos, muestreada en 18 tramos. */
    function curvaS(a, b) {
      var c = new THREE.CubicBezierCurve(
        new THREE.Vector2(a.x, a.y),
        new THREE.Vector2(a.x - Math.abs(b.x - a.x) * 0.6, a.y),
        new THREE.Vector2(b.x + Math.abs(b.x - a.x) * 0.6, b.y),
        new THREE.Vector2(b.x, b.y)
      );
      return c.getPoints(18).map(function (p) { return { x: p.x, y: p.y }; });
    }

    return {
      cajas: function () { return cajas; },

      encender: function (lista) {
        encendidos = {};
        (lista || []).forEach(function (id) { encendidos[id] = true; });
      },

      setDash: function (v) { dashActivo = v; },

      repintar: function () { firma = ''; },

      actualizar: function (dt) {
        // ¿Cambió algún rectángulo? Entonces reconstruimos.
        var nueva = ids().join('|') + '#' + Array.prototype.map.call(
          contenedor.querySelectorAll('[data-node]'),
          function (n) {
            var r = n.getBoundingClientRect();
            return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(',');
          }
        ).join(';');

        if (nueva !== firma) { firma = nueva; reconstruir(); }

        // Interpolación de encendido y halo pulsante.
        Object.keys(cajas).forEach(function (id) {
          var c = cajas[id];
          var on = !!encendidos[id];
          var k = Math.min(1, dt * 7);

          c.relleno.material.opacity += ((on ? 1 : 0) - c.relleno.material.opacity) * k;
          c.relleno.material.color.lerp(on ? COL.accentTint : COL.surface, k);
          c.anillo.material.color.lerp(on ? COL.accent : COL.line, k);
          c.anillo.material.opacity += ((on ? 0.9 : 0.4) - c.anillo.material.opacity) * k;

          var pulso = on && !reduceMovimiento ? 0.10 + 0.07 * Math.sin(tiempo * 2.4) : 0;
          c.halo.material.opacity += (pulso - c.halo.material.opacity) * k;
          c.halo.material.color.copy(COL.accent);
        });

        // Guiones en movimiento solo mientras viaja un paquete.
        trazos.forEach(function (t) {
          if (dashActivo && !reduceMovimiento) t.material.uniforms.uOffset.value -= 16 * dt;
          t.material.uniforms.uColor.value.copy(COL.line);
        });
      },

      destellar: function (id) {
        var c = cajas[id];
        if (!c) return;
        c.halo.material.opacity = 0.42;
      }
    };
  }

  // =====================================================================
  // PAQUETES Y DIRECTOR
  // =====================================================================
  var paquete = null;
  var guion = null;           // { hops, i, t, loop, pausa, resolver }
  var modoActual = 'idle';

  function crearPaquete(color) {
    var grupo = new THREE.Group();

    var cabeza = mallaPlana(new THREE.CircleGeometry(4.2, 20), color.clone(), 1, 6);
    var brillo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture(), color: color.clone(), transparent: true, opacity: 0.55, depthTest: false
    }));
    brillo.scale.set(34, 34, 1);
    brillo.renderOrder = 5;

    // Estela: 8 muestras que se desvanecen.
    var estela = [];
    for (var i = 0; i < 8; i++) {
      var p = mallaPlana(new THREE.CircleGeometry(3.4 - i * 0.3, 12), color.clone(), 0.32 - i * 0.035, 4);
      estela.push(p);
      grupo.add(p);
    }

    grupo.add(brillo, cabeza);
    backFull.add(grupo);

    return { grupo: grupo, cabeza: cabeza, brillo: brillo, estela: estela, hist: [] };
  }

  function quitarPaquete() {
    if (!paquete) return;
    backFull.remove(paquete.grupo);
    paquete = null;
  }

  function colorDe(kind, verbo) {
    if (kind === 'error') return COL.danger;
    if (kind === 'response') return COL.success;
    if (verbo === 'POST') return COL.post;
    if (verbo === 'PUT' || verbo === 'PATCH') return COL.put;
    if (verbo === 'DELETE') return COL.del;
    if (verbo === 'GET') return COL.get;
    return COL.accent;
  }

  /** Construye la lista de saltos según el modo de la diapositiva. */
  function guionDeModo(modo, encendidos) {
    var cajas = grafoTira.cajas();
    var orden = window.PIPELINE.main.map(function (m) { return m.id; });
    var vivos = orden.filter(function (id) { return cajas[id] && encendidos.indexOf(id) > -1; });
    if (vivos.length < 2) return null;

    var hops = [];
    var lados = window.PIPELINE.side
      .filter(function (s) { return cajas[s.id] && encendidos.indexOf(s.id) > -1; });

    function tramo(a, b, kind) { hops.push({ from: a, to: b, kind: kind || 'request', dur: 0.34 }); }

    if (modo === 'full') {
      for (var i = 0; i < vivos.length - 1; i++) tramo(vivos[i], vivos[i + 1]);
      for (var j = vivos.length - 1; j > 0; j--) tramo(vivos[j], vivos[j - 1], 'response');
      return { hops: hops, loop: true };
    }

    if (modo === 'error') {
      var hastaServices = vivos.slice(0, Math.max(2, vivos.indexOf('services') + 1 || vivos.length));
      for (var k = 0; k < hastaServices.length - 1; k++) tramo(hastaServices[k], hastaServices[k + 1]);
      var ultimo = hastaServices[hastaServices.length - 1];
      if (cajas.utils && encendidos.indexOf('utils') > -1) {
        tramo(ultimo, 'utils'); tramo('utils', ultimo);
      }
      if (cajas.middleware) { tramo(ultimo, 'middleware', 'error'); ultimo = 'middleware'; }
      tramo(ultimo, vivos[0], 'error');
      return { hops: hops, loop: true };
    }

    // 'request' y 'boot' comparten el viaje de ida y vuelta.
    for (var m = 0; m < vivos.length - 1; m++) {
      tramo(vivos[m], vivos[m + 1]);
      // Excursión a las capas transversales que cuelgan de este nodo.
      lados.forEach(function (s) {
        if (s.link === vivos[m + 1]) { tramo(vivos[m + 1], s.id); tramo(s.id, vivos[m + 1]); }
      });
    }
    for (var n = vivos.length - 1; n > 0; n--) tramo(vivos[n], vivos[n - 1], 'response');

    return { hops: hops, loop: true };
  }

  function iniciarGuion(g, verbo) {
    quitarPaquete();
    if (!g || !g.hops.length) { grafoTira.setDash(false); return; }

    guion = { hops: g.hops, i: 0, t: 0, loop: g.loop, pausa: 0, resolver: g.resolver, verbo: verbo };
    paquete = crearPaquete(colorDe(g.hops[0].kind, verbo));
    grafoTira.setDash(true);
  }

  function actualizarDirector(dt) {
    if (!guion || !paquete) return;

    if (guion.pausa > 0) { guion.pausa -= dt; return; }

    var hop = guion.hops[guion.i];
    var cajas = grafoTira.cajas();
    var a = cajas[hop.from], b = cajas[hop.to];

    if (!a || !b) { guion = null; quitarPaquete(); return; }

    guion.t += dt / hop.dur;
    var t = Math.min(1, guion.t);
    var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;   // easeInOut

    var x = a.rect.x + (b.rect.x - a.rect.x) * e;
    var y = a.rect.y + (b.rect.y - a.rect.y) * e;

    paquete.grupo.position.set(0, 0, 0);
    paquete.cabeza.position.set(x, y, 0);
    paquete.brillo.position.set(x, y, 0);

    // Estela: guardamos las últimas posiciones.
    paquete.hist.unshift({ x: x, y: y });
    if (paquete.hist.length > 8) paquete.hist.pop();
    paquete.estela.forEach(function (p, i) {
      var h = paquete.hist[i];
      if (h) p.position.set(h.x, h.y, 0);
    });

    var col = colorDe(hop.kind, guion.verbo);
    paquete.cabeza.material.color.copy(col);
    paquete.brillo.material.color.copy(col);
    paquete.estela.forEach(function (p) { p.material.color.copy(col); });

    if (t >= 1) {
      grafoTira.destellar(hop.to);
      guion.i++;
      guion.t = 0;
      paquete.hist.length = 0;

      if (guion.i >= guion.hops.length) {
        if (guion.resolver) { var r = guion.resolver; guion = null; quitarPaquete(); grafoTira.setDash(false); r(); return; }
        if (guion.loop && !reduceMovimiento) { guion.i = 0; guion.pausa = 1.4; }
        else { guion = null; quitarPaquete(); grafoTira.setDash(false); }
      }
    }
  }

  // =====================================================================
  // BIT  ·  la mascota
  // ---------------------------------------------------------------------
  // Construida SOLO con rectángulos redondeados y círculos. Vive en el
  // lienzo frontal y sigue a su "hueco" del DOM con suavizado amortiguado.
  // =====================================================================
  var bit = null;

  function crearBit() {
    var raiz = new THREE.Group();
    frontFull.add(raiz);

    // --- Piezas ---
    var sombra = mallaPlana(new THREE.CircleGeometry(16, 24), COL.botShadow.clone(), 0.12, 1);
    sombra.scale.set(1, 0.2, 1);

    var cuerpo = mallaPlana(new THREE.ShapeGeometry(formaRedondeada(30, 26, 9)), COL.botBody.clone(), 1, 2);
    var panza = mallaPlana(new THREE.CircleGeometry(3.2, 16), COL.accent.clone(), 1, 3);

    var brazoI = mallaPlana(new THREE.ShapeGeometry(formaRedondeada(5, 14, 2.5)), COL.botShade.clone(), 1, 2);
    var brazoD = mallaPlana(new THREE.ShapeGeometry(formaRedondeada(5, 14, 2.5)), COL.botShade.clone(), 1, 2);
    var pivoteI = new THREE.Group(); pivoteI.add(brazoI); brazoI.position.y = -7;
    var pivoteD = new THREE.Group(); pivoteD.add(brazoD); brazoD.position.y = -7;

    var orejaI = mallaPlana(new THREE.ShapeGeometry(formaRedondeada(4, 9, 2)), COL.botShade.clone(), 1, 2);
    var orejaD = mallaPlana(new THREE.ShapeGeometry(formaRedondeada(4, 9, 2)), COL.botShade.clone(), 1, 2);

    var cabeza = mallaPlana(new THREE.ShapeGeometry(formaRedondeada(40, 28, 11)), COL.botBody.clone(), 1, 3);
    var pantalla = mallaPlana(new THREE.ShapeGeometry(formaRedondeada(28, 16, 7)), COL.botScreen.clone(), 1, 4);

    var ojoI = mallaPlana(new THREE.ShapeGeometry(formaRedondeada(5, 6, 2.5)), COL.botEye.clone(), 1, 5);
    var ojoD = mallaPlana(new THREE.ShapeGeometry(formaRedondeada(5, 6, 2.5)), COL.botEye.clone(), 1, 5);
    var cachI = mallaPlana(new THREE.CircleGeometry(2.6, 14), COL.botCheek.clone(), 0.75, 5);
    var cachD = mallaPlana(new THREE.CircleGeometry(2.6, 14), COL.botCheek.clone(), 0.75, 5);
    var boca = mallaPlana(new THREE.ShapeGeometry(formaRedondeada(8, 2.2, 1.1)), COL.botEye.clone(), 0.9, 5);

    var antena = mallaPlana(new THREE.ShapeGeometry(formaRedondeada(2, 10, 1)), COL.botEdge.clone(), 1, 2);
    var bulbo = mallaPlana(new THREE.CircleGeometry(4, 18), COL.accent.clone(), 1, 3);
    var bulboGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture(), color: COL.accent.clone(), transparent: true, opacity: 0.5, depthTest: false
    }));
    bulboGlow.scale.set(22, 22, 1);

    // --- Posiciones relativas (el origen es el centro del cuerpo) ---
    sombra.position.set(0, -32, 0);
    cuerpo.position.set(0, -14, 0);
    panza.position.set(0, -14, 0);
    pivoteI.position.set(-17, -8, 0);
    pivoteD.position.set(17, -8, 0);
    orejaI.position.set(-21, 5, 0);
    orejaD.position.set(21, 5, 0);
    cabeza.position.set(0, 5, 0);
    pantalla.position.set(0, 5, 0);
    ojoI.position.set(-6.5, 6, 0);
    ojoD.position.set(6.5, 6, 0);
    cachI.position.set(-13, 0, 0);
    cachD.position.set(13, 0, 0);
    boca.position.set(0, 0, 0);
    antena.position.set(0, 24, 0);
    bulbo.position.set(0, 31, 0);
    bulboGlow.position.set(0, 31, 0);

    var cuerpoGrupo = new THREE.Group();
    [sombra, antena, bulboGlow, bulbo, orejaI, orejaD, pivoteI, pivoteD,
     cuerpo, panza, cabeza, pantalla, ojoI, ojoD, cachI, cachD, boca]
      .forEach(function (m) { cuerpoGrupo.add(m); });
    raiz.add(cuerpoGrupo);

    // --- Estado de la animación ---
    var est = {
      x: W / 2, y: -H / 2, escala: 1,
      destinoX: W / 2, destinoY: -H / 2, destinoEscala: 1,
      parpadeo: 0, proxParpadeo: 2.5,
      hablarHasta: 0,
      vy: 0, saltoY: 0,
      humor: 'talk',
      wobble: 0
    };

    function repintarBit() {
      cuerpo.material.color.copy(COL.botBody);
      cabeza.material.color.copy(COL.botBody);
      pantalla.material.color.copy(COL.botScreen);
      ojoI.material.color.copy(COL.botEye);
      ojoD.material.color.copy(COL.botEye);
      boca.material.color.copy(COL.botEye);
      cachI.material.color.copy(COL.botCheek);
      cachD.material.color.copy(COL.botCheek);
      brazoI.material.color.copy(COL.botShade);
      brazoD.material.color.copy(COL.botShade);
      orejaI.material.color.copy(COL.botShade);
      orejaD.material.color.copy(COL.botShade);
      antena.material.color.copy(COL.botEdge);
      bulbo.material.color.copy(COL.accent);
      bulboGlow.material.color.copy(COL.accent);
      panza.material.color.copy(COL.accent);
      sombra.material.color.copy(COL.botShadow);
    }

    function irA(slot) {
      if (!slot) return;
      var r = slot.getBoundingClientRect();
      if (r.width < 2) return;
      est.destinoX = r.left + r.width / 2;
      est.destinoY = -(r.top + r.height / 2);
      // La escala sale del tamaño del hueco: 92 px de alto es el 1:1.
      est.destinoEscala = Math.max(0.55, Math.min(2.2, r.height / 92));
    }

    function actualizar(dt) {
      // Seguimiento amortiguado hacia el hueco (lambda 6).
      var k = 1 - Math.exp(-6 * dt);
      est.x += (est.destinoX - est.x) * k;
      est.y += (est.destinoY - est.y) * k;
      est.escala += (est.destinoEscala - est.escala) * k;

      // Flotación suave y salto con gravedad.
      var flota = reduceMovimiento ? 0 : Math.sin(tiempo * 2.1) * 3.5;
      if (est.saltoY > 0 || est.vy !== 0) {
        est.vy -= 950 * dt;
        est.saltoY += est.vy * dt;
        if (est.saltoY <= 0) { est.saltoY = 0; est.vy = 0; }
      }

      raiz.position.set(est.x, est.y + flota + est.saltoY, 0);

      // Estirar y encoger (squash and stretch) durante el salto.
      var estira = 1 + Math.min(0.18, Math.abs(est.vy) / 2600);
      raiz.scale.set(est.escala / estira, est.escala * estira, 1);

      // --- Parpadeo aleatorio cada 2,2 a 5,4 s ---
      est.parpadeo -= dt;
      if (est.parpadeo <= 0) {
        est.proxParpadeo -= dt;
        if (est.proxParpadeo <= 0) {
          est.parpadeo = 0.12;
          est.proxParpadeo = 2.2 + Math.random() * 3.2;
        }
      }
      var abierto = est.parpadeo > 0 ? 0.12 : 1;

      // --- Humor ---
      var celebra = est.humor === 'celebrate';
      var piensa = est.humor === 'think';
      var sorpresa = est.humor === 'surprised';

      ojoI.scale.set(sorpresa ? 1.25 : 1, abierto * (celebra ? 0.55 : sorpresa ? 1.3 : 1), 1);
      ojoD.scale.set(sorpresa ? 1.25 : 1, abierto * (celebra ? 0.55 : sorpresa ? 1.3 : 1), 1);

      // Los ojos siguen al puntero (salvo en modo reducido).
      var mx = 0, my = 0;
      if (!reduceMovimiento && puntero.x > -9000) {
        mx = Math.max(-1.6, Math.min(1.6, (puntero.x - est.x) / 220));
        my = Math.max(-1.2, Math.min(1.2, (puntero.y - est.y) / 220));
      }
      if (piensa) { mx = -1.3; my = 1.1; }
      ojoI.position.set(-6.5 + mx, 6 + my, 0);
      ojoD.position.set(6.5 + mx, 6 + my, 0);

      // Boca: se abre y cierra mientras habla.
      var hablando = tiempo < est.hablarHasta;
      var apertura = hablando && !reduceMovimiento
        ? 1 + Math.abs(Math.sin(tiempo * 9)) * 2.4
        : (sorpresa ? 2.2 : 1);
      boca.scale.set(sorpresa ? 0.55 : 1, apertura, 1);
      boca.position.y = -1 - apertura * 0.4;

      // Brazos: pivote en el hombro.
      var brazoBase = hablando ? -0.5 : -0.15;
      pivoteI.rotation.z = celebra ? 2.3 : -brazoBase + Math.sin(tiempo * 1.7) * 0.08;
      pivoteD.rotation.z = celebra ? -2.3 : brazoBase - Math.sin(tiempo * 1.9) * 0.08;

      // Antena: se bambolea al tocarlo.
      if (est.wobble > 0) {
        est.wobble -= dt * 2.4;
        antena.rotation.z = Math.sin(tiempo * 24) * 0.22 * Math.max(0, est.wobble);
        bulbo.position.x = Math.sin(tiempo * 24) * 3 * Math.max(0, est.wobble);
        bulboGlow.position.x = bulbo.position.x;
      } else {
        antena.rotation.z *= 0.9;
        bulbo.position.x *= 0.9;
        bulboGlow.position.x = bulbo.position.x;
      }
      bulboGlow.material.opacity = 0.35 + (reduceMovimiento ? 0.1 : Math.abs(Math.sin(tiempo * 1.8)) * 0.3);

      // En modo celebración, salta solo cada cierto tiempo.
      if (celebra && !reduceMovimiento && est.saltoY === 0 && Math.random() < dt * 0.6) {
        est.vy = 320;
      }
    }

    return {
      actualizar: actualizar,
      repintar: repintarBit,
      irA: irA,
      hablar: function (ms) { est.hablarHasta = tiempo + ms / 1000; },
      humor: function (h) { est.humor = h || 'talk'; },
      saltar: function () { if (est.saltoY === 0) est.vy = 340; },
      wobble: function () { est.wobble = 1; }
    };
  }

  // =====================================================================
  // CONFETI  ·  InstancedMesh de 180 cuadritos
  // =====================================================================
  var confeti = null;
  var piezas = [];
  var MAX_CONFETI = 180;

  function crearConfeti() {
    var geo = new THREE.PlaneGeometry(7, 4);
    // OJO: aquí NO va vertexColors. Esa opción hace que el material
    // busque un atributo `color` en la GEOMETRÍA, que no existe, y las
    // piezas salen negras. Para un InstancedMesh el color por instancia
    // viaja en `instanceColor`, y three.js lo detecta solo.
    var mat = new THREE.MeshBasicMaterial({ transparent: true, depthTest: false });
    confeti = new THREE.InstancedMesh(geo, mat, MAX_CONFETI);
    confeti.renderOrder = 9;
    confeti.count = 0;
    confeti.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_CONFETI * 3), 3);
    frontFull.add(confeti);
  }

  function lanzarConfeti(x, y) {
    if (reduceMovimiento) return;
    var paleta = [COL.get, COL.post, COL.put, COL.del, COL.accent];
    piezas = [];

    for (var i = 0; i < MAX_CONFETI; i++) {
      var ang = Math.random() * Math.PI * 2;
      var vel = 180 + Math.random() * 420;
      piezas.push({
        x: x, y: y,
        vx: Math.cos(ang) * vel,
        vy: Math.abs(Math.sin(ang)) * vel + 150,
        giro: (Math.random() - 0.5) * 14,
        rot: Math.random() * 6.283,
        vida: 1.5 + Math.random() * 1.2,
        color: paleta[i % paleta.length]
      });
    }
    confeti.count = MAX_CONFETI;
  }

  var m4 = new THREE.Matrix4();
  var q = new THREE.Quaternion();
  var v3 = new THREE.Vector3();
  var esc = new THREE.Vector3(1, 1, 1);

  function actualizarConfeti(dt) {
    if (!confeti || !confeti.count) return;
    var vivos = 0;

    for (var i = 0; i < piezas.length; i++) {
      var p = piezas[i];
      if (p.vida <= 0) continue;

      p.vida -= dt;
      p.vy -= 900 * dt;                 // gravedad
      p.vx *= (1 - 1.1 * dt);           // resistencia del aire
      p.vy *= (1 - 0.4 * dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.giro * dt;

      v3.set(p.x, p.y, 0);
      q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), p.rot);
      esc.set(1, Math.max(0.2, Math.cos(p.rot * 1.7)), 1);   // voltereta
      m4.compose(v3, q, esc);
      confeti.setMatrixAt(i, m4);
      confeti.instanceColor.setXYZ(i, p.color.r, p.color.g, p.color.b);
      vivos++;
    }

    confeti.material.opacity = 1;
    confeti.instanceMatrix.needsUpdate = true;
    confeti.instanceColor.needsUpdate = true;
    if (!vivos) confeti.count = 0;
  }

  // =====================================================================
  // API PÚBLICA
  // =====================================================================
  var grafosDiapositiva = [];

  API.setSlide = function (op) {
    op = op || {};
    var flow = op.flow || { lit: [], mode: 'idle' };

    // Grafo propio de la diapositiva (el diagrama de arquitectura).
    grafosDiapositiva.forEach(function (g) {
      var i = grafos.indexOf(g);
      if (i > -1) grafos.splice(i, 1);
    });
    grafosDiapositiva = [];

    if (op.slideEl) {
      var cont = op.slideEl.querySelector('[data-graph]');
      if (cont) {
        var g = crearGrafo(cont, 'vertical', backStage);
        g.encender(flow.lit || []);
        grafos.push(g);
        grafosDiapositiva.push(g);
      }
    }

    grafoTira.encender(flow.lit || []);
    modoActual = flow.mode || 'idle';

    // Paquete según el modo.
    guion = null;
    quitarPaquete();
    grafoTira.setDash(false);

    if (modoActual !== 'idle' && !reduceMovimiento) {
      // 'boot' solo enciende los nodos en secuencia, sin paquete en bucle.
      if (modoActual === 'boot') {
        (flow.lit || []).forEach(function (id, i) {
          setTimeout(function () { grafoTira.destellar(id); }, i * 130);
        });
      } else {
        iniciarGuion(guionDeModo(modoActual, flow.lit || []));
      }
    }

    if (bit) {
      bit.irA(op.slot);
      bit.humor(op.mood);
    }

    if (op.ripple) lanzarOnda(W / 2, -H * 0.45);
    if (op.mood === 'celebrate') lanzarConfeti(W / 2, -H * 0.6);
  };

  API.talk = function (ms) { if (bit) bit.hablar(ms || 1200); };

  API.poke = function () {
    if (!bit) return;
    bit.saltar();
    bit.wobble();
    bit.hablar(900);
  };

  API.burst = function () { lanzarConfeti(W / 2, -H * 0.6); };

  /** Envío puntual desde el probador. Devuelve una promesa. */
  API.send = function (req) {
    req = req || {};
    return new Promise(function (resolver) {
      var cajas = grafoTira.cajas();
      var orden = window.PIPELINE.main.map(function (m) { return m.id; })
        .filter(function (id) { return cajas[id]; });

      if (orden.length < 2 || reduceMovimiento) { resolver(); return; }

      var hops = [];
      for (var i = 0; i < orden.length - 1; i++) {
        hops.push({ from: orden[i], to: orden[i + 1], kind: 'request', dur: 0.16 });
      }
      for (var j = orden.length - 1; j > 0; j--) {
        hops.push({ from: orden[j], to: orden[j - 1], kind: req.ok ? 'response' : 'error', dur: 0.16 });
      }

      iniciarGuion({ hops: hops, loop: false, resolver: resolver }, req.verb);

      // Red de seguridad: si algo falla, no dejamos la promesa colgada.
      setTimeout(function () { if (guion) { guion = null; quitarPaquete(); } resolver(); }, 4000);
    });
  };
})();
