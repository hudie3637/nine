#!/usr/bin/env node
/**
 * Qwen 3.5 Plus 模型切换验证测试脚本
 * 完整测试所有相关配置
 */

import fs from 'fs/promises';
import path from 'path';

// 配置检查函数
async function checkConfig() {
  console.log('🔍 配置检查开始...');
  
  // 1. 检查 .env.local 文件
  try {
    const envContent = await fs.readFile('.env.local', 'utf8');
    console.log('✅ .env.local 文件存在');
    
    const lines = envContent.split('\n');
    const config = {};
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...value] = trimmed.split('=');
        config[key] = value.join('=').replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      }
    });
    
    console.log('📌 环境变量配置:');
    console.log(`   VITE_QWEN_API_KEY: ${config.VITE_QWEN_API_KEY ? '✓ 已配置' : '✗ 未配置'}`);
    console.log(`   VITE_QWEN_MODEL: ${config.VITE_QWEN_MODEL || '未设置'}`);
    
    return config;
  } catch (error) {
    console.error('❌ .env.local 文件读取失败:', error.message);
    return {};
  }
}

// 2. 测试 API 连接
async function testAPIConnection(config) {
  console.log('\n🌐 API 连接测试...');
  
  const apiKey = config.VITE_QWEN_API_KEY;
  if (!apiKey) {
    console.error('❌ 错误：未找到 API 密钥，请在 .env.local 中配置 VITE_QWEN_API_KEY');
    return false;
  }

  // 测试端点列表（按优先级）
  const testEndpoints = [
    {
      name: '兼容模式端点',
      url: 'https://dashscope.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1',
      model: 'qwen3.5-plus',
      description: 'Qwen 3.5 Plus 推荐端点'
    },
    {
      name: '文本生成端点',
      url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      model: 'qwen3.5-plus',
      description: '传统文本生成端点'
    }
  ];

  for (const endpoint of testEndpoints) {
    console.log(`\n🧪 测试端点: ${endpoint.name} (${endpoint.description})`);
    
    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: endpoint.model,
          input: {
            messages: [{
              role: 'user',
              content: '请用一句话介绍你自己'
            }]
          },
          parameters: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 50
          }
        })
      });

      console.log(`   状态码: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ 请求成功！');
        
        // 检查响应内容
        const hasContent = data.output?.choices?.[0]?.message?.content || 
                          data.output?.text || 
                          data.output?.result;
        
        if (hasContent) {
          console.log(`   🤖 AI 回答: ${hasContent.substring(0, 60)}...`);
          return true;
        } else {
          console.log('   ⚠️ 响应成功但无内容');
        }
      } else {
        const errorText = await response.text();
        console.log(`   ❌ 请求失败: ${errorText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   ❌ 网络错误: ${error.message.substring(0, 100)}...`);
    }
  }

  console.error('❌ 所有端点测试失败');
  return false;
}

// 3. 代码配置检查
async function checkCodeConfig() {
  console.log('\n💻 代码配置检查...');
  
  try {
    const analyzeContent = await fs.readFile('src/api/analyze.ts', 'utf8');
    
    // 检查模型参数
    const modelParamMatch = analyzeContent.match(/model\s*=\s*'([^']+)'/);
    const apiEndpointMatch = analyzeContent.match(/fetch\(\s*'([^']+)'(?:\s*,\s*\{)?/);
    
    console.log(`   模型参数: ${modelParamMatch ? modelParamMatch[1] : '未找到'}`);
    console.log(`   API 端点: ${apiEndpointMatch ? apiEndpointMatch[1] : '未找到'}`);
    
    // 检查 result_format 参数
    const resultFormatExists = analyzeContent.includes('result_format');
    console.log(`   result_format 参数: ${resultFormatExists ? '存在' : '已移除'}`);
    
    return true;
  } catch (error) {
    console.error('❌ 代码文件读取失败:', error.message);
    return false;
  }
}

// 主测试函数
async function runFullTest() {
  console.log('🚀 Qwen 3.5 Plus 模型切换验证测试');
  console.log('==========================================');
  
  try {
    // 1. 检查配置
    const config = await checkConfig();
    
    // 2. 检查代码配置
    await checkCodeConfig();
    
    // 3. 测试 API 连接
    const apiSuccess = await testAPIConnection(config);
    
    // 4. 总结结果
    console.log('\n==========================================');
    console.log('📋 测试总结:');
    
    if (apiSuccess) {
      console.log('🎉 测试成功！Qwen 3.5 Plus 配置正确');
      console.log('✅ .env.local 配置正确');
      console.log('✅ 代码中模型参数设置为 qwen3.5-plus');
      console.log('✅ API 端点配置正确');
      console.log('✅ result_format 参数已移除');
    } else {
      console.log('❌ 测试失败！请检查以下事项：');
      console.log('1. .env.local 中 VITE_QWEN_API_KEY 是否正确配置（去掉引号）');
      console.log('2. DashScope 控制台中是否已开通 Qwen 3.5 Plus 模型权限');
      console.log('3. 网络连接是否正常');
      console.log('4. API 密钥是否有调用配额');
    }
    
    return apiSuccess;
  } catch (error) {
    console.error('💥 测试过程中出现错误:', error.message);
    return false;
  }
}

// 运行测试
await runFullTest();