# AgroControl - Frontend

**Interfaz web para AgroControl - Sistema de Control de Calidad**

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

El archivo `.env` ya viene preconfigurado:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El frontend se abrirá automáticamente en: **http://localhost:5173**

## ⚠️ Importante

**El backend debe estar corriendo en `http://localhost:3000` para que funcione.**

## 👤 Credenciales de prueba

- **Admin:** admin@agrocontrol.local / Admin1234!
- **Operario:** operario@agrocontrol.local / Operario1234!

## 📁 Estructura

```
frontend/
├── src/
│   ├── api/              # Servicios HTTP (axios)
│   ├── components/       # Componentes reutilizables
│   │   ├── layout/       # Sidebar, Header, Layout
│   │   └── ProtectedRoute.jsx
│   ├── context/          # Context de autenticación
│   ├── pages/            # Páginas de la aplicación
│   ├── styles/           # CSS globales y variables
│   ├── App.jsx           # Rutas principales
│   └── main.jsx          # Punto de entrada
├── index.html
├── package.json
└── vite.config.js
```

## 🛠️ Tecnologías

- React 18
- Vite
- React Router DOM
- Axios
- Lucide React (iconos)

## 🎨 Páginas implementadas

- ✅ Login
- ✅ Dashboard (estadísticas)
- ✅ Nuevo Control de Calidad
- ✅ Historial de Controles
- ✅ Gestión de Proveedores
- ✅ Gestión de Camiones
- ✅ Gestión de Variedades
- ✅ Gestión de Usuarios (solo admin)
- ✅ Perfil de usuario

## 🔐 Roles

- **Operario:** Puede crear controles, ver historial, ver listados
- **Administrador:** Todo lo anterior + gestionar usuarios, proveedores, camiones y variedades

## 📦 Build de producción

```bash
npm run build
```

Los archivos optimizados se generarán en `dist/`.
