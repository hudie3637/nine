#!/usr/bin/env node
/**
 * 豆包API返回格式测试脚本
 * 用于查看实际的API响应结构
 */

import dotenv from 'dotenv';
import fs from 'fs/promises';

// 加载环境变量
dotenv.config({ path: '.env.local' });

async function testDoubaoFormat() {
  console.log('🔍 测试豆包API返回格式...');
  
  const apiKey = process.env.VITE_DOUBAO_API_KEY || process.env.DOUBAO_API_KEY;
  
  if (!apiKey) {
    console.error('❌ 未找到豆包API密钥');
    return;
  }

  console.log('✅ 找到API密钥');

  // 创建一个简单的测试图片（1x1像素的PNG）
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
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
    
    console.log('\n🔍 关键字段分析:');
    console.log('- response_id:', data.response_id || '未找到');
    console.log('- output类型:', Array.isArray(data.output) ? '数组' : typeof data.output);
    console.log('- usage:', data.usage || '未找到');
    
    if (Array.isArray(data.output)) {
      console.log('- output数组长度:', data.output.length);
      data.output.forEach((item, index) => {
        console.log(`  [${index}] type: ${item.type || '未知'}, content类型: ${Array.isArray(item.content) ? '数组' : typeof item.content}`);
      });
    }
    
  } catch (error) {
    console.error('💥 网络错误:', error.message);
  }
}

await testDoubaoFormat();