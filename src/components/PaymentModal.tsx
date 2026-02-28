import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Shield, Check, Star, Crown } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { paymentOperations } from '../../lib/stripe';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, currentUser }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);

    try {
      // 创建支付会话
      const session = await paymentOperations.createCheckoutSession(
        4.00, // 价格 ¥4.00
        'cny',
        `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        `${window.location.origin}/cancel`
      );

      // 重定向到 Stripe Checkout
      window.location.href = session.url;
    } catch (err: any) {
      console.error('支付失败:', err);
      setError(err.message || '支付处理失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    '无限次户型图风水分析',
    '查看完整优化建议和改造方案',
    'AI 生成装修效果图',
    '专属客服支持',
    '优先功能体验权'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">升级高级会员</h2>
                  <p className="text-white/90 text-sm">解锁全部风水分析功能</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Price */}
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-stone-800">¥4</span>
                  <span className="text-stone-500">/ 一次性</span>
                </div>
                <p className="text-stone-600 mt-2">超值体验价，立即享受完整服务</p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  会员特权
                </h3>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-stone-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Security */}
              <div className="flex items-center gap-2 text-stone-500 text-sm">
                <Shield className="w-4 h-4" />
                <span>支持微信支付、支付宝、银行卡等多种支付方式</span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-center hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    立即升级 - ¥4.00
                  </>
                )}
              </button>

              <p className="text-center text-xs text-stone-500">
                点击按钮后将跳转至安全支付页面
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}