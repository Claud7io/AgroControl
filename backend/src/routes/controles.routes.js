const express = require('express');
const router = express.Router();
const {
  obtenerControles,
  obtenerControlPorId,
  crearControl,
  actualizarControl,
  eliminarControl,
  obtenerEstadisticasHoy
} = require('../controllers/controles.controller');
const { verificarToken, verificarActivo, verificarAdmin } = require('../middlewares/auth');

/**
 * @route   GET /api/controles
 * @desc    Obtener todos los controles (con filtros opcionales)
 * @access  Privado
 */
router.get('/', verificarToken, verificarActivo, obtenerControles);

/**
 * @route   GET /api/controles/estadisticas/hoy
 * @desc    Obtener estadísticas del día actual
 * @access  Privado
 */
router.get('/estadisticas/hoy', verificarToken, verificarActivo, obtenerEstadisticasHoy);

/**
 * @route   GET /api/controles/:id
 * @desc    Obtener un control específico
 * @access  Privado
 */
router.get('/:id', verificarToken, verificarActivo, obtenerControlPorId);

/**
 * @route   POST /api/controles
 * @desc    Crear nuevo control de calidad
 * @access  Privado
 */
router.post('/', verificarToken, verificarActivo, crearControl);

/**
 * @route   PUT /api/controles/:id
 * @desc    Actualizar un control
 * @access  Privado
 */
router.put('/:id', verificarToken, verificarActivo, actualizarControl);

/**
 * @route   DELETE /api/controles/:id
 * @desc    Eliminar un control
 * @access  Privado (solo admin)
 */
router.delete('/:id', verificarToken, verificarActivo, verificarAdmin, eliminarControl);

module.exports = router;
