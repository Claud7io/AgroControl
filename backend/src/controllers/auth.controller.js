const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

/**
 * POST /api/auth/login
 * Autenticación de usuario
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se envíen los campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por email
    const [usuarios] = await pool.query(
      'SELECT * FROM usuario WHERE email = ? AND activo = TRUE',
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    const usuario = usuarios[0];

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValido) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        activo: usuario.activo
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' } // Token válido por 8 horas (jornada laboral)
    );

    // Respuesta exitosa
    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión',
      detalle: error.message
    });
  }
};

/**
 * POST /api/auth/register
 * Registro de nuevo usuario (solo para administradores)
 */
const register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: 'Nombre, email y contraseña son requeridos'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Formato de email inválido'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    // Validar rol (si se proporciona)
    const rolFinal = rol || 'operario';
    if (!['operario', 'administrador'].includes(rolFinal)) {
      return res.status(400).json({
        error: 'Rol inválido. Debe ser "operario" o "administrador"'
      });
    }

    // Verificar que el email no exista
    const [existente] = await pool.query(
      'SELECT id_usuario FROM usuario WHERE email = ?',
      [email]
    );

    if (existente.length > 0) {
      return res.status(409).json({
        error: 'El email ya está registrado'
      });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo usuario
    const [resultado] = await pool.query(
      'INSERT INTO usuario (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, password_hash, rolFinal]
    );

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: {
        id_usuario: resultado.insertId,
        nombre,
        email,
        rol: rolFinal
      }
    });

  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({
      error: 'Error al registrar usuario',
      detalle: error.message
    });
  }
};

/**
 * GET /api/auth/perfil
 * Obtener información del usuario autenticado
 */
const obtenerPerfil = async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id_usuario, nombre, email, rol, activo, fecha_creacion FROM usuario WHERE id_usuario = ?',
      [req.usuario.id_usuario]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json(usuarios[0]);

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      error: 'Error al obtener perfil',
      detalle: error.message
    });
  }
};

module.exports = {
  login,
  register,
  obtenerPerfil
};
