import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 用户资料相关操作
export const userProfileOperations = {
  // 获取用户资料
  async getUserProfile(userId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('获取用户资料失败:', error);
      return null;
    }
    return data;
  },

  // 创建或更新用户资料
  async upsertUserProfile(profile: any): Promise<any | null> {
    // 确保包含必要的用户信息字段
    const userProfile = {
      id: profile.id,
      email: profile.email || '',
      name: profile.name || '',
      avatar_url: profile.avatar_url || '',
      gender: profile.gender || '',
      birthday: profile.birthday || '',
      created_at: profile.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(userProfile)
      .select()
      .single();

    if (error) {
      console.error('创建/更新用户资料失败:', error);
      return null;
    }
    return data;
  },
};

// 房屋信息相关操作
export const houseOperations = {
  // 获取用户的所有房屋
  async getUserHouses(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('houses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取用户房屋失败:', error);
      return [];
    }
    return data || [];
  },

  // 创建房屋信息
  async createHouse(houseData: any): Promise<any | null> {
    const { data, error } = await supabase
      .from('houses')
      .insert(houseData)
      .select()
      .single();

    if (error) {
      console.error('创建房屋信息失败:', error);
      return null;
    }
    return data;
  },
};

// 分析记录相关操作
export const analysisOperations = {
  // 保存分析记录
  async saveAnalysisRecord(
    userId: string,
    houseId: string,
    totalScore: number,
    resultJson: any,
    summary: string,
    floorPlanImage: string = '',
    isPaid: boolean = false
  ): Promise<any | null> {
    const { data, error } = await supabase
      .from('analysis_records')
      .insert({
        user_id: userId,
        house_id: houseId,
        total_score: totalScore,
        is_paid: isPaid,
        result_json: resultJson,
        summary: summary,
        floor_plan_image: floorPlanImage,
      })
      .select()
      .single();

    if (error) {
      console.error('保存分析记录失败:', error);
      return null;
    }
    return data;
  },

  // 获取用户的历史分析记录（包含关联的房屋信息）
  async getUserAnalysisRecords(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('analysis_records')
      .select(`
        *,
        houses:house_id (*, floor_plan_image)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取分析历史失败:', error);
      return [];
    }
    
    // 处理返回的数据，确保 houses 字段存在
    return (data || []).map(record => {
      // 如果 houses 存在且是对象，提取 floor_plan_image
      const house = record.houses && typeof record.houses === 'object' ? record.houses : null;
      return {
        ...record,
        house_image_url: house?.floor_plan_image || null
      };
    });
  },
};

// 支付相关操作
export const paymentOperations = {
  // 创建支付记录
  async createPayment(
    userId: string,
    amount: number,
    platform: string,
    paymentType: string,
    orderId: string
  ): Promise<any | null> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount: amount,
        platform: platform,
        payment_type: paymentType,
        order_id: orderId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('创建支付记录失败:', error);
      return null;
    }
    return data;
  },

  // 更新支付状态
  async updatePaymentStatus(paymentId: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from('payments')
      .update({ status: status })
      .eq('id', paymentId);

    if (error) {
      console.error('更新支付状态失败:', error);
      return false;
    }
    return true;
  },
};

// 会员订阅相关操作
export const subscriptionOperations = {
  // 获取用户当前订阅
  async getUserSubscription(userId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('获取用户订阅失败:', error);
      return null;
    }
    return data;
  },

  // 创建订阅
  async createSubscription(subscriptionData: any): Promise<any | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) {
      console.error('创建订阅失败:', error);
      return null;
    }
    return data;
  },
};

// 使用记录相关操作
export const usageOperations = {
  // 记录使用行为
  async logUsage(userId: string, actionType: string): Promise<boolean> {
    const { error } = await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        action_type: actionType,
      });

    if (error) {
      console.error('记录使用行为失败:', error);
      return false;
    }
    return true;
  },
};

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
      // session 可能是 null 或包含 user 属性的对象
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