import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import supabase from '../services/supabase';

// Criando o contexto de autenticação
export const AuthContext = createContext({
  user: null,
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
  
  // Efeito para verificar a sessão ao iniciar o aplicativo
  useEffect(() => {
    // Configurar ouvinte para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const { data: userData } = await supabase.auth.getUser();
            setUser(userData.user);
            console.log('Usuário autenticado:', userData.user.email);
          } catch (error) {
            console.error('Erro ao obter dados do usuário:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          console.log('Usuário deslogado');
        }
      }
    );
    
    // Verificar sessão atual
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data && data.session) {
          const { data: userData } = await supabase.auth.getUser();
          setUser(userData.user);
          console.log('Sessão existente encontrada');
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      }
    };
    
    checkSession();
    
    // Limpar ouvinte ao desmontar
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);


  // Função para login
  const signIn = async (email, password) => {
    try {
      const { user } = await authService.signIn(email, password);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Função para registro
  const signUp = async (email, password, userData) => {
    try {
      const { user } = await authService.signUp(email, password, userData);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Função para logout
  const signOut = async () => {
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
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
