#!/usr/bin/env node
/**
 * 最终豆包API测试脚本 - 使用从curl命令中确认的正确格式
 */

import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

async function testFinalDoubao() {
  console.log('🔍 最终测试豆包API格式...');
  
  const apiKey = process.env.VITE_DOUBAO_API_KEY || process.env.DOUBAO_API_KEY;
  
  if (!apiKey) {
    console.error('❌ 未找到豆包API密钥');
    return;
  }

  console.log('✅ 找到API密钥');

  const testPrompt = '请返回一个简单的JSON格式响应：{"test": "success"}';

  try {
    const response = await fetch(
      'https://ark.cn-beijing.volces.com/api/v3/responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'doubao-seed-2-0-mini-260215',
          input: [
            {
              role: 'user',
              content: [
                {
                  "type": "input_image",
                  "image_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                },
                {
                  "type": "input_text",
                  "text": testPrompt
                }
              ]
            }
          ]
        })
      });

    console.log(`状态码: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 请求失败:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ 请求成功！');
    
    console.log('\n📦 完整响应结构:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('💥 网络错误:', error.message);
  }
}

await testFinalDoubao();