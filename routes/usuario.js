const express = require('express');
const router = express.Router();
const userController = require('../controllers/UsuarioController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Todas as rotas são protegidas
router.use(authMiddleware);

router.get('/my/games', userController.getGame);

router.get('/', [adminMiddleware], userController.index);

router.get('/:id', userController.show);

router.put('/:id', userController.update);

module.exports = router;
