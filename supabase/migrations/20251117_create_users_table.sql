-- Criação da tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    church_name TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar política para que usuários só possam ver e editar seus próprios perfis
CREATE POLICY "Usuários podem ver apenas seus próprios perfis" 
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios perfis" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);

-- Função para criar automaticamente um perfil quando um novo usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email)
    VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para chamar a função quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tabela para armazenar configurações do usuário
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    theme TEXT DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habilitar RLS para configurações
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Criar política para que usuários só possam ver e editar suas próprias configurações
CREATE POLICY "Usuários podem ver apenas suas próprias configurações" 
    ON public.user_settings 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias configurações" 
    ON public.user_settings 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Função para criar automaticamente configurações quando um novo perfil é criado
CREATE OR REPLACE FUNCTION public.handle_new_profile() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_settings (user_id)
    VALUES (new.id);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para chamar a função quando um novo perfil é criado
CREATE TRIGGER on_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();
