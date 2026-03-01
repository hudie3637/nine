#!/usr/bin/env node
/**
 * ES模块兼容的测试脚本
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const https = require('https');

function testUrl(url, name) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Test-Script/1.0'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ ${name} - 状态码: ${res.statusCode}, 耗时: ${Date.now() - startTime}ms`);
        resolve({ success: true, status: res.statusCode, body: data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${name} - 错误: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`❌ ${name} - 超时`);
      resolve({ success: false, error: 'timeout' });
    });
  });
}

console.log('🚀 开始ES模块测试...');
console.log('Frontend: https://fengshui-frontend-ganp.onrender.com');
console.log('Backend: https://fengshui-backend-4i5o.onrender.com');

// 测试健康检查
testUrl('https://fengshui-backend-4i5o.onrender.com/api/health', '健康检查').then(() => {
  // 测试前端首页
  testUrl('https://fengshui-frontend-ganp.onrender.com/', '前端首页').then(() => {
    console.log('\n📊 测试完成');
  });
});