# Correções Implementadas - Sistema de Convites

## 📋 Resumo das Mudanças

Foram implementadas as seguintes correções para o sistema de convites da plataforma ChurchPlan:

---

## 🔧 1. Corrigido Erro em HomeScreen.js (Linha 70)

**Problema:** Erro ao carregar convites quando não há notificações ou usuário não autenticado.

**Solução Implementada:**
- Adicionado tratamento melhor de erros com `authError`
- Validação de array vazio de notificações
- Verificação se notificação existe antes de filtrar
- Inicialização de `invitations` como array vazio em caso de erro

**Arquivo:** `@/Users/alissonmartins/Documents/Apps/ChurchPlan/src/screens/HomeScreen.js:43-89`

```javascript
// Antes: Erro ao acessar undefined
const notifications = await notificationService.getUserNotifications(user.id);
const eventInvitations = notifications.filter(n => n.type === 'event_invitation');

// Depois: Tratamento robusto
if (!notifications || notifications.length === 0) {
  setInvitations([]);
  return;
}
const eventInvitations = notifications.filter(n => n && n.type === 'event_invitation');
```

---

## 🔧 2. Adicionadas Funções ao EventService

**Problema:** Não havia funções para gerenciar membros da equipe do evento no banco de dados.

**Solução Implementada:**
- `addTeamMember()`: Adiciona membro à equipe do evento
- `getEventTeamMembers()`: Busca membros da equipe
- `updateTeamMemberStatus()`: Atualiza status do membro

**Arquivo:** `@/Users/alissonmartins/Documents/Apps/ChurchPlan/src/services/eventService.js:175-250`

```javascript
async addTeamMember(eventId, volunteerId, roleId, ministryId = null) {
  // Insere novo membro em event_team com status 'not_sent'
}

async getEventTeamMembers(eventId) {
  // Busca membros com dados do voluntário e função
}

async updateTeamMemberStatus(eventTeamId, status) {
  // Atualiza status: not_sent → pending → confirmed/declined
}
```

---

## 🔧 3. Corrigido Envio de Convites em EventCreationScreen

**Problema:** 
- Status em `event_team` não era atualizado quando convite era enviado
- Convite não era salvo no banco de dados
- Parâmetros incompletos na chamada

**Solução Implementada:**
- Função `sendEventInvitation()` agora atualiza status em `event_team`
- Registra `invitation_sent_at` com timestamp
- Passa `volunteerId` e `roleId` para atualizar registro correto

**Arquivo:** `@/Users/alissonmartins/Documents/Apps/ChurchPlan/src/screens/EventCreationScreen.js:287-334`

```javascript
// Antes: Apenas criava notificação
await notificationService.createEventInvitation(...);

// Depois: Cria notificação E atualiza status em event_team
const notification = await notificationService.createEventInvitation(...);

// Atualizar status em event_team
await supabase
  .from('event_team')
  .update({
    status: 'pending',
    invitation_sent_at: new Date().toISOString()
  })
  .eq('event_id', eventId)
  .eq('volunteer_id', volunteerId)
  .eq('role_id', roleId);
```

---

## 🔧 4. Implementado Sistema para Você Se Convidar

**Problema:** Não havia forma de você (admin) se convidar para o evento.

**Solução Implementada:**

### A. AddTeamMemberModal.js
- Carrega usuário autenticado atual
- Função `handleAddCurrentUser()` busca dados do voluntário
- Botão "Me Convidar para este Evento" no modal
- Estilos para o novo botão

**Arquivo:** `@/Users/alissonmartins/Documents/Apps/ChurchPlan/src/components/AddTeamMemberModal.js`

```javascript
// Novo estado
const [currentUser, setCurrentUser] = useState(null);

// Carregar usuário atual
const { data: { user: authUser } } = await supabase.auth.getUser();
setCurrentUser(authUser);

// Nova função
const handleAddCurrentUser = async () => {
  // Busca voluntário do usuário atual
  const { data: volunteerData } = await supabase
    .from('volunteers')
    .select('id, first_name, last_name, email, user_id')
    .eq('user_id', currentUser.id)
    .single();

  // Cria membro com dados do voluntário
  const member = {
    id: volunteerData.id,
    user_id: volunteerData.user_id,
    name: `${volunteerData.first_name} ${volunteerData.last_name}`,
    email: volunteerData.email,
    role: selectedRole,
    status: 'pending'
  };

  onAddMember(member);
};
```

### B. EventCreationScreen.js
- Atualizado `handleAddTeamMember()` para salvar no banco de dados
- Busca `role_id` pela função selecionada
- Chama `eventService.addTeamMember()` para salvar
- Envia convite imediatamente

**Arquivo:** `@/Users/alissonmartins/Documents/Apps/ChurchPlan/src/screens/EventCreationScreen.js:258-312`

```javascript
// Buscar role_id
const { data: roleData } = await supabase
  .from('roles')
  .select('id')
  .ilike('name', member.role)
  .single();

// Adicionar ao banco de dados
const teamMember = await eventService.addTeamMember(
  eventId,
  member.id,
  roleData.id
);

// Enviar convite
await sendEventInvitation(member.user_id, member.name, member.id, roleData.id);
```

---

## 📊 Fluxo Completo Agora Funciona Assim:

```
1. Admin cria evento
   ↓
2. Admin abre modal "Adicionar Membro"
   ↓
3. Admin clica "Me Convidar para este Evento"
   ↓
4. Sistema busca dados do admin como voluntário
   ↓
5. Membro é adicionado a event_team com status 'not_sent'
   ↓
6. Convite é criado em notifications
   ↓
7. Status em event_team é atualizado para 'pending'
   ↓
8. Admin recebe notificação de convite em HomeScreen
   ↓
9. Admin pode clicar no convite para abrir o evento
```

---

## ✅ Testes Recomendados

1. **Criar um evento novo**
   - Ir para "Novo Evento"
   - Preencher dados básicos
   - Salvar evento

2. **Se convidar para o evento**
   - Abrir aba "Equipe"
   - Clicar "Adicionar Membro"
   - Clicar "Me Convidar para este Evento"
   - Selecionar função (ex: Vocal)
   - Confirmar

3. **Verificar convite recebido**
   - Ir para HomeScreen
   - Aba "Agenda"
   - Deve aparecer "Seus Convites"
   - Seu convite deve estar listado

4. **Abrir evento do convite**
   - Clicar no convite
   - Deve abrir o evento para edição

---

## 🔍 Validações Implementadas

- ✅ Verificação de usuário autenticado
- ✅ Verificação de voluntário cadastrado
- ✅ Busca de role_id pela função selecionada
- ✅ Tratamento de erros em cada etapa
- ✅ Validação de notificações vazias
- ✅ Sincronização entre `event_team` e `notifications`

---

## 📝 Notas Importantes

1. **Você precisa estar cadastrado como voluntário** para se convidar
2. **A função selecionada deve existir no banco de dados** (Vocal, Guitarra, Teclado, etc.)
3. **O evento deve ser salvo primeiro** antes de enviar convites
4. **O status em `event_team` agora fica sincronizado** com as notificações

---

## 🚀 Próximas Melhorias (Opcional)

1. Implementar resposta de convite (aceitar/recusar)
2. Validar duplicatas (não adicionar mesmo voluntário 2x)
3. Reenvio de convites
4. Histórico de convites
5. Notificações em tempo real com WebSockets
