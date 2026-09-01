# Reglas de Trabajo para Asistentes y Agentes de IA

Consulta siempre la documentación completa del proyecto en [docs/CONTEXTO_APLICACION.md](file:///c:/Users/Rod/Desktop/code/SanPatricio/docs/CONTEXTO_APLICACION.md).

---

## 🔴 REGLA PRIMARIA: Restricción Estricta de Ámbito (Scope Local)

1. **Alcance Local Obligatorio**:
   - Cualquier instrucción, prompt o solicitud de implementación futuro, por mínimo o específico que sea el cambio, **debe restringirse única y exclusivamente al área, archivo, módulo o componente en el que se solicita trabajar**, y NUNCA extenderse a todo el proyecto.
2. **Prohibición de Cambios Globales / Generales**:
   - Está terminantemente prohibido implementar cambios generales, refactorizaciones no solicitadas, alteraciones masivas de estilos o modificaciones colaterales en otras secciones o páginas que no pertenezcan al ámbito exacto de trabajo.
3. **Aislamiento de Cambios**:
   - Todo trabajo debe realizarse exclusivamente en el ámbito delimitado, preservando intacta la estructura y el código del resto del proyecto general como directriz de máxima prioridad.

---

## 🟡 Gestión de Versiones y Git

* **Sin commits automáticos**: NUNCA ejecutar `git add` ni `git commit` por cuenta propia tras finalizar una tarea.
* **Sin push automático**: Bajo ninguna circunstancia ejecutar `git push` sin orden explícita.
* **Flujo de aprobación**: Dejar siempre los cambios en el working directory listos para revisión y solicitar aprobación antes de cualquier acción de Git.
