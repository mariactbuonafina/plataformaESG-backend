const db = require('../db');

/**
 * Listar todos os questionários
 */
async function getAllQuestionnaires(req, res) {
  try {
    const result = await db.query(
      `SELECT q.*, 
              COUNT(qt.id) as total_questions
       FROM questionnaires q
       LEFT JOIN questions qt ON q.id = qt.questionnaire_id
       WHERE q.is_active = true
       GROUP BY q.id
       ORDER BY q.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar questionários:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar questionários',
      message: error.message
    });
  }
}

/**
 * Buscar questionário por ID com perguntas
 */
async function getQuestionnaireById(req, res) {
  try {
    const { id } = req.params;

    // Buscar questionário
    const questionnaireResult = await db.query(
      'SELECT * FROM questionnaires WHERE id = $1 AND is_active = true',
      [id]
    );

    if (questionnaireResult.rows.length === 0) {
      return res.status(404).json({ error: 'Questionário não encontrado' });
    }

    const questionnaire = questionnaireResult.rows[0];

    // Buscar perguntas
    const questionsResult = await db.query(
      'SELECT * FROM questions WHERE questionnaire_id = $1 ORDER BY order_index ASC, id ASC',
      [id]
    );

    questionnaire.questions = questionsResult.rows;

    res.json(questionnaire);
  } catch (error) {
    console.error('Erro ao buscar questionário:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar questionário',
      message: error.message
    });
  }
}

/**
 * Criar novo questionário
 */
async function createQuestionnaire(req, res) {
  try {
    const { title, description, version, category } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    const result = await db.query(
      `INSERT INTO questionnaires (title, description, version, category)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description || null, version || '1.0', category || null]
    );

    res.status(201).json({
      message: 'Questionário criado com sucesso',
      questionnaire: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar questionário:', error);
    res.status(500).json({ 
      error: 'Erro ao criar questionário',
      message: error.message
    });
  }
}

/**
 * Adicionar pergunta ao questionário
 */
async function addQuestion(req, res) {
  try {
    const { questionnaire_id } = req.params;
    const { question_text, question_type, options, weight, order_index } = req.body;

    if (!question_text) {
      return res.status(400).json({ error: 'Texto da pergunta é obrigatório' });
    }

    // Verificar se questionário existe
    const questionnaire = await db.query(
      'SELECT id FROM questionnaires WHERE id = $1',
      [questionnaire_id]
    );

    if (questionnaire.rows.length === 0) {
      return res.status(404).json({ error: 'Questionário não encontrado' });
    }

    // Converter options para JSONB se for objeto
    let optionsJson = null;
    if (options) {
      optionsJson = typeof options === 'string' ? options : JSON.stringify(options);
    }

    const result = await db.query(
      `INSERT INTO questions (questionnaire_id, question_text, question_type, options, weight, order_index)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6)
       RETURNING *`,
      [
        questionnaire_id,
        question_text,
        question_type || 'text',
        optionsJson,
        weight || 1.0,
        order_index || null
      ]
    );

    res.status(201).json({
      message: 'Pergunta adicionada com sucesso',
      question: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao adicionar pergunta:', error);
    res.status(500).json({ 
      error: 'Erro ao adicionar pergunta',
      message: error.message
    });
  }
}

module.exports = {
  getAllQuestionnaires,
  getQuestionnaireById,
  createQuestionnaire,
  addQuestion
};

