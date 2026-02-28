// Stripe Webhook 处理器
import express from 'express';
import { stripeClient } from './lib/stripe';
import { supabase } from './lib/supabase';
import { Buffer } from 'buffer';

const app = express();

// 中间件配置
app.use(express.raw({ type: 'application/json' }));
app.use(express.json());

// Stripe webhook 端点
app.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Missing Stripe signature or webhook secret');
    return res.status(400).send('Webhook Error: Missing signature or secret');
  }

  let event;

  try {
    // 验证 webhook 签名
    event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 处理不同的事件类型
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutCompleted(session);
      break;

    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSucceeded(paymentIntent);
      break;

    case 'customer.subscription.created':
      const subscription = event.data.object;
      await handleSubscriptionCreated(subscription);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// 处理支付完成事件
async function handleCheckoutCompleted(session: any) {
  try {
    console.log('Processing checkout session:', session.id);
    
    // 更新用户的会员状态
    if (session.metadata?.userId) {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_premium: true,
          premium_since: new Date().toISOString()
        })
        .eq('id', session.metadata.userId);

      if (error) {
        console.error('Failed to update user premium status:', error);
        throw error;
      }

      console.log('Successfully updated user premium status');
    }

    // 记录支付信息
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: session.metadata?.userId,
        amount: session.amount_total / 100, // 转换为美元
        currency: session.currency,
        status: 'completed',
        payment_method: session.payment_method_types?.[0] || 'card',
        transaction_id: session.payment_intent,
        metadata: {
          sessionId: session.id,
          customerId: session.customer,
          productId: session.metadata?.productId
        }
      });

    if (paymentError) {
      console.error('Failed to record payment:', paymentError);
    }

  } catch (error) {
    console.error('Error processing checkout completion:', error);
  }
}

// 处理支付成功事件
async function handlePaymentSucceeded(paymentIntent: any) {
  console.log('Payment succeeded:', paymentIntent.id);
  // 可以在这里添加额外的业务逻辑
}

// 处理订阅创建事件
async function handleSubscriptionCreated(subscription: any) {
  console.log('Subscription created:', subscription.id);
  // 可以在这里处理订阅相关的逻辑
}

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Stripe webhook server running on port ${PORT}`);
});

export default app;