const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

/**
 * GET /api/usuarios
 * Obtener todos los usuarios (solo admin)
 */
const obtenerUsuarios = async (req, res) => {
  try {
    const { incluir_inactivos } = req.query;

    let query = 'SELECT id_usuario, nombre, email, rol, activo, fecha_creacion FROM usuario';
    
    if (!incluir_inactivos) {
      query += ' WHERE activo = TRUE';
    }
    
    query += ' ORDER BY nombre';

    const [usuarios] = await pool.query(query);

    res.json(usuarios);

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      error: 'Error al obtener usuarios',
      detalle: error.message
    });
  }
};

/**
 * GET /api/usuarios/:id
 * Obtener un usuario específico (solo admin)
 */
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [usuarios] = await pool.query(
      'SELECT id_usuario, nombre, email, rol, activo, fecha_creacion FROM usuario WHERE id_usuario = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json(usuarios[0]);

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      error: 'Error al obtener usuario',
      detalle: error.message
    });
  }
};

/**
 * PUT /api/usuarios/:id
 * Actualizar un usuario (solo admin)
 */
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo, password } = req.body;

    const campos = [];
    const valores = [];

    if (nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(nombre);
    }
    if (email !== undefined) {
      // Verificar que el email no esté en uso por otro usuario
      const [existente] = await pool.query(
        'SELECT id_usuario FROM usuario WHERE email = ? AND id_usuario != ?',
        [email, id]
      );
      if (existente.length > 0) {
        return res.status(409).json({
          error: 'El email ya está en uso por otro usuario'
        });
      }
      campos.push('email = ?');
      valores.push(email);
    }
    if (rol !== undefined) {
      if (!['operario', 'administrador'].includes(rol)) {
        return res.status(400).json({
          error: 'Rol inválido. Debe ser "operario" o "administrador"'
        });
      }
      campos.push('rol = ?');
      valores.push(rol);
    }
    if (activo !== undefined) {
      campos.push('activo = ?');
      valores.push(activo);
    }
    if (password !== undefined) {
      if (password.length < 8) {
        return res.status(400).json({
          error: 'La contraseña debe tener al menos 8 caracteres'
        });
      }
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      campos.push('password_hash = ?');
      valores.push(password_hash);
    }

    if (campos.length === 0) {
      return res.status(400).json({
        error: 'No se proporcionaron campos para actualizar'
      });
    }

    valores.push(id);

    const [resultado] = await pool.query(
      `UPDATE usuario SET ${campos.join(', ')} WHERE id_usuario = ?`,
      valores
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const [usuarioActualizado] = await pool.query(
      'SELECT id_usuario, nombre, email, rol, activo, fecha_creacion FROM usuario WHERE id_usuario = ?',
      [id]
    );

    res.json({
      mensaje: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado[0]
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      error: 'Error al actualizar usuario',
      detalle: error.message
    });
  }
};

/**
 * DELETE /api/usuarios/:id
 * Eliminar un usuario (soft delete - solo admin)
 */
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir que un admin se elimine a sí mismo
    if (parseInt(id) === req.usuario.id_usuario) {
      return res.status(400).json({
        error: 'No puedes desactivar tu propia cuenta'
      });
    }

    // Soft delete: marcar como inactivo
    const [resultado] = await pool.query(
      'UPDATE usuario SET activo = FALSE WHERE id_usuario = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      mensaje: 'Usuario desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      error: 'Error al eliminar usuario',
      detalle: error.message
    });
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario
};
