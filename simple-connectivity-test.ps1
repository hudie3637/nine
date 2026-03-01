# PowerShell 简单连通性测试脚本

Write-Host "🚀 开始生产环境连通性测试..."
Write-Host "Frontend: https://fengshui-frontend-ganp.onrender.com"
Write-Host "Backend: https://fengshui-backend-4i5o.onrender.com"
Write-Host ("=" * 50)

# 测试健康检查
Write-Host "`n🔍 测试健康检查端点..."
try {
    $healthResponse = Invoke-WebRequest -Uri "https://fengshui-backend-4i5o.onrender.com/api/health" -Method Get -TimeoutSec 10
    Write-Host "✅ 健康检查成功"
    Write-Host "   状态码: $($healthResponse.StatusCode)"
    Write-Host "   内容长度: $($healthResponse.Content.Length) 字节"
    
    # 尝试解析JSON
    try {
        $healthData = $healthResponse.Content | ConvertFrom-Json
        Write-Host "   服务信息: $($healthData.service)"
    } catch {
        Write-Host "   JSON解析失败，显示前100字符:"
        Write-Host $($healthResponse.Content.Substring(0, [Math]::Min(100, $healthResponse.Content.Length)))
    }
} catch {
    Write-Host "❌ 健康检查失败: $($_.Exception.Message)"
}

# 测试前端首页
Write-Host "`n🔍 测试前端首页..."
try {
    $frontResponse = Invoke-WebRequest -Uri "https://fengshui-frontend-ganp.onrender.com/" -Method Get -TimeoutSec 10
    Write-Host "✅ 前端首页加载成功"
    Write-Host "   状态码: $($frontResponse.StatusCode)"
    Write-Host "   内容长度: $($frontResponse.Content.Length) 字节"
} catch {
    Write-Host "❌ 前端首页加载失败: $($_.Exception.Message)"
}

Write-Host ("`n" + ("=" * 50))
Write-Host "📊 测试完成"
Write-Host "=" * 50