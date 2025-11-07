# 📚 DOCUMENTAÇÃO COMPLETA - PLATAFORMA ESG

## 🎯 Visão Geral

A Plataforma ESG é uma API REST completa para gerenciamento de questionários ESG, evidências e concessão de selos de certificação (Bronze, Prata, Ouro).

---

## 📁 ESTRUTURA DO PROJETO

```
backend/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de negócio
│   │   │   ├── authController.js      # Login/Registro
│   │   │   ├── userController.js      # CRUD usuários
│   │   │   ├── questionnaireController.js  # Questionários
│   │   │   ├── responseController.js  # Respostas
│   │   │   ├── evidenceController.js  # Evidências
│   │   │   └── sealController.js      # Selos ESG
│   │   ├── routes/        # Definição de rotas
│   │   ├── middleware/    # Autenticação JWT
│   │   ├── utils/         # Utilitários (JWT, Password)
│   │   ├── index.js       # Servidor principal
│   │   └── db.js          # Conexão PostgreSQL
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── init/
│       ├── 01_create_schema.sql    # Criação do banco
│       └── 02_test_connection.sql  # Teste de conexão
├── docker-compose.yml     # Orquestração Docker
├── test-api.ps1          # Script de testes
└── README.md             # Documentação básica
```

---

## 🗄️ BANCO DE DADOS

### Tabelas Principais

1. **users** - Usuários/Empresas cadastradas
2. **questionnaires** - Questionários ESG disponíveis
3. **questions** - Perguntas dos questionários
4. **responses** - Respostas dos usuários
5. **evidences** - Evidências/documentos enviados
6. **seals** - Selos ESG concedidos

### Inicialização Automática

Os scripts SQL em `database/init/` são executados automaticamente quando o container do PostgreSQL é criado pela primeira vez.

---

## 🔐 AUTENTICAÇÃO

### Como Funciona

1. **Registro/Login:** Usuário recebe token JWT
2. **Token JWT:** Válido por 7 dias (configurável)
3. **Uso:** Enviar no header `Authorization: Bearer <token>`

### Exemplo

```bash


## 📡 API - ENDPOINTS COMPLETOS

### Base URL
```
http://localhost:3333
```

### 1. Autenticação (`/api/auth`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Registrar novo usuário | ❌ |
| POST | `/api/auth/login` | Fazer login | ❌ |
| GET | `/api/auth/me` | Info do usuário logado | ✅ |

### 2. Usuários (`/api/users`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/users` | Listar todos | ✅ |
| GET | `/api/users/:id` | Buscar por ID | ✅ |
| POST | `/api/users` | Criar usuário | ✅ |
| PUT | `/api/users/:id` | Atualizar | ✅ |
| DELETE | `/api/users/:id` | Deletar (soft) | ✅ |

### 3. Questionários (`/api/questionnaires`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/questionnaires` | Listar ativos | ❌ |
| GET | `/api/questionnaires/:id` | Buscar com perguntas | ❌ |
| POST | `/api/questionnaires` | Criar | ✅ |
| POST | `/api/questionnaires/:id/questions` | Adicionar pergunta | ✅ |

### 4. Respostas (`/api/responses`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/responses` | Salvar respostas | ✅ |
| GET | `/api/responses/questionnaire/:id` | Buscar respostas | ✅ |
| GET | `/api/responses/questionnaire/:id/score` | Pontuação | ✅ |

### 5. Evidências (`/api/evidences`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/evidences` | Listar do usuário | ✅ |
| POST | `/api/evidences` | Adicionar | ✅ |
| PUT | `/api/evidences/:id/status` | Atualizar status | ✅ |

### 6. Selos (`/api/seals`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/seals/calculate` | Calcular selo | ✅ |
| GET | `/api/seals` | Listar selos | ✅ |
| GET | `/api/seals/active` | Selo ativo | ✅ |

---

## 🐳 DOCKER

### Configuração

O `docker-compose.yml` orquestra:
- **PostgreSQL 15** (container `db`)
- **Backend Node.js** (container `backend`)
- **Rede Docker** compartilhada

### Variáveis de Ambiente

Valores padrão (pode criar `.env` para customizar):

```env
NODE_ENV=development
PORT=3333
DB_USER=esg_user
DB_PASS=esg_pass
DB_NAME=esg_db
DB_HOST=db
DB_PORT=5432
JWT_SECRET=sua-chave-secreta-super-segura-mude-em-producao
JWT_EXPIRES_IN=7d
```

### Comandos Essenciais

```bash
# Subir tudo
docker compose up --build

# Subir em background
docker compose up -d --build

# Ver logs
docker compose logs -f backend
docker compose logs -f db

# Parar
docker compose down

# Parar e limpar dados
docker compose down -v
```

---

## 🚀 COMO USAR

### Passo 1: Subir os Containers

```bash
docker compose up --build
```

**Aguarde até ver:**
```
✅ Conectado ao PostgreSQL com sucesso!
🚀 Backend rodando na porta 3333
```

### Passo 2: Testar a API

#### Opção A: Script Automático
```powershell
.\test-api.ps1
```

#### Opção B: Testes Manuais

**1. Health Check**
```bash
curl http://localhost:3333/ping
```

**2. Documentação**
```bash
curl http://localhost:3333/api
```

