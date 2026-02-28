// JSON解析测试脚本

// 模拟有问题的JSON字符串（模拟实际场景）
const problematicJson = `{
  "overallRating": 78,
  "summary": "这是一个测试摘要，包含一些特殊字符如引号"和撇号'",
  "points": [
    {
      "title": "测试点1",
      "fengShui": {
        "analysis": "风水分析内容包含"未闭合的引号,
        "elements": ["木", "火", "土", "金", "水"],
        "remedy": "修复方案"
      },
      "science": {
        "analysis": "科学分析内容",
        "principles": ["原则1", "原则2"],
        "optimization": ["优化1", "优化2"]
      },
      "suggestions": [
        {
          "title": "建议标题",
          "description": "建议描述内容",
          "cost": "低成本"
        }
      ]
    }
  ],
  "conclusion": "结论内容包含特殊字符"
}`;

console.log('🧪 开始JSON解析测试...');
console.log('原始JSON长度:', problematicJson.length);

// 测试标准JSON.parse
try {
  const result1 = JSON.parse(problematicJson);
  console.log('✅ 标准JSON.parse成功');
  console.log('解析结果:', JSON.stringify(result1, null, 2));
} catch (error) {
  console.log('❌ 标准JSON.parse失败:', error.message);
  console.log('错误位置:', error.message);
}

// 测试修复函数
function repairJson(jsonString) {
  console.log('\n🔧 开始修复JSON...');
  
  let repaired = jsonString;
  
  // 1. 修复未闭合的字符串
  console.log('步骤1: 修复未闭合字符串');
  const quotePattern = /"([^"\\]*(?:\\.[^"\\]*)*)$/gm;
  repaired = repaired.replace(quotePattern, '"$1"');
  
  // 2. 平衡引号
  console.log('步骤2: 平衡引号');
  const doubleQuotes = (repaired.match(/"/g) || []).length;
  const singleQuotes = (repaired.match(/'/g) || []).length;
  
  if (doubleQuotes % 2 === 1) {
    repaired += '"';
    console.log('添加缺失的双引号');
  }
  if (singleQuotes % 2 === 1) {
    repaired += "'";
    console.log('添加缺失的单引号');
  }
  
  // 3. 修复属性名引号
  console.log('步骤3: 修复属性名引号');
  repaired = repaired.replace(/'([a-zA-Z_][a-zA-Z0-9_]*)'(\s*:)/g, '"$1"$2');
  repaired = repaired.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(\s*:\s*("|\{|\[|true|false|null|\d|-))/g, '"$1"$2');
  
  // 4. 清理格式
  console.log('步骤4: 清理格式问题');
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');
  repaired = repaired.replace(/([}\]])\s*,/g, '$1');
  
  // 5. 修复转义字符
  console.log('步骤5: 修复转义字符');
  repaired = repaired.replace(/\\([^"\\/bfnrtu])/g, '\\\\$1');
  
  console.log('修复后内容预览:');
  console.log(repaired.substring(0, 200) + '...');
  
  return repaired;
}

try {
  const repairedJson = repairJson(problematicJson);
  const result2 = JSON.parse(repairedJson);
  console.log('\n✅ 修复后JSON.parse成功');
  console.log('修复后结果:', JSON.stringify(result2, null, 2));
} catch (error) {
  console.log('\n❌ 修复后仍然失败:', error.message);
}

// 测试真实场景模拟
console.log('\n🌐 模拟真实API响应场景...');

const mockApiResponse = `{
  "overallRating": 82,
  "summary": "该户型整体布局合理，采光通风良好，符合现代居住需求。",
  "points": [
    {
      "title": "整体格局",
      "fengShui": {
        "analysis": "户型方正，坐北朝南，符合传统风水学的吉利朝向。九宫分布均衡，五行能量流转顺畅。",
        "elements": ["木", "火", "土", "金", "水"],
        "remedy": "建议保持空间整洁，避免在房屋中心堆积杂物。"
      },
      "science": {
        "analysis": "从现代建筑学角度看，实现了良好的功能分区，动静区域划分明确，空间利用率较高。",
        "principles": ["功能分区明确", "动静分离合理", "空间利用高效"],
        "optimization": ["优化各功能区比例", "提升空间通透性", "增强区域互动性"]
      },
      "suggestions": [
        {
          "title": "空间布局优化",
          "description": "调整家具摆放位置，避免遮挡主要通道，保持空间开阔感。",
          "cost": "低"
        }
      ]
    }
  ],
  "conclusion": "该户型具备良好的居住基础条件，在保持现有优势的同时，通过合理的软装搭配可以进一步提升居住品质。"
}`;

try {
  const cleanResponse = mockApiResponse
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
    
  const finalResult = JSON.parse(cleanResponse);
  console.log('✅ 真实场景模拟成功');
  console.log('最终评分:', finalResult.overallRating);
  console.log('分析点数量:', finalResult.points.length);
} catch (error) {
  console.log('❌ 真实场景模拟失败:', error.message);
}