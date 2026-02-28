#!/usr/bin/env node
/**
 * 快速测试脚本 - 验证 Qwen 3.5 Plus 基础连接
 * 使用正确的官方标准格式
 */

import fs from 'fs/promises';

async function quickTest() {
  console.log('⚡ 快速测试开始...');
  
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
    console.log('请在 .env.local 中添加：VITE_QWEN_API_KEY=your_api_key_here');
    return;
  }

  console.log('✅ API 密钥已加载');

  // 使用正确的官方标准端点
  const testUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
  
  try {
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "qwen-plus", // 注意：使用 qwen-plus 而不是 qwen3.5-plus
        messages: [{
          role: "user",
          content: "你好"
        }],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 100
      })
    });

    console.log(`状态码: ${response.status}`);
    console.log(`状态文本: ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 连接成功！');
      console.log('响应数据:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
    } else {
      const errorText = await response.text();
      console.error('❌ 请求失败:', errorText);
      
      // 提供具体解决方案
      console.log('\n🔧 建议解决方案:');
      console.log('1. 检查 DashScope 控制台中 Qwen 3.5 Plus 模型是否已开通');
      console.log('2. 确认 API 密钥有调用权限');
      console.log('3. 尝试在 DashScope 控制台直接测试该模型');
      console.log('4. 如果仍然失败，请提供确切的模型名称');
    }
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
    console.log('\n💡 请检查:');
    console.log('- 网络连接是否正常');
    console.log('- 防火墙是否阻止了请求');
    console.log('- 是否需要代理')
  }
}

// 运行测试
quickTest().catch(console.error);