import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Upload, 
  Compass, 
  Brain, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Home,
  Info,
  Maximize2,
  Sparkles,
  ArrowRight,
  FileText,
  Layers,
  User,
  Layout,
  Eye,
  Lightbulb,
  Wind,
  Bed,
  Utensils,
  Lock,
  Plus,
  Crown,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import PaymentModal from './components/PaymentModal';
import html2canvas from 'html2canvas-pro';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ========== 初始化 Supabase 客户端（前端） ==========
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// 图片验证结果显示组件


// ========== 防抖工具函数 ==========
function debounce<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timer: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(fn(...args)), delay);
    });
  };
}

// ========== API 调用函数 ==========
async function callDoubaoAPI(prompt: string, imageBase64?: string, userId?: string) {
  const apiKey = import.meta.env.VITE_DOUBAO_API_KEY || '';
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://fengshui-backend-4i5o.onrender.com';
  
  if (!apiKey) {
    throw new Error('DOUBAO_API_KEY is not configured');
  }

  const response = await fetch(`${apiBaseUrl}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      imageBase64,
      userId: userId || '',
      model: 'doubao-seed-2-0-mini-260215'
    })
  });

  if (!response.ok) {
    throw new Error(`Analysis API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    result: data.success ? 'success' : '',
    parsedResult: data.parsedResult || {},
    imageUrl: data.imageUrl || '',
    recordId: data.recordId || ''
  };
}

/**
 * 调用图片验证API
 */


// 生图 API 调用（修复参数+超时+适配返回结构）
async function callDoubaoImageAPI(description: string) {
  // 注意：这里不再需要前端API密钥，改为调用后端API
  // const apiKey = import.meta.env.VITE_ARK_API_KEY || '';
  
  // if (!apiKey) {
  //   throw new Error('ARK_API_KEY is not configured');
  // }

  // 30秒超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://fengshui-backend-4i5o.onrender.com';
    const response = await fetch(`${apiBaseUrl}/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        prompt: description, 
        style: 'traditional', 
        size: '1024x1024' 
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Generate Image API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // 适配后端返回结构（success + data.imageUrl）
    return data.success ? data.data.imageUrl : '';
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('生图超时，请稍后重试');
    }
    throw err;
  }
}

// 历史记录查询函数
async function getAnalysisHistory(userId: string) {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://fengshui-backend-4i5o.onrender.com';
    const response = await fetch(`${apiBaseUrl}/analysis-history?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`查询历史记录失败: ${response.status}`);
    }

    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return [];
  }
}

// --- Types ---
interface Suggestion {
  title: string;
  description: string;
  cost: '低' | '中' | '高';
  imageUrl?: string;
}

interface AnalysisPoint {
  title: string;
  fengShui: {
    analysis: string;
    elements: string[]; 
    remedy: string;
  };
  science: {
    analysis: string;
    principles: string[]; 
    optimization: string;
  };
  suggestions: Suggestion[];
}

interface HistoryReport {
  id: string;
  title: string;
  date: string;
  score: number;
  thumbnail: string;
  report: AnalysisReport;
}

interface AnalysisReport {
  /** 评分 (1-100的整数) */
  overallRating: number; 
  summary: string;
  points: AnalysisPoint[];
  conclusion: string;
}

