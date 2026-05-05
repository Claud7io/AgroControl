const { pool } = require('../config/database');
const { evaluarCalidad } = require('../utils/evaluarCalidad');

/**
 * GET /api/controles
 * Obtener todos los controles con filtros opcionales
 */
const obtenerControles = async (req, res) => {
  try {
    const { fecha, proveedor, resultado, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        cc.id_control,
        cc.fecha_control,
        cc.kilos_total,
        cc.kilos_sin_defectos,
        cc.kilos_verde,
        cc.kilos_podridos,
        cc.kilos_limitado,
        cc.porcentaje_defectos,
        cc.brix,
        cc.resultado,
        cc.observaciones,
        u.nombre AS nombre_usuario,
        u.email AS email_usuario,
        c.matricula AS matricula_camion,
        p.nombre AS nombre_proveedor,
        p.localidad AS localidad_proveedor,
        v.nombre_variedad
      FROM control_calidad cc
      JOIN usuario u ON cc.id_usuario = u.id_usuario
      JOIN camion c ON cc.id_camion = c.id_camion
      JOIN proveedor p ON c.id_proveedor = p.id_proveedor
      JOIN variedad v ON cc.id_variedad = v.id_variedad
      WHERE 1=1
    `;

    const params = [];

    // Filtro por fecha
    if (fecha) {
      query += ' AND DATE(cc.fecha_control) = ?';
      params.push(fecha);
    }

    // Filtro por proveedor
    if (proveedor) {
      query += ' AND p.nombre LIKE ?';
      params.push(`%${proveedor}%`);
    }

    // Filtro por resultado
    if (resultado) {
      query += ' AND cc.resultado = ?';
      params.push(resultado);
    }

    query += ' ORDER BY cc.fecha_control DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [controles] = await pool.query(query, params);

    res.json({
      total: controles.length,
      controles
    });

  } catch (error) {
    console.error('Error al obtener controles:', error);
    res.status(500).json({
      error: 'Error al obtener controles',
      detalle: error.message
    });
  }
};

/**
 * GET /api/controles/:id
 * Obtener un control específico
 */
const obtenerControlPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [controles] = await pool.query(
      `
      SELECT 
        cc.*,
        u.nombre AS nombre_usuario,
        c.matricula AS matricula_camion,
        p.nombre AS nombre_proveedor,
        v.nombre_variedad
      FROM control_calidad cc
      JOIN usuario u ON cc.id_usuario = u.id_usuario
      JOIN camion c ON cc.id_camion = c.id_camion
      JOIN proveedor p ON c.id_proveedor = p.id_proveedor
      JOIN variedad v ON cc.id_variedad = v.id_variedad
      WHERE cc.id_control = ?
      `,
      [id]
    );

    if (controles.length === 0) {
      return res.status(404).json({
        error: 'Control no encontrado'
      });
    }

    res.json(controles[0]);

  } catch (error) {
    console.error('Error al obtener control:', error);
    res.status(500).json({
      error: 'Error al obtener control',
      detalle: error.message
    });
  }
};

/**
 * POST /api/controles
 * Crear un nuevo control de calidad
 */
const crearControl = async (req, res) => {
  try {
    const {
      id_camion,
      id_variedad,
      kilos_total,
      kilos_sin_defectos,
      kilos_verde,
      kilos_podridos,
      kilos_limitado,
      brix,
      observaciones
    } = req.body;

    // Validar campos requeridos
    if (!id_camion || !id_variedad || !kilos_total || brix === undefined) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: id_camion, id_variedad, kilos_total, brix'
      });
    }

    // Validar que los kilos no sean negativos
    if (kilos_total <= 0 || kilos_sin_defectos < 0 || kilos_verde < 0 || 
        kilos_podridos < 0 || kilos_limitado < 0) {
      return res.status(400).json({
        error: 'Los kilos no pueden ser negativos y kilos_total debe ser mayor que 0'
      });
    }

    // Validar que la suma de kilos parciales no supere el total
    const sumaParcial = (kilos_sin_defectos || 0) + (kilos_verde || 0) + 
                        (kilos_podridos || 0) + (kilos_limitado || 0);
    
    if (sumaParcial > kilos_total) {
      return res.status(400).json({
        error: 'La suma de kilos parciales no puede superar los kilos totales'
      });
    }

    // Validar rango de brix
    if (brix < 0 || brix > 15) {
      return res.status(400).json({
        error: 'El brix debe estar entre 0 y 15'
      });
    }

    // Evaluar calidad automáticamente (RF4)
    const resultado = evaluarCalidad({
      kilos_total,
      kilos_verde: kilos_verde || 0,
      kilos_podridos: kilos_podridos || 0,
      kilos_limitado: kilos_limitado || 0,
      brix
    });

    // Insertar control
    const [resultadoInsert] = await pool.query(
      `INSERT INTO control_calidad 
       (id_usuario, id_camion, id_variedad, kilos_total, kilos_sin_defectos, 
        kilos_verde, kilos_podridos, kilos_limitado, brix, resultado, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.usuario.id_usuario,
        id_camion,
        id_variedad,
        kilos_total,
        kilos_sin_defectos || 0,
        kilos_verde || 0,
        kilos_podridos || 0,
        kilos_limitado || 0,
        brix,
        resultado,
        observaciones || null
      ]
    );

    // Obtener el control completo recién creado
    const [nuevoControl] = await pool.query(
      `SELECT 
        cc.*,
        u.nombre AS nombre_usuario,
        c.matricula AS matricula_camion,
        p.nombre AS nombre_proveedor,
        v.nombre_variedad
       FROM control_calidad cc
       JOIN usuario u ON cc.id_usuario = u.id_usuario
       JOIN camion c ON cc.id_camion = c.id_camion
       JOIN proveedor p ON c.id_proveedor = p.id_proveedor
       JOIN variedad v ON cc.id_variedad = v.id_variedad
       WHERE cc.id_control = ?`,
      [resultadoInsert.insertId]
    );

    res.status(201).json({
      mensaje: 'Control de calidad creado exitosamente',
      control: nuevoControl[0]
    });

  } catch (error) {
    console.error('Error al crear control:', error);
    res.status(500).json({
      error: 'Error al crear control de calidad',
      detalle: error.message
    });
  }
};

