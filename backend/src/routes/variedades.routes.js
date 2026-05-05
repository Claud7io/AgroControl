const express = require('express');
const router = express.Router();
const {
  obtenerVariedades,
  obtenerVariedadPorId,
  crearVariedad,
  actualizarVariedad,
  eliminarVariedad
} = require('../controllers/variedades.controller');
const { verificarToken, verificarActivo, verificarAdmin } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken, verificarActivo);

router.get('/', obtenerVariedades);
router.get('/:id', obtenerVariedadPorId);
router.post('/', verificarAdmin, crearVariedad);
router.put('/:id', verificarAdmin, actualizarVariedad);
router.delete('/:id', verificarAdmin, eliminarVariedad);

module.exports = router;