// --- 错误边界组件 ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('组件错误:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-stone-800">页面加载出错</h3>
          <p className="text-sm text-stone-500 mt-2">{this.state.error?.message || '未知错误'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm"
          >
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- 组件 ---
const BaguaIcon = ({ className }: { className?: string }) => (
  <div className={cn("relative flex items-center justify-center", className)}>
    <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
      <path d="M50 5 L85 20 L95 50 L85 80 L50 95 L15 80 L5 50 L15 20 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M50 35 A15 15 0 0 1 50 65 A7.5 7.5 0 0 1 50 50 A7.5 7.5 0 0 0 50 35" fill="currentColor" />
      <circle cx="50" cy="42.5" r="2" fill="white" />
      <circle cx="50" cy="57.5" r="2" fill="black" />
    </svg>
  </div>
);

const AnalysisCard = ({ point }: { point: AnalysisPoint }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="report-card mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between group"
      >
        <h3 className="text-lg font-serif font-bold text-stone-800 border-b-2 border-accent/30 pb-1">
          {point.title}
        </h3>
        <div className="text-stone-300 group-hover:text-accent transition-colors">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-6">
              {/* Feng Shui Analysis */}
              <div className="space-y-3">
                <div className="flex -ml-6">
                  <div className="label-green">风水分析</div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 bg-stone-50 rounded-lg flex items-center justify-center border border-stone-100">
                    <BaguaIcon className="w-8 h-8 opacity-40" />
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {(point?.fengShui?.analysis) || '风水分析数据暂不可用'}
                  </p>
                </div>
              </div>

              {/* Science Analysis */}
              <div className="space-y-3">
                <div className="flex -ml-6">
                  <div className="label-blue">科学分析</div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 bg-stone-50 rounded-lg flex items-center justify-center border border-stone-100">
                    <Wind className="w-6 h-6 text-stone-300" />
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {(point?.science?.analysis) || '科学分析数据暂不可用'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SuggestionImage = ({ suggestion }: { suggestion: Suggestion }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(suggestion.imageUrl || null);
  const [loading, setLoading] = useState(!suggestion.imageUrl);
  const [isFallback, setIsFallback] = useState(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // 防抖生图函数
  const debouncedGenerateImage = useCallback(
    debounce(callDoubaoImageAPI, 500),
    []
  );

  const generateImage = useCallback(async () => {
    setLoading(true);
    setIsQuotaExceeded(false);
    try {
      // 增强 prompt：添加场景、主体对象和用途说明以满足 Qwen 模型要求
      const enhancedPrompt = `${suggestion.description}，场景：${suggestion.title}，主体：中国传统建筑风水示意图，用途：用于APP户型优化建议展示，风格：写实清晰，细节丰富，专业准确`;
      
      console.log('🎯 生图 prompt 增强:', {
        original: suggestion.description,
        enhanced: enhancedPrompt,
        title: suggestion.title
      });
      
      const imageUrl = await debouncedGenerateImage(enhancedPrompt);
      if (imageUrl) {
        setImageUrl(imageUrl);
        setIsFallback(false);
      } else {
        throw new Error("No image URL in response");
      }
    } catch (err: any) {
      const isQuota = err?.message?.includes('429') || err?.status === 429;
      if (isQuota) {
        setIsQuotaExceeded(true);
        console.warn("AI Image Quota exceeded, using high-quality fallback.");
      } else {
        console.error("Image generation failed:", err);
      }
      // Fallback to a high-quality interior design placeholder
      setImageUrl(`https://picsum.photos/seed/${encodeURIComponent(suggestion.title + 'interior' + retryCount)}/800/450`);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  }, [suggestion, retryCount, debouncedGenerateImage]);

  useEffect(() => {
    if (!imageUrl && !loading) {
      generateImage();
    }
  }, [imageUrl, loading, generateImage]);

  return (
    <div className="w-full aspect-video bg-stone-100 rounded-xl overflow-hidden relative border border-stone-200 group/img">
      {loading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-stone-50">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-[10px] text-stone-400 font-medium">AI 正在生成视觉方案...</span>
        </div>
      ) : imageUrl ? (
        <>
          <motion.img 
            key={imageUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={imageUrl} 
            alt={suggestion.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => {
              setImageUrl(`https://picsum.photos/seed/${encodeURIComponent(suggestion.title)}/800/450`);
              setIsFallback(true);
            }}
          />
          
          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors pointer-events-none" />

          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            <div className={cn(
              "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-sm",
              isFallback ? "bg-stone-800/60 text-white/80" : "bg-accent/80 text-white"
            )}>
              {isFallback ? "参考图" : "AI 生成方案"}
            </div>
            {isQuotaExceeded && (
              <div className="bg-red-500/80 text-white px-2 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-wider animate-pulse shadow-sm">
                配额已达上限
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              setImageUrl(null);
              setRetryCount(prev => prev + 1);
            }}
            className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-full shadow-md opacity-0 group-hover/img:opacity-100 transition-opacity active:scale-90"
            title="重新生成"
          >
            <Sparkles className="w-3 h-3 text-primary" />
          </button>
        </>
      ) : null}
    </div>
  );
};

const OptimizationTab = ({ report, currentUser, onUpgrade, isAnalyzing, thinkingStep }: { report: AnalysisReport | null; currentUser: any; onUpgrade: () => void; isAnalyzing?: boolean; thinkingStep?: number }) => {
  const thinkingSteps = [
    "正在扫描户型轮廓...",
    "识别空间功能分区...",
    "测算九宫八卦方位...",
    "分析五行能量流转...",
    "评估环境心理动线...",
    "生成深度优化建议..."
  ];
  // 检查用户是否为会员
  const isPremiumUser = currentUser?.is_premium;
  
  // 如果正在分析中，显示加载状态
  if (isAnalyzing !== undefined && isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-8">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32"
          >
            <BaguaIcon className="w-full h-full opacity-20" />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <motion.p 
            key={thinkingStep || 0}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-serif font-bold text-lg"
          >
            {thinkingSteps[thinkingStep || 0]}
          </motion.p>
          <p className="text-xs text-stone-400">灵境筑居 AI 正在为您深度解析</p>
        </div>
      </div>
    );
  }
  
  // 如果没有分析报告，显示空状态
  if (!report) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-stone-400">
        <Sparkles className="w-12 h-12 opacity-20 mb-4" />
        <p className="text-sm">暂无优化建议</p>
        <p className="text-xs mt-2">请先上传户型图并完成分析</p>
      </div>
    );
  }
  
  // 获取所有优化建议
  const allSuggestions = report.points 
    ? report.points
        .flatMap(p => p?.suggestions || [])
        .filter(s => s && typeof s === 'object' && 'title' in s)
    : [];
  
  // 免费用户只能看到前2个建议的摘要
  const visibleSuggestions = isPremiumUser ? allSuggestions : allSuggestions.slice(0, 2);
  
  // 判断是否有限制显示
  const hasLimitedView = !isPremiumUser && allSuggestions.length > 2;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-12"
    >
      <header className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold text-stone-800">户型优化建议</h2>
        <p className="text-xs text-stone-400">AI 智能生成的个性化改造方案</p>
        {!isPremiumUser && (
          <div className="mt-2 px-4 py-2 bg-amber-50 rounded-full inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-bold text-amber-700">免费用户可查看部分建议</span>
          </div>
        )}
      </header>

      <div className="space-y-6">
        {visibleSuggestions.map((s, i) => (
          <div key={i} className="bg-white rounded-3xl border border-stone-200 card-shadow overflow-hidden relative">
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-stone-800">{s.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">优化方案</span>
                  <div className="h-px flex-1 bg-stone-100" />
                </div>
              </div>
              
              <SuggestionImage suggestion={s} />

              <div className="space-y-3">
                {/* 免费用户只显示部分描述 */}
                <p className="text-sm text-stone-600 leading-relaxed">
                  {isPremiumUser 
                    ? s.description 
                    : s.description?.substring(0, Math.min(100, s.description?.length || 0)) + 
                      (s.description?.length > 100 ? '...' : '')
                  }
                </p>
                
                <div className="flex gap-1">
                    {[1, 2, 3].map(n => (
                      <div 
                        key={n} 
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold",
                          n <= (s.cost === '高' ? 3 : s.cost === '中' ? 2 : 1) 
                            ? "bg-amber-400 text-white" 
                            : "bg-stone-100 text-stone-300"
                        )}
                      >
                        $
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 显示更多建议的提示 */}
      {hasLimitedView && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-paper)] rounded-2xl p-6 border border-stone-200"
        >
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-200 blur-lg rounded-full"></div>
                <div className="relative bg-primary text-white p-3 rounded-full">
                  <Plus className="w-5 h-5" />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-800">还有 {allSuggestions.length - 2} 个优化建议</h3>
            <p className="text-sm text-stone-600">
              升级为高级会员即可查看所有AI生成的个性化改造方案
            </p>
            <button
              onClick={onUpgrade}
              className="mt-4 w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg"
            >
              <Crown className="w-4 h-4" />
              升级查看完整建议  ¥4
            </button>
          </div>
        </motion.div>
      )}
      
      {/* 会员用户也可以看到升级按钮（续费或推荐他人） */}
      {isPremiumUser && currentUser && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-6 border-t border-stone-100"
        >
          <div className="text-center space-y-3">
            <p className="text-xs text-stone-500">喜欢我们的服务？推荐给朋友或续费会员</p>
            <button
              onClick={onUpgrade}
              className="inline-flex items-center gap-2 px-6 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full text-sm font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              推荐升级会员
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const ProfileTab = ({ currentUser, onSelectReport, isAnalysisInProgress }: { currentUser: any; onSelectReport: (report: AnalysisReport, image: string) => void; isAnalysisInProgress?: boolean }) => {
  if (!currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8 pb-12 flex flex-col items-center justify-center min-h-96"
      >
        <div className="text-center space-y-4">
          <User className="w-16 h-16 text-stone-300 mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-stone-800">请先登录</h2>
          <p className="text-stone-500">登录后可查看个人资料和历史记录</p>
        </div>
      </motion.div>
    );
  }

  // 获取真实的历史分析记录
  const [historyReports, setHistoryReports] = useState<any[]>([]);
  
  useEffect(() => {
    const loadHistory = async () => {
      if (currentUser) {
        const reports = await getAnalysisHistory(currentUser.id);
        setHistoryReports(reports);
      }
    };
    
    loadHistory();
  }, [currentUser]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8 pb-12"
    >
      {/* 分析状态提示 */}
      {isAnalysisInProgress && (
        <div className="mx-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
            <div>
              <p className="text-amber-800 font-medium">正在分析中</p>
              <p className="text-amber-600 text-sm">历史记录查看功能暂时受限，请等待分析完成</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-4 bg-white/50 p-4 rounded-3xl border border-stone-100 card-shadow mx-4">
        <div className="relative">
          <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full" />
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`} 
            alt="Avatar" 
            className="w-16 h-16 rounded-full border-2 border-white relative z-10"
          />
        </div>
        <div className="text-left">
          <h3 className="text-xl font-serif font-bold text-stone-800">{currentUser.email || currentUser.id || '未设置邮箱'}</h3>
          <p className="text-xs text-stone-400 font-medium">
            {currentUser?.is_premium ? (
              currentUser.premium_type === 'monthly' 
                ? `会员（包月） | 到期: ${currentUser.premium_expiry ? new Date(currentUser.premium_expiry).toLocaleDateString() : '未知'}`
                : `会员（包年） | 到期: ${currentUser.premium_expiry ? new Date(currentUser.premium_expiry).toLocaleDateString() : '未知'}`
            ) : (
              `免费用户 | 累计分析${historyReports.length}次`
            )}
          </p>
        </div>
      </div>

      <div className="space-y-4 px-4">
        {historyReports.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <User className="w-12 h-12 mx-auto mb-4 text-stone-300" />
            <p>暂无历史记录</p>
            <p className="text-xs mt-2">请先上传户型图进行分析</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyReports.map((record, index) => {
              // 修复：字段映射适配后端表结构
              const imageUrl = record.image_url || record.original_image_url || null;
              // 修复：字段映射适配后端表结构，添加安全的空值检查
              const reportData = (() => {
                try {
                  let resultValue = record.result_json || record.result;
                  
                  // 处理可能的双重字符串化问题
                  if (typeof resultValue === 'string') {
                    try {
                      resultValue = JSON.parse(resultValue);
                    } catch (e) {
                      try {
                        resultValue = JSON.parse(JSON.parse(resultValue));
                      } catch (e2) {
                        console.warn('JSON解析失败，尝试从原始数据提取信息');
                      }
                    }
                  }
                  
                  // 如果解析成功且数据有效
                  if (resultValue && typeof resultValue === 'object' && Array.isArray(resultValue.points)) {
                    return resultValue;
                  } 
                  // 如果record.result本身就是有效对象
                  else if (record.result && typeof record.result === 'object') {
                    return record.result;
                  }
                  
                } catch (e) {
                  console.warn('解析历史记录失败:', e.message);
                }
                
                // 兜底方案：使用数据库中的基础信息 + 完整的默认结构
                return { 
                  points: [{
                    title: '历史记录',
                    fengShui: {
                      analysis: '此为历史分析记录，原始数据可能已损坏或格式不兼容',
                      elements: [],
                      remedy: '建议重新分析该户型图以获取完整报告'
                    },
                    science: {
                      analysis: '由于数据完整性问题，无法提供详细的科学分析',
                      principles: [],
                      optimization: '请重新上传户型图进行分析'
                    },
                    suggestions: [{
                      title: '数据恢复建议',
                      description: '重新分析该户型图可获得完整的风水和科学分析报告',
                      cost: '低'
                    }]
                  }],
                  overallRating: record.overall_rating || 0, 
                  summary: record.summary || '历史户型分析报告', 
                  conclusion: '基于历史数据分析结果 - 数据完整性检查' 
                };
              })();
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-2xl p-4 border border-stone-200 card-shadow transition-all duration-300 ${isAnalysisInProgress ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}`}
                  onClick={() => {
                    if (isAnalysisInProgress) {
                      alert('正在分析中，请等待当前分析完成后再查看历史记录');
                      return;
                    }
                    onSelectReport(reportData, imageUrl || '');
                  }}
                >
                  <div className="flex items-start gap-4">
                  {/* 图片缩略图 */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt="户型图缩略图" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://picsum.photos/seed/floorplan/80/60";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-100">
                          <FileText className="w-8 h-8 text-stone-400" />
                        </div>
                      )}
                    </div>
                    {/* 得分标签 */}
                    <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                      {record.total_score || 0}
                    </div>
                  </div>
                  
                  {/* 报告信息 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-stone-800 line-clamp-1">
                      {record.summary || `分析记录 ${new Date(record.created_at).toLocaleDateString()}`}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      {new Date(record.created_at).toLocaleDateString('zh-CN')}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-stone-500">{record.is_paid ? '付费' : '免费'}分析</span>
                      {record.is_paid && (
                        <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full">VIP</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AppContent = () => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isAnalysisInProgress, setIsAnalysisInProgress] = useState(false); // 新增：跟踪分析过程状态
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '', isSignUp: false });
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const thinkingSteps = [
    "正在扫描户型轮廓...",
    "识别空间功能分区...",
    "测算九宫八卦方位...",
    "分析五行能量流转...",
    "评估环境心理动线...",
    "生成深度优化建议..."
  ];

  // Supabase 认证逻辑
  useEffect(() => {
    // 监听 Supabase 认证状态
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
      
      // 监听认证状态变化
      const { data: { subscription } } = await supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user || null);
      });
      
      return () => subscription.unsubscribe();
    };
    
    getCurrentUser();
    
    // 处理路由
    const path = window.location.pathname;
    if (path === '/report') {
      setActiveTab('report');
    } else if (path === '/success') {
      setActiveTab('me');
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setThinkingStep(0);
      interval = setInterval(() => {
        setThinkingStep(prev => (prev + 1) % thinkingSteps.length);
      }, 2000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAnalyzing]);

  // 认证逻辑
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      if (authForm.isSignUp) {
        // 注册
        const { error } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password
        });
        
        if (error) throw error;
        alert('注册成功！请查收验证邮件');
      } else {
        // 登录
        const { error } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password
        });
        
        if (error) throw error;
      }
      
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', isSignUp: false });
    } catch (err: any) {
      setError(err.message || '认证过程出错');
    }
  };

  // 登出
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    if (isAnalyzing) {
      setIsAnalyzing(false);
      setThinkingStep(0);
    }
    setCurrentUser(null);
  };

  // 升级高级会员
  const handlePremiumUpgrade = async () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    
    setShowPaymentModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件大小（限制为10MB）
      if (file.size > 10 * 1024 * 1024) {
        setError('图片过大，请选择小于10MB的图片');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result as string;
        
        // 显示预览
        setImage(imageData);
        setReport(null);
        setError(null);
        
        // 直接进行分析，跳过图片验证步骤
        setIsAnalyzing(true);
        setIsAnalysisInProgress(true); // 新增：标记分析进行中
        setThinkingStep(0);
        setActiveTab('report');
        
        try {
          await analyzeFloorPlan(imageData);
        } catch (err: any) {
          console.error('分析过程出错:', err);
          setIsAnalyzing(false);
          setIsAnalysisInProgress(false); // 新增：清理分析状态
          setError(err.message || '分析过程中出现错误，请重试。');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 分析逻辑
  const analyzeFloorPlan = async (directImage?: string) => {
    // 只有登录用户才能进行分析
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    
    const targetImage = directImage || image;
    if (!targetImage) return;
    
    setIsAnalyzing(true);
    setError(null);
    setActiveTab('report');

    try {
      const base64Data = targetImage.split(',')[1];

      // 调用后端 API，传递 userId
      const result = await callDoubaoAPI('', base64Data, currentUser.id);
      
      if (result.result === 'success') {
        setReport(result.parsedResult);
        setImageUrl(result.imageUrl);
        
        // 分析完成后自动触发建议图像生成
        console.log('=== 分析完成，开始触发建议图像生成 ===');
        setTimeout(() => {
          triggerSuggestionImages(result.parsedResult);
        }, 1000);
        
        // 新增：分析完成后清理状态
        setIsAnalysisInProgress(false);
      } else {
        throw new Error("未能生成分析报告");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "分析过程中出现错误，请重试。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 处理选择报告的回调
  const handleSelectReport = (report: AnalysisReport | null, image: string) => {
    // 新增：如果正在分析中，不允许查看历史记录详情
    if (isAnalysisInProgress) {
      alert('正在分析中，请等待当前分析完成后再查看历史记录');
      return;
    }
    
    // 添加空值检查
    if (!report || !report.points) {
      console.warn('无效的报告数据，跳过图像生成');
      setReport(report);
      setImageUrl(image);
      setActiveTab('report');
      return;
    }
    
    setReport(report);
    setImageUrl(image);
    setActiveTab('report');
    
    // 对于历史记录，也触发图像生成
    console.log('=== 触发历史记录图像生成 ===');
    triggerSuggestionImages(report);
  };
  
  // 保存报告为图片
  const saveReportAsImage = async () => {
    if (!reportRef.current || !report) return;
    
    setIsSavingImage(true);
    try {
      // 使用 html2canvas-pro 截取整个报告区域
      const canvas = await html2canvas(reportRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // 提高图片质量
        backgroundColor: '#ffffff',
        logging: false,
        width: reportRef.current.scrollWidth,
        height: reportRef.current.scrollHeight,
        onclone: (clonedDoc) => {
          // 确保所有内容都被正确渲染
          const clonedElement = clonedDoc.getElementById('report-container');
          if (clonedElement) {
            clonedElement.style.overflow = 'visible';
          }
        }
      });
      
      // 将 canvas 转换为 Blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png', 1.0);
      });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `户型分析报告_${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // 显示成功提示
      alert('报告已成功保存为图片！');
      
    } catch (error) {
      console.error('保存图片失败:', error);
      alert('保存图片时出现错误，请重试');
    } finally {
      setIsSavingImage(false);
    }
  };

  // 批量触发建议图像生成（优化版：智能并发控制和限流处理）
  const triggerSuggestionImages = async (analysisReport: AnalysisReport | null) => {
    try {
      console.log('开始批量生成建议图像...');
      
      // 安全的空值检查
      if (!analysisReport || !Array.isArray(analysisReport.points)) {
        console.warn('分析报告数据无效，跳过图像生成');
        return;
      }
      
      // 获取所有优化建议
      const allSuggestions = analysisReport.points 
        ? analysisReport.points
            .flatMap(p => p?.suggestions || [])
            .filter(s => s && typeof s === 'object' && 'title' in s)
        : [];
      
      // 免费用户只处理前2个建议，会员用户处理全部
      const suggestionsToProcess = currentUser?.is_premium ? allSuggestions : allSuggestions.slice(0, 2);
      
      console.log(`发现 ${allSuggestions.length} 个优化建议，其中 ${suggestionsToProcess.length} 个需要生成图像...`);
      
      // 根据用户类型设置不同的并发策略
      const config = {
        maxConcurrent: currentUser?.is_premium ? 2 : 1, // 会员用户最多2个并发，免费用户1个
        baseDelay: currentUser?.is_premium ? 2000 : 1000, // 基础延迟时间（毫秒）
        retryAttempts: 3, // 重试次数
        retryDelay: 5000 // 重试延迟（毫秒）
      };
      
      console.log(`使用配置: 并发数=${config.maxConcurrent}, 基础延迟=${config.baseDelay}ms`);
      
      const updatedPoints = [...analysisReport.points];
      let completedCount = 0;
      let errorCount = 0;
      
      // 限流检测和自适应调整
      let failureStreak = 0;
      let lastFailureTime = 0;
      
      const adjustConcurrency = (isFailure: boolean) => {
        if (isFailure) {
          failureStreak++;
          lastFailureTime = Date.now();
          // 连续失败3次，降低并发数
          if (failureStreak >= 3) {
            config.maxConcurrent = Math.max(1, config.maxConcurrent - 1);
            config.baseDelay = Math.min(5000, config.baseDelay + 1000);
            console.log(`检测到限流，调整并发数至 ${config.maxConcurrent}，延迟增加至 ${config.baseDelay}ms`);
            failureStreak = 0; // 重置计数
          }
        } else {
          // 成功时重置失败计数
          if (Date.now() - lastFailureTime > 30000) {
            failureStreak = 0;
          }
        }
      };
      
      // 生成单个图像的函数（带重试机制）
      const generateSingleImage = async (suggestion: any, index: number): Promise<boolean> => {
        let attempts = 0;
        
        while (attempts < config.retryAttempts) {
          try {
            console.log(`[${index + 1}/${suggestionsToProcess.length}] 生成图像: ${suggestion.title}`);
            
            const imageUrl = await callDoubaoImageAPI(suggestion.description);
            console.log(`✅ 图像生成成功: ${suggestion.title} -> ${imageUrl.substring(0, 50)}...`);
            
            // 更新对应的建议对象
            const pointIndex = analysisReport.points.findIndex(p => p.suggestions?.includes(suggestion));
            if (pointIndex !== -1) {
              const point = updatedPoints[pointIndex];
              const suggestionIndex = point.suggestions.findIndex((sug: any) => sug === suggestion);
              if (suggestionIndex !== -1) {
                updatedPoints[pointIndex] = {
                  ...point,
                  suggestions: [
                    ...point.suggestions.slice(0, suggestionIndex),
                    { ...suggestion, imageUrl },
                    ...point.suggestions.slice(suggestionIndex + 1)
                  ]
                };
                // 实时更新UI
                setReport({ ...analysisReport, points: [...updatedPoints] });
              }
            }
            
            adjustConcurrency(false); // 通知成功
            return true;
            
          } catch (err: any) {
            attempts++;
            console.warn(`⚠️ 图像生成失败 (${suggestion.title}) [${attempts}/${config.retryAttempts}]:`, err.message);
            
            adjustConcurrency(true); // 通知失败
            
            // 如果是限流错误且还有重试机会
            if ((err.message.includes('429') || err.message.includes('rate limit') || err.message.includes('配额耗尽')) && 
                attempts < config.retryAttempts) {
              const delay = config.retryDelay * attempts; // 指数退避
              console.log(`等待 ${delay}ms 后重试...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            
            // 其他错误或重试次数用完
            return false;
          }
        }
        return false;
      };
      
      // 分批处理，控制并发数
      const processInBatches = async () => {
        for (let i = 0; i < suggestionsToProcess.length; i += config.maxConcurrent) {
          const batch = suggestionsToProcess.slice(i, i + config.maxConcurrent);
          console.log(`处理批次 [${Math.floor(i/config.maxConcurrent) + 1}/${Math.ceil(suggestionsToProcess.length/config.maxConcurrent)}]: ${batch.length} 个项目`);
          
          // 并发处理当前批次
          const batchResults = await Promise.all(
            batch.map((suggestion, batchIndex) => 
              generateSingleImage(suggestion, i + batchIndex)
            )
          );
          
          // 统计结果
          batchResults.forEach(success => {
            if (success) {
              completedCount++;
            } else {
              errorCount++;
            }
          });
          
          // 批次间延迟
          if (i + config.maxConcurrent < suggestionsToProcess.length) {
            console.log(`批次完成，等待 ${config.baseDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, config.baseDelay));
          }
        }
      };
      
      // 开始处理
      await processInBatches();
      
      console.log('=== 批量图像生成统计 ===');
      console.log(`总计: ${suggestionsToProcess.length} 个`);
      console.log(`成功: ${completedCount} 个`);
      console.log(`失败: ${errorCount} 个`);
      console.log(`成功率: ${((completedCount / suggestionsToProcess.length) * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error('批量图像生成失败:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-paper shadow-2xl relative overflow-hidden">
      {/* Background Decorative Borders */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="chinese-border border-tl w-full h-full" />
        <div className="chinese-border border-tr w-full h-full" />
        <div className="chinese-border border-bl w-full h-full" />
        <div className="chinese-border border-br w-full h-full" />
      </div>

      <main className="flex-1 overflow-y-auto px-6 pt-12 pb-24 space-y-8 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Header Section */}
              <header className="text-center space-y-2">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <BaguaIcon className="w-16 h-16" />
                  <div className="text-left flex-1">
                    <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">九衡居</h1>
                    <div className="flex items-center gap-2 text-stone-500 text-sm font-medium">
                      <span>风水五行</span>
                      <span className="text-accent">×</span>
                      <span>环境心理学</span>
                    </div>
                  </div>
                  {/* User Menu */}
                  <div className="relative">
                    {currentUser ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-500">欢迎, {currentUser.email?.split('@')[0]}</span>
                        <button 
                          onClick={handleSignOut}
                          className="text-[10px] bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded-full transition-colors"
                        >
                          登出
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowAuthModal(true)}
                        className="text-[10px] bg-primary text-white px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
                      >
                        登录/注册
                      </button>
                    )}
                  </div>
                </div>
              </header>

              {/* Upload Pill Button */}
              <section>
                <button
                  onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="w-full gradient-pill rounded-full py-6 px-8 flex items-center justify-between group transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                      <Layout className="text-white w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <span className="text-xl font-bold text-white block">上传户型图</span>
                      <span className="text-xs text-white/60">支持 JPG, PNG, WEBP</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <Eye className="text-white w-5 h-5" />
                  </div>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </section>

              {/* Feature Cards Vertical Layout */}
              <section className="-mx-6 px-6 pb-2">
                <div className="space-y-4 pb-2">
                  <FeatureCard 
                    onClick={() => navigate('/fengshui')}
                    icon={<div className="grid grid-cols-3 gap-1 p-1 bg-stone-50 rounded border border-stone-100">
                      {['水','木','火','木','人','火','金','土','金'].map((el, i) => (
                        <span key={i} className="text-[8px] w-4 h-4 flex items-center justify-center border border-stone-200 rounded-sm bg-white font-bold">{el}</span>
                      ))}
                    </div>}
                    title="风水九宫分析"
                    desc="探索户型五行能量分布，解读风水吉凶，定制化解方案。"
                  />
                  <FeatureCard 
                    onClick={() => navigate('/psychology')}
                    icon={<div className="w-12 h-12 bg-stone-50 rounded border border-stone-100 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary/40" />
                    </div>}
                    title="动线心理分析"
                    desc="分析居住空间动线，评估心理舒适度，优化生活体验。"
                  />
                  <FeatureCard 
                    onClick={() => navigate('/energy')}
                    icon={<div className="w-12 h-12 bg-stone-50 rounded border border-stone-100 flex items-center justify-center">
                      <Layers className="w-6 h-6 text-primary/40" />
                    </div>}
                    title="五行能量图"
                    desc="可视化呈现全屋五行强弱，平衡家居能量场。"
                  />
                  <FeatureCard 
                    onClick={() => navigate('/lighting')}
                    icon={<div className="w-12 h-12 bg-stone-50 rounded border border-stone-100 flex items-center justify-center">
                      <Wind className="w-6 h-6 text-primary/40" />
                    </div>}
                    title="采光通风评分"
                    desc="基于环境物理参数，科学评估采光与空气流通质量。"
                  />
                </div>
              </section>

              {/* Feature Detail Modal */}
              <AnimatePresence>
                {selectedFeature && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => setSelectedFeature(null)}
                  >
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="bg-paper w-full max-w-md rounded-t-[32px] p-8 space-y-6 relative overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="absolute top-0 right-0 opacity-5 -mr-12 -mt-12">
                        <BaguaIcon className="w-64 h-64" />
                      </div>
                                    
                      <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-2" />
                                    
                      <div className="space-y-4 relative z-10 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
                        <h3 className="text-2xl font-serif font-bold text-primary">
                          {selectedFeature === 'fengshui' && '风水九宫分析'}
                          {selectedFeature === 'psychology' && '动线心理分析'}
                          {selectedFeature === 'energy' && '五行能量图'}
                          {selectedFeature === 'lighting' && '采光通风评分'}
                        </h3>
                        <div className="text-stone-600 text-sm leading-relaxed space-y-4">
                          {selectedFeature === 'fengshui' && (
                            <>
                              <div className="space-y-4">
                                <div className="flex flex-col items-center">
                                  <img 
                                    src="https://pic.616pic.com/ys_bnew_img/00/45/78/DHsue50bm9.jpg" 
                                    alt="后天八卦图" 
                                    className="w-full max-w-md rounded-xl border border-stone-200 shadow-lg mb-4"
                                  />
                                  <p className="text-xs text-stone-500 italic">后天八卦方位图：乾兑离震巽坎艮坤对应西北、正西、正南、正东、东南、正北、东北、西南八方</p>
                                </div>
                                <p className="text-sm leading-relaxed">
                                  <strong>九宫分析原理：</strong>将住宅平面按洛书九宫格划分，中心为中宫（土），周围八宫对应八卦方位与五行属性。AI算法通过图像识别技术，精准定位户型各功能区在九宫中的位置，分析五行能量分布。
                                </p>
                                <p className="text-sm leading-relaxed">
                                  <strong>核心要素：</strong>
                                  <ul className="list-disc pl-5 space-y-1 mt-2">
                                    <li><strong>方位对应：</strong>乾（西北-金）、兑（正西-金）、离（正南-火）、震（正东-木）、巽（东南-木）、坎（正北-水）、艮（东北-土）、坤（西南-土）</li>
                                    <li><strong>五行生克：</strong>木生火、火生土、土生金、金生水、水生木；木克土、土克水、水克火、火克金、金克木</li>
                                    <li><strong>缺角影响：</strong>某宫位缺失会导致对应五行能量不足，影响居住者相应运势（如西北缺角影响男主人事业运）</li>
                                    <li><strong>能量平衡：</strong>通过色彩、材质、摆件等调整，实现五行能量的和谐平衡</li>
                                  </ul>
                                </p>
                                <p className="text-sm leading-relaxed">
                                  <strong>AI分析优势：</strong>传统风水需人工测量计算，我们的AI系统可自动识别户型图，快速完成九宫定位、五行分析、缺角诊断，提供科学化、可视化的风水评估报告。
                                </p>
                              </div>
                            </>
                          )}
                          {selectedFeature === 'psychology' && (
                            <>
                              <p>动线是指人在室内活动的路径。我们结合环境心理学，分析户型中的"家务动线"、"访客动线"与"居住动线"是否交叉干扰。</p>
                              <p>合理的动线能减少生活中的琐碎压力，提升居住者的心理安全感与私密性，让家真正成为放松身心的港湾。</p>
                            </>
                          )}
                          {selectedFeature === 'energy' && (
                            <>
                              <p>五行能量图通过雷达图形式，直观展示您户型中五种基础能量的分布情况。例如，如果"木"能过弱，可能影响居住者的进取心；"火"能过旺，则可能导致情绪易波动。</p>
                              <p>我们会根据能量图的失衡点，给出软装材质（如木质家具、金属饰品）的补充建议。</p>
                            </>
                          )}
                          {selectedFeature === 'lighting' && (
                            <>
                              <p>采光与通风是住宅的"呼吸"。我们基于窗户朝向、进深比以及楼层因素，模拟光照时长与空气流速。</p>
                              <p>评分系统能帮您识别哪些区域可能存在阴暗潮湿风险，并建议通过灯光补偿或新风系统进行优化。</p>
                            </>
                          )}
                        </div>
                        <button 
                          onClick={() => setSelectedFeature(null)}
                          className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20"
                        >
                          我知道了
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              
                {/* Authentication Modal */}
                {showAuthModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => setShowAuthModal(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white rounded-2xl p-8 space-y-6 relative overflow-hidden max-w-sm w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="absolute top-0 right-0 opacity-5 -mr-8 -mt-8">
                        <BaguaIcon className="w-32 h-32" />
                      </div>
                                    
                      <div className="text-center space-y-2 relative z-10">
                        <h3 className="text-2xl font-serif font-bold text-primary">
                          {authForm.isSignUp ? '创建账户' : '用户登录'}
                        </h3>
                        <p className="text-xs text-stone-400">
                          {authForm.isSignUp ? '注册新账户享受云端存储' : '登录后可保存分析记录'}
                        </p>
                      </div>
              
                      <form onSubmit={handleAuth} className="space-y-4 relative z-10">
                        {error && (
                          <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                            {error}
                          </div>
                        )}
                                      
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">邮箱</label>
                          <input
                            type="email"
                            value={authForm.email}
                            onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            placeholder="请输入邮箱地址"
                            required
                          />
                        </div>
                                      
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">密码</label>
                          <input
                            type="password"
                            value={authForm.password}
                            onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            placeholder="请输入密码"
                            required
                          />
                        </div>
                                      
                        <button
                          type="submit"
                          className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                        >
                          {authForm.isSignUp ? '注册' : '登录'}
                        </button>
                                      
                        <button
                          type="button"
                          onClick={() => setAuthForm({...authForm, isSignUp: !authForm.isSignUp})}
                          className="w-full text-xs text-stone-500 hover:text-primary transition-colors"
                        >
                          {authForm.isSignUp 
                            ? '已有账户？点击登录' 
                            : '没有账户？点击注册'}
                        </button>
                      </form>
                                    
                      <button 
                        onClick={() => setShowAuthModal(false)}
                        className="absolute top-4 right-4 text-stone-300 hover:text-stone-500 transition-colors"
                      >
                        ×
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>


            </motion.div>
          ) : activeTab === 'report' ? (
            <motion.div 
              key="report-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-8">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="w-32 h-32"
                    >
                      <BaguaIcon className="w-full h-full opacity-20" />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <motion.p 
                      key={thinkingStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-primary font-serif font-bold text-lg"
                    >
                      {thinkingSteps[thinkingStep]}
                    </motion.p>
                    <p className="text-xs text-stone-400">灵境筑居 AI 正在为您深度解析</p>
                  </div>
                </div>
              ) : (
                <motion.div ref={reportRef} id="report-container">
                  {!report ? (
                    <div className="h-64 flex flex-col items-center justify-center text-stone-400">
                      <FileText className="w-12 h-12 opacity-20 mb-4" />
                      <p className="text-sm">暂无分析报告</p>
                      <p className="text-xs mt-2">请先上传户型图并完成分析</p>
                    </div>
                  ) : (
                    <>
                      {/* Report Header with Thumbnail */}
                      <section className="text-center space-y-4">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-accent/10 blur-xl rounded-full" />
                          <div className="relative bg-white p-2 rounded-2xl border border-stone-200 shadow-lg">
                            <img 
                              src={imageUrl || image || "https://picsum.photos/seed/floorplan/800/600"} 
                              alt="Floor plan thumbnail" 
                              className="w-48 h-32 object-contain rounded-xl"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <div className="h-px w-8 bg-stone-200" />
                          <div className="flex items-center gap-2">
                            <Compass className="w-5 h-5 text-accent" />
                            <h2 className="text-2xl font-serif font-bold text-stone-800">户型分析报告</h2>
                          </div>
                          <div className="h-px w-8 bg-stone-200" />
                        </div>
                      </section>

                      {/* Report Summary */}
                      <div className="overall-summary-card bg-white rounded-2xl p-6 border-l-4 border-accent card-shadow mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">总体评价</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xl font-serif font-bold text-primary">{report.overallRating}</span>
                            <span className="text-[10px] text-stone-400">分</span>
                          </div>
                        </div>
                        <p className="text-sm text-stone-600 leading-relaxed italic">
                          "{report.summary}"
                        </p>
                      </div>

                      {/* Analysis Points */}
                      <div className="space-y-14">
                        {report.points.map((point, idx) => (
                          <AnalysisCard key={idx} point={point} />
                        ))}
                      </div>

                      {/* Conclusion */}
                      <div className="bg-white rounded-2xl p-6 border border-stone-200 card-shadow mt-4">
                        <h3 className="text-lg font-serif font-bold text-stone-800 mb-2">总结建议</h3>
                        <p className="text-sm text-stone-600 leading-relaxed">
                          {report.conclusion}
                        </p>
                      </div>

                      {/* Save as Image Button */}
                      <div className="pt-4">
                        <button
                          onClick={saveReportAsImage}
                          disabled={isSavingImage}
                          className="w-full px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSavingImage ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>正在保存...</span>
                            </>
                          ) : (
                            <span>保存为图片</span>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : activeTab === 'sim' ? (
            <OptimizationTab report={report} currentUser={currentUser} onUpgrade={handlePremiumUpgrade} isAnalyzing={isAnalyzing} thinkingStep={thinkingStep} />
          ) : activeTab === 'me' ? (
            <ProfileTab currentUser={currentUser} onSelectReport={handleSelectReport} isAnalysisInProgress={isAnalysisInProgress} />
          ) : null}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-lg border-t border-stone-100 px-6 py-3 flex items-center justify-around z-50">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home className="w-5 h-5" />} label="首页" />
        <NavButton active={activeTab === 'report'} onClick={() => setActiveTab('report')} icon={<FileText className="w-5 h-5" />} label="报告" />
        <NavButton active={activeTab === 'sim'} onClick={() => setActiveTab('sim')} icon={<Sparkles className="w-5 h-5" />} label="优化" />
        <NavButton active={activeTab === 'me'} onClick={() => setActiveTab('me')} icon={<User className="w-5 h-5" />} label="我的" />
      </nav>
      
      {/* Modals */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          setShowPaymentModal(false);
          // 可以在这里添加升级成功的处理逻辑
        }}
        currentUser={currentUser}
      />
    </div>
  );
};

function FeatureCard({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border-t-4 border-primary card-shadow flex flex-col gap-4 group cursor-pointer hover:translate-y-[-2px] transition-all w-full max-w-md active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <div className="shrink-0">{icon}</div>
        <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-primary transition-colors" />
      </div>
      <div className="space-y-1">
        <h3 className="font-serif font-bold text-stone-800">
          {title}
        </h3>
        <p className="text-xs text-stone-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-colors",
        active ? "text-primary" : "text-stone-300 hover:text-stone-500"
      )}
    >
      <div className={cn(
        "p-1.5 rounded-lg transition-colors",
        active ? "bg-primary/5" : "bg-transparent"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

// 根组件（包裹错误边界）
const App = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;