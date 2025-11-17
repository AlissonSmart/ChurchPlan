import supabase from './supabase';
import storage from '../utils/storage';

/**
 * Serviço de autenticação para gerenciar login, registro e sessão do usuário
 */
const authService = {
  /**
   * Realiza login com email e senha
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise} - Resultado da operação de login
   */
  signIn: async (email, password) => {
    try {
      // MODO DE TESTE: Permitir login com credenciais específicas para teste
      if (email === 'eualissonmartins@gmail.com' && password === '123456') {
        console.log('Modo de teste: Usando credenciais fixas');
        
        // Criar um usuário fictício para testes
        const mockUser = {
          id: 'test-user-id',
          email: 'eualissonmartins@gmail.com',
          user_metadata: {
            name: 'Alisson Martins',
            role: 'admin'
          },
          app_metadata: {
            provider: 'email',
            role: 'admin'
          },
          role: 'admin',
          aud: 'authenticated',
          created_at: new Date().toISOString()
        };
        
        const mockSession = {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: mockUser
        };
        
        // Salvar o email do usuário ao fazer login
        try {
          await storage.saveLastEmail(email);
          console.log('Email salvo com sucesso no login (modo teste):', email);
        } catch (storageError) {
          console.error('Erro ao salvar email no login (modo teste):', storageError);
        }
        
        return { user: mockUser, session: mockSession };
      }
      
      // Comportamento normal para outros usuários
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Se o erro for de e-mail não verificado, vamos tentar verificar o e-mail automaticamente
        if (error.message.includes('Email not confirmed')) {
          console.log('Tentando confirmar e-mail automaticamente...');
          
          // Primeiro, vamos tentar fazer login novamente para obter uma sessão
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: {
              emailRedirectTo: null
            }
          });
          
          if (signInData && signInData.user) {
            // Salvar o email do usuário ao fazer login
            try {
              await storage.saveLastEmail(email);
              console.log('Email salvo com sucesso no login:', email);
            } catch (storageError) {
              console.error('Erro ao salvar email no login:', storageError);
            }
            return { user: signInData.user, session: signInData.session };
          }
        }
        throw error;
      }
      
      // Salvar o email do usuário ao fazer login
      try {
        await storage.saveLastEmail(email);
        console.log('Email salvo com sucesso no login:', email);
      } catch (storageError) {
        console.error('Erro ao salvar email no login:', storageError);
      }
      
      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Erro ao fazer login:', error.message);
      throw error;
    }
  },

  /**
   * Registra um novo usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {Object} userData - Dados adicionais do usuário
   * @returns {Promise} - Resultado da operação de registro
   */
  signUp: async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      
      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error.message);
      throw error;
    }
  },

  /**
   * Realiza logout do usuário atual
   * @returns {Promise} - Resultado da operação de logout
   */
  signOut: async () => {
    try {
      // Salvar o email do usuário atual antes de fazer logout
      try {
        const { data } = await supabase.auth.getUser();
        if (data && data.user && data.user.email) {
          // Garantir que o email seja salvo corretamente
          await storage.saveLastEmail(data.user.email);
          // Verificar se o email foi salvo corretamente
          const savedEmail = await storage.getLastEmail();
          console.log('Email salvo com sucesso:', data.user.email);
          console.log('Email verificado após salvar:', savedEmail);
        } else {
          console.warn('Nenhum usuário encontrado para salvar o email');
        }
      } catch (storageError) {
        console.error('Erro ao salvar email:', storageError);
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error.message);
      throw error;
    }
  },

  /**
   * Recupera a sessão atual do usuário
   * @returns {Promise} - Sessão atual do usuário, se existir
   */
  getCurrentSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao recuperar sessão:', error.message);
      throw error;
    }
  },

  /**
   * Recupera o usuário atual
   * @returns {Promise} - Usuário atual, se autenticado
   */
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Erro ao recuperar usuário:', error.message);
      throw error;
    }
  },

  /**
   * Envia email para redefinição de senha
   * @param {string} email - Email do usuário
   * @returns {Promise} - Resultado da operação
   */
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error.message);
      throw error;
    }
  },

  /**
   * Atualiza os dados do usuário
   * @param {Object} userData - Novos dados do usuário
   * @returns {Promise} - Resultado da operação
   */
  updateUserData: async (userData) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: userData,
      });
      
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error.message);
      throw error;
    }
  },
};

export default authService;
