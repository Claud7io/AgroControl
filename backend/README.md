# AgroControl - Backend API

**API REST para sistema de control de calidad de tomate**  
**Proyecto Final de Grado - DAW**  
**Alumno:** Claudio Terrados Sánchez

---

## 🚀 Instalación y configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del backend (copia desde `.env.example`):

```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=agrocontrol
DB_PORT=3306

# JWT Secret (cambiar por una clave segura)
JWT_SECRET=una_clave_muy_larga_y_secreta_para_produccion

# Puerto del servidor
PORT=3000

# Entorno
NODE_ENV=development
```

### 3. Generar hashes de contraseñas

Este paso actualiza la tabla `usuario` con hashes bcrypt reales:

```bash
npm run generar-hashes
```

Deberías ver:

```
✅ Hash actualizado para admin@agrocontrol.local
✅ Hash actualizado para operario@agrocontrol.local
✅ Hash actualizado para maria.gomez@agrocontrol.local
```

### 4. Iniciar el servidor

```bash
npm start
```

Para desarrollo con auto-restart:

```bash
npm run dev
```

El servidor estará disponible en: **http://localhost:3000**

---

## 📁 Estructura del proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js           # Conexión a MariaDB (pool)
│   ├── middlewares/
│   │   └── auth.js               # Verificación JWT y roles
│   ├── routes/
│   │   ├── auth.routes.js        # Rutas de autenticación
│   │   ├── usuarios.routes.js    # CRUD usuarios (admin)
│   │   ├── proveedores.routes.js # CRUD proveedores
│   │   ├── camiones.routes.js    # CRUD camiones
│   │   ├── variedades.routes.js  # CRUD variedades
│   │   └── controles.routes.js   # CRUD controles + evaluación
│   ├── controllers/
│   │   └── ...                   # Lógica de negocio
│   ├── utils/
│   │   └── evaluarCalidad.js     # Algoritmo RF4
│   └── app.js                    # Servidor Express
├── scripts/
│   └── generar-hashes.js         # Actualizar passwords
├── .env                          # Variables de entorno (no subir a Git)
├── .env.example                  # Plantilla de .env
├── .gitignore
├── package.json
└── README.md                     # Este archivo
```

---

## 🔐 Autenticación

La API usa **JWT (JSON Web Tokens)** para autenticación.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@agrocontrol.local",
  "password": "Admin1234!"
}
```

**Respuesta exitosa:**

```json
{
  "mensaje": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 1,
    "nombre": "Administrador del Sistema",
    "email": "admin@agrocontrol.local",
    "rol": "administrador"
  }
}
```

### Uso del token

Incluye el token en el header `Authorization` de todas las peticiones protegidas:

