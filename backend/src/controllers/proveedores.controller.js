const { pool } = require('../config/database');

/**
 * GET /api/proveedores
 * Obtener todos los proveedores activos
 */
const obtenerProveedores = async (req, res) => {
  try {
    const { incluir_inactivos } = req.query;

    let query = 'SELECT * FROM proveedor';
    
    if (!incluir_inactivos) {
      query += ' WHERE activo = TRUE';
    }
    
    query += ' ORDER BY nombre';

    const [proveedores] = await pool.query(query);

    res.json(proveedores);

  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({
      error: 'Error al obtener proveedores',
      detalle: error.message
    });
  }
};

/**
 * GET /api/proveedores/:id
 * Obtener un proveedor específico
 */
const obtenerProveedorPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [proveedores] = await pool.query(
      'SELECT * FROM proveedor WHERE id_proveedor = ?',
      [id]
    );

    if (proveedores.length === 0) {
      return res.status(404).json({
        error: 'Proveedor no encontrado'
      });
    }

    // Obtener variedades del proveedor
    const [variedades] = await pool.query(
      `SELECT v.* FROM variedad v
       JOIN proveedor_variedad pv ON v.id_variedad = pv.id_variedad
       WHERE pv.id_proveedor = ? AND v.activo = TRUE`,
      [id]
    );

    res.json({
      ...proveedores[0],
      variedades
    });

  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({
      error: 'Error al obtener proveedor',
      detalle: error.message
    });
  }
};

/**
 * POST /api/proveedores
 * Crear un nuevo proveedor
 */
const crearProveedor = async (req, res) => {
  try {
    const { nombre, localidad } = req.body;

    if (!nombre) {
      return res.status(400).json({
        error: 'El nombre es requerido'
      });
    }

    // Verificar que no exista otro proveedor con el mismo nombre
    const [existente] = await pool.query(
      'SELECT id_proveedor FROM proveedor WHERE nombre = ?',
      [nombre]
    );

    if (existente.length > 0) {
      return res.status(409).json({
        error: 'Ya existe un proveedor con ese nombre'
      });
    }

    const [resultado] = await pool.query(
      'INSERT INTO proveedor (nombre, localidad) VALUES (?, ?)',
      [nombre, localidad || null]
    );

    res.status(201).json({
      mensaje: 'Proveedor creado exitosamente',
      proveedor: {
        id_proveedor: resultado.insertId,
        nombre,
        localidad
      }
    });

  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({
      error: 'Error al crear proveedor',
      detalle: error.message
    });
  }
};

/**
 * PUT /api/proveedores/:id
 * Actualizar un proveedor
 */
const actualizarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, localidad, activo } = req.body;

    const campos = [];
    const valores = [];

    if (nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(nombre);
    }
    if (localidad !== undefined) {
      campos.push('localidad = ?');
      valores.push(localidad);
    }
    if (activo !== undefined) {
      campos.push('activo = ?');
      valores.push(activo);
    }

    if (campos.length === 0) {
      return res.status(400).json({
        error: 'No se proporcionaron campos para actualizar'
      });
    }

    valores.push(id);

    const [resultado] = await pool.query(
      `UPDATE proveedor SET ${campos.join(', ')} WHERE id_proveedor = ?`,
      valores
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: 'Proveedor no encontrado'
      });
    }

    const [proveedorActualizado] = await pool.query(
      'SELECT * FROM proveedor WHERE id_proveedor = ?',
      [id]
    );

    res.json({
      mensaje: 'Proveedor actualizado exitosamente',
      proveedor: proveedorActualizado[0]
    });

  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({
      error: 'Error al actualizar proveedor',
      detalle: error.message
    });
  }
};

/**
 * DELETE /api/proveedores/:id
 * Eliminar un proveedor (soft delete)
 */
const eliminarProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete: marcar como inactivo
    const [resultado] = await pool.query(
      'UPDATE proveedor SET activo = FALSE WHERE id_proveedor = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: 'Proveedor no encontrado'
      });
    }

    res.json({
      mensaje: 'Proveedor desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({
      error: 'Error al eliminar proveedor',
      detalle: error.message
    });
  }
};

module.exports = {
  obtenerProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
};
