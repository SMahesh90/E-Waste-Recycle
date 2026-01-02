import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jxjbolsmhavmnhixlwfs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4amJvbHNtaGF2bW5oaXhsd2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNTE0MzEsImV4cCI6MjA4MjkyNzQzMX0.wYygvHpk39HAAli8orgzgOC6Pfmp9H3ZYIGHM1OauLA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);