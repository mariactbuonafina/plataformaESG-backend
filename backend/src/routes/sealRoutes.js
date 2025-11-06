const express = require('express');
const router = express.Router();
const { 
  calculateSeal, 
  getUserSeals, 
  getActiveSeal 
} = require('../controllers/sealController');
const { authenticateToken } = require('../middleware/auth');

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

router.post('/calculate', calculateSeal);
router.get('/', getUserSeals);
router.get('/active', getActiveSeal);

module.exports = router;

