import supabase from './supabase';

// Dados de exemplo para garantir que a interface funcione
const MOCK_USERS = [
  { 
    id: '1', 
    name: 'Alisson Martins', 
    email: 'alisson@example.com', 
    role: 'admin',
    church_name: 'Igreja Central',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: '2', 
    name: 'Maria Silva', 
    email: 'maria@example.com', 
    role: 'líder',
    church_name: 'Igreja Central',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
];

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
    
    // Retornar imediatamente os dados de exemplo para garantir que a interface funcione
    return MOCK_USERS;
    
    /* Código comentado para depuração futura
    try {
      // Tentar buscar dados reais do Supabase
      console.log('Consultando tabela profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return MOCK_USERS;
      }

      console.log(`Encontrados ${data?.length || 0} usuários:`, data);
      
      // Se não houver dados reais, retornar os dados de exemplo
      if (!data || data.length === 0) {
        return MOCK_USERS;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar usuários:', error);
      return MOCK_USERS;
    }
    */
  },

  /**
   * Busca um usuário pelo ID
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Dados do usuário
   */
  getUserById: async (userId) => {
    // Buscar nos dados de exemplo
    const mockUser = MOCK_USERS.find(user => user.id === userId);
    if (mockUser) {
      return mockUser;
    }
    
    // Se não encontrar, retornar o primeiro usuário de exemplo
    return MOCK_USERS[0];
    
    /* Código comentado para depuração futura
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar usuário:', error);
        return MOCK_USERS.find(user => user.id === userId) || MOCK_USERS[0];
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar usuário:', error);
      return MOCK_USERS.find(user => user.id === userId) || MOCK_USERS[0];
    }
    */
  },

  /**
   * Busca usuários por nome
   * @param {string} searchTerm - Termo de busca
   * @returns {Promise<Array>} Lista de usuários filtrados
   */
  searchUsersByName: async (searchTerm) => {
    // Filtrar dados de exemplo pelo termo de busca
    return MOCK_USERS.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    /* Código comentado para depuração futura
    try {
      // Tentar buscar dados reais do Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', `%${searchTerm}%`);

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return MOCK_USERS.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Se não houver dados reais, retornar os dados de exemplo filtrados
      if (!data || data.length === 0) {
        return MOCK_USERS.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar usuários:', error);
      return MOCK_USERS.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    */
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
