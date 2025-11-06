const db = require('../db');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

async function register(req, res) {
  try {
    const { name, email, password, company_name, cnpj, phone } = req.body;

    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando',
        required: ['name', 'email', 'password']
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Senha deve ter no mínimo 6 caracteres'
      });
    }

    // Verificar se email já existe
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Email já cadastrado',
        message: 'Este email já está em uso'
      });
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

    const user = result.rows[0];

    // Gerar token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company_name: user.company_name
      },
      token
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ 
      error: 'Erro ao criar usuário',
      message: error.message
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário
    const result = await db.query(
      'SELECT id, name, email, password_hash, company_name, cnpj, phone, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    const user = result.rows[0];

    // Verificar se usuário está ativo
    if (!user.is_active) {
      return res.status(403).json({ 
        error: 'Conta desativada',
        message: 'Sua conta foi desativada. Entre em contato com o suporte.'
      });
    }

    // Verificar senha
    const passwordMatch = await comparePassword(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Gerar token
    const token = generateToken(user);

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company_name: user.company_name
      },
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      error: 'Erro ao fazer login',
      message: error.message
    });
  }
}

async function getMe(req, res) {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT id, name, email, company_name, cnpj, phone, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar informações do usuário',
      message: error.message
    });
  }
}

module.exports = {
  register,
  login,
  getMe
};

