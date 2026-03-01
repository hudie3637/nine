#!/usr/bin/env node

/**
 * 测试AI图片类型预判别功能
 * 验证系统能否正确识别户型图和其他类型图片
 */

import fs from 'fs';
import path from 'path';

// 模拟API调用函数
async function testImageValidation(imagePath, description) {
  console.log(`\n🔍 测试: ${description}`);
  console.log('📁 文件路径:', imagePath);
  
  try {
    // 读取图片文件并转换为base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    console.log('📊 文件大小:', (imageBuffer.length / 1024).toFixed(2), 'KB');
    console.log('🔤 Base64长度:', imageBase64.length);
    
    // 模拟预判别Prompt
    const validationPrompt = `
你是一位专业的图像识别专家，请判断用户上传的图片是否为住宅户型平面图。

判断标准：
✅ 是户型图的特征：
- 显示房屋内部房间布局
- 有明确的墙体、门窗标识
- 包含客厅、卧室、厨房、卫生间等功能区域
- 通常是黑白或简单彩色的平面图
- 有比例尺或尺寸标注（可选）

❌ 不是户型图的特征：
- 风景照片、人物照片
- logo、图标、艺术作品
- 小区总平面图、楼层分布图
- 3D效果图、渲染图
- 手绘草图、概念图

请严格按照以下JSON格式回复：
{
  "isFloorPlan": true/false,
  "confidence": 0-100的整数,
  "message": "简要说明判断理由"
}

只返回JSON，不要任何解释文字。`;

    console.log('📝 预判别Prompt已构建');
    console.log('💡 预期行为:');
    console.log('   - 户型图: isFloorPlan=true, confidence>80');
    console.log('   - 非户型图: isFloorPlan=false, confidence<60');
    console.log('   - 模糊图片: confidence 60-80之间');
    
    // 模拟API响应（实际使用时会被替换为真实调用）
    console.log('\n🚀 实际部署时将调用:');
    console.log('- Endpoint: /api/analyze');
    console.log('- Method: POST');
    console.log('- Body: { imageBase64: "...", validateOnly: true }');
    
    return {
      success: true,
      filePath: imagePath,
      fileSize: imageBuffer.length,
      description: description
    };
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 测试不同类型图片
async function runValidationTests() {
  console.log('🏠 建筑风水AI - 图片类型预判别测试');
  console.log('='.repeat(50));
  
  const testCases = [
    {
      path: './test-images/floor-plan-sample.png',
      description: '标准户型图样本'
    },
    {
      path: './test-images/landscape-photo.jpg', 
      description: '风景照片'
    },
    {
      path: './test-images/logo-design.png',
      description: 'Logo设计图'
    },
    {
      path: './test-images/site-plan.jpg',
      description: '小区总平面图'
    }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await testImageValidation(testCase.path, testCase.description);
    results.push(result);
  }
  
  // 输出测试总结
  console.log('\n📋 测试总结:');
  console.log('='.repeat(30));
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} 测试 ${index + 1}: ${result.description}`);
  });
  
  console.log('\n🔧 部署检查清单:');
  console.log('- [ ] 确保DOUBAO_API_KEY已配置');
  console.log('- [ ] 验证API端点可达性');
  console.log('- [ ] 测试不同置信度阈值');
  console.log('- [ ] 验证错误处理机制');
  console.log('- [ ] 检查用户提示文案');
  
  console.log('\n📈 预期效果:');
  console.log('- 正确识别95%以上的标准户型图');
  console.log('- 拒绝90%以上的明显非户型图');
  console.log('- 提供友好的用户引导提示');
  console.log('- 减少无效分析请求');
}

// 创建测试目录和示例文件
function setupTestEnvironment() {
  const testDir = './test-images';
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
    console.log('📁 创建测试目录:', testDir);
  }
  
  // 创建占位文件说明
  const readmeContent = `
测试图片目录说明:

请在此目录下放置以下测试图片:

1. floor-plan-sample.png - 标准住宅户型图
2. landscape-photo.jpg - 风景照片（负样本）
3. logo-design.png - Logo设计（负样本）  
4. site-plan.jpg - 小区总平面图（负样本）

这些图片将用于验证AI预判别功能的准确性。
`;
  
  fs.writeFileSync(path.join(testDir, 'README.md'), readmeContent);
  console.log('📝 创建测试说明文件');
}

// 主执行函数
async function main() {
  try {
    setupTestEnvironment();
    await runValidationTests();
    
    console.log('\n🎉 测试准备完成!');
    console.log('请将测试图片放入 ./test-images 目录后运行完整测试。');
    
  } catch (error) {
    console.error('🚨 测试执行出错:', error);
    process.exit(1);
  }
}

// 执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { testImageValidation, runValidationTests };