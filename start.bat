@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================================
REM HomePage 服务 - 启动脚本
REM ============================================================

title HomePage Server - Starting...
color 0A

echo.
echo ============================================================
echo  HomePage 个人导航主页 - 启动脚本
echo ============================================================
echo.

REM 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM 检查 Node.js 是否已安装
where /q node
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [错误] 未找到 Node.js
    echo.
    echo 请先安装 Node.js (v18+): https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM 显示 Node.js 版本
echo [信息] 已检测到 Node.js:
node --version
npm --version
echo.

REM 检查 package.json
if not exist "package.json" (
    color 0C
    echo [错误] 未找到 package.json 文件
    echo 请确保在项目根目录运行此脚本
    echo.
    pause
    exit /b 1
)

REM 检查依赖是否已安装
if not exist "node_modules" (
    echo [信息] 正在安装依赖...
    call npm install
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo [错误] 依赖安装失败
        echo.
        pause
        exit /b 1
    )
)

echo [信息] 正在启动 HomePage 服务...
echo.

REM 启动服务
node server.js

REM 如果服务异常退出
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [错误] 服务启动失败，退出码: %ERRORLEVEL%
    echo.
    pause
)

exit /b %ERRORLEVEL%
