# Fluxo de Trabalho Git/GitHub - Plataforma ESG

## 🎯 Objetivo
Este documento estabelece o fluxo de trabalho correto e seguro para contribuir com o projeto [plataformaESG-backend](https://github.com/mariactbuonafina/plataformaESG-backend).

## 📋 Configuração Inicial

### 1. Configuração dos Repositórios Remotos
```bash
# Verificar repositórios remotos configurados
git remote -v

# Configurar upstream (repositório original)
git remote add upstream https://github.com/mariactbuonafina/plataformaESG-backend.git

# Resultado esperado:
# origin    https://github.com/mariactbuonafina/plataformaESG-backend.git (fetch)
# origin    https://github.com/mariactbuonafina/plataformaESG-backend.git (push)
# upstream  https://github.com/mariactbuonafina/plataformaESG-backend.git (fetch)
# upstream  https://github.com/mariactbuonafina/plataformaESG-backend.git (push)
```

## 🔄 Fluxo de Trabalho Diário

### 1. Sincronizar com o Repositório Original
**SEMPRE faça isso antes de começar a trabalhar:**

```bash
# 1. Ir para a branch main
git checkout main

# 2. Buscar atualizações do repositório original
git fetch upstream

# 3. Sincronizar com a main original
git merge upstream/main
# ou, se houver conflitos de histórico:
git reset --hard upstream/main

# 4. Atualizar sua fork
git push origin main
```

### 2. Criar Nova Branch para Desenvolvimento
```bash
# Criar e mudar para nova branch baseada na main atualizada
git checkout -b feature/nome-da-feature

# Exemplos de nomenclatura:
# - feature/autenticacao-usuario
# - bugfix/corrigir-calculo-selo
# - hotfix/erro-critico-upload
```

### 3. Desenvolvimento
```bash
# Fazer suas alterações nos arquivos
# ... editar arquivos ...

# Verificar status
git status

# Adicionar arquivos modificados
git add .
# ou adicionar arquivos específicos
git add arquivo1.js arquivo2.js

# Fazer commit com mensagem descritiva
git commit -m "feat: adicionar autenticação JWT para usuários"

# Convenções de commit:
# feat: nova funcionalidade
# fix: correção de bug
# docs: documentação
# style: formatação
# refactor: refatoração
# test: testes
# chore: tarefas de manutenção
```

### 4. Sincronizar Branch com Main (se necessário)
**Se a main foi atualizada durante seu desenvolvimento:**

```bash
# 1. Voltar para main e atualizar
git checkout main
git fetch upstream
git merge upstream/main

# 2. Voltar para sua branch
git checkout feature/nome-da-feature

# 3. Fazer rebase ou merge da main atualizada
git rebase main
# ou
git merge main
```

### 5. Enviar para o GitHub
```bash
# Primeiro push da branch
git push -u origin feature/nome-da-feature

# Pushs subsequentes
git push
```

### 6. Criar Pull Request
1. Ir para o GitHub
2. Clicar em "Compare & pull request"
3. Preencher título e descrição
4. Revisar mudanças
5. Criar o PR

## 🛡️ Boas Práticas

### ✅ Faça:
- **SEMPRE** sincronizar com upstream antes de começar
- Usar branches separadas para cada feature/bugfix
- Fazer commits pequenos e frequentes
- Usar mensagens de commit descritivas
- Testar suas alterações antes de fazer push
- Revisar o código antes de criar PR

### ❌ Não Faça:
- Trabalhar diretamente na branch main
- Fazer commits grandes com muitas alterações
- Fazer push sem testar
- Esquecer de sincronizar com upstream
- Criar PRs sem revisar o código

## 🔧 Comandos Úteis

### Verificar Status
```bash
git status                    # Status atual
git log --oneline -10        # Últimos 10 commits
git branch -a                # Todas as branches
git remote -v                # Repositórios remotos
```

### Gerenciar Branches
```bash
git branch                   # Listar branches locais
git branch -d nome-branch    # Deletar branch local
git push origin --delete nome-branch  # Deletar branch remota
```

### Desfazer Alterações
```bash
git checkout -- arquivo      # Descartar mudanças em arquivo
git reset HEAD arquivo       # Desfazer git add
git stash                    # Salvar mudanças temporariamente
git stash pop                # Restaurar mudanças salvas
```

## 🚨 Resolução de Conflitos

### Se houver conflitos durante merge/rebase:
1. Abrir arquivos com conflitos
2. Resolver conflitos manualmente (remover marcadores `<<<<<<<`, `=======`, `>>>>>>>`)
3. Adicionar arquivos resolvidos: `git add arquivo`
4. Continuar processo: `git rebase --continue` ou `git commit`

## 📝 Checklist para Pull Request

- [ ] Branch criada a partir da main atualizada
- [ ] Código testado localmente
- [ ] Mensagens de commit descritivas
- [ ] Documentação atualizada (se necessário)
- [ ] PR com título e descrição claros
- [ ] Revisão do código feita

## 🔗 Links Úteis

- [Repositório Original](https://github.com/mariactbuonafina/plataformaESG-backend)
- [Documentação Git](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Lembre-se:** O objetivo é manter o código principal (main) sempre estável e funcional, enquanto o desenvolvimento acontece em branches separadas.
