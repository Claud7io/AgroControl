# AgroControl - Base de Datos (Fase 1)

**Proyecto Final de Grado - Desarrollo de Aplicaciones Web**  
**Alumno:** Claudio Terrados Sánchez  
**Centro:** IES Albarregas, Mérida  
**Curso:** 2025/2026

---

Este documento complementa el modelo Entidad-Relación entregado en `UT2_T3_BD`. Recoge los cambios introducidos en la implementación SQL respecto al diseño inicial, las decisiones técnicas tomadas y cómo poner en marcha la base de datos.

## 📁 Archivos de la Fase 1

- **`01a_schema_sin_trigger.sql`** - Creación de la base de datos, tablas, restricciones e índices
- **`02_seed.sql`** - Datos de prueba para desarrollo y demostración
- **`README_BD.md`** - Este documento (documentación técnica)

## 🚀 Cómo ejecutar la base de datos

### Requisitos previos
- MariaDB 10.6 o superior instalado
- Cliente gráfico HeidiSQL (recomendado) o línea de comandos

### Opción A: HeidiSQL (Recomendado para Windows)

1. **Abrir HeidiSQL y conectar:**
   - Abrir HeidiSQL
   - Session Manager → New
   - Configurar: `localhost`, usuario `root`, puerto `3306`
   - Introducir contraseña de root
   - Botón "Open"

2. **Ejecutar el schema:**
   - File → Load SQL file...
   - Seleccionar `01a_schema_sin_trigger.sql`
   - Pulsar **F9** para ejecutar
   - Verificar mensajes de éxito

3. **Ejecutar el seed (datos de prueba):**
   - File → Load SQL file...
   - Seleccionar `02_seed.sql`
   - Pulsar **F9** para ejecutar

4. **Verificar la instalación:**
   - Panel izquierdo → Botón derecho → Refresh
   - Debería aparecer la base de datos `agrocontrol`
   - Desplegar → Ver 6 tablas

### Opción B: Línea de comandos

```bash
# Desde la carpeta donde están los archivos SQL
mariadb -u root -p < 01a_schema_sin_trigger.sql
mariadb -u root -p < 02_seed.sql
```

### Verificación con queries

Ejecutar estas consultas para verificar que todo se cargó correctamente:

```sql
-- Ver usuarios creados
SELECT id_usuario, nombre, email, rol, activo 
FROM agrocontrol.usuario;

-- Ver controles de calidad
SELECT 
  id_control, 
  DATE_FORMAT(fecha_control, '%d/%m/%Y %H:%i') as fecha,
  resultado,
  porcentaje_defectos,
  brix
FROM agrocontrol.control_calidad
ORDER BY fecha_control;

-- Ver proveedores y sus variedades
SELECT 
  p.nombre AS proveedor,
  GROUP_CONCAT(v.nombre_variedad SEPARATOR ', ') AS variedades
FROM agrocontrol.proveedor p
JOIN agrocontrol.proveedor_variedad pv ON pv.id_proveedor = p.id_proveedor
JOIN agrocontrol.variedad v ON v.id_variedad = pv.id_variedad
GROUP BY p.id_proveedor;
```

---

## 📊 Cambios respecto al modelo E/R original

Los ajustes siguientes refuerzan la integridad, la coherencia con los requisitos funcionales (propuesta del proyecto) y la alineación con los wireframes de Figma.

### 1. Tabla `usuario`

| Aspecto | Diseño E/R original | Implementación final | Motivo del cambio |
|---------|-------------------|---------------------|-------------------|
| Email | *(no existía)* | **Campo `email` añadido** (VARCHAR 150, UNIQUE) | **RF1** establece login por correo electrónico. El E/R solo tenía `nombre` |
| Contraseña | Campo `contraseña` | Renombrado a **`password_hash`** (VARCHAR 255) | Evita problemas con la ñ en código y refleja que se almacena el hash bcrypt (**RNF1**), no texto plano |
| Rol | Texto libre | **ENUM** ('operario', 'administrador') | Restringe valores válidos a nivel de BD, previene errores de tipeo |
| Baja de usuarios | No contemplado | **Campo `activo`** (BOOLEAN, default TRUE) | Permite desactivar usuarios sin eliminarlos → preserva integridad histórica de controles |

**Justificación técnica:** La eliminación física de un usuario rompería la trazabilidad (requisito clave del sistema). Con `activo=FALSE` se implementa un *soft delete* que mantiene las referencias de los controles históricos.

### 2. Tabla `camion`

| Cambio | Implementación | Motivo |
|--------|----------------|--------|
| Matrícula única | **CONSTRAINT UNIQUE** en `matricula` | Un vehículo no puede estar registrado dos veces |
| Campo `fecha_entrada` | **Eliminado del E/R original** | Un mismo camión entra múltiples veces. La fecha real de cada entrada vive en `control_calidad.fecha_control` |
| Baja de camiones | Campo `activo` añadido | Mismo motivo que usuarios: soft delete para trazabilidad |

