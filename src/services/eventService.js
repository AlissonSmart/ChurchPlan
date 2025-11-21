import supabase from './supabase';

/**
 * Serviço para gerenciar eventos no Supabase
 */
const eventService = {
  /**
   * Buscar todos os eventos
   * @returns {Promise<Array>} Lista de eventos
   */
  async getAllEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_team:event_team(count),
          event_songs:event_songs(count)
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      throw error;
    }
  },

  /**
   * Buscar evento por ID
   * @param {string} eventId - ID do evento
   * @returns {Promise<Object>} Dados do evento
   */
  async getEventById(eventId) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_steps:event_steps(*,
            step_items:step_items(*)
          ),
          event_team:event_team(*,
            volunteer:volunteers(*),
            role:roles(*)
          ),
          event_songs:event_songs(*,
            song:songs(*)
          ),
          extra_schedules:extra_schedules(*)
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      throw error;
    }
  },

  /**
   * Criar novo evento
   * @param {Object} eventData - Dados do evento
   * @returns {Promise<Object>} Evento criado
   */
  async createEvent(eventData) {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.event_date,
          event_time: eventData.event_time,
          duration_minutes: eventData.duration_minutes,
          location: eventData.location,
          template_id: eventData.template_id,
          status: eventData.status || 'draft',
          created_by: eventData.created_by
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  },

  /**
   * Atualizar evento
   * @param {string} eventId - ID do evento
   * @param {Object} eventData - Dados a atualizar
   * @returns {Promise<Object>} Evento atualizado
   */
  async updateEvent(eventId, eventData) {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  },

  /**
   * Deletar evento
   * @param {string} eventId - ID do evento
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async deleteEvent(eventId) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw error;
    }
  },

  /**
   * Formatar evento para exibição
   * @param {Object} event - Evento do banco
   * @returns {Object} Evento formatado
   */
  formatEventForDisplay(event) {
    const eventDate = new Date(event.event_date);
    const daysOfWeek = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];
    
    return {
      id: event.id,
      name: event.title,
      date: eventDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      dayOfWeek: daysOfWeek[eventDate.getDay()],
      time: event.event_time ? event.event_time.substring(0, 5) : '',
      status: this.getStatusLabel(event.status),
      songsCount: event.event_songs?.[0]?.count || 0,
      membersCount: event.event_team?.[0]?.count || 0,
      rawData: event
    };
  },

  /**
   * Obter label do status
   * @param {string} status - Status do evento
   * @returns {string} Label do status
   */
  getStatusLabel(status) {
    const statusLabels = {
      draft: 'Rascunho',
      published: 'Planejado',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return statusLabels[status] || status;
  }
};

export default eventService;
