# Contexto de la Aplicación y Registro de Cambios

Este documento sirve como guía técnica para entender el funcionamiento del sitio web de la **Parroquia San Patricio** y como bitácora para registrar cambios significativos en su funcionalidad.

---

## ⚠️ Reglas de Trabajo Críticas

### 🔴 REGLA PRIMARIA: Restricción Estricta de Ámbito (Scope Local)
*   **ALCANCE LOCAL OBLIGATORIO**: Cualquier instrucción o prompt futuro para la implementación de un cambio (por mínimo que sea) **debe restringirse única y exclusivamente al área, archivo, módulo o componente en el que se trabaja**, y NUNCA aplicarse a todo el proyecto.
*   **PROHIBICIÓN DE CAMBIOS GENERALES / GLOBALES**: Está estrictamente prohibido realizar modificaciones globales, refactorizaciones no solicitadas, alteraciones masivas de estilos o cambios colaterales en otros archivos/secciones del proyecto fuera del ámbito específico de la tarea.
*   **TRABAJO EN EL ÁMBITO ESPECÍFICO**: Todo trabajo debe realizarse únicamente en el contexto delimitado por la solicitud del usuario, preservando intacto el resto del código y la estructura del proyecto general como regla prioritaria y mandataria.

### 🟡 Gestión de Versiones y Git
*   **PROHIBICIÓN DE COMMITS AUTOMÁTICOS**: El asistente de IA NUNCA debe ejecutar `git add` ni `git commit` por su cuenta tras finalizar una tarea. El `commit` representa la aprobación explícita de los cambios por parte del usuario, no del asistente.
*   **PROHIBIDO EL PUSH AUTOMÁTICO**: Bajo ninguna circunstancia se debe ejecutar `git push` de forma automática.
*   **FLUJO DE APROBACIÓN**: Todas las modificaciones deben permanecer en el entorno de trabajo (working directory) sin staging ni commit. Solo cuando el usuario da su aprobación explícita (por ejemplo, diciendo "push" o "haz commit"), el asistente debe agrupar los comandos (`git add`, `git commit` y, si corresponde, `git push`). No se asumen permisos de un turno anterior.

---

## 🏗️ Arquitectura Técnica

La aplicación es un sitio web estático moderno diseñado para ser liviano, rápido y fácil de mantener sin necesidad de una base de datos compleja.

### Tecnologías Core
- **Estructura**: HTML5 Semántico.
- **Estilos**: Tailwind CSS (vía CDN para desarrollo ágil y flexibilidad).
- **Iconografía**: FontAwesome 6.4.
- **Lógica**: JavaScript (Vanilla JS, ES6+).

### Componentes Dinámicos
Para evitar la repetición de código, el sitio utiliza un sistema de carga de componentes en `components.js`:
- **Menú (`menu.html`)**: Se carga dinámicamente en todas las páginas. Incluye lógica de rutas para funcionar tanto en la raíz como en subcarpetas.
- **Footer (`footer.html`)**: Incluye los botones flotantes (WhatsApp, Subir) y se carga de forma centralizada.

### 🗞️ Sistema Híbrido de Noticias
El sitio combina dos fuentes de información para generar el portal de noticias y el banner principal:

1.  **Noticias Manuales (`noticias.json`)**: 
    - Se definen manualmente para noticias que requieren una descripción extensa, formato específico o fechas personalizadas.
    - Atributo clave `isBanner: true` permite que aparezcan en el carrusel de la página de inicio.
2.  **Flyers Automáticos (`assets/flyers/`)**:
    - **Carga Automática**: El sistema escanea la carpeta `assets/flyers/`.
    - **Generación de ID y Título**: El nombre del archivo se convierte automáticamente en el título (limpiando guiones y extensiones).
    - **Comportamiento**: Se tratan como noticias con `isBanner: true` por defecto, apareciendo tanto en el portal como en el banner principal sin necesidad de editar código.

### 🎡 Funcionamiento del Banner (Index)
El carrusel de la página de inicio (`index.html`) unifica ambas fuentes:
- Primero carga los **Flyers** encontrados en la carpeta.
- Luego añade las **Noticias** de `noticias.json`.
- Filtra todos los elementos que tengan `isBanner: true`.
- Si no hay marcados como banner, muestra los 3 elementos más recientes de la lista combinada.

