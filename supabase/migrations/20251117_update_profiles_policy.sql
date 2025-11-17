-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios perfis" ON public.profiles;

-- Criar política para permitir acesso de leitura a todos os perfis
CREATE POLICY "public_read_access" 
    ON public.profiles 
    FOR SELECT 
    USING (true);

-- Manter política para que usuários só possam editar seus próprios perfis
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seus próprios perfis" ON public.profiles;
CREATE POLICY "users_update_own" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);
