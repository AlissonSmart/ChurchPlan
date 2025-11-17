import { createClient } from '@supabase/supabase-js';

// Substitua estas constantes pelos seus valores reais do Supabase
const SUPABASE_URL = 'https://hqznokiwjhxxaiuhgcfy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxem5va2l3amh4eGFpdWhnY2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzIyNDMsImV4cCI6MjA3ODk0ODI0M30.XSFzIQYhchMYlOwW-rJmEsarN8v3PqUObwh-zgxVIXc';

// Cria um cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para testar login
async function testLogin() {
  try {
    console.log('Tentando fazer login...');
    
    // Tentativa de login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'eualissonmartins@gmail.com',
      password: '123456'
    });
    
    if (error) {
      console.error('Erro ao fazer login:', error.message);
      
      // Verificar se o usuário existe
      console.log('Verificando se o usuário existe...');
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error('Erro ao listar usuários:', userError.message);
      } else if (userData) {
        const users = userData.users || [];
        const user = users.find(u => u.email === 'eualissonmartins@gmail.com');
        
        if (user) {
          console.log('Usuário encontrado no banco de dados:', user);
        } else {
          console.log('Usuário não encontrado no banco de dados');
          
          // Criar um novo usuário
          console.log('Criando um novo usuário...');
          const { data: newUser, error: createError } = await supabase.auth.signUp({
            email: 'eualissonmartins@gmail.com',
            password: '123456',
            options: {
              data: {
                name: 'Alisson Martins'
              }
            }
          });
          
          if (createError) {
            console.error('Erro ao criar usuário:', createError.message);
          } else {
            console.log('Novo usuário criado:', newUser);
          }
        }
      }
    } else {
      console.log('Login bem-sucedido!');
      console.log('Usuário:', data.user);
      console.log('Sessão:', data.session);
    }
  } catch (err) {
    console.error('Erro inesperado:', err.message);
  }
}

// Executar o teste
testLogin();
