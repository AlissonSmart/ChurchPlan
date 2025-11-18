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
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members(count),
          team_roles(count)
        `);

      if (error) {
        console.error('Erro ao buscar equipes:', error);
        throw error;
      }

      // Processar os dados para incluir contagens
      const processedData = data?.map(team => ({
        ...team,
        members_count: team.team_members[0]?.count || 0,
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
   * Busca equipes por nome
   * @param {string} searchTerm - Termo de busca
   * @returns {Promise<Array>} Lista de equipes filtradas
   */
  searchTeamsByName: async (searchTerm) => {
    try {
      console.log('Buscando equipes por nome no banco de dados:', searchTerm);
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members(count),
          team_roles(count)
        `)
        .ilike('name', `%${searchTerm}%`);

      if (error) {
        console.error('Erro ao buscar equipes por nome:', error);
        throw error;
      }

      // Processar os dados para incluir contagens
      const processedData = data?.map(team => ({
        ...team,
        members_count: team.team_members[0]?.count || 0,
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

      // 2. Adicionar o usuário como líder (apenas se tivermos um ID válido)
      if (team && team.id && userId) {
        console.log('Adicionando usuário como líder da equipe');
        
        try {
          const { error: memberError } = await supabase
            .from('team_members')
            .insert([{
              team_id: team.id,
              user_id: userId,
              role: 'líder'
            }]);
            
          if (memberError) {
            console.error('Erro ao adicionar usuário como líder:', memberError);
          } else {
            console.log('Usuário adicionado como líder com sucesso');
          }
        } catch (memberError) {
          console.error('Erro ao adicionar usuário como líder:', memberError);
          // Continuar mesmo se falhar ao adicionar o líder
        }
      } else {
        console.log('Pulando adição de líder - ID de usuário inválido ou equipe não criada');
      }

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
        members_count: 1, // Acabamos de adicionar o líder
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
  getTeamRoles: async (teamId) => {
    try {
      const { data, error } = await supabase
        .from('team_roles')
        .select('*')
        .eq('team_id', teamId);

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
