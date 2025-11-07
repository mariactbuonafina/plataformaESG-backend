const express = require('express');
const router = express.Router();
const { 
  getUserEvidences, 
  addEvidence, 
  updateEvidenceStatus 
} = require('../controllers/evidenceController');
const { authenticateToken } = require('../middleware/auth');

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

router.get('/', getUserEvidences);
router.post('/', addEvidence);
router.put('/:id/status', updateEvidenceStatus);

module.exports = router;

