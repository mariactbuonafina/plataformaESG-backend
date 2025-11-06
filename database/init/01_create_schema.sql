-- ============================================
-- Script de Inicialização do Banco de Dados
-- Plataforma ESG - PostgreSQL
-- ============================================

-- Criar extensões necessárias (se necessário)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";w# Dockerfile para React
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

-- ============================================
-- TABELA: users (Usuários/Empresas)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Para autenticação futura
    company_name VARCHAR(255),
    cnpj VARCHAR(18),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cnpj ON users(cnpj);

-- ============================================
-- TABELA: questionnaires (Questionários)
-- ============================================
CREATE TABLE IF NOT EXISTS questionnaires (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(20),
    category VARCHAR(100), -- Ex: Ambiental, Social, Governança
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: questions (Perguntas)
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    questionnaire_id INTEGER NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50), -- Ex: multiple_choice, text, scale
    options JSONB, -- Para questões de múltipla escolha
    weight DECIMAL(5,2) DEFAULT 1.0, -- Peso da pergunta na pontuação
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_questionnaire FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id)
);

-- Índices para questions
CREATE INDEX IF NOT EXISTS idx_questions_questionnaire ON questions(questionnaire_id);

-- ============================================
-- TABELA: responses (Respostas dos Questionários)
-- ============================================
CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    questionnaire_id INTEGER NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    answer_value DECIMAL(10,2), -- Para pontuação numérica
    score DECIMAL(10,2), -- Pontuação calculada (answer_value * weight)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_questionnaire_response FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id),
    CONSTRAINT fk_question FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- Índices para responses
CREATE INDEX IF NOT EXISTS idx_responses_user ON responses(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_questionnaire ON responses(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_responses_question ON responses(question_id);
CREATE INDEX IF NOT EXISTS idx_responses_user_questionnaire ON responses(user_id, questionnaire_id);

-- ============================================
-- TABELA: evidences (Evidências)
-- ============================================
CREATE TABLE IF NOT EXISTS evidences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE SET NULL, -- Evidência pode estar ligada a uma pergunta específica
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500), -- Caminho do arquivo armazenado
    file_name VARCHAR(255),
    file_type VARCHAR(50), -- pdf, docx, jpg, etc.
    file_size BIGINT, -- Tamanho em bytes
    evidence_type VARCHAR(50), -- Ex: documento, política, certificado
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(id), -- Admin que revisou
    CONSTRAINT fk_user_evidence FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Índices para evidences
CREATE INDEX IF NOT EXISTS idx_evidences_user ON evidences(user_id);
CREATE INDEX IF NOT EXISTS idx_evidences_question ON evidences(question_id);
CREATE INDEX IF NOT EXISTS idx_evidences_status ON evidences(status);

-- ============================================
-- TABELA: seals (Selos ESG)
-- ============================================
CREATE TABLE IF NOT EXISTS seals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seal_type VARCHAR(50) NOT NULL, -- bronze, silver, gold
    score DECIMAL(10,2) NOT NULL, -- Pontuação total que gerou o selo
    total_score DECIMAL(10,2), -- Pontuação máxima possível
    percentage DECIMAL(5,2), -- Percentual alcançado
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- Data de expiração do selo (se aplicável)
    is_active BOOLEAN DEFAULT TRUE,
    certificate_path VARCHAR(500), -- Caminho do certificado PDF gerado
    CONSTRAINT fk_user_seal FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_seal_type CHECK (seal_type IN ('bronze', 'silver', 'gold'))
);

-- Índices para seals
CREATE INDEX IF NOT EXISTS idx_seals_user ON seals(user_id);
CREATE INDEX IF NOT EXISTS idx_seals_type ON seals(seal_type);
CREATE INDEX IF NOT EXISTS idx_seals_active ON seals(is_active);

-- ============================================
-- VIEW: user_scores (Pontuações dos Usuários)
-- ============================================
CREATE OR REPLACE VIEW user_scores AS
SELECT 
    u.id AS user_id,
    u.name AS user_name,
    u.company_name,
    q.id AS questionnaire_id,
    q.title AS questionnaire_title,
    COUNT(DISTINCT r.id) AS total_responses,
    SUM(r.score) AS total_score,
    MAX(r.updated_at) AS last_updated
FROM users u
LEFT JOIN responses r ON u.id = r.user_id
LEFT JOIN questionnaires q ON r.questionnaire_id = q.id
GROUP BY u.id, u.name, u.company_name, q.id, q.title;

-- ============================================
-- VIEW: current_seals (Selos Atuais dos Usuários)
-- ============================================
CREATE OR REPLACE VIEW current_seals AS
SELECT 
    s.*,
    u.name AS user_name,
    u.company_name,
    u.email
FROM seals s
INNER JOIN users u ON s.user_id = u.id
WHERE s.is_active = TRUE
ORDER BY 
    CASE s.seal_type 
        WHEN 'gold' THEN 3
        WHEN 'silver' THEN 2
        WHEN 'bronze' THEN 1
    END DESC,
    s.awarded_at DESC;

-- ============================================
-- FUNÇÃO: Calcular Pontuação Total do Usuário
-- ============================================
CREATE OR REPLACE FUNCTION calculate_user_score(p_user_id INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_total_score DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(score), 0) INTO v_total_score
    FROM responses
    WHERE user_id = p_user_id;
    
    RETURN v_total_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: Determinar Tipo de Selo pela Pontuação
-- ============================================
CREATE OR REPLACE FUNCTION determine_seal_type(p_score DECIMAL, p_max_score DECIMAL)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_percentage DECIMAL(5,2);
BEGIN
    IF p_max_score = 0 THEN
        RETURN NULL;
    END IF;
    
    v_percentage := (p_score / p_max_score) * 100;
    
    IF v_percentage >= 80 THEN
        RETURN 'gold';
    ELSIF v_percentage >= 60 THEN
        RETURN 'silver';
    ELSIF v_percentage >= 40 THEN
        RETURN 'bronze';
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas que têm updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionnaires_updated_at 
    BEFORE UPDATE ON questionnaires 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at 
    BEFORE UPDATE ON responses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS (Seed Data)
-- ============================================

-- Inserir usuário de exemplo
INSERT INTO users (name, email, company_name, cnpj) 
VALUES 
    ('Maria Silva', 'maria@teste.com', 'Empresa Teste Ltda', '12.345.678/0001-90')
ON CONFLICT (email) DO NOTHING;

-- Inserir questionário de exemplo
INSERT INTO questionnaires (title, description, category, version) 
VALUES 
    ('Questionário ESG - Maturidade', 'Avaliação de maturidade ESG da empresa', 'Geral', '1.0')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE users IS 'Tabela de usuários/empresas da plataforma';
COMMENT ON TABLE questionnaires IS 'Questionários ESG disponíveis';
COMMENT ON TABLE questions IS 'Perguntas dos questionários';
COMMENT ON TABLE responses IS 'Respostas dos usuários aos questionários';
COMMENT ON TABLE evidences IS 'Evidências/documentos enviados pelos usuários';
COMMENT ON TABLE seals IS 'Selos ESG concedidos aos usuários';

