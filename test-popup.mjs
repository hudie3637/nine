import fetch from 'node-fetch';

console.log('🔍 测试弹窗功能...');

// 测试非户型图上传
const testNonFloorPlan = async () => {
  console.log('\n🧪 测试非户型图上传...');
  
  // 使用1x1像素的透明PNG作为测试图片
  const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  try {
    const response = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: testImage,
        userId: 'popup-test-user',
        model: 'doubao-seed-2-0-mini-260215'
      })
    });
    
    const result = await response.json();
    console.log('状态码:', response.status);
    console.log('响应数据:', JSON.stringify(result, null, 2));
    
    if (response.status === 400) {
      console.log('✅ 后端正确返回400错误');
      console.log('✅ 错误信息:', result.message);
      console.log('✅ 置信度:', result.confidence);
    } else {
      console.log('❌ 后端未返回预期的400错误');
    }
    
  } catch (error) {
    console.error('❌ 测试请求失败:', error.message);
  }
};

// 运行测试
await testNonFloorPlan();