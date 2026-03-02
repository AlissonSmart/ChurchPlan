import supabase from './supabase';

/**
 * Serviço para gerenciar equipes no Supabase
 */
const teamService = {
  /**
   * Busca todas as equipes
   * @returns {Promise<Array>} Lista de equipes
   */
  getAllTeams: async () => {
    try {
      console.log('Buscando todas as equipes do banco de dados');
      
      // Primeiro, buscar todas as equipes com contagem de funções
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          team_roles(count)
        `);

      if (teamsError) {
        console.error('Erro ao buscar equipes:', teamsError);
        throw teamsError;
      }
      
      // Obter IDs das equipes encontradas
      const teamIds = teamsData.map(team => team.id);
      console.log('IDs das equipes encontradas:', teamIds);
      
      // Buscar apenas os membros das equipes encontradas
      const { data: allTeamMembers, error: membersError } = await supabase
        .from('team_members')
        .select('team_id, user_id')
        .in('team_id', teamIds);
        
      if (membersError) {
        console.error('Erro ao buscar membros das equipes:', membersError);
        // Continuar mesmo com erro, apenas não terão contagem de membros
      }
      
      console.log('Total de registros de membros:', allTeamMembers?.length || 0);
      
      // Vamos considerar todos os membros válidos por enquanto
      const validTeamMembers = allTeamMembers || [];
      
      // Contar membros únicos por equipe manualmente
      const memberCountMap = {};
      
      if (validTeamMembers && validTeamMembers.length > 0) {
        // Para cada equipe, criar um Set de user_ids para contar membros únicos
        teamsData.forEach(team => {
          const uniqueMembers = new Set();
          
          // Filtrar membros desta equipe e adicionar ao Set
          const teamMembers = validTeamMembers
            .filter(member => member.team_id === team.id);
          
          console.log(`Equipe ${team.name} (${team.id}): ${teamMembers.length} registros de membros`);
          
          // Adicionar apenas user_ids únicos ao Set
          teamMembers.forEach(member => {
            uniqueMembers.add(member.user_id);
          });
          
          // Armazenar a contagem de membros únicos
          memberCountMap[team.id] = uniqueMembers.size;
          console.log(`Equipe ${team.name}: ${uniqueMembers.size} membros únicos`);
          console.log(`IDs dos membros da equipe ${team.name}:`, [...uniqueMembers]);
        });
      }

      // Processar os dados para incluir contagens
      const processedData = teamsData?.map(team => ({
        ...team,
        members_count: memberCountMap[team.id] || 0,
        roles_count: team.team_roles[0]?.count || 0
      })) || [];

      console.log('Equipes encontradas:', processedData.length);
      return processedData;
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
      throw error;
    }
  },

  /**
   * Buscar membros da equipe (com profiles)
   */
  getTeamMembers: async (teamId) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          team_id,
          user_id,
          role,
          subteam_id,
          profile:profiles!team_members_user_id_fkey(id, name, email, phone, avatar_url, is_active)
        `)
        .eq('team_id', teamId);

      if (error) {
        console.error('Erro ao buscar membros da equipe:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar membros da equipe:', error);
      return [];
    }
  },

  /**
   * Listar subequipes da equipe
   */
  listSubteams: async (teamId) => {
    try {
      const { data, error } = await supabase
        .from('team_subteams')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar subequipes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar subequipes:', error);
      return [];
    }
  },

  /**
   * Criar subequipe
   */
  createSubteam: async (teamId, subteamData) => {
    try {
      const { data, error } = await supabase
        .from('team_subteams')
        .insert([
          {
            team_id: teamId,
            name: subteamData.name,
            description: subteamData.description || null,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar subequipe:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao criar subequipe:', error);
      throw error;
    }
  },

  /**
   * Atualizar subequipe
   */
  updateSubteam: async (subteamId, subteamData) => {
    try {
      const { data, error } = await supabase
        .from('team_subteams')
        .update({
          name: subteamData.name,
          description: subteamData.description || null,
        })
        .eq('id', subteamId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar subequipe:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao atualizar subequipe:', error);
      throw error;
    }
  },

  /**
   * Excluir subequipe
   */
  deleteSubteam: async (subteamId) => {
    try {
      const { error } = await supabase
        .from('team_subteams')
        .delete()
        .eq('id', subteamId);

      if (error) {
        console.error('Erro ao excluir subequipe:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao excluir subequipe:', error);
      throw error;
    }
  },

  /**
   * Atualizar funções da subequipe
   */
  setSubteamRoles: async (teamId, subteamId, roles) => {
    try {
      const { error: deleteError } = await supabase
        .from('team_roles')
        .delete()
        .eq('team_id', teamId)
        .eq('subteam_id', subteamId);

      if (deleteError) {
        console.error('Erro ao limpar funções da subequipe:', deleteError);
      }

      const roleNames = (roles || []).filter(role => role?.trim());
      if (roleNames.length === 0) return true;

      const { error: insertError } = await supabase
        .from('team_roles')
        .insert(roleNames.map(role => ({
          team_id: teamId,
          subteam_id: subteamId,
          name: role.trim(),
        })));

      if (insertError) {
        console.error('Erro ao inserir funções da subequipe:', insertError);
        throw insertError;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar funções da subequipe:', error);
      throw error;
    }
  },

  /**
   * Definir líder da subequipe
   */
  setSubteamLeader: async (teamId, subteamId, leaderProfileId) => {
    try {
      // Remover líder anterior
      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('subteam_id', subteamId)
        .ilike('role', '%líder%');

      if (deleteError) {
        console.error('Erro ao remover líder anterior:', deleteError);
      }

      if (!leaderProfileId) return true;

      // Verificar se já existe membro para este usuário na equipe
      const { data: existingMember, error: existingError } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', leaderProfileId)
        .maybeSingle();

      if (existingError) {
        console.error('Erro ao verificar membro existente:', existingError);
      }

      if (existingMember?.id) {
        const { error: updateError } = await supabase
          .from('team_members')
          .update({
            subteam_id: subteamId,
            role: 'Líder'
          })
          .eq('id', existingMember.id);

        if (updateError) {
          console.error('Erro ao atualizar líder da subequipe:', updateError);
          throw updateError;
        }

        return true;
      }

      const { error: insertError } = await supabase
        .from('team_members')
        .insert([{ 
          team_id: teamId,
          user_id: leaderProfileId,
          subteam_id: subteamId,
          role: 'Líder'
        }]);

      if (insertError) {
        console.error('Erro ao inserir líder da subequipe:', insertError);
        throw insertError;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao definir líder da subequipe:', error);
      throw error;
    }
  },
  
  /**
   * Busca equipes por nome
   * @param {string} searchTerm - Termo de busca
   * @returns {Promise<Array>} Lista de equipes filtradas
   */
  searchTeamsByName: async (searchTerm) => {
    try {
      console.log('Buscando equipes por nome no banco de dados:', searchTerm);
      
      // Primeiro, buscar equipes que correspondem ao termo de busca
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          team_roles(count)
        `)
        .ilike('name', `%${searchTerm}%`);

      if (teamsError) {
        console.error('Erro ao buscar equipes por nome:', teamsError);
        throw teamsError;
      }
      
      if (!teamsData || teamsData.length === 0) {
        return [];
      }
      
      // Obter IDs das equipes encontradas
      const teamIds = teamsData.map(team => team.id);
      console.log('IDs das equipes encontradas na busca:', teamIds);
      
      // Buscar apenas os membros das equipes encontradas
      const { data: allTeamMembers, error: membersError } = await supabase
        .from('team_members')
        .select('team_id, user_id')
        .in('team_id', teamIds);
        
      if (membersError) {
        console.error('Erro ao buscar membros das equipes:', membersError);
        // Continuar mesmo com erro, apenas não terão contagem de membros
      }
      
      console.log('Total de registros de membros na busca:', allTeamMembers?.length || 0);
      
      // Vamos considerar todos os membros válidos por enquanto
      const validTeamMembers = allTeamMembers || [];
      
      // Contar membros únicos por equipe manualmente
      const memberCountMap = {};
      
      if (validTeamMembers && validTeamMembers.length > 0) {
        // Para cada equipe, criar um Set de user_ids para contar membros únicos
        teamsData.forEach(team => {
          const uniqueMembers = new Set();
          
          // Filtrar membros desta equipe e adicionar ao Set
          const teamMembers = validTeamMembers
            .filter(member => member.team_id === team.id);
          
          console.log(`Equipe ${team.name} (${team.id}): ${teamMembers.length} registros de membros`);
          
          // Adicionar apenas user_ids únicos ao Set
          teamMembers.forEach(member => {
            uniqueMembers.add(member.user_id);
          });
          
          // Armazenar a contagem de membros únicos
          memberCountMap[team.id] = uniqueMembers.size;
          console.log(`Equipe ${team.name}: ${uniqueMembers.size} membros únicos`);
          console.log(`IDs dos membros da equipe ${team.name}:`, [...uniqueMembers]);
        });
      }

      // Processar os dados para incluir contagens
      const processedData = teamsData?.map(team => ({
        ...team,
        members_count: memberCountMap[team.id] || 0,
        roles_count: team.team_roles[0]?.count || 0
      })) || [];

      console.log('Equipes encontradas na busca:', processedData.length);
      return processedData;
    } catch (error) {
      console.error('Erro ao buscar equipes por nome:', error);
      throw error;
    }
  },

  /**
   * Busca uma equipe pelo ID
   * @param {string} teamId - ID da equipe
   * @returns {Promise<Object>} Dados da equipe
   */
  getTeamById: async (teamId) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_roles (*),
          team_members (
            *,
            user:user_id (id),
            profiles:user_id (
              id,
              name,
              email,
              avatar_url,
              role
            )
          )
        `)
        .eq('id', teamId)
        .single();

      if (error) {
        console.error('Erro ao buscar equipe:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Equipe não encontrada');
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar equipe:', error);
      throw error;
    }
  },

  /**
   * Cria uma nova equipe
   * @param {Object} teamData - Dados da equipe
   * @returns {Promise<Object>} Equipe criada
   */
  createTeam: async (teamData) => {
    try {
      console.log('Iniciando criação de equipe no banco de dados:', teamData.name);
      
      // Obter o ID do usuário atual
      let userId;
      
      try {
        // Tentar obter o usuário autenticado
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData || !userData.user) {
          console.log('Usuário não autenticado, não adicionaremos um líder');
          userId = null; // Não usar ID de teste, pois causa erro de tipo
        } else {
          userId = userData.user.id;
          console.log('Usando ID do usuário autenticado:', userId);
        }
      } catch (authError) {
        console.log('Erro ao obter usuário:', authError);
        userId = null; // Não usar ID de teste, pois causa erro de tipo
      }
      
      console.log('Criando equipe com usuário ID:', userId);
      
      // INSERÇÃO DIRETA - Abordagem mais simples e direta
      console.log('Inserindo equipe diretamente na tabela teams');
      
      // 1. Inserir a equipe
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert([{ name: teamData.name }])
        .select()
        .single();

      if (teamError) {
        console.error('ERRO AO CRIAR EQUIPE:', teamError);
        throw new Error(`Erro ao criar equipe: ${teamError.message}`);
      }

      console.log('EQUIPE CRIADA COM SUCESSO:', team);

      // 2. Não adicionar líder automaticamente (líder será definido posteriormente)
      console.log('Pulando adição automática de líder');

      // 3. Adicionar funções à equipe
      if (teamData.roles && teamData.roles.length > 0) {
        console.log('Adicionando funções à equipe:', teamData.roles);
        
        const roleData = teamData.roles.map(role => ({
          team_id: team.id,
          name: role
        }));

        const { error: rolesError } = await supabase
          .from('team_roles')
          .insert(roleData);

        if (rolesError) {
          console.error('Erro ao adicionar funções:', rolesError);
        } else {
          console.log('Funções adicionadas com sucesso');
        }
      }

      // Retornar a equipe criada com contagens
      return {
        ...team,
        members_count: 0,
        roles_count: teamData.roles ? teamData.roles.length : 0
      };
    } catch (error) {
      console.error('ERRO FATAL AO CRIAR EQUIPE:', error);
      throw error;
    }
  },

  /**
   * Obtém as funções de uma equipe
   * @param {string} teamId - ID da equipe
   * @returns {Promise<Array>} Lista de funções da equipe
   */
  getTeamRoles: async (teamId, subteamId = null) => {
    try {
      let query = supabase
        .from('team_roles')
        .select('*')
        .eq('team_id', teamId);

      if (subteamId === null) {
        query = query.is('subteam_id', null);
      } else if (subteamId) {
        query = query.eq('subteam_id', subteamId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar funções da equipe:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar funções da equipe:', error);
      return [];
    }
  },

  /**
   * Atualiza uma equipe
   * @param {Object} teamData - Dados da equipe com ID
   * @returns {Promise<Object>} Equipe atualizada
   */
  updateTeam: async (teamData) => {
    try {
      console.log('Atualizando equipe:', teamData);
      
      if (!teamData.id) {
        throw new Error('ID da equipe não fornecido');
      }
      
      const teamId = teamData.id;
      
      // Atualizar a equipe
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .update({ name: teamData.name })
        .eq('id', teamId)
        .select();

      if (teamError) {
        console.error('Erro ao atualizar equipe:', teamError);
        throw teamError;
      }
      
      if (!team || team.length === 0) {
        console.error('Nenhuma equipe foi atualizada com o ID:', teamId);
        throw new Error('Equipe não encontrada');
      }
      
      console.log('Equipe atualizada com sucesso:', team[0]);

      // Se houver funções para atualizar
      if (teamData.roles) {
        console.log('Atualizando funções da equipe:', teamData.roles);
        
        // Primeiro, remover todas as funções existentes
        const { error: deleteError } = await supabase
          .from('team_roles')
          .delete()
          .eq('team_id', teamId);

        if (deleteError) {
          console.error('Erro ao remover funções existentes:', deleteError);
          // Não lançar erro aqui, pois a equipe já foi atualizada
        } else {
          console.log('Funções existentes removidas com sucesso');
        }

        // Adicionar as novas funções
        if (teamData.roles.length > 0) {
          // Extrair os nomes das funções do formato { name: 'Função' }
          const roleData = teamData.roles.map(role => ({
            team_id: teamId,
            name: typeof role === 'object' ? role.name : role
          }));

          const { data: insertedRoles, error: rolesError } = await supabase
            .from('team_roles')
            .insert(roleData)
            .select();

          if (rolesError) {
            console.error('Erro ao adicionar novas funções:', rolesError);
            // Não lançar erro aqui, pois a equipe já foi atualizada
          } else {
            console.log('Novas funções adicionadas com sucesso:', insertedRoles);
          }
        }
      }

      return team;
    } catch (error) {
      console.error('Erro inesperado ao atualizar equipe:', error);
      throw error;
    }
  },

  /**
   * Remove uma equipe
   * @param {string} teamId - ID da equipe
   * @returns {Promise<boolean>} True se removida com sucesso
   */
  deleteTeam: async (teamId) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) {
        console.error('Erro ao remover equipe:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao remover equipe:', error);
      throw error;
    }
  },

  /**
   * Adiciona um membro a uma equipe
   * @param {string} teamId - ID da equipe
   * @param {string} userId - ID do usuário
   * @param {string} role - Função do usuário na equipe
   * @returns {Promise<Object>} Membro adicionado
   */
  addTeamMember: async (teamId, userId, role) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          team_id: teamId,
          user_id: userId,
          role: role
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar membro:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao adicionar membro:', error);
      throw error;
    }
  },

  /**
   * Remove um membro de uma equipe
   * @param {string} teamId - ID da equipe
   * @param {string} userId - ID do usuário
   * @returns {Promise<boolean>} True se removido com sucesso
   */
  removeTeamMember: async (teamId, userId) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao remover membro:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao remover membro:', error);
      throw error;
    }
  }
};

export default teamService;
