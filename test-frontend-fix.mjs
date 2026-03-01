#!/usr/bin/env node

/**
 * 测试前端JSON解析修复
 * 验证safeJsonParse工具是否正常工作
 */

import { safeJsonParse } from './src/utils/jsonParser.js';

console.log('🧪 前端JSON解析修复测试\n');

// 测试用例
const testCases = [
  {
    name: '正常JSON',
    input: '{"success": true, "data": {"imageUrl": "test.jpg"}}',
    expected: true
  },
  {
    name: '不完整JSON',
    input: '{"success": true, "data": {"imageUrl": "test.jpg"',
    expected: true
  },
  {
    name: '空字符串',
    input: '',
    expected: false
  },
  {
    name: '无效JSON',
    input: 'invalid json content',
    expected: false
  }
];

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  console.log(`\n📝 测试 ${index + 1}: ${testCase.name}`);
  console.log('输入:', testCase.input.substring(0, 50) + (testCase.input.length > 50 ? '...' : ''));
  
  try {
    const result = safeJsonParse(testCase.input, { success: false, data: { imageUrl: '' } });
    const isSuccess = result.success === true;
    
    if (isSuccess === testCase.expected) {
      console.log('✅ 测试通过');
      passedTests++;
    } else {
      console.log('❌ 测试失败');
      console.log('  期望:', testCase.expected);
      console.log('  实际:', isSuccess);
    }
    
    console.log('  解析结果:', JSON.stringify(result));
  } catch (error) {
    console.log('❌ 测试异常:', error.message);
  }
});

console.log('\n' + '='.repeat(50));
console.log(`📊 测试结果: ${passedTests}/${totalTests} 通过`);

if (passedTests === totalTests) {
  console.log('🎉 所有测试通过！前端JSON解析修复生效');
} else {
  console.log('⚠️  部分测试失败，请检查实现');
}

console.log('\n📋 修复说明:');
console.log('- 在 src/App.tsx 中替换了不安全的 response.json() 调用');
console.log('- 使用 safeJsonParse 工具处理可能的JSON格式问题');
console.log('- 添加了自动修复和兜底机制');
console.log('- 修复了 callDoubaoAPI 和 callDoubaoImageAPI 两个函数');