const express = require('express');
const router = express.Router();
const { login, register, obtenerPerfil } = require('../controllers/auth.controller');
const { verificarToken, verificarActivo, verificarAdmin } = require('../middlewares/auth');

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario
 * @access  Público
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/register
 * @desc    Registro de nuevo usuario
 * @access  Privado (solo admin)
 */
router.post('/register', verificarToken, verificarActivo, verificarAdmin, register);

/**
 * @route   GET /api/auth/perfil
 * @desc    Obtener perfil del usuario autenticado
 * @access  Privado
 */
router.get('/perfil', verificarToken, verificarActivo, obtenerPerfil);

module.exports = router;
