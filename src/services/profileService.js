import supabase from './supabase';

/**
 * Serviço para gerenciar perfis de usuários no Supabase
 */
const profileService = {
  /**
   * Cria ou atualiza um perfil de usuário
   * @param {Object} profileData - Dados do perfil
   * @returns {Promise<Object>} Perfil criado ou atualizado
   */
  saveProfile: async (profileData) => {
    try {
      console.log('Salvando perfil:', profileData);
      
      // Verificar se é um usuário autenticado
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData || !userData.user) {
        console.error('Usuário não autenticado:', userError);
        throw new Error('Usuário não autenticado');
      }
      
      const userId = userData.user.id;
      
      // Verificar se o perfil já existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Dados do perfil a serem salvos
      const profileToSave = {
        id: userId,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone || null,
        is_admin: profileData.is_admin || false,
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      // Se o perfil existe, atualizar; caso contrário, criar
      if (existingProfile) {
        const { data, error } = await supabase
          .from('profiles')
          .update(profileToSave)
          .eq('id', userId)
          .select()
          .single();
          
        if (error) {
          console.error('Erro ao atualizar perfil:', error);
          throw error;
        }
        
        result = data;
      } else {
        // Adicionar data de criação para novos perfis
        profileToSave.created_at = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('profiles')
          .insert([profileToSave])
          .select()
          .single();
          
        if (error) {
          console.error('Erro ao criar perfil:', error);
          throw error;
        }
        
        result = data;
      }
      
      // Processar associações de equipes
      if (profileData.teams && profileData.teams.length > 0) {
        console.log('Processando associações de equipes:', profileData.teams);
        
        // Primeiro, remover todas as associações existentes
        await supabase
          .from('team_members')
          .delete()
          .eq('user_id', userId);
        
        // Adicionar novas associações
        const teamMembers = profileData.teams.map(team => ({
          team_id: team.teamId,
          user_id: userId,
          role: team.role
        }));
        
        const { error: teamError } = await supabase
          .from('team_members')
          .insert(teamMembers);
          
        if (teamError) {
          console.error('Erro ao associar usuário às equipes:', teamError);
          // Não lançar erro para não interromper o fluxo
        }
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      throw error;
    }
  },
  
  /**
   * Cria um novo usuário e perfil
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Usuário criado
   */
  createUser: async (userData) => {
    try {
      console.log('Criando novo usuário:', userData);
      
      // Criar usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: Math.random().toString(36).slice(-8), // Senha aleatória temporária
        email_confirm: true, // Confirmar email automaticamente
        user_metadata: {
          name: userData.name,
          is_admin: userData.is_admin || false
        }
      });
      
      if (authError) {
        console.error('Erro ao criar usuário na autenticação:', authError);
        throw authError;
      }
      
      // Criar perfil para o usuário
      const profileToCreate = {
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        is_admin: userData.is_admin || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([profileToCreate])
        .select()
        .single();
        
      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        throw profileError;
      }
      
      // Processar associações de equipes
      if (userData.teams && userData.teams.length > 0) {
        const teamMembers = userData.teams.map(team => ({
          team_id: team.teamId,
          user_id: authData.user.id,
          role: team.role
        }));
        
        const { error: teamError } = await supabase
          .from('team_members')
          .insert(teamMembers);
          
        if (teamError) {
          console.error('Erro ao associar usuário às equipes:', teamError);
        }
      }
      
      return {
        user: authData.user,
        profile: profileData
      };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },
  
  /**
   * Obtém o perfil de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Perfil do usuário
   */
  getProfile: async (userId) => {
    try {
      // Se não for fornecido um ID, usar o usuário atual
      if (!userId) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData || !userData.user) {
          console.error('Usuário não autenticado:', userError);
          throw new Error('Usuário não autenticado');
        }
        
        userId = userData.user.id;
      }
      
      // Buscar perfil
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar perfil:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      throw error;
    }
  },
  
  /**
   * Lista todos os perfis
   * @returns {Promise<Array>} Lista de perfis
   */
  getAllProfiles: async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Erro ao listar perfis:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao listar perfis:', error);
      throw error;
    }
  },
  
  /**
   * Busca perfis por nome
   * @param {string} searchText - Texto para busca
   * @returns {Promise<Array>} Lista de perfis encontrados
   */
  searchProfiles: async (searchText) => {
    try {
      if (!searchText || searchText.trim() === '') {
        return profileService.getAllProfiles();
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', `%${searchText}%`)
        .order('name');
        
      if (error) {
        console.error('Erro ao buscar perfis:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      throw error;
    }
  },
  
  /**
   * Busca as equipes de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} Lista de equipes do usuário
   */
  getUserTeams: async (userId) => {
    try {
      // Se não for fornecido um ID, usar o usuário atual
      if (!userId) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData || !userData.user) {
          console.error('Usuário não autenticado:', userError);
          throw new Error('Usuário não autenticado');
        }
        
        userId = userData.user.id;
      }
      
      // Buscar as equipes do usuário através da tabela team_members
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          teams:team_id(id, name)
        `)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Erro ao buscar equipes do usuário:', error);
        throw error;
      }
      
      // Formatar os dados para um formato mais fácil de usar
      const formattedTeams = data.map(item => ({
        id: item.team_id,
        role: item.role,
        name: item.teams?.name || 'Equipe sem nome'
      }));
      
      return formattedTeams;
    } catch (error) {
      console.error('Erro ao obter equipes do usuário:', error);
      return [];
    }
  },
};

export default profileService;
