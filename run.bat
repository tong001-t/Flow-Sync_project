@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ================================
echo   FlowSync 前端启动
echo ================================
echo.
call npm run serve
pause
