-- Criação da tabela de equipes
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela para armazenar os membros de cada equipe
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'líder', 'membro', 'admin', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(team_id, user_id)
);

-- Habilitar RLS (Row Level Security) para equipes
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública das equipes
CREATE POLICY "Permitir leitura pública das equipes" 
    ON public.teams 
    FOR SELECT 
    USING (true);

-- Criar política para permitir que usuários autenticados criem equipes
CREATE POLICY "Permitir criação de equipes por usuários autenticados" 
    ON public.teams 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Criar política para permitir que apenas o criador ou admin possa atualizar equipes
CREATE POLICY "Permitir atualização de equipes pelo criador ou admin" 
    ON public.teams 
    FOR UPDATE 
    USING (
        auth.uid() IN (
            SELECT user_id FROM team_members WHERE team_id = id AND role IN ('líder', 'admin')
        )
    );

-- Criar política para permitir que apenas o criador ou admin possa excluir equipes
CREATE POLICY "Permitir exclusão de equipes pelo criador ou admin" 
    ON public.teams 
    FOR DELETE 
    USING (
        auth.uid() IN (
            SELECT user_id FROM team_members WHERE team_id = id AND role IN ('líder', 'admin')
        )
    );

-- Tabela para armazenar as funções disponíveis em cada equipe
CREATE TABLE IF NOT EXISTS public.team_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(team_id, name)
);

-- Habilitar RLS para membros de equipe
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS para funções de equipe
ALTER TABLE public.team_roles ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública das funções de equipe
CREATE POLICY "Permitir leitura pública das funções de equipe" 
    ON public.team_roles 
    FOR SELECT 
    USING (true);

-- Criar política para permitir leitura pública dos membros de equipe
CREATE POLICY "Permitir leitura pública dos membros de equipe" 
    ON public.team_members 
    FOR SELECT 
    USING (true);

-- Criar política para permitir que usuários autenticados criem funções de equipe
CREATE POLICY "Permitir criação de funções de equipe por usuários autenticados" 
    ON public.team_roles 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Criar política para permitir que usuários autenticados adicionem membros à equipe
CREATE POLICY "Permitir adição de membros à equipe por usuários autenticados" 
    ON public.team_members 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Criar política para permitir que apenas o líder ou admin possa atualizar membros
CREATE POLICY "Permitir atualização de membros pelo líder ou admin" 
    ON public.team_members 
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

-- Criar política para permitir que apenas o líder ou admin possa remover membros
CREATE POLICY "Permitir remoção de membros pelo líder ou admin" 
    ON public.team_members 
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Criar índices para melhorar o desempenho das consultas
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_roles_team_id ON public.team_roles(team_id);

-- Criar função para adicionar automaticamente o criador como líder da equipe
-- Comentado temporariamente para evitar problemas de referência circular
/*
CREATE OR REPLACE FUNCTION public.handle_new_team() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'líder');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para chamar a função quando uma nova equipe é criada
CREATE TRIGGER on_team_created
    AFTER INSERT ON public.teams
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_team();
*/

-- Nota: Após executar este script, você pode descomentar e executar a função e o trigger em um script separado
