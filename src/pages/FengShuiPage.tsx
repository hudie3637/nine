import React from 'react';
import { Link } from 'react-router-dom';

export default function FengShuiPage() {
  const BaguaIcon = () => (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-primary">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M50 10 L50 90 M10 50 L90 50" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="30" r="8" fill="currentColor" />
      <circle cx="50" cy="70" r="8" fill="currentColor" />
    </svg>
  );

  return (
    <div className="bg-paper flex flex-col max-w-md mx-auto w-full">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-stone-800 font-semibold">
          <BaguaIcon />
          风水九宫分析
        </div>
        <Link to="/" className="text-stone-500 hover:text-stone-700">
          返回首页
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Banner */}
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-stone-800 mb-3">风水九宫分析</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            将住宅平面按洛书九宫格划分，AI算法精准定位各功能区位置
          </p>
        </div>

        {/* Bagua Diagram */}
        <div className="flex flex-col items-center">
          <img 
            src="https://pic.616pic.com/ys_bnew_img/00/45/78/DHsue50bm9.jpg" 
            alt="后天八卦图" 
            className="w-full max-w-md rounded-xl border border-stone-200 shadow-lg mb-4"
          />
          <p className="text-xs text-stone-500 italic">
            后天八卦方位图：乾兑离震巽坎艮坤对应西北、正西、正南、正东、东南、正北、东北、西南八方
          </p>
        </div>

        {/* Detailed Content */}
        <div className="space-y-6">
          <section className="pt-4">
            <h2 className="text-lg font-serif font-bold text-stone-800 mb-2">九宫分析原理</h2>
            <p className="text-stone-600 leading-relaxed">
              将住宅平面按洛书九宫格划分，中心为中宫（土），周围八宫对应八卦方位与五行属性。AI算法通过图像识别技术，精准定位户型各功能区在九宫中的位置，分析五行能量分布。
            </p>
          </section>

          <section className="pt-4">
            <h2 className="text-lg font-serif font-bold text-stone-800 mb-2">核心要素</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>方位对应：</strong>乾（西北-金）、兑（正西-金）、离（正南-火）、震（正东-木）、巽（东南-木）、坎（正北-水）、艮（东北-土）、坤（西南-土）
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>五行生克：</strong>木生火、火生土、土生金、金生水、水生木；木克土、土克水、水克火、火克金、金克木
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>缺角影响：</strong>某宫位缺失会导致对应五行能量不足，影响居住者相应运势（如西北缺角影响男主人事业运）
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>能量平衡：</strong>通过色彩、材质、摆件等调整，实现五行能量的和谐平衡
                </div>
              </li>
            </ul>
          </section>

          <section className="pt-4">
            <h2 className="text-lg font-serif font-bold text-stone-800 mb-2">AI分析优势</h2>
            <p className="text-stone-600 leading-relaxed">
              传统风水需人工测量计算，我们的AI系统可自动识别户型图，快速完成九宫定位、五行分析、缺角诊断，提供科学化、可视化的风水评估报告。
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
        灵境筑居 AI · 风水九宫分析模块
      </footer>
    </div>
  );
}