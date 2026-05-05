const { pool } = require('../config/database');

/**
 * GET /api/variedades
 * Obtener todas las variedades
 */
const obtenerVariedades = async (req, res) => {
  try {
    const { incluir_inactivos } = req.query;

    let query = 'SELECT * FROM variedad';
    
    if (!incluir_inactivos) {
      query += ' WHERE activo = TRUE';
    }
    
    query += ' ORDER BY nombre_variedad';

    const [variedades] = await pool.query(query);

    res.json(variedades);

  } catch (error) {
    console.error('Error al obtener variedades:', error);
    res.status(500).json({
      error: 'Error al obtener variedades',
      detalle: error.message
    });
  }
};

/**
 * GET /api/variedades/:id
 * Obtener una variedad específica
 */
const obtenerVariedadPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [variedades] = await pool.query(
      'SELECT * FROM variedad WHERE id_variedad = ?',
      [id]
    );

    if (variedades.length === 0) {
      return res.status(404).json({
        error: 'Variedad no encontrada'
      });
    }

    // Obtener proveedores de esta variedad
    const [proveedores] = await pool.query(
      `SELECT p.* FROM proveedor p
       JOIN proveedor_variedad pv ON p.id_proveedor = pv.id_proveedor
       WHERE pv.id_variedad = ? AND p.activo = TRUE`,
      [id]
    );

    res.json({
      ...variedades[0],
      proveedores
    });

  } catch (error) {
    console.error('Error al obtener variedad:', error);
    res.status(500).json({
      error: 'Error al obtener variedad',
      detalle: error.message
    });
  }
};

/**
 * POST /api/variedades
 * Crear una nueva variedad
 */
const crearVariedad = async (req, res) => {
  try {
    const { nombre_variedad } = req.body;

    if (!nombre_variedad) {
      return res.status(400).json({
        error: 'El nombre de la variedad es requerido'
      });
    }

    // Verificar que no exista otra variedad con el mismo nombre
    const [existente] = await pool.query(
      'SELECT id_variedad FROM variedad WHERE nombre_variedad = ?',
      [nombre_variedad]
    );

    if (existente.length > 0) {
      return res.status(409).json({
        error: 'Ya existe una variedad con ese nombre'
      });
    }

    const [resultado] = await pool.query(
      'INSERT INTO variedad (nombre_variedad) VALUES (?)',
      [nombre_variedad]
    );

    res.status(201).json({
      mensaje: 'Variedad creada exitosamente',
      variedad: {
        id_variedad: resultado.insertId,
        nombre_variedad
      }
    });

  } catch (error) {
    console.error('Error al crear variedad:', error);
    res.status(500).json({
      error: 'Error al crear variedad',
      detalle: error.message
    });
  }
};

/**
 * PUT /api/variedades/:id
 * Actualizar una variedad
 */
const actualizarVariedad = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_variedad, activo } = req.body;

    const campos = [];
    const valores = [];

    if (nombre_variedad !== undefined) {
      campos.push('nombre_variedad = ?');
      valores.push(nombre_variedad);
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
      `UPDATE variedad SET ${campos.join(', ')} WHERE id_variedad = ?`,
      valores
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: 'Variedad no encontrada'
      });
    }

    const [variedadActualizada] = await pool.query(
      'SELECT * FROM variedad WHERE id_variedad = ?',
      [id]
    );

    res.json({
      mensaje: 'Variedad actualizada exitosamente',
      variedad: variedadActualizada[0]
    });

  } catch (error) {
    console.error('Error al actualizar variedad:', error);
    res.status(500).json({
      error: 'Error al actualizar variedad',
      detalle: error.message
    });
  }
};

/**
 * DELETE /api/variedades/:id
 * Eliminar una variedad (soft delete)
 */
const eliminarVariedad = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete: marcar como inactiva
    const [resultado] = await pool.query(
      'UPDATE variedad SET activo = FALSE WHERE id_variedad = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: 'Variedad no encontrada'
      });
    }

    res.json({
      mensaje: 'Variedad desactivada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar variedad:', error);
    res.status(500).json({
      error: 'Error al eliminar variedad',
      detalle: error.message
    });
  }
};

module.exports = {
  obtenerVariedades,
  obtenerVariedadPorId,
  crearVariedad,
  actualizarVariedad,
  eliminarVariedad
};
