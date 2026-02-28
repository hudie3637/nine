import React from 'react';
import { Link } from 'react-router-dom';

export default function PsychologyPage() {
  return (
    <div className="bg-paper flex flex-col max-w-md mx-auto w-full">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-stone-800 font-semibold">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          动线心理分析
        </div>
        <Link to="/" className="text-stone-500 hover:text-stone-700">
          返回首页
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Banner */}
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-stone-800 mb-3">动线心理分析</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            基于环境心理学原理，分析户型中的人流路径与心理感受
          </p>
        </div>

        {/* Detailed Content */}
        <div className="space-y-6">
          <section className="pt-4">
            <h2 className="text-lg font-serif font-bold text-stone-800 mb-2">动线分析原理</h2>
            <p className="text-stone-600 leading-relaxed">
              动线是指人在室内活动的路径。我们结合环境心理学，分析户型中的"家务动线"、"访客动线"与"居住动线"是否交叉干扰。
            </p>
          </section>

          <section className="pt-4">
            <h2 className="text-lg font-serif font-bold text-stone-800 mb-2">核心要素</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>动线类型：</strong>家务动线（厨房-餐厅-卫生间）、访客动线（入户-客厅-阳台）、居住动线（卧室-卫生间-书房）
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>心理影响：</strong>动线交叉会产生心理压力，合理的动线设计能提升居住者的安全感与私密性
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>优化原则：</strong>动静分区、避免交叉、保证私密性、符合人体工程学
                </div>
              </li>
            </ul>
          </section>

          <section className="pt-4">
            <h2 className="text-lg font-serif font-bold text-stone-800 mb-2">AI分析优势</h2>
            <p className="text-stone-600 leading-relaxed">
              传统动线分析依赖人工观察和经验判断，我们的AI系统可自动识别户型图，量化分析动线长度、交叉点数量、私密性指数等指标，提供数据驱动的心理学评估报告。
            </p>
          </section>
        </div>

        {/* Action Button */}
        <div className="pt-6">
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
        灵境筑居 AI · 动线心理分析模块
      </footer>
    </div>
  );
}