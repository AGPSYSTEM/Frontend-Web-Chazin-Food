# 🛡️ CHAZIN FOOD WEB • PROTOCOLO INTERNO DE DESARROLLO
### Guía Oficial de Control de Versiones y Respaldo
**Mitigación de Conflictos en Git, Rama Bóveda y Prompts de IA para Desarrolladores**

> [!CAUTION]
> **REGLA DE ORO DEL EQUIPO:**
> Nunca comiences a programar sobre una copia desactualizada del repositorio sin antes hacer `git pull`, y **NUNCA** resuelvas conflictos eligiendo *"Aceptar todos mis cambios locales (Keep Current / Ours)"* sobre archivos que tus compañeros hayan rediseñado o actualizado.

---

## 1. Estructura de Ramas Oficiales y Copia de Seguridad

Tanto en el repositorio Frontend (`Frontend-Web-Chazin-Food`) como en el Backend (`Backend-Web-Chazin-Food`), el flujo de trabajo del equipo se organiza estrictamente en 3 ramas clave:

| Rama | Propósito & Entorno | ¿Quién la gestiona? |
| :--- | :--- | :--- |
| **`main`** | **Producción en vivo.** Despliega automáticamente en Vercel (Frontend) y Render + TiDB Cloud (Backend). | Solo recibe cambios aprobados y probados con build limpio. |
| **`develop`** | **Integración diaria del equipo.** Rama común donde se unen los avances antes de pasar a producción. | Todos los desarrolladores al terminar sus tareas. |
| **`backup/produccion-estable`** | **Bóveda / Copia de seguridad intocable.** Almacena el último estado 100% verificado y funcional del sistema. | Nadie sube tareas aquí. Sirve de rescate inmediato si se rompe algo. |

---

## 2. Flujo de Trabajo con Prompts (Para Asistentes de IA)

Si utilizas herramientas asistidas por IA como **Antigravity**, **Cursor**, **Windsurf** o **GitHub Copilot**, copia y pega exactamente los siguientes prompts según el momento del día para garantizar sincronización perfecta:

### A. Prompt para Iniciar la Jornada (Obligatorio antes de escribir código)
```text
Antes de hacer cualquier cambio en el código, ejecuta git fetch --all --prune, verifica en qué rama estoy y actualiza mi rama local con la última versión de origin/main y origin/develop. Si tengo cambios locales sin guardar, haz git stash, actualiza y vuelve a aplicar mi stash sin sobrescribir el código nuevo de mis compañeros.
```

### B. Prompt para Subir Cambios Seguros (git push)
```text
Quiero subir mis cambios al repositorio, pero sigue estrictamente estas reglas:
1. Haz git fetch origin primero.
2. Revisa con git status y git diff exactamente qué archivos modifiqué yo en esta tarea.
3. Si origin/main u origin/develop tienen commits nuevos de mis compañeros, intégralos conservando el 100% de los cambios de mis compañeros en los archivos que yo NO toqué.
4. Si hay conflicto en un archivo que ambos tocamos, combina ambas lógicas línea por línea; PROHIBIDO usar --ours o reemplazar el archivo entero con una versión antigua.
5. Ejecuta npm run build para verificar que haya 0 errores antes de hacer git push a main y develop.
```

### C. Prompt de Emergencia (Restauración desde la Bóveda de Respaldo)
```text
Se dañó un archivo o una vista tras un merge. Compara el estado actual con la rama origin/backup/produccion-estable usando git diff origin/backup/produccion-estable y restaura únicamente los archivos afectados sin borrar mi tarea actual.
```

---

## 3. Flujo de Trabajo Manual (Por Terminal / Consola)

Para quienes prefieran gestionar Git mediante la línea de comandos, sigan este procedimiento estándar de 4 pasos:

### Paso 1: Actualizar SIEMPRE antes de tocar código
Garantiza que partes desde la última versión probada y no sobreescribirás commits ajenos.
```bash
git checkout main
git fetch --all --prune
git pull origin main
```

### Paso 2: Crear o reactivar tu rama de trabajo
Asegúrate de que tu rama contenga todos los commits que ya están en main.
```bash
git checkout -b feature/mi-modulo
# (Si la rama ya existía previamente, actualízala con main):
git merge main
```

### Paso 3: Verificar archivos modificados y probar compilación
Nunca subas código sin antes probar que la compilación de producción sea 100% limpia.
```bash
git status
# En Frontend-Web-Chazin-Food:
npm run build
```

### Paso 4: Integrar sin pisar a los compañeros y subir
Usa rebase para traer posibles commits entrantes que tus compañeros hayan subido mientras programabas.
```bash
git add <solo-los-archivos-de-tu-tarea>
git commit -m "feat(modulo): descripcion clara del cambio"
git pull --rebase origin main
git push origin main
git push origin develop
```

---

## 4. Protocolo ante Conflictos en VS Code

1. **NUNCA elegir 'Aceptar Actual (Ours / Current)' de forma masiva:** Si tu rama llevaba días sin actualizarse, esa opción borrará el trabajo que tus compañeros hicieron en esos archivos durante toda la semana.
2. **Analizar bloque por bloque:** Compara *'Current Change'* (tu cambio local) frente a *'Incoming Change'* (el código nuevo en el repositorio remoto).
3. **Estrategia de suma, no de reemplazo:** Si tu compañero rediseñó una vista entera o agregó un sistema nuevo y tú solo agregabas un botón, acepta el cambio entrante (*Incoming*) y vuelve a incrustar tu botón encima con cuidado.

---

## 5. Comando de Emergencia (Rescate desde la Bóveda)

Si algún despliegue en Vercel o Render falla o se descubre que una vista quedó desconfigurada tras un merge, cualquier desarrollador puede restaurar un archivo específico de inmediato desde la rama de respaldo:

### Paso Rescate: Restaurar un archivo o actualizar la bóveda
Permite recuperar quirúrgicamente la versión estable o actualizar la copia de seguridad cuando todo el equipo valide un nuevo hito.
```bash
# 1. Restaurar un archivo específico pisado por error:
git checkout origin/backup/produccion-estable -- src/ruta/del/archivo.jsx

# 2. Actualizar la copia de seguridad tras validar un hito estable:
git branch -f backup/produccion-estable main
git push origin backup/produccion-estable --force
```

