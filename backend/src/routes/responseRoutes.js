const express = require('express');
const router = express.Router();
const { 
  saveResponses, 
  getUserResponses, 
  getUserScore 
} = require('../controllers/responseController');
const { authenticateToken } = require('../middleware/auth');

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

router.post('/', saveResponses);
router.get('/questionnaire/:questionnaire_id', getUserResponses);
router.get('/questionnaire/:questionnaire_id/score', getUserScore);

module.exports = router;