/**
 * PUT /api/controles/:id
 * Actualizar un control existente
 */
const actualizarControl = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      kilos_total,
      kilos_sin_defectos,
      kilos_verde,
      kilos_podridos,
      kilos_limitado,
      brix,
      observaciones,
      resultado
    } = req.body;

    // Verificar que el control existe
    const [controlExistente] = await pool.query(
      'SELECT * FROM control_calidad WHERE id_control = ?',
      [id]
    );

    if (controlExistente.length === 0) {
      return res.status(404).json({
        error: 'Control no encontrado'
      });
    }

    // Construir query de actualización dinámica
    const campos = [];
    const valores = [];

    if (kilos_total !== undefined) {
      campos.push('kilos_total = ?');
      valores.push(kilos_total);
    }
    if (kilos_sin_defectos !== undefined) {
      campos.push('kilos_sin_defectos = ?');
      valores.push(kilos_sin_defectos);
    }
    if (kilos_verde !== undefined) {
      campos.push('kilos_verde = ?');
      valores.push(kilos_verde);
    }
    if (kilos_podridos !== undefined) {
      campos.push('kilos_podridos = ?');
      valores.push(kilos_podridos);
    }
    if (kilos_limitado !== undefined) {
      campos.push('kilos_limitado = ?');
      valores.push(kilos_limitado);
    }
    if (brix !== undefined) {
      campos.push('brix = ?');
      valores.push(brix);
    }
    if (observaciones !== undefined) {
      campos.push('observaciones = ?');
      valores.push(observaciones);
    }
    if (resultado !== undefined) {
      campos.push('resultado = ?');
      valores.push(resultado);
    }

    if (campos.length === 0) {
      return res.status(400).json({
        error: 'No se proporcionaron campos para actualizar'
      });
    }

    valores.push(id);

    await pool.query(
      `UPDATE control_calidad SET ${campos.join(', ')} WHERE id_control = ?`,
      valores
    );

    // Obtener el control actualizado
    const [controlActualizado] = await pool.query(
      `SELECT 
        cc.*,
        u.nombre AS nombre_usuario,
        c.matricula AS matricula_camion,
        p.nombre AS nombre_proveedor,
        v.nombre_variedad
       FROM control_calidad cc
       JOIN usuario u ON cc.id_usuario = u.id_usuario
       JOIN camion c ON cc.id_camion = c.id_camion
       JOIN proveedor p ON c.id_proveedor = p.id_proveedor
       JOIN variedad v ON cc.id_variedad = v.id_variedad
       WHERE cc.id_control = ?`,
      [id]
    );

    res.json({
      mensaje: 'Control actualizado exitosamente',
      control: controlActualizado[0]
    });

  } catch (error) {
    console.error('Error al actualizar control:', error);
    res.status(500).json({
      error: 'Error al actualizar control',
      detalle: error.message
    });
  }
};

/**
 * DELETE /api/controles/:id
 * Eliminar un control (solo admin)
 */
const eliminarControl = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      'DELETE FROM control_calidad WHERE id_control = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: 'Control no encontrado'
      });
    }

    res.json({
      mensaje: 'Control eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar control:', error);
    res.status(500).json({
      error: 'Error al eliminar control',
      detalle: error.message
    });
  }
};

/**
 * GET /api/controles/estadisticas/hoy
 * Obtener estadísticas del día actual
 */
const obtenerEstadisticasHoy = async (req, res) => {
  try {
    const [estadisticas] = await pool.query(`
      SELECT 
        COUNT(*) AS controles_hoy,
        COUNT(DISTINCT id_camion) AS camiones_hoy,
        ROUND(AVG(CASE WHEN resultado = 'aprobado' THEN 100 ELSE 0 END), 0) AS porcentaje_aprobados
      FROM control_calidad
      WHERE DATE(fecha_control) = CURDATE()
    `);

    res.json(estadisticas[0]);

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: 'Error al obtener estadísticas',
      detalle: error.message
    });
  }
};

module.exports = {
  obtenerControles,
  obtenerControlPorId,
  crearControl,
  actualizarControl,
  eliminarControl,
  obtenerEstadisticasHoy
};
