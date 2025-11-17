import AsyncStorage from '@react-native-async-storage/async-storage';

// Chaves para armazenamento local
const STORAGE_KEYS = {
  LAST_EMAIL: '@ChurchPlan:lastEmail',
};

/**
 * Funções de utilidade para armazenamento local
 */
const storage = {
  /**
   * Salva o último email utilizado
   * @param {string} email - Email do usuário
   * @returns {Promise<void>}
   */
  saveLastEmail: async (email) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_EMAIL, email);
    } catch (error) {
      console.error('Erro ao salvar email:', error);
    }
  },

  /**
   * Recupera o último email utilizado
   * @returns {Promise<string|null>} - Email salvo ou null se não existir
   */
  getLastEmail: async () => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_EMAIL);
    } catch (error) {
      console.error('Erro ao recuperar email:', error);
      return null;
    }
  },
};

export default storage;
