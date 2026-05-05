const express = require('express');
const router = express.Router();
const {
  obtenerCamiones,
  obtenerCamionPorId,
  crearCamion,
  actualizarCamion,
  eliminarCamion
} = require('../controllers/camiones.controller');
const { verificarToken, verificarActivo, verificarAdmin } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken, verificarActivo);

router.get('/', obtenerCamiones);
router.get('/:id', obtenerCamionPorId);
router.post('/', verificarAdmin, crearCamion);
router.put('/:id', verificarAdmin, actualizarCamion);
router.delete('/:id', verificarAdmin, eliminarCamion);

module.exports = router;
