#!/usr/bin/env node
/**
 * 综合生产环境测试脚本
 * 全面测试前后端连通性和各API功能
 * 支持Render部署环境测试
 */

import fs from 'fs';
import path from 'path';

// 配置 - Render部署地址
const CONFIG = {
  FRONTEND_URL: 'https://fengshui-frontend-ganp.onrender.com',
  BACKEND_URL: 'https://fengshui-backend-4i5o.onrender.com',
  TIMEOUT_MS: 30000, // 30秒超时
  TEST_IMAGE_BASE64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' // 最小base64图片
};

// 测试结果存储
const testResults = [];

console.log('🚀 综合生产环境测试开始...');
console.log(`Frontend: ${CONFIG.FRONTEND_URL}`);
console.log(`Backend: ${CONFIG.BACKEND_URL}`);
console.log(`超时设置: ${CONFIG.TIMEOUT_MS}ms`);
console.log('='.repeat(60));

/**
 * 通用HTTP请求函数
 */
async function httpRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Comprehensive-Test-Script/1.0',
        'Accept': 'application/json',
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    const body = await response.text();
    
    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      body: body,
      duration: Date.now() - startTime
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: '请求超时',
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
 * 测试1: 后端健康检查
 */
async function testBackendHealth() {
  console.log('\n🔍 测试1: 后端健康检查...');
  
  try {
    const url = `${CONFIG.BACKEND_URL}/api/health`;
    const result = await httpRequest(url);
    
    testResults.push({
      test: '后端健康检查',
      url: url,
      success: result.success,
      status: result.status,
      duration: result.duration,
      error: result.error,
      timestamp: new Date().toISOString()
    });
    
    if (result.success && result.status === 200) {
      console.log('✅ 后端健康检查成功');
      console.log(`   状态码: ${result.status}`);
      
      try {
        const healthData = JSON.parse(result.body);
        console.log(`   时间戳: ${healthData.timestamp}`);
        console.log(`   端口: ${healthData.port}`);
        
        // 检查环境变量配置
        if (healthData.env) {
          console.log('   环境变量状态:');
          Object.entries(healthData.env).forEach(([key, value]) => {
            console.log(`     ${key}: ${value}`);
          });
        }
      } catch (e) {
        console.log(`   响应内容预览: ${result.body.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ 后端健康检查失败');
      console.log(`   错误: ${result.error || `状态码: ${result.status}`}`);
    }
    
    return result.success;
  } catch (error) {
    console.log('❌ 后端健康检查异常:', error.message);
    return false;
  }
}

/**
 * 测试2: 前端首页加载
 */
async function testFrontendHomepage() {
  console.log('\n🔍 测试2: 前端首页加载...');
  
  try {
    const result = await httpRequest(CONFIG.FRONTEND_URL);
    
    testResults.push({
      test: '前端首页加载',
      url: CONFIG.FRONTEND_URL,
      success: result.success,
      status: result.status,
      duration: result.duration,
      error: result.error,
      timestamp: new Date().toISOString()
    });
    
    if (result.success && result.status >= 200 && result.status < 400) {
      console.log('✅ 前端首页加载成功');
      console.log(`   状态码: ${result.status}`);
      console.log(`   内容长度: ${result.body.length} 字节`);
      
      // 检查是否包含React应用的关键标识
      if (result.body.includes('id="root"') || result.body.includes('react')) {
        console.log('   ✅ 包含React应用标识');
      } else {
        console.log('   ⚠️  可能不是预期的React应用');
      }
    } else {
      console.log('❌ 前端首页加载失败');
      console.log(`   错误: ${result.error || `状态码: ${result.status}`}`);
    }
    
    return result.success;
  } catch (error) {
    console.log('❌ 前端首页加载异常:', error.message);
    return false;
  }
}

/**
 * 测试3: API代理功能 (通过前端访问后端)
 */
async function testApiProxy() {
  console.log('\n🔍 测试3: API代理功能...');
  
  try {
    const url = `${CONFIG.FRONTEND_URL}/api/health`;
    const result = await httpRequest(url);
    
    testResults.push({
      test: 'API代理功能',
      url: url,
      success: result.success,
      status: result.status,
      duration: result.duration,
      error: result.error,
      timestamp: new Date().toISOString()
    });
    
    if (result.success && result.status === 200) {
      console.log('✅ API代理功能正常');
      console.log(`   状态码: ${result.status}`);
      
      try {
        const healthData = JSON.parse(result.body);
        console.log(`   代理响应时间戳: ${healthData.timestamp}`);
      } catch (e) {
        console.log(`   代理响应预览: ${result.body.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ API代理功能异常');
      console.log(`   错误: ${result.error || `状态码: ${result.status}`}`);
    }
    
    return result.success;
  } catch (error) {
    console.log('❌ API代理测试异常:', error.message);
    return false;
  }
}

/**
 * 测试4: 分析API功能
 */
async function testAnalysisAPI() {
  console.log('\n🔍 测试4: 分析API功能...');
  
  try {
    const url = `${CONFIG.BACKEND_URL}/api/analyze`;
    const requestBody = {
      imageBase64: CONFIG.TEST_IMAGE_BASE64,
      model: 'doubao-seed-2-0-mini-260215',
      userId: 'test-user-comprehensive',
      userSessionId: 'test-session-comprehensive'
    };
    
    const result = await httpRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    testResults.push({
      test: '分析API功能',
      url: url,
      success: result.success,
      status: result.status,
      duration: result.duration,
      error: result.error,
      timestamp: new Date().toISOString()
    });
    
    if (result.success) {
      console.log(`✅ 分析API调用完成`);
      console.log(`   状态码: ${result.status}`);
      console.log(`   响应耗时: ${result.duration}ms`);
      
      try {
        const jsonData = JSON.parse(result.body);
        if (jsonData.error) {
          console.log(`   API返回错误: ${jsonData.error}`);
        } else {
          console.log('   ✅ API返回成功响应');
          
          // 检查关键字段
          const requiredFields = ['overallRating', 'energyAnalysis', 'designSuggestions'];
          const presentFields = requiredFields.filter(field => jsonData[field] !== undefined);
          console.log(`   关键字段完整性: ${presentFields.length}/${requiredFields.length}`);
          
          if (jsonData.overallRating !== undefined) {
            console.log(`   总体评分: ${jsonData.overallRating}`);
          }
        }
      } catch (parseError) {
        console.log(`   ❌ JSON解析错误: ${parseError.message}`);
        console.log(`   原始响应长度: ${result.body.length} 字符`);
      }
    } else {
      console.log('❌ 分析API调用失败');
      console.log(`   错误: ${result.error}`);
      console.log(`   耗时: ${result.duration}ms`);
    }
    
    return result.success;
  } catch (error) {
    console.log('❌ 分析API测试异常:', error.message);
    return false;
  }
}

/**
 * 测试5: 历史记录API
 */
async function testHistoryAPI() {
  console.log('\n🔍 测试5: 历史记录API...');
  
  try {
    const url = `${CONFIG.BACKEND_URL}/api/analysis-history`;
    const result = await httpRequest(url);
    
    testResults.push({
      test: '历史记录API',
      url: url,
      success: result.success,
      status: result.status,
      duration: result.duration,
      error: result.error,
      timestamp: new Date().toISOString()
    });
    
    if (result.success && result.status === 200) {
      console.log('✅ 历史记录API正常');
      console.log(`   状态码: ${result.status}`);
      
      try {
        const historyData = JSON.parse(result.body);
        if (Array.isArray(historyData)) {
          console.log(`   历史记录数量: ${historyData.length}`);
        } else {
          console.log('   响应格式不是数组');
        }
      } catch (e) {
        console.log(`   响应预览: ${result.body.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ 历史记录API异常');
      console.log(`   错误: ${result.error || `状态码: ${result.status}`}`);
    }
    
    return result.success;
  } catch (error) {
    console.log('❌ 历史记录API测试异常:', error.message);
    return false;
  }
}

/**
 * 生成测试报告
 */
function generateReport(allTestsPassed) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 综合测试报告');
  console.log('='.repeat(60));
  
  // 显示每个测试的结果
  testResults.forEach((result, index) => {
    const statusSymbol = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${statusSymbol} ${result.test}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   结果: ${result.success ? '成功' : '失败'}`);
    if (result.status) {
      console.log(`   状态码: ${result.status}`);
    }
    if (result.duration) {
      console.log(`   耗时: ${result.duration}ms`);
    }
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    console.log();
  });
  
  // 统计信息
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  
  console.log('📈 统计信息:');
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   通过测试: ${passedTests}`);
  console.log(`   失败测试: ${failedTests}`);
  console.log(`   通过率: ${(passedTests/totalTests*100).toFixed(1)}%`);
  
  // 识别问题类型
  const timeoutErrors = testResults.filter(r => r.errorType === 'TIMEOUT');
  const jsonErrors = testResults.filter(r => r.error && (r.error.includes('JSON') || r.error.includes('parse')));
  
  if (timeoutErrors.length > 0) {
    console.log('\n⏰ 超时问题:');
    timeoutErrors.forEach(err => {
      console.log(`   - ${err.test}: ${err.duration}ms`);
    });
  }
  
  if (jsonErrors.length > 0) {
    console.log('\n📄 JSON解析问题:');
    jsonErrors.forEach(err => {
      console.log(`   - ${err.test}: ${err.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`最终结论: ${allTestsPassed ? '✅ 生产环境运行正常' : '❌ 生产环境存在问题'}`);
  console.log('='.repeat(60));
  
  // 保存详细报告
  try {
    const detailedReport = {
      timestamp: new Date().toISOString(),
      configuration: CONFIG,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        passRate: (passedTests/totalTests*100).toFixed(1),
        allPassed: allTestsPassed
      },
      results: testResults,
      issues: {
        timeouts: timeoutErrors.map(e => ({ test: e.test, duration: e.duration })),
        jsonErrors: jsonErrors.map(e => ({ test: e.test, error: e.error }))
      }
    };
    
    const reportPath = path.join(process.cwd(), 'comprehensive-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2), 'utf8');
    console.log(`📝 详细报告已保存到: ${reportPath}`);
  } catch (saveError) {
    console.error('❌ 无法保存测试报告:', saveError.message);
  }
}

/**
 * 主测试函数
 */
async function runComprehensiveTest() {
  const tests = [
    { name: '后端健康检查', func: testBackendHealth },
    { name: '前端首页加载', func: testFrontendHomepage },
    { name: 'API代理功能', func: testApiProxy },
    { name: '分析API功能', func: testAnalysisAPI },
    { name: '历史记录API', func: testHistoryAPI }
  ];
  
  let allPassed = true;
  
  // 依次执行所有测试
  for (const test of tests) {
    try {
      console.log(`\n🧪 执行测试: ${test.name}`);
      const result = await test.func();
      if (!result) {
        allPassed = false;
      }
    } catch (error) {
      console.error(`❌ ${test.name} 执行异常:`, error.message);
      allPassed = false;
    }
  }
  
  // 生成最终报告
  generateReport(allPassed);
  
  return allPassed;
}

// 执行测试
runComprehensiveTest().catch(error => {
  console.error('❌ 测试执行严重错误:', error.message);
  console.error(error.stack);
  process.exit(1);
});