```http
GET /api/controles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 👥 Usuarios de prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@agrocontrol.local | Admin1234! | administrador |
| operario@agrocontrol.local | Operario1234! | operario |
| maria.gomez@agrocontrol.local | Operario1234! | operario |

---

## 📡 Endpoints de la API

### Autenticación (`/api/auth`)

| Método | Ruta | Descripción | Requiere Auth | Rol |
|--------|------|-------------|---------------|-----|
| POST | `/login` | Iniciar sesión | ❌ | - |
| POST | `/register` | Registrar usuario | ✅ | admin |
| GET | `/perfil` | Ver perfil propio | ✅ | - |

---

### Controles de Calidad (`/api/controles`)

| Método | Ruta | Descripción | Requiere Auth | Rol |
|--------|------|-------------|---------------|-----|
| GET | `/` | Listar controles (con filtros) | ✅ | - |
| GET | `/:id` | Ver detalle de un control | ✅ | - |
| POST | `/` | Crear nuevo control | ✅ | - |
| PUT | `/:id` | Actualizar control | ✅ | - |
| DELETE | `/:id` | Eliminar control | ✅ | admin |
| GET | `/estadisticas/hoy` | Estadísticas del día | ✅ | - |

#### Filtros disponibles (GET `/api/controles`)

```
?fecha=2026-05-04               # Filtrar por fecha
?proveedor=Cooperativa          # Filtrar por nombre de proveedor
?resultado=aprobado             # Filtrar por resultado (aprobado/rechazado/pendiente)
?limit=50                       # Límite de resultados (default: 50)
?offset=0                       # Paginación
```

#### Crear control (POST `/api/controles`)

```json
{
  "id_camion": 1,
  "id_variedad": 2,
  "kilos_total": 25000,
  "kilos_sin_defectos": 23500,
  "kilos_verde": 800,
  "kilos_podridos": 200,
  "kilos_limitado": 500,
  "brix": 5.2,
  "observaciones": "Carga en buen estado"
}
```

**El sistema evalúa automáticamente (RF4) y asigna `resultado`:**
- `aprobado` → Si cumple criterios de calidad
- `rechazado` → Si falla algún criterio

**Criterios de evaluación:**
- Defectos totales ≤ 12%
- Podridos ≤ 4%
- Brix ≥ 4.5

---

### Proveedores (`/api/proveedores`)

| Método | Ruta | Descripción | Requiere Auth | Rol |
|--------|------|-------------|---------------|-----|
| GET | `/` | Listar proveedores | ✅ | - |
| GET | `/:id` | Ver detalle de proveedor | ✅ | - |
| POST | `/` | Crear proveedor | ✅ | admin |
| PUT | `/:id` | Actualizar proveedor | ✅ | admin |
| DELETE | `/:id` | Desactivar proveedor | ✅ | admin |

---

### Camiones (`/api/camiones`)

| Método | Ruta | Descripción | Requiere Auth | Rol |
|--------|------|-------------|---------------|-----|
| GET | `/` | Listar camiones | ✅ | - |
| GET | `/:id` | Ver detalle de camión | ✅ | - |
| POST | `/` | Crear camión | ✅ | admin |
| PUT | `/:id` | Actualizar camión | ✅ | admin |
| DELETE | `/:id` | Desactivar camión | ✅ | admin |

#### Filtros (GET `/api/camiones`)

```
?id_proveedor=2                # Filtrar por proveedor
?incluir_inactivos=true        # Incluir camiones desactivados
```

---

### Variedades (`/api/variedades`)

| Método | Ruta | Descripción | Requiere Auth | Rol |
|--------|------|-------------|---------------|-----|
| GET | `/` | Listar variedades | ✅ | - |
| GET | `/:id` | Ver detalle de variedad | ✅ | - |
| POST | `/` | Crear variedad | ✅ | admin |
| PUT | `/:id` | Actualizar variedad | ✅ | admin |
| DELETE | `/:id` | Desactivar variedad | ✅ | admin |

---

### Usuarios (`/api/usuarios`)

| Método | Ruta | Descripción | Requiere Auth | Rol |
|--------|------|-------------|---------------|-----|
| GET | `/` | Listar usuarios | ✅ | admin |
| GET | `/:id` | Ver detalle de usuario | ✅ | admin |
| PUT | `/:id` | Actualizar usuario | ✅ | admin |
| DELETE | `/:id` | Desactivar usuario | ✅ | admin |

---

## 🧪 Probar la API

### Opción 1: Thunder Client (VS Code)

1. Instala la extensión **Thunder Client** en VS Code
2. Crea una nueva colección "AgroControl"
3. Añade requests con los endpoints de arriba

### Opción 2: cURL (terminal)

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agrocontrol.local","password":"Admin1234!"}'

# Guardar el token que devuelve

# Obtener controles
curl http://localhost:3000/api/controles \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Opción 3: Postman

Importa esta colección base y añade el token en Authorization → Bearer Token.

---

## 🔒 Seguridad implementada

- ✅ Contraseñas hasheadas con **bcrypt** (10 salt rounds)
- ✅ Autenticación con **JWT** (tokens expiran en 8 horas)
- ✅ Validación de roles (admin vs operario)
- ✅ Protección contra SQL injection (consultas preparadas)
- ✅ CORS habilitado para frontend
- ✅ Soft delete (desactivación en lugar de borrado físico)
- ✅ Restricciones CHECK en base de datos

---

## 🐛 Solución de problemas

### Error: `Cannot connect to MariaDB`

- Verifica que MariaDB esté corriendo (Services en Windows)
- Comprueba las credenciales en `.env`
- Verifica el puerto (default: 3306)

### Error: `JWT_SECRET is not defined`

- Asegúrate de tener el archivo `.env` en la raíz del backend
- Verifica que `JWT_SECRET` esté definido

### Error: `User X doesn't exist`

- Ejecuta el script: `npm run generar-hashes`
- Verifica que la base de datos `agrocontrol` tenga datos (`02_seed.sql`)

---

## 📚 Tecnologías utilizadas

- **Node.js** 20.x
- **Express** 4.18 - Framework web
- **mysql2** 3.9 - Driver MariaDB/MySQL
- **bcrypt** 5.1 - Hash de contraseñas
- **jsonwebtoken** 9.0 - Autenticación JWT
- **dotenv** 16.4 - Variables de entorno
- **cors** 2.8 - CORS middleware

---


**Autor:** Claudio Terrados Sánchez  
**Proyecto:** AgroControl - Sistema de Control de Calidad  
**Ciclo:** Desarrollo de Aplicaciones Web  
**Centro:** IES Albarregas, Mérida
