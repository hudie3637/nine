import { VercelRequest, VercelResponse } from '@vercel/node';

// 限流配置
const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 5,
  maxLogEntries: 1000,
  requestLog: [] as { timestamp: number; ip: string }[]
};

const cleanRequestLog = () => {
  const now = Date.now();
  RATE_LIMIT_CONFIG.requestLog = RATE_LIMIT_CONFIG.requestLog.filter(
    item => now - item.timestamp < 60000
  );
  if (RATE_LIMIT_CONFIG.requestLog.length > RATE_LIMIT_CONFIG.maxLogEntries) {
    RATE_LIMIT_CONFIG.requestLog = RATE_LIMIT_CONFIG.requestLog.slice(-RATE_LIMIT_CONFIG.maxLogEntries);
  }
};

const isIpRateLimited = (ip: string): boolean => {
  cleanRequestLog();
  const ipRequests = RATE_LIMIT_CONFIG.requestLog.filter(item => item.ip === ip);
  return ipRequests.length >= RATE_LIMIT_CONFIG.maxRequestsPerMinute;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const requestStartTime = Date.now();
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
    || req.ip?.replace('::ffff:', '') 
    || '127.0.0.1';

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed',
        processingTime: Date.now() - requestStartTime
      });
    }

    if (isIpRateLimited(clientIp)) {
      return res.status(429).json({
        success: false,
        error: '请求频率过高，请稍后重试',
        processingTime: Date.now() - requestStartTime
      });
    }

    RATE_LIMIT_CONFIG.requestLog.push({
      timestamp: Date.now(),
      ip: clientIp
    });

    const { prompt, style = 'traditional', size = '1024x1024' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing prompt（提示词不能为空）',
        processingTime: Date.now() - requestStartTime
      });
    }

    const apiKey = process.env.ARK_API_KEY || process.env.VITE_ARK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'ARK_API_KEY not configured（未配置API密钥）',
        processingTime: Date.now() - requestStartTime
      });
    }

    const validSizes = ['2K', '1K', '4K', '1024x1024', '1120x1440', '1440x1120', '768x1024', '1024x768'];
    const convertedSize = size.toUpperCase();
    const finalSize = validSizes.includes(convertedSize) ? convertedSize : '1024x1024';

    const requestBody = {
      model: 'doubao-seedream-4-0-250828',
      prompt: `${prompt}，${style}风格，高清写实，专业建筑风水示意图，细节丰富，符合中国传统风水原理，用于户型优化建议展示`,
      sequential_image_generation: 'disabled',
      response_format: 'url',
      size: finalSize,
      stream: false,
      watermark: true
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Doubao API error: ${response.status} - ${errorText}`);
    }

    const apiResult: any = await response.json();

    let generatedImageUrl = "";
    if (apiResult.data?.[0]?.url) {
      generatedImageUrl = apiResult.data[0].url;
    } else if (apiResult.url) {
      generatedImageUrl = apiResult.url;
    } else {
      generatedImageUrl = apiResult.data?.url || "";
    }

    return res.status(200).json({
      success: true,
      data: {
        imageUrl: generatedImageUrl,
        style,
        size: finalSize.replace('*', 'x'),
        tip: generatedImageUrl ? "" : "图片生成成功，但未获取到URL"
      },
      processingTime: Date.now() - requestStartTime
    });

  } catch (error: any) {
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