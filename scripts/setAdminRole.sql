-- Este SQL deve ser executado no SQL Editor do Supabase
-- Ele define a role do usuário como 'admin'

-- Atualiza o usuário para definir a role como 'admin' nos metadados
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb,
    raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'eualissonmartins@gmail.com';

-- Verifica se a atualização foi bem-sucedida
SELECT id, email, raw_app_meta_data, raw_user_meta_data
FROM auth.users
WHERE email = 'eualissonmartins@gmail.com';
