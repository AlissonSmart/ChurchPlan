-- Script para corrigir as políticas de acesso à tabela profiles

-- Remover políticas existentes que possam estar causando problemas
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seus próprios perfis" ON public.profiles;

-- Criar política simples para permitir acesso de leitura a todos os perfis
CREATE POLICY "allow_public_read" 
    ON public.profiles 
    FOR SELECT 
    USING (true);

-- Criar política para que usuários só possam editar seus próprios perfis
CREATE POLICY "allow_own_update" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);

-- Verificar se as políticas foram criadas corretamente
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'profiles';
