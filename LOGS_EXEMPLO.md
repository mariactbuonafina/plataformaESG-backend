# 📋 LOGS DO SISTEMA - EXEMPLO

## Como os Logs Aparecem Quando Está Rodando

---

## 🐳 LOGS DO DOCKER COMPOSE

### Comando:
```bash
docker compose logs -f backend
```

### Saída Esperada:

```
plataforma-esg-backend  | 🔌 Tentando conectar ao PostgreSQL...
plataforma-esg-backend  |    Host: db
plataforma-esg-backend  |    Database: esg_db
plataforma-esg-backend  |    Port: 5432
plataforma-esg-backend  |    User: esg_user
plataforma-esg-backend  | ✅ Conectado ao PostgreSQL com sucesso!
plataforma-esg-backend  | 🚀 Backend rodando na porta 3333
plataforma-esg-backend  | 📝 Documentação: http://localhost:3333/api
plataforma-esg-backend  | 🏥 Health check: http://localhost:3333/ping
```

---

## 📊 LOGS DURANTE REQUISIÇÕES

### Quando alguém faz login:

```
plataforma-esg-backend  | POST /api/auth/login - 200
```

### Quando há erro:

```
plataforma-esg-backend  | ❌ Erro ao conectar ao PostgreSQL: connection refused
plataforma-esg-backend  | ⚠️ Usando modo FAKE até que a conexão seja estabelecida.
plataforma-esg-backend  | 🔄 Tentando reconectar ao PostgreSQL...
```

### Quando conecta com sucesso:

```
plataforma-esg-backend  | ✅ Reconectado ao PostgreSQL!
```

---

## 🔍 VERIFICAR STATUS DOS CONTAINERS

### Comando:
```bash
docker compose ps
```

### Saída Esperada:

```
NAME                      STATUS
plataforma-esg-db         Up (healthy)
plataforma-esg-backend    Up
```

---

## 📝 LOGS DO BANCO DE DADOS

### Comando:
```bash
docker compose logs -f db
```

### Saída Esperada:

```
plataforma-esg-db  | PostgreSQL 15 ready
plataforma-esg-db  | Database initialized
plataforma-esg-db  | Scripts SQL executados
```

---

## 🧪 LOGS DURANTE TESTES

### Quando você executa `test-api.ps1`:

```
plataforma-esg-backend  | POST /api/auth/register - 201
plataforma-esg-backend  | POST /api/auth/login - 200
plataforma-esg-backend  | GET /api/auth/me - 200
plataforma-esg-backend  | GET /api/questionnaires - 200
plataforma-esg-backend  | POST /api/questionnaires - 201
plataforma-esg-backend  | POST /api/responses - 201
plataforma-esg-backend  | POST /api/seals/calculate - 201
```

---

## ⚠️ LOGS DE ERRO COMUNS

### Erro: Container não encontrado
```
Error: No such service: backend
```
**Solução:** `docker compose up --build`

### Erro: Porta em uso
```
Error: port 3333 is already allocated
```
**Solução:** Parar processo usando a porta ou mudar porta no docker-compose

### Erro: Banco não conecta
```
❌ Erro ao conectar ao PostgreSQL: connection refused
```
**Solução:** Aguardar alguns segundos ou verificar se banco está saudável

---

## ✅ LOGS DE SUCESSO

### Quando tudo está funcionando:

```
plataforma-esg-db         | Up (healthy)
plataforma-esg-backend    | Up
plataforma-esg-backend    | ✅ Conectado ao PostgreSQL com sucesso!
plataforma-esg-backend    | 🚀 Backend rodando na porta 3333
```

---

## 🎯 COMANDOS ÚTEIS PARA LOGS

```bash
# Ver logs do backend em tempo real
docker compose logs -f backend

# Ver logs do banco
docker compose logs -f db

# Ver todos os logs
docker compose logs -f

# Ver últimas 50 linhas
docker compose logs --tail=50 backend

# Ver logs desde um tempo específico
docker compose logs --since 10m backend
```

---

## 📊 INTERPRETAÇÃO DOS LOGS

### ✅ Sinais de Sucesso:
- `✅ Conectado ao PostgreSQL com sucesso!`
- `🚀 Backend rodando na porta 3333`
- `Up (healthy)` no status do banco
- Status codes `200`, `201` nas requisições

### ⚠️ Sinais de Problema:
- `❌ Erro ao conectar`
- `connection refused`
- `ECONNREFUSED`
- Status codes `500`, `503`, `404`

### 🔄 Sinais de Reconexão:
- `🔄 Tentando reconectar ao PostgreSQL...`
- `⚠️ Usando modo FAKE até que a conexão seja estabelecida`

---

## 🎉 Quando Ver Estes Logs, Está Tudo Funcionando!

```
✅ Conectado ao PostgreSQL com sucesso!
🚀 Backend rodando na porta 3333
📝 Documentação: http://localhost:3333/api
🏥 Health check: http://localhost:3333/ping
```

