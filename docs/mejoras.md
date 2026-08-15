# 🗺️ Roadmap de Mejoras — SEO e Indexabilidad

Este documento define el plan de trabajo para transformar el sitio de la Parroquia San Patricio en un sitio más accesible para los motores de búsqueda (Google, Bing, etc.), manteniendo la funcionalidad actual.

---

## ✅ Mejoras Implementadas (2026-05-07)

### Fase 1 — Estructura Flat + SEO Base

#### 1.1 ✅ Páginas movidas a la raíz
Todas las páginas fueron migradas de `/paginas/` a la raíz del proyecto. La navegación ahora apunta directamente a `adoracion.html`, `contacto.html`, etc., sin pasar por la subcarpeta `paginas/`.

**Estructura actual:**
```
/index.html
/adoracion.html
/aportes.html
/calendario.html
/cantos.html
/comunidades.html
/parroquia.html
/contacto.html
/evangelio.html
/noticias.html
/noticia.html
/oraciones.html
/recursos.html
/servicios.html
/404.html                  ← Redirección de URLs antiguas /paginas/*
/components/menu.html      ← Fragmentos reutilizables (fuente)
/components/footer.html
```

**Lo que se hizo:**
- [x] Mover todos los `.html` de `/paginas/` a la raíz
- [x] Mover `menu.html` y `footer.html` a `/components/`
- [x] Actualizar `components.js` eliminando la lógica condicional `inPaginas`
- [x] Actualizar todas las rutas de assets (`../assets/` → `assets/`)
- [x] Actualizar `build_cantos.js` para generar en la raíz
- [x] Actualizar enlaces del menú (`menu.html`) a rutas flat
- [x] Crear `404.html` con redirección JS para URLs antiguas `/paginas/*`
- [x] Actualizar `bust_cache.js` para la estructura plana

#### 1.2 ✅ Menú y footer incrustados como HTML estático
Se creó `build_components.js` que inyecta el HTML del menú y footer directamente en cada página. Los crawlers ahora pueden ver toda la navegación sin ejecutar JavaScript.

**Lo que se hizo:**
- [x] Crear `build_components.js` que lee `menu.html` y `footer.html` e inyecta su contenido en los contenedores `<div id="menu-container">` y `<div id="footer-container">`
- [x] Refactorizar `components.js` para que solo maneje interactividad (toggle menú móvil, botón subir, enlace activo) sin cargar contenido vía `fetch()`
- [x] Preservar la lógica JS de toggle del menú móvil y botón subir

#### 1.3 ✅ SEO básico en cada página
Cada subpágina ahora incluye:
- `<meta name="description">` con contenido descriptivo y único
- `<link rel="canonical">` apuntando a la URL definitiva
- `<meta property="og:title">`, `og:description`, `og:type`

**Lo que se hizo:**
- [x] `build_components.js` inyecta automáticamente meta tags SEO en las páginas que no los tengan
- [x] Meta descriptions personalizadas por sección (adoración, aportes, calendario, etc.)

#### 1.4 ✅ `sitemap.xml` creado
Archivo `sitemap.xml` en la raíz con todas las URLs del sitio.

#### 1.5 ✅ `robots.txt` creado
Archivo `robots.txt` con directiva `Allow: /` y referencia al sitemap.

#### 1.6 ✅ CSS compartido extraído
Se creó `styles.css` con todos los estilos comunes (body, cards, nav-link, botones flotantes, cantos, filtros). Los bloques `<style>` repetidos fueron reemplazados por `<link rel="stylesheet" href="styles.css">`.

---

### Fase 2 — Contenido Estático para Oraciones

#### 2.1 ✅ Oraciones pre-renderizadas en HTML
Se creó `build_oraciones.js` que transforma el array JavaScript de oraciones en elementos `<article>` estáticos dentro del HTML. El contenido de cada oración ahora es visible para los crawlers sin necesidad de ejecutar JS.

