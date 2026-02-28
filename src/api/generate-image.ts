import { type Request, type Response } from 'express';
import fetch from 'node-fetch';

// ================= 限流配置（增加内存上限保护） =================
const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 5,
  maxLogEntries: 1000, // 防止日志无限增长
  requestLog: [] as { timestamp: number; ip: string }[]
};

const RETRY_CONFIG = {
  maxRetries: 2,
  baseDelayMs: 1000,
  backoffFactor: 2
};

const cleanRequestLog = () => {
  const now = Date.now();
  // 清理1分钟前的日志
  RATE_LIMIT_CONFIG.requestLog = RATE_LIMIT_CONFIG.requestLog.filter(
    item => now - item.timestamp < 60000
  );
  // 清理超出上限的旧日志
  if (RATE_LIMIT_CONFIG.requestLog.length > RATE_LIMIT_CONFIG.maxLogEntries) {
    RATE_LIMIT_CONFIG.requestLog = RATE_LIMIT_CONFIG.requestLog.slice(-RATE_LIMIT_CONFIG.maxLogEntries);
  }
};

const isIpRateLimited = (ip: string): boolean => {
  cleanRequestLog();
  const ipRequests = RATE_LIMIT_CONFIG.requestLog.filter(item => item.ip === ip);
  return ipRequests.length >= RATE_LIMIT_CONFIG.maxRequestsPerMinute;
};

// ================= 重试机制 =================
const withRetry = async <T>(
  fn: () => Promise<T>,
  retryCount = 0
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (
      retryCount < RETRY_CONFIG.maxRetries &&
      (error.message.includes('429') ||
       error.message.includes('Throttling') ||
       error.message.includes('rate limit') ||
       error.message.includes('500') ||
       error.message.includes('503'))
    ) {
      const delay = RETRY_CONFIG.baseDelayMs * Math.pow(RETRY_CONFIG.backoffFactor, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retryCount + 1);
    }
    throw error;
  }
};

// ================= 调用豆包 Seedream API =================
const fetchDoubaoSeedream = async (
  apiKey: string,
  requestBody: any,
  signal: AbortSignal
) => {
  const endpoint = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
    signal
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Doubao API error: ${response.status} - ${errorText}`
    );
  }

  return response.json();
};

// ================= 主处理函数（最终完整版） =================
export default async function handler(req: Request, res: Response) {
  const requestStartTime = Date.now();
  // 优化IP获取逻辑（适配本地/服务器环境）
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
    || req.ip?.replace('::ffff:', '') 
    || '127.0.0.1';

  try {
    // 1. 校验请求方法
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed',
        processingTime: Date.now() - requestStartTime
      });
    }

    // 2. 限流校验
    if (isIpRateLimited(clientIp)) {
      return res.status(429).json({
        success: false,
        error: '请求频率过高，请稍后重试',
        processingTime: Date.now() - requestStartTime
      });
    }

    // 记录请求日志
    RATE_LIMIT_CONFIG.requestLog.push({
      timestamp: Date.now(),
      ip: clientIp
    });

    // 3. 解析请求参数
    const { prompt, style = 'traditional', size = '1024x1024' } = req.body;

    // 校验必填参数
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing prompt（提示词不能为空）',
        processingTime: Date.now() - requestStartTime
      });
    }

    // 4. 校验API Key
    const apiKey = process.env.ARK_API_KEY || process.env.VITE_ARK_API_KEY;
    if (!apiKey) {
      console.error('❌ ARK_API_KEY 未配置！请在 .env 中设置 ARK_API_KEY=your_key');
      return res.status(500).json({
        success: false,
        error: 'ARK_API_KEY not configured（未配置API密钥）',
        processingTime: Date.now() - requestStartTime,
        debug: {
          envKeys: Object.keys(process.env).filter(k => k.includes('ARK')),
          hasArkKey: !!process.env.ARK_API_KEY,
          hasViteArkKey: !!process.env.VITE_ARK_API_KEY
        }
      });
    }

    // 5. 尺寸格式转换 + 合法校验（适配豆包API）
    const validSizes = ['2K', '1K', '4K', '1024x1024', '1120x1440', '1440x1120', '768x1024', '1024x768'];
    const convertedSize = size.toUpperCase(); // 支持K单位和标准格式
    const finalSize = validSizes.includes(convertedSize) ? convertedSize : '1024x1024';

    // 6. 构建请求体（适配豆包Seedream API格式）
    const requestBody = {
      model: 'doubao-seedream-4-0-250828',
      prompt: `${prompt}，${style}风格，高清写实，专业建筑风水示意图，细节丰富，符合中国传统风水原理，用于户型优化建议展示`,
      sequential_image_generation: 'disabled',
      response_format: 'url',
      size: finalSize,
      stream: false,
      watermark: true
    };

    // 7. 调用豆包Seedream API（带重试+超时）
    const apiResult: any = await withRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时

      const data = await fetchDoubaoSeedream(apiKey, requestBody, controller.signal);

      clearTimeout(timeoutId);
      return data;
    });

    // 8. 解析图片URL（适配豆包API返回格式）
    console.log("【豆包Seedream API 完整返回】", JSON.stringify(apiResult, null, 2)); // 打印完整返回，方便调试
    console.log("【生图请求详情】", {
      originalPrompt: prompt,
      enhancedPrompt: requestBody.prompt,
      style,
      size: finalSize
    });
    
    // 解析豆包API返回的图片URL
    let generatedImageUrl = "";
    
    // 豆包API返回格式：data[0].url
    if (apiResult.data?.[0]?.url) {
      generatedImageUrl = apiResult.data[0].url;
    }
    // 备用格式：url字段直接在根对象
    else if (apiResult.url) {
      generatedImageUrl = apiResult.url;
    }
    // 其他可能的格式
    else {
      generatedImageUrl = apiResult.data?.url || "";
    }

    // 9. 返回结果（友好处理空URL）
    return res.status(200).json({
      success: true,
      data: {
        imageUrl: generatedImageUrl,
        style,
        size: finalSize.replace('*', 'x'), // 转回x给前端
        tip: generatedImageUrl ? "" : "图片生成成功，但未获取到URL（豆包API返回格式异常）"
      },
      processingTime: Date.now() - requestStartTime
    });

  } catch (error: any) {
    // 全局错误处理
    console.error('=== 接口错误详情 ===', {
      timestamp: new Date().toISOString(),
      clientIp,
      requestBody: req.body,
      errorMessage: error.message,
      errorStack: error.stack
    });

    return res.status(500).json({
      success: false,
      error: `服务器内部错误：${error.message}`,
      processingTime: Date.now() - requestStartTime
    });
  }
}