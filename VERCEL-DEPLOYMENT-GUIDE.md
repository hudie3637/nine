# 🚀 Vercel 部署完整指南

## 🔧 部署前准备工作

### 1. 环境变量配置

在 Vercel 项目设置中需要配置以下环境变量：

#### 必需环境变量：
```
# Supabase 数据库配置
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 豆包 API 配置
VITE_DOUBAO_API_KEY=your_doubao_api_key

# 图像生成 API 配置
VITE_ARK_API_KEY=your_ark_api_key

# Stripe 支付配置（可选）
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 2. Supabase 数据库设置

确保你的 Supabase 项目已经按照 `DATABASE-GUIDE.md` 完成了以下设置：

- 创建了所需的表结构（analysis_records, houses, payments）
- 配置了存储桶（floor-plan-images）
- 设置了正确的 RLS（行级别安全）策略

### 3. 豆包 API 配置

确保你已经在豆包平台申请了 API 密钥，并开通了以下模型的访问权限：
- doubao-seed-2-0-mini-260215（用于户型分析）
- doubao-seedream-4-0-250828（用于图像生成）

## 📤 部署方式选择

### 方式一：GitHub 集成部署（推荐）

1. **推送代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Vercel deployment"
   git remote add origin https://github.com/yourusername/architecture-fengshui.git
   git push -u origin main
   ```

2. **连接 Vercel**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - Vercel 会自动检测到这是 Vite + React 项目

3. **配置环境变量**
   - 在 Vercel 项目设置中，进入 "Environment Variables"
   - 添加上述所有必需的环境变量

4. **部署**
   - Vercel 会自动开始部署
   - 部署完成后会提供一个 `.vercel.app` 的临时域名

### 方式二：Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   vercel
   ```

4. **配置环境变量**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add VITE_DOUBAO_API_KEY
   vercel env add VITE_ARK_API_KEY
   ```

## ⚙️ 项目配置说明

### 已完成的配置文件：

1. **vercel.json** - Vercel 部署配置
   - 配置了 API 路由重写规则
   - 设置了安全头信息
   - 配置了函数运行时环境

2. **API 路由文件**
   - `/api/analyze.ts` - 户型分析接口
   - `/api/generate-image.ts` - 图像生成接口

3. **package.json 更新**
   - 添加了 `vercel-build` 脚本
   - 安装了 `@vercel/node` 依赖

## 🔍 部署后验证

### 1. 基础功能测试
访问部署后的网站，测试：
- ✅ 页面正常加载
- ✅ 户型图上传功能
- ✅ 分析结果显示
- ✅ 图像生成功能

### 2. API 接口测试
可以通过以下方式测试 API：
```bash
# 测试分析接口
curl -X POST https://your-domain.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "your_base64_image", "userId": "test-user"}'

# 测试图像生成接口
curl -X POST https://your-domain.vercel.app/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "现代简约风格客厅设计", "style": "modern"}'
```

### 3. 数据库连接测试
检查 Supabase 数据库是否正常工作：
- 分析记录是否能正确保存
- 图片是否能正确上传到存储桶
- 查询功能是否正常

## 🛠️ 常见问题解决

### 1. 环境变量未生效
- 检查环境变量名称是否正确（注意 VITE_ 前缀）
- 确认环境变量作用域设置为 Production
- 重新部署项目使环境变量生效

### 2. API 请求失败
- 检查豆包 API 密钥是否正确配置
- 确认 API 配额是否充足
- 查看 Vercel 函数日志排查具体错误

### 3. 数据库连接问题
- 验证 Supabase URL 和密钥是否正确
- 检查数据库表结构是否完整
- 确认 RLS 策略配置正确

### 4. 图片上传失败
- 检查 Supabase 存储桶配置
- 确认存储桶权限设置
- 验证图片大小是否超过限制

## 🔄 持续集成

### 自动部署设置
- 在 GitHub 仓库中启用 GitHub Actions（可选）
- 配置自动测试流程
- 设置预发布环境

### 监控和日志
- 使用 Vercel Analytics 监控性能
- 配置错误跟踪服务
- 设置自定义域名监控

## 📊 性能优化建议

### 1. 缓存策略
- 配置静态资源缓存头
- 启用边缘网络缓存
- 优化图片加载策略

### 2. 代码分割
- 启用 React.lazy 和 Suspense
- 优化 bundle 大小
- 实施预加载策略

### 3. 数据库优化
- 添加适当的索引
- 优化查询语句
- 实施连接池管理

## 🔒 安全考虑

### 1. API 安全
- 实施请求频率限制
- 添加身份验证机制
- 配置 CORS 策略

### 2. 数据安全
- 启用数据库加密
- 实施数据备份策略
- 配置访问日志记录

### 3. 应用安全
- 定期更新依赖包
- 实施内容安全策略
- 配置 HTTPS 强制跳转

---

部署成功后，你可以：
1. 绑定自定义域名
2. 配置 SSL 证书
3. 设置 CDN 加速
4. 集成监控告警

有任何部署问题，请参考 Vercel 官方文档或联系技术支持。