**Lo que se hizo:**
- [x] Crear `build_oraciones.js` que genera artículos HTML con el contenido completo de cada oración
- [x] Mantener la navegación de índice + detalle como mejora JS (progressive enhancement)
- [x] El HTML base contiene todo el texto visible para los crawlers

---

## 🔧 Pendiente — Fase 3: Optimizaciones Avanzadas (Prioridad Baja)

### 3.1 Compilar Tailwind CSS
- [ ] Reemplazar `cdn.tailwindcss.com` por un CSS compilado (`npx tailwindcss build`)
- [ ] Reducir el tamaño de carga y eliminar la dependencia de JS para los estilos
- [ ] Integrar en el flujo de build existente

### 3.2 Schema.org extendido
- [ ] Agregar `BreadcrumbList` en cada página
- [ ] Agregar `WebSite` con `SearchAction` en index
- [ ] Agregar `Event` para noticias de eventos
- [ ] Evaluar `FAQPage` para servicios

### 3.3 Performance
- [ ] Lazy loading de imágenes con `loading="lazy"`
- [ ] Preconnect a CDNs frecuentes (FontAwesome, Google Fonts si se añaden)
- [ ] Minificación de HTML/CSS/JS en el paso de build

### 3.4 Registro en herramientas
- [ ] Registrar el sitio en Google Search Console
- [ ] Enviar el sitemap manualmente
- [ ] Monitorear la indexación y errores de rastreo

---

## 📋 Resumen de Estado

| Fase | Tarea | Estado |
|---|---|---|
| **1.1** | Mover páginas a la raíz (eliminar `/paginas/`) | ✅ Completado |
| **1.2** | Incrustar menú/footer estáticamente | ✅ Completado |
| **1.3** | Meta tags en cada página | ✅ Completado |
| **1.4** | Sitemap.xml | ✅ Completado |
| **1.5** | Robots.txt | ✅ Completado |
| **1.6** | CSS compartido | ✅ Completado |
| **2.1** | Oraciones pre-renderizadas | ✅ Completado |
| **3.1** | Compilar Tailwind | ⬜ Pendiente |
| **3.2** | Schema.org extendido | ⬜ Pendiente |
| **3.3** | Performance | ⬜ Pendiente |
| **3.4** | Search Console | ⬜ Pendiente |

---

## 🛠️ Scripts de Build

El sitio ahora cuenta con los siguientes scripts de build que deben ejecutarse al hacer cambios estructurales:

| Script | Propósito | Cuándo ejecutar |
|---|---|---|
| `build_components.js` | Inyecta menú, footer y meta tags SEO en todas las páginas | Después de cambiar `menu.html`, `footer.html`, o agregar nuevas páginas |
| `build_cantos.js` | Genera `cantos.html` con 880 canciones desde `cancionero_data.json` | Después de re-escrapear o modificar el cancionero |
| `build_oraciones.js` | Pre-renderiza el contenido de oraciones en HTML estático | Después de modificar las oraciones en `oraciones.html` |
| `bust_cache.js` | Incrementa `?v=N` en las referencias a CSS/JS para romper caché | Después de cambios críticos en `styles.css` o `components.js` |

---

## ⚠️ Consideraciones Importantes

1. **Navegación sin `/paginas/`**: Toda la navegación del sitio apunta directamente a las páginas en la raíz (ej: `noticias.html`, no `paginas/noticias.html`). Si se agregan nuevas páginas, deben crearse en la raíz.

2. **Noticias e Index**: El sistema dinámico de noticias (`noticias.json` + flyers) y el banner del `index.html` funcionan correctamente y **no requieren cambios**.

3. **Cantos**: `cantos.html` se genera estáticamente vía `build_cantos.js` con menú/footer ya inyectados. Contiene 880 canciones en HTML puro.

4. **GitHub Pages**: Todas las mejoras son compatibles con el hosting en GitHub Pages (sitio estático, sin servidor).

5. **Backward Compatibility**: El archivo `404.html` redirige automáticamente URLs antiguas con `/paginas/` a su equivalente en la raíz.
