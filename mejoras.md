# 🗺️ Roadmap de Mejoras — SEO e Indexabilidad

Este documento define el plan de trabajo para transformar el sitio de la Parroquia San Patricio en un sitio más accesible para los motores de búsqueda (Google, Bing, etc.), manteniendo la funcionalidad actual.

---

## 📊 Diagnóstico Actual

### Problemas de indexabilidad identificados

| Problema | Impacto | Páginas afectadas |
|---|---|---|
| **Menú y Footer cargados vía `fetch()` JS** | Los crawlers no ejecutan JS complejo; los enlaces de navegación son invisibles para Google | **Todas las páginas** |
| **Páginas dentro de `/paginas/`** | URLs poco amigables (`/paginas/contacto.html` vs `/contacto.html`); lógica extra en `components.js` para reescribir rutas | Todas las subpáginas |
| **Contenido generado 100% por JS** | El HTML inicial está vacío (`<!-- rendered by JS -->`); los crawlers no ven el contenido | `oraciones.html`, `noticias.html` |
| **Falta de `<meta description>`** | Solo `index.html` tiene meta description; el resto no tiene | 13 de 14 páginas |
| **Falta de Schema.org** | Solo `index.html` tiene marcado estructurado `CatholicChurch` | 13 de 14 páginas |
| **Sin `sitemap.xml`** | Google no tiene un mapa del sitio para descubrir páginas | Todo el sitio |
| **Sin `robots.txt`** | No hay directivas para los crawlers | Todo el sitio |
| **Estilos repetidos inline** | El mismo bloque `<style>` de ~12 líneas se repite en cada página; dificulta mantenimiento y aumenta peso | Todas las subpáginas |
| **Sin canonical URLs** | No hay `<link rel="canonical">` que prevenga contenido duplicado | Todas las páginas |
| **Tailwind vía CDN runtime** | `cdn.tailwindcss.com` ejecuta JS para generar CSS; los crawlers podrían no procesarlo | Todas las páginas |

### Lo que funciona bien (no tocar en Fase 1)
- **`index.html`**: Tiene SEO completo (meta tags, Open Graph, Schema.org). Su contenido dinámico (banner, horarios, noticias) es funcional y aceptable.
- **`noticias.html` + `noticia.html`**: El sistema híbrido de noticias (JSON + flyers) funciona correctamente. Se puede mejorar en fases posteriores.
- **`cantos.html`**: Generado por build script; su contenido ya está en el HTML estático final.
- **`oraciones.html`**: Contenido dinámico vía JS. Se mejorará en iteraciones posteriores.

---

## 🏗️ Plan de Implementación

### Fase 1 — Estructura Flat + SEO Base (Prioridad Alta)

**Objetivo**: Mover todas las páginas a la raíz del proyecto y agregar SEO básico a cada una.

#### 1.1 Mover páginas a la raíz

**Estado actual:**
```
/index.html
/paginas/adoracion.html
/paginas/aportes.html
/paginas/calendario.html
/paginas/cantos.html
/paginas/comunidades.html
/paginas/congregacion.html
/paginas/contacto.html
/paginas/evangelio.html
/paginas/noticias.html
/paginas/noticia.html
/paginas/oraciones.html
/paginas/recursos.html
/paginas/servicios.html
```

**Estado objetivo:**
```
/index.html
/adoracion.html
/aportes.html
/calendario.html
/cantos.html
/comunidades.html
/congregacion.html
/contacto.html
/evangelio.html
/noticias.html
/noticia.html
/oraciones.html
/recursos.html
/servicios.html
/components/menu.html      ← solo fragmentos reutilizables
/components/footer.html
```

**Tareas:**
- [ ] Mover todos los `.html` de `/paginas/` a la raíz
- [ ] Mover `menu.html` y `footer.html` a `/components/`
- [ ] Actualizar `components.js` para eliminar la lógica condicional `inPaginas`
- [ ] Actualizar todas las rutas de assets (`../assets/` → `assets/`)
- [ ] Actualizar `build_cantos.js` para generar en la raíz
- [ ] Actualizar enlaces del menú (`menu.html`) a rutas flat
- [ ] Verificar que GitHub Pages sirva correctamente desde la nueva estructura
- [ ] Redirigir URLs antiguas si es posible (404.html con JS redirect como fallback)

#### 1.2 Incrustar menú y footer como HTML estático

**Problema**: `components.js` carga menú y footer vía `fetch()`. Los crawlers no ven estos elementos, lo que significa que **ningún enlace de navegación es indexable**.

