const express = require('express');
const router = express.Router();
const {
  obtenerProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
} = require('../controllers/proveedores.controller');
const { verificarToken, verificarActivo, verificarAdmin } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken, verificarActivo);

router.get('/', obtenerProveedores);
router.get('/:id', obtenerProveedorPorId);
router.post('/', verificarAdmin, crearProveedor);
router.put('/:id', verificarAdmin, actualizarProveedor);
router.delete('/:id', verificarAdmin, eliminarProveedor);

module.exports = router;
