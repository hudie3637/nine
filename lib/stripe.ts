import { Stripe } from 'stripe';

// 从环境变量获取 Stripe 密钥
// 兼容浏览器和 Node.js 环境
const stripeSecretKey = typeof import.meta !== 'undefined' 
  ? import.meta.env?.VITE_STRIPE_SECRET_KEY 
  : process.env.VITE_STRIPE_SECRET_KEY;

const stripePublishableKey = typeof import.meta !== 'undefined'
  ? import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY
  : process.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripeSecretKey) {
  console.warn('警告: VITE_STRIPE_SECRET_KEY 未配置，Stripe 功能将不可用');
}

export const stripeClient = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2026-01-28.clover',
}) : null;

export const STRIPE_PUBLISHABLE_KEY = stripePublishableKey;

// 支付相关操作
export const paymentOperations = {
  // 创建支付会话
  async createCheckoutSession(amount: number, currency: string = 'cny', successUrl: string, cancelUrl: string) {
    if (!stripeClient) {
      throw new Error('Stripe 客户端未初始化');
    }

    try {
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card', 'wechat_pay', 'alipay'],
        payment_method_options: {
          wechat_pay: {
            client: 'web'
          }
        },
        line_items: [{
          price_data: {
            currency: currency,
            unit_amount: Math.round(amount * 100), // Stripe 使用分作为单位
            // 注意：中国地区最低金额为¥4.00，即400分
            product_data: {
              name: '九衡居高级会员',
              description: '风水分析高级服务',
            },
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          service: 'fengshui-analysis',
        },
      });

      return session;
    } catch (error: any) {
      console.error('创建支付会话失败:', error);
      throw error;
    }
  },

  // 检查支付状态
  async checkPaymentStatus(sessionId: string) {
    if (!stripeClient) {
      throw new Error('Stripe 客户端未初始化');
    }

    try {
      const session = await stripeClient.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error: any) {
      console.error('检查支付状态失败:', error);
      throw error;
    }
  },
};

// 类型定义
export interface PaymentSession {
  id: string;
  url: string;
  status: 'open' | 'complete' | 'expired';
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
}