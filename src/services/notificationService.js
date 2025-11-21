import supabase from './supabase';

/**
 * Serviço para gerenciar notificações
 */
const notificationService = {
  /**
   * Criar uma nova notificação
   */
  async createNotification(notificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  },

  /**
   * Criar notificação de convite para evento
   */
  async createEventInvitation(userId, eventId, eventName, eventDate, eventTime) {
    try {
      const notification = {
        user_id: userId,
        type: 'event_invitation',
        title: 'Novo Convite de Evento',
        message: `Você foi convidado para o evento "${eventName}"`,
        event_id: eventId,
        event_name: eventName,
        event_date: eventDate,
        event_time: eventTime,
        is_read: false,
        action_url: `/events/${eventId}`
      };

      return await this.createNotification(notification);
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      throw error;
    }
  },

  /**
   * Buscar todas as notificações de um usuário
   */
  async getUserNotifications(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
    }
  },

  /**
   * Buscar notificações não lidas de um usuário
   */
  async getUnreadNotifications(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar notificações não lidas:', error);
      throw error;
    }
  },

  /**
   * Contar notificações não lidas
   */
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      return 0;
    }
  },

  /**
   * Marcar notificação como lida
   */
  async markAsRead(notificationId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  },

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      throw error;
    }
  },

  /**
   * Deletar uma notificação
   */
  async deleteNotification(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      throw error;
    }
  },

  /**
   * Formatar notificação para exibição
   */
  formatNotificationForDisplay(notification) {
    const date = new Date(notification.created_at);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timeAgo;
    if (diffMins < 1) {
      timeAgo = 'Agora';
    } else if (diffMins < 60) {
      timeAgo = `${diffMins}m atrás`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours}h atrás`;
    } else if (diffDays < 7) {
      timeAgo = `${diffDays}d atrás`;
    } else {
      timeAgo = date.toLocaleDateString('pt-BR');
    }

    return {
      ...notification,
      timeAgo,
      formattedDate: date.toLocaleDateString('pt-BR'),
      formattedTime: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  }
};

export default notificationService;
