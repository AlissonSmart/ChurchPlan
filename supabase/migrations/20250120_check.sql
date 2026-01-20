-- ============================================
-- DIAGNÓSTICO - VERIFICAR SE TABELA EXISTE
-- ============================================

-- Verificar se tabela notifications existe
SELECT to_regclass('public.notifications') AS notifications_table;

-- Se retornar NULL, a tabela não existe
-- Se retornar public.notifications, ela existe e é só cache
