import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Substitua estas constantes pelos seus valores reais do Supabase
const SUPABASE_URL = 'https://hqznokiwjhxxaiuhgcfy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxem5va2l3amh4eGFpdWhnY2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzIyNDMsImV4cCI6MjA3ODk0ODI0M30.XSFzIQYhchMYlOwW-rJmEsarN8v3PqUObwh-zgxVIXc';

// Cria um cliente Supabase personalizado para React Native
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true, // Garante que a sessão seja persistente
    detectSessionInUrl: false,
    flowType: 'pkce', // Usar PKCE para autenticação mais segura em apps móveis
    // Configuração para sessão de longa duração (30 dias)
    storageKey: 'churchplan-auth-token',
    // Configuração para manter a sessão por 30 dias
    cookieOptions: {
      maxAge: 30 * 24 * 60 * 60, // 30 dias em segundos
      sameSite: 'lax',
      secure: true
    }
  },
  localStorage: AsyncStorage, // Adiciona o AsyncStorage como localStorage
  // Configuração global para persistência
  persistSession: true,
});

export default supabase;
