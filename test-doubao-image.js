#!/usr/bin/env node
/**
 * 测试豆包Seedream生图API
 */

import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function testDoubaoImageGeneration() {
  console.log('🚀 测试豆包Seedream生图API...');
  
  const apiKey = process.env.ARK_API_KEY;
  
  if (!apiKey) {
    console.error('❌ 未找到豆包API密钥，请在.env文件中设置ARK_API_KEY');
    return;
  }

  console.log('✅ 找到API密钥');

  const testPrompt = "现代简约风格的客厅设计，宽敞明亮，落地窗，木质地板，舒适的沙发组合，绿植装饰，温暖的灯光氛围";

  try {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "model": "doubao-seedream-4-0-250828",
        "prompt": testPrompt,
        "sequential_image_generation": "disabled",
        "response_format": "url",
        "size": "1024x1024",
        "stream": false,
        "watermark": true
      })
    });

    console.log(`📡 HTTP状态码: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API调用失败:', errorText);
      return false;
    }

    const data = await response.json();
    console.log('✅ API调用成功!');
    
    console.log('\n📦 响应数据结构:');
    console.log(JSON.stringify(data, null, 2));
    
    // 检查是否有图片URL
    if (data.data?.[0]?.url) {
      console.log('\n🖼️  生成的图片URL:');
      console.log(data.data[0].url);
      console.log('✅ 图片生成测试成功！');
      return true;
    } else {
      console.log('⚠️  未找到图片URL，但API调用成功');
      return false;
    }
    
  } catch (error) {
    console.error('💥 网络错误:', error.message);
    return false;
  }
}

// 运行测试
testDoubaoImageGeneration();