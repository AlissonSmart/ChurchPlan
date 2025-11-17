import supabase from './supabase';

/**
 * Serviço para gerenciar usuários no Supabase
 */
const userService = {
  /**
   * Busca todos os usuários
   * @returns {Promise<Array>} Lista de usuários
   */
  getAllUsers: async () => {
    console.log('Iniciando getAllUsers');
    
    try {
      // Buscar dados reais do Supabase
      console.log('Consultando tabela profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
      }

      console.log(`Encontrados ${data?.length || 0} usuários:`, data);
      
      // Retornar array vazio se não houver dados
      if (!data || data.length === 0) {
        return [];
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar usuários:', error);
      throw error;
    }
  },

  /**
   * Busca um usuário pelo ID
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Dados do usuário
   */
  getUserById: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar usuário:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Usuário não encontrado');
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar usuário:', error);
      throw error;
    }
  },

  /**
   * Busca usuários por nome
   * @param {string} searchTerm - Termo de busca
   * @returns {Promise<Array>} Lista de usuários filtrados
   */
  searchUsersByName: async (searchTerm) => {
    try {
      // Buscar dados reais do Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', `%${searchTerm}%`);

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
      }

      // Se não houver dados, retornar array vazio
      if (!data || data.length === 0) {
        return [];
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar usuários:', error);
      throw error;
    }
  },

  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Usuário criado
   */
  createUser: async (userData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([userData])
        .select();

      if (error) {
        console.error('Erro ao criar usuário:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Erro inesperado ao criar usuário:', error);
      throw error;
    }
  },

  /**
   * Atualiza um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Usuário atualizado
   */
  updateUser: async (userId, userData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Erro ao atualizar usuário:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Erro inesperado ao atualizar usuário:', error);
      throw error;
    }
  },

  /**
   * Remove um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<boolean>} True se removido com sucesso
   */
  deleteUser: async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Erro ao remover usuário:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao remover usuário:', error);
      throw error;
    }
  }
};

export default userService;
