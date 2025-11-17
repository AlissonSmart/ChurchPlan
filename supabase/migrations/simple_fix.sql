-- Remover todas as políticas existentes na tabela profiles
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "public_read_access" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own" ON public.profiles;
DROP POLICY IF EXISTS "allow_public_read" ON public.profiles;
DROP POLICY IF EXISTS "allow_own_update" ON public.profiles;

-- Criar política simples para permitir acesso de leitura a todos
CREATE POLICY "allow_read" ON public.profiles FOR SELECT USING (true);
