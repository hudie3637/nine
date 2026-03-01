#!/usr/bin/env node
/**
 * AI API格式测试脚本 - 基于现有JSON错误处理器
 * 使用 json-parse-error-handler.ts 中的逻辑进行测试
 */

// 模拟JSON解析错误处理器的核心逻辑
class JsonParseErrorHandler {
  static analyzeError(error, rawInput) {
    const errorMessage = error.message.toLowerCase();
    const errorInfo = {
      errorCode: 'UNKNOWN_ERROR',
      errorMessage: error.message,
      rawInput: rawInput,
      cleanedInput: this.cleanInput(rawInput),
      suggestions: []
    };

    if (errorMessage.includes('unexpected end of json input')) {
      errorInfo.errorCode = 'INCOMPLETE_JSON';
      errorInfo.errorMessage = 'JSON输入不完整，缺少结束符号';
      errorInfo.suggestions = [
        '检查AI返回的数据是否被截断',
        '确认网络传输是否完整',
        '验证API响应是否超时'
      ];
    } else if (errorMessage.includes('unexpected token')) {
      errorInfo.errorCode = 'INVALID_TOKEN';
      errorInfo.errorMessage = 'JSON包含无效字符或语法错误';
      errorInfo.suggestions = [
        '检查特殊字符是否正确转义',
        '验证引号是否匹配',
        '确认JSON结构是否正确'
      ];
    }

    return errorInfo;
  }

  static cleanInput(input) {
    if (!input || typeof input !== 'string') return '';
    
    let cleaned = input.trim();
    
    // 移除代码块标记
    if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
    
    // 移除控制字符
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
    
    return cleaned.trim();
  }

  static attemptAutoRepair(input) {
    let cleaned = this.cleanInput(input);
    
    if (!cleaned) {
      return { success: false, result: '', method: 'EMPTY_INPUT' };
    }

    // 尝试自动补全结构
    if (cleaned.charAt(0) === '{' && cleaned.charAt(cleaned.length - 1) !== '}') {
      cleaned += '}';
      return { success: true, result: cleaned, method: 'OBJECT_COMPLETION' };
    }
    
    if (cleaned.charAt(0) === '[' && cleaned.charAt(cleaned.length - 1) !== ']') {
      cleaned += ']';
      return { success: true, result: cleaned, method: 'ARRAY_COMPLETION' };
    }

    // 尝试修复引号问题
    const quoteFix = cleaned
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'");
    
    if (quoteFix !== cleaned) {
      return { success: true, result: quoteFix, method: 'QUOTE_FIX' };
    }

    return { success: false, result: cleaned, method: 'NO_REPAIR_NEEDED' };
  }
}

// 模拟测试数据（您可以替换为实际的AI响应）
const testResponses = [
  // 测试用例1: 不完整的JSON（常见问题）
  '{"overallRating": 85, "summary": "分析完成", "points": [{"title": "整体格局", "fengShui": {"analysis": "好的布局", "elements": ["木", "火"], "remedy": "建议增加水元素"}, "science": {"analysis": "空间合理", "principles": ["人体工程学"], "optimization": ["改善采光"]}, "suggestions": [{"title": "优化建议1", "description": "增加绿植", "cost": "低"}]}', // 缺少结尾 }

  // 测试用例2: 中文引号问题
  '{"message": "测试数据", "value": "值"}', // 包含中文引号

  // 测试用例3: 正常JSON
  '{"overallRating": 90, "summary": "分析完成", "points": []}'
];

console.log('🔍 AI API响应格式测试开始...');
console.log('使用现有JSON错误处理器逻辑进行测试');
console.log('='.repeat(60));

testResponses.forEach((response, index) => {
  console.log(`\n🧪 测试用例 ${index + 1}:`);
  console.log('原始输入:', response.substring(0, 80) + (response.length > 80 ? '...' : ''));
  
  try {
    JSON.parse(response);
    console.log('✅ 解析成功');
  } catch (error) {
    console.log('❌ 解析失败，启动错误处理');
    
    // 分析错误
    const errorInfo = JsonParseErrorHandler.analyzeError(error, response);
    console.log('📊 错误分析:', errorInfo.errorCode, '-', errorInfo.errorMessage);
    
    // 尝试自动修复
    const repairResult = JsonParseErrorHandler.attemptAutoRepair(response);
    if (repairResult.success) {
      console.log(`🔧 自动修复成功 (${repairResult.method})`);
      try {
        const fixedResult = JSON.parse(repairResult.result);
        console.log('✅ 修复后解析成功');
      } catch (fixError) {
        console.log('❌ 修复后仍然失败:', fixError.message);
      }
    } else {
      console.log('🔧 无法自动修复');
    }
    
    // 显示建议
    console.log('\n💡 修复建议:');
    errorInfo.suggestions.forEach((suggestion, i) => {
      console.log(`${i + 1}. ${suggestion}`);
    });
  }
});

console.log('\n' + '='.repeat(60));
console.log('✅ 测试完成');
console.log('📋 结论:');
console.log('- AI API返回的JSON常见问题：不完整JSON、中文引号');
console.log('- 建议在 src/api/analyze.ts 中集成 JsonParseErrorHandler');
console.log('- 参考文件: /json-parse-error-handler.ts');
console.log('='.repeat(60));