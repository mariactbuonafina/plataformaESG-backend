const db = require('../db');

/**
 * Listar evidências do usuário
 */
async function getUserEvidences(req, res) {
  try {
    const userId = req.user.id;
    const { question_id } = req.query;

    let query = 'SELECT * FROM evidences WHERE user_id = $1';
    const params = [userId];

    if (question_id) {
      query += ' AND question_id = $2';
      params.push(question_id);
    }

    query += ' ORDER BY uploaded_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar evidências:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar evidências',
      message: error.message
    });
  }
}

/**
 * Adicionar evidência
 */
async function addEvidence(req, res) {
  try {
    const userId = req.user.id;
    const { 
      question_id, 
      title, 
      description, 
      file_path, 
      file_name, 
      file_type, 
      file_size, 
      evidence_type 
    } = req.body;

    if (!title || !file_path) {
      return res.status(400).json({ 
        error: 'Título e caminho do arquivo são obrigatórios'
      });
    }

    const result = await db.query(
      `INSERT INTO evidences 
       (user_id, question_id, title, description, file_path, file_name, file_type, file_size, evidence_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        question_id || null,
        title,
        description || null,
        file_path,
        file_name || null,
        file_type || null,
        file_size || null,
        evidence_type || 'documento'
      ]
    );

    res.status(201).json({
      message: 'Evidência adicionada com sucesso',
      evidence: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao adicionar evidência:', error);
    res.status(500).json({ 
      error: 'Erro ao adicionar evidência',
      message: error.message
    });
  }
}

/**
 * Atualizar status da evidência (apenas admin no futuro)
 */
async function updateEvidenceStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status inválido',
        valid: ['pending', 'approved', 'rejected']
      });
    }

    const result = await db.query(
      `UPDATE evidences 
       SET status = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2
       WHERE id = $3
       RETURNING *`,
      [status, req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evidência não encontrada' });
    }

    res.json({
      message: 'Status da evidência atualizado',
      evidence: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar evidência:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar evidência',
      message: error.message
    });
  }
}

module.exports = {
  getUserEvidences,
  addEvidence,
  updateEvidenceStatus
};

