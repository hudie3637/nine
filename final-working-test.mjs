#!/usr/bin/env node
/**
 * 最终工作测试脚本 - 阿里云 DashScope 官方标准格式
 * 基于 2026 年阿里云官方最新文档
 */

import fs from 'fs/promises';

async function finalWorkingTest() {
  console.log('✅ 最终工作测试 - 验证 Qwen 3.5 Plus');
  
  // 获取 API 密钥
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
    } catch (e) {
      console.warn('⚠️ 未找到 .env.local 文件，仅使用环境变量');
    }
  }

  if (!apiKey) {
    console.error('❌ 请配置 VITE_QWEN_API_KEY');
    return;
  }

  console.log('🔑 API 密钥: 已配置');

  // 阿里云官方最新的正确端点
  const endpoint = {
    name: '官方标准 V2',
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
  };

  console.log(`\n🔍 测试: ${endpoint.name}`);
  
  try {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: "qwen-plus", // 注意：官方标准名称是 qwen-plus (对应3.5)，不是 qwen3.5-plus
        messages: [
          {
            role: "user",
            content: "测试连接，请回复'连接成功'"
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    console.log(`状态码: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 成功！响应结果:');
      console.log(`   回复内容: ${data.choices[0]?.message?.content || '无回复内容'}`);
      console.log(`   请求ID: ${data.id || '无ID'}`);
      return true;
    } else {
      const text = await response.text();
      console.log('❌ 失败详情:', text);
      
      // 常见错误提示
      if (text.includes('InvalidApiKey')) {
        console.log('\n💡 错误原因: API密钥无效，请检查密钥是否正确');
      } else if (text.includes('Forbidden')) {
        console.log('\n💡 错误原因: 没有该模型的调用权限，请在控制台开通');
      } else if (text.includes('QuotaExceeded')) {
        console.log('\n💡 错误原因: 调用额度已用尽，请充值或等待配额重置');
      }
    }
  } catch (error) {
    console.log('❌ 网络异常:', error.message);
    console.log('\n💡 请检查网络连接，确保能访问阿里云服务器');
  }

  console.error('\n❌ 测试失败');
  console.log('\n💡 请按以下步骤检查:');
  console.log('1. 确认 API 密钥正确: https://dashscope.console.aliyuncs.com/apiKey');
  console.log('2. 开通 Qwen 模型权限: https://dashscope.console.aliyuncs.com/model');
  console.log('3. 检查账户余额/配额: https://dashscope.console.aliyuncs.com/billing');
  console.log('4. 模型名称确认: qwen-plus (3.5) / qwen-turbo (极速版) / qwen-max (4.0)');

  return false;
}

finalWorkingTest().catch(console.error);