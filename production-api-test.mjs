#!/usr/bin/env node
/**
 * 生产环境API测试脚本
 * 测试前后端连通性、API功能和超时问题
 * 运行命令: node production-api-test.mjs
 */

import fs from 'fs';
import path from 'path';
import { URL } from 'url';

// 配置
const CONFIG = {
  FRONTEND_URL: 'https://fengshui-frontend-ganp.onrender.com',
  BACKEND_URL: 'https://fengshui-backend-4i5o.onrender.com',
  TIMEOUT_MS: 15000, // 15秒超时（比Render的10秒限制更宽松）
  TEST_IMAGE_BASE64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' // 小图片base64
};

// 测试结果存储
const results = [];

/**
 * 发送HTTP请求的通用函数
 */
async function httpRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Production-Test-Script/1.0',
        'Accept': 'application/json',
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      body: await response.text(),
      duration: Date.now() - startTime
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout',
        errorType: 'TIMEOUT',
        duration: CONFIG.TIMEOUT_MS
      };
    }
    
    return {
      success: false,
      error: error.message,
      errorType: error.name,
      duration: Date.now() - startTime
    };
  }
}

/**
 * 测试健康检查端点
 */
async function testHealthCheck() {
  console.log('\n🔍 测试健康检查端点...');
  const startTime = Date.now();
  
  try {
    const url = `${CONFIG.BACKEND_URL}/api/health`;
    const result = await httpRequest(url);
    
    results.push({
      scenario: '健康检查',
      url,
      success: result.success,
      status: result.status,
      duration: result.duration,
      error: result.error,
      timestamp: new Date().toISOString()
    });
    
    if (result.success && result.status === 200) {
      console.log('✅ 健康检查成功');
      console.log(`   返回状态: ${result.status} ${result.statusText}`);
      try {
        const healthData = JSON.parse(result.body);
        console.log(`   服务信息: ${healthData.service || '未知'}`);
        console.log(`   版本: ${healthData.version || '未知'}`);
      } catch (e) {
        console.log(`   响应内容: ${result.body.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ 健康检查失败');
      console.log(`   错误: ${result.error || '未知错误'}`);
    }
    
    return result.success;
  } catch (error) {
    console.log('❌ 健康检查异常:', error.message);
    return false;
  }
}

/**
 * 测试分析API端点
 */
async function testAnalyzeAPI() {
  console.log('\n🔍 测试分析API端点...');
  const startTime = Date.now();
  
  try {
    const url = `${CONFIG.BACKEND_URL}/api/analyze`;
    const requestBody = {
      imageBase64: CONFIG.TEST_IMAGE_BASE64,
      model: 'doubao-seed-2-0-mini-260215',
      userId: 'test-user-123',
      userSessionId: 'test-session-456'
    };
    
    const result = await httpRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    results.push({
      scenario: '分析API',
      url,
      success: result.success,
      status: result.status,
      duration: result.duration,
      error: result.error,
      timestamp: new Date().toISOString()
    });
    
    if (result.success) {
      console.log(`✅ 分析API测试完成`);
      console.log(`   状态码: ${result.status}`);
      
      try {
        const jsonData = JSON.parse(result.body);
        if (jsonData.error) {
          console.log(`   API返回错误: ${jsonData.error}`);
        } else {
          console.log(`   API返回成功数据`);
          // 检查JSON结构完整性
          if (jsonData.overallRating !== undefined) {
            console.log(`   评分: ${jsonData.overallRating}`);
          }
        }
      } catch (parseError) {
        console.log(`   ❌ JSON解析错误: ${parseError.message}`);
        console.log(`   原始响应: ${result.body.substring(0, 200)}...`);
      }
    } else {
      console.log('❌ 分析API测试失败');
      console.log(`   错误: ${result.error}`);
    }
    
    return result.success;
  } catch (error) {
    console.log('❌ 分析API测试异常:', error.message);
    return false;
  }
}

/**
 * 测试生成图片API端点
 */
async function testGenerateImageAPI() {
  console.log('\n🔍 测试生成图片API端点...');
  const startTime = Date.now();
  
  try {
    const url = `${CONFIG.BACKEND_URL}/api/generate-image`;
    const requestBody = {
      prompt: '现代中式风格客厅设计图',
      style: 'traditional',
      size: '1024x1024'
    };
    
    const result = await httpRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    results.push({
      scenario: '生成图片API',
      url,
      success: result.success,
      status: result.status,
      duration: result.duration,
      error: result.error,
      timestamp: new Date().toISOString()
    });
    
    if (result.success) {
      console.log(`✅ 生成图片API测试完成`);
      console.log(`   状态码: ${result.status}`);
      
      try {
        const jsonData = JSON.parse(result.body);
        if (jsonData.error) {
          console.log(`   API返回错误: ${jsonData.error}`);
        } else {
          console.log(`   API返回成功数据`);
          if (jsonData.url) {
            console.log(`   图片URL: ${jsonData.url.substring(0, 80)}...`);
          }
        }
      } catch (parseError) {
        console.log(`   ❌ JSON解析错误: ${parseError.message}`);
        console.log(`   原始响应: ${result.body.substring(0, 200)}...`);
      }
    } else {
      console.log('❌ 生成图片API测试失败');
      console.log(`   错误: ${result.error}`);
    }
    
    return result.success;
  } catch (error) {
    console.log('❌ 生成图片API测试异常:', error.message);
    return false;
  }
}

/**
 * 测试前端静态资源
 */
async function testFrontendResources() {
  console.log('\n🔍 测试前端静态资源...');
  
  const testUrls = [
    { name: '首页', url: CONFIG.FRONTEND_URL + '/' },
    { name: 'CSS文件', url: CONFIG.FRONTEND_URL + '/index.css' },
    { name: 'JS文件', url: CONFIG.FRONTEND_URL + '/assets/index-*.js' },
    { name: 'API代理', url: CONFIG.FRONTEND_URL + '/api/health' }
  ];
  
  for (const test of testUrls) {
    try {
      const startTime = Date.now();
      const result = await httpRequest(test.url);
      
      results.push({
        scenario: `前端-${test.name}`,
        url: test.url,
        success: result.success,
        status: result.status,
        duration: result.duration,
        error: result.error,
        timestamp: new Date().toISOString()
      });
      
      if (result.success && result.status >= 200 && result.status < 400) {
        console.log(`✅ ${test.name} 加载成功`);
        console.log(`   状态码: ${result.status}`);
        if (result.body.length > 0) {
          console.log(`   内容长度: ${result.body.length} 字节`);
        }
      } else {
        console.log(`❌ ${test.name} 加载失败`);
        console.log(`   状态码: ${result.status || '未知'}`);
        if (result.error) {
          console.log(`   错误: ${result.error}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${test.name} 测试异常: ${error.message}`);
      results.push({
        scenario: `前端-${test.name}`,
        url: test.url,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  return true;
}

/**
 * 主测试函数
 */
async function runFullTest() {
  console.log('🚀 开始生产环境API全面测试...');
  console.log(`Frontend: ${CONFIG.FRONTEND_URL}`);
  console.log(`Backend: ${CONFIG.BACKEND_URL}`);
  console.log(`超时设置: ${CONFIG.TIMEOUT_MS}ms`);
  console.log('='.repeat(60));
  
  // 测试顺序：健康检查 -> 分析API -> 生成图片API -> 前端资源
  const tests = [
    { name: '健康检查', func: testHealthCheck },
    { name: '分析API', func: testAnalyzeAPI },
    { name: '生成图片API', func: testGenerateImageAPI },
    { name: '前端资源', func: testFrontendResources }
  ];
  
  let allPassed = true;
  
  for (const test of tests) {
    try {
      console.log(`\n🧪 执行测试: ${test.name}`);
      const result = await test.func();
      if (!result) {
        allPassed = false;
      }
    } catch (error) {
      console.error(`❌ ${test.name} 测试执行异常:`, error.message);
      allPassed = false;
    }
  }
  
  // 输出汇总报告
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试汇总报告');
  console.log('='.repeat(60));
  
  results.forEach((result, index) => {
    const statusSymbol = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${statusSymbol} ${result.scenario}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   状态: ${result.success ? '成功' : '失败'}`);
    if (result.status) {
      console.log(`   HTTP状态码: ${result.status}`);
    }
    if (result.duration) {
      console.log(`   耗时: ${result.duration}ms`);
    }
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    console.log();
  });
  
  // 检查JSON解析问题
  const jsonParseErrors = results.filter(r => r.error && r.error.includes('JSON') || r.error && r.error.includes('parse'));
  if (jsonParseErrors.length > 0) {
    console.log('⚠️  JSON解析错误检测:');
    jsonParseErrors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.scenario}: ${error.error}`);
    });
  }
  
  // 检查超时问题
  const timeoutErrors = results.filter(r => r.errorType === 'TIMEOUT');
  if (timeoutErrors.length > 0) {
    console.log('⏰ 超时问题检测:');
    timeoutErrors.forEach((timeout, index) => {
      console.log(`   ${index + 1}. ${timeout.scenario}: 超时 (${timeout.duration}ms)`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`最终结果: ${allPassed ? '✅ 全部测试通过' : '❌ 存在失败测试'}`);
  console.log('='.repeat(60));
  
  // 保存测试报告
  try {
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passedTests: results.filter(r => r.success).length,
      failedTests: results.filter(r => !r.success).length,
      results: results,
      summary: {
        allPassed,
        hasTimeout: timeoutErrors.length > 0,
        hasJsonParseErrors: jsonParseErrors.length > 0
      }
    };
    
    const reportPath = path.join(process.cwd(), 'production-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📝 测试报告已保存到: ${reportPath}`);
  } catch (saveError) {
    console.error('❌ 无法保存测试报告:', saveError.message);
  }
  
  return allPassed;
}

// 执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runFullTest().catch(error => {
    console.error('❌ 测试执行出错:', error.message);
    process.exit(1);
  });
}