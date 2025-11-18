-- Script para verificar a estrutura da tabela de perfis
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'profiles';

-- Verificar se temos tabelas relacionadas a membros de equipe
SELECT 
    table_name
FROM 
    information_schema.tables
WHERE 
    table_name LIKE '%profile%' OR
    table_name LIKE '%member%' OR
    table_name LIKE '%user%';
