-- Este SQL deve ser executado no SQL Editor do Supabase
-- Ele marca o e-mail do usuário como confirmado

-- Atualiza o usuário para marcar o e-mail como confirmado
UPDATE auth.users
SET email_confirmed_at = NOW(),
    is_sso_user = FALSE,
    confirmed_at = NOW()
WHERE email = 'eualissonmartins@gmail.com';

-- Verifica se a atualização foi bem-sucedida
SELECT id, email, email_confirmed_at, confirmed_at
FROM auth.users
WHERE email = 'eualissonmartins@gmail.com';
