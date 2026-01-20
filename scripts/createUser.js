import { createClient } from '@supabase/supabase-js';

// Substitua estas constantes pelos seus valores reais do Supabase
const SUPABASE_URL = 'https://hqznokiwjhxxaiuhgcfy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxem5va2l3amh4eGFpdWhnY2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzIyNDMsImV4cCI6MjA3ODk0ODI0M30.XSFzIQYhchMYlOwW-rJmEsarN8v3PqUObwh-zgxVIXc';

// Cria um cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para criar um usuário
const createUser = async () => {
  try {
    // Primeiro, vamos tentar criar o usuário
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'eualissonmartins@gmail.com',
      password: '123456',
      options: {
        data: {
          name: 'Alisson Martins'
        },
        // Desabilita a verificação de e-mail para este usuário
        emailRedirectTo: null
      }
    });
    
    if (signUpError) {
      console.error('Erro ao criar usuário:', signUpError.message);
      
      // Se o erro for que o usuário já existe, vamos tentar fazer login
      if (signUpError.message.includes('already exists')) {
        console.log('Usuário já existe, tentando fazer login...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'eualissonmartins@gmail.com',
          password: '123456'
        });
        
        if (signInError) {
          console.error('Erro ao fazer login:', signInError.message);
        } else {
          console.log('Login realizado com sucesso!');
          console.log('Usuário:', signInData.user);
        }
      }
    } else {
      console.log('Usuário criado com sucesso!');
      console.log('Usuário:', signUpData.user);
      
      // Se o usuário foi criado com sucesso, vamos tentar atualizar para que ele não precise verificar o e-mail
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        email_confirm: true
      });
      
      if (updateError) {
        console.error('Erro ao confirmar e-mail do usuário:', updateError.message);
      } else {
        console.log('E-mail confirmado com sucesso!');
      }
    }
  } catch (error) {
    console.error('Erro inesperado:', error.message);
  }
};

// Executar a função
createUser();
