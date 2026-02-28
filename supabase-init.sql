-- Supabase 数据库初始化脚本
-- 在 Supabase 控制台的 SQL Editor 中执行此脚本

-- 1. 创建用户资料表
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT
);

-- 2. 创建户型分析记录表
CREATE TABLE IF NOT EXISTS floor_plan_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 0 AND overall_rating <= 100),
  title TEXT
);

-- 3. 创建自动更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. 为 user_profiles 表添加触发器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
BEFORE UPDATE ON user_profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. 设置 RLS (Row Level Security) 策略

-- 用户资料表 RLS 策略
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的资料
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 用户可以创建自己的资料
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 用户可以更新自己的资料
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 户型分析表 RLS 策略
ALTER TABLE floor_plan_analyses ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的分析记录
DROP POLICY IF EXISTS "Users can view own analyses" ON floor_plan_analyses;
CREATE POLICY "Users can view own analyses" ON floor_plan_analyses
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建自己的分析记录
DROP POLICY IF EXISTS "Users can insert own analyses" ON floor_plan_analyses;
CREATE POLICY "Users can insert own analyses" ON floor_plan_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的分析记录
DROP POLICY IF EXISTS "Users can delete own analyses" ON floor_plan_analyses;
CREATE POLICY "Users can delete own analyses" ON floor_plan_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- 6. 创建自动创建用户资料的函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email::TEXT));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 创建触发器，在用户注册时自动创建用户资料
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. 验证表创建成功
SELECT 'Tables created successfully!' as status;