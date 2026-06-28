import { useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // 認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // プロフィールがなければ作成
      await supabase.from('profiles').insert({
        id: userId,
        email: user?.email || '',
        plan: 'free',
        ai_chat_count: 0,
      });
      setProfile({ id: userId, email: user?.email || '', plan: 'free', ai_chat_count: 0, created_at: new Date().toISOString() });
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const canUseAI = () => {
    if (!profile) return false;
    if (profile.plan === 'premium') return true;
    return profile.ai_chat_count < 3;
  };

  const incrementAICount = async () => {
    if (!profile || !user) return;
    const newCount = profile.ai_chat_count + 1;
    await supabase.from('profiles').update({ ai_chat_count: newCount }).eq('id', user.id);
    setProfile({ ...profile, ai_chat_count: newCount });
  };

  return { user, profile, loading, signUp, signIn, signInWithGoogle, signOut, canUseAI, incrementAICount };
}
