const express = require('express');
const router = express.Router();
const { 
  getAllQuestionnaires, 
  getQuestionnaireById, 
  createQuestionnaire,
  addQuestion
} = require('../controllers/questionnaireController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Listar questionários - público
router.get('/', optionalAuth, getAllQuestionnaires);

// Buscar questionário específico - público
router.get('/:id', optionalAuth, getQuestionnaireById);

// Criar questionário - precisa autenticação
router.post('/', authenticateToken, createQuestionnaire);

// Adicionar pergunta - precisa autenticação
router.post('/:questionnaire_id/questions', authenticateToken, addQuestion);

module.exports = router;

