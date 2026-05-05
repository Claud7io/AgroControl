const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar JWT
 * Extrae el token del header Authorization y valida
 */
const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token no proporcionado. Incluye el header Authorization: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        error: 'Formato de token inválido. Usa: Bearer <token>'
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Añadir información del usuario a la request
    req.usuario = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado. Por favor, inicia sesión nuevamente.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido.'
      });
    }

    return res.status(500).json({
      error: 'Error al verificar el token',
      detalle: error.message
    });
  }
};

/**
 * Middleware para verificar que el usuario es administrador
 * Debe usarse DESPUÉS de verificarToken
 */
const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'administrador') {
    return res.status(403).json({
      error: 'Acceso denegado. Se requiere rol de administrador.'
    });
  }
  next();
};

/**
 * Middleware para verificar que el usuario está activo
 * Debe usarse DESPUÉS de verificarToken
 */
const verificarActivo = (req, res, next) => {
  if (!req.usuario.activo) {
    return res.status(403).json({
      error: 'Cuenta desactivada. Contacta con el administrador.'
    });
  }
  next();
};

module.exports = {
  verificarToken,
  verificarAdmin,
  verificarActivo
};
