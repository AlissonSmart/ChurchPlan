-- Script simplificado para corrigir as permissões RLS para equipes e funções

-- Verificar se a tabela teams existe e desabilitar RLS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'teams' AND schemaname = 'public') THEN
        EXECUTE 'ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY';
        RAISE NOTICE 'RLS desabilitado para a tabela teams';
    ELSE
        RAISE NOTICE 'Tabela teams não existe!';
    END IF;
END $$;

-- Remover TODAS as políticas existentes para garantir que não haja conflitos
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'teams' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.teams', policy_record.policyname);
        RAISE NOTICE 'Política % removida da tabela teams', policy_record.policyname;
    END LOOP;
END $$;

-- Criar novas políticas permissivas se a tabela existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'teams' AND schemaname = 'public') THEN
        -- Criar novas políticas permissivas
        EXECUTE 'CREATE POLICY "teams_select_policy" ON public.teams FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "teams_insert_policy" ON public.teams FOR INSERT WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "teams_update_policy" ON public.teams FOR UPDATE USING (true)';
        EXECUTE 'CREATE POLICY "teams_delete_policy" ON public.teams FOR DELETE USING (true)';
        
        -- Habilitar RLS novamente
        EXECUTE 'ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY';
        
        RAISE NOTICE 'Políticas criadas e RLS habilitado para a tabela teams';
    ELSE
        RAISE NOTICE 'Tabela teams não existe, políticas não foram criadas';
    END IF;
END $$;

-- Verificar se a tabela team_roles existe e desabilitar RLS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'team_roles' AND schemaname = 'public') THEN
        EXECUTE 'ALTER TABLE public.team_roles DISABLE ROW LEVEL SECURITY';
        RAISE NOTICE 'RLS desabilitado para a tabela team_roles';
    ELSE
        RAISE NOTICE 'Tabela team_roles não existe!';
    END IF;
END $$;

-- Remover TODAS as políticas existentes para garantir que não haja conflitos
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'team_roles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.team_roles', policy_record.policyname);
        RAISE NOTICE 'Política % removida da tabela team_roles', policy_record.policyname;
    END LOOP;
END $$;

-- Criar novas políticas permissivas se a tabela existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'team_roles' AND schemaname = 'public') THEN
        -- Criar novas políticas permissivas
        EXECUTE 'CREATE POLICY "team_roles_select_policy" ON public.team_roles FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "team_roles_insert_policy" ON public.team_roles FOR INSERT WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "team_roles_update_policy" ON public.team_roles FOR UPDATE USING (true)';
        EXECUTE 'CREATE POLICY "team_roles_delete_policy" ON public.team_roles FOR DELETE USING (true)';
        
        -- Habilitar RLS novamente
        EXECUTE 'ALTER TABLE public.team_roles ENABLE ROW LEVEL SECURITY';
        
        RAISE NOTICE 'Políticas criadas e RLS habilitado para a tabela team_roles';
    ELSE
        RAISE NOTICE 'Tabela team_roles não existe, políticas não foram criadas';
    END IF;
END $$;

-- Verificar se as tabelas existem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'teams' AND schemaname = 'public') THEN
        RAISE NOTICE 'Tabela teams não existe!';
    ELSE
        RAISE NOTICE 'Tabela teams existe!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'team_roles' AND schemaname = 'public') THEN
        RAISE NOTICE 'Tabela team_roles não existe!';
    ELSE
        RAISE NOTICE 'Tabela team_roles existe!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'team_members' AND schemaname = 'public') THEN
        RAISE NOTICE 'Tabela team_members não existe!';
    ELSE
        RAISE NOTICE 'Tabela team_members existe!';
    END IF;
END $$;
