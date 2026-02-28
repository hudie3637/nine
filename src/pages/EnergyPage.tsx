import React from 'react';
import { Link } from 'react-router-dom';

export default function EnergyPage() {
  return (
    <div className="bg-paper flex flex-col max-w-md mx-auto w-full">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-stone-800 font-semibold">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          五行能量分析
        </div>
        <Link to="/" className="text-stone-500 hover:text-stone-700">
          返回首页
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Banner */}
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-stone-800 mb-3">五行能量分析</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            可视化呈现全屋五行强弱，平衡家居能量场
          </p>
        </div>

        {/* Detailed Content */}
        <div className="space-y-6">
          <section className="pt-4">
            <h2 className="text-lg font-serif font-bold text-stone-800 mb-2">五行能量原理</h2>
            <p className="text-stone-600 leading-relaxed">
              五行（金、木、水、火、土）是构成宇宙万物的基本元素。在住宅中，不同方位、材质、色彩对应不同的五行属性，影响居住者的身心健康和运势。
            </p>
          </section>

          <section className="pt-4">
            <h2 className="text-lg font-serif font-bold text-stone-800 mb-2">核心要素</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>五行对应：</strong>金（白色、金属、圆形）、木（绿色、木材、长形）、水（黑色、液体、波浪形）、火（红色、火焰、三角形）、土（黄色、陶瓷、方形）
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>能量分布：</strong>通过AI分析户型图，量化各区域的五行能量强度，生成能量热力图
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>平衡调整：</strong>根据能量分布结果，提供针对性的色彩、材质、摆件调整方案
                </div>
              </li>
            </ul>
          </section>

          <section className="pt-4">
            <h2 className="text-lg font-serif font-bold text-stone-800 mb-2">AI分析优势</h2>
            <p className="text-stone-600 leading-relaxed">
              传统五行分析依赖经验判断，我们的AI系统可自动识别户型图中的材质、色彩、形状等特征，精确计算各区域的五行能量值，提供科学化、可视化的能量平衡方案。
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
        灵境筑居 AI · 五行能量分析模块
      </footer>
    </div>
  );
}