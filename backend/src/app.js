const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { verificarConexion } = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const camionesRoutes = require('./routes/camiones.routes');
const variedadesRoutes = require('./routes/variedades.routes');
const controlesRoutes = require('./routes/controles.routes');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors()); // Habilitar CORS para peticiones desde el frontend
app.use(express.json()); // Parser de JSON en body
app.use(express.urlencoded({ extended: true })); // Parser de URL-encoded

// Logging de peticiones (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Ruta raíz (health check)
app.get('/', (req, res) => {
  res.json({
    mensaje: 'AgroControl API - Sistema de Control de Calidad',
    version: '1.0.0',
    estado: 'activo',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      proveedores: '/api/proveedores',
      camiones: '/api/camiones',
      variedades: '/api/variedades',
      controles: '/api/controles'
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/camiones', camionesRoutes);
app.use('/api/variedades', variedadesRoutes);
app.use('/api/controles', controlesRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    ruta: req.path,
    metodo: req.method
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    detalle: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    // Verificar conexión a la base de datos
    await verificarConexion();

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log('===========================================');
      console.log('🍅 AgroControl Backend');
      console.log('===========================================');
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📁 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('===========================================');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

// Iniciar
iniciarServidor();

module.exports = app;
