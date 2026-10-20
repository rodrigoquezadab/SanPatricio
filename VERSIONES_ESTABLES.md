# 📌 Control de Versiones Estables (Desarrollador)

Este documento registra los **hitos y versiones estables** del proyecto **Parroquia San Patricio**. Su propósito es permitir al desarrollador identificar rápidamente puntos de restauración confiables sin tener que revisar decenas de commits menores en el historial de Git, facilitando volver a un estado funcional probado en caso de regresiones o fallos.

---

## 📋 Registro Histórico de Versiones Estables

| Versión | Fecha | Commit (Corto) | Commit Hash Completo | Descripción del Estado / Hito | Comando Rápido de Recuperación |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **v1.2.0** *(Actual)* | 2026-10-20 | `122a891` | `122a8911874b94e236a956c8611b22f14ca6c961` | • Noticias y Cuaresma archivadas en `data/noticias.json`.<br>• Calendario sincronizado con actividades parroquiales.<br>• Buscador de cantos optimizado (búsqueda difusa/fonética, tolerancia a puntuación/comas, aislamiento de letra y botón flotante de retorno rápido).<br>• Estructura SEO flat y componentes estáticos unificados. | `git checkout 122a891` |
| **v1.1.0** | 2026-08-15 | `9798683` | `97986838d8e8123b13d65b88666ec96aad1e6cab` | • Gran revisión y reorganización de directorios (`data/`, `tools/`, `docs/`).<br>• Desacople de eventos de calendario.<br>• Normalización de flyers y carga dinámica. | `git checkout 9798683` |

---

## 🛠️ Guía Rápida: Cómo Revertir o Restaurar a una Versión Estable

Si se presenta un error en producción o un cambio rompe la funcionalidad y necesitas volver a un estado estable, utiliza una de las siguientes opciones según tu necesidad:

### Opción A: Explorar el estado estable sin modificar tu rama actual (Seguro)
Para revisar los archivos tal como estaban en esa versión sin alterar tu historial:
```bash
git checkout 122a891
```
*(Para volver a la rama principal cuando termines de revisar, ejecuta: `git checkout main`)*

---

### Opción B: Crear una rama de trabajo a partir de la versión estable (Recomendado)
Para investigar o trabajar en una solución basada en el punto estable sin tocar `main`:
```bash
git checkout -b rollback-v1.2.0 122a891
```

---

### Opción C: Revertir cambios manteniendo el historial (Rollback Seguro en `main`)
Si ya estás en `main` y deseas deshacer los cambios posteriores a una versión creando un commit limpio de reversión:
```bash
# Revertir un commit defectuoso específico:
git revert <HASH_DEL_COMMIT_A_DESHACER>
```

---

### Opción D: Volver de forma definitiva a la versión estable (Hard Reset)
> ⚠️ **Atención**: Esto descarta cualquier cambio local no guardado o commits posteriores al hash indicado.
```bash
# 1. Asegurar estar en la rama main
git checkout main

# 2. Restaurar el árbol de trabajo al commit exacto
git reset --hard 122a891

# 3. Si necesitas forzar la sincronización en el repositorio remoto:
git push origin main --force
```

---

## 🔄 Procedimiento para Registrar una Nueva Versión Estable

Cuando se termine una tanda de mejoras y el sitio esté 100% probado y listo para considerarse nueva versión estable:

1. **Obtener el hash del commit actual:**
   ```bash
   git log -1 --format="%h (%H)"
   ```
2. **Añadir la nueva entrada** en la tabla superior de este archivo (`VERSIONES_ESTABLES.md`), detallando fecha, versión, hash y las características o arreglos incluidos.
3. **Guardar el registro y realizar el commit de versión:**
   ```bash
   git add VERSIONES_ESTABLES.md
   git commit -m "version estable YYYY-MM-DD"
   git push origin main
   ```
4. *(Opcional pero recomendado)* **Crear un Git Tag para fácil visualización en GitHub:**
   ```bash
   git tag -a v1.X.X -m "Versión estable YYYY-MM-DD"
   git push origin --tags
   ```
