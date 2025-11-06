# Script de Teste da API - Plataforma ESG
# PowerShell Script para testar todas as rotas da API

$API_URL = "http://localhost:3333"
$token = ""

Write-Host "🧪 TESTANDO API PLATAFORMA ESG" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Função para fazer requisições
function Test-API {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = ""
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        if ($Body) {
            $bodyJson = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri "$API_URL$Endpoint" -Method $Method -Headers $headers -Body $bodyJson
        } else {
            $response = Invoke-RestMethod -Uri "$API_URL$Endpoint" -Method $Method -Headers $headers
        }
        
        Write-Host "✅ $Method $Endpoint" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "❌ $Method $Endpoint - Erro: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "   Detalhes: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
        }
        return $null
    }
}

# 1. Teste de Health Check
Write-Host "1️⃣  TESTE DE HEALTH CHECK" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow
$ping = Test-API -Method "GET" -Endpoint "/ping"
if ($ping) {
    Write-Host "   Status: $($ping.status)" -ForegroundColor Green
    Write-Host ""
}

# 2. Teste de Documentação
Write-Host "2️⃣  TESTE DE DOCUMENTAÇÃO" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow
$docs = Test-API -Method "GET" -Endpoint "/api"
if ($docs) {
    Write-Host "   API Version: $($docs.version)" -ForegroundColor Green
    Write-Host ""
}

# 3. Registrar Usuário
Write-Host "3️⃣  REGISTRO DE USUÁRIO" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow
$registerData = @{
    name = "Usuario Teste"
    email = "teste@empresa.com"
    password = "senha123"
    company_name = "Empresa Teste LTDA"
    cnpj = "12.345.678/0001-90"
}
$registerResponse = Test-API -Method "POST" -Endpoint "/api/auth/register" -Body $registerData
if ($registerResponse -and $registerResponse.token) {
    $token = $registerResponse.token
    Write-Host "   Token recebido: $($token.Substring(0, 20))..." -ForegroundColor Green
    Write-Host "   User ID: $($registerResponse.user.id)" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "   ⚠️  Tentando fazer login..." -ForegroundColor Yellow
    # Tentar login se registro falhou (usuário já existe)
    $loginData = @{
        email = "teste@empresa.com"
        password = "senha123"
    }
    $loginResponse = Test-API -Method "POST" -Endpoint "/api/auth/login" -Body $loginData
    if ($loginResponse -and $loginResponse.token) {
        $token = $loginResponse.token
        Write-Host "   ✅ Login realizado com sucesso" -ForegroundColor Green
        Write-Host "   Token recebido: $($token.Substring(0, 20))..." -ForegroundColor Green
        Write-Host ""
    }
}

# 4. Buscar informações do usuário logado
Write-Host "4️⃣  INFORMAÇÕES DO USUÁRIO LOGADO" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow
if ($token) {
    $me = Test-API -Method "GET" -Endpoint "/api/auth/me" -Token $token
    if ($me) {
        Write-Host "   Nome: $($me.name)" -ForegroundColor Green
        Write-Host "   Email: $($me.email)" -ForegroundColor Green
        Write-Host ""
    }
}

# 5. Listar Questionários
Write-Host "5️⃣  LISTAR QUESTIONÁRIOS" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow
$questionnaires = Test-API -Method "GET" -Endpoint "/api/questionnaires"
if ($questionnaires) {
    Write-Host "   Total de questionários: $($questionnaires.Count)" -ForegroundColor Green
    if ($questionnaires.Count -gt 0) {
        Write-Host "   Primeiro questionário: $($questionnaires[0].title)" -ForegroundColor Green
    }
    Write-Host ""
}

# 6. Criar Questionário (se autenticado)
Write-Host "6️⃣  CRIAR QUESTIONÁRIO" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow
if ($token) {
    $newQuestionnaire = @{
        title = "Questionário ESG - Teste"
        description = "Questionário de teste da API"
        category = "Geral"
        version = "1.0"
    }
    $createdQuestionnaire = Test-API -Method "POST" -Endpoint "/api/questionnaires" -Body $newQuestionnaire -Token $token
    if ($createdQuestionnaire) {
        $questionnaireId = $createdQuestionnaire.questionnaire.id
        Write-Host "   Questionário criado com ID: $questionnaireId" -ForegroundColor Green
        Write-Host ""
        
        # Adicionar pergunta
        Write-Host "   📝 Adicionando pergunta..." -ForegroundColor Cyan
        $newQuestion = @{
            question_text = "Sua empresa possui política de sustentabilidade?"
            question_type = "multiple_choice"
            options = @("Sim", "Não", "Em desenvolvimento")
            weight = 2.0
            order_index = 1
        }
        $question = Test-API -Method "POST" -Endpoint "/api/questionnaires/$questionnaireId/questions" -Body $newQuestion -Token $token
        if ($question) {
            Write-Host "   ✅ Pergunta adicionada com ID: $($question.question.id)" -ForegroundColor Green
        }
        Write-Host ""
    }
}

# 7. Buscar Questionário
Write-Host "7️⃣  BUSCAR QUESTIONÁRIO" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow
if ($token) {
    $questionnaire = Test-API -Method "GET" -Endpoint "/api/questionnaires/1"
    if ($questionnaire) {
        Write-Host "   Título: $($questionnaire.title)" -ForegroundColor Green
        if ($questionnaire.questions) {
            Write-Host "   Total de perguntas: $($questionnaire.questions.Count)" -ForegroundColor Green
        }
        Write-Host ""
    }
}

# 8. Salvar Respostas
Write-Host "8️⃣  SALVAR RESPOSTAS" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow
if ($token) {
    $responses = @{
        questionnaire_id = 1
        responses = @(
            @{
                question_id = 1
                answer_text = "Sim"
                answer_value = 10
            }
        )
    }
    $savedResponses = Test-API -Method "POST" -Endpoint "/api/responses" -Body $responses -Token $token
    if ($savedResponses) {
        Write-Host "   ✅ Respostas salvas" -ForegroundColor Green
        Write-Host "   Pontuação total: $($savedResponses.total_score)" -ForegroundColor Green
        Write-Host ""
    }
}

# 9. Calcular Selo
Write-Host "9️⃣  CALCULAR SELO ESG" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow
if ($token) {
    $sealData = @{
        questionnaire_id = 1
    }
    $seal = Test-API -Method "POST" -Endpoint "/api/seals/calculate" -Body $sealData -Token $token
    if ($seal) {
        Write-Host "   ✅ Selo calculado!" -ForegroundColor Green
        Write-Host "   Tipo: $($seal.seal.seal_type)" -ForegroundColor Green
        Write-Host "   Pontuação: $($seal.score) / $($seal.max_score)" -ForegroundColor Green
        Write-Host "   Percentual: $($seal.percentage)%" -ForegroundColor Green
        Write-Host ""
    }
}

# 10. Buscar Selo Ativo
Write-Host "🔟 BUSCAR SELO ATIVO" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow
if ($token) {
    $activeSeal = Test-API -Method "GET" -Endpoint "/api/seals/active" -Token $token
    if ($activeSeal) {
        Write-Host "   ✅ Selo ativo encontrado!" -ForegroundColor Green
        Write-Host "   Tipo: $($activeSeal.seal_type)" -ForegroundColor Green
        Write-Host "   Pontuação: $($activeSeal.score)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Nenhum selo ativo encontrado" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ TESTES CONCLUÍDOS!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

