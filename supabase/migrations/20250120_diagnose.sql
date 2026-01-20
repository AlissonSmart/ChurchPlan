-- ============================================
-- DIAGNÓSTICO - VERIFICAR ESTADO DO BANCO
-- ============================================

-- Listar todas as tabelas existentes
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Listar todas as políticas RLS
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;

-- Listar todas as constraints
SELECT constraint_name, table_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
ORDER BY table_name, constraint_name;

-- Listar todos os triggers
SELECT trigger_name, event_object_table, event_manipulation 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
ORDER BY event_object_table, trigger_name;

-- Verificar se tabela notifications existe e suas colunas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'notifications' 
ORDER BY ordinal_position;
