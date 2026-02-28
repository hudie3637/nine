import dotenv from 'dotenv';
import fs from 'fs';

// 加载环境变量
dotenv.config({ path: '.env.local' });

console.log('🧪 豆包API测试脚本');
console.log('====================');

// 检查环境变量
const apiKey = process.env.VITE_DOUBAO_API_KEY;
const model = process.env.VITE_DOUBAO_MODEL || 'doubao-seed-2-0-mini-260215';

console.log('🔑 API密钥配置:', apiKey ? '✅ 已配置' : '❌ 未配置');
console.log('🤖 模型配置:', model);
console.log('');

if (!apiKey) {
  console.error('❌ 请先在 .env.local 文件中配置 VITE_DOUBAO_API_KEY');
  process.exit(1);
}

// 测试用的简单prompt
const testPrompt = `
你是一位专业的户型分析专家，请用JSON格式回答以下问题：
{
  "overallRating": 85,
  "summary": "这是一个典型的三居室户型，布局合理。",
  "points": [
    {
      "title": "整体格局",
      "fengShui": {
        "analysis": "户型方正，南北通透，符合风水基本原则。",
        "elements": ["土", "金"],
        "remedy": "保持现有布局"
      },
      "science": {
        "analysis": "功能分区明确，动线流畅。",
        "principles": ["功能分区", "动线设计"],
        "optimization": ["保持现状"]
      },
      "suggestions": [
        {
          "title": "优化建议",
          "description": "建议保持现有布局，适当增加绿植装饰。",
          "cost": "低"
        }
      ]
    }
  ],
  "conclusion": "总体而言，这是一个设计良好的户型。"
}
`;

async function testDoubaoAPI() {
  try {
    console.log('🚀 开始测试豆包API...');
    
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: testPrompt
              }
            ]
          }
        ]
      })
    });

    console.log('📡 HTTP状态码:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API调用失败:', errorText);
      return false;
    }

    const data = await response.json();
    console.log('✅ API调用成功!');
    console.log('📋 响应数据结构:');
    console.log(JSON.stringify(Object.keys(data), null, 2));
    
    // 增强版响应格式检查 - 处理各种可能的响应格式
    let responseText = '';
    
    try {
      // 方式1: 新版数组格式（最常见）
      if (Array.isArray(data.output)) {
        // 查找type为message的对象
        const messageOutput = data.output.find(item => item.type === 'message');
        if (messageOutput?.content && Array.isArray(messageOutput.content)) {
          // 查找type为output_text的内容
          const textContent = messageOutput.content.find(item => item.type === 'output_text');
          if (textContent?.text && typeof textContent.text === 'string') {
            responseText = textContent.text;
          } else if (typeof messageOutput.content[0] === 'string') {
            responseText = messageOutput.content[0];
          } else if (messageOutput.content[0]?.text && typeof messageOutput.content[0].text === 'string') {
            responseText = messageOutput.content[0].text;
          }
        }
        
        // 如果还没找到，尝试从reasoning中提取
        if (!responseText) {
          const reasoningOutput = data.output.find(item => item.type === 'reasoning');
          if (reasoningOutput?.summary && Array.isArray(reasoningOutput.summary)) {
            const summaryText = reasoningOutput.summary.find(item => item.type === 'summary_text');
            if (summaryText?.text && typeof summaryText.text === 'string') {
              responseText = summaryText.text;
            }
          }
        }
      }
      
      // 方式2: 旧版格式兼容
      if (!responseText && data.output?.choices?.[0]?.message?.content) {
        const content = data.output.choices[0].message.content;
        if (Array.isArray(content)) {
          responseText = content.map(item => {
            if (typeof item === 'string') {
              return item;
            } else if (item?.text) {
              return item.text;
            }
            return '';
          }).join('');
        } else if (typeof content === 'string') {
          responseText = content;
        }
      }
      
      // 方式3: 直接检查data.text字段
      if (!responseText && typeof data.text === 'string') {
        responseText = data.text;
      }
      
      // 清理响应文本
      if (responseText) {
        // 移除代码块标记
        responseText = responseText
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .replace(/^\s+|\s+$/g, '');
        
        // 尝试提取JSON内容
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          responseText = jsonMatch[0];
        }
      }
      
      console.log('📄 响应文本长度:', responseText.length);
      console.log('🔍 响应文本预览:', responseText.substring(0, 200) + '...');
      
      // 尝试解析JSON
      if (responseText) {
        try {
          const jsonData = JSON.parse(responseText);
          console.log('✅ JSON解析成功!');
          console.log('📊 解析后的数据结构:');
          console.log('- overallRating:', jsonData.overallRating);
          console.log('- points数量:', jsonData.points?.length || 0);
          console.log('- summary长度:', jsonData.summary?.length || 0);
          return true;
        } catch (parseError) {
          console.warn('⚠️ JSON解析失败:', parseError.message);
          console.warn('原始响应文本:', responseText.substring(0, 300) + '...');
          return false;
        }
      } else {
        console.warn('⚠️ 响应文本为空');
        return false;
      }
    } catch (extractError) {
      console.warn('⚠️ 响应提取失败:', extractError.message);
      console.log('📋 完整响应:', JSON.stringify(data, null, 2));
      return false;
    }

  } catch (error) {
    console.error('💥 测试过程中发生错误:', error.message);
    return false;
  }
}

// 运行测试
testDoubaoAPI().then(success => {
  console.log('');
  console.log('====================');
  if (success) {
    console.log('🎉 豆包API测试通过！');
    console.log('✅ 可以正常使用豆包模型进行分析');
  } else {
    console.log('❌ 豆包API测试失败');
    console.log('🔧 请检查API密钥和网络连接');
  }
  process.exit(success ? 0 : 1);
});