**3. Registrar Usuário**
```bash
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@teste.com","password":"senha123"}'
```

**4. Login (Salvar Token)**
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@teste.com","password":"senha123"}'
```

**5. Usar Token**
```bash
curl http://localhost:3333/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Passo 3: Fluxo Completo

1. ✅ Registrar usuário → Receber token
2. ✅ Criar questionário → Salvar ID
3. ✅ Adicionar perguntas ao questionário
4. ✅ Usuário responde questionário
5. ✅ Sistema calcula pontuação
6. ✅ Concede selo (Bronze/Silver/Gold)

---

## 🔄 FLUXO DE DADOS

### Exemplo Completo

```bash
# 1. Registrar
POST /api/auth/register
→ Token: "abc123..."

# 2. Criar Questionário
POST /api/questionnaires
Body: { "title": "ESG Maturidade", ... }
→ ID: 1

# 3. Adicionar Pergunta
POST /api/questionnaires/1/questions
Body: { "question_text": "Tem política?", ... }
→ Question ID: 1

# 4. Responder
POST /api/responses
Body: {
  "questionnaire_id": 1,
  "responses": [{
    "question_id": 1,
    "answer_value": 10
  }]
}
→ Score: 10

# 5. Calcular Selo
POST /api/seals/calculate
Body: { "questionnaire_id": 1 }
→ Selo: "gold" (se score >= 80%)
```

---

## 🏆 SISTEMA DE SELOS

### Cálculo Automático

- **Gold (Ouro):** ≥ 80% da pontuação máxima
- **Silver (Prata):** ≥ 60% da pontuação máxima
- **Bronze (Bronze):** ≥ 40% da pontuação máxima
- **Sem Selo:** < 40%

### Pontuação

- Cada pergunta tem um `weight` (peso)
- Resposta tem `answer_value` (0-10)
- Score = `answer_value × weight`
- Total = soma de todos os scores

---

## 🔧 TECNOLOGIAS

- **Backend:** Node.js 20 + Express 4.x
- **Banco:** PostgreSQL 15
- **Autenticação:** JWT (jsonwebtoken)
- **Segurança:** bcryptjs (hash de senhas)
- **Containerização:** Docker + Docker Compose

### Dependências Principais

```json
{
  "express": "^4.19.2",
  "pg": "^8.16.3",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

---

## 🐛 TROUBLESHOOTING

### Container não inicia
```bash
docker compose down
docker compose up --build
```

### Erro de conexão com banco
- Aguarde alguns segundos após subir o banco
- Verifique se `DB_HOST=db` no docker-compose
- Verifique logs: `docker compose logs db`

### Token inválido
- Fazer login novamente
- Verificar formato: `Authorization: Bearer <token>`
- Token expira em 7 dias

### Porta em uso
```bash
# Windows
netstat -ano | findstr :3333
taskkill /PID <PID> /F
```

---

## 📊 ESTRUTURA DO BANCO

### Relacionamentos

```
users (1) ──→ (N) responses
users (1) ──→ (N) evidences
users (1) ──→ (N) seals

questionnaires (1) ──→ (N) questions
questionnaires (1) ──→ (N) responses

questions (1) ──→ (N) responses
questions (1) ──→ (N) evidences (opcional)
```

### Campos Importantes

**users:**
- `id`, `name`, `email`, `password_hash`, `company_name`, `cnpj`

**questionnaires:**
- `id`, `title`, `description`, `category`, `version`

**questions:**
- `id`, `questionnaire_id`, `question_text`, `question_type`, `options` (JSONB), `weight`

**responses:**
- `id`, `user_id`, `questionnaire_id`, `question_id`, `answer_text`, `answer_value`, `score`

**seals:**
- `id`, `user_id`, `seal_type` (bronze/silver/gold), `score`, `percentage`, `is_active`

---

## ✅ CHECKLIST DE FUNCIONAMENTO

- [x] Docker Compose configurado
- [x] PostgreSQL com scripts automáticos
- [x] Backend conectado ao banco
- [x] Autenticação JWT funcionando
- [x] CRUD de usuários completo
- [x] Sistema de questionários
- [x] Sistema de respostas e pontuação
- [x] Upload de evidências
- [x] Cálculo automático de selos
- [x] Todas as rotas protegidas
- [x] Tratamento de erros
- [x] Documentação da API (`/api`)

---

## 🎯 PRÓXIMOS PASSOS SUGERIDOS

1. **Upload Real de Arquivos** - Implementar multer para upload de evidências
2. **Validação Avançada** - Adicionar validações mais robustas
3. **Testes Automatizados** - Jest/Mocha para testes unitários
4. **Cache** - Redis para melhor performance
5. **Rate Limiting** - Proteção contra abuso
6. **Logs Estruturados** - Winston ou similar
7. **Monitoramento** - Health checks e métricas

---

## 📞 SUPORTE

Para problemas ou dúvidas:
1. Verificar logs: `docker compose logs -f`
2. Verificar status: `docker compose ps`
3. Testar conexão: `curl http://localhost:3333/ping`
4. Ver documentação: `curl http://localhost:3333/api`

---

**Versão:** 1.0.0  
**Última atualização:** 05/11/2025  
**Status:** ✅ Funcional e Pronto para Uso

