import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { paymentOperations } from '../../lib/stripe';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setPaymentStatus('failed');
        setErrorMessage('缺少支付会话信息');
        return;
      }

      try {
        // 验证支付状态
        const session = await paymentOperations.checkPaymentStatus(sessionId);
        
        if (session.payment_status === 'paid') {
          setPaymentStatus('success');
          
          // 更新用户会员状态
          const { data: { session: userSession } } = await supabase.auth.getSession();
          if (userSession?.user) {
            const { error } = await supabase
              .from('users')
              .update({ 
                is_premium: true,
                premium_since: new Date().toISOString()
              })
              .eq('id', userSession.user.id);
            
            if (error) {
              console.error('更新会员状态失败:', error);
            }
          }
        } else {
          setPaymentStatus('failed');
          setErrorMessage('支付未完成');
        }
      } catch (error: any) {
        console.error('验证支付失败:', error);
        setPaymentStatus('failed');
        setErrorMessage(error.message || '支付验证失败');
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (paymentStatus === 'loading') {
    return (
      <div className="bg-paper flex flex-col max-w-md mx-auto w-full min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">正在验证支付结果...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="bg-paper flex flex-col max-w-md mx-auto w-full min-h-screen">
        <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-800 font-semibold">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-red-500" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            支付失败
          </div>
          <Link to="/" className="text-stone-500 hover:text-stone-700">
            返回首页
          </Link>
        </header>
        
        <main className="flex-1 px-4 py-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-red-600" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-stone-800 mb-2">支付出现问题</h1>
            <p className="text-stone-600 mb-6">{errorMessage || '很抱歉，您的支付未能成功完成。'}</p>
            
            <div className="space-y-3">
              <Link 
                to="/" 
                className="block w-full py-3 bg-primary text-white rounded-lg font-medium text-center hover:bg-primary/90 transition-colors"
              >
                返回首页
              </Link>
              <button 
                onClick={() => window.history.back()}
                className="block w-full py-3 bg-stone-100 text-stone-700 rounded-lg font-medium text-center hover:bg-stone-200 transition-colors"
              >
                重新尝试支付
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-paper flex flex-col max-w-md mx-auto w-full min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-stone-800 font-semibold">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          支付成功
        </div>
        <Link to="/" className="text-stone-500 hover:text-stone-700">
          返回首页
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-600" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L12 13.17 9.41 10.59 8 12z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">支付成功！</h1>
          <p className="text-stone-600">
            恭喜您已成功升级为高级会员，现在可以享受全部风水分析功能。
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-xl p-6 border border-stone-200">
          <h2 className="font-semibold text-stone-800 mb-4">您的会员权益包括：</h2>
          <ul className="space-y-2 text-sm text-stone-600">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              无限次户型图风水分析
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              查看完整优化建议和改造方案
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              AI 生成装修效果图
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              专属客服支持
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Link 
            to="/" 
            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-center hover:bg-primary/90 transition-colors block"
          >
            开始使用高级功能
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 px-6 py-4 text-center text-stone-500 text-sm">
        灵境筑居 AI · 支付成功页面
      </footer>
    </div>
  );
}