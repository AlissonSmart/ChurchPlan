-- Este script deve ser executado após a criação das tabelas de equipes

-- Criar função para adicionar automaticamente o criador como líder da equipe
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
