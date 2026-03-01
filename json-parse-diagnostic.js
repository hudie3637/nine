#!/usr/bin/env node
/**
 * JSON解析问题诊断脚本
 * 专门用于诊断和修复JSON解析错误
 */

const https = require('https');
const { URL } = require('url');

// 配置
const CONFIG = {
  BACKEND_URL: 'https://fengshui-backend-4i5o.onrender.com',
  TIMEOUT_MS: 15000
};

console.log('🔍 JSON解析问题诊断开始...');
console.log(`Backend: ${CONFIG.BACKEND_URL}`);
console.log('='.repeat(60));

/**
 * 发送请求并捕获原始响应
 */
function makeRawRequest(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const request = https.get(url, {
      timeout: CONFIG.TIMEOUT_MS,
      headers: {
        'User-Agent': 'JSON-Diagnostic-Script/1.0',
        'Accept': '*/*'
      }
    }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          success: true,
          status: response.statusCode,
          statusText: response.statusMessage,
          headers: response.headers,
          rawBody: data,
          duration: Date.now() - startTime
        });
      });
    });
    
    request.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      });
    });
    
    request.on('timeout', () => {
      request.destroy();
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
 * 检查JSON格式问题
 */
function analyzeJsonString(jsonString) {
  const issues = [];
  
  // 1. 检查基本JSON格式
  try {
    JSON.parse(jsonString);
    return { valid: true, issues: [] };
  } catch (parseError) {
    issues.push(`JSON解析错误: ${parseError.message}`);
  }
  
  // 2. 检查常见问题
  if (jsonString.includes('“') || jsonString.includes('”')) {
    issues.push('发现中文引号（“”），需要替换为英文引号（""）');
  }
  
  if (jsonString.includes('‘') || jsonString.includes('’')) {
    issues.push('发现中文单引号（‘’），需要替换为英文单引号（\'）');
  }
  
  // 3. 检查未闭合的引号
  const doubleQuoteCount = (jsonString.match(/"/g) || []).length;
  if (doubleQuoteCount % 2 !== 0) {
    issues.push(`双引号数量为奇数 (${doubleQuoteCount})，可能存在未闭合引号`);
  }
  
  // 4. 检查属性名格式
  if (jsonString.match(/([a-zA-Z_][a-zA-Z0-9_]*)(\s*=\s*")/)) {
    issues.push('发现 key = "value" 格式，需要转换为 "key": "value"');
  }
  
  // 5. 检查数组和对象闭合
  const openBrackets = (jsonString.match(/\{/g) || []).length;
  const closeBrackets = (jsonString.match(/\}/g) || []).length;
  const openArrays = (jsonString.match(/\[/g) || []).length;
  const closeArrays = (jsonString.match(/\]/g) || []).length;
  
  if (openBrackets !== closeBrackets) {
    issues.push(`对象括号不匹配: {=${openBrackets}, }=${closeBrackets}`);
  }
  
  if (openArrays !== closeArrays) {
    issues.push(`数组括号不匹配: [=${openArrays}, ]=${closeArrays}`);
  }
  
  return { valid: false, issues };
}

/**
 * 测试分析API的JSON响应
 */
async function testAnalyzeAPIJson() {
  console.log('\n🧪 测试分析API JSON响应...');
  const url = `${CONFIG.BACKEND_URL}/api/analyze`;
  
  // 创建测试请求体
  const testRequestBody = {
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    model: 'doubao-seed-2-0-mini-260215',
    userId: 'diagnostic-test',
    userSessionId: 'diag-session-123'
  };
  
  try {
    // 先发送POST请求获取响应
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'JSON-Diagnostic-Script/1.0'
      },
      body: JSON.stringify(testRequestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const rawBody = await response.text();
    
    console.log(`✅ 请求成功，状态码: ${response.status}`);
    console.log(`   响应长度: ${rawBody.length} 字节`);
    
    // 分析JSON问题
    const analysis = analyzeJsonString(rawBody);
    
    console.log('\n🔍 JSON格式分析:');
    if (analysis.valid) {
      console.log('✅ JSON格式正确');
    } else {
      console.log('❌ JSON格式存在问题:');
      analysis.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      
      // 显示前200字符
      console.log('\n📋 响应前200字符:');
      console.log(rawBody.substring(0, 200));
    }
    
    return !analysis.valid;
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
    return true;
  }
}

/**
 * 运行诊断
 */
async function runDiagnostic() {
  console.log('🚀 开始JSON解析问题诊断...');
  
  // 1. 测试健康检查
  console.log('\n🔍 步骤1: 测试健康检查端点');
  try {
    const result = await makeRawRequest(`${CONFIG.BACKEND_URL}/api/health`);
    if (result.success) {
      console.log('✅ 健康检查端点可访问');
      console.log(`   状态码: ${result.status}`);
      console.log(`   响应长度: ${result.rawBody.length} 字节`);
      
      // 检查健康检查响应的JSON格式
      const healthAnalysis = analyzeJsonString(result.rawBody);
      if (!healthAnalysis.valid) {
        console.log('⚠️ 健康检查响应存在JSON格式问题:');
        healthAnalysis.issues.forEach(issue => console.log(`   - ${issue}`));
      }
    } else {
      console.log('❌ 健康检查端点不可访问:', result.error);
    }
  } catch (error) {
    console.log('❌ 健康检查测试异常:', error.message);
  }
  
  // 2. 测试分析API JSON
  await testAnalyzeAPIJson();
  
  // 3. 输出诊断总结
  console.log('\n' + '='.repeat(60));
  console.log('📋 诊断总结');
  console.log('='.repeat(60));
  
  console.log('🔧 建议的修复措施:');
  console.log('1. 在后端API中添加JSON格式验证和修复逻辑');
  console.log('2. 确保AI返回的JSON是标准格式');
  console.log('3. 在前端添加更健壮的JSON解析处理');
  console.log('4. 检查环境变量配置是否正确');
  
  console.log('\n💡 快速修复建议:');
  console.log('- 在src/api/analyze.ts中检查JSON解析逻辑');
  console.log('- 确认.env.production中的API密钥配置正确');
  console.log('- 检查Render部署配置是否完整');
  
  console.log('\n' + '='.repeat(60));
}

// 执行诊断
runDiagnostic().catch(error => {
  console.error('❌ 诊断执行出错:', error.message);
  process.exit(1);
});