### 🖼️ Gestión de Assets
- **Afiches de Noticias**: Deben guardarse en `/assets/flyers/noticias/`. Esta carpeta contiene las imágenes vinculadas específicamente a las entradas activas de `data/noticias.json`.
- **Afiches Históricos**: Los afiches de noticias y eventos anteriores se almacenan en `/assets/flyers/historicos/` para mantener un respaldo ordenado sin saturar la vista principal.
- **Imágenes Generales**: Logos, fotos de la parroquia y otros elementos estáticos permanecen en la raíz de `/assets`.


### 🧹 Romper Caché
Cuando realices cambios críticos en archivos CSS o JS, utiliza el script `bust_cache.js` para actualizar las versiones (`?v=X`) en los archivos HTML y asegurar que los usuarios vean la versión más reciente.

### 🎵 Sistema del Cancionero (`cantos.html`)
El cancionero es una página generada automáticamente que contiene **880 canciones litúrgicas** con acordes, letras y clasificación por categorías. Todas las canciones se muestran en **orden alfabético**.

#### Pipeline de Datos
1. **Scraping** (`tools/scrape_cancionero.js`): Extrae canciones desde [cancionerocatolico.cl](https://cancionerocatolico.cl), mapeando cada canción a sus categorías (Momentos de la Misa, Tiempos Litúrgicos, Misa a la Chilena). Genera `data/cancionero_data.json`.
2. **Build** (`tools/build_cantos.js`): Lee `data/cancionero_data.json`, convierte acordes de texto plano a etiquetas `<c>` (en rojo), y genera el archivo final `cantos.html`.
3. **Origen de la estructura («Abre tu jardín»)**: La primera versión del cancionero (29/04/2026) se armó a mano y la canción «Abre tu jardín» se usó como **prototipo** para definir la estructura de cada canción (líneas de acordes sobre la letra, estrofas en negrita, herramientas por canción). Durante la migración al scraping se mantuvo una copia fija de esa canción en `build_cantos.js` como referencia («regla de oro»). Cumplido su propósito, la copia y la regla se retiraron el 13/11/2026: la canción ahora se genera desde los datos como cualquier otra y ocupa su lugar alfabético.

#### Para regenerar el cancionero:
```bash
node tools/scrape_cancionero.js   # Solo si se necesita re-escrapear (genera data/cancionero_data.json)
node tools/build_cantos.js        # Genera cantos.html desde los datos
```

#### Funcionalidades del Frontend
- **Búsqueda**: Barra de texto que filtra el índice en tiempo real. Es **insensible a acentos y mayúsculas** (ej. "comunion" encuentra "Comunión", "JESUS" encuentra "Jesús").
- **Filtros por categoría**: Botones pill **ordenados según la secuencia litúrgica** (Entrada → Perdón → Gloria → … → Comunión → Salida, luego Marianos, Villancicos, etc.). Tiempos Litúrgicos en orden calendario (Adviento → Navidad → Cuaresma → Pascua). Los filtros son **mutuamente excluyentes** (solo uno activo a la vez).
- **Comportamiento de carga**: Las canciones están **ocultas por defecto**. Los filtros y la búsqueda solo actualizan el **índice**. Las letras/acordes se muestran únicamente al hacer clic en una canción del índice.
- **Tipografía compacta**: Las letras usan fuente monoespaciada condensada (`Cascadia Mono`/`Consolas`), `pre-wrap` para evitar scroll horizontal en móvil, y `letter-spacing` negativo para mayor densidad.
- **Herramientas por canción**:
  - Ocultar/Mostrar acordes.
  - Cambiar notación latina ↔ anglosajona (Do ↔ C).
  - Transportar tono (+/-) con indicador de semitonos y clic en el número para resetear al tono original.
  - Acordes clickeables para escuchar el sonido (Web Audio API). El sonido **siempre corresponde a la nota transpuesta actual**, no a la original.
  - Soporte completo de **slash chords** (ej. `FA/LA` → `SOL/SI` al transponer +2): ambas notas se transponen correctamente.
- **Etiquetas de categoría**: Badges de color en cada canción (verde = Momento, azul = Tiempo Litúrgico, amarillo = Misa a la Chilena).

---

## 📋 Registro de Cambios (Changelog)

### [2026-11-13] - Curso para Lectores
- **Contenido** (`cursos.html#lectores`): Nuevo curso con los distintos Leccionarios (dominical A/B/C, ferial I/II, santoral, de la Virgen María, rituales, diversas necesidades/votivas/difuntos) y cómo calcular el ciclo; preparación de la lectura; ubicación cerca del ambón y reverencia al altar; qué se lee (negro) y qué no (rojo), sin agregar nada hasta «Palabra de Dios»; el Salmo responsorial sin «repitamos todos»; segunda lectura y oración de los fieles; lista rápida del lector.
- **Fuentes**: IGMR y Ordenación de las Lecturas de la Misa. Tarjeta nueva en el listado de cursos.
- **Quiz** (`quiz-lectores.html`): 16 preguntas con explicación, mismo diseño que los otros quiz. Agregado al `sitemap.xml`.

### [2026-11-13] - Curso «Las Partes de la Misa» y Quiz
- **Contenido** (`cursos.html#partes-misa`): Nuevo curso con los cuatro momentos de la Misa (Ritos Iniciales, Liturgia de la Palabra, Liturgia Eucarística y Ritos de Conclusión), las respuestas de la asamblea, las posturas (de pie, sentados, de rodillas, inclinación), los gestos y una sección «¿Sabías que…?» (p. ej., no se dice «Amén» al final del Padre Nuestro). Índice de cursos al inicio de la página.
- **Fuentes**: Instrucción General del Misal Romano (IGMR) y Misal Romano aprobado para Chile. Las posturas de rodillas que dependen de la costumbre local (IGMR 43) se indican como tales.
- **Quiz** (`quiz-misa.html`): 16 preguntas con explicación, generado con el mismo diseño y lógica que `quiz-buen-trato.html`. Agregado al `sitemap.xml`.
- **Favicon**: Emblema del logo sin texto (`favicon.ico`, `assets/favicon-32x32.png`, `assets/apple-touch-icon.png`) enlazado en todas las páginas y en la plantilla de `tools/build_cantos.js`.

### [2026-11-13] - Cancionero: Acordes no Reconocidos y Retiro de la Regla de «Abre tu jardín»
- **Detección de acordes** (`tools/build_cantos.js`): Se reconocen y pintan en rojo ~1.780 acordes que quedaban en negro: semidisminuidos (`SIm7b5`), disminuidos (`MI°`), extensiones entre paréntesis (`SOL#m(b13)`, `RE4/9`), acordes opcionales `(RE7)`, acordes unidos con guion (`DO-FA-SOL`), bajos con calidad (`RE/FA#m`) y marcas como `(x2)`, `INTRO:`, `Inicio:`.
- **Transposición**: Se conserva el sufijo tras la barra (`RE4/9` → `Mi4/9`, `RE/FA#m` → `Mi/Sol#m`).
- **«Abre tu jardín»**: Se registra que fue la canción prototipo de la estructura del cancionero. Se eliminó su copia fija y la «regla de oro»; ahora se genera desde `data/cancionero_data.json` (contenido idéntico) y se ordena alfabéticamente con el resto.

### [2026-11-13] - Dominio de Producción en SEO, 404 y `.htaccess`
- **SEO**: Los `canonical`, `og:image`, `sitemap.xml` y `robots.txt` pasan de `rodrigoquezadab.github.io/SanPatricio/` a `https://parroquiasanpatricio.cl/` (también en las plantillas de `tools/build_components.js` y `tools/build_cantos.js`). Se agregó canonical a `index.html` y `quiz-buen-trato.html` al sitemap.
- **404**: `404.html` usa rutas absolutas desde la raíz (`/styles.css`, `/index.html`) y `noindex`.
- **Servidor**: Nuevo `.htaccess` con `ErrorDocument 404 /404.html`, redirección 301 a `https://` sin `www`, y redirecciones 301 de `/paginas/*` y `congregacion.html`.

### [2026-10-20] - Nuevas Noticias (Pastoral de la Salud, Ayuda Fraterna) y Archivo de Noticias Pasadas
- **Contenido**: Se incorporó la noticia de convocatoria para la Pastoral de la Salud («❤️🙏 ¡SÚMATE A LA PASTORAL DE LA SALUD DE SAN PATRICIO! 🙏❤️») y la nueva campaña de Ayuda Fraterna («🌟🤝 ¡La ayuda fraterna transforma vidas! Súmate a la campaña solidaria de la Parroquia San Patricio 🤝🌟») en `data/noticias.json` con `isBanner: true` y fecha actual (20/10/2026).
- **Imágenes**: Vinculación directa con los afiches oficiales optimizados a formato ligero `.jpeg`: `assets/flyers/noticias/Invitación Pastoral_ Puente de Amor y Fe.jpeg`, `assets/flyers/noticias/Campaña de Ayuda Fraterna.jpeg` y `assets/flyers/noticias/taos01.jpeg`.
- **Archivo de Noticias**: Se pasaron a estado archivado (`isActive: false`, `isBanner: false`, `isArchived: true`) las noticias de la «Catequesis del Camino Neocatecumenal» y del «Mes de la Biblia» al haber concluido sus actividades principales.

### [2026-08-15] - Reorganización del Proyecto para Revisión Humana y Crecimiento Futuro
- **Estructura**: Reorganización completa del proyecto en carpetas especializadas:
  - `data/`: Centralización de todos los datos en formato JSON (`eventos_parroquiales.json`, `noticias.json`, `horarios.json`, `cancionero_data.json`).
  - `tools/`: Agrupación de todos los scripts de automatización y build (`build_components.js`, `build_cantos.js`, `build_oraciones.js`, `bust_cache.js`, `scrape_cancionero.js`).
  - `docs/`: Documentación interna (`CONTEXTO_APLICACION.md`, `mejoras.md`).
- **Limpieza**: Eliminación de 9 archivos obsoletos y temporales (`fix_paths.js`, `comment_index.js`, `restore_index.js`, `fetch_songs.js`, `process_songs.js`, `generated_filter.js`, `generated_index.html`, `generated_songs.html`, `songs_data.json`).
- **Calendario Desacoplado**: Se extrajeron los eventos locales del script de `calendario.html` a `data/eventos_parroquiales.json` con soporte para eventos únicos (`oneTime`), semanales (`recurring.weekly`) y rangos (`recurring.dateRange`).
- **Rutas**: Actualización de todos los `fetch()` en `index.html`, `noticias.html`, `noticia.html` y `calendario.html` para consultar directamente en `data/`.

### [2026-08-14] - Nueva Noticia 70 Años y Reorganización de Noticias Archivadas
- **Contenido**: Se agregó la publicación especial por los 70 Años de la Parroquia San Patricio a `noticias.json` con `isBanner: true` para su destacación principal.
- **Gestión de Archivo y Noticias Pasadas**: Se clasificaron las noticias pasadas (Misa por Venezuela, Orquesta de Cámara, Taller TAOS) como `isArchived: true` y `isBanner: false`. Sus afiches se trasladaron a `assets/flyers-historicos/`.
- **UI Portal de Noticias**: Se reestructuró `noticias.html` dividiéndola en dos secciones: **Noticias Recientes y Destacadas** (relevantes al tiempo actual) y **Archivo de Noticias** (histórico con distintivos visuales). El banner de `index.html` ahora excluye automáticamente las noticias archivadas.

### [2026-06-04] - Incorporación de la Oración del Sagrado Corazón de Jesús y Control de Tamaño de Texto
- **Contenido Oraciones**: Se agregó la "Oración del Sagrado Corazón de Jesús" en primer lugar del índice y del contenedor de detalles en `oraciones.html`.
- **Funcionalidad**: Se implementó un control dinámico de tamaño de texto (botones A- y A+) en cada artículo de oración. La preferencia de tamaño se almacena en `localStorage` y escala de manera proporcional todos los elementos del texto (párrafos, notas, subencabezados) utilizando variables CSS en `styles.css`.

### [2026-05-27] - Remoción de Noticia de Pentecostés, Archivo de Flyer, Limpieza de Deploy e Incorporación del Ángelus
- **Contenido**: Se eliminó la noticia de Pentecostés y aniversario del Templo de `noticias.json`.
- **Gestión de Assets**: Se trasladó el flyer `Pentecostes.png` de `assets/flyers-noticias/` a `assets/flyers-historicos/`.
- **Despliegue**: Se eliminó el flujo de trabajo de GitHub Actions (`.github/workflows/deploy.yml`) tras conectar el repositorio directamente a Hostinger.
- **Contenido Oraciones**: Se agregó la oración "El Ángelus" en latín y español a `oraciones.html` (ubicada en el índice y contenido justo después de Regina Caeli).

### [2026-05-07] - SEO, Flat Routing y Mejoras de Navegación
- **Arquitectura**: Migración completa del sitio a una estructura de URL plana (archivos en la raíz en lugar de la subcarpeta `/paginas/`) para facilitar la indexabilidad por los motores de búsqueda. Implementación de redirecciones en `404.html`.
- **SEO & Build**: Creación de `build_components.js` para inyección estática del menú de navegación, footers y meta tags (eliminando la dependencia de carga dinámica por JS).
- **UI & Navegación**: Reparación del archivo `styles.css` (corrupción UTF-16) que afectaba al cancionero. Reordenamiento estratégico del menú principal basándose en la prioridad de uso parroquiano, posicionando "Inicio", "Oraciones" y "Adoración" en los primeros lugares.
- **Contenido Oraciones**: Se integró la "Novena al Venerable Padre José Frassinetti". Se actualizó la versión en español del "Regina Caeli" y se añadió la fecha a la "Novena a San José". Se reorganizó la lista destacando Regina Caeli al inicio.
- **Calendario**: Se actualizó el iframe de la página apuntando a un nuevo documento de Google Docs.

### [2026-05-01] - Consolidación de Aportes y 1%
- **Estructura**: Unificación de las secciones "Aportes" y "1% a la Iglesia" en una sola página principal (`paginas/aportes.html`), eliminando el menú secundario y mejorando el flujo de navegación.
- **Contenido**: Actualización y reestructuración de la sección "¿Sabías qué?..." (datos sobre la parroquia). Se transformó en una lista con viñetas ordenada narrativamente desde el impacto espiritual/social hasta los costos de infraestructura para hacer más persuasivo el llamado a contribuir.
- **UI**: Mejoras de legibilidad y espaciado, reubicación de la imagen explicativa del 1% y alineación del diseño general.

### [2026-04-29] - Cancionero Integrado con Scraping y Filtros
- **Funcionalidad**: Implementación completa del cancionero litúrgico con 880 canciones escrapeadas desde cancionerocatolico.cl.
- **Pipeline**: Creación de `scrape_cancionero.js` (scraping), `cancionero_data.json` (datos), y `build_cantos.js` (generador HTML).
- **UI**: Sistema de filtrado por categorías (mutuamente excluyentes), búsqueda insensible a acentos, transposición de tonos con contador y reset, slash chords, tipografía compacta mobile-first, y renderizado bajo demanda de canciones.

### [2026-04-27] - Respaldo de Flyers Históricos
- **Gestión de Assets**: Creación de la carpeta `assets/flyers-historicos/` para respaldar afiches de noticias pasadas, manteniendo limpias las carpetas activas de la web.

### [2026-04-20] - Nueva Noticia: JMJ Corea 2027
- **Contenido**: Adición de la reunión informativa para la Jornada Mundial de la Juventud Corea 2027 en `noticias.json`.
- **Imagen**: Uso del flyer `jmj Corea.jpeg` en la carpeta de noticias manuales.

### [2026-04-19] - Gestión de Noticias y Documentación
- **Funcionalidad**: Implementación de la noticia "Campaña de Ayuda Fraterna".
- **Documentación**: Creación de este archivo `CONTEXTO_APLICACION.md` para la gestión del conocimiento.
- **Optimización**: Verificación de carga de banners y renderizado de texto con `whitespace-pre-line` para mejorar la legibilidad de noticias largas.

### [2026-04-14] - Refinamiento de Servicios y Blog
- **Internacionalización**: Actualización de descripciones en `i18n.js` (si corresponde) y refinamiento de textos.

### [2026-04-12] - News de Cuasimodo
- **Contenido**: Adición de la entrada de noticias para la Fiesta de Cuasimodo.

### [2026-04-07] - Herramientas de Aportes
- **Funcionalidad**: Se añadieron botones de "Copiar al portapapeles" en la sección de aportes para facilitar la copia de datos bancarios sin caracteres especiales (puntos o guiones).

---

> [!TIP]
> Mantén este archivo actualizado cada vez que añadas una nueva funcionalidad o realices un cambio estructural para facilitar futuras intervenciones.
