import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// 加载环境变量
dotenv.config();

// ========== 新增：初始化Supabase客户端（全局可用） ==========
export const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置（优化：增加文件大小限制，适配图片Base64传输）
app.use(cors());
app.use(express.json({ limit: '20mb' })); // 增大限制，支持大图片
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// API路由（保留原有接口 + 新增历史查询接口）
import analyzeHandler, { getHistoryRecords } from './src/api/analyze.ts';
import generateImageHandler from './src/api/generate-image.ts';


// 原有接口
app.post('/api/analyze', analyzeHandler);
app.post('/api/generate-image', generateImageHandler);


// ========== 新增：历史记录查询接口 ==========
app.get('/api/analysis-history', getHistoryRecords);

// ========== 新增：健康检查接口（可选，方便调试） ==========
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT,
    env: {
      SUPABASE_URL: (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) ? '配置完成' : '未配置',
      SUPABASE_ANON_KEY: (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY) ? '配置完成' : '未配置',
      QWEN_API_KEY: process.env.QWEN_API_KEY ? '配置完成' : '未配置'
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  // 启动时验证Supabase连接（可选）
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
    console.log('✅ Supabase客户端初始化完成');
  } else {
    console.warn('⚠️ Supabase配置缺失，请检查VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY环境变量');
  }
});