import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://liwavtpryosufctmqxfh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HmneBklQp6MTK7U9dcgL_A_KUZasng6';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Profile = {
  id: string;
  email: string;
  plan: 'free' | 'premium';
  ai_chat_count: number;
  created_at: string;
};
