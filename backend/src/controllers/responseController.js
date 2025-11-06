const db = require('../db');

/**
 * Salvar respostas do questionário
 */
async function saveResponses(req, res) {
  try {
    const userId = req.user.id;
    const { questionnaire_id, responses } = req.body;

    if (!questionnaire_id || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        required: ['questionnaire_id', 'responses (array)']
      });
    }

    // Verificar se questionário existe
    const questionnaire = await db.query(
      'SELECT id FROM questionnaires WHERE id = $1 AND is_active = true',
      [questionnaire_id]
    );

    if (questionnaire.rows.length === 0) {
      return res.status(404).json({ error: 'Questionário não encontrado' });
    }

    // Deletar respostas anteriores do usuário para este questionário
    await db.query(
      'DELETE FROM responses WHERE user_id = $1 AND questionnaire_id = $2',
      [userId, questionnaire_id]
    );

    // Inserir novas respostas
    const savedResponses = [];

    for (const response of responses) {
      const { question_id, answer_text, answer_value } = response;

      if (!question_id) {
        continue; // Pula se não tiver question_id
      }

      // Buscar peso da pergunta
      const questionResult = await db.query(
        'SELECT weight FROM questions WHERE id = $1',
        [question_id]
      );

      const weight = questionResult.rows[0]?.weight || 1.0;
      const score = (answer_value || 0) * weight;

      const result = await db.query(
        `INSERT INTO responses (user_id, questionnaire_id, question_id, answer_text, answer_value, score)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, questionnaire_id, question_id, answer_text || null, answer_value || null, score]
      );

      savedResponses.push(result.rows[0]);
    }

    // Calcular pontuação total
    const totalScoreResult = await db.query(
      'SELECT COALESCE(SUM(score), 0) as total_score FROM responses WHERE user_id = $1 AND questionnaire_id = $2',
      [userId, questionnaire_id]
    );

    const totalScore = parseFloat(totalScoreResult.rows[0].total_score);

    res.status(201).json({
      message: 'Respostas salvas com sucesso',
      responses: savedResponses,
      total_score: totalScore
    });
  } catch (error) {
    console.error('Erro ao salvar respostas:', error);
    res.status(500).json({ 
      error: 'Erro ao salvar respostas',
      message: error.message
    });
  }
}

/**
 * Buscar respostas do usuário para um questionário
 */
async function getUserResponses(req, res) {
  try {
    const userId = req.user.id;
    const { questionnaire_id } = req.params;

    const result = await db.query(
      `SELECT r.*, q.question_text, q.question_type
       FROM responses r
       JOIN questions q ON r.question_id = q.id
       WHERE r.user_id = $1 AND r.questionnaire_id = $2
       ORDER BY r.created_at ASC`,
      [userId, questionnaire_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar respostas:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar respostas',
      message: error.message
    });
  }
}

/**
 * Buscar pontuação do usuário
 */
async function getUserScore(req, res) {
  try {
    const userId = req.user.id;
    const { questionnaire_id } = req.params;

    const result = await db.query(
      `SELECT 
        COALESCE(SUM(r.score), 0) as total_score,
        COUNT(r.id) as total_responses,
        q.title as questionnaire_title
       FROM questionnaires q
       LEFT JOIN responses r ON q.id = r.questionnaire_id AND r.user_id = $1
       WHERE q.id = $2
       GROUP BY q.id, q.title`,
      [userId, questionnaire_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Questionário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar pontuação:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar pontuação',
      message: error.message
    });
  }
}

module.exports = {
  saveResponses,
  getUserResponses,
  getUserScore
};

