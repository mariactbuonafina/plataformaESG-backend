# 🔍 VERIFICAR SE DOCKER ESTÁ FUNCIONANDO

## Problema: Docker não reconhecido

Se você vê a mensagem:
```
docker : O termo 'docker' não é reconhecido...
```

Isso significa que o Docker não está instalado ou não está no PATH.

---

## ✅ SOLUÇÕES

### Opção 1: Instalar Docker Desktop

1. Baixar Docker Desktop para Windows:
   - https://www.docker.com/products/docker-desktop/

2. Instalar e reiniciar o computador

3. Verificar instalação:
   ```powershell
   docker --version
   docker compose version
   ```

### Opção 2: Verificar se Docker está rodando

```powershell
# Verificar se Docker Desktop está aberto
Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
```

Se não estiver rodando:
- Abrir Docker Desktop
- Aguardar inicializar (ícone na bandeja do sistema)

### Opção 3: Adicionar ao PATH (se instalado)

Se Docker está instalado mas não no PATH:

1. Encontrar instalação (geralmente):
   ```
   C:\Program Files\Docker\Docker\resources\bin
   ```

2. Adicionar ao PATH do sistema

---

## 🧪 TESTAR DOCKER

### Após instalar/verificar:

```powershell
# Versão do Docker
docker --version
# Deve mostrar: Docker version 20.10.x ou superior

# Versão do Docker Compose
docker compose version
# Deve mostrar: Docker Compose version v2.x.x

# Testar Docker
docker ps
# Deve mostrar lista vazia (sem erros)
```

---

## 🚀 DEPOIS DE INSTALAR

### Subir os containers:

```powershell
docker compose up --build
```

### Ver logs:

```powershell
docker compose logs -f backend
```

### Testar API:

```powershell
.\test-api.ps1
```

---

## 📝 NOTA

Se Docker não estiver disponível, você ainda pode:
- Ver a documentação completa em `DOCUMENTACAO_COMPLETA.md`
- Ver exemplos de logs em `LOGS_EXEMPLO.md`
- Ver como rodar em `COMO_RODAR.md`

Mas para realmente executar o sistema, precisa do Docker instalado e rodando.

