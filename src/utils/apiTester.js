import supabase from '../services/supabase';

/**
 * Script para testar diretamente as APIs do Supabase
 * Execute este script para verificar se as operações básicas estão funcionando
 */
const apiTester = {
  /**
   * Testa a conexão com o Supabase
   */
  testConnection: async () => {
    try {
      console.log('=== TESTE DE CONEXÃO ===');
      const { data, error } = await supabase.from('teams').select('count');
      
      if (error) {
        console.error('❌ ERRO DE CONEXÃO:', error);
        return false;
      }
      
      console.log('✅ CONEXÃO OK:', data);
      return true;
    } catch (error) {
      console.error('❌ ERRO FATAL DE CONEXÃO:', error);
      return false;
    }
  },
  
  /**
   * Testa a criação de uma equipe
   */
  testCreateTeam: async () => {
    try {
      console.log('=== TESTE DE CRIAÇÃO DE EQUIPE ===');
      const testTeamName = `Equipe de Teste ${Date.now()}`;
      
      // 1. Inserir a equipe
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert([{ name: testTeamName }])
        .select()
        .single();

      if (teamError) {
        console.error('❌ ERRO AO CRIAR EQUIPE:', teamError);
        return false;
      }

      console.log('✅ EQUIPE CRIADA COM SUCESSO:', team);
      
      // 2. Adicionar um membro de teste
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: team.id,
          user_id: 'test-user-id',
          role: 'líder'
        }]);
        
      if (memberError) {
        console.error('❌ ERRO AO ADICIONAR MEMBRO:', memberError);
      } else {
        console.log('✅ MEMBRO ADICIONADO COM SUCESSO');
      }
      
      // 3. Adicionar funções de teste
      const { error: rolesError } = await supabase
        .from('team_roles')
        .insert([
          { team_id: team.id, name: 'Função de Teste 1' },
          { team_id: team.id, name: 'Função de Teste 2' }
        ]);

      if (rolesError) {
        console.error('❌ ERRO AO ADICIONAR FUNÇÕES:', rolesError);
      } else {
        console.log('✅ FUNÇÕES ADICIONADAS COM SUCESSO');
      }
      
      return team.id;
    } catch (error) {
      console.error('❌ ERRO FATAL AO CRIAR EQUIPE:', error);
      return false;
    }
  },
  
  /**
   * Testa a listagem de equipes
   */
  testListTeams: async () => {
    try {
      console.log('=== TESTE DE LISTAGEM DE EQUIPES ===');
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members(count),
          team_roles(count)
        `);

      if (error) {
        console.error('❌ ERRO AO LISTAR EQUIPES:', error);
        return false;
      }

      console.log(`✅ ${data.length} EQUIPES ENCONTRADAS:`, data);
      return data;
    } catch (error) {
      console.error('❌ ERRO FATAL AO LISTAR EQUIPES:', error);
      return false;
    }
  },
  
  /**
   * Testa a listagem de usuários
   */
  testListUsers: async () => {
    try {
      console.log('=== TESTE DE LISTAGEM DE USUÁRIOS ===');
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('❌ ERRO AO LISTAR USUÁRIOS:', error);
        return false;
      }

      console.log(`✅ ${data.length} USUÁRIOS ENCONTRADOS:`, data);
      return data;
    } catch (error) {
      console.error('❌ ERRO FATAL AO LISTAR USUÁRIOS:', error);
      return false;
    }
  },
  
  /**
   * Executa todos os testes
   */
  runAllTests: async () => {
    console.log('======= INICIANDO TESTES DA API =======');
    
    // 1. Testar conexão
    const connectionOk = await apiTester.testConnection();
    if (!connectionOk) {
      console.error('❌ FALHA NO TESTE DE CONEXÃO - Abortando testes');
      return;
    }
    
    // 2. Testar criação de equipe
    const teamId = await apiTester.testCreateTeam();
    if (!teamId) {
      console.error('❌ FALHA NO TESTE DE CRIAÇÃO DE EQUIPE');
    }
    
    // 3. Testar listagem de equipes
    const teams = await apiTester.testListTeams();
    if (!teams) {
      console.error('❌ FALHA NO TESTE DE LISTAGEM DE EQUIPES');
    }
    
    // 4. Testar listagem de usuários
    const users = await apiTester.testListUsers();
    if (!users) {
      console.error('❌ FALHA NO TESTE DE LISTAGEM DE USUÁRIOS');
    }
    
    console.log('======= TESTES CONCLUÍDOS =======');
  }
};

export default apiTester;
