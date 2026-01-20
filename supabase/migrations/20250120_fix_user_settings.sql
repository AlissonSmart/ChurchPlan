-- ============================================
-- FIX: ADICIONAR user_id EM user_settings
-- ============================================

-- Adicionar coluna user_id se não existir
ALTER TABLE IF EXISTS public.user_settings
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id
ON public.user_settings(user_id);

-- Preencher user_id com id (se user_settings usa id como FK do usuário)
UPDATE public.user_settings
SET user_id = id
WHERE user_id IS NULL;
