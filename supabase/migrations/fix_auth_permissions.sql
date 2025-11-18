-- Script para corrigir permissões de autenticação após perda do usuário primário

-- Verificar se a tabela profiles existe e desabilitar RLS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND schemaname = 'public') THEN
        EXECUTE 'ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY';
        RAISE NOTICE 'RLS desabilitado para a tabela profiles';
    ELSE
        RAISE NOTICE 'Tabela profiles não existe!';
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
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
        RAISE NOTICE 'Política % removida da tabela profiles', policy_record.policyname;
    END LOOP;
END $$;

-- Criar novas políticas permissivas para profiles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND schemaname = 'public') THEN
        -- Criar novas políticas permissivas
        EXECUTE 'CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE USING (true)';
        EXECUTE 'CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE USING (true)';
        
        -- Habilitar RLS novamente
        EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';
        
        RAISE NOTICE 'Políticas criadas e RLS habilitado para a tabela profiles';
    ELSE
        RAISE NOTICE 'Tabela profiles não existe, políticas não foram criadas';
    END IF;
END $$;

-- Verificar se a tabela team_members existe e desabilitar RLS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'team_members' AND schemaname = 'public') THEN
        EXECUTE 'ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY';
        RAISE NOTICE 'RLS desabilitado para a tabela team_members';
    ELSE
        RAISE NOTICE 'Tabela team_members não existe!';
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
        WHERE tablename = 'team_members' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.team_members', policy_record.policyname);
        RAISE NOTICE 'Política % removida da tabela team_members', policy_record.policyname;
    END LOOP;
END $$;

-- Criar novas políticas permissivas para team_members
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'team_members' AND schemaname = 'public') THEN
        -- Criar novas políticas permissivas
        EXECUTE 'CREATE POLICY "team_members_select_policy" ON public.team_members FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "team_members_insert_policy" ON public.team_members FOR INSERT WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "team_members_update_policy" ON public.team_members FOR UPDATE USING (true)';
        EXECUTE 'CREATE POLICY "team_members_delete_policy" ON public.team_members FOR DELETE USING (true)';
        
        -- Habilitar RLS novamente
        EXECUTE 'ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY';
        
        RAISE NOTICE 'Políticas criadas e RLS habilitado para a tabela team_members';
    ELSE
        RAISE NOTICE 'Tabela team_members não existe, políticas não foram criadas';
    END IF;
END $$;

-- Verificar se a tabela auth.users existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND schemaname = 'auth') THEN
        RAISE NOTICE 'Tabela auth.users existe!';
    ELSE
        RAISE NOTICE 'Tabela auth.users não existe!';
    END IF;
END $$;
