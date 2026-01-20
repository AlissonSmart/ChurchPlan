# Setup do Banco de Dados - ChurchPlan

## ⚠️ Problema Atual

A tabela `notifications` (e outras tabelas necessárias) não existem no banco de dados Supabase.

**Erro:**
```
Could not find the table 'public.notifications' in the schema cache
```

---

## ✅ Solução

Você precisa executar o script SQL no Supabase para criar todas as tabelas necessárias.

### Passo 1: Acessar o Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto ChurchPlan

### Passo 2: Abrir o SQL Editor

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New Query"**

### Passo 3: Copiar e Executar o Script

1. Abra o arquivo: `/Users/alissonmartins/Documents/Apps/ChurchPlan/supabase/migrations/20250120_create_notifications_and_events.sql`
2. Copie TODO o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (ou pressione `Ctrl+Enter`)

### Passo 4: Verificar se Funcionou

Após executar, você deve ver:
- ✅ Sem erros
- ✅ Mensagens de sucesso para cada tabela criada

Se houver erros, verifique:
- Se as tabelas já existem (pode ser necessário usar `DROP TABLE IF EXISTS`)
- Se você tem permissões para criar tabelas
- Se a sintaxe SQL está correta

---

## 📋 Tabelas Criadas

O script cria as seguintes tabelas:

1. **notifications** - Notificações de convites
2. **events** - Eventos principais
3. **ministries** - Ministérios da igreja
4. **roles** - Funções/cargos (Vocal, Guitarra, etc.)
5. **volunteers** - Cadastro de voluntários
6. **event_team** - Equipe escalada para cada evento
7. **event_steps** - Etapas do evento
8. **step_items** - Itens das etapas
9. **songs** - Biblioteca de músicas
10. **event_songs** - Músicas do evento
11. **extra_schedules** - Horários extras
12. **volunteer_roles** - Funções dos voluntários
13. **volunteer_unavailability** - Indisponibilidade dos voluntários
14. **step_item_participants** - Participantes dos itens
15. **event_templates** - Templates de eventos

---

## 🔑 Dados Iniciais Inseridos

O script também insere dados padrão:

### Ministérios
- Ministério de Louvor
- Equipe Técnica
- Equipe de Apoio

### Funções (Roles)
- Vocal
- Violão
- Guitarra
- Baixo
- Bateria
- Teclado
- Piano
- Som
- Vídeo
- Iluminação
- Projeção

---

## 🔒 Segurança (RLS - Row Level Security)

O script também configura políticas de segurança:

- ✅ Usuários só podem ver suas próprias notificações
- ✅ Apenas usuários autenticados podem criar eventos
- ✅ Apenas criador pode atualizar seu evento
- ✅ Voluntários só podem ser lidos por usuários autenticados

---

## 🧪 Teste Após Criar as Tabelas

Após executar o script, teste:

1. **Criar um evento**
   - Abra o app
   - Vá para "Novo Evento"
   - Preencha os dados
   - Clique "Salvar"

2. **Se convidar para o evento**
   - Abra aba "Equipe"
   - Clique "Adicionar Membro"
   - Clique "Me Convidar para este Evento"
   - Selecione uma função
   - Confirme

3. **Verificar convite em HomeScreen**
   - Volte para HomeScreen
   - Aba "Agenda"
   - Deve aparecer seu convite em "Seus Convites"

---

## ❌ Se Houver Erro: "Table already exists"

Se receber erro de que a tabela já existe, você pode:

### Opção 1: Usar DROP TABLE IF EXISTS (Cuidado!)
```sql
-- Isso vai DELETAR todas as tabelas e dados!
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
-- ... etc
```

### Opção 2: Verificar Tabelas Existentes
No Supabase, vá para:
- **Database** → **Tables**
- Veja quais tabelas já existem
- Execute apenas as partes do script para tabelas que não existem

---

## 📞 Suporte

Se tiver problemas:

1. Verifique se está conectado ao projeto correto no Supabase
2. Verifique se tem permissões de admin
3. Verifique a sintaxe SQL
4. Tente executar uma tabela por vez
5. Verifique os logs de erro no Supabase

---

## 🚀 Próximos Passos

Após criar as tabelas:

1. ✅ Teste o sistema de convites
2. ✅ Crie um evento de teste
3. ✅ Se convide para o evento
4. ✅ Verifique se recebe a notificação
5. ✅ Clique no convite para abrir o evento

Tudo deve funcionar agora! 🎉