**Solución**: Crear un **build script** (`build_components.js`) que inyecte el HTML del menú y footer directamente en cada página antes del deploy.

**Tareas:**
- [ ] Crear `build_components.js` que lea `menu.html` y `footer.html` e inyecte su contenido en los `<div id="menu-container">` y `<div id="footer-container">` de cada página
- [ ] Mantener `components.js` como fallback para desarrollo local (si el HTML ya está inyectado, no hacer fetch)
- [ ] Incluir este paso en el flujo de deploy (GitHub Actions o manual)
- [ ] Preservar la lógica JS de toggle del menú móvil y botón subir (solo se activa en runtime)

#### 1.3 Agregar SEO básico a cada página

Para **cada página** agregar dentro del `<head>`:

```html
<!-- Meta description descriptiva y única -->
<meta name="description" content="...">

<!-- Canonical URL -->
<link rel="canonical" href="https://rodrigoquezadab.github.io/SanPatricio/[pagina].html">

<!-- Open Graph mínimo -->
<meta property="og:title" content="Parroquia San Patricio - [Sección]">
<meta property="og:description" content="...">
<meta property="og:type" content="website">
```

**Meta descriptions sugeridas:**

| Página | Meta Description |
|---|---|
| `adoracion.html` | Adoración Eucarística en la Parroquia San Patricio, Las Condes. Horarios, cómo sumarte como adorador y ubicación de la capilla. |
| `aportes.html` | Datos bancarios y formas de contribuir a la Parroquia San Patricio. Información sobre el 1% CALI (Contribución a la Iglesia). |
| `calendario.html` | Calendario parroquial de la Parroquia San Patricio con actividades, celebraciones y eventos de la comunidad. |
| `comunidades.html` | Conoce las comunidades, equipos pastorales y grupos de la Parroquia San Patricio: catequesis, adoradores, coro, y más. |
| `congregacion.html` | Historia de la Congregación Hijos de Santa María Inmaculada, fundada por el Venerable P. José Frassinetti. |
| `contacto.html` | Contacto, dirección, teléfono, WhatsApp y redes sociales de la Parroquia San Patricio en Las Condes, Santiago. |
| `evangelio.html` | Evangelio del día y Santo del día. Lectura bíblica diaria desde la Parroquia San Patricio. |
| `noticias.html` | Noticias y actividades recientes de la Parroquia San Patricio en Las Condes, Santiago de Chile. |
| `oraciones.html` | Colección de oraciones: Regina Caeli, Novena al P. Frassinetti, Novena a San José, y más oraciones de la comunidad. |
| `recursos.html` | Enlaces y recursos útiles para la comunidad: Santo Rosario, Liturgia de las Horas, cancionero litúrgico y más. |
| `servicios.html` | Servicios parroquiales: corona de caridad, visita a enfermos, velatorio, dirección espiritual, bendición de hogares. |

#### 1.4 Crear `sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://rodrigoquezadab.github.io/SanPatricio/</loc><priority>1.0</priority></url>
  <url><loc>https://rodrigoquezadab.github.io/SanPatricio/adoracion.html</loc></url>
  <url><loc>https://rodrigoquezadab.github.io/SanPatricio/aportes.html</loc></url>
  <url><loc>https://rodrigoquezadab.github.io/SanPatricio/calendario.html</loc></url>
  <url><loc>https://rodrigoquezadab.github.io/SanPatricio/cantos.html</loc></url>
  <url><loc>https://rodrigoquezadab.github.io/SanPatricio/comunidades.html</loc></url>
  <url><loc>https://rodrigoquezadab.github.io/SanPatricio/congregacion.html</loc></url>
  <url><loc>https://rodrigoquezadab.github.io/SanPatricio/contacto.html</loc></url>
  <url><loc>https://rodrigoquezadab.github.io/SanPatricio/evangelio.html</loc></url>
  <url><loc>https://rodrigoquezadab.github.io/SanPatricio/noticias.html</loc></url>
  <url><loc>https://rodrigoquezadab.github.io/SanPatricio/oraciones.html</loc></url>
  <url><loc>https://rodrigoquezadab.github.io/SanPatricio/recursos.html</loc></url>
  <url><loc>https://rodrigoquezadab.github.io/SanPatricio/servicios.html</loc></url>
