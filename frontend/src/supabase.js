import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qsxqkhfcavcfrdzfegru.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzeHFraGZjYXZjZnJkemZlZ3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0Mzk0OTAsImV4cCI6MjA5NTAxNTQ5MH0.dSEl8TOEuGalMkeq9RgoC_5mW0xfGVhNv7AsX9imoT4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
