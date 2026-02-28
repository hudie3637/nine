import { createClient } from '@supabase/supabase-js';

// 正确声明 ImportMeta 接口
interface ImportMeta {
  env: {
    VITE_SUPABASE_URL?: string;
    VITE_SUPABASE_ANON_KEY?: string;
  };
}

// Supabase 配置
const supabaseUrl = typeof import.meta !== 'undefined'
  ? import.meta.env?.VITE_SUPABASE_URL || ''
  : process.env.VITE_SUPABASE_URL || '';

const supabaseAnonKey = typeof import.meta !== 'undefined'
  ? import.meta.env?.VITE_SUPABASE_ANON_KEY || ''
  : process.env.VITE_SUPABASE_ANON_KEY || '';

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 用户认证相关操作
export const authOperations = {
  // 登录
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // 注册
  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // 登出
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 获取当前用户
  async getCurrentUser() {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session && typeof session === 'object' && 'user' in session) {
        return session.user || null;
      }
      return null;
    } catch (error) {
      console.error('获取当前用户失败:', error);
      return null;
    }
  },
};

// 初始化 Supabase Auth 监听器
export const initSupabaseAuthListener = (callback: (session: any) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session);
    }
  );

  return subscription;
};