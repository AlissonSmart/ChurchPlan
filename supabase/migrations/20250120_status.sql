-- ============================================
-- DIAGNÓSTICO - STATUS ATUAL DO BANCO
-- ============================================

-- Verificar se tabela notifications existe
SELECT to_regclass('public.notifications') AS notifications_exists;

-- Listar todas as tabelas no schema public
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Verificar colunas da tabela notifications (se existir)
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'notifications' 
ORDER BY ordinal_position;

-- Contar registros em notifications
SELECT COUNT(*) as notification_count FROM public.notifications;
