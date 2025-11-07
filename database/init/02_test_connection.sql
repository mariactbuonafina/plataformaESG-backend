-- Script de teste para verificar se as tabelas foram criadas corretamente
-- Este script será executado após o 01_create_schema.sql

-- Verificar se todas as tabelas foram criadas
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('users', 'questionnaires', 'questions', 'responses', 'evidences', 'seals');
    
    IF table_count = 6 THEN
        RAISE NOTICE '✅ Todas as 6 tabelas foram criadas com sucesso!';
    ELSE
        RAISE WARNING '⚠️ Esperado 6 tabelas, mas encontrado %', table_count;
    END IF;
END $$;

-- Verificar índices
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename IN ('users', 'questionnaires', 'questions', 'responses', 'evidences', 'seals');
    
    RAISE NOTICE '📊 Total de índices criados: %', index_count;
END $$;

-- Verificar funções
DO $$
DECLARE
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND proname IN ('calculate_user_score', 'determine_seal_type', 'update_updated_at_column');
    
    IF function_count = 3 THEN
        RAISE NOTICE '✅ Todas as 3 funções foram criadas com sucesso!';
    ELSE
        RAISE WARNING '⚠️ Esperado 3 funções, mas encontrado %', function_count;
    END IF;
END $$;

-- Verificar views
DO $$
DECLARE
    view_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name IN ('user_scores', 'current_seals');
    
    IF view_count = 2 THEN
        RAISE NOTICE '✅ Todas as 2 views foram criadas com sucesso!';
    ELSE
        RAISE WARNING '⚠️ Esperado 2 views, mas encontrado %', view_count;
    END IF;
END $$;

-- Testar inserção de dados
INSERT INTO users (name, email, company_name) 
VALUES ('Teste Sistema', 'teste@sistema.com', 'Empresa Teste')
ON CONFLICT (email) DO NOTHING;

-- Verificar dados iniciais
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    RAISE NOTICE '👥 Total de usuários no banco: %', user_count;
END $$;

RAISE NOTICE '🎉 Script de teste concluído!';

