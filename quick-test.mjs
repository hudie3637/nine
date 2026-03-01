import fetch from 'node-fetch';

// 测试非户型图（应该被预判别拒绝）
const testNonFloorPlan = async () => {
  console.log('🔍 测试非户型图预判别...');
  
  // 使用一个明显不是户型图的图片（这里是1x1像素的透明PNG）
  const nonFloorPlanImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  try {
    const response = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: nonFloorPlanImage,
        userId: 'test-user',
        userSessionId: 'test-session'
      })
    });
    
    const result = await response.json();
    console.log('状态码:', response.status);
    console.log('响应:', JSON.stringify(result, null, 2));
    
    if (response.status === 400 && result.error === '图片类型不匹配') {
      console.log('✅ 预判别功能正常工作！');
    } else {
      console.log('❌ 预判别功能未按预期工作');
    }
  } catch (error) {
    console.error('测试失败:', error.message);
  }
};

// 测试户型图（应该通过预判别）
const testValidFloorPlan = async () => {
  console.log('\n🔍 测试有效户型图...');
  
  // 使用一个假设是户型图的图片
  const floorPlanImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  try {
    const response = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: floorPlanImage,
        userId: 'test-user',
        userSessionId: 'test-session'
      })
    });
    
    const result = await response.json();
    console.log('状态码:', response.status);
    console.log('响应:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('测试失败:', error.message);
  }
};

// 运行测试
await testNonFloorPlan();
// await testValidFloorPlan(); // 可选：测试有效户型图