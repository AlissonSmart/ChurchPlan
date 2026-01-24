import supabase, { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase';
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

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            is_admin: userData.is_admin || false,
          },
        },
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
      if (typeof error?.message === 'string' && error.message.includes('Unexpected character: <')) {
        throw new Error('Falha ao criar usuário: a resposta do servidor não é JSON (parece HTML). Verifique se o SUPABASE_URL está correto e se a rede/Wi‑Fi não está interceptando a conexão (portal/captive/proxy).');
      }
      console.error('Erro ao criar usuário no Auth:', error);
      throw error;
    }
  },
  
  // confirmUserEmail and checkAndConfirmEmail removed (admin-only)
  
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
              emailRedirectTo: undefined,
              shouldCreateUser: true,
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
      console.log('Tentando login normal para:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          expiresIn: 30 * 24 * 60 * 60, // 30 dias em segundos
        }
      });
      if (error) {
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
   * Registra um novo usuário com email e senha (com logs de debug)
   * @param {Object} params - { name, email, password }
   * @returns {Promise} - Resultado da operação de registro
   */
  signUpWithEmailPtBr: async ({ name, email, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    
    console.log('=== SIGNUP DEBUG ===');
    console.log('Email original:', email);
    console.log('Email limpo:', cleanEmail);
    console.log('Password length:', password.length);

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { name }
      }
    });

    console.log('SIGNUP data:', JSON.stringify(data, null, 2));
    console.log('SIGNUP error:', JSON.stringify(error, null, 2));

    if (error) throw error;

    // Criar profile
    if (data?.user?.id) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: cleanEmail,
          name,
          is_admin: false,
          is_active: true,
        });
      } catch (e) {
        console.warn('Profile error (não crítico):', e);
      }
    }

    return data;
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
          data: userData,
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

      // Sincronizar perfil em profiles após criar auth user
      try {
        console.log('Sincronizando perfil para email:', email);
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(
            {
              email: email,
              name: userData.name || email.split('@')[0],
              auth_status: 'active',
              is_active: true,
            },
            { onConflict: 'email' }
          );

        if (upsertError) {
          console.error('Erro ao sincronizar perfil:', upsertError);
          throw upsertError;
        }

        console.log('Perfil sincronizado com sucesso para:', email);
      } catch (upsertError) {
        console.error('Erro ao sincronizar perfil após signUp:', upsertError);
        // Não lançar erro aqui, pois o auth user já foi criado
        // O perfil pode ser sincronizado depois se necessário
      }

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
   * Tenta excluir um usuário da autenticação
   * @param {string} userId - ID do usuário a ser excluído
   * @returns {Promise<Object>} - Resultado da operação
   */
  deleteAuthUser: async (userId) => {
    try {
      console.log('Solicitação para excluir usuário da autenticação (não suportado no cliente):', userId);
      return {
        success: false,
        message: 'Exclusão de usuário da autenticação só pode ser feita no backend usando a service role.',
      };
    } catch (error) {
      console.error('Erro ao excluir usuário da autenticação:', error);
      throw error;
    }
  },
  
  /**
   * Verifica e renova a sessão do usuário se necessário
   * @param {boolean} skipRenewal - Se verdadeiro, pula a renovação e apenas retorna a sessão atual
   * @returns {Promise} - Sessão renovada ou atual
   */
  refreshSession: async (skipRenewal = false) => {
    try {
      // Verificar sessão atual (isso é rápido pois primeiro verifica o armazenamento local)
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData || !sessionData.session) {
        console.log('Nenhuma sessão encontrada para renovar');
        return null;
      }
      
      // Se skipRenewal for verdadeiro, apenas retornar a sessão atual sem tentar renová-la
      if (skipRenewal) {
        return sessionData.session;
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
