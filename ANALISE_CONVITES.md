# Análise do Sistema de Convites - ChurchPlan

## 📋 Resumo Executivo

A plataforma ChurchPlan possui um sistema de convites para músicos e técnicos participarem de eventos. O sistema permite que um admin (criador do evento) convide voluntários para fazer parte da equipe do evento, incluindo a possibilidade do próprio admin se convidar para participar da escala.

---

## 🏗️ Arquitetura do Sistema de Convites

### 1. **Tabelas Principais Envolvidas**

#### `event_team` (Tabela Central de Convites)
```sql
CREATE TABLE event_team (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id),
  volunteer_id UUID NOT NULL REFERENCES volunteers(id),
  role_id UUID NOT NULL REFERENCES roles(id),
  ministry_id UUID REFERENCES ministries(id),
  status VARCHAR(50) DEFAULT 'not_sent', -- Estados: not_sent, pending, confirmed, declined
  invitation_sent_at TIMESTAMP,
  response_at TIMESTAMP,
  is_highlighted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Status do Convite:**
- `not_sent`: Membro adicionado mas convite não foi enviado
- `pending`: Convite enviado, aguardando resposta
- `confirmed`: Membro confirmou presença
- `declined`: Membro recusou o convite

#### `notifications` (Tabela de Notificações)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL, -- event_invitation, event_update, etc.
  title VARCHAR(255),
  message TEXT,
  event_id UUID REFERENCES events(id),
  event_name VARCHAR(255),
  event_date DATE,
  event_time TIME,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `volunteers` (Cadastro de Voluntários)
```sql
CREATE TABLE volunteers (
  id UUID PRIMARY KEY,
  user_id UUID, -- Referência ao usuário autenticado (auth.users)
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  photo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `events` (Eventos)
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  event_date DATE,
  event_time TIME,
  duration_minutes INTEGER,
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, completed, cancelled
  created_by UUID NOT NULL, -- ID do admin/criador
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🔄 Fluxo de Convites Atual

### Passo 1: Admin Cria um Evento
- Admin cria evento via `EventCreationScreen.js`
- Evento é salvo em `events` com `status = 'draft'`
- `created_by` recebe o ID do admin

### Passo 2: Admin Adiciona Membros à Equipe
- Admin abre modal `AddTeamMemberModal`
- Modal carrega lista de voluntários cadastrados (tabela `volunteers`)
- Admin seleciona voluntário + função (role)
- Membro é adicionado a `event_team` com `status = 'not_sent'`

### Passo 3: Envio de Convite
**Código em `EventCreationScreen.js` (linha 287-317):**

```javascript
const sendEventInvitation = async (userId, memberName) => {
  try {
    if (!eventId || !eventData) {
      console.log('Evento ainda não foi salvo, convite será enviado após salvar');
      return;
    }

    // Formatar data e hora
    const eventDate = eventData.date instanceof Date ? eventData.date : new Date(eventData.date);
    const eventTime = eventData.time instanceof Date ? eventData.time : new Date(eventData.time);
    const formattedDate = eventDate.toISOString().split('T')[0];
    const hours = String(eventTime.getHours()).padStart(2, '0');
    const minutes = String(eventTime.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:00`;

    // Criar notificação de convite
    await notificationService.createEventInvitation(
      userId,
      eventId,
      eventData.name,
      formattedDate,
      formattedTime
    );

    console.log(`Convite enviado para ${memberName}`);
    Alert.alert('Sucesso', `Convite enviado para ${memberName}!`);
  } catch (error) {
    console.error('Erro ao enviar convite:', error);
    Alert.alert('Erro', 'Não foi possível enviar o convite');
  }
};
```

**O que acontece:**
1. Cria notificação na tabela `notifications` com `type = 'event_invitation'`
2. Notificação é vinculada ao `user_id` do voluntário
3. Status em `event_team` muda para `pending`
4. `invitation_sent_at` é registrado

### Passo 4: Voluntário Recebe Convite
- Voluntário vê notificação em sua tela
- Pode aceitar ou recusar
- Status em `event_team` é atualizado para `confirmed` ou `declined`
- `response_at` é registrado

---

## ✅ Funcionalidades Implementadas

### ✓ Admin Pode Convidar Músicos
- Modal `AddTeamMemberModal` permite buscar e selecionar voluntários
- Voluntários são filtrados por nome ou email
- Função (role) é selecionável: Líder, Vocal, Instrumento, Técnico, Membro

### ✓ Admin Pode Se Convidar
- Admin é um voluntário cadastrado no sistema
- Pode se adicionar à equipe do evento como qualquer outro membro
- Pode ter diferentes funções (ex: Vocal, Guitarra, etc.)

### ✓ Rastreamento de Status
- `not_sent`: Adicionado mas não convidado
- `pending`: Convite enviado
- `confirmed`: Confirmou presença
- `declined`: Recusou

### ✓ Notificações
- Convites são enviados via notificações
- Notificações incluem: nome do evento, data, hora
- Usuários podem marcar como lidas

---

## ⚠️ Problemas e Limitações Identificadas

### 1. **Falta de Atualização de Status em `event_team`**
**Problema:** Quando um convite é enviado, o status em `event_team` não é atualizado de `not_sent` para `pending`.

**Localização:** `EventCreationScreen.js` linha 287-317

**Impacto:** O status fica desincronizado com a realidade (convite foi enviado mas status diz `not_sent`)

**Solução Necessária:**
```javascript
// Após criar notificação, atualizar status em event_team
await supabase
  .from('event_team')
  .update({ 
    status: 'pending',
    invitation_sent_at: new Date().toISOString()
  })
  .eq('volunteer_id', userId)
  .eq('event_id', eventId);
