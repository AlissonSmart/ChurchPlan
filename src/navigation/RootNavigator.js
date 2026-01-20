import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

/**
 * Navegador raiz que decide entre mostrar o fluxo de autenticação ou o aplicativo principal
 * @returns {React.ReactNode}
 */
const RootNavigator = () => {
  const { user } = useAuth();
  
  // Mostrar a tela apropriada com base no estado de autenticação
  return user ? <AppNavigator /> : <AuthNavigator />;
};

export default RootNavigator;
