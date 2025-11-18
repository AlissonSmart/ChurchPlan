-- Script para corrigir as políticas de segurança da tabela teams para o modo de teste

-- Remover todas as políticas existentes que possam estar causando problemas
DROP POLICY IF EXISTS "Permitir criação de equipes por usuários autenticados" ON public.teams;
DROP POLICY IF EXISTS "Permitir atualização de equipes por usuários autenticados" ON public.teams;
DROP POLICY IF EXISTS "Permitir exclusão de equipes por usuários autenticados" ON public.teams;
DROP POLICY IF EXISTS "Permitir criação de equipes por qualquer pessoa" ON public.teams;
DROP POLICY IF EXISTS "Permitir atualização de equipes por qualquer pessoa" ON public.teams;
DROP POLICY IF EXISTS "Permitir exclusão de equipes por qualquer pessoa" ON public.teams;

-- Verificar se as políticas já existem antes de criá-las
DO $$
BEGIN
    -- Política para permitir que QUALQUER PESSOA crie equipes (para funcionar no modo de teste)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teams' AND policyname = 'Permitir criação de equipes por qualquer pessoa') THEN
        EXECUTE 'CREATE POLICY "Permitir criação de equipes por qualquer pessoa" ON public.teams FOR INSERT WITH CHECK (true)';
    END IF;
    
    -- Política para permitir que qualquer pessoa atualize equipes (para modo de teste)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teams' AND policyname = 'Permitir atualização de equipes por qualquer pessoa') THEN
        EXECUTE 'CREATE POLICY "Permitir atualização de equipes por qualquer pessoa" ON public.teams FOR UPDATE USING (true)';
    END IF;
    
    -- Política para permitir que qualquer pessoa exclua equipes (para modo de teste)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teams' AND policyname = 'Permitir exclusão de equipes por qualquer pessoa') THEN
        EXECUTE 'CREATE POLICY "Permitir exclusão de equipes por qualquer pessoa" ON public.teams FOR DELETE USING (true)';
    END IF;
END;
$$;

-- Remover políticas existentes para team_members
DROP POLICY IF EXISTS "Permitir adição de membros à equipe por usuários autenticados" ON public.team_members;
DROP POLICY IF EXISTS "Permitir adição de membros à equipe por qualquer pessoa" ON public.team_members;

-- Verificar se a política já existe antes de criá-la
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Permitir adição de membros à equipe por qualquer pessoa') THEN
        EXECUTE 'CREATE POLICY "Permitir adição de membros à equipe por qualquer pessoa" ON public.team_members FOR INSERT WITH CHECK (true)';
    END IF;
END;
$$;

-- Remover políticas existentes para team_roles
DROP POLICY IF EXISTS "Permitir criação de funções de equipe por usuários autenticados" ON public.team_roles;
DROP POLICY IF EXISTS "Permitir criação de funções de equipe por qualquer pessoa" ON public.team_roles;

-- Verificar se a política já existe antes de criá-la
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_roles' AND policyname = 'Permitir criação de funções de equipe por qualquer pessoa') THEN
        EXECUTE 'CREATE POLICY "Permitir criação de funções de equipe por qualquer pessoa" ON public.team_roles FOR INSERT WITH CHECK (true)';
    END IF;
END;
$$;

-- Nota: Estas políticas são muito permissivas e devem ser usadas apenas em ambiente de desenvolvimento/teste
-- Em produção, você deve usar políticas mais restritivas