</urlset>
```

#### 1.5 Crear `robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://rodrigoquezadab.github.io/SanPatricio/sitemap.xml
```

#### 1.6 Extraer CSS compartido

- [ ] Crear `styles.css` con los estilos comunes (body, cards, nav-link, botones flotantes, etc.)
- [ ] Reemplazar el bloque `<style>` repetido en cada página por `<link rel="stylesheet" href="styles.css">`
- [ ] Mantener Tailwind CDN por ahora (evaluar compilación en Fase 3)

---

### Fase 2 — Contenido Estático para Oraciones (Prioridad Media)

**Objetivo**: Hacer que el contenido de oraciones sea visible para los crawlers.

#### 2.1 Pre-renderizar oraciones en HTML

**Problema actual**: Las oraciones están en un array JS y se renderizan con `mostrarOracion(index)`. El HTML inicial solo tiene `<!-- rendered by JS -->`.

**Solución**: Similar al cancionero, crear un **build script** que genere `oraciones.html` con todo el contenido ya incrustado en el HTML, manteniendo la interactividad JS como capa de mejora progresiva.

**Tareas:**
- [ ] Crear `build_oraciones.js` que lea el array de oraciones y genere un HTML con todas las oraciones visibles en secciones `<article>` con sus propios `<h2>` y contenido
- [ ] Mantener la navegación de índice + detalle como mejora JS (progressive enhancement)
- [ ] El HTML base debe contener todo el texto visible para los crawlers

---

### Fase 3 — Optimizaciones Avanzadas (Prioridad Baja)

#### 3.1 Compilar Tailwind CSS
- [ ] Reemplazar `cdn.tailwindcss.com` por un CSS compilado (`npx tailwindcss build`)
- [ ] Reducir el tamaño de carga y eliminar la dependencia de JS para los estilos
- [ ] Integrar en el flujo de build existente

#### 3.2 Schema.org extendido
- [ ] Agregar `BreadcrumbList` en cada página
- [ ] Agregar `WebSite` con `SearchAction` en index
- [ ] Agregar `Event` para noticias de eventos
- [ ] Evaluar `FAQPage` para servicios

#### 3.3 Performance
- [ ] Lazy loading de imágenes con `loading="lazy"`
- [ ] Preconnect a CDNs frecuentes (FontAwesome, Google Fonts si se añaden)
- [ ] Minificación de HTML/CSS/JS en el paso de build

#### 3.4 Registro en herramientas
- [ ] Registrar el sitio en Google Search Console
- [ ] Enviar el sitemap manualmente
- [ ] Monitorear la indexación y errores de rastreo

---

## 📋 Resumen de Prioridades

| Fase | Tarea | Esfuerzo | Impacto SEO |
|---|---|---|---|
| **1.1** | Mover páginas a la raíz | Medio | ⭐⭐⭐ URLs limpias |
| **1.2** | Incrustar menú/footer estáticamente | Alto | ⭐⭐⭐⭐⭐ Navegación indexable |
| **1.3** | Meta tags en cada página | Bajo | ⭐⭐⭐⭐ Aparición en resultados |
| **1.4** | Sitemap.xml | Bajo | ⭐⭐⭐⭐ Descubrimiento de páginas |
| **1.5** | Robots.txt | Bajo | ⭐⭐⭐ Directivas de crawl |
| **1.6** | CSS compartido | Bajo | ⭐⭐ Mantenibilidad y peso |
| **2.1** | Oraciones pre-renderizadas | Medio | ⭐⭐⭐ Contenido indexable |
| **3.1** | Compilar Tailwind | Medio | ⭐⭐ Performance |
| **3.2** | Schema.org extendido | Bajo | ⭐⭐⭐ Rich snippets |
| **3.3** | Performance | Bajo | ⭐⭐ Core Web Vitals |
| **3.4** | Search Console | Bajo | ⭐⭐⭐⭐ Monitoreo y control |

---

## ⚠️ Consideraciones Importantes

1. **Noticias e Index**: El sistema dinámico de noticias (`noticias.json` + flyers) y el banner del `index.html` funcionan correctamente y **no requieren cambios** en esta iteración. Su contenido cambia frecuentemente y el sistema actual es práctico.

2. **Cantos**: `cantos.html` ya se genera estáticamente vía `build_cantos.js` y contiene 880 canciones en HTML puro. No requiere cambios estructurales.

3. **GitHub Pages**: Todas las mejoras deben ser compatibles con el hosting en GitHub Pages (sitio estático, sin servidor).

4. **Backward Compatibility**: Al mover las páginas de `/paginas/` a la raíz, considerar un `404.html` con redirección JS para URLs antiguas compartidas previamente.

---

> [!TIP]
> La Fase 1 completa debería ejecutarse como un solo bloque de trabajo, ya que los cambios de estructura (1.1) afectan directamente a los demás pasos. Se recomienda hacerlo en una rama Git separada y validar antes de mergear.
