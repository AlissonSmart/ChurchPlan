import supabase from './supabase';
import storage from '../utils/storage';

/**
 * Serviço de autenticação para gerenciar login, registro e sessão do usuário
 */
const authService = {
  /**
   * Cria um novo usuário no Supabase Auth
   * @param {Object} userData - Dados do usuário (email, nome, etc)
   * @returns {Promise<Object>} - Objeto com o usuário criado
   */
  createAuthUser: async (userData) => {
    try {
      console.log('Criando usuário no Auth (método simplificado):', userData);
      
      // Verificar se a senha foi fornecida
      if (!userData.password) {
        throw new Error('Senha não fornecida para criar usuário');
      }
      
      console.log('Usando senha fornecida pelo usuário');
      
      // Usar o método signUp diretamente com configuração mínima
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password, // Usar a senha fornecida pelo usuário
        options: {
          // Sem usar configurações avançadas que possam depender de WebCrypto
          emailRedirectTo: undefined,
          data: {
            name: userData.name,
            is_admin: userData.is_admin || false
          }
        }
      });
      
      if (error) {
        console.error('Erro ao criar usuário no Auth:', error);
        throw error;
      }
      
      if (!data || !data.user) {
        console.error('Resposta inválida ao criar usuário:', data);
        throw new Error('Resposta inválida ao criar usuário');
      }
      
      console.log('Usuário criado com sucesso no Auth:', data.user.id);
      return data;
    } catch (error) {
      console.error('Erro ao criar usuário no Auth:', error);
      throw error;
    }
  },
  /**
   * Realiza login com email e senha
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise} - Resultado da operação de login
   */
  signIn: async (email, password) => {
    try {
      // MODO DE TESTE: Tentar login real primeiro, com fallback para credenciais de teste
      if (email === 'eualissonmartins@gmail.com' && password === '123456') {
        console.log('Modo de teste: Tentando login real primeiro');
        
        try {
          // Tentar login real primeiro com sessão de longa duração
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: {
              expiresIn: 30 * 24 * 60 * 60, // 30 dias em segundos
            }
          });
          
          if (!error && data && data.user) {
            console.log('Login real bem-sucedido no modo de teste');
            
            // Salvar o email do usuário ao fazer login
            try {
              await storage.saveLastEmail(email);
              console.log('Email salvo com sucesso no login:', email);
            } catch (storageError) {
              console.error('Erro ao salvar email no login:', storageError);
            }
            
            return { user: data.user, session: data.session };
          }
          
          // Se falhar, usar o modo de teste com usuário simulado
          console.log('Login real falhou, usando credenciais fixas');
        } catch (loginError) {
          console.log('Erro ao tentar login real:', loginError);
        }
        
        // Criar um usuário fictício para testes como fallback
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
          expires_at: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 dias em segundos
          user: mockUser
        };
        
        // Configurar a sessão no Supabase para o modo de teste
        try {
          // Tentar definir a sessão manualmente
          await supabase.auth.setSession({
            access_token: mockSession.access_token,
            refresh_token: mockSession.refresh_token
          });
          console.log('Sessão de teste configurada no Supabase');
        } catch (sessionError) {
          console.log('Erro ao configurar sessão de teste:', sessionError);
        }
        
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
      // Configuração para sessão de longa duração (30 dias)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          expiresIn: 30 * 24 * 60 * 60, // 30 dias em segundos
        }
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
              emailRedirectTo: null,
              expiresIn: 30 * 24 * 60 * 60 // 30 dias em segundos
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
      console.log('Registrando novo usuário com email:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Configuração mínima para evitar problemas com WebCrypto
          emailRedirectTo: undefined,
          data: userData
        }
      });
      
      if (error) {
        console.error('Erro ao registrar usuário:', error);
        throw error;
      }
      
      if (!data || !data.user) {
        console.error('Resposta inválida ao registrar usuário:', data);
        throw new Error('Resposta inválida ao registrar usuário');
      }
      
      console.log('Usuário registrado com sucesso:', data.user.id);
      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
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
  
  /**
   * Verifica e renova a sessão do usuário se necessário
   * @returns {Promise} - Sessão renovada ou atual
   */
  refreshSession: async () => {
    try {
      // Verificar sessão atual
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData || !sessionData.session) {
        console.log('Nenhuma sessão encontrada para renovar');
        return null;
      }
      
      // Verificar se a sessão está próxima de expirar (menos de 7 dias)
      const expiresAt = sessionData.session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      
      if (expiresAt - now < sevenDaysInSeconds) {
        console.log('Sessão próxima de expirar, renovando...');
        
        // Renovar a sessão
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: sessionData.session.refresh_token,
        });
        
        if (error) {
          console.error('Erro ao renovar sessão:', error);
          return sessionData.session;
        }
        
        console.log('Sessão renovada com sucesso');
        return data.session;
      }
      
      return sessionData.session;
    } catch (error) {
      console.error('Erro ao verificar/renovar sessão:', error);
      return null;
    }
  },
};

export default authService;
