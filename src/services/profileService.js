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
        auth_status: profileData.auth_status || 'pending',
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
        
        // Primeiro, remover todas as associações existentes em team_members
        const { error: deleteError } = await supabase
          .from('team_members')
          .delete()
          .eq('user_id', userId);
          
        if (deleteError) {
          console.error('Erro ao remover associações existentes:', deleteError);
          // Continuar mesmo com erro
        }
        
        // Remover todas as funções existentes em volunteer_roles
        const { error: deleteRolesError } = await supabase
          .from('volunteer_roles')
          .delete()
          .eq('profile_id', userId);
          
        if (deleteRolesError) {
          console.error('Erro ao remover funções existentes em volunteer_roles:', deleteRolesError);
          // Continuar mesmo com erro
        }
        
        // Adicionar novas associações em team_members
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
        
        // Adicionar funções em volunteer_roles (para o AddTeamMemberModal)
        // Buscar role_id de cada função selecionada
        for (const team of profileData.teams) {
          try {
            // Buscar o role_id da função na tabela team_roles
            const { data: roleData, error: roleError } = await supabase
              .from('team_roles')
              .select('id')
              .eq('team_id', team.teamId)
              .eq('name', team.role)
              .maybeSingle();
            
            if (roleError) {
              console.error('Erro ao buscar role_id:', roleError);
              continue;
            }
            
            if (roleData) {
              // Inserir em volunteer_roles
              const { error: insertRoleError } = await supabase
                .from('volunteer_roles')
                .insert({
                  profile_id: userId,
                  role_id: roleData.id
                });
              
              if (insertRoleError) {
                console.error('Erro ao inserir em volunteer_roles:', insertRoleError);
              } else {
                console.log('Função adicionada em volunteer_roles:', team.role);
              }
            }
          } catch (error) {
            console.error('Erro ao processar função:', error);
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
        
        // Remover todas as funções em volunteer_roles
        const { error: deleteRolesError } = await supabase
          .from('volunteer_roles')
          .delete()
          .eq('profile_id', userId);
          
        if (deleteRolesError) {
          console.error('Erro ao remover funções em volunteer_roles:', deleteRolesError);
        } else {
          console.log('Todas as funções removidas de volunteer_roles');
        }
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      throw error;
    }
  },
  
  createUser: async (userData) => {
    try {
      console.log('Criando novo usuário (apenas perfil):', userData);

      const profileToCreate = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        is_admin: userData.is_admin || false,
        auth_status: 'pending',
      };

      if (userData.id) {
        profileToCreate.id = userData.id;
        profileToCreate.auth_status = 'active';
      }

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

      if (profileData.auth_status === 'active' && userData.teams && userData.teams.length > 0 && profileData.id) {
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
      } else if (profileData.auth_status === 'pending' && userData.teams && userData.teams.length > 0) {
        console.log('Perfil pending: equipes serão associadas quando o usuário se cadastrar');
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
      // Buscar todos os perfis ativos
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
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
      
      // Buscar perfis ativos que correspondem ao texto de busca
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
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

  /**
   * Desativa um perfil (soft delete)
   * @param {string} profileId - ID do perfil
   * @returns {Promise<Object>} Perfil desativado
   */
  deactivateProfile: async (profileId) => {
    try {
      console.log('Desativando perfil:', profileId);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', profileId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao desativar perfil:', error);
        throw error;
      }

      console.log('Perfil desativado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('Erro ao desativar perfil:', error);
      throw error;
    }
  },

  /**
   * Reativa um perfil desativado
   * @param {string} profileId - ID do perfil
   * @returns {Promise<Object>} Perfil reativado
   */
  reactivateProfile: async (profileId) => {
    try {
      console.log('Reativando perfil:', profileId);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: true })
        .eq('id', profileId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao reativar perfil:', error);
        throw error;
      }

      console.log('Perfil reativado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('Erro ao reativar perfil:', error);
      throw error;
    }
  },

  /**
   * Cria ou reativa um perfil baseado no email
   * Se o email já existe e está inativo, reativa com novos dados
   * Se o email já existe e está ativo, lança erro
   * Se não existe, cria novo perfil
   * @param {Object} profileData - Dados do perfil (name, email, phone, is_admin)
   * @returns {Promise<Object>} Perfil criado ou reativado
   */
  createOrReactivateProfile: async (profileData) => {
    try {
      console.log('Criando ou reativando perfil com email:', profileData.email);

      // 1. Verificar se já existe perfil com esse email
      const { data: existing, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', profileData.email)
        .maybeSingle();

      if (selectError) {
        console.error('Erro ao buscar perfil existente:', selectError);
        throw selectError;
      }

      // 2. Se já existe
      if (existing) {
        // 2a. Se já está ativo → erro amigável
        if (existing.is_active) {
          throw new Error('Já existe uma pessoa ativa com este email.');
        }

        // 2b. Se está inativo → reativar (UPDATE)
        console.log('Reativando perfil existente:', existing.id);
        const { data, error: updateError } = await supabase
          .from('profiles')
          .update({
            name: profileData.name,
            phone: profileData.phone || null,
            is_admin: profileData.is_admin || false,
            is_active: true,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) {
          console.error('Erro ao reativar perfil:', updateError);
          throw updateError;
        }

        console.log('Perfil reativado com sucesso:', data);
        return data;
      }

      // 3. Se não existir → criar perfil novo (INSERT)
      console.log('Criando novo perfil com email:', profileData.email);
      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone || null,
          is_admin: profileData.is_admin || false,
          auth_status: 'pending',
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao criar perfil:', insertError);
        // Tratamento específico para 23505 (unique constraint violation)
        if (insertError.code === '23505') {
          throw new Error('Já existe uma pessoa com este email.');
        }
        throw insertError;
      }

      console.log('Perfil criado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('Erro ao criar ou reativar perfil:', error);
      throw error;
    }
  },
};

export default profileService;
