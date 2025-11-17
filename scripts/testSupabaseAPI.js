// Script para testar a API do Supabase diretamente
const { createClient } = require('@supabase/supabase-js');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

// Substitua estas constantes pelos seus valores reais do Supabase
const SUPABASE_URL = 'https://hqznokiwjhxxaiuhgcfy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxem5va2l3amh4eGFpdWhnY2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzIyNDMsImV4cCI6MjA3ODk0ODI0M30.XSFzIQYhchMYlOwW-rJmEsarN8v3PqUObwh-zgxVIXc';

// Cria um cliente Supabase personalizado
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para testar a consulta de usuários
const testGetUsers = async () => {
  console.log('Testando consulta de usuários...');
  
  try {
    // Consulta sem filtros
    const { data: allUsers, error: allUsersError } = await supabase
      .from('profiles')
      .select('*');
    
    if (allUsersError) {
      console.error('Erro ao consultar todos os usuários:', allUsersError);
    } else {
      console.log('Encontrados ' + (allUsers ? allUsers.length : 0) + ' usuários no total:');
      console.log(JSON.stringify(allUsers, null, 2));
    }
    
    // Consulta com ordenação por nome
    const { data: orderedUsers, error: orderedUsersError } = await supabase
      .from('profiles')
      .select('id, name, email, role, avatar_url, church_name')
      .order('name');
    
    if (orderedUsersError) {
      console.error('Erro ao consultar usuários ordenados:', orderedUsersError);
    } else {
      console.log('Encontrados ' + (orderedUsers ? orderedUsers.length : 0) + ' usuários ordenados por nome:');
      console.log(JSON.stringify(orderedUsers, null, 2));
    }
    
    // Verificar o usuário atual autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Erro ao obter usuário autenticado:', authError);
    } else if (user) {
      console.log('Usuário autenticado:', user);
      
      // Buscar o perfil do usuário autenticado
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Erro ao buscar perfil do usuário autenticado:', profileError);
      } else {
        console.log('Perfil do usuário autenticado:', userProfile);
      }
    } else {
      console.log('Nenhum usuário autenticado');
    }
    
    // Verificar as políticas RLS
    console.log('Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase.rpc('get_policies');
    
    if (policiesError) {
      console.error('Erro ao verificar políticas:', policiesError);
      console.log('Nota: A função get_policies pode não existir no seu banco de dados');
    } else {
      console.log('Políticas RLS:', policies);
    }
    
  } catch (error) {
    console.error('Erro inesperado:', error);
  }
};

// Executar o teste
testGetUsers().then(() => {
  console.log('Teste concluído');
}).catch(error => {
  console.error('Erro ao executar teste:', error);
});
