<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/03593938-16f7-476a-bb6d-03830e3deef4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. 配置豆包API密钥
3. (可选) 如果需要数据库功能，配置 Supabase：
   - 在 [.env.local](.env.local) 中设置 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
   - 创建必要的数据库表（参考下方说明）
4. Run the app:
   `npm run dev`

## Supabase 数据库配置（可选）

如果需要持久化存储用户数据和分析历史，可以配置 Supabase：

### 必要的数据库表结构：

```sql
-- 用户资料表
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT
);

-- 户型分析记录表
CREATE TABLE floor_plan_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 0 AND overall_rating <= 100),
  title TEXT
);

-- 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
BEFORE UPDATE ON user_profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### RLS (Row Level Security) 策略：

```sql
-- 用户只能访问自己的资料
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 用户只能访问自己的分析记录
ALTER TABLE floor_plan_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analyses" ON floor_plan_analyses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON floor_plan_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own analyses" ON floor_plan_analyses
  FOR DELETE USING (auth.uid() = user_id);
```
