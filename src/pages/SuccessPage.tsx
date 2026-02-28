import React from 'react';
import { Link } from 'react-router-dom';

export default function SuccessPage() {
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

        {/* Action Button */}
        <div className="pt-8">
          <Link 
            to="/" 
            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-center hover:bg-primary/90 transition-colors"
          >
            返回首页
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