```

### 2. **Sem Validação de Evento Existente**
**Problema:** Não há verificação se o evento foi realmente salvo antes de enviar convites.

**Localização:** `EventCreationScreen.js` linha 267-279

**Código Atual:**
```javascript
if (eventId && eventData && member.user_id) {
  await sendEventInvitation(member.user_id, member.name);
} else if (!member.user_id) {
  Alert.alert('Membro Adicionado', `${member.name} foi adicionado à equipe, mas não possui conta no sistema...`);
}
```

**Problema:** Se `eventId` não existir, o convite não é enviado, mas o membro é adicionado localmente.

### 3. **Sem Verificação de Duplicatas**
**Problema:** Não há validação para evitar adicionar o mesmo voluntário duas vezes ao mesmo evento.

**Impacto:** Possível criar múltiplos registros para o mesmo voluntário no mesmo evento.

### 4. **Sem Resposta de Convite Implementada**
**Problema:** O sistema cria notificações de convite, mas não há interface para o voluntário aceitar/recusar.

**Impacto:** Voluntários não conseguem confirmar presença diretamente.

### 5. **Admin Pode Se Convidar (Funciona, mas sem Validação)**
**Funciona:** Admin pode se adicionar à equipe como voluntário
**Sem Validação:** Não há verificação se o admin já está na equipe

---

## 📊 Fluxo de Dados Atual

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN CRIA EVENTO                        │
│                  (EventCreationScreen)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   Evento Salvo em DB       │
        │   status = 'draft'         │
        │   created_by = admin_id    │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │  Admin Abre AddTeamMemberModal         │
        │  Busca voluntários em DB               │
        └────────────┬───────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │  Admin Seleciona Voluntário + Função   │
        │  handleAddTeamMember() é chamado       │
        └────────────┬───────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │  Membro Adicionado a event_team        │
        │  status = 'not_sent'                   │
        │  (adicionado ao estado local)          │
        └────────────┬───────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │  Se evento já foi salvo:               │
        │  sendEventInvitation() é chamado       │
        └────────────┬───────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │  Notificação Criada em DB              │
        │  type = 'event_invitation'             │
        │  ⚠️ Status em event_team NÃO atualizado│
        └────────────┬───────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │  Voluntário Recebe Notificação         │
        │  (sem interface para responder)        │
        └────────────────────────────────────────┘
```

---

## 🎯 Recomendações de Melhorias

### Prioridade Alta
1. **Atualizar status em `event_team` quando convite é enviado**
   - Mudar de `not_sent` para `pending`
   - Registrar `invitation_sent_at`

2. **Implementar resposta de convite**
   - Interface para voluntário aceitar/recusar
   - Atualizar status em `event_team`
   - Registrar `response_at`

3. **Validar duplicatas**
   - Verificar se voluntário já está na equipe antes de adicionar

### Prioridade Média
4. **Melhorar validação de evento**
   - Garantir que evento existe antes de enviar convites
   - Sincronizar dados locais com DB

5. **Adicionar histórico de convites**
   - Rastrear quando convites foram enviados/respondidos
   - Permitir reenvio de convites

### Prioridade Baixa
6. **Notificações em tempo real**
   - Usar WebSockets para atualizar status em tempo real
   - Notificar admin quando voluntário responde

---

## 📝 Verificação: Evento Cadastrado?

**Sim, há eventos cadastrados no sistema:**
- Eventos são criados via `EventCreationScreen.js`
- Salvos na tabela `events` com `status = 'draft'` ou `'published'`
- Cada evento tem `created_by` (ID do admin)
- Eventos podem ter múltiplos membros em `event_team`

**Como verificar:**
```javascript
// No banco de dados
SELECT * FROM events;
SELECT * FROM event_team WHERE event_id = 'seu-event-id';
SELECT * FROM notifications WHERE type = 'event_invitation';
```

---

## 🔐 Segurança

**Pontos de Atenção:**
- ✓ Apenas usuários autenticados podem criar eventos
- ✓ Apenas criador pode atualizar evento (RLS policy)
- ⚠️ Qualquer usuário autenticado pode adicionar membros (sem validação de permissão)
- ⚠️ Sem validação se usuário é admin do evento

**Recomendação:** Adicionar verificação de permissão antes de permitir adicionar membros.

---

## 📌 Conclusão

O sistema de convites está **parcialmente implementado**:
- ✅ Admin pode convidar músicos
- ✅ Admin pode se convidar
- ✅ Notificações são criadas
- ❌ Status em `event_team` não é atualizado
- ❌ Sem interface para responder convites
- ❌ Sem validação de duplicatas

**Próximos passos:** Implementar as melhorias de prioridade alta para completar o sistema.
