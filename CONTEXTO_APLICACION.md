# Contexto de la Aplicación y Registro de Cambios

Este documento sirve como guía técnica para entender el funcionamiento del sitio web de la **Parroquia San Patricio** y como bitácora para registrar cambios significativos en su funcionalidad.

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
- **Imágenes de Noticias Manuales**: Deben guardarse en `/assets/flyers-noticias/`. Esta carpeta contiene las imágenes vinculadas específicamente a las entradas de `noticias.json`.
- **Flyers Automáticos**: Deben guardarse en `/assets/flyers/` para ser detectados automáticamente por el script de carga.
- **Imágenes Generales**: Logos, fotos de la parroquia y otros elementos estáticos permanecen en la raíz de `/assets`.


### 🧹 Romper Caché
Cuando realices cambios críticos en archivos CSS o JS, utiliza el script `bust_cache.js` para actualizar las versiones (`?v=X`) en los archivos HTML y asegurar que los usuarios vean la versión más reciente.

---

## 📋 Registro de Cambios (Changelog)

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
