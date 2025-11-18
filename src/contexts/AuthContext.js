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

  // Efeito para verificar e renovar a sessão do usuário ao iniciar
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Verificar se há uma sessão e renová-la se necessário
        const session = await authService.refreshSession();
        
        if (session) {
          console.log('Sessão válida encontrada, expira em:', new Date(session.expires_at * 1000).toLocaleString());
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } else {
          console.log('Nenhuma sessão válida encontrada');
        }
      } catch (error) {
        console.error('Erro ao verificar/renovar sessão do usuário:', error);
      }
    };

    checkUser();
    
    // Configurar verificador periódico da sessão (a cada 24 horas)
    const sessionCheckInterval = setInterval(() => {
      console.log('Verificando sessão periodicamente...');
      authService.refreshSession()
        .then(session => {
          if (session) {
            console.log('Sessão renovada, nova expiração:', new Date(session.expires_at * 1000).toLocaleString());
          }
        })
        .catch(error => console.error('Erro na verificação periódica da sessão:', error));
    }, 24 * 60 * 60 * 1000); // 24 horas em milissegundos

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
      // Limpar o intervalo de verificação ao desmontar o componente
      clearInterval(sessionCheckInterval);
      
      // Limpar o listener de autenticação
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
