import React from 'react';
import { Link } from 'react-router-dom';

export default function LightingPage() {
  return (
    <div className="bg-paper flex flex-col max-w-md mx-auto w-full">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-stone-800 font-semibold">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          采光通风分析
        </div>
        <Link to="/" className="text-stone-500 hover:text-stone-700">
          返回首页
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Banner */}
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-stone-800 mb-3">采光通风分析</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            基于环境物理参数，科学评估采光与空气流通质量
          </p>
        </div>

        {/* Detailed Content */}
        <div className="space-y-6">
          <section className="pt-4">
            <h2 className="text-lg font-serif font-bold text-stone-800 mb-2">采光通风原理</h2>
            <p className="text-stone-600 leading-relaxed">
              采光和通风是影响居住舒适度的重要因素。我们结合建筑物理学原理，分析户型的窗户朝向、面积、位置等因素，评估自然光摄入和空气流通效果。
            </p>
          </section>

          <section className="pt-4">
            <h2 className="text-lg font-serif font-bold text-stone-800 mb-2">核心要素</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>采光指标：</strong>采光系数、日照时数、眩光指数、光线均匀度
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>通风指标：</strong>换气次数、风速分布、空气流动路径、通风效率
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>健康影响：</strong>充足采光有助于维生素D合成，良好通风可降低室内污染物浓度
                </div>
              </li>
            </ul>
          </section>

          <section className="pt-4">
            <h2 className="text-lg font-serif font-bold text-stone-800 mb-2">AI分析优势</h2>
            <p className="text-stone-600 leading-relaxed">
              传统采光通风评估依赖人工测量和经验判断，我们的AI系统可自动识别户型图中的窗户位置、大小和朝向，结合地理位置数据，精确计算采光和通风指标，提供科学化的改善建议。
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
        灵境筑居 AI · 采光通风分析模块
      </footer>
    </div>
  );
}