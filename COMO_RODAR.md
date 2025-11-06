# 🚀 COMO RODAR E TESTAR - GUIA VISUAL

## 📋 Passo a Passo Completo

---

## 1️⃣ SUBIR OS CONTAINERS

### No terminal, na raiz do projeto:

```bash
docker compose up --build
```

### O que você vai ver:

```
[+] Building backend...
[+] Running 2/2
 ✔ Container plataforma-esg-db       Started
 ✔ Container plataforma-esg-backend  Started

db:
  PostgreSQL 15 ready

backend:
  🔌 Tentando conectar ao PostgreSQL...
     Host: db
     Database: esg_db
     Port: 5432
     User: esg_user
  ✅ Conectado ao PostgreSQL com sucesso!
  🚀 Backend rodando na porta 3333
  📝 Documentação: http://localhost:3333/api
  🏥 Health check: http://localhost:3333/ping
```

**✅ Quando ver isso, está funcionando!**

---

## 2️⃣ TESTAR A API

### Opção A: Script Automático (Recomendado)

```powershell
.\test-api.ps1
```

**Saída esperada:**

```
🧪 TESTANDO API PLATAFORMA ESG
================================

1️⃣  TESTE DE HEALTH CHECK
---------------------------
✅ GET /ping
   Status: API ESG Platform funcionando

2️⃣  TESTE DE DOCUMENTAÇÃO
---------------------------
✅ GET /api
   API Version: 1.0.0

3️⃣  REGISTRO DE USUÁRIO
---------------------------
✅ POST /api/auth/register
   Token recebido: eyJhbGciOiJIUzI1NiIs...
   User ID: 1

4️⃣  INFORMAÇÕES DO USUÁRIO LOGADO
---------------------------
✅ GET /api/auth/me
   Nome: Usuario Teste
   Email: teste@empresa.com

5️⃣  LISTAR QUESTIONÁRIOS
---------------------------
✅ GET /api/questionnaires
   Total de questionários: 1

...

================================"
✅ TESTES CONCLUÍDOS!
================================
```

### Opção B: Testes Manuais

#### Teste 1: Health Check
```bash
curl http://localhost:3333/ping
```

**Resposta:**
```json
{
  "message": "pong",
  "status": "API ESG Platform funcionando",
  "timestamp": "2025-11-05T10:30:00.000Z"
}
```

#### Teste 2: Registrar Usuário
```bash
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"João Silva\",\"email\":\"joao@teste.com\",\"password\":\"senha123\"}"
```

**Resposta:**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@teste.com",
    "company_name": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2FvQHRlc3RlLmNvbSIsIm5hbWUiOiJKb2FvIFNpbHZhIiwiaWF0IjoxNzMxMDcyMDAwLCJleHAiOjE3MzE2NzY4MDB9.abc123..."
}
```

**⚠️ IMPORTANTE: Salve o token!**

#### Teste 3: Login
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"joao@teste.com\",\"password\":\"senha123\"}"
```

**Resposta:**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@teste.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Teste 4: Usar Token (Buscar Info do Usuário)
```bash
curl http://localhost:3333/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta:**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@teste.com",
  "company_name": null,
  "cnpj": null,
  "phone": null,
  "created_at": "2025-11-05T10:30:00.000Z"
}
```

#### Teste 5: Listar Questionários
```bash
curl http://localhost:3333/api/questionnaires
```

**Resposta:**
```json
[
  {
    "id": 1,
    "title": "Questionário ESG - Maturidade",
    "description": "Avalie a maturidade ESG da sua empresa",
    "category": "Geral",
    "version": "1.0",
    "total_questions": 5
  }
]
```

---

## 3️⃣ FLUXO COMPLETO DE USO

### Cenário: Usuário completa questionário e recebe selo

#### Passo 1: Usuário faz login
```bash
POST /api/auth/login
→ Recebe token
```

#### Passo 2: Busca questionário disponível
```bash
GET /api/questionnaires
→ Encontra questionário ID: 1
```

#### Passo 3: Vê as perguntas
```bash
GET /api/questionnaires/1
→ Lista de perguntas
```

#### Passo 4: Responde o questionário
```bash
POST /api/responses
Body: {
  "questionnaire_id": 1,
  "responses": [
    { "question_id": 1, "answer_value": 10 },
    { "question_id": 2, "answer_value": 8 },
    { "question_id": 3, "answer_value": 9 }
  ]
}
→ Respostas salvas
```

#### Passo 5: Sistema calcula pontuação
```bash
GET /api/responses/questionnaire/1/score
→ Score: 27/30 (90%)
```

#### Passo 6: Solicita cálculo do selo
```bash
POST /api/seals/calculate
Body: { "questionnaire_id": 1 }
→ Selo GOLD concedido!
```

#### Passo 7: Ver selo ativo
```bash
GET /api/seals/active
→ Retorna selo gold
```

**Resultado:**
```json
{
  "id": 1,
  "user_id": 1,
  "seal_type": "gold",
  "score": 27,
  "total_score": 30,
  "percentage": 90.00,
  "awarded_at": "2025-11-05T10:35:00.000Z",
  "is_active": true
}
```

---

## 📊 VISUALIZAÇÃO DO SISTEMA RODANDO

### Terminal 1: Docker Compose
```
backend_1  | 🚀 Backend rodando na porta 3333
backend_1  | 📝 Documentação: http://localhost:3333/api
backend_1  | 🏥 Health check: http://localhost:3333/ping
db_1       | PostgreSQL 15 ready
```

### Terminal 2: Testes
```
🧪 TESTANDO API PLATAFORMA ESG
✅ GET /ping
✅ POST /api/auth/register
✅ POST /api/auth/login
✅ GET /api/questionnaires
✅ POST /api/responses
✅ POST /api/seals/calculate
✅ TESTES CONCLUÍDOS!
```

### Browser: Documentação
```
http://localhost:3333/api
```

Mostra todos os endpoints disponíveis!

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### 1. Verificar Containers
```bash
docker compose ps
```

**Deve mostrar:**
```
NAME                      STATUS
plataforma-esg-db         Up (healthy)
plataforma-esg-backend    Up
```

### 2. Verificar Logs
```bash
docker compose logs -f backend
```

**Deve mostrar:**
```
✅ Conectado ao PostgreSQL com sucesso!
🚀 Backend rodando na porta 3333
```

### 3. Testar Endpoint
```bash
curl http://localhost:3333/ping
```

**Deve retornar:**
```json
{"message":"pong","status":"API ESG Platform funcionando"}
```

---

## 🎯 COMANDOS RÁPIDOS

```bash
# Subir
docker compose up --build

# Ver logs
docker compose logs -f

# Parar
docker compose down

# Limpar tudo (apaga dados)
docker compose down -v

# Reconstruir
docker compose build --no-cache
docker compose up
```

---

## ✅ CHECKLIST ANTES DE TESTAR

- [ ] Docker instalado e rodando
- [ ] Porta 3333 livre
- [ ] Porta 5432 livre
- [ ] Executar `docker compose up --build`
- [ ] Aguardar mensagem "✅ Conectado ao PostgreSQL"
- [ ] Testar `/ping`

---

## 🎉 PRONTO!

Quando tudo estiver rodando:
- ✅ API disponível em `http://localhost:3333`
- ✅ Banco de dados conectado
- ✅ Todas as rotas funcionando
- ✅ Autenticação JWT ativa
- ✅ Pronto para receber requisições!

**Use o script `test-api.ps1` para testar tudo automaticamente!**