### 3. Tabla `control_calidad` (núcleo del sistema)

**Campos añadidos:**
- **`observaciones` TEXT** → Aparece en el wireframe "Nuevo Control" pero no estaba en el E/R

**Campos modificados:**
- **`resultado` como ENUM** ('aprobado', 'rechazado', 'pendiente') → Coincide exactamente con los filtros del wireframe "Historial"
- **`porcentaje_defectos`** → Columna **VIRTUAL** (calculada automáticamente):
  ```sql
  ROUND(((kilos_verde + kilos_podridos + kilos_limitado) / kilos_total) * 100, 2)
  ```
  **Ventajas:** Evita inconsistencias (dato derivable), siempre refleja valores actuales, reduce redundancia

**Restricciones CHECK añadidas:**
```sql
CHECK (kilos_total > 0)                                    -- No puede haber entrada sin peso
CHECK (kilos_sin_defectos >= 0 AND ...)                   -- Kilos parciales no negativos
CHECK ((suma de kilos parciales) <= kilos_total)          -- Suma <= total (coherencia)
CHECK (brix >= 0 AND brix <= 15)                          -- Rango industrial plausible
```

**Integridad referencial reforzada:**
Todas las FK usan **`ON DELETE RESTRICT`**:
```sql
FOREIGN KEY (id_usuario)  REFERENCES usuario(id_usuario)   ON DELETE RESTRICT
FOREIGN KEY (id_camion)   REFERENCES camion(id_camion)     ON DELETE RESTRICT
FOREIGN KEY (id_variedad) REFERENCES variedad(id_variedad) ON DELETE RESTRICT
```

**Significado:** No se puede borrar un usuario, camión o variedad si tiene controles asociados → **garantiza trazabilidad total** (requisito del proyecto). La única forma de "dar de baja" es marcar `activo=FALSE`.

### 4. Tablas `proveedor` y `variedad`

- **`nombre` UNIQUE** en ambas (no duplicados)
- **`activo` BOOLEAN** para soft delete
- Fechas de creación para auditoría

### 5. Tabla `proveedor_variedad`

Implementa la relación **N:M** entre proveedores y variedades. Decisión clave del E/R:
- Un proveedor puede suministrar múltiples variedades
- Una variedad puede venir de múltiples proveedores

**Alternativas descartadas:**
- Meter variedades como texto en `proveedor` → redundancia, dificulta consultas
- Meter proveedores como texto en `variedad` → mismo problema
- **Solución adoptada:** Tabla intermedia normalizada → flexibilidad máxima

---

## 🔍 Índices estratégicos

Los índices se han diseñado pensando en las **consultas reales del wireframe "Historial"**:

```sql
CREATE INDEX idx_cc_fecha     ON control_calidad (fecha_control);    -- Filtro por fecha
CREATE INDEX idx_cc_resultado ON control_calidad (resultado);        -- Filtro por estado
CREATE INDEX idx_cc_camion    ON control_calidad (id_camion);        -- JOINs
CREATE INDEX idx_cc_variedad  ON control_calidad (id_variedad);      -- JOINs
CREATE INDEX idx_cc_usuario   ON control_calidad (id_usuario);       -- Auditoría
CREATE INDEX idx_camion_prov  ON camion (id_proveedor);              -- Consultas por proveedor
```

**Impacto:** Mejora significativa en tiempos de respuesta para filtrados complejos (fecha + proveedor + resultado).

---

## 🎯 Evaluación automática de calidad (RF4)

El **Requisito Funcional RF4** establece: *"El sistema evaluará automáticamente si la carga es aceptada o rechazada"*.

### Decisión técnica tomada

**Implementación en backend (Fase 2)** en lugar de trigger de base de datos.

**Motivos:**
1. **Flexibilidad:** Los criterios de calidad pueden cambiar sin tocar la BD
2. **Mantenibilidad:** Lógica de negocio centralizada en el código
3. **Testeable:** Permite pruebas unitarias automatizadas
4. **Profesional:** Arquitectura moderna (lógica en aplicación, BD para datos)
5. **Documentación:** Más fácil de explicar en la defensa del proyecto

### Criterios de evaluación definidos

Estos valores se implementarán en el backend (Node.js + Express):

| Criterio | Umbral | Justificación industrial |
|----------|--------|--------------------------|
| **% defectos totales** | ≤ 12% | Valor estándar en industria de transformación |
| **% kilos podridos** | ≤ 4% | Umbral estricto: podridos implican riesgo microbiológico |
| **Brix (°Brix)** | ≥ 4.5 | Mínimo requerido para concentrado de tomate |

**Fórmula:**
```
Defectos totales (%) = (kilos_verde + kilos_podridos + kilos_limitado) / kilos_total × 100
Podridos (%) = kilos_podridos / kilos_total × 100
```

**Resultado:**
- Si cumple los 3 criterios → `aprobado`
- Si falla alguno → `rechazado`
- Por defecto al crear → `pendiente` (evaluado después por el backend)

