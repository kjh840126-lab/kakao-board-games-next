import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eogtjzeodbriahwmaqfw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_A_DKwqE7Ygs2VAiKSSuVxQ_YyjhXfgb';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('⚠️ Supabase URL이 .env.local 파일에 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);