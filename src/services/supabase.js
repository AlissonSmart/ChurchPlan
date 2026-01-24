import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SUPABASE_URL = 'https://hqznokiwjhxxaiuhgcfy.supabase.co'; // Church Plan
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxem5va2l3amh4eGFpdWhnY2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzIyNDMsImV4cCI6MjA3ODk0ODI0M30.XSFzIQYhchMYlOwW-rJmEsarN8v3PqUObwh-zgxVIXc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;