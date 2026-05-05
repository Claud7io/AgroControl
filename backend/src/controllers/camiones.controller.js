const { pool } = require('../config/database');

/**
 * GET /api/camiones
 * Obtener todos los camiones
 */
const obtenerCamiones = async (req, res) => {
  try {
    const { id_proveedor, incluir_inactivos } = req.query;

    let query = `
      SELECT c.*, p.nombre AS nombre_proveedor, p.localidad AS localidad_proveedor
      FROM camion c
      JOIN proveedor p ON c.id_proveedor = p.id_proveedor
      WHERE 1=1
    `;

    const params = [];

    if (!incluir_inactivos) {
      query += ' AND c.activo = TRUE';
    }

    if (id_proveedor) {
      query += ' AND c.id_proveedor = ?';
      params.push(id_proveedor);
    }

    query += ' ORDER BY c.matricula';

    const [camiones] = await pool.query(query, params);

    res.json(camiones);

  } catch (error) {
    console.error('Error al obtener camiones:', error);
    res.status(500).json({
      error: 'Error al obtener camiones',
      detalle: error.message
    });
  }
};

/**
 * GET /api/camiones/:id
 * Obtener un camión específico
 */
const obtenerCamionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [camiones] = await pool.query(
      `SELECT c.*, p.nombre AS nombre_proveedor, p.localidad AS localidad_proveedor
       FROM camion c
       JOIN proveedor p ON c.id_proveedor = p.id_proveedor
       WHERE c.id_camion = ?`,
      [id]
    );

    if (camiones.length === 0) {
      return res.status(404).json({
        error: 'Camión no encontrado'
      });
    }

    res.json(camiones[0]);

  } catch (error) {
    console.error('Error al obtener camión:', error);
    res.status(500).json({
      error: 'Error al obtener camión',
      detalle: error.message
    });
  }
};

/**
 * POST /api/camiones
 * Crear un nuevo camión
 */
const crearCamion = async (req, res) => {
  try {
    const { matricula, id_proveedor } = req.body;

    if (!matricula || !id_proveedor) {
      return res.status(400).json({
        error: 'Matrícula y proveedor son requeridos'
      });
    }

    // Verificar que no exista otro camión con la misma matrícula
    const [existente] = await pool.query(
      'SELECT id_camion FROM camion WHERE matricula = ?',
      [matricula]
    );

    if (existente.length > 0) {
      return res.status(409).json({
        error: 'Ya existe un camión con esa matrícula'
      });
    }

    // Verificar que el proveedor existe
    const [proveedor] = await pool.query(
      'SELECT id_proveedor FROM proveedor WHERE id_proveedor = ?',
      [id_proveedor]
    );

    if (proveedor.length === 0) {
      return res.status(404).json({
        error: 'El proveedor especificado no existe'
      });
    }

    const [resultado] = await pool.query(
      'INSERT INTO camion (matricula, id_proveedor) VALUES (?, ?)',
      [matricula, id_proveedor]
    );

    // Obtener el camión completo recién creado
    const [nuevoCamion] = await pool.query(
      `SELECT c.*, p.nombre AS nombre_proveedor
       FROM camion c
       JOIN proveedor p ON c.id_proveedor = p.id_proveedor
       WHERE c.id_camion = ?`,
      [resultado.insertId]
    );

    res.status(201).json({
      mensaje: 'Camión creado exitosamente',
      camion: nuevoCamion[0]
    });

  } catch (error) {
    console.error('Error al crear camión:', error);
    res.status(500).json({
      error: 'Error al crear camión',
      detalle: error.message
    });
  }
};

/**
 * PUT /api/camiones/:id
 * Actualizar un camión
 */
const actualizarCamion = async (req, res) => {
  try {
    const { id } = req.params;
    const { matricula, id_proveedor, activo } = req.body;

    const campos = [];
    const valores = [];

    if (matricula !== undefined) {
      campos.push('matricula = ?');
      valores.push(matricula);
    }
    if (id_proveedor !== undefined) {
      campos.push('id_proveedor = ?');
      valores.push(id_proveedor);
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
      `UPDATE camion SET ${campos.join(', ')} WHERE id_camion = ?`,
      valores
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: 'Camión no encontrado'
      });
    }

    const [camionActualizado] = await pool.query(
      `SELECT c.*, p.nombre AS nombre_proveedor
       FROM camion c
       JOIN proveedor p ON c.id_proveedor = p.id_proveedor
       WHERE c.id_camion = ?`,
      [id]
    );

    res.json({
      mensaje: 'Camión actualizado exitosamente',
      camion: camionActualizado[0]
    });

  } catch (error) {
    console.error('Error al actualizar camión:', error);
    res.status(500).json({
      error: 'Error al actualizar camión',
      detalle: error.message
    });
  }
};

/**
 * DELETE /api/camiones/:id
 * Eliminar un camión (soft delete)
 */
const eliminarCamion = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete: marcar como inactivo
    const [resultado] = await pool.query(
      'UPDATE camion SET activo = FALSE WHERE id_camion = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: 'Camión no encontrado'
      });
    }

    res.json({
      mensaje: 'Camión desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar camión:', error);
    res.status(500).json({
      error: 'Error al eliminar camión',
      detalle: error.message
    });
  }
};

module.exports = {
  obtenerCamiones,
  obtenerCamionPorId,
  crearCamion,
  actualizarCamion,
  eliminarCamion
};
