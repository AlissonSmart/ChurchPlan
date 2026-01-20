-- Função RPC para criar equipes com funções
CREATE OR REPLACE FUNCTION public.create_team_with_roles(team_name TEXT, roles_array TEXT[])
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com os privilégios do criador da função
AS $$
DECLARE
    new_team_id UUID;
    new_team JSONB;
BEGIN
    -- Inserir a nova equipe
    INSERT INTO public.teams (name)
    VALUES (team_name)
    RETURNING id INTO new_team_id;
    
    -- Adicionar o usuário atual como líder da equipe
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (new_team_id, auth.uid(), 'líder');
    
    -- Adicionar funções à equipe
    IF array_length(roles_array, 1) > 0 THEN
        INSERT INTO public.team_roles (team_id, name)
        SELECT new_team_id, role_name
        FROM unnest(roles_array) AS role_name;
    END IF;
    
    -- Buscar a equipe criada
    SELECT jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'created_at', t.created_at,
        'updated_at', t.updated_at
    ) INTO new_team
    FROM public.teams t
    WHERE t.id = new_team_id;
    
    RETURN new_team;
END;
$$;
