# Stripe 支付配置说明

## 环境变量配置

在 `.env.local` 文件中需要配置以下 Stripe 相关变量：

```env
# STRIPE CONFIGURATION
VITE_STRIPE_SECRET_KEY="sk_test_..."        # Stripe 私钥（服务器端）
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."   # Stripe 公钥（客户端）
STRIPE_WEBHOOK_SECRET="whsec_..."           # Webhook 签名密钥
```

## 获取 Stripe 密钥的步骤

1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 登录或注册账户
3. 进入 Developers → API keys
4. 复制 Publishable key 和 Secret key
5. 进入 Webhooks 设置页面创建 webhook endpoint

## Webhook 配置

### 本地开发环境
```bash
# 使用 Stripe CLI 测试 webhook
stripe listen --forward-to localhost:3001/webhook/stripe
```

### 生产环境
在 Stripe Dashboard 中配置 webhook endpoint：
- URL: `https://your-domain.com/webhook/stripe`
- 事件类型: 
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `customer.subscription.created`

## 启动 Webhook 服务器

```bash
# 启动 webhook 处理服务器
npm run start:webhook
```

## 数据库表结构要求

确保数据库中有以下表：

```sql
-- 用户表（如果不存在）
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_since TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 支付记录表
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 测试支付流程

1. 确保所有环境变量已正确配置
2. 启动主应用：`npm run dev`
3. 启动 webhook 服务器：`npm run start:webhook`
4. 在应用中点击升级会员按钮
5. 使用 Stripe 提供的测试卡号完成支付
6. 验证支付成功页面和用户权限更新

## 常见问题

### Webhook 签名验证失败
- 检查 `STRIPE_WEBHOOK_SECRET` 是否正确
- 确保 webhook 端点 URL 正确配置

### 支付按钮无响应
- 检查 Stripe publishable key 是否正确
- 确认网络连接正常

### 用户权限未更新
- 检查数据库连接是否正常
- 验证 webhook 是否正确接收和处理事件