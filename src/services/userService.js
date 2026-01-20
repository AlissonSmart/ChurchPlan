import supabase from './supabase';
import profileService from './profileService';

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
      // Usar o profileService para obter todos os perfis
      const profiles = await profileService.getAllProfiles();
      console.log(`Encontrados ${profiles.length} usuários`);
      return profiles;
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
      // Usar o profileService para obter o perfil do usuário
      return await profileService.getProfile(userId);
    } catch (error) {
      console.error('Erro inesperado ao buscar usuário por ID:', error);
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
      // Usar o profileService para buscar perfis por nome
      return await profileService.searchProfiles(searchTerm);
    } catch (error) {
      console.error('Erro inesperado ao buscar usuários por nome:', error);
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
      // Usar o profileService para criar um novo usuário e perfil
      return await profileService.createUser(userData);
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
      // Adicionar o ID do usuário aos dados do perfil
      const profileData = { ...userData, id: userId };
      
      // Usar o profileService para atualizar o perfil
      return await profileService.saveProfile(profileData);
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
