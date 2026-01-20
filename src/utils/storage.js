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
      if (!email) {
        console.warn('Tentativa de salvar email vazio');
        return;
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_EMAIL, email);
      console.log(`Email '${email}' salvo com sucesso no AsyncStorage`);
      
      // Verificar se o email foi salvo corretamente
      const savedEmail = await AsyncStorage.getItem(STORAGE_KEYS.LAST_EMAIL);
      if (savedEmail !== email) {
        console.warn(`Verificação de email falhou: salvo='${savedEmail}', esperado='${email}'`);
      }
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
      const email = await AsyncStorage.getItem(STORAGE_KEYS.LAST_EMAIL);
      console.log(`Email recuperado do AsyncStorage: '${email}'`);
      return email;
    } catch (error) {
      console.error('Erro ao recuperar email:', error);
      return null;
    }
  },
};

export default storage;
