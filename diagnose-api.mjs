#!/usr/bin/env node
/**
 * 详细诊断脚本 - 完全复制 analyze.ts 中的请求格式
 */

import fs from 'fs/promises';

async function diagnoseApi() {
  console.log('🔍 详细诊断开始...');
  
  // 读取 API 密钥
  let apiKey = process.env.VITE_QWEN_API_KEY;
  
  if (!apiKey) {
    try {
      const envContent = await fs.readFile('.env.local', 'utf8');
      const lines = envContent.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('VITE_QWEN_API_KEY=')) {
          apiKey = trimmed.split('=')[1].replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
          break;
        }
      }
    } catch (e) {}
  }

  if (!apiKey) {
    console.error('❌ 错误：未找到 API 密钥');
    return;
  }

  console.log('✅ API 密钥已加载');

  // 完全复制 analyze.ts 中的请求格式
  const endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
  
  // 模拟 analyze.ts 中的严格提示词
  const strictPrompt = `请严格按照以下JSON Schema格式返回分析结果，不要包含任何额外的解释文字或markdown代码块标记：

{
  "houseType": "三室两厅一厨两卫",
  "overallRating": 85,
  "fengShuiAnalysis": {
    "layoutEvaluation": "户型方正，采光良好，南北通透",
    "auspiciousElements": ["主卧位于宅邸生气方", "客厅宽敞明亮"],
    "improvementSuggestions": ["可在西北角摆放金属饰品增强乾位气场"]
  },
  "lightingAnalysis": {
    "naturalLighting": "整体采光充足，主要房间均朝南",
    "artificialLighting": "照明布局合理，重点区域光线充足",
    "optimizationAdvice": ["建议增加局部照明提升氛围感"]
  },
  "psychologyAnalysis": {
    "spatialPsychology": "空间尺度适宜，动线流畅自然",
    "comfortLevel": "居住舒适度较高，私密性良好",
    "designRecommendations": ["可适当增加绿植提升生机感"]
  },
  "energyEfficiency": {
    "insulationPerformance": "保温隔热性能良好",
    "energyConsumption": "能耗水平处于同类型房屋中等偏上",
    "ecoFriendlySuggestions": ["建议安装智能温控系统进一步节能"]
  }
}`;

  try {
    console.log('📤 发送请求到:', endpoint);
    console.log('📝 模型:', 'qwen-plus');
    console.log('📏 提示词长度:', strictPrompt.length);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          {
            role: 'user',
            content: strictPrompt
          }
        ],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 4500
      })
    });

    console.log(`📊 状态码: ${response.status}`);
    console.log(`📋 状态文本: ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 请求成功！');
      console.log('📦 响应结构:', Object.keys(data));
      console.log('💬 内容预览:', JSON.stringify(data.choices?.[0]?.message?.content || '无内容', null, 2).substring(0, 200) + '...');
    } else {
      const errorText = await response.text();
      console.error('❌ 请求失败:', errorText);
      
      // 分析错误类型
      if (errorText.includes('url error')) {
        console.log('🔧 可能的解决方案:');
        console.log('1. 检查端点URL是否正确');
        console.log('2. 确认模型名称是否准确');
        console.log('3. 验证请求体格式是否符合规范');
      } else if (errorText.includes('InvalidApiKey')) {
        console.log('🔑 API密钥可能无效');
      } else if (errorText.includes('Forbidden')) {
        console.log('🚫 没有该模型的调用权限');
      }
    }
  } catch (error) {
    console.error('💥 网络异常:', error.message);
  }
}

diagnoseApi().catch(console.error);