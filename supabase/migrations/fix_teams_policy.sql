-- Script para corrigir as políticas de segurança da tabela teams

-- Remover as políticas existentes que estão causando problemas
DROP POLICY IF EXISTS "Permitir atualização de equipes pelo criador ou admin" ON public.teams;
DROP POLICY IF EXISTS "Permitir exclusão de equipes pelo criador ou admin" ON public.teams;

-- Criar novas políticas simplificadas
-- Política para permitir que usuários autenticados atualizem equipes
CREATE POLICY "Permitir atualização de equipes por usuários autenticados" 
    ON public.teams 
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

-- Política para permitir que usuários autenticados excluam equipes
CREATE POLICY "Permitir exclusão de equipes por usuários autenticados" 
    ON public.teams 
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Verificar se o trigger já existe e removê-lo se necessário
DROP TRIGGER IF EXISTS on_team_created ON public.teams;

-- Recriar a função para adicionar o criador como líder da equipe
CREATE OR REPLACE FUNCTION public.handle_new_team() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'líder');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger novamente
CREATE TRIGGER on_team_created
    AFTER INSERT ON public.teams
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_team();
