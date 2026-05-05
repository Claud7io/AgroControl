# AgroControl - Sistema de Control de Calidad

**Proyecto Final de Grado - Desarrollo de Aplicaciones Web**  
**Alumno:** Claudio Terrados Sánchez  
**Centro:** IES Albarregas, Mérida  
**Curso:** 2025/2026

---

## 📋 Descripción del Proyecto

AgroControl es un sistema web completo para el control de calidad y trazabilidad en una fábrica de procesamiento de tomate industrial. El sistema permite registrar, evaluar y gestionar controles de calidad de camiones de tomate, aplicando criterios industriales para determinar automáticamente si una carga es aceptada o rechazada.

### Funcionalidades principales:

- ✅ Registro de controles de calidad con evaluación automática
- ✅ Gestión de proveedores, camiones y variedades de tomate
- ✅ Historial completo con filtros avanzados
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Sistema de autenticación con roles (Administrador/Operario)
- ✅ Interfaz moderna y responsive basada en wireframes de Figma

---

## 🏗️ Arquitectura del Sistema

El proyecto está dividido en 3 componentes principales:

```
AgroControl/
├── database/          # Scripts SQL para MariaDB
├── backend/           # API REST con Node.js + Express
└── frontend/          # Aplicación web con React + Vite
```

### Tecnologías utilizadas:

**Base de Datos:**
- MariaDB 10.6+

**Backend:**
- Node.js 20.x
- Express 4.18
- MySQL2 (driver de base de datos)
- bcrypt (cifrado de contraseñas)
- jsonwebtoken (autenticación JWT)
- CORS habilitado

**Frontend:**
- React 18
- Vite 5
- React Router DOM 6
- Axios (cliente HTTP)
- Lucide React (iconos)
- CSS puro (sin frameworks)

---

## 🚀 Instalación y Configuración

### Requisitos previos:

- Node.js 20.x o superior
- MariaDB 10.6+ o MySQL 8.0+
- Git (opcional)

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/agrocontrol.git
cd agrocontrol
```

### 2. Configurar la Base de Datos

#### a) Crear la base de datos

Abre HeidiSQL, MySQL Workbench o cualquier cliente SQL y ejecuta:

```sql
CREATE DATABASE agrocontrol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### b) Ejecutar los scripts SQL

En este orden:

1. **`database/01a_schema_sin_trigger.sql`** - Crea las tablas
2. **`database/02_seed.sql`** - Inserta datos de prueba

#### c) Verificar

```sql
USE agrocontrol;
SELECT * FROM usuario;  -- Deberías ver 3 usuarios
```

### 3. Configurar el Backend

```bash
cd backend
npm install
```

Crea el archivo `.env` (copia desde `.env.example`):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=agrocontrol
DB_PORT=3306
JWT_SECRET=una_clave_secreta_muy_larga_y_aleatoria
PORT=3000
NODE_ENV=development
```

Genera los hashes de contraseñas:

```bash
npm run generar-hashes
```

Inicia el servidor:

```bash
npm start
```

Deberías ver: `✅ Servidor corriendo en http://localhost:3000`

### 4. Configurar el Frontend

Abre otra terminal:

```bash
cd frontend
npm install
npm run dev
```

El frontend se abrirá en: **http://localhost:5173**

---

## 👤 Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@agrocontrol.local | Admin1234! | Administrador |
| operario@agrocontrol.local | Operario1234! | Operario |
| maria.gomez@agrocontrol.local | Operario1234! | Operario |

---

## 📖 Documentación Adicional

- **Base de Datos:** Ver `database/README_BD.md`
- **Backend API:** Ver `backend/README.md`
- **Frontend:** Ver `frontend/README.md`
- **Sistema de Diseño:** Ver `DESIGN_SYSTEM.md`

---

## 🎯 Criterios de Evaluación de Calidad (RF4)

El sistema evalúa automáticamente cada control según estos criterios:

1. **Defectos totales ≤ 12%** (suma de verdes + podridos + limitados)
2. **Podridos ≤ 4%** (umbral estricto por riesgo microbiológico)
3. **Brix ≥ 4.5** (mínimo para concentrado industrial)

Si se cumplen los 3 criterios → **Aprobado ✅**  
Si falla alguno → **Rechazado ❌**

---

## 📸 Capturas de Pantalla

### Login
![Login](docs/screenshots/login.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Nuevo Control
![Nuevo Control](docs/screenshots/nuevo-control.png)

### Historial
![Historial](docs/screenshots/historial.png)

---

## 🔐 Seguridad

- ✅ Contraseñas cifradas con bcrypt (10 salt rounds)
- ✅ Autenticación JWT con tokens de 8 horas
- ✅ Validación de roles (admin/operario)
- ✅ Protección contra SQL injection (consultas preparadas)
- ✅ CORS configurado
- ✅ Soft delete (datos nunca se borran físicamente)

---

## 📊 Modelo de Datos

El sistema gestiona las siguientes entidades:

- **Usuarios** - Operarios y administradores del sistema
- **Proveedores** - Cooperativas y empresas suministradoras
- **Camiones** - Vehículos de cada proveedor
- **Variedades** - Tipos de tomate (Heinz 1015, Rio Grande, etc.)
- **Controles de Calidad** - Registro completo de cada control realizado

Ver diagrama E/R completo en `database/README_BD.md`

---

## 🎨 Diseño UI/UX

El diseño está basado en wireframes de alta fidelidad creados en Figma, siguiendo un estilo minimalista industrial:

- **Tipografía:** Roboto (Google Fonts)
- **Colores principales:** Verde #4CAF50 (Agro) + Naranja #FF6B35 (Control)
- **Componentes:** Chips/pills para selectores, cards con sombras sutiles
- **Layout:** Sidebar fijo + header superior

Ver especificaciones completas en `DESIGN_SYSTEM.md`

---

## 🐛 Solución de Problemas

### El backend no conecta a la base de datos
- Verifica que MariaDB/MySQL está corriendo
- Comprueba las credenciales en `backend/.env`
- Verifica el puerto (default: 3306)

### Error "Token expirado" en el frontend
- Los tokens JWT duran 8 horas
- Cierra sesión y vuelve a iniciar sesión

### El frontend no se conecta al backend
- Verifica que el backend está corriendo en http://localhost:3000
- Comprueba `frontend/.env` (debe apuntar a http://localhost:3000/api)

---

## 📝 Licencia

Este proyecto es un Trabajo de Fin de Grado con fines educativos.

---

## 👨‍💻 Autor

**Claudio Terrados Sánchez**  
Ciclo Formativo de Grado Superior - Desarrollo de Aplicaciones Web  
IES Albarregas, Mérida  
Curso 2025/2026

---

## 🙏 Agradecimientos

A los profesores del IES Albarregas por su guía durante el desarrollo de este proyecto.
