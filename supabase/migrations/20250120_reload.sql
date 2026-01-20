-- ============================================
-- FORÇAR RECARREGAMENTO DO SCHEMA
-- ============================================

-- Verificar se a tabela foi criada
SELECT to_regclass('public.notifications') AS notifications_table;

-- Contar registros na tabela (força o cache atualizar)
SELECT COUNT(*) FROM public.notifications;

-- Listar colunas da tabela
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'notifications' 
ORDER BY ordinal_position;
