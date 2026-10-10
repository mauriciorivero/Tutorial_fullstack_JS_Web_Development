/**
 * js/slides.js  ·  CONTENIDO DE LA PRESENTACION
 * ---------------------------------------------------------------------
 * Aqui NO se escribe codigo fuente. Cada panel de editor APUNTA a un
 * archivo real del proyecto con un rango de lineas:
 *
 *     visual: { type: 'editor', tabs: [
 *       { file: 'persona-api/utils/fechas.js', lang: 'javascript',
 *         range: [49, 72], focus: [[60, 70]] }
 *     ]}
 *
 * El texto del archivo lo carga js/code-files.js, que genera
 * tools/build-code-files.js leyendo el proyecto. Asi la presentacion
 * NO PUEDE desincronizarse del codigo.
 *
 * Fuente de verdad del orden y del contenido: ../../step_by_step.md
 */

/* global window */
(function () {
  'use strict';

  // =====================================================================
  // FASES  ·  los grupos del indice lateral
  // =====================================================================
  window.PHASES = [
    { id: 'inicio',      label: 'Inicio' },
    { id: 'fundamentos', label: 'Fundamentos' },
    { id: 'datos',       label: 'Base de datos' },
    { id: 'proyecto',    label: 'Proyecto Node.js' },
    { id: 'utils',       label: 'Utilidades' },
    { id: 'modelo',      label: 'Modelo y conexión' },
    { id: 'capas',       label: 'Capas de la API' },
    { id: 'frontend',    label: 'Frontend' },
    { id: 'cierre',      label: 'Probar y cerrar' }
  ];

  // =====================================================================
  // PIPELINE  ·  la tira superior "Recorrido de una petición"
  // ---------------------------------------------------------------------
  // main: las capas por las que pasa la peticion, en orden.
  // side: las capas transversales. "link" dice a que nodo principal
  //       se enganchan en el dibujo.
  // =====================================================================
  window.PIPELINE = {
    main: [
      { id: 'cliente',     label: 'Cliente',      hint: 'navegador o curl' },
      { id: 'express',     label: 'Express',      hint: 'servidor HTTP' },
      { id: 'routes',      label: 'routes/',      hint: '¿qué URL?' },
      { id: 'controllers', label: 'controllers/', hint: 'entrada / salida' },
      { id: 'services',    label: 'services/',    hint: 'reglas de negocio' },
      { id: 'models',      label: 'models/',      hint: 'objetos POO' },
      { id: 'mysql',       label: 'MySQL',        hint: 'persistencia' }
    ],
    side: [
      { id: 'utils',      label: 'utils/',      hint: 'formato y validación', link: 'services' },
      { id: 'middleware', label: 'middleware/', hint: 'errores y logs',       link: 'express' }
    ]
  };

  // =====================================================================
  // ARQUITECTURA  ·  el diagrama vertical grande de la diapositiva 00
  // =====================================================================
  window.ARCHITECTURE = {
    main: [
      { id: 'cliente',     label: 'Cliente',            note: 'navegador (fetch) o curl' },
      { id: 'express',     label: 'config/express.js',  note: 'CORS · JSON · logs · errores' },
      { id: 'routes',      label: 'routes/',            note: 'verbo + URL → controlador' },
      { id: 'controllers', label: 'controllers/',       note: 'lee req · responde con el código HTTP' },
      { id: 'services',    label: 'services/',          note: 'reglas de negocio + SQL' },
      { id: 'models',      label: 'models/',            note: 'clases con atributos privados' },
      { id: 'mysql',       label: 'MySQL',              note: 'personal_management · 4 tablas' }
    ],
    side: [
      { id: 'utils',      label: 'utils/',      note: 'constantes · fechas · validación · errores', row: 4 },
      { id: 'middleware', label: 'middleware/', note: 'errorHandler · logger · validarParametros', row: 1 }
    ]
  };

  // =====================================================================
  // DIAPOSITIVAS
  // =====================================================================
  window.SLIDES = [

    // -----------------------------------------------------------------
    // PORTADA
    // -----------------------------------------------------------------
    {
      id: 'portada',
      kind: 'cover',
      phase: 'inicio',
      kicker: 'SENA · Ficha 3489088 · Análisis y Desarrollo de Software',
      title: 'Personal',
      titleAccent: 'Management',
      lead: [
        'Construye una <strong>API REST completa</strong> con Node.js, Express y MySQL, ' +
        'y un <strong>frontend vanilla</strong> organizado con Atomic Design.',
        'Paso a paso, de abajo hacia arriba, sin frameworks y sin atajos.'
      ],
      chips: ['52 pasos', '99 archivos', '16.866 líneas', '30 endpoints', '4 tablas'],
      cta: { label: 'Comenzar', hint: 'o usa ← →' },
      visual: {
        type: 'editor',
        caption: 'El resultado: un usuario con sus relaciones, en una sola petición.',
        tabs: [{
          file: 'persona-api/models/Usuario.js',
          lang: 'javascript',
          range: [448, 474],
          focus: [[466, 472]]
        }]
      },
      flow: { lit: [], mode: 'idle' },
      bubble: { title: 'Hola, soy Bit', text: 'Te acompaño en los 52 pasos. Usa las flechas del teclado, o pulsa la tecla i para abrir el índice.' },
      mood: 'wave'
    },

    // =================================================================
    // FASE · FUNDAMENTOS
    // =================================================================
    {
      id: 'paso-00',
      step: 0,
      phase: 'fundamentos',
      layer: 'arquitectura',
      title: 'Objetivo y arquitectura',
      lead: [
        'Vamos a administrar <strong>personas</strong> y sus datos de contacto: usuarios, teléfonos, ' +
        'redes sociales y perfiles sociales.',
        'Cada capa tiene <strong>una sola</strong> responsabilidad y solo habla con la siguiente. ' +
        'Un controlador jamás escribe SQL; un modelo jamás sabe que existe HTTP.'
      ],
      table: {
        head: ['Si hay que cambiar…', 'Se toca…'],
        rows: [
          ['El formato de la fecha en pantalla', 'utils/fechas.js'],
          ['La regla «la edad se calcula sola»', 'services/usuario.service.js'],
          ['La URL de un endpoint', 'routes/usuario.routes.js'],
          ['El código HTTP de una respuesta', 'controllers/usuario.controller.js'],
          ['El color de los botones', 'css/01-tokens/_colores.css']
        ]
      },
      visual: { type: 'architecture' },
      flow: { lit: ['cliente', 'express', 'routes', 'controllers', 'services', 'models', 'mysql', 'utils', 'middleware'], mode: 'full' },
      bubble: { text: 'Una arquitectura en capas no hace que el programa funcione: funciona igual sin ella. Se hace para poder cambiarlo sin romper todo.' },
      mood: 'talk'
    },

    {
      id: 'paso-01',
      step: 1,
      phase: 'fundamentos',
      layer: 'terminal',
      title: 'Verificar el entorno',
      lead: [
        'Antes de escribir una línea, comprobamos que las herramientas estén listas. ' +
        'La mitad de los «no me funciona» de un curso son una versión vieja o un servicio apagado.'
      ],
      checklist: [
        { name: 'Node.js 18+', detail: 'Usamos node --watch, campos privados # y Object.hasOwn', command: 'node -v' },
        { name: 'npm', detail: 'Viene con Node', command: 'npm -v' },
        { name: 'MySQL 8+', detail: 'Llaves foráneas, transacciones y utf8mb4', command: 'mysql --version' },
        { name: 'MySQL encendido', detail: 'El proceso mysqld tiene que estar corriendo', command: 'ps aux | grep mysqld' }
      ],
      visual: {
        type: 'output',
        label: 'Salida real en la máquina donde se construyó este proyecto',
        lines: [
          '$ node -v',
          'v24.18.0',
          '$ npm -v',
          '12.0.2',
          '$ mysql --version',
          'mysql  Ver 26.7.0 for macos15 on arm64 (MySQL Community Server - GPL)',
          '$ git --version',
          'git version 2.54.0'
        ]
      },
      flow: { lit: [], mode: 'idle' },
      bubble: { text: 'Si sale «Can\'t connect to local MySQL server», el servidor está apagado. No es tu código: enciéndelo primero.' },
      mood: 'think'
    },

    {
      id: 'paso-02',
      step: 2,
      phase: 'fundamentos',
      layer: 'estructura',
      title: 'Crear la estructura de carpetas',
      lead: [
        'La estructura de carpetas <strong>es documentación</strong>. Alguien que abre el proyecto ' +
        'por primera vez debe adivinar dónde está cada cosa sin preguntar.'
      ],
      commands: [
        { label: 'Backend', code: 'mkdir -p persona-api/{config,controllers,middleware,models,routes,services,utils,database}' },
        { label: 'Frontend', code: 'mkdir -p persona-frontend' },
        { label: 'Verificar', code: 'find persona-api -type d | sort' }
      ],
      visual: {
        type: 'explorer',
        caption: 'Cada carpeta tiene UNA responsabilidad.',
        tree: [
          { depth: 0, name: 'persona-api/', kind: 'folder' },
          { depth: 1, name: 'config/',      kind: 'folder', note: 'conexión y configuración' },
          { depth: 1, name: 'controllers/', kind: 'folder', note: 'entrada / salida HTTP' },
          { depth: 1, name: 'database/',    kind: 'folder', note: 'scripts SQL' },
          { depth: 1, name: 'middleware/',  kind: 'folder', note: 'errores y logs' },
          { depth: 1, name: 'models/',      kind: 'folder', note: 'clases del dominio' },
          { depth: 1, name: 'routes/',      kind: 'folder', note: 'mapa de endpoints' },
          { depth: 1, name: 'services/',    kind: 'folder', note: 'reglas de negocio + SQL' },
          { depth: 1, name: 'utils/',       kind: 'folder', note: 'formato, validación, errores' },
          { depth: 1, name: '.env',         kind: 'env',    note: 'credenciales', muted: true },
          { depth: 1, name: '.gitignore',   kind: 'git' },
          { depth: 1, name: 'index.js',     kind: 'js',     note: 'punto de entrada' },
          { depth: 1, name: 'package.json', kind: 'json' }
        ]
      },
      flow: { lit: [], mode: 'idle' },
      bubble: { text: 'utils/ no depende de nadie, por eso lo construimos primero. Ese es el orden de todo el curso: de abajo hacia arriba.' },
      mood: 'talk'
    },

    // =================================================================
    // FASE · BASE DE DATOS
    // =================================================================
    {
      id: 'paso-03-1',
      step: 3,
      part: { n: 1, of: 2, label: 'Las tablas' },
      phase: 'datos',
      layer: 'MySQL',
      title: 'Entender el modelo relacional',
      file: 'parametrization/db_relational_model/DB_relational_model.sql',
      lead: [
        'El modelo entregado define cuatro tablas. <code>USUARIO</code> es la tabla padre: ' +
        '<code>TELEFONO</code> y <code>PERFIL_SOCIAL</code> dependen de ella.',
        'Fíjate en <code>edad INT NOT NULL</code>: es un dato <strong>derivado</strong> de ' +
        '<code>fecha_nacimiento</code>. Esa observación decide una regla de negocio completa.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'parametrization/db_relational_model/DB_relational_model.sql',
          lang: 'sql',
          range: [20, 36],
          focus: [[29, 30]]
        }]
      },
      flow: { lit: ['mysql'], mode: 'idle' },
      bubble: { text: 'Antes de programar, lee el modelo y anota sus límites. Cada NULL y cada VARCHAR(45) es una decisión que el código deberá respetar.' },
      mood: 'think'
    },

    {
      id: 'paso-03-2',
      step: 3,
      part: { n: 2, of: 2, label: 'La llave compuesta' },
      phase: 'datos',
      layer: 'MySQL',
      title: 'La tabla puente y su llave compuesta',
      file: 'parametrization/db_relational_model/DB_relational_model.sql',
      lead: [
        'Un usuario está en muchas redes y una red tiene muchos usuarios: eso es ' +
        '<strong>muchos a muchos</strong>, y una base relacional no lo puede representar directo.',
        'Se parte en dos relaciones 1:N con una tabla intermedia cuya llave primaria son ' +
        '<strong>las dos llaves foráneas juntas</strong>.'
      ],
      list: [
        'No tiene columna <code>id</code>: su identidad son dos valores',
        'La URL del recurso llevará dos segmentos: <code>/api/perfiles-sociales/4/3</code>',
        'MySQL impide que un usuario tenga dos perfiles en la misma red',
        '<code>ON DELETE NO ACTION</code>: MySQL <strong>no</strong> borra en cascada'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'parametrization/db_relational_model/DB_relational_model.sql',
          lang: 'sql',
          range: [68, 85],
          focus: [[71, 74]]
        }]
      },
      flow: { lit: ['mysql'], mode: 'idle' },
      bubble: { text: 'Que MySQL impida el perfil duplicado es más confiable que nuestro código: la base de datos nunca se olvida de validar.' },
      mood: 'surprised'
    },

    {
      id: 'paso-04',
      step: 4,
      phase: 'datos',
      layer: 'database/',
      title: 'Crear el esquema y las tablas',
      file: 'persona-api/database/01_schema.sql',
      lead: [
        'Reescribimos el script del modelo con <code>IF NOT EXISTS</code> para volverlo ' +
        '<strong>idempotente</strong>: se puede ejecutar varias veces sin perder datos.',
        'Y usamos <code>utf8mb4</code>, que sí guarda acentos, eñes y emojis.'
      ],
      commands: [
        { label: 'Crear el archivo', code: 'touch persona-api/database/01_schema.sql' },
        { label: 'Ejecutarlo', code: 'mysql -u root -p < persona-api/database/01_schema.sql' }
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/database/01_schema.sql',
          lang: 'sql',
          range: [17, 46],
          focus: [[19, 21]]
        }],
        caption: 'InnoDB es el motor que soporta llaves foráneas y transacciones. MyISAM no soporta ninguna de las dos.'
      },
      flow: { lit: ['mysql'], mode: 'idle' },
      bubble: { text: 'Un script de base de datos debe poder correrse dos veces sin destruir nada. Eso es lo que lo hace usable en equipo.' },
      mood: 'talk'
    },

    {
      id: 'paso-05',
      step: 5,
      phase: 'datos',
      layer: 'database/',
      title: 'Crear el usuario de la aplicación',
      file: 'persona-api/database/02_usuario_app.sql',
      lead: [
        'Una aplicación <strong>nunca</strong> se conecta como <code>root</code>. ' +
        'Creamos <code>pm_user</code> con permisos solo de datos y solo sobre este esquema.',
        'Fíjate en lo que <strong>no</strong> concedimos: <code>CREATE</code>, <code>DROP</code>, ' +
        '<code>ALTER</code>, <code>GRANT</code>. La aplicación no modifica la estructura, solo los datos.'
      ],
      commands: [
        { label: 'Crear el usuario', code: 'mysql -u root -p < persona-api/database/02_usuario_app.sql' },
        { label: 'Probar la conexión', code: 'mysql -u pm_user -p -D personal_management -e "SHOW TABLES;"' }
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/database/02_usuario_app.sql',
          lang: 'sql',
          range: [12, 23],
          focus: [[15, 17]]
        }]
      },
      flow: { lit: ['mysql'], mode: 'idle' },
      bubble: { text: 'Si alguien explota una inyección SQL, la diferencia entre pm_user y root es la diferencia entre perder filas y perder el servidor.' },
      mood: 'surprised'
    },

    {
      id: 'paso-06',
      step: 6,
      phase: 'datos',
      layer: 'database/',
      title: 'Cargar datos de prueba',
      file: 'persona-api/database/03_datos_prueba.sql',
      lead: [
        'El reto es cargar datos sin duplicarlos si el script se corre dos veces. ' +
        'Como <code>RED_SOCIAL.nombre</code> no tiene índice <code>UNIQUE</code>, no sirve ' +
        '<code>INSERT IGNORE</code>: usamos <code>INSERT … SELECT … WHERE NOT EXISTS</code>.',
        'Y el <code>USUARIO_id</code> <strong>no se escribe a mano</strong>: se busca con una subconsulta.'
      ],
      commands: [
        { label: 'Cargar los datos', code: 'mysql -u root -p < persona-api/database/03_datos_prueba.sql' }
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/database/03_datos_prueba.sql',
          lang: 'sql',
          range: [49, 64],
          focus: [[53, 57]]
        }],
        caption: 'Salida real: USUARIO 5 · TELEFONO 3 · RED_SOCIAL 8 · PERFIL_SOCIAL 4'
      },
      flow: { lit: ['mysql'], mode: 'idle' },
      bubble: { text: 'Nunca escribas un id a mano en un script de datos. El AUTO_INCREMENT cambia según lo que ya exista en la tabla.' },
      mood: 'talk'
    },

    // =================================================================
    // FASE · PROYECTO NODE.JS
    // =================================================================
    {
      id: 'paso-07',
      step: 7,
      phase: 'proyecto',
      layer: 'raíz',
      title: 'package.json y dependencias',
      file: 'persona-api/package.json',
      lead: [
        'Cuatro dependencias, ni una más. Cada una es código ajeno que hay que mantener, ' +
        'actualizar y auditar.'
      ],
      commands: [
        { label: 'Instalar', code: 'npm install express mysql2 dotenv cors' }
      ],
      packages: [
        { name: 'express', tag: 'producción', detail: 'Servidor HTTP, enrutamiento y middlewares' },
        { name: 'mysql2',  tag: 'producción', detail: 'Driver de MySQL con soporte de Promise' },
        { name: 'dotenv',  tag: 'producción', detail: 'Lee el archivo .env y lo carga en process.env' },
        { name: 'cors',    tag: 'producción', detail: 'Cabeceras que autorizan al frontend' }
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/package.json',
          lang: 'json',
          range: [1, 20],
          focus: [[6, 8]]
        }],
        caption: 'Lo que NO instalamos: nodemon (Node trae --watch), morgan, joi y sequelize. Se escriben a mano para aprenderlos.'
      },
      flow: { lit: ['express'], mode: 'boot' },
      bubble: { text: 'Un ORM esconde justo lo que hay que aprender: las consultas, los JOIN y las transacciones. Por eso escribimos el SQL.' },
      mood: 'talk'
    },

    {
      id: 'paso-08',
      step: 8,
      phase: 'proyecto',
      layer: 'raíz',
      title: '.env, .env.example y .gitignore',
      file: 'persona-api/.env',
      lead: [
        'Un repositorio guarda <strong>todo el historial</strong>. Si subes una contraseña y la ' +
        'borras después, sigue ahí para siempre.',
        'Por eso van tres archivos: el real (ignorado), la plantilla (versionada) y la lista de ignorados.'
      ],
      table: {
        head: ['Archivo', '¿A git?', 'Contiene'],
        rows: [
          ['.env',         'NO',  'Las credenciales reales de TU máquina'],
          ['.env.example', 'SÍ',  'La estructura, sin secretos'],
          ['.gitignore',   'SÍ',  'La lista de lo que git debe ignorar']
        ]
      },
      visual: {
        type: 'editor',
        tabs: [
          { file: 'persona-api/.env',       lang: 'ini', range: [8, 25], focus: [[14, 18]] },
          { file: 'persona-api/.gitignore', lang: 'bash', range: [9, 24] }
        ]
      },
      flow: { lit: [], mode: 'idle' },
      bubble: { text: 'El .gitignore se escribe ANTES del primer commit. Después ya es tarde: lo que entró al historial se queda ahí.' },
      mood: 'surprised'
    },

    // =================================================================
    // FASE · UTILIDADES
    // =================================================================
    {
      id: 'paso-09',
      step: 9,
      phase: 'utils',
      layer: 'utils/',
      title: 'constants.js · sin números mágicos',
      file: 'persona-api/utils/constants.js',
      lead: [
        'Si un valor aparece en dos archivos distintos, es una constante. ' +
        '<code>Object.freeze()</code> congela el objeto: después de llamarlo, ' +
        '<code>HTTP.OK = 999</code> no hace nada.',
        '<code>const</code> solo impide <strong>reasignar</strong> la variable, no modificar el objeto.'
      ],
      commands: [{ code: 'touch persona-api/utils/constants.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/utils/constants.js',
          lang: 'javascript',
          range: [15, 64],
          focus: [[16, 25]]
        }],
        caption: 'Antes: res.status(409) · Después: res.status(HTTP.CONFLICTO)'
      },
      flow: { lit: ['utils'], mode: 'idle' },
      bubble: { text: 'LIMITES.VARCHAR_CORTO vale 45 porque el modelo lo dice. Si el día de mañana la columna crece, se cambia aquí y en un solo lugar.' },
      mood: 'talk'
    },

    {
      id: 'paso-10',
      step: 10,
      phase: 'utils',
      layer: 'utils/',
      title: 'mensajes.js · hablarle a una persona',
      file: 'persona-api/utils/mensajes.js',
      lead: [
        'Algunos mensajes son <strong>funciones</strong>, porque necesitan recibir un dato: ' +
        'el nombre del campo que falló o el id que no existe.',
        'Centralizarlos da consistencia, permite traducir la API cambiando un archivo, ' +
        'y deja que los tests comparen contra la constante y no contra texto escrito a mano.'
      ],
      table: {
        head: ['Malo', 'Bueno'],
        rows: [
          ['Error', 'El campo "edad" debe estar entre 0 y 130.'],
          ['Invalid date', 'El campo "fechaNacimiento" debe tener el formato AAAA-MM-DD (por ejemplo 1995-07-24).'],
          ['No encontrado', 'No existe un usuario con id 42.']
        ]
      },
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/utils/mensajes.js',
          lang: 'javascript',
          range: [18, 50],
          focus: [[30, 37]]
        }]
      },
      flow: { lit: ['utils'], mode: 'idle' },
      bubble: { text: 'Un mensaje de error le habla a alguien que no conoce tu código. Debe decir qué pasó, dónde y cómo arreglarlo.' },
      mood: 'talk'
    },

    {
      id: 'paso-11-1',
      step: 11,
      part: { n: 1, of: 2, label: 'Herencia' },
      phase: 'utils',
      layer: 'utils/',
      title: 'AppError · heredar de Error',
      file: 'persona-api/utils/AppError.js',
      lead: [
        'El <code>Error</code> nativo solo tiene <code>message</code>. No sabe de códigos HTTP ' +
        'ni de listas de campos inválidos.',
        'Heredamos con <code>extends</code> y le agregamos lo que necesitamos. ' +
        '<code>super(mensaje)</code> llama al constructor de <code>Error</code>.'
      ],
      commands: [{ code: 'touch persona-api/utils/AppError.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/utils/AppError.js',
          lang: 'javascript',
          range: [19, 56],
          focus: [[33, 36]]
        }]
      },
      flow: { lit: ['utils', 'middleware'], mode: 'idle' },
      bubble: { text: 'AppError ES un Error, así que funciona con throw, con try/catch y con instanceof como cualquier otro. Eso es polimorfismo.' },
      mood: 'talk'
    },

    {
      id: 'paso-11-2',
      step: 11,
      part: { n: 2, of: 2, label: 'Fábricas' },
      phase: 'utils',
      layer: 'utils/',
      title: 'AppError · métodos de fábrica',
      file: 'persona-api/utils/AppError.js',
      lead: [
        'Un método <code>static</code> pertenece a la <strong>clase</strong>, no a las instancias. ' +
        'Los usamos como atajos para los errores más comunes.',
        'Mucho más legible que repetir <code>new AppError(\'…\', 404, \'NO_ENCONTRADO\')</code> en treinta lugares.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/utils/AppError.js',
          lang: 'javascript',
          range: [74, 122],
          focus: [[81, 88]]
        }]
      },
      flow: { lit: ['utils', 'middleware'], mode: 'idle' },
      bubble: { text: 'El getter de detalles devuelve una COPIA del arreglo. Si devolviera la referencia, cualquiera podría modificar el estado del error.' },
      mood: 'think'
    },

    {
      id: 'paso-12-1',
      step: 12,
      part: { n: 1, of: 2, label: 'Validar la fecha' },
      phase: 'utils',
      layer: 'utils/',
      title: 'fechas.js · la fecha que no existe',
      file: 'persona-api/utils/fechas.js',
      lead: [
        'La expresión regular <strong>no basta</strong>. <code>"2026-02-31"</code> cumple el patrón ' +
        '<code>\\d{4}-\\d{2}-\\d{2}</code> pero no existe.',
        'Hay que reconstruir la fecha y comparar: si JavaScript la «corrigió», era inválida.'
      ],
      commands: [{ code: 'touch persona-api/utils/fechas.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/utils/fechas.js',
          lang: 'javascript',
          range: [41, 72],
          focus: [[62, 67]]
        }],
        caption: 'esFechaISOValida("1995-07-24") → true   ·   esFechaISOValida("2026-02-31") → false'
      },
      flow: { lit: ['utils'], mode: 'idle' },
      bubble: { text: 'El mes en JavaScript va de 0 a 11. Es la causa número uno de fechas corridas un mes en todo el ecosistema.' },
      mood: 'surprised'
    },

    {
      id: 'paso-12-2',
      step: 12,
      part: { n: 2, of: 2, label: 'Calcular la edad' },
      phase: 'utils',
      layer: 'utils/',
      title: 'fechas.js · la regla de negocio clave',
      file: 'persona-api/utils/fechas.js',
      lead: [
        'La API <strong>nunca</strong> confía en la edad que envía el cliente: la recalcula aquí. ' +
        'Así la columna <code>edad</code> jamás queda desincronizada de <code>fecha_nacimiento</code>.',
        'Usamos los getters <strong>locales</strong> y nunca los UTC: el driver de MySQL devuelve ' +
        'el DATETIME en zona local y leerlo en UTC restaría un día.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/utils/fechas.js',
          lang: 'javascript',
          range: [126, 164],
          focus: [[147, 155]]
        }],
        caption: 'calcularEdad("1984-01-02") → 42   ·   calcularEdad("2026-12-31") → 0'
      },
      flow: { lit: ['utils', 'services'], mode: 'idle' },
      bubble: { text: 'Si cada capa convierte las fechas a su manera, aparece la fecha corrida un día. Define una función y úsala en todas partes.' },
      mood: 'talk'
    },

    {
      id: 'paso-13',
      step: 13,
      phase: 'utils',
      layer: 'utils/',
      title: 'formato.js · la lista blanca',
      file: 'persona-api/utils/formato.js',
      lead: [
        'Primero se <strong>formatea</strong> (transformar) y después se <strong>valida</strong> (decidir). ' +
        'Si no, un nombre escrito como <code>"   "</code> pasaría la validación de «no está vacío».',
        'Y la función más importante del archivo: <code>soloCamposPermitidos</code>, que evita el ' +
        'ataque de <strong>mass assignment</strong>.'
      ],
      commands: [{ code: 'touch persona-api/utils/formato.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/utils/formato.js',
          lang: 'javascript',
          range: [136, 166],
          focus: [[146, 160]]
        }],
        caption: 'Si el cliente envía { primerNombre:"Ana", id:1, edad:999 }, solo sobrevive primerNombre.'
      },
      flow: { lit: ['utils', 'services'], mode: 'idle' },
      bubble: { text: 'Number.parseInt("12abc") devuelve 12, que es peligroso. Por eso aEnteroONulo comprueba primero que solo haya dígitos.' },
      mood: 'surprised'
    },

    {
      id: 'paso-14-1',
      step: 14,
      part: { n: 1, of: 2, label: 'La clase' },
      phase: 'utils',
      layer: 'utils/',
      title: 'validadores.js · ColectorErrores',
      file: 'persona-api/utils/validadores.js',
      lead: [
        'Un formulario que te dice «falta el nombre», lo corriges, y ahora te dice «falta el apellido» ' +
        'es una experiencia pésima.',
        'Esta clase <strong>acumula</strong> los errores (patrón <em>Notification</em> de Martin Fowler) ' +
        'y los devuelve todos juntos.'
      ],
      commands: [{ code: 'touch persona-api/utils/validadores.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/utils/validadores.js',
          lang: 'javascript',
          range: [100, 145],
          focus: [[131, 134]]
        }]
      },
      flow: { lit: ['utils'], mode: 'idle' },
      bubble: { text: 'agregar() devuelve this. Ese detalle permite encadenar las validaciones una tras otra, y se llama interfaz fluida.' },
      mood: 'talk'
    },

    {
      id: 'paso-14-2',
      step: 14,
      part: { n: 2, of: 2, label: 'El cierre' },
      phase: 'utils',
      layer: 'utils/',
      title: 'validadores.js · lanzarSiHay',
      file: 'persona-api/utils/validadores.js',
      lead: [
        'Una sola línea decide si lanzar la excepción o continuar. Si hay errores acumulados, ' +
        'lanza un <code>AppError</code> 400 con la lista completa.',
        'Fíjate en el <code>require</code> <strong>dentro</strong> de la función: evita la dependencia ' +
        'circular entre <code>validadores.js</code> y <code>AppError.js</code>.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/utils/validadores.js',
          lang: 'javascript',
          range: [343, 358],
          focus: [[351, 356]]
        }]
      },
      output: {
        label: 'Resultado de validar cuatro campos malos a la vez',
        lines: [
          'cantidad -> 4',
          '[',
          '  { "campo": "primerNombre",    "mensaje": "El campo \\"primerNombre\\" es obligatorio." },',
          '  { "campo": "primerApellido",  "mensaje": "... solo admite letras, espacios, apostrofes y guiones." },',
          '  { "campo": "fechaNacimiento", "mensaje": "... no puede ser una fecha futura." },',
          '  { "campo": "url",             "mensaje": "... debe ser una URL valida que empiece con http:// o https://." }',
          ']'
        ]
      },
      flow: { lit: ['utils'], mode: 'idle' },
      bubble: { text: 'Un require dentro de una función se ejecuta tarde, cuando ambos módulos ya existen. Es la salida limpia a un ciclo de dependencias.' },
      mood: 'think'
    },

    {
      id: 'paso-15',
      step: 15,
      phase: 'utils',
      layer: 'utils/',
      title: 'respuesta.js · el contrato de la API',
      file: 'persona-api/utils/respuesta.js',
      lead: [
        'Todas las respuestas tienen la misma forma. La bandera <code>ok</code> permite al frontend ' +
        'hacer <code>if (respuesta.ok)</code> sin interpretar el código HTTP.',
        'Y <code>construirMeta</code> calcula la paginación en el <strong>servidor</strong>: ' +
        'el frontend solo pinta lo que recibe.'
      ],
      commands: [{ code: 'touch persona-api/utils/respuesta.js' }],
      visual: {
        type: 'editor',
        tabs: [
          { file: 'persona-api/utils/respuesta.js', lang: 'javascript', range: [88, 112], focus: [[97, 108]] },
          { inline: '{\n  "ok": true,\n  "mensaje": "Usuario creado correctamente.",\n  "datos": { "id": 7, "nombreCompleto": "Ada Lovelace", "edad": 210 },\n  "meta": {\n    "total": 5, "pagina": 1, "limite": 10, "devueltos": 5,\n    "totalPaginas": 1,\n    "hayPaginaSiguiente": false,\n    "hayPaginaAnterior": false\n  }\n}', name: 'respuesta-exito.json', lang: 'json' }
        ]
      },
      flow: { lit: ['utils', 'controllers'], mode: 'idle' },
      bubble: { text: 'Un formato de respuesta estable es un contrato. Cámbialo y rompes a todos los clientes a la vez.' },
      mood: 'talk'
    },

    {
      id: 'paso-16',
      step: 16,
      phase: 'utils',
      layer: 'utils/',
      title: 'cifrado.js · hash, HMAC y enmascarado',
      file: 'persona-api/utils/cifrado.js',
      lead: [
        'Esta versión no maneja contraseñas (la tabla <code>USUARIO</code> no tiene esa columna), ' +
        'así que estas funciones quedan como <strong>referencia</strong>.',
        'La regla de oro: <code>SHA-256</code> para contraseñas <strong>nunca</strong>; ' +
        '<code>scrypt</code>, <code>bcrypt</code> o <code>argon2</code> sí, porque son lentos a propósito.'
      ],
      commands: [{ code: 'touch persona-api/utils/cifrado.js' }],
      table: {
        head: ['Concepto', 'Qué es', 'Se usa para'],
        rows: [
          ['Hash', 'Transformación de UNA vía, irreversible', 'Contraseñas'],
          ['HMAC', 'Hash con llave secreta', 'Firmar y verificar que un dato no cambió'],
          ['Enmascarado', 'Ocultar parte de un dato visible', 'Privacidad en pantalla. NO es seguridad']
        ]
      },
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/utils/cifrado.js',
          lang: 'javascript',
          range: [74, 110],
          focus: [[99, 104]]
        }],
        caption: 'timingSafeEqual, no ===. El operador === sale en el primer byte distinto y eso filtra información.'
      },
      flow: { lit: ['utils'], mode: 'idle' },
      bubble: { text: 'Midiendo cuánto tarda una comparación con === se puede deducir un hash byte por byte. Se llama timing attack.' },
      mood: 'surprised'
    },

    // =================================================================
    // FASE · MODELO Y CONEXIÓN
    // =================================================================
    {
      id: 'paso-17',
      step: 17,
      phase: 'modelo',
      layer: 'config/',
      title: 'config/env.js · fallar temprano',
      file: 'persona-api/config/env.js',
      lead: [
        'Nadie en la aplicación lee <code>process.env</code> directamente: todos importan este módulo, ' +
        'que ya validó y convirtió los valores.',
        'Es mejor que el servidor <strong>no arranque</strong> por falta de <code>DB_CLAVE</code>, ' +
        'a que arranque y falle en la primera petición de un usuario real.'
      ],
      commands: [{ code: 'touch persona-api/config/env.js' }],
      visual: {
        type: 'editor',
        tabs: [
          { file: 'persona-api/config/env.js', lang: 'javascript', range: [31, 53], focus: [[40, 50]] },
          { file: 'persona-api/config/env.js', lang: 'javascript', range: [94, 126], focus: [[103, 110]] }
        ],
        caption: 'process.env SIEMPRE devuelve texto: "3000" no es 3000. Por eso la función entera() existe.'
      },
      flow: { lit: ['express'], mode: 'idle' },
      bubble: { text: 'process.exit(1) termina con código de error. El 0 significa «todo bien»; cualquier otro número, «fallo».' },
      mood: 'talk'
    },

    {
      id: 'paso-18-1',
      step: 18,
      part: { n: 1, of: 3, label: 'Pool y Singleton' },
      phase: 'modelo',
      layer: 'config/',
      title: 'database.js · el pool de conexiones',
      file: 'persona-api/config/database.js',
      lead: [
        'Abrir una conexión a MySQL es costoso. El pool abre un grupo <strong>una sola vez</strong> ' +
        'y las presta y recoge según la demanda.',
        'Es como la fila de cajeros de un banco: el cliente no contrata un cajero nuevo, usa uno libre.'
      ],
      commands: [{ code: 'touch persona-api/config/database.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/config/database.js',
          lang: 'javascript',
          range: [40, 110],
          focus: [[74, 95]]
        }],
        caption: 'Al final del archivo: module.exports = new Database(). Exportamos una INSTANCIA, no la clase.'
      },
      flow: { lit: ['models', 'mysql'], mode: 'idle' },
      bubble: { text: 'Node cachea cada require, así que new Database() corre una sola vez. Todos los services comparten el mismo pool.' },
      mood: 'talk'
    },

    {
      id: 'paso-18-2',
      step: 18,
      part: { n: 2, of: 3, label: 'Inyección SQL' },
      phase: 'modelo',
      layer: 'config/',
      title: 'database.js · consultas parametrizadas',
      file: 'persona-api/config/database.js',
      lead: [
        'Este es <strong>el punto más importante del curso</strong>. Si <code>id</code> vale ' +
        '<code>1 OR 1=1</code>, la versión concatenada lee toda la tabla.',
        'Con el signo <code>?</code>, el driver envía la consulta y los valores <strong>por separado</strong>. ' +
        'MySQL compila primero y recibe los datos después: inyectar es estructuralmente imposible.'
      ],
      table: {
        head: ['', 'Código'],
        rows: [
          ['MAL',  'db.ejecutar(`SELECT * FROM USUARIO WHERE id = ${id}`)'],
          ['BIEN', 'db.ejecutar(\'SELECT * FROM USUARIO WHERE id = ?\', [id])']
        ]
      },
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/config/database.js',
          lang: 'javascript',
          range: [128, 170],
          focus: [[146, 149]]
        }],
        caption: 'Usamos execute() y no query(): execute usa prepared statements del lado del servidor.'
      },
      flow: { lit: ['services', 'models', 'mysql'], mode: 'request' },
      bubble: { text: 'La inyección SQL es la vulnerabilidad número uno de la web desde hace 25 años. El signo ? la elimina por completo.' },
      mood: 'surprised'
    },

    {
      id: 'paso-18-3',
      step: 18,
      part: { n: 3, of: 3, label: 'Transacciones' },
      phase: 'modelo',
      layer: 'config/',
      title: 'database.js · todo o nada',
      file: 'persona-api/config/database.js',
      lead: [
        'Una transacción es un bloque <strong>todo o nada</strong>. Si cualquier paso falla, ' +
        'se deshacen todos los anteriores y la base queda como estaba.',
        'Le pasamos la <code>conexion</code> al bloque para que todas las consultas viajen por ' +
        '<strong>la misma</strong>. Con el pool, cada consulta tomaría una distinta y la transacción no cubriría nada.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/config/database.js',
          lang: 'javascript',
          range: [186, 222],
          focus: [[207, 220]]
        }],
        caption: 'release() va en finally: se ejecuta siempre. Si se olvida, el pool se agota y la aplicación se congela sin dar error.'
      },
      flow: { lit: ['services', 'models', 'mysql'], mode: 'full' },
      bubble: { text: 'El error más común con pools es olvidar release(). Cada conexión no devuelta queda ocupada para siempre.' },
      mood: 'surprised'
    },

    {
      id: 'paso-19',
      step: 19,
      phase: 'modelo',
      layer: 'middleware/',
      title: 'logger.js · qué es un middleware',
      file: 'persona-api/middleware/logger.js',
      lead: [
        'Un middleware es una función <code>(req, res, next)</code> que Express ejecuta ' +
        '<strong>en cadena</strong>, en el orden en que se registra.',
        'Medimos el tiempo escuchando el evento <code>finish</code> de <code>res</code>: es el único ' +
        'momento en que conocemos el código de estado final.'
      ],
      commands: [{ code: 'touch persona-api/middleware/logger.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/middleware/logger.js',
          lang: 'javascript',
          range: [44, 88],
          focus: [[54, 71]]
        }]
      },
      output: {
        label: 'Salida real en la terminal',
        lines: [
          '[2026-10-09T22:37:16.059Z] GET /api/usuarios 200 12.4 ms',
          '[2026-10-09T22:37:19.311Z] POST /api/usuarios 201 18.7 ms',
          '[2026-10-09T22:37:22.880Z] GET /api/usuarios/99999 404 3.1 ms'
        ]
      },
      flow: { lit: ['express', 'middleware'], mode: 'request' },
      bubble: { text: 'Si un middleware no llama a next() ni responde, la petición se queda colgada para siempre. Es el error número uno con Express.' },
      mood: 'surprised'
    },

    {
      id: 'paso-20-1',
      step: 20,
      part: { n: 1, of: 3, label: 'Traducir MySQL' },
      phase: 'modelo',
      layer: 'middleware/',
      title: 'errorHandler · del código técnico al humano',
      file: 'persona-api/middleware/errorHandler.js',
      lead: [
        'MySQL devuelve <code>ER_DUP_ENTRY</code> o <code>ER_ROW_IS_REFERENCED_2</code>. ' +
        'Eso no se le puede mostrar a un usuario final.',
        'Aquí los traducimos a mensajes entendibles y al código HTTP adecuado.'
      ],
      commands: [{ code: 'touch persona-api/middleware/errorHandler.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/middleware/errorHandler.js',
          lang: 'javascript',
          range: [38, 86],
          focus: [[44, 60]]
        }]
      },
      flow: { lit: ['middleware', 'mysql'], mode: 'error' },
      bubble: { text: 'Traducir ECONNREFUSED a «verifica que MySQL esté encendido» le ahorra media hora de depuración a quien use tu API.' },
      mood: 'talk'
    },

    {
      id: 'paso-20-2',
      step: 20,
      part: { n: 2, of: 3, label: 'El manejador' },
      phase: 'modelo',
      layer: 'middleware/',
      title: 'errorHandler · un solo lugar decide',
      file: 'persona-api/middleware/errorHandler.js',
      lead: [
        'En los services y controllers simplemente lanzamos (<code>throw</code>). ' +
        '<strong>Nadie responde errores a mano.</strong> Todos terminan aquí.',
        'Los 5xx son bugs: registramos todo, incluido el stack. Los 4xx son del cliente: una línea basta.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/middleware/errorHandler.js',
          lang: 'javascript',
          range: [112, 150],
          focus: [[119, 124]]
        }],
        caption: 'REGLA DE ORO: el middleware de errores tiene CUATRO parámetros. Con tres, Express nunca lo invoca.'
      },
      flow: { lit: ['express', 'middleware'], mode: 'error' },
      bubble: { text: 'Si pones tres parámetros, Express lo registra como middleware normal y jamás atrapará un error. No avisa: simplemente no funciona.' },
      mood: 'surprised'
    },

    {
      id: 'paso-20-3',
      step: 20,
      part: { n: 3, of: 3, label: 'capturarAsync' },
      phase: 'modelo',
      layer: 'middleware/',
      title: 'errorHandler · adiós a 25 try/catch',
      file: 'persona-api/middleware/errorHandler.js',
      lead: [
        'Express 4 <strong>no atrapa</strong> los errores de funciones <code>async</code>. ' +
        'Si un controlador async lanza, la petición se cuelga.',
        'En vez de repetir <code>try/catch</code> en los 25 controladores, lo envolvemos una vez.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/middleware/errorHandler.js',
          lang: 'javascript',
          range: [172, 201],
          focus: [[193, 199]]
        }],
        caption: 'Gracias a esto, en los cuatro controladores no hay NI UN SOLO try/catch.'
      },
      flow: { lit: ['controllers', 'middleware'], mode: 'error' },
      bubble: { text: 'Promise.resolve() convierte el retorno en promesa aunque la función no sea async, y .catch(next) envía el error al manejador.' },
      mood: 'think'
    },

    {
      id: 'paso-21',
      step: 21,
      phase: 'modelo',
      layer: 'middleware/',
      title: 'validarParametros · fábrica de middlewares',
      file: 'persona-api/middleware/validarParametros.js',
      lead: [
        'Esta función <strong>no es</strong> el middleware: <strong>devuelve</strong> un middleware. ' +
        'Ese patrón (un <em>closure</em>) permite configurarlo al registrarlo.',
        'Si alguien pide <code>GET /api/usuarios/abc</code>, no tiene sentido abrir una conexión a MySQL: ' +
        'se rechaza con 400 de inmediato.'
      ],
      commands: [{ code: 'touch persona-api/middleware/validarParametros.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/middleware/validarParametros.js',
          lang: 'javascript',
          range: [26, 62],
          focus: [[37, 58]]
        }],
        caption: 'Para la llave compuesta se registra DOS veces: validarIdNumerico(\'redSocialId\'), validarIdNumerico(\'usuarioId\').'
      },
      flow: { lit: ['routes', 'middleware'], mode: 'idle' },
      bubble: { text: 'req.params y req.query SIEMPRE traen texto, nunca números. Convertirlos aquí evita repetir parseInt en 25 controladores.' },
      mood: 'talk'
    },

    {
      id: 'paso-22-1',
      step: 22,
      part: { n: 1, of: 4, label: 'Privados' },
      phase: 'modelo',
      layer: 'models/',
      title: 'Usuario · atributos privados de verdad',
      file: 'persona-api/models/Usuario.js',
      lead: [
        'El guion bajo <code>_nombre</code> es solo una <strong>convención</strong>: nada impide tocarlo. ' +
        'El numeral <code>#nombre</code> es <strong>sintaxis real</strong> del lenguaje.',
        'Intentar leerlo desde afuera no da un error en tiempo de ejecución: da un ' +
        '<code>SyntaxError</code> de compilación.'
      ],
      commands: [{ code: 'touch persona-api/models/Usuario.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/models/Usuario.js',
          lang: 'javascript',
          range: [33, 56],
          focus: [[37, 47]]
        }]
      },
      output: {
        label: 'Comprobación en Node',
        lines: [
          '$ node -e "const {Usuario} = require(\'./persona-api/models\'); ... console.log(u.#edad)"',
          'SyntaxError: Private field \'#edad\' must be declared in an enclosing class',
          '',
          '$ node -e "... console.log(Object.keys(u))"',
          '[]'
        ]
      },
      flow: { lit: ['models'], mode: 'idle' },
      bubble: { text: 'Object.keys() de una instancia devuelve un arreglo vacío. Los campos privados son invisibles hasta para la introspección.' },
      mood: 'surprised'
    },

    {
      id: 'paso-22-2',
      step: 22,
      part: { n: 2, of: 4, label: 'El setter' },
      phase: 'modelo',
      layer: 'models/',
      title: 'Usuario · el setter que mantiene la coherencia',
      file: 'persona-api/models/Usuario.js',
      lead: [
        'Esta es <strong>la</strong> razón de usar setters en lugar de atributos públicos.',
        'Al cambiar la fecha de nacimiento, la edad se <strong>recalcula sola</strong>. ' +
        'Es imposible tener una fecha de 1990 con una edad de 5 años.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/models/Usuario.js',
          lang: 'javascript',
          range: [151, 185],
          focus: [[164, 171]]
        }],
        caption: 'La regla de negocio vive DENTRO del objeto. El service no tiene que acordarse de recalcular.'
      },
      flow: { lit: ['models', 'utils'], mode: 'idle' },
      bubble: { text: 'El encapsulamiento no es poner # porque sí: es que el objeto se haga responsable de no quedar nunca en un estado imposible.' },
      mood: 'talk'
    },

    {
      id: 'paso-22-3',
      step: 22,
      part: { n: 3, of: 4, label: 'Fábricas' },
      phase: 'modelo',
      layer: 'models/',
      title: 'Usuario · desdeFila, el mapeador',
      file: 'persona-api/models/Usuario.js',
      lead: [
        'El constructor recibe <strong>nueve</strong> parámetros posicionales: equivocarse de orden ' +
        'es facilísimo. Las fábricas reciben un objeto con nombres.',
        'Este método traduce <code>snake_case</code> (MySQL) a <code>camelCase</code> (JavaScript). ' +
        'Es lo único que un ORM haría por nosotros.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/models/Usuario.js',
          lang: 'javascript',
          range: [352, 396],
          focus: [[362, 378]]
        }],
        caption: 'total_telefonos y total_perfiles_sociales solo llegan en el listado: ver el paso 26.'
      },
      flow: { lit: ['models', 'mysql'], mode: 'idle' },
      bubble: { text: 'Un método static pertenece a la clase, no a la instancia. Se llama Usuario.desdeFila(fila), nunca miUsuario.desdeFila(fila).' },
      mood: 'talk'
    },

    {
      id: 'paso-22-4',
      step: 22,
      part: { n: 4, of: 4, label: 'toJSON' },
      phase: 'modelo',
      layer: 'models/',
      title: 'Usuario · polimorfismo en acción',
      file: 'persona-api/models/Usuario.js',
      lead: [
        '<code>JSON.stringify()</code> busca y llama este método de forma <strong>automática</strong>.',
        'Gracias a eso el controlador puede hacer <code>res.json(usuario)</code> y los atributos ' +
        'privados se publican de forma controlada: nosotros decidimos qué sale y qué no.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/models/Usuario.js',
          lang: 'javascript',
          range: [437, 474],
          focus: [[466, 472]]
        }],
        caption: 'Serialización en cascada: cada Telefono y cada PerfilSocial tiene su propio toJSON().'
      },
      flow: { lit: ['models', 'controllers'], mode: 'idle' },
      bubble: { text: 'toJSON es un contrato que el lenguaje ya conoce. Implementarlo convierte tu clase en algo que stringify entiende solo.' },
      mood: 'talk'
    },

    {
      id: 'paso-23',
      step: 23,
      phase: 'modelo',
      layer: 'models/',
      title: 'Telefono · el getter normalizador',
      file: 'persona-api/models/Telefono.js',
      lead: [
        'El atributo <code>#usuario</code> puede guardar <strong>dos cosas</strong>: un número (el id) ' +
        'o una instancia completa de <code>Usuario</code>.',
        'Para que el resto del código no tenga que preguntar «¿qué me dieron?», el getter normaliza ' +
        'los dos casos y siempre devuelve un número.'
      ],
      commands: [{ code: 'touch persona-api/models/Telefono.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/models/Telefono.js',
          lang: 'javascript',
          range: [84, 134],
          focus: [[91, 105]]
        }],
        caption: 'El service llama telefono.desactivar() y persiste telefono.activo. El objeto decide cómo representar su estado.'
      },
      flow: { lit: ['models'], mode: 'idle' },
      bubble: { text: 'Para eso sirven los getters: esconder la complejidad detrás de una interfaz simple que no cambia aunque cambie el interior.' },
      mood: 'talk'
    },

    {
      id: 'paso-24',
      step: 24,
      phase: 'modelo',
      layer: 'models/',
      title: 'RedSocial · usar lo que el lenguaje ya trae',
      file: 'persona-api/models/RedSocial.js',
      lead: [
        'La clase más simple del proyecto: perfecta para fijar la estructura base antes de pasar ' +
        'a las relaciones.',
        'Usamos <code>new URL()</code> y no <code>split(\'/\')</code> porque entiende puertos, rutas, ' +
        'parámetros y subdominios.'
      ],
      commands: [{ code: 'touch persona-api/models/RedSocial.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/models/RedSocial.js',
          lang: 'javascript',
          range: [57, 100],
          focus: [[68, 77]]
        }],
        caption: 'obtenerDominio() → "linkedin.com"   ·   construirURLPerfil("gracehopper") → "https://www.linkedin.com/gracehopper"'
      },
      flow: { lit: ['models'], mode: 'idle' },
      bubble: { text: 'Si el lenguaje ya trae algo para parsear (URL, fechas, JSON), úsalo. Tu expresión regular casera fallará con el primer caso raro.' },
      mood: 'think'
    },

    {
      id: 'paso-25',
      step: 25,
      phase: 'modelo',
      layer: 'models/',
      title: 'PerfilSocial · un método privado y estático',
      file: 'persona-api/models/PerfilSocial.js',
      lead: [
        '<code>static #extraerId()</code> combina las dos cosas: pertenece a la clase ' +
        '(<code>static</code>) y solo se puede llamar desde dentro (<code>#</code>).',
        'Evita repetir la misma lógica en los dos getters de la llave compuesta. Es el principio ' +
        '<strong>DRY</strong> en una línea.'
      ],
      commands: [
        { code: 'touch persona-api/models/PerfilSocial.js' },
        { code: 'touch persona-api/models/index.js' }
      ],
      visual: {
        type: 'editor',
        tabs: [
          { file: 'persona-api/models/PerfilSocial.js', lang: 'javascript', range: [78, 116], focus: [[105, 114]] },
          { file: 'persona-api/models/index.js', lang: 'javascript', range: [1, 29], focus: [[22, 28]] }
        ],
        caption: 'require(\'../models\') encuentra index.js solo porque se llama así: es la convención de Node para una carpeta.'
      },
      flow: { lit: ['models'], mode: 'idle' },
      bubble: { text: 'Si la consulta trajo un JOIN, desdeFila construye también el objeto RedSocial. Así el JSON sale más rico sin una segunda petición.' },
      mood: 'talk'
    },

    // =================================================================
    // FASE · CAPAS DE LA API
    // =================================================================
    {
      id: 'paso-26-1',
      step: 26,
      part: { n: 1, of: 5, label: 'Lista blanca' },
      phase: 'capas',
      layer: 'services/',
      title: 'usuario.service · lo que el cliente NO puede enviar',
      file: 'persona-api/services/usuario.service.js',
      lead: [
        'Fíjate en lo que <strong>no</strong> está en la lista: <code>id</code> y <code>edad</code>. ' +
        'El id lo genera MySQL; la edad la calcula la API.',
        'Los <strong>valores</strong> se parametrizan con <code>?</code>, pero los <strong>nombres de ' +
        'columna</strong> no se pueden parametrizar: salen siempre del mapa, nunca del cliente.'
      ],
      commands: [{ code: 'touch persona-api/services/usuario.service.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/services/usuario.service.js',
          lang: 'javascript',
          range: [48, 82],
          focus: [[55, 63]]
        }]
      },
      flow: { lit: ['services', 'utils'], mode: 'idle' },
      bubble: { text: 'Si id y edad estuvieran en la lista, un cliente podría enviar { id:1, edad:999 } y corromper los datos de otro usuario.' },
      mood: 'surprised'
    },

    {
      id: 'paso-26-2',
      step: 26,
      part: { n: 2, of: 5, label: 'Problema N+1' },
      phase: 'capas',
      layer: 'services/',
      title: 'usuario.service · el problema N+1',
      file: 'persona-api/services/usuario.service.js',
      lead: [
        'El listado necesita cuántos teléfonos y perfiles tiene cada usuario. Lo ingenuo sería ' +
        '<strong>1 + 50 + 50 = 101 consultas</strong>. A 50 ms cada una, cinco segundos de espera.',
        'La solución es una <strong>subconsulta correlacionada</strong>: depende de la fila externa ' +
        '(<code>u.id</code>) pero viaja en la misma consulta.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/services/usuario.service.js',
          lang: 'javascript',
          range: [86, 137],
          focus: [[117, 126]]
        }],
        caption: 'Total: UNA consulta en lugar de 101. El alias u del FROM es lo que permite la correlación.'
      },
      flow: { lit: ['services', 'mysql'], mode: 'request' },
      bubble: { text: 'El problema N+1 es la causa número uno de APIs lentas. Si ves un await dentro de un bucle sobre filas, sospecha.' },
      mood: 'surprised'
    },

    {
      id: 'paso-26-3',
      step: 26,
      part: { n: 3, of: 5, label: 'WHERE dinámico' },
      phase: 'capas',
      layer: 'services/',
      title: 'usuario.service · filtros sin inyección',
      file: 'persona-api/services/usuario.service.js',
      lead: [
        'Dos arreglos en paralelo: uno con los <strong>textos</strong> de las condiciones y otro con ' +
        'los <strong>valores</strong>.',
        'El texto nunca contiene datos del cliente, solo signos <code>?</code>. Y los comodines ' +
        '<code>%</code> del LIKE van en el <strong>valor</strong>, no en la consulta.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/services/usuario.service.js',
          lang: 'javascript',
          range: [340, 382],
          focus: [[349, 363]]
        }],
        caption: 'Math.min protege el servidor: aunque pidan limite=100000, el tope real es 200.'
      },
      flow: { lit: ['services', 'mysql'], mode: 'request' },
      bubble: { text: 'Sin ese Math.min cualquiera puede tumbar la API pidiendo un millón de filas en una sola petición.' },
      mood: 'think'
    },

    {
      id: 'paso-26-4',
      step: 26,
      part: { n: 4, of: 5, label: 'Crear' },
      phase: 'capas',
      layer: 'services/',
      title: 'usuario.service · los cinco pasos de todo método',
      file: 'persona-api/services/usuario.service.js',
      lead: [
        '<strong>1</strong> normalizar · <strong>2</strong> validar · <strong>3</strong> instanciar · ' +
        '<strong>4</strong> persistir · <strong>5</strong> devolver el objeto.',
        'Y el id que genera MySQL se asigna <strong>por el setter</strong>, no tocando el atributo privado.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/services/usuario.service.js',
          lang: 'javascript',
          range: [440, 492],
          focus: [[455, 459]]
        }],
        caption: 'usuario.recalcularEdad() es la regla de negocio más importante de esta entidad.'
      },
      flow: { lit: ['controllers', 'services', 'models', 'mysql', 'utils'], mode: 'request' },
      bubble: { text: 'El service no sabe que existe HTTP. Podrías reutilizarlo tal cual desde una tarea programada o un bot de WhatsApp.' },
      mood: 'talk'
    },

    {
      id: 'paso-26-5',
      step: 26,
      part: { n: 5, of: 5, label: 'Eliminar' },
      phase: 'capas',
      layer: 'services/',
      title: 'usuario.service · borrar en cascada, a mano',
      file: 'persona-api/services/usuario.service.js',
      lead: [
        'El modelo usa <code>ON DELETE NO ACTION</code>: MySQL <strong>no</strong> borra en cascada. ' +
        'Hay que borrar en orden inverso a la dependencia.',
        'Si el último paso fallara sin transacción, el usuario se quedaría sin teléfonos ni perfiles: ' +
        'datos destruidos a medias.'
      ],
      ordered: [
        'PERFIL_SOCIAL — depende de USUARIO',
        'TELEFONO — depende de USUARIO',
        'USUARIO — ahora ya nadie lo referencia'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/services/usuario.service.js',
          lang: 'javascript',
          range: [578, 624],
          focus: [[586, 605]]
        }],
        caption: 'Dentro de la transacción usamos conexion.execute, NO db.ejecutar.'
      },
      flow: { lit: ['services', 'models', 'mysql'], mode: 'full' },
      bubble: { text: 'Con db.ejecutar cada consulta tomaría una conexión distinta del pool y la transacción no cubriría ninguna.' },
      mood: 'surprised'
    },

    {
      id: 'paso-27',
      step: 27,
      phase: 'capas',
      layer: 'services/',
      title: 'telefono.service · integridad referencial',
      file: 'persona-api/services/telefono.service.js',
      lead: [
        '«¿Y para qué validar, si MySQL ya tiene la llave foránea?» Porque MySQL devuelve ' +
        '<code>ER_NO_REFERENCED_ROW_2</code>, que nadie entiende.',
        'Validando antes respondemos <strong>«No existe un usuario con id 42»</strong>. ' +
        'La base sigue siendo la última línea de defensa; la API da el mensaje claro.'
      ],
      commands: [{ code: 'touch persona-api/services/telefono.service.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/services/telefono.service.js',
          lang: 'javascript',
          range: [116, 160],
          focus: [[122, 128]]
        }],
        caption: 'Y numero_telefono no tiene índice UNIQUE en el modelo: que no se repita es una regla NUESTRA.'
      },
      flow: { lit: ['services', 'models', 'mysql'], mode: 'request' },
      bubble: { text: 'Un service puede usar otro service. Eso es composición: cada clase sabe de lo suyo y colabora con las demás.' },
      mood: 'talk'
    },

    {
      id: 'paso-28',
      step: 28,
      phase: 'capas',
      layer: 'services/',
      title: 'redSocial.service · negarse a borrar',
      file: 'persona-api/services/redSocial.service.js',
      lead: [
        'Si borráramos «Instagram» mientras tres usuarios tienen perfiles ahí, esos perfiles quedarían ' +
        'apuntando a un id inexistente: <strong>datos huérfanos</strong>.'
      ],
      commands: [{ code: 'touch persona-api/services/redSocial.service.js' }],
      table: {
        head: ['Estrategia', 'Qué hace', '¿Sirve aquí?'],
        rows: [
          ['CASCADE',  'Borra también los perfiles', 'No: destruye datos sin pedirlo'],
          ['SET NULL', 'Deja el perfil sin red', 'No: la columna es parte de la llave primaria'],
          ['RESTRICT', 'Prohíbe el borrado y avisa', 'SÍ — la que elegimos']
        ]
      },
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/services/redSocial.service.js',
          lang: 'javascript',
          range: [244, 272],
          focus: [[255, 262]]
        }],
        caption: 'Respuesta real: 409 · "No se puede eliminar la red social 2 porque tiene perfiles sociales asociados. Perfiles asociados: 1."'
      },
      flow: { lit: ['services', 'mysql'], mode: 'error' },
      bubble: { text: 'Negarse a borrar con un mensaje claro es mejor servicio que borrar en cascada en silencio. El usuario decide qué hacer.' },
      mood: 'talk'
    },

    {
      id: 'paso-29',
      step: 29,
      phase: 'capas',
      layer: 'services/',
      title: 'perfilSocial.service · dos listas blancas',
      file: 'persona-api/services/perfilSocial.service.js',
      lead: [
        'En la <strong>creación</strong> aceptamos las dos llaves y la URL. ' +
        'En la <strong>actualización</strong>, solo la URL.',
        'Cambiar la llave compuesta no es «actualizar»: es borrar un recurso y crear otro distinto. ' +
        'Por eso es <strong>inmutable</strong>.'
      ],
      commands: [{ code: 'touch persona-api/services/perfilSocial.service.js' }],
      visual: {
        type: 'editor',
        tabs: [
          { file: 'persona-api/services/perfilSocial.service.js', lang: 'javascript', range: [37, 67], focus: [[38, 43]] },
          { file: 'persona-api/services/perfilSocial.service.js', lang: 'javascript', range: [128, 170], focus: [[135, 148]] }
        ],
        caption: 'Promise.all lanza las dos verificaciones de llave foránea EN PARALELO.'
      },
      flow: { lit: ['services', 'mysql'], mode: 'request' },
      bubble: { text: 'Con llave compuesta, TODOS los WHERE llevan las dos columnas. Olvidar una afectaría filas que no eran.' },
      mood: 'surprised'
    },

    {
      id: 'paso-30',
      step: 30,
      phase: 'capas',
      layer: 'controllers/',
      title: 'Los controladores · delgados a propósito',
      file: 'persona-api/controllers/usuario.controller.js',
      lead: [
        'Un controlador bien hecho no contiene <strong>ni una</strong> consulta SQL, ' +
        '<strong>ni una</strong> validación de negocio, <strong>ni un</strong> cálculo.',
        'Entre 3 y 8 líneas por método. Si crece, es que se le está metiendo lógica que pertenece al service.'
      ],
      commands: [
        { code: 'touch persona-api/controllers/usuario.controller.js' },
        { code: 'touch persona-api/controllers/telefono.controller.js' },
        { code: 'touch persona-api/controllers/redSocial.controller.js' },
        { code: 'touch persona-api/controllers/perfilSocial.controller.js' }
      ],
      table: {
        head: ['Propiedad', 'De dónde viene', 'Ejemplo'],
        rows: [
          ['req.params', 'La ruta', '/api/usuarios/7 → { id: "7" }'],
          ['req.query',  'La cadena de consulta', '?pagina=2 → { pagina: "2" }'],
          ['req.body',   'El cuerpo JSON', '{ "primerNombre": "Ada" }']
        ]
      },
      visual: {
        type: 'editor',
        tabs: [
          { file: 'persona-api/controllers/usuario.controller.js', lang: 'javascript', range: [38, 100], focus: [[88, 99]] },
          { file: 'persona-api/controllers/telefono.controller.js', lang: 'javascript', range: [122, 147], focus: [[136, 142]] }
        ],
        caption: 'POST responde 201 con cabecera Location. Y cambiarEstado(activar) DEVUELVE el manejador ya configurado.'
      },
      flow: { lit: ['controllers', 'services'], mode: 'request' },
      bubble: { text: 'Si ves un SELECT o un if (edad > 18) en un controlador, esa lógica está en la capa equivocada. Bájala al service.' },
      mood: 'talk'
    },

    {
      id: 'paso-31-1',
      step: 31,
      part: { n: 1, of: 2, label: 'El orden' },
      phase: 'capas',
      layer: 'routes/',
      title: 'Las rutas · el orden importa',
      file: 'persona-api/routes/usuario.routes.js',
      lead: [
        'Express evalúa de arriba hacia abajo y se detiene en la <strong>primera</strong> que coincide. ' +
        'Las rutas específicas van <strong>antes</strong> de las genéricas.',
        'Si pusiéramos <code>/:id</code> primero, la petición a <code>/api/usuarios/5/telefonos</code> ' +
        'nunca llegaría a su destino.'
      ],
      commands: [
        { code: 'touch persona-api/routes/usuario.routes.js' },
        { code: 'touch persona-api/routes/telefono.routes.js' },
        { code: 'touch persona-api/routes/redSocial.routes.js' },
        { code: 'touch persona-api/routes/perfilSocial.routes.js' }
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/routes/usuario.routes.js',
          lang: 'javascript',
          range: [56, 101],
          focus: [[62, 85]]
        }],
        caption: 'La URL nombra COSAS (sustantivos), no acciones. La acción la indica el verbo HTTP.'
      },
      flow: { lit: ['express', 'routes', 'controllers'], mode: 'request' },
      bubble: { text: 'BIEN: /api/redes-sociales. MAL: /api/obtenerRedesSociales. Plural, minúsculas y kebab-case: esa es la convención REST.' },
      mood: 'talk'
    },

    {
      id: 'paso-31-2',
      step: 31,
      part: { n: 2, of: 2, label: 'Llave compuesta' },
      phase: 'capas',
      layer: 'routes/',
      title: 'Las rutas · dos segmentos y el enrutador principal',
      file: 'persona-api/routes/perfilSocial.routes.js',
      lead: [
        'El orden de los segmentos imita el de la llave primaria de la tabla. Mantener esa coherencia ' +
        'entre base de datos, API y frontend hace el sistema predecible.',
        'Y <code>routes/index.js</code> monta los cuatro routers bajo su prefijo: la URL final es la ' +
        '<strong>suma</strong> de los prefijos de la cadena.'
      ],
      visual: {
        type: 'editor',
        tabs: [
          { file: 'persona-api/routes/perfilSocial.routes.js', lang: 'javascript', range: [36, 62], focus: [[40, 46]] },
          { file: 'persona-api/routes/index.js', lang: 'javascript', range: [60, 94], focus: [[88, 92]] }
        ],
        caption: 'PRIMARY KEY (RED_SOCIAL_id, USUARIO_id)  →  /api/perfiles-sociales/4/3'
      },
      flow: { lit: ['express', 'routes'], mode: 'idle' },
      bubble: { text: 'GET /api/salud verifica la API y la base de datos. En producción lo consultan los balanceadores para decidir si el servidor está sano.' },
      mood: 'talk'
    },

    {
      id: 'paso-32',
      step: 32,
      phase: 'capas',
      layer: 'config/',
      title: 'config/express.js · CORS y el orden de los middlewares',
      file: 'persona-api/config/express.js',
      lead: [
        'El navegador bloquea las peticiones hacia un <strong>origen</strong> distinto. ' +
        'Frontend en el puerto 5500, API en el 3000: son orígenes distintos.',
        'CORS es el servidor diciendo «autorizo a este origen». Y el orden de los <code>app.use()</code> ' +
        'sigue el viaje real de una petición.'
      ],
      commands: [{ code: 'touch persona-api/config/express.js' }],
      ordered: [
        'CORS — permiso del navegador',
        'express.json() — convertir el cuerpo en objeto',
        'logger — registrar la petición',
        'rutas — atender la petición',
        '404 — ninguna ruta coincidió',
        'errores — SIEMPRE el último'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/config/express.js',
          lang: 'javascript',
          range: [73, 152],
          focus: [[83, 101]]
        }],
        caption: 'NO uses origin: "*". Una API abierta a cualquier origen puede ser consumida por cualquier sitio web.'
      },
      flow: { lit: ['cliente', 'express', 'middleware', 'routes'], mode: 'boot' },
      bubble: { text: 'Separar express.js de index.js permite CREAR la app sin ARRANCAR el servidor. Eso es lo que hace posible escribir tests.' },
      mood: 'talk'
    },

    {
      id: 'paso-33',
      step: 33,
      phase: 'capas',
      layer: 'raíz',
      title: 'index.js · encender y apagar bien',
      file: 'persona-api/index.js',
      lead: [
        'Sin rutas, sin SQL, sin validaciones: solo el <strong>ciclo de vida</strong>.',
        'Al pulsar Ctrl+C llega la señal <code>SIGINT</code>. Si no la atendemos, Node muere de golpe ' +
        'y deja conexiones abiertas y peticiones a medio responder.'
      ],
      commands: [{ code: 'touch persona-api/index.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-api/index.js',
          lang: 'javascript',
          range: [84, 122],
          focus: [[92, 108]]
        }],
        caption: 'Apagado elegante: dejar de aceptar peticiones, terminar las que están en curso, cerrar el pool y recién salir.'
      },
      flow: { lit: ['express', 'mysql'], mode: 'boot' },
      bubble: { text: 'El setTimeout de 10 segundos es la red de seguridad: si el cierre se cuelga, el proceso sale a la fuerza en vez de quedarse vivo.' },
      mood: 'think'
    },

    {
      id: 'paso-34-1',
      step: 34,
      part: { n: 1, of: 3, label: 'Arrancar' },
      phase: 'capas',
      layer: 'terminal',
      title: 'Arrancar la API',
      lead: [
        'La API comprueba MySQL <strong>antes</strong> de abrir el puerto. Si falla, muestra una lista ' +
        'de verificación en vez de un stack trace.'
      ],
      commands: [
        { label: 'Producción', code: 'cd persona-api && npm start' },
        { label: 'Desarrollo (reinicia al guardar)', code: 'npm run dev' }
      ],
      visual: {
        type: 'output',
        label: 'Salida real del arranque',
        lines: [
          'Verificando conexion con MySQL...',
          'Conexion con MySQL establecida.',
          '',
          '==============================================================',
          '  persona-api  ·  API REST Personal Management',
          '==============================================================',
          '  Entorno        : development',
          '  Servidor       : http://localhost:3000',
          '  Documentacion  : http://localhost:3000/api',
          '  Estado salud   : http://localhost:3000/api/salud',
          '  Base de datos  : personal_management @ localhost:3306',
          '  Usuario MySQL  : pm_user',
          '  Origenes CORS  : http://localhost:5500, http://127.0.0.1:5500',
          '==============================================================',
          '  Presiona Ctrl + C para detener el servidor'
        ]
      },
      flow: { lit: ['express', 'routes', 'controllers', 'services', 'models', 'mysql'], mode: 'boot' },
      bubble: { text: 'npm run dev usa node --watch, que viene con Node 18+. No hace falta instalar nodemon para recargar al guardar.' },
      mood: 'celebrate'
    },

    {
      id: 'paso-34-2',
      step: 34,
      part: { n: 2, of: 3, label: 'Probar con curl' },
      phase: 'capas',
      layer: 'terminal',
      title: 'Probar los endpoints',
      lead: [
        'Probar los casos de <strong>error</strong> es tan importante como los de éxito. ' +
        'Una API que funciona con datos correctos pero revienta con datos malos no está terminada.'
      ],
      commands: [
        { label: 'Crear (la API ignora edad e id)', code: 'curl -s -X POST http://localhost:3000/api/usuarios \\\n  -H \'Content-Type: application/json\' \\\n  -d \'{"primerNombre":"  ada  ","primerApellido":"lovelace",\n       "fechaNacimiento":"1815-12-10","ciudadDomicilio":"londres",\n       "edad":999,"id":1}\'' },
        { label: 'Provocar un error de validación', code: 'curl -s -X POST http://localhost:3000/api/usuarios \\\n  -H \'Content-Type: application/json\' -d \'{"primerNombre": "Ana"}\'' }
      ],
      visual: {
        type: 'editor',
        caption: 'Los TRES errores de una sola vez: eso es el ColectorErrores del paso 14.',
        tabs: [{
          inline: '{\n    "ok": false,\n    "error": {\n        "codigo": "VALIDACION",\n        "mensaje": "No se pudo crear el usuario porque hay datos invalidos.",\n        "detalles": [\n            { "campo": "primerApellido",  "mensaje": "El campo \\"primerApellido\\" es obligatorio." },\n            { "campo": "ciudadDomicilio", "mensaje": "El campo \\"ciudadDomicilio\\" es obligatorio." },\n            { "campo": "fechaNacimiento", "mensaje": "El campo \\"fechaNacimiento\\" es obligatorio." }\n        ]\n    }\n}',
          name: 'respuesta-400.json',
          lang: 'json'
        }]
      },
      flow: { lit: ['cliente', 'express', 'routes', 'controllers', 'services', 'utils', 'middleware'], mode: 'error' },
      bubble: { text: 'Mandamos edad:999 e id:1 y la API los ignoró: la edad quedó en 210 y el id lo puso MySQL. La lista blanca funcionando.' },
      mood: 'surprised'
    },

    {
      id: 'paso-34-3',
      step: 34,
      part: { n: 3, of: 3, label: 'Probador' },
      phase: 'capas',
      layer: 'terminal',
      title: 'Probador interactivo',
      lead: [
        'Elige una petición con las flechas <strong>arriba</strong> y <strong>abajo</strong>, y pulsa ' +
        '<strong>Enviar</strong> para ver cómo viaja por las capas.',
        'Las respuestas son las reales de esta API, copiadas de la ejecución de las pruebas.'
      ],
      visual: { type: 'tester' },
      flow: { lit: ['cliente', 'express', 'routes', 'controllers', 'services', 'models', 'mysql'], mode: 'idle' },
      bubble: { text: 'Mira el recorrido de arriba: el paquete entra por Cliente y vuelve con la respuesta. En los errores se devuelve en rojo.' },
      mood: 'talk'
    },

    // =================================================================
    // FASE · FRONTEND
    // =================================================================
    {
      id: 'paso-35',
      step: 35,
      phase: 'frontend',
      layer: 'persona-frontend/',
      title: 'Atomic Design · cinco niveles',
      lead: [
        'Una metodología de Brad Frost que organiza la interfaz de lo más pequeño a lo más grande. ' +
        'Las <strong>mismas cinco carpetas</strong> en CSS y en JavaScript.',
        'La regla que sostiene el sistema: <strong>una molécula no redefine el estilo de sus átomos</strong>; ' +
        'solo los organiza en el espacio.'
      ],
      commands: [
        { code: 'mkdir -p persona-frontend/css/{01-tokens,02-base,03-atomos,04-moleculas,05-organismos,06-plantillas,07-paginas}' },
        { code: 'mkdir -p persona-frontend/js/{config,servicios,utiles,atomos,moleculas,organismos,plantillas,paginas}' }
      ],
      table: {
        head: ['Nivel', 'Qué es', 'Ejemplos', 'Líneas CSS'],
        rows: [
          ['1 · Átomos',     'Indivisible',              'botón, campo, icono, insignia',   '686'],
          ['2 · Moléculas',  'Átomos con UNA función',   'campo de formulario, paginador',  '714'],
          ['3 · Organismos', 'Sección completa',         'barra, tabla, modal, formulario', '1194'],
          ['4 · Plantillas', 'Estructura sin contenido', 'panel de administración',         '169'],
          ['5 · Páginas',    'Plantilla con contenido',  'usuarios, teléfonos, redes',      '104']
        ]
      },
      visual: {
        type: 'explorer',
        caption: 'Nomenclatura: a- átomo · m- molécula · o- organismo · t- plantilla · p- página. Dentro, BEM.',
        tree: [
          { depth: 0, name: 'css/', kind: 'folder' },
          { depth: 1, name: '01-tokens/',    kind: 'folder', note: 'variables · afecta a TODO' },
          { depth: 1, name: '02-base/',      kind: 'folder', note: 'reset y estilos base' },
          { depth: 1, name: '03-atomos/',    kind: 'folder', note: '.a-boton · .a-campo-texto' },
          { depth: 1, name: '04-moleculas/', kind: 'folder', note: '.m-campo-formulario' },
          { depth: 1, name: '05-organismos/',kind: 'folder', note: '.o-tabla-datos · .o-modal' },
          { depth: 1, name: '06-plantillas/',kind: 'folder', note: '.t-panel-administracion' },
          { depth: 1, name: '07-paginas/',   kind: 'folder', note: '.p-recursos · el más pequeño' },
          { depth: 1, name: 'main.css',      kind: 'css',    note: 'único punto de entrada' }
        ]
      },
      flow: { lit: ['cliente'], mode: 'idle' },
      bubble: { text: 'Si la carpeta 07-paginas creciera mucho, sería la señal de que falta un componente reutilizable más abajo.' },
      mood: 'talk'
    },

    {
      id: 'paso-36',
      step: 36,
      phase: 'frontend',
      layer: '01-tokens/',
      title: 'Tokens · nombres semánticos, no colores sueltos',
      file: 'persona-frontend/css/01-tokens/_colores.css',
      lead: [
        'Un token es una variable con nombre <strong>semántico</strong>. Si el cliente pide cambiar ' +
        'el morado por un azul, se cambia <strong>una</strong> línea.',
        'La palabra «sobre» (del inglés <em>on</em>) indica que ese color va <strong>encima</strong> del ' +
        'otro, con contraste suficiente para cumplir WCAG AA.'
      ],
      commands: [{ code: 'touch persona-frontend/css/01-tokens/_colores.css' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-frontend/css/01-tokens/_colores.css',
          lang: 'css',
          range: [28, 60],
          focus: [[30, 33]]
        }],
        caption: 'En Material 3 el tema oscuro NO es invertir: el primario se vuelve más CLARO y menos saturado.'
      },
      flow: { lit: [], mode: 'idle' },
      bubble: { text: 'Las variables CSS NO funcionan dentro de @media. Los puntos de quiebre hay que escribirlos con su valor literal.' },
      mood: 'surprised'
    },

    {
      id: 'paso-37',
      step: 37,
      phase: 'frontend',
      layer: '02-base/',
      title: 'Reset · y el foco que nunca se quita',
      file: 'persona-frontend/css/02-base/_reset.css',
      lead: [
        '<code>box-sizing: border-box</code> es la primera regla de todo frontend: con ella ' +
        '<code>width: 200px</code> mide 200px, punto.',
        'Y <strong>nunca, jamás</strong>, se escribe <code>outline: none</code> sin poner un reemplazo: ' +
        'quien navega con teclado depende del contorno para saber dónde está.'
      ],
      commands: [
        { code: 'touch persona-frontend/css/02-base/_reset.css' },
        { code: 'touch persona-frontend/css/02-base/_base.css' }
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-frontend/css/02-base/_reset.css',
          lang: 'css',
          range: [160, 201],
          focus: [[175, 179]]
        }],
        caption: 'prefers-reduced-motion en 0.01ms y no en 0s: así los eventos transitionend siguen disparándose.'
      },
      flow: { lit: [], mode: 'idle' },
      bubble: { text: ':focus-visible es mejor que :focus porque el navegador decide: solo muestra el contorno al navegar con teclado.' },
      mood: 'talk'
    },

    {
      id: 'paso-38',
      step: 38,
      phase: 'frontend',
      layer: '03-atomos/',
      title: 'Átomos · la capa de estado de Material',
      file: 'persona-frontend/css/03-atomos/_a-boton.css',
      lead: [
        'Material <strong>no</strong> cambia el color del botón al pasar el puntero: le superpone una capa ' +
        'del color del <strong>texto</strong> con opacidad baja.',
        'Funciona igual para todas las variantes sin calcular un color de hover para cada una. ' +
        'Una sola regla cubre relleno, contorno y texto.'
      ],
      commands: [{ code: 'touch persona-frontend/css/03-atomos/_a-boton.css' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-frontend/css/03-atomos/_a-boton.css',
          lang: 'css',
          range: [58, 95],
          focus: [[71, 90]]
        }],
        caption: 'Regla de oro: solo UN botón relleno por pantalla. Si todo es principal, nada lo es.'
      },
      flow: { lit: [], mode: 'idle' },
      bubble: { text: 'Deshabilitamos con el atributo [disabled], no con una clase: el atributo también impide el clic y saca el botón del tabulador.' },
      mood: 'talk'
    },

    {
      id: 'paso-39',
      step: 39,
      phase: 'frontend',
      layer: '04-moleculas/',
      title: 'Moléculas · los cuatro estados de una vista',
      file: 'persona-frontend/css/04-moleculas/_m-campo-formulario.css',
      lead: [
        'El descuido más frecuente al aprender frontend: se programa solo el caso feliz.',
        'Si falta el estado vacío, el usuario ve un rectángulo en blanco y no sabe si la aplicación se ' +
        'rompió, si sigue cargando o si de verdad no hay nada.'
      ],
      commands: [
        { code: 'touch persona-frontend/css/04-moleculas/_m-campo-formulario.css' },
        { code: 'touch persona-frontend/css/04-moleculas/_m-estado-vacio.css' }
      ],
      ordered: [
        'CARGANDO — un cargador o un esqueleto',
        'VACÍO — .m-estado-vacio con una acción',
        'ERROR — .m-estado-vacio--error con «Reintentar»',
        'CON DATOS — la tabla o la lista'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-frontend/css/04-moleculas/_m-campo-formulario.css',
          lang: 'css',
          range: [26, 70],
          focus: [[29, 34]]
        }],
        caption: 'min-width: 0 dentro de un grid o flex: sin esto, un campo con contenido largo se niega a encogerse.'
      },
      flow: { lit: [], mode: 'idle' },
      bubble: { text: 'Un buen estado vacío responde tres preguntas: qué pasa, por qué, y qué puedo hacer. Las tres, no solo la primera.' },
      mood: 'think'
    },

    {
      id: 'paso-40-1',
      step: 40,
      part: { n: 1, of: 2, label: 'Tabla → tarjetas' },
      phase: 'frontend',
      layer: '05-organismos/',
      title: 'Organismos · la tabla que se vuelve tarjetas',
      file: 'persona-frontend/css/05-organismos/_o-tabla-datos.css',
      lead: [
        'Una tabla de 8 columnas no cabe en 360px. El truco son los atributos ' +
        '<code>data-etiqueta</code> y la función <code>attr()</code> de CSS.',
        'El <strong>mismo HTML</strong> sirve para tabla y para tarjetas: solo cambia el CSS.'
      ],
      commands: [{ code: 'touch persona-frontend/css/05-organismos/_o-tabla-datos.css' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-frontend/css/05-organismos/_o-tabla-datos.css',
          lang: 'css',
          range: [177, 240],
          focus: [[230, 239]]
        }],
        caption: 'El encabezado se oculta de forma ACCESIBLE con clip-path: sigue existiendo para el lector de pantalla.'
      },
      flow: { lit: [], mode: 'idle' },
      bubble: { text: 'Usamos table de verdad, no div. Los lectores de pantalla saben navegar tablas por filas y columnas, pero solo si el HTML es semántico.' },
      mood: 'talk'
    },

    {
      id: 'paso-40-2',
      step: 40,
      part: { n: 2, of: 2, label: 'dialog nativo' },
      phase: 'frontend',
      layer: '05-organismos/',
      title: 'Organismos · lo que el navegador ya resuelve',
      file: 'persona-frontend/css/05-organismos/_o-modal.css',
      lead: [
        '<code>showModal()</code> regala gratis: atrapar el foco, cerrar con Escape, dejar inerte el ' +
        'resto de la página, dibujar el velo y devolver el foco al cerrar.',
        'Hacer todo eso con <code>&lt;div&gt;</code> son unas 150 líneas delicadas, y es la causa número ' +
        'uno de modales inaccesibles en la web.'
      ],
      commands: [{ code: 'touch persona-frontend/css/05-organismos/_o-modal.css' }],
      visual: {
        type: 'editor',
        tabs: [
          { file: 'persona-frontend/css/05-organismos/_o-modal.css', lang: 'css', range: [21, 68], focus: [[28, 42]] },
          { file: 'persona-frontend/css/05-organismos/_o-formulario.css', lang: 'css', range: [40, 60], focus: [[47, 47]] }
        ],
        caption: 'repeat(auto-fit, minmax(14rem, 1fr)): 1 columna en móvil, 2 en tablet, 3 en escritorio. Sin media queries.'
      },
      flow: { lit: [], mode: 'idle' },
      bubble: { text: 'Nuestro reset tiene * { margin: 0 } y eso pisó el margin: auto con que el navegador centra el dialog. Hubo que reponerlo.' },
      mood: 'surprised'
    },

    {
      id: 'paso-41',
      step: 41,
      phase: 'frontend',
      layer: '06-plantillas/',
      title: 'main.css · el orden ES la arquitectura',
      file: 'persona-frontend/css/main.css',
      lead: [
        'Por la <strong>cascada</strong>: cuando dos reglas tienen la misma especificidad, gana la ' +
        '<strong>última</strong> declarada.',
        'Si los átomos se cargaran después de los organismos, un organismo no podría organizar nada.'
      ],
      commands: [
        { code: 'touch persona-frontend/css/06-plantillas/_t-panel-administracion.css' },
        { code: 'touch persona-frontend/css/main.css' }
      ],
      visual: {
        type: 'editor',
        tabs: [
          { file: 'persona-frontend/css/main.css', lang: 'css', range: [41, 80], focus: [[42, 50]] },
          { file: 'persona-frontend/css/06-plantillas/_t-panel-administracion.css', lang: 'css', range: [30, 80], focus: [[54, 76]] }
        ],
        caption: '@import dispara una petición por archivo. En desarrollo muestra la arquitectura; para producción se concatenaría.'
      },
      flow: { lit: [], mode: 'idle' },
      bubble: { text: 'Todas las áreas que pidan los hijos deben estar declaradas. Si falta una, CSS Grid crea columnas implícitas y deforma el layout.' },
      mood: 'surprised'
    },

    {
      id: 'paso-42-1',
      step: 42,
      part: { n: 1, of: 2, label: 'XSS' },
      phase: 'frontend',
      layer: 'js/utiles/',
      title: 'dom.js · por qué NO usamos innerHTML',
      file: 'persona-frontend/js/utiles/dom.js',
      lead: [
        'Si un usuario se llama <code>&lt;img src=x onerror="…"&gt;</code> y lo insertamos con ' +
        '<code>innerHTML</code>, el navegador <strong>ejecuta</strong> ese código. Eso es un ataque <strong>XSS</strong>.',
        'Con <code>textContent</code> se muestra el texto literal y nada se ejecuta. Es seguro por diseño.'
      ],
      commands: [{ code: 'touch persona-frontend/js/utiles/dom.js' }],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-frontend/js/utiles/dom.js',
          lang: 'javascript',
          range: [48, 110],
          focus: [[62, 73]]
        }],
        caption: 'Regla práctica: innerHTML solo con texto que escribimos nosotros (los trazados de los iconos), nunca con datos de la API.'
      },
      flow: { lit: ['cliente'], mode: 'idle' },
      bubble: { text: 'Los SVG necesitan createElementNS con su namespace. Con createElement("svg") el navegador crea un elemento desconocido y no dibuja nada.' },
      mood: 'surprised'
    },

    {
      id: 'paso-42-2',
      step: 42,
      part: { n: 2, of: 2, label: 'Debounce' },
      phase: 'frontend',
      layer: 'js/utiles/',
      title: 'dom.js · el debounce del buscador',
      file: 'persona-frontend/js/utiles/dom.js',
      lead: [
        'Sin debounce, escribir «hopper» dispara <strong>6 peticiones</strong>. De esas, solo la última ' +
        'le interesa al usuario.',
        'Peor aún: las respuestas pueden llegar <strong>desordenadas</strong>. Si la de «hop» tarda más ' +
        'que la de «hopper», el usuario ve resultados equivocados. Eso es una <em>condición de carrera</em>.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-frontend/js/utiles/dom.js',
          lang: 'javascript',
          range: [186, 220],
          focus: [[203, 216]]
        }],
        caption: 'temporizador vive en el closure: persiste entre llamadas sin ser una variable global.'
      },
      flow: { lit: ['cliente'], mode: 'idle' },
      bubble: { text: 'El debounce es la optimización más rentable de cualquier buscador: seis peticiones se convierten en una.' },
      mood: 'think'
    },

    {
      id: 'paso-43',
      step: 43,
      phase: 'frontend',
      layer: 'js/servicios/',
      title: 'clienteApi.js · fetch NO lanza con un 404',
      file: 'persona-frontend/js/servicios/clienteApi.js',
      lead: [
        'Esto sorprende a todo el mundo la primera vez: <code>fetch</code> solo falla si la petición ' +
        '<strong>no llegó a salir</strong> (sin red, CORS, DNS).',
        'Un 404 o un 500 llegan como respuesta normal. Hay que revisar <code>respuesta.ok</code> a mano.'
      ],
      commands: [
        { code: 'touch persona-frontend/js/servicios/clienteApi.js' },
        { code: 'touch persona-frontend/js/servicios/usuario.servicio.js' }
      ],
      visual: {
        type: 'editor',
        tabs: [
          { file: 'persona-frontend/js/servicios/clienteApi.js', lang: 'javascript', range: [196, 240], focus: [[208, 217]] },
          { file: 'persona-frontend/js/servicios/clienteApi.js', lang: 'javascript', range: [140, 180], focus: [[155, 157]] }
        ],
        caption: 'fetch tampoco tiene timeout. AbortController lo resuelve: a los 10 s llamamos a abort() y la promesa se rechaza.'
      },
      flow: { lit: ['cliente', 'express'], mode: 'request' },
      bubble: { text: 'Sin timeout, si el servidor no responde la promesa queda pendiente para siempre y el usuario mira el spinner eternamente.' },
      mood: 'surprised'
    },

    {
      id: 'paso-44',
      step: 44,
      phase: 'frontend',
      layer: 'js/atomos/',
      title: 'Átomos JS · funciones puras de presentación',
      file: 'persona-frontend/js/atomos/boton.js',
      lead: [
        'Tres condiciones: no importa ningún otro componente, no sabe nada de la API, y con las mismas ' +
        'propiedades siempre produce el mismo elemento.',
        'Fíjate en que <code>etiqueta</code> <strong>no tiene valor por defecto</strong>: un botón sin ' +
        'texto necesita <code>aria-label</code> o el lector de pantalla solo anuncia «botón».'
      ],
      commands: [
        { code: 'touch persona-frontend/js/atomos/boton.js' },
        { code: 'touch persona-frontend/js/atomos/campos.js' },
        { code: 'touch persona-frontend/js/atomos/insignia.js' },
        { code: 'touch persona-frontend/js/atomos/cargador.js' }
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-frontend/js/atomos/boton.js',
          lang: 'javascript',
          range: [94, 135],
          focus: [[117, 128]]
        }],
        caption: 'type="button" importa: sin él, un botón dentro de un form actúa como submit y lo envía sin querer.'
      },
      flow: { lit: ['cliente'], mode: 'idle' },
      bubble: { text: 'aria-label lo lee el lector de pantalla; title lo ve el usuario de ratón. Dos usuarios, una sola fuente de verdad.' },
      mood: 'talk'
    },

    {
      id: 'paso-45',
      step: 45,
      phase: 'frontend',
      layer: 'js/moleculas/',
      title: 'Moléculas JS · devolver un objeto, no un elemento',
      file: 'persona-frontend/js/moleculas/campoFormulario.js',
      lead: [
        'Si solo devolviéramos el <code>&lt;div&gt;</code>, quien lo use tendría que buscar el input por ' +
        'dentro y conocer su estructura interna.',
        'Con el objeto, la estructura queda escondida detrás de una interfaz estable. ' +
        '<strong>Es el mismo principio de los getters y setters del backend</strong>, aplicado a la interfaz.'
      ],
      commands: [
        { code: 'touch persona-frontend/js/moleculas/campoFormulario.js' },
        { code: 'touch persona-frontend/js/moleculas/notificacion.js' },
        { code: 'touch persona-frontend/js/moleculas/paginador.js' }
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-frontend/js/moleculas/campoFormulario.js',
          lang: 'javascript',
          range: [160, 212],
          focus: [[183, 194]]
        }],
        caption: 'mostrarError hace TRES cosas: escribe el texto, muestra el bloque y pone aria-invalid="true".'
      },
      flow: { lit: ['cliente'], mode: 'idle' },
      bubble: { text: 'aria-invalid informa al lector de pantalla Y activa el borde rojo del CSS. Un atributo ARIA resuelve dos problemas a la vez.' },
      mood: 'talk'
    },

    {
      id: 'paso-46',
      step: 46,
      phase: 'frontend',
      layer: 'js/organismos/',
      title: 'Organismos JS · una tabla para cuatro entidades',
      file: 'persona-frontend/js/organismos/tablaDatos.js',
      lead: [
        'En lugar de escribir cuatro tablas casi idénticas, escribimos <strong>una</strong> que recibe la ' +
        '<strong>descripción</strong> de sus columnas.',
        '<code>obtener</code> es una función que extrae el valor y puede devolver texto <strong>o un nodo ' +
        'del DOM</strong>. Así la tabla sirve para cualquier dato.'
      ],
      commands: [
        { code: 'touch persona-frontend/js/organismos/tablaDatos.js' },
        { code: 'touch persona-frontend/js/organismos/modal.js' },
        { code: 'touch persona-frontend/js/organismos/formulario.js' }
      ],
      visual: {
        type: 'editor',
        tabs: [
          { file: 'persona-frontend/js/organismos/tablaDatos.js', lang: 'javascript', range: [84, 130], focus: [[95, 102]] },
          { file: 'persona-frontend/js/organismos/modal.js', lang: 'javascript', range: [128, 172], focus: [[137, 141]] }
        ],
        caption: 'data-etiqueta es lo que el CSS lee con attr() para convertir la tabla en tarjetas en móvil.'
      },
      flow: { lit: ['cliente'], mode: 'idle' },
      bubble: { text: 'Inversión de control: el componente no decide QUÉ mostrar, solo CÓMO. Lo que se muestra lo decide quien lo usa.' },
      mood: 'talk'
    },

    {
      id: 'paso-47',
      step: 47,
      phase: 'frontend',
      layer: 'js/paginas/',
      title: 'Páginas · el único nivel que llama a la API',
      file: 'persona-frontend/js/paginas/paginaUsuarios.js',
      lead: [
        'Las páginas son las únicas con permiso para llamar a los servicios, guardar estado y orquestar ' +
        'los organismos entre sí.',
        'Los niveles de abajo son «tontos» a propósito: reciben datos y manejadores. Esa es la razón ' +
        'por la que se pueden reutilizar.'
      ],
      commands: [
        { code: 'touch persona-frontend/js/plantillas/panelAdministracion.js' },
        { code: 'touch persona-frontend/js/paginas/paginaUsuarios.js' },
        { code: 'touch persona-frontend/js/paginas/paginaTelefonos.js' },
        { code: 'touch persona-frontend/js/paginas/paginaRedesSociales.js' },
        { code: 'touch persona-frontend/js/paginas/paginaPerfilesSociales.js' }
      ],
      visual: {
        type: 'editor',
        tabs: [
          { file: 'persona-frontend/js/paginas/paginaUsuarios.js', lang: 'javascript', range: [100, 126], focus: [[107, 123]] },
          { file: 'persona-frontend/js/paginas/paginaUsuarios.js', lang: 'javascript', range: [455, 500], focus: [[460, 470]] }
        ],
        caption: 'El estado vive en el closure: variables que persisten mientras la página exista, sin contaminar el ámbito global.'
      },
      flow: { lit: ['cliente', 'express', 'routes', 'controllers', 'services', 'models', 'mysql'], mode: 'request' },
      bubble: { text: 'La barra de búsqueda se crea UNA vez, fuera del render. Si se recreara, el campo perdería el foco en cada tecla.' },
      mood: 'surprised'
    },

    {
      id: 'paso-48',
      step: 48,
      phase: 'frontend',
      layer: 'raíz',
      title: 'main.js e index.html · enrutar con el hash',
      file: 'persona-frontend/js/main.js',
      lead: [
        'Cambiar el hash <strong>no recarga</strong> la página y no necesita configuración del servidor. ' +
        'Con rutas reales, al recargar <code>/usuarios</code> el servidor estático daría 404.',
        'Y hay <strong>un solo camino</strong> para cambiar de sección: el hash. Da igual si el usuario ' +
        'pulsó el menú, escribió la URL o usó el botón Atrás.'
      ],
      commands: [
        { code: 'touch persona-frontend/js/main.js' },
        { code: 'touch persona-frontend/index.html' }
      ],
      visual: {
        type: 'editor',
        tabs: [
          { file: 'persona-frontend/js/main.js', lang: 'javascript', range: [126, 160], focus: [[131, 137]] },
          { file: 'persona-frontend/index.html', lang: 'xml', range: [36, 66], focus: [[47, 51]] }
        ],
        caption: 'La etiqueta viewport es obligatoria: sin ella el móvil finge una pantalla de 980px y las media queries no se activan.'
      },
      flow: { lit: ['cliente'], mode: 'idle' },
      bubble: { text: 'Nunca pongas user-scalable=no: impide ampliar la página y para alguien con baja visión es una barrera grave.' },
      mood: 'surprised'
    },

    {
      id: 'paso-49',
      step: 49,
      phase: 'frontend',
      layer: 'terminal',
      title: 'Servir el frontend',
      lead: [
        '<strong>No abras index.html con doble clic.</strong> Los módulos ES están bloqueados en el ' +
        'protocolo <code>file://</code> por la política de mismo origen.',
        'Es el error más común al empezar con módulos. Hay que servirlo por HTTP.'
      ],
      commands: [
        { label: 'Opción A · Python', code: 'cd persona-frontend && python3 -m http.server 5500' },
        { label: 'Opción B · Node', code: 'cd persona-frontend && npx serve -l 5500' },
        { label: 'Abrir', code: 'open http://localhost:5500' }
      ],
      checklist: [
        { name: 'Terminal 1', detail: 'Backend en el puerto 3000', command: 'cd persona-api && npm run dev' },
        { name: 'Terminal 2', detail: 'Frontend en el puerto 5500', command: 'cd persona-frontend && python3 -m http.server 5500' }
      ],
      visual: {
        type: 'output',
        label: 'Verificación automatizada de este proyecto',
        lines: [
          '====================================================',
          '  SUITE API      :  53 correctas  |  0 fallidas',
          '====================================================',
          '  OK    200  GET lista              OK    409  POST duplicado',
          '  OK    404  GET id inexistente     OK    400  JSON mal formado',
          '  OK    201  POST crear             OK    200  DELETE en cascada',
          '',
          '======================================================',
          '  SUITE NAVEGADOR:  40 correctas  |  0 fallidas',
          '======================================================',
          '  OK    escritorio (1440x900): sin desplazamiento horizontal',
          '  OK    tablet (905x800): sin desplazamiento horizontal',
          '  OK    movil (390x844): sin desplazamiento horizontal',
          '  OK    sin errores de JavaScript en consola'
        ]
      },
      flow: { lit: ['cliente', 'express', 'routes', 'controllers', 'services', 'models', 'mysql'], mode: 'full' },
      bubble: { text: 'Una aplicación funciona cuando funciona también en móvil, en tema oscuro, con la API apagada y solo con el teclado.' },
      mood: 'celebrate'
    },

    // =================================================================
    // FASE · PROBAR Y CERRAR
    // =================================================================
    {
      id: 'paso-50-1',
      step: 50,
      part: { n: 1, of: 4, label: 'Bug 1' },
      phase: 'cierre',
      layer: 'CSS Grid',
      title: 'Bug real · 18px de desborde en móvil',
      file: 'persona-frontend/css/06-plantillas/_t-panel-administracion.css',
      lead: [
        '<strong>Síntoma:</strong> en 390px la página se desplazaba en horizontal. ' +
        '<code>scrollWidth=408</code> contra <code>innerWidth=390</code>.',
        '<strong>Causa:</strong> <code>1fr</code> equivale a <code>minmax(auto, 1fr)</code>, y ese ' +
        '<code>auto</code> significa «nunca más angosto que su <em>min-content</em>». El título lleva ' +
        '<code>white-space: nowrap</code>, así que su min-content era el texto completo.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-frontend/css/06-plantillas/_t-panel-administracion.css',
          lang: 'css',
          range: [32, 76],
          focus: [[54, 54]]
        }],
        caption: 'Antes: grid-template-columns: 1fr → 407.98px. Después: minmax(0, 1fr) → 390px.'
      },
      flow: { lit: [], mode: 'idle' },
      bubble: { text: 'En cualquier cuadrícula cuyo contenido pueda ser ancho (tablas, textos sin cortes), usa SIEMPRE minmax(0, 1fr).' },
      mood: 'surprised'
    },

    {
      id: 'paso-50-2',
      step: 50,
      part: { n: 2, of: 4, label: 'Bug 2' },
      phase: 'cierre',
      layer: 'plantilla',
      title: 'Bug real · la barra invadía la navegación',
      file: 'persona-frontend/js/plantillas/panelAdministracion.js',
      lead: [
        '<strong>Síntoma:</strong> el título se superponía con los botones. Se vio en una captura de ' +
        'pantalla, no leyendo el código.',
        '<strong>Causa:</strong> la regla CSS existía y era correcta, pero el <code>&lt;header&gt;</code> ' +
        'nunca recibió la clase. Sin <code>grid-area</code>, CSS Grid lo auto-colocó en la columna de 256px.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-frontend/js/plantillas/panelAdministracion.js',
          lang: 'javascript',
          range: [46, 66],
          focus: [[65, 65]]
        }],
        caption: 'El organismo define CÓMO SE VE. La plantilla define DÓNDE VA. La clase de posicionamiento la pone quien coloca.'
      },
      flow: { lit: [], mode: 'idle' },
      bubble: { text: 'Un bug de maquetación no siempre está en el CSS. Aquí la regla era correcta: lo que faltaba era que el elemento la recibiera.' },
      mood: 'think'
    },

    {
      id: 'paso-50-3',
      step: 50,
      part: { n: 3, of: 4, label: 'Bug 3' },
      phase: 'cierre',
      layer: 'CSS',
      title: 'Bug real · el reset mató al <dialog>',
      file: 'persona-frontend/css/05-organismos/_o-modal.css',
      lead: [
        '<strong>Síntoma:</strong> el modal se abría pegado a la esquina superior izquierda.',
        '<strong>Causa:</strong> el navegador centra un <code>&lt;dialog&gt;</code> con <code>inset: 0</code> ' +
        'más <code>margin: auto</code>. Nuestro reset incluye <code>* { margin: 0 }</code> y lo pisó.'
      ],
      visual: {
        type: 'editor',
        tabs: [{
          file: 'persona-frontend/css/05-organismos/_o-modal.css',
          lang: 'css',
          range: [21, 50],
          focus: [[42, 42]]
        }],
        caption: 'La solución no es renunciar al reset, sino reponer el valor en el componente que lo necesita.'
      },
      flow: { lit: [], mode: 'idle' },
      bubble: { text: 'Un reset agresivo quita cosas que el navegador necesitaba. Cada regla que borra algo debería hacerte preguntar qué se pierde.' },
      mood: 'surprised'
    },

    {
      id: 'paso-50-4',
      step: 50,
      part: { n: 4, of: 4, label: 'Bug 4' },
      phase: 'cierre',
      layer: 'SQL + modelo',
      title: 'Bug real · los conteos siempre en 0',
      file: 'persona-api/models/Usuario.js',
      lead: [
        '<strong>Síntoma:</strong> las columnas «Teléfonos» y «Perfiles» marcaban 0 para todos.',
        '<strong>Causa:</strong> el frontend leía <code>usuario.telefonos?.length</code>, pero el listado ' +
        'de la API no carga las relaciones. La tentación es pedir el detalle de cada fila: eso serían ' +
        '<strong>101 peticiones</strong>.'
      ],
      visual: {
        type: 'editor',
        tabs: [
          { file: 'persona-api/models/Usuario.js', lang: 'javascript', range: [216, 245], focus: [[227, 229]] },
          { file: 'persona-api/models/Usuario.js', lang: 'javascript', range: [305, 330], focus: [[311, 320]] }
        ],
        caption: 'El getter cubre los dos casos: si las relaciones están cargadas usa el arreglo; si no, el conteo de la subconsulta.'
      },
      flow: { lit: ['services', 'models', 'mysql'], mode: 'request' },
      bubble: { text: 'Un dato que falta no se resuelve con más peticiones: se resuelve cambiando la consulta. Una, no ciento una.' },
      mood: 'think'
    },

    {
      id: 'paso-51',
      step: 51,
      phase: 'cierre',
      layer: 'API',
      title: 'Los 30 endpoints',
      lead: [
        'La URL nombra <strong>cosas</strong>; la acción la indica el verbo HTTP. ' +
        'Y los perfiles sociales llevan dos segmentos, en el mismo orden que su llave primaria.'
      ],
      endpoints: [
        { verb: 'GET',    path: '/api/salud',                                  desc: 'Estado de la API y la base de datos' },
        { verb: 'GET',    path: '/api/usuarios',                               desc: 'Lista con filtros y paginación' },
        { verb: 'GET',    path: '/api/usuarios/:id',                           desc: 'Detalle con teléfonos y perfiles' },
        { verb: 'POST',   path: '/api/usuarios',                               desc: 'Crear · 201 + Location' },
        { verb: 'PUT',    path: '/api/usuarios/:id',                           desc: 'Actualizar (parcial)' },
        { verb: 'DELETE', path: '/api/usuarios/:id',                           desc: 'Eliminar en cascada (transacción)' },
        { verb: 'GET',    path: '/api/usuarios/:id/telefonos',                 desc: 'Subrecurso' },
        { verb: 'POST',   path: '/api/usuarios/:id/perfiles-sociales',         desc: 'Subrecurso' },
        { verb: 'GET',    path: '/api/telefonos',                              desc: 'Lista con filtros' },
        { verb: 'PATCH',  path: '/api/telefonos/:id/activar',                  desc: 'Baja/alta lógica' },
        { verb: 'DELETE', path: '/api/redes-sociales/:id',                     desc: '409 si tiene perfiles' },
        { verb: 'GET',    path: '/api/perfiles-sociales/:redSocialId/:usuarioId', desc: 'Llave compuesta' },
        { verb: 'PUT',    path: '/api/perfiles-sociales/:redSocialId/:usuarioId', desc: 'Solo urlPerfil' }
      ],
      table: {
        head: ['Código', 'Cuándo'],
        rows: [
          ['200', 'Operación exitosa'],
          ['201', 'Recurso creado (incluye cabecera Location)'],
          ['400', 'Datos inválidos, id no numérico o JSON mal formado'],
          ['404', 'El recurso no existe, o la llave foránea apunta a algo inexistente'],
          ['409', 'Conflicto: duplicado o integridad referencial'],
          ['500', 'Error inesperado del servidor']
        ]
      },
      visual: { type: 'collection' },
      flow: { lit: ['cliente', 'express', 'routes'], mode: 'request' },
      bubble: { text: 'PATCH y no PUT para activar un teléfono: PUT significa «reemplaza el recurso completo» y aquí solo tocamos una bandera.' },
      mood: 'talk'
    },

    // -----------------------------------------------------------------
    // CIERRE
    // -----------------------------------------------------------------
    {
      id: 'final',
      kind: 'final',
      step: 52,
      phase: 'cierre',
      layer: 'ejercicios',
      title: 'Ahora te toca a ti',
      lead: [
        'Ya construiste una aplicación completa: <strong>99 archivos</strong>, ' +
        '<strong>16.866 líneas</strong>, <strong>93 pruebas en verde</strong>.',
        'Estos ejercicios tocan varias capas a propósito: así compruebas que la arquitectura se entendió entera.'
      ],
      exercises: [
        { level: 'Nivel 1 · Fundamentos', items: [
          'Agrega «WhatsApp» al catálogo de tipos de teléfono. Toca el backend Y el frontend. ¿Por qué los dos?',
          'Filtra usuarios por rango de edad: ?edadMinima=18&edadMaxima=65',
          'Ordena la tabla con ?ordenarPor=edad. CUIDADO: el nombre de la columna no se puede parametrizar con ?'
        ]},
        { level: 'Nivel 2 · Modelo de datos', items: [
          'Agrega la columna correo a USUARIO: ALTER TABLE, validación, unicidad y campo en el formulario',
          'Cambia el DELETE por una baja lógica (estado = 0). ¿Qué problema nuevo aparece con los teléfonos únicos?',
          'Pon un índice UNIQUE en RED_SOCIAL.nombre. ¿Se puede quitar la validación del service? ¿Conviene?'
        ]},
        { level: 'Nivel 3 · API', items: [
          'GET /api/estadisticas: usuarios activos, promedio de edad, ciudad con más usuarios',
          'POST /api/usuarios/lote que cree un arreglo completo, todos o ninguno',
          'Un limitador de peticiones. ¿Por qué un Map en memoria no sirve con varios servidores?'
        ]},
        { level: 'Nivel 4 · Frontend', items: [
          'Exportar el listado filtrado a CSV con Blob y URL.createObjectURL',
          'Ordenar al hacer clic en el encabezado, con aria-sort="ascending"',
          'Un conmutador tabla/tarjetas. ¿En qué nivel del Atomic Design va ese componente?',
          'Deshacer el borrado durante 5 segundos. Pista: retrasa el DELETE, no borres y recrees'
        ]},
        { level: 'Nivel 5 · Arquitectura', items: [
          'Autenticación con JWT. utils/cifrado.js ya trae hashearContrasenia y verificarContrasenia',
          'Pruebas con el node:test nativo. Empieza por utils/fechas.js, que es una función pura',
          'Documenta la API en OpenAPI y sírvela con Swagger UI',
          'Compila los 26 archivos CSS en uno solo minificado. Mide el antes y el después'
        ]}
      ],
      visual: { type: 'celebrate' },
      flow: { lit: ['cliente', 'express', 'routes', 'controllers', 'services', 'models', 'mysql', 'utils', 'middleware'], mode: 'full' },
      bubble: { title: '¡Lo lograste!', text: 'Haz clic en mí para celebrar. Y recuerda: la guía completa está en step_by_step.md, con los 52 pasos y sus comandos.' },
      mood: 'celebrate'
    }
  ];
})();
