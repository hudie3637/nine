#!/usr/bin/env node
/**
 * 快速生产环境测试脚本
 * 用于快速验证前后端连通性
 */

const https = require('https');
const { URL } = require('url');

// 配置
const CONFIG = {
  FRONTEND_URL: 'https://fengshui-frontend-ganp.onrender.com',
  BACKEND_URL: 'https://fengshui-backend-4i5o.onrender.com',
  TIMEOUT_MS: 10000
};

console.log('🚀 快速生产环境测试开始...');
console.log(`Frontend: ${CONFIG.FRONTEND_URL}`);
console.log(`Backend: ${CONFIG.BACKEND_URL}`);
console.log('='.repeat(50));

/**
 * 发送HTTPS请求
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const request = https.get(url, {
      timeout: CONFIG.TIMEOUT_MS,
      headers: {
        'User-Agent': 'Quick-Test-Script/1.0'
      },
      ...options
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
          body: data,
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
 * 测试健康检查
 */
async function testHealth() {
  console.log('\n🔍 测试健康检查...');
  const url = `${CONFIG.BACKEND_URL}/api/health`;
  
  try {
    const result = await makeRequest(url);
    
    if (result.success && result.status === 200) {
      console.log('✅ 健康检查成功');
      console.log(`   状态码: ${result.status}`);
      try {
        const healthData = JSON.parse(result.body);
        console.log(`   服务信息: ${healthData.service || '未知'}`);
      } catch (e) {
        console.log(`   响应内容: ${result.body.substring(0, 80)}...`);
      }
    } else {
      console.log('❌ 健康检查失败');
      console.log(`   错误: ${result.error || `状态码: ${result.status}`}`);
    }
    
    return result.success;
  } catch (error) {
    console.log('❌ 健康检查异常:', error.message);
    return false;
  }
}

/**
 * 测试前端首页
 */
async function testFrontend() {
  console.log('\n🔍 测试前端首页...');
  
  try {
    const result = await makeRequest(CONFIG.FRONTEND_URL);
    
    if (result.success && result.status >= 200 && result.status < 400) {
      console.log('✅ 前端首页加载成功');
      console.log(`   状态码: ${result.status}`);
      console.log(`   内容长度: ${result.body.length} 字节`);
    } else {
      console.log('❌ 前端首页加载失败');
      console.log(`   错误: ${result.error || `状态码: ${result.status}`}`);
    }
    
    return result.success;
  } catch (error) {
    console.log('❌ 前端首页测试异常:', error.message);
    return false;
  }
}

/**
 * 运行测试
 */
async function runTests() {
  const tests = [
    { name: '健康检查', func: testHealth },
    { name: '前端首页', func: testFrontend }
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
      console.error(`❌ ${test.name} 测试异常:`, error.message);
      allPassed = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`最终结果: ${allPassed ? '✅ 全部通过' : '❌ 存在失败'}`);
  console.log('='.repeat(50));
  
  return allPassed;
}

// 执行测试
runTests().catch(error => {
  console.error('❌ 测试执行出错:', error.message);
  process.exit(1);
});