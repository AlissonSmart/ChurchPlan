-- Script para desabilitar completamente o RLS para testes
-- ATENÇÃO: Use apenas em ambiente de desenvolvimento!

-- Desabilitar RLS para todas as tabelas relevantes
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_roles DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Permitir leitura pública das equipes" ON public.teams;
DROP POLICY IF EXISTS "Permitir criação de equipes por usuários autenticados" ON public.teams;
DROP POLICY IF EXISTS "Permitir atualização de equipes pelo criador ou admin" ON public.teams;
DROP POLICY IF EXISTS "Permitir exclusão de equipes pelo criador ou admin" ON public.teams;
DROP POLICY IF EXISTS "Permitir atualização de equipes por usuários autenticados" ON public.teams;
DROP POLICY IF EXISTS "Permitir exclusão de equipes por usuários autenticados" ON public.teams;
DROP POLICY IF EXISTS "Permitir criação de equipes por qualquer pessoa" ON public.teams;
DROP POLICY IF EXISTS "Permitir atualização de equipes por qualquer pessoa" ON public.teams;
DROP POLICY IF EXISTS "Permitir exclusão de equipes por qualquer pessoa" ON public.teams;

DROP POLICY IF EXISTS "Permitir leitura pública dos membros de equipe" ON public.team_members;
DROP POLICY IF EXISTS "Permitir adição de membros à equipe por usuários autenticados" ON public.team_members;
DROP POLICY IF EXISTS "Permitir atualização de membros pelo líder ou admin" ON public.team_members;
DROP POLICY IF EXISTS "Permitir remoção de membros pelo líder ou admin" ON public.team_members;
DROP POLICY IF EXISTS "Permitir adição de membros à equipe por qualquer pessoa" ON public.team_members;

DROP POLICY IF EXISTS "Permitir leitura pública das funções de equipe" ON public.team_roles;
DROP POLICY IF EXISTS "Permitir criação de funções de equipe por usuários autenticados" ON public.team_roles;
DROP POLICY IF EXISTS "Permitir criação de funções de equipe por qualquer pessoa" ON public.team_roles;

-- Conceder permissões completas ao usuário anônimo para testes
GRANT ALL PRIVILEGES ON TABLE public.teams TO anon;
GRANT ALL PRIVILEGES ON TABLE public.team_members TO anon;
GRANT ALL PRIVILEGES ON TABLE public.team_roles TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Conceder permissões completas ao usuário autenticado
GRANT ALL PRIVILEGES ON TABLE public.teams TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.team_members TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.team_roles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Conceder permissões completas ao usuário de serviço
GRANT ALL PRIVILEGES ON TABLE public.teams TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.team_members TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.team_roles TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
