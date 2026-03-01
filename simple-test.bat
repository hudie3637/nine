@echo off
echo 🚀 开始简单连通性测试...
echo Frontend: https://fengshui-frontend-ganp.onrender.com
echo Backend: https://fengshui-backend-4i5o.onrender.com
echo ==============================================

echo.
echo 🔍 测试健康检查...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'https://fengshui-backend-4i5o.onrender.com/api/health' -Method Get -TimeoutSec 10; Write-Host '✅ 健康检查成功, 状态码: $($r.StatusCode)'; } catch { Write-Host '❌ 健康检查失败: $($_.Exception.Message)' }"

echo.
echo 🔍 测试前端首页...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'https://fengshui-frontend-ganp.onrender.com/' -Method Get -TimeoutSec 10; Write-Host '✅ 前端首页成功, 状态码: $($r.StatusCode)'; } catch { Write-Host '❌ 前端首页失败: $($_.Exception.Message)' }"

echo.
echo 📊 测试完成