> **Nota para la memoria:** Estos umbrales provienen de estándares reales de la industria del tomate en Extremadura. En una evolución futura podrían moverse a una tabla `parametros_calidad` configurable desde la interfaz de administrador.

---

## 📋 Modelo final implementado

```
┌─────────────────────────────────────────────────────────────────┐
│                      ESQUEMA AGROCONTROL                        │
└─────────────────────────────────────────────────────────────────┘

usuario
├── id_usuario (PK, AUTO_INCREMENT)
├── nombre
├── email (UNIQUE)
├── password_hash
├── rol (ENUM: 'operario', 'administrador')
├── activo (BOOLEAN)
└── fecha_creacion

proveedor
├── id_proveedor (PK)
├── nombre (UNIQUE)
├── localidad
├── activo
└── fecha_creacion

variedad
├── id_variedad (PK)
├── nombre_variedad (UNIQUE)
├── activo
└── fecha_creacion

proveedor_variedad (N:M)
├── id_proveedor (PK, FK → proveedor)
└── id_variedad (PK, FK → variedad)

camion
├── id_camion (PK)
├── matricula (UNIQUE)
├── id_proveedor (FK → proveedor, RESTRICT)
├── activo
└── fecha_creacion

control_calidad (NÚCLEO DEL SISTEMA)
├── id_control (PK)
├── fecha_control
├── id_usuario (FK → usuario, RESTRICT)
├── id_camion (FK → camion, RESTRICT)
├── id_variedad (FK → variedad, RESTRICT)
├── kilos_total
├── kilos_sin_defectos
├── kilos_verde
├── kilos_podridos
├── kilos_limitado
├── porcentaje_defectos (VIRTUAL: calculado automáticamente)
├── brix
├── resultado (ENUM: 'aprobado', 'rechazado', 'pendiente')
└── observaciones
```

---

## 🗃️ Datos de prueba incluidos

El archivo `02_seed.sql` carga datos realistas para desarrollo y demostración:

### Usuarios (3)
- **Administrador:** `admin@agrocontrol.local` / Admin1234!
- **Operario 1:** `operario@agrocontrol.local` / Operario1234!
- **Operario 2:** `maria.gomez@agrocontrol.local` / Operario1234!

> ⚠️ **IMPORTANTE:** Los password_hash actuales son PLACEHOLDERS. En la Fase 2 se ejecutará un script Node.js que generará hashes bcrypt reales y actualizará la tabla.

### Proveedores (4)
Empresas reales de la zona de Badajoz/Mérida:
- Cooperativa Agrícola Vegas Altas (Don Benito)
- Tomates del Guadiana S.L. (Mérida)
- Agro Extremadura SAT (Villanueva de la Serena)
- Campos del Sur Cooperativa (Badajoz)

### Variedades (5)
Tipos habituales en industria del tomate:
- Heinz 1015
- Rio Grande
- H-9661
- CXD-179
- Kalvert

### Relaciones proveedor-variedad (10)
Cada proveedor trabaja con 2-3 variedades

### Camiones (6)
Matrículas españolas válidas asociadas a proveedores

### Controles de calidad (6)
Mezcla estratégica de resultados para probar filtros:
- **Aprobados** (3): cumplen todos los criterios
- **Rechazados** (2): fallan por exceso de defectos o brix bajo
- **Pendiente** (1): a la espera de validación manual

---

## 🔄 Próximos pasos - Fase 2 (Backend)

En la siguiente fase crearemos el backend con Node.js + Express que:

1. **Se conecta a esta base de datos** usando `mysql2`
2. **Implementa la evaluación automática** (RF4) en el endpoint POST de controles
3. **Gestiona autenticación JWT** y roles de usuario
4. **Expone API REST** para todas las operaciones CRUD
5. **Genera hashes bcrypt** y actualiza el seed con contraseñas reales

---

## 📚 Justificación para la defensa del TFG

### Normalización aplicada
- **3FN (Tercera Forma Normal):** Todos los datos no clave dependen únicamente de la clave primaria
- Eliminación de redundancias mediante tablas intermedias (`proveedor_variedad`)
- Datos derivables (porcentaje_defectos) calculados en lugar de almacenados

### Integridad referencial
- Uso exhaustivo de claves foráneas con `ON DELETE RESTRICT` → trazabilidad garantizada
- Restricciones CHECK para validación de datos a nivel de BD
- Índices estratégicos para optimizar consultas reales del sistema

### Decisiones de diseño profesionales
- Soft delete (`activo=FALSE`) en lugar de DELETE físico
- Columnas virtuales para datos calculados → consistencia garantizada
- Lógica de negocio en aplicación, no en triggers → mantenibilidad

### Alineación con requisitos
- Todos los RF (Requisitos Funcionales) implementados en el modelo
- Todos los RNF (Requisitos No Funcionales) contemplados (hashing, integridad)
- Wireframes y arquitectura de información reflejados en el esquema

---

**Fecha de creación:** Diciembre 2024  
**Última actualización:** Mayo 2026  
**Estado:** ✅ Fase 1 completada
