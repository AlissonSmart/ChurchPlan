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
      
      // Usar o ID fornecido ou obter do usuário autenticado
      let userId;
      
      if (profileData.id) {
        // Se o ID foi fornecido, usá-lo diretamente
        userId = profileData.id;
        console.log('Usando ID fornecido:', userId);
      } else {
        // Caso contrário, verificar se é um usuário autenticado
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData || !userData.user) {
          console.error('Usuário não autenticado e nenhum ID fornecido:', userError);
          throw new Error('Usuário não autenticado e nenhum ID fornecido');
        }
        
        userId = userData.user.id;
        console.log('Usando ID do usuário autenticado:', userId);
      }
      
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
        console.log('Atualizando perfil existente:', userId);
        const { data, error } = await supabase
          .from('profiles')
          .update(profileToSave)
          .eq('id', userId)
          .select();
          
        if (error) {
          console.error('Erro ao atualizar perfil:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log('Perfil atualizado com sucesso:', data[0]);
          result = data[0];
        } else {
          console.warn('Nenhum perfil foi atualizado. O ID pode não existir:', userId);
          // Se não conseguiu atualizar, tentar criar
          console.log('Tentando criar perfil já que a atualização não funcionou');
          profileToSave.created_at = new Date().toISOString();
          
          const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .insert([profileToSave])
            .select();
            
          if (insertError) {
            console.error('Erro ao criar perfil após falha na atualização:', insertError);
            throw insertError;
          }
          
          if (insertData && insertData.length > 0) {
            console.log('Perfil criado com sucesso após falha na atualização:', insertData[0]);
            result = insertData[0];
          } else {
            console.error('Falha ao criar perfil após falha na atualização');
            throw new Error('Falha ao criar ou atualizar perfil');
          }
        }
      } else {
        // Adicionar data de criação para novos perfis
        console.log('Criando novo perfil:', userId);
        profileToSave.created_at = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('profiles')
          .insert([profileToSave])
          .select();
          
        if (error) {
          console.error('Erro ao criar perfil:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log('Perfil criado com sucesso:', data[0]);
          result = data[0];
        } else {
          console.error('Falha ao criar perfil: nenhum dado retornado');
          throw new Error('Falha ao criar perfil: nenhum dado retornado');
        }
      }
      
      // Processar associações de equipes
      if (profileData.teams && profileData.teams.length > 0) {
        console.log('Processando associações de equipes para', userId, ':', profileData.teams);
        
        // Primeiro, remover todas as associações existentes
        const { error: deleteError } = await supabase
          .from('team_members')
          .delete()
          .eq('user_id', userId);
          
        if (deleteError) {
          console.error('Erro ao remover associações existentes:', deleteError);
          // Continuar mesmo com erro
        }
        
        // Adicionar novas associações
        const teamMembers = profileData.teams.map(team => ({
          team_id: team.teamId,
          user_id: userId,
          role: team.role
        }));
        
        if (teamMembers.length > 0) {
          const { error: teamError } = await supabase
            .from('team_members')
            .insert(teamMembers);
            
          if (teamError) {
            console.error('Erro ao associar usuário às equipes:', teamError);
            // Não lançar erro para não interromper o fluxo
          } else {
            console.log('Associações de equipes atualizadas com sucesso');
          }
        }
      } else {
        console.log('Nenhuma equipe para associar ao usuário:', userId);
        
        // Remover todas as associações existentes já que não há novas
        const { error: deleteError } = await supabase
          .from('team_members')
          .delete()
          .eq('user_id', userId);
          
        if (deleteError) {
          console.error('Erro ao remover associações existentes:', deleteError);
        } else {
          console.log('Todas as associações de equipes removidas');
        }
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      throw error;
    }
  },
  
  /**
   * Cria um novo perfil (sem autenticação no Supabase Auth)
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Perfil criado
   */
  createUser: async (userData) => {
    try {
      console.log('Criando novo usuário (apenas perfil):', userData);

      if (!userData.id) {
        throw new Error('ID do usuário de autenticação não fornecido. Crie primeiro o usuário no Auth (backend) e passe o ID para createUser.');
      }

      const profileToCreate = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        is_admin: userData.is_admin || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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

      console.log('Perfil criado com sucesso:', profileData);

      // Processar associações de equipes
      if (userData.teams && userData.teams.length > 0) {
        const teamMembers = userData.teams.map(team => ({
          team_id: team.teamId,
          user_id: profileData.id,
          role: team.role,
        }));

        const { error: teamError } = await supabase
          .from('team_members')
          .insert(teamMembers);

        if (teamError) {
          console.error('Erro ao associar usuário às equipes:', teamError);
        } else {
          console.log('Associações de equipe criadas com sucesso');
        }
      }

      return {
        user: null,
        profile: profileData,
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
          console.error('Usuário não autenticado e nenhum ID fornecido:', userError);
          throw new Error('Usuário não autenticado e nenhum ID fornecido');
        }
        
        userId = userData.user.id;
        console.log('Usando ID do usuário autenticado para buscar perfil:', userId);
      } else {
        console.log('Buscando perfil com ID fornecido:', userId);
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
      // Buscar todos os perfis
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Erro ao listar perfis:', error);
        throw error;
      }
      
      if (!profiles || profiles.length === 0) {
        return [];
      }
      
      // Buscar as equipes de todos os usuários
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select(`
          user_id,
          team_id,
          role,
          teams:team_id(id, name)
        `);
        
      if (teamError) {
        console.error('Erro ao buscar equipes dos usuários:', teamError);
        // Continuar mesmo com erro, apenas não terão equipes
      }
      
      // Mapear as equipes para cada usuário
      const profilesWithTeams = profiles.map(profile => {
        const userTeams = teamMembers
          ? teamMembers.filter(tm => tm.user_id === profile.id).map(tm => ({
              team_id: tm.team_id,
              role: tm.role,
              name: tm.teams?.name || 'Equipe sem nome'
            }))
          : [];
          
        return {
          ...profile,
          teams: userTeams
        };
      });
      
      return profilesWithTeams;
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
      
      // Buscar perfis que correspondem ao texto de busca
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', `%${searchText}%`)
        .order('name');
        
      if (error) {
        console.error('Erro ao buscar perfis:', error);
        throw error;
      }
      
      if (!profiles || profiles.length === 0) {
        return [];
      }
      
      // Obter os IDs dos perfis encontrados
      const profileIds = profiles.map(profile => profile.id);
      
      // Buscar as equipes apenas para os usuários encontrados
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select(`
          user_id,
          team_id,
          role,
          teams:team_id(id, name)
        `)
        .in('user_id', profileIds);
        
      if (teamError) {
        console.error('Erro ao buscar equipes dos usuários:', teamError);
        // Continuar mesmo com erro, apenas não terão equipes
      }
      
      // Mapear as equipes para cada usuário
      const profilesWithTeams = profiles.map(profile => {
        const userTeams = teamMembers
          ? teamMembers.filter(tm => tm.user_id === profile.id).map(tm => ({
              team_id: tm.team_id,
              role: tm.role,
              name: tm.teams?.name || 'Equipe sem nome'
            }))
          : [];
          
        return {
          ...profile,
          teams: userTeams
        };
      });
      
      return profilesWithTeams;
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
          console.error('Usuário não autenticado e nenhum ID fornecido:', userError);
          throw new Error('Usuário não autenticado e nenhum ID fornecido');
        }
        
        userId = userData.user.id;
        console.log('Usando ID do usuário autenticado para buscar equipes:', userId);
      } else {
        console.log('Buscando equipes para ID fornecido:', userId);
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
  
  /**
   * Exclui um perfil de usuário
   * @param {string} userId - ID do usuário a ser excluído
   * @returns {Promise<boolean>} - True se excluído com sucesso
   */
  deleteProfile: async (userId) => {
    try {
      if (!userId) {
        console.error('ID do usuário não fornecido para exclusão');
        throw new Error('ID do usuário não fornecido para exclusão');
      }
      
      console.log('Excluindo perfil:', userId);
      
      // Primeiro, remover todas as associações de equipes
      const { error: teamError } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', userId);
        
      if (teamError) {
        console.error('Erro ao remover associações de equipes:', teamError);
        // Continuar mesmo com erro
      } else {
        console.log('Associações de equipes removidas com sucesso');
      }
      
      // Remover o perfil
      console.log('Removendo perfil do usuário:', userId);
      const { data: deleteData, error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
        .select();
        
      if (profileError) {
        console.error('Erro ao excluir perfil:', profileError);
        throw profileError;
      } else {
        console.log('Perfil removido com sucesso:', deleteData);
      }
      
      // Tentar remover o usuário da autenticação usando o método do authService
      console.log('Tentando remover o usuário da autenticação...');
      
      try {
        // Importar authService
        const authService = require('./authService').default;
        
        // Tentar excluir o usuário da autenticação
        const authResult = await authService.deleteAuthUser(userId);
        
        if (authResult && authResult.success) {
          console.log('Usuário removido com sucesso da autenticação');
          
          // Retornar informações sobre a exclusão completa
          return {
            success: true,
            message: 'Perfil e usuário removidos com sucesso',
            userId: userId,
            partialDeletion: false
          };
        } else {
          console.log('Não foi possível remover o usuário da autenticação:', authResult?.message);
          
          // Retornar informações sobre a exclusão parcial
          return {
            success: true,
            message: 'Perfil removido com sucesso, mas o usuário pode continuar na autenticação',
            userId: userId,
            partialDeletion: true,
            authError: authResult?.error
          };
        }
      } catch (authError) {
        console.error('Erro ao tentar remover usuário da autenticação:', authError);
        
        // Retornar informações sobre a exclusão parcial
        return {
          success: true,
          message: 'Perfil removido com sucesso, mas o usuário pode continuar na autenticação',
          userId: userId,
          partialDeletion: true,
          authError: authError
        };
      }
    } catch (error) {
      console.error('Erro ao excluir perfil:', error);
      throw error;
    }
  },
};

export default profileService;
