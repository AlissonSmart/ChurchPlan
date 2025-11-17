/**
 * Utilitários para verificação de roles e permissões
 */

/**
 * Verifica se o usuário tem a role de administrador
 * @param {Object} user - Objeto do usuário
 * @returns {boolean} - true se o usuário for administrador, false caso contrário
 */
export const isAdmin = (user) => {
  if (!user) return false;
  
  // Verificar em diferentes locais onde a role pode estar armazenada
  const appMetadataRole = user.app_metadata?.role;
  const userMetadataRole = user.user_metadata?.role;
  const directRole = user.role;
  
  return appMetadataRole === 'admin' || 
         userMetadataRole === 'admin' || 
         directRole === 'admin';
};

/**
 * Verifica se o usuário tem uma role específica
 * @param {Object} user - Objeto do usuário
 * @param {string} role - Role a ser verificada
 * @returns {boolean} - true se o usuário tiver a role, false caso contrário
 */
export const hasRole = (user, role) => {
  if (!user || !role) return false;
  
  const appMetadataRole = user.app_metadata?.role;
  const userMetadataRole = user.user_metadata?.role;
  const directRole = user.role;
  
  return appMetadataRole === role || 
         userMetadataRole === role || 
         directRole === role;
};

/**
 * Obtém a role do usuário
 * @param {Object} user - Objeto do usuário
 * @returns {string|null} - Role do usuário ou null se não tiver
 */
export const getUserRole = (user) => {
  if (!user) return null;
  
  return user.role || 
         user.app_metadata?.role || 
         user.user_metadata?.role || 
         null;
};

export default {
  isAdmin,
  hasRole,
  getUserRole
};
