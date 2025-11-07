const db = require('../db');
const { hashPassword } = require('../utils/password');

async function getAllUsers(req, res) {
  try {
    const result = await db.query(
      'SELECT id, name, email, company_name, cnpj, phone, created_at, is_active FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar usuários',
      message: error.message
    });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT id, name, email, company_name, cnpj, phone, created_at, is_active FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar usuário',
      message: error.message
    });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password, company_name, cnpj, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando',
        required: ['name', 'email', 'password']
      });
    }

    // Verificar se email já existe
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const passwordHash = await hashPassword(password);

    // Criar usuário
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, company_name, cnpj, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, company_name, cnpj, phone, created_at`,
      [name, email, passwordHash, company_name || null, cnpj || null, phone || null]
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ 
      error: 'Erro ao criar usuário',
      message: error.message
    });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password, company_name, cnpj, phone, is_active } = req.body;

    // Verificar se usuário existe
    const existingUser = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Se email foi alterado, verificar se já existe
    if (email) {
      const emailCheck = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Email já está em uso' });
      }
    }

    // Construir query dinamicamente
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (password) {
      const passwordHash = await hashPassword(password);
      updates.push(`password_hash = $${paramCount++}`);
      values.push(passwordHash);
    }
    if (company_name !== undefined) {
      updates.push(`company_name = $${paramCount++}`);
      values.push(company_name);
    }
    if (cnpj !== undefined) {
      updates.push(`cnpj = $${paramCount++}`);
      values.push(cnpj);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING id, name, email, company_name, cnpj, phone, is_active, updated_at`;

    const result = await db.query(query, values);

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar usuário',
      message: error.message
    });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Verificar se usuário existe
    const existingUser = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Soft delete (desativar)
    await db.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ 
      error: 'Erro ao deletar usuário',
      message: error.message
    });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};

