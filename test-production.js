#!/usr/bin/env node
/**
 * 兼容ES模块的生产环境测试脚本
 */

// 使用ES模块语法
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

// 配置
const CONFIG = {
  FRONTEND_URL: 'https://fengshui-frontend-ganp.onrender.com',
  BACKEND_URL: 'https://fengshui-backend-4i5o.onrender.com',
  TIMEOUT_MS: 10000
};

console.log('🚀 开始生产环境测试...');
console.log(`Frontend: ${CONFIG.FRONTEND_URL}`);
console.log(`Backend: ${CONFIG.BACKEND_URL}`);
console.log('='.repeat(50));

/**
 * 发送HTTPS请求
 */
async function makeRequest(url, options = {}) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const request = https.get(url, {
      timeout: CONFIG.TIMEOUT_MS,
      headers: {
        'User-Agent': 'Test-Script/1.0',
        'Accept': 'application/json'
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
 * 运行测试
 */
async function runTests() {
  console.log('🧪 执行测试...');
  
  try {
    const healthResult = await testHealth();
    
    console.log('\n' + '='.repeat(50));
    console.log(`最终结果: ${healthResult ? '✅ 成功' : '❌ 失败'}`);
    console.log('='.repeat(50));
    
    return healthResult;
  } catch (error) {
    console.error('❌ 测试执行出错:', error.message);
    return false;
  }
}

// 执行测试
runTests().catch(error => {
  console.error('❌ 主测试异常:', error.message);
  process.exit(1);
});