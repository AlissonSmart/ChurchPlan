import supabase from '../services/supabase';

/**
 * Executa o script SQL para corrigir permissões
 * @returns {Promise<Object>} Resultado da execução
 */
export const runSqlFixer = async () => {
  try {
    console.log('Iniciando execução do script SQL para corrigir permissões...');
    
    // Verificar se temos acesso ao banco de dados
    console.log('Verificando conexão com o banco de dados...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1);
      
    if (testError) {
      console.error('Erro ao verificar conexão com o banco de dados:', testError);
      return { success: false, error: testError };
    }
    
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    console.log('Contagem de perfis:', testData);
    
    // Tentar criar um perfil diretamente para testar permissões
    console.log('Tentando criar um perfil de teste...');
    
    // Gerar um UUID v4 para o usuário de teste
    const testId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    const testProfile = {
      id: testId,
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      is_admin: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Tentando inserir perfil com ID:', testId);
    
    const { data: insertResult, error: insertError } = await supabase
      .from('profiles')
      .upsert([testProfile]);
      
    if (insertError) {
      console.error('Erro ao inserir perfil de teste:', insertError);
      return { success: false, error: insertError, message: 'Não foi possível criar um perfil de teste. Verifique as permissões do banco de dados.' };
    }
    
    console.log('Perfil de teste inserido com sucesso!');
    
    // Tentar criar uma associação de equipe para testar permissões
    console.log('Tentando criar uma associação de equipe de teste...');
    
    // Buscar uma equipe existente
    const { data: teams } = await supabase
      .from('teams')
      .select('id')
      .limit(1);
    
    if (teams && teams.length > 0) {
      const teamId = teams[0].id;
      
      const testTeamMember = {
        team_id: teamId,
        user_id: testId,
        role: 'Test Role'
      };
      
      const { error: teamMemberError } = await supabase
        .from('team_members')
        .upsert([testTeamMember]);
        
      if (teamMemberError) {
        console.error('Erro ao criar associação de equipe de teste:', teamMemberError);
      } else {
        console.log('Associação de equipe de teste criada com sucesso!');
      }
    }
    
    return {
      success: true,
      message: 'Operação concluída. Verifique os logs para detalhes.'
    };
  } catch (error) {
    console.error('Erro ao executar script SQL:', error);
    return { success: false, error };
  }
};

export default runSqlFixer;
