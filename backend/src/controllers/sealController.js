const db = require('../db');

/**
 * Calcular e conceder selo ESG
 */
async function calculateSeal(req, res) {
  try {
    const userId = req.user.id;
    const { questionnaire_id } = req.body;

    if (!questionnaire_id) {
      return res.status(400).json({ error: 'questionnaire_id é obrigatório' });
    }

    // Buscar pontuação total do usuário
    const scoreResult = await db.query(
      `SELECT COALESCE(SUM(r.score), 0) as total_score
       FROM responses r
       WHERE r.user_id = $1 AND r.questionnaire_id = $2`,
      [userId, questionnaire_id]
    );

    const totalScore = parseFloat(scoreResult.rows[0].total_score);

    // Buscar pontuação máxima possível
    const maxScoreResult = await db.query(
      `SELECT COALESCE(SUM(q.weight * 10), 0) as max_score
       FROM questions q
       WHERE q.questionnaire_id = $1`,
      [questionnaire_id]
    );

    const maxScore = parseFloat(maxScoreResult.rows[0].max_score);
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Determinar tipo de selo
    let sealType = null;
    if (percentage >= 80) {
      sealType = 'gold';
    } else if (percentage >= 60) {
      sealType = 'silver';
    } else if (percentage >= 40) {
      sealType = 'bronze';
    }

    if (!sealType) {
      return res.json({
        message: 'Pontuação insuficiente para selo',
        score: totalScore,
        max_score: maxScore,
        percentage: percentage.toFixed(2),
        seal_type: null
      });
    }

    // Desativar selos anteriores
    await db.query(
      'UPDATE seals SET is_active = false WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    // Criar novo selo
    const result = await db.query(
      `INSERT INTO seals (user_id, seal_type, score, total_score, percentage)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, sealType, totalScore, maxScore, percentage]
    );

    res.status(201).json({
      message: `Selo ${sealType} concedido com sucesso!`,
      seal: result.rows[0],
      score: totalScore,
      max_score: maxScore,
      percentage: percentage.toFixed(2)
    });
  } catch (error) {
    console.error('Erro ao calcular selo:', error);
    res.status(500).json({ 
      error: 'Erro ao calcular selo',
      message: error.message
    });
  }
}

/**
 * Buscar selos do usuário
 */
async function getUserSeals(req, res) {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT * FROM seals 
       WHERE user_id = $1 
       ORDER BY awarded_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar selos:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar selos',
      message: error.message
    });
  }
}

/**
 * Buscar selo ativo do usuário
 */
async function getActiveSeal(req, res) {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT * FROM seals 
       WHERE user_id = $1 AND is_active = true 
       ORDER BY awarded_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ 
        message: 'Nenhum selo ativo',
        seal: null
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar selo ativo:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar selo ativo',
      message: error.message
    });
  }
}

module.exports = {
  calculateSeal,
  getUserSeals,
  getActiveSeal
};

