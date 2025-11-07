const { verifyToken } = require('../utils/jwt');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acesso não fornecido',
      message: 'Você precisa fazer login para acessar este recurso'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Adiciona informações do usuário na requisição
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Token inválido ou expirado',
      message: error.message
    });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Ignora erro se token for inválido
    }
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth
};

