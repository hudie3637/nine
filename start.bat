@echo off
echo 正在清理缓存...
rmdir /s /q node_modules\.vite >nul 2>&1
rmdir /s /q .vite >nul 2>&1

echo 正在停止现有进程...
taskkill /f /im node.exe >nul 2>&1

echo 启动后端API服务器...
start "" cmd /c "npm run api"

timeout /t 5 /nobreak >nul

echo 启动前端开发服务器...
start "" cmd /c "npm run dev"

echo 项目启动完成！
echo 前端: http://localhost:3000
echo 后端: http://localhost:3001
pause