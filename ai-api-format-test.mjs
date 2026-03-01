#!/usr/bin/env node
/**
 * AI API响应格式测试脚本
 * 专门测试豆包API返回的JSON格式问题
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

// 配置
const CONFIG = {
  BACKEND_URL: 'https://fengshui-backend-4i5o.onrender.com',
  TIMEOUT_MS: 15000,
  TEST_IMAGE_BASE64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
};

console.log('🔍 AI API响应格式测试开始...');
console.log(`Backend: ${CONFIG.BACKEND_URL}`);
console.log('='.repeat(60));

/**
 * 发送请求并获取原始响应
 */
async function makeRawRequest(url, options = {}) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get(url, {
      timeout: CONFIG.TIMEOUT_MS,
      headers: {
        'User-Agent': 'AI-Format-Test/1.0',
        'Accept': '*/*',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          success: true,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          rawBody: data,
          duration: Date.now() - startTime
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout',
        errorType: 'TIMEOUT',
        duration: CONFIG.TIMEOUT_MS
      });
    });
  });
}

/**
 * 分析JSON格式问题
 */
function analyzeJsonFormat(jsonString) {
  const issues = [];
  
  // 1. 检查基本JSON解析
  try {
    JSON.parse(jsonString);
    return { valid: true, issues: [] };
  } catch (parseError) {
    issues.push(`JSON解析错误: ${parseError.message}`);
  }
  
  // 2. 检查常见格式问题
  if (jsonString.includes('“') || jsonString.includes('”')) {
    issues.push('发现中文双引号（“”），需要替换为英文双引号（""）');
  }
  
  if (jsonString.includes('‘') || jsonString.includes('’')) {
    issues.push('发现中文单引号（‘’），需要替换为英文单引号（\'）');
  }
  
  // 3. 检查引号配对
  const doubleQuotes = (jsonString.match(/"/g) || []).length;
  const singleQuotes = (jsonString.match(/'/g) || []).length;
  
  if (doubleQuotes % 2 !== 0) {
    issues.push(`双引号数量为奇数 (${doubleQuotes})，可能存在未闭合引号`);
  }
  
  if (singleQuotes % 2 !== 0) {
    issues.push(`单引号数量为奇数 (${singleQuotes})，可能存在未闭合引号`);
  }
  
  // 4. 检查属性名格式
  if (jsonString.match(/([a-zA-Z_][a-zA-Z0-9_]*)(\s*=\s*")/)) {
    issues.push('发现 key = "value" 格式，需要转换为 "key": "value"');
  }
  
  // 5. 检查括号配对
  const openBraces = (jsonString.match(/\{/g) || []).length;
  const closeBraces = (jsonString.match(/\}/g) || []).length;
  const openBrackets = (jsonString.match(/\[/g) || []).length;
  const closeBrackets = (jsonString.match(/\]/g) || []).length;
  
  if (openBraces !== closeBraces) {
    issues.push(`对象括号不匹配: {=${openBraces}, }=${closeBraces}`);
  }
  
  if (openBrackets !== closeBrackets) {
    issues.push(`数组括号不匹配: [=${openBrackets}, ]=${closeBrackets}`);
  }
  
  return { valid: false, issues };
}

/**
 * 测试分析API的JSON响应
 */
async function testAnalyzeAPIResponse() {
  console.log('\n🧪 测试分析API JSON响应格式...');
  const url = `${CONFIG.BACKEND_URL}/api/analyze`;
  
  // 创建测试请求体
  const testRequestBody = {
    imageBase64: CONFIG.TEST_IMAGE_BASE64,
    model: 'doubao-seed-2-0-mini-260215',
    userId: 'format-test-user',
    userSessionId: 'format-test-session'
  };
  
  try {
    // 使用fetch发送POST请求（模拟前端行为）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Format-Test/1.0'
      },
      body: JSON.stringify(testRequestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const rawBody = await response.text();
    
    console.log(`✅ 请求成功，状态码: ${response.status}`);
    console.log(`   响应长度: ${rawBody.length} 字节`);
    
    // 分析JSON格式
    const analysis = analyzeJsonFormat(rawBody);
    
    console.log('\n🔍 JSON格式分析:');
    if (analysis.valid) {
      console.log('✅ JSON格式正确');
    } else {
      console.log('❌ JSON格式存在问题:');
      analysis.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      
      // 显示前200字符和最后200字符
      console.log('\n📋 响应前200字符:');
      console.log(rawBody.substring(0, Math.min(200, rawBody.length)));
      
      if (rawBody.length > 200) {
        console.log('\n📋 响应后200字符:');
        console.log(rawBody.substring(Math.max(0, rawBody.length - 200), rawBody.length));
      }
    }
    
    return !analysis.valid;
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
    return true;
  }
}

/**
 * 测试健康检查响应格式
 */
async function testHealthCheckFormat() {
  console.log('\n🧪 测试健康检查JSON响应格式...');
  const url = `${CONFIG.BACKEND_URL}/api/health`;
  
  try {
    const result = await makeRawRequest(url);
    
    if (result.success) {
      console.log(`✅ 健康检查响应成功，状态码: ${result.status}`);
      console.log(`   响应长度: ${result.rawBody.length} 字节`);
      
      const analysis = analyzeJsonFormat(result.rawBody);
      
      console.log('\n🔍 健康检查JSON格式分析:');
      if (analysis.valid) {
        console.log('✅ 健康检查JSON格式正确');
      } else {
        console.log('❌ 健康检查JSON格式存在问题:');
        analysis.issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue}`);
        });
      }
    } else {
      console.log('❌ 健康检查请求失败:', result.error);
    }
    
    return result.success && !analysis.valid;
  } catch (error) {
    console.log('❌ 健康检查测试异常:', error.message);
    return true;
  }
}

/**
 * 运行全面测试
 */
async function runFormatTest() {
  console.log('🚀 开始AI API响应格式全面测试...');
  
  // 1. 测试健康检查格式
  await testHealthCheckFormat();
  
  // 2. 测试分析API格式
  await testAnalyzeAPIResponse();
  
  // 3. 输出总结
  console.log('\n' + '='.repeat(60));
  console.log('📋 格式测试总结');
  console.log('='.repeat(60));
  
  console.log('\n🔧 常见JSON格式问题:');
  console.log('1. 中文引号 → 需要替换为英文引号');
  console.log('2. 未闭合字符串 → 需要补全引号');
  console.log('3. 属性名格式错误 → key = "value" 需要转换为 "key": "value"');
  console.log('4. 括号不匹配 → 需要检查 { } 和 [ ] 配对');
  console.log('5. 转义字符问题 → 需要正确处理 \n, \t 等');

  console.log('\n💡 建议的修复方案:');
  console.log('1. 在 src/api/analyze.ts 中添加JSON格式修复逻辑');
  console.log('2. 使用 jsonrepair 库进行自动修复');
  console.log('3. 在AI提示词中明确要求返回标准JSON格式');
  console.log('4. 添加更健壮的错误处理和日志记录');

  console.log('\n📋 参考文件:');
  console.log('- /json-parse-error-handler.ts');
  console.log('- /src/api/analyze.ts');
  console.log('- /JSON-PARSE-FIX-README.md');

  console.log('\n' + '='.repeat(60));
  console.log('✅ 测试完成');
  console.log('='.repeat(60));
}