require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const questionnaireRoutes = require('./routes/questionnaireRoutes');
const responseRoutes = require('./routes/responseRoutes');
const evidenceRoutes = require('./routes/evidenceRoutes');
const sealRoutes = require('./routes/sealRoutes');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get('/ping', (req, res) => {
  res.json({ 
    message: 'pong',
    status: 'API ESG Platform funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questionnaires', questionnaireRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/evidences', evidenceRoutes);
app.use('/api/seals', sealRoutes);

// Rota de documentação da API
app.get('/api', (req, res) => {
  res.json({
    message: 'API Plataforma ESG',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Registrar novo usuário',
        'POST /api/auth/login': 'Fazer login',
        'GET /api/auth/me': 'Obter informações do usuário logado'
      },
      users: {
        'GET /api/users': 'Listar todos os usuários',
        'GET /api/users/:id': 'Buscar usuário por ID',
        'POST /api/users': 'Criar novo usuário',
        'PUT /api/users/:id': 'Atualizar usuário',
        'DELETE /api/users/:id': 'Deletar usuário'
      },
      questionnaires: {
        'GET /api/questionnaires': 'Listar questionários',
        'GET /api/questionnaires/:id': 'Buscar questionário com perguntas',
        'POST /api/questionnaires': 'Criar questionário',
        'POST /api/questionnaires/:id/questions': 'Adicionar pergunta'
      },
      responses: {
        'POST /api/responses': 'Salvar respostas do questionário',
        'GET /api/responses/questionnaire/:questionnaire_id': 'Buscar respostas',
        'GET /api/responses/questionnaire/:questionnaire_id/score': 'Buscar pontuação'
      },
      evidences: {
        'GET /api/evidences': 'Listar evidências do usuário',
        'POST /api/evidences': 'Adicionar evidência',
        'PUT /api/evidences/:id/status': 'Atualizar status da evidência'
      },
      seals: {
        'POST /api/seals/calculate': 'Calcular e conceder selo',
        'GET /api/seals': 'Buscar selos do usuário',
        'GET /api/seals/active': 'Buscar selo ativo'
      }
    }
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`📝 Documentação: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/ping`);
});
