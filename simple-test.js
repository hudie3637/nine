// 简单的API测试脚本
async function testAPI() {
  console.log('🧪 测试分析API...');
  
  try {
    // 测试健康检查
    const healthResponse = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: 'test-image-data',
        userId: 'test-user'
      })
    });
    
    console.log('API响应状态:', healthResponse.status);
    
    if (healthResponse.status === 400) {
      const errorData = await healthResponse.json();
      console.log('预期的错误响应:', errorData.error);
      console.log('✅ API基础功能正常');
    } else {
      const data = await healthResponse.json();
      console.log('API响应数据:', data);
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

// 运行基础测试
testAPI();

// 额外测试：模拟真实户型分析请求
async function testRealAnalysis() {
  console.log('\n🧪 测试真实户型分析请求...');
  
  try {
    // 创建一个简单的测试图片base64（1x1像素PNG）
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const analysisResponse = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: testImageBase64,
        userId: 'test-user-123',
        model: 'qwen-vl-plus'
      })
    });
    
    console.log('分析API响应状态:', analysisResponse.status);
    
    try {
      const analysisData = await analysisResponse.json();
      console.log('分析结果:', {
        success: analysisData.success,
        overallRating: analysisData.parsedResult?.overallRating,
        pointsCount: analysisData.parsedResult?.points?.length,
        hasImageUrl: !!analysisData.imageUrl
      });
      
      if (analysisData.success) {
        console.log('✅ 户型分析功能正常');
      }
    } catch (jsonError) {
      console.warn('⚠️ 分析响应不是JSON格式:', jsonError.message);
      try {
        const textContent = await analysisResponse.text();
        console.log('分析响应文本:', textContent.substring(0, 300) + '...');
      } catch (textError) {
        console.warn('⚠️ 无法读取分析响应:', textError.message);
      }
    }
    
  } catch (error) {
    console.error('真实分析测试失败:', error.message);
  }
}

// 运行真实分析测试
setTimeout(() => {
  testRealAnalysis();
}, 2000); // 等待服务器完全启动