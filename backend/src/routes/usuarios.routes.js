const express = require('express');
const router = express.Router();
const {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario
} = require('../controllers/usuarios.controller');
const { verificarToken, verificarActivo, verificarAdmin } = require('../middlewares/auth');

// Todas las rutas requieren autenticación y rol de administrador
router.use(verificarToken, verificarActivo, verificarAdmin);

router.get('/', obtenerUsuarios);
router.get('/:id', obtenerUsuarioPorId);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;
