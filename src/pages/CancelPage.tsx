import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authOperations, initSupabaseAuthListener } from '../../lib/supabase-updated';

export default function CancelPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  // 在页面加载时检查用户登录状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      const user = await authOperations.getCurrentUser();
      setCurrentUser(user);
    };
    
    checkAuthStatus();
    
    // 监听认证状态变化
    const subscription = initSupabaseAuthListener((session) => {
      setCurrentUser(session?.user || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="bg-paper flex flex-col max-w-md mx-auto w-full min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-stone-800 font-semibold">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          支付取消
        </div>
        <div></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-amber-600" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">支付已取消</h1>
          <p className="text-stone-600 mb-6">
            您已取消支付。不用担心，您可以随时回来完成升级。
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-amber-800 mb-2">为什么选择高级会员？</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 无限次户型图分析</li>
              <li>• 完整优化建议查看</li>
              <li>• AI 装修效果图生成</li>
              <li>• 专业客服支持</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link 
              to="/" 
              className="block w-full py-3 bg-primary text-white rounded-lg font-medium text-center hover:bg-primary/90 transition-colors"
            >
              返回首页
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="block w-full py-3 bg-white text-primary border border-primary rounded-lg font-medium text-center hover:bg-primary/5 transition-colors"
            >
              重新尝试支付
            </button>
          </div>
        </div>


      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 px-6 py-4 text-center text-stone-500 text-sm">
        灵境筑居 AI · 支付取消页面
      </footer>
    </div>
  );
}