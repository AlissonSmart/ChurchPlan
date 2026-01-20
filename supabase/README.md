# Configuração do Supabase para ChurchPlan

Este diretório contém as migrações e configurações necessárias para o Supabase.

## Configuração Inicial

1. Crie uma conta no [Supabase](https://supabase.com) se ainda não tiver uma
2. Crie um novo projeto no Supabase
3. Anote a URL e a chave anônima do seu projeto (você precisará delas para configurar o aplicativo)

## Executando as Migrações

Você pode executar as migrações diretamente no SQL Editor do Supabase:

1. Acesse o painel do Supabase e vá para SQL Editor
2. Crie uma nova consulta
3. Cole o conteúdo do arquivo `migrations/20251117_create_users_table.sql`
4. Execute a consulta

## Configurando o Aplicativo

1. Abra o arquivo `src/services/supabase.js`
2. Substitua as constantes `SUPABASE_URL` e `SUPABASE_ANON_KEY` pelos valores do seu projeto:

```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon';
```

## Configuração de Autenticação

Por padrão, o Supabase já vem configurado com autenticação por email/senha. Para habilitar outros métodos:

1. Vá para Authentication > Providers no painel do Supabase
2. Configure os provedores desejados (Google, Apple, etc.)

## Configuração de Email

Para que o fluxo de redefinição de senha funcione corretamente:

1. Vá para Authentication > Email Templates
2. Personalize os templates de email conforme necessário
3. Configure um provedor de email em Authentication > Email Settings

## Segurança

O Row Level Security (RLS) já está configurado nas migrações para garantir que os usuários só possam acessar seus próprios dados.

## Tabelas Criadas

- `profiles`: Armazena informações de perfil dos usuários
- `user_settings`: Armazena configurações dos usuários

## Triggers e Funções

- `handle_new_user()`: Cria automaticamente um perfil quando um novo usuário se registra
- `handle_new_profile()`: Cria automaticamente configurações quando um novo perfil é criado
