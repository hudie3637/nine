-- Supabase 数据库完整初始化脚本
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

-- 3. 创建房屋信息表
CREATE TABLE IF NOT EXISTS houses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  direction TEXT,
  sitting_facing TEXT,
  build_year INTEGER,
  area_size NUMERIC,
  city TEXT,
  description TEXT
);

-- 4. 创建分析记录表
CREATE TABLE IF NOT EXISTS analysis_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  house_id UUID REFERENCES houses ON DELETE CASCADE NOT NULL,
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score 