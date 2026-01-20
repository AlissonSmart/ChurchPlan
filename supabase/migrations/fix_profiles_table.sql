-- Script corrigido para atualizar a tabela de perfis para suportar o modal de Adicionar Pessoa
-- Versão corrigida sem usar a palavra reservada "position"

-- Verificar se a tabela profiles existe, se não, criar
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT,
    email TEXT,
    phone TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas que podem estar faltando
DO $$
BEGIN
    -- Adicionar coluna name se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'name') THEN
        ALTER TABLE public.profiles ADD COLUMN name TEXT;
    END IF;

    -- Adicionar coluna email se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;

    -- Adicionar coluna phone se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;

    -- Adicionar coluna is_admin se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Garantir que temos as políticas de segurança adequadas
DROP POLICY IF EXISTS "Permitir acesso público aos perfis" ON public.profiles;
CREATE POLICY "Permitir acesso público aos perfis"
    ON public.profiles
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Permitir atualização do próprio perfil" ON public.profiles;
CREATE POLICY "Permitir atualização do próprio perfil"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Permitir inserção de perfil pelo próprio usuário" ON public.profiles;
CREATE POLICY "Permitir inserção de perfil pelo próprio usuário"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar uma função para adicionar usuário a uma equipe com um papel específico
CREATE OR REPLACE FUNCTION public.add_user_to_team(
    user_id UUID,
    team_id UUID,
    user_role TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Verificar se o usuário já está na equipe
    IF NOT EXISTS (
        SELECT 1 FROM public.team_members
        WHERE user_id = $1 AND team_id = $2
    ) THEN
        -- Adicionar o usuário à equipe com o papel especificado
        INSERT INTO public.team_members (user_id, team_id, role)
        VALUES ($1, $2, $3);
    ELSE
        -- Atualizar o papel do usuário na equipe
        UPDATE public.team_members
        SET role = $3
        WHERE user_id = $1 AND team_id = $2;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar uma função para remover usuário de uma equipe
CREATE OR REPLACE FUNCTION public.remove_user_from_team(
    user_id UUID,
    team_id UUID
)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.team_members
    WHERE user_id = $1 AND team_id = $2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
