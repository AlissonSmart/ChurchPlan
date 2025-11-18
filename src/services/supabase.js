import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Substitua estas constantes pelos seus valores reais do Supabase
const SUPABASE_URL = 'https://hqznokiwjhxxaiuhgcfy.supabase.co';

// Chave anônima para uso normal
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxem5va2l3amh4eGFpdWhnY2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzIyNDMsImV4cCI6MjA3ODk0ODI0M30.XSFzIQYhchMYlOwW-rJmEsarN8v3PqUObwh-zgxVIXc';

// Chave de serviço para testes e operações privilegiadas
// ATENÇÃO: Esta chave tem permissões completas no banco de dados
// Em produção, você deve usar a chave anônima e configurar RLS adequadamente
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxem5va2l3amh4eGFpdWhnY2Z5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM3MjI0MywiZXhwIjoyMDc4OTQ4MjQzfQ.Bh4AGnPM-bZ2DjAJZxwsXADgj5DwrUEMzLGIvKOdO94';

// Usar a chave de serviço para testes
// Em produção, você deve mudar de volta para SUPABASE_ANON_KEY
const SUPABASE_KEY_TO_USE = SUPABASE_SERVICE_KEY;

// Cria um cliente Supabase personalizado para React Native
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY_TO_USE, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true, // Garante que a sessão seja persistente
    detectSessionInUrl: false,
    flowType: 'pkce', // Usar PKCE para autenticação mais segura em apps móveis
  },
  localStorage: AsyncStorage, // Adiciona o AsyncStorage como localStorage
});

export default supabase;
