import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import supabase from '../services/supabase';

// Criando o contexto de autenticação
export const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);

/**
 * Provedor do contexto de autenticação
 * @param {Object} props - Propriedades do componente
 * @returns {React.ReactNode}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Efeito para verificar a sessão do usuário ao iniciar
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { session } = await authService.getCurrentSession();
        if (session) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Configurar ouvinte para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Limpar ouvinte ao desmontar
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Função para login
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { user } = await authService.signIn(email, password);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para registro
  const signUp = async (email, password, userData) => {
    setLoading(true);
    try {
      const { user } = await authService.signUp(email, password, userData);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para logout
  const signOut = async () => {
    setLoading(true);
    try {
      const result = await authService.signOut();
      if (result) {
        // Limpa o usuário do estado, o que fará o RootNavigator mostrar o AuthNavigator
        setUser(null);
        console.log('Usuário deslogado com sucesso');
      }
      return result;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para redefinição de senha
  const resetPassword = async (email) => {
    try {
      return await authService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  // Valor do contexto
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
