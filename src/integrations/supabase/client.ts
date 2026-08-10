import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Encapsulated Supabase client initialization with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aurafin-demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
