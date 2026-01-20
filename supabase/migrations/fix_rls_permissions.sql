-- Script para corrigir as permissões RLS para perfis

-- Desabilitar temporariamente RLS para profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir acesso público aos perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permitir atualização do próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Permitir inserção de perfil pelo próprio usuário" ON public.profiles;
DROP POLICY IF EXISTS "Permitir acesso a todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permitir atualização de qualquer perfil" ON public.profiles;
DROP POLICY IF EXISTS "Permitir inserção de qualquer perfil" ON public.profiles;
DROP POLICY IF EXISTS "Permitir exclusão de qualquer perfil" ON public.profiles;

-- Criar políticas mais permissivas
-- Política para permitir SELECT para todos
CREATE POLICY "Permitir acesso a todos os perfis"
    ON public.profiles
    FOR SELECT
    USING (true);

-- Política para permitir UPDATE para todos
CREATE POLICY "Permitir atualização de qualquer perfil"
    ON public.profiles
    FOR UPDATE
    USING (true);

-- Política para permitir INSERT para todos
CREATE POLICY "Permitir inserção de qualquer perfil"
    ON public.profiles
    FOR INSERT
    WITH CHECK (true);

-- Política para permitir DELETE para todos
CREATE POLICY "Permitir exclusão de qualquer perfil"
    ON public.profiles
    FOR DELETE
    USING (true);

-- Habilitar RLS novamente
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Fazer o mesmo para team_members
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir acesso público aos membros de equipe" ON public.team_members;
DROP POLICY IF EXISTS "Permitir atualização dos próprios membros" ON public.team_members;
DROP POLICY IF EXISTS "Permitir inserção de membros pelo próprio usuário" ON public.team_members;
DROP POLICY IF EXISTS "Permitir acesso a todos os membros" ON public.team_members;
DROP POLICY IF EXISTS "Permitir atualização de qualquer membro" ON public.team_members;
DROP POLICY IF EXISTS "Permitir inserção de qualquer membro" ON public.team_members;
DROP POLICY IF EXISTS "Permitir exclusão de qualquer membro" ON public.team_members;

-- Criar políticas mais permissivas
-- Política para permitir SELECT para todos
CREATE POLICY "Permitir acesso a todos os membros"
    ON public.team_members
    FOR SELECT
    USING (true);

-- Política para permitir UPDATE para todos
CREATE POLICY "Permitir atualização de qualquer membro"
    ON public.team_members
    FOR UPDATE
    USING (true);

-- Política para permitir INSERT para todos
CREATE POLICY "Permitir inserção de qualquer membro"
    ON public.team_members
    FOR INSERT
    WITH CHECK (true);

-- Política para permitir DELETE para todos
CREATE POLICY "Permitir exclusão de qualquer membro"
    ON public.team_members
    FOR DELETE
    USING (true);

-- Habilitar RLS novamente
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Verificar se a tabela de perfis existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND schemaname = 'public') THEN
        RAISE NOTICE 'Tabela profiles não existe!';
    ELSE
        RAISE NOTICE 'Tabela profiles existe!';
    END IF;
END $$;

-- Verificar se a tabela de membros de equipe existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'team_members' AND schemaname = 'public') THEN
        RAISE NOTICE 'Tabela team_members não existe!';
    ELSE
        RAISE NOTICE 'Tabela team_members existe!';
    END IF;
END $$;
