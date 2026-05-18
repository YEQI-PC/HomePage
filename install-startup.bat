@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================================
REM HomePage 服务 - 注册自启动脚本
REM ============================================================

title HomePage Server - Install Startup...
color 0A

echo.
echo ============================================================
echo  HomePage 个人导航主页 - 注册自启动
echo ============================================================
echo.

REM 检查管理员权限
net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [错误] 需要管理员权限来注册启动项
    echo.
    echo 请以管理员身份运行此脚本
    echo.
    pause
    exit /b 1
)

REM 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM 检查 Node.js
where /q node
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [错误] 未找到 Node.js
    echo 请先安装 Node.js (v18+)
    echo.
    pause
    exit /b 1
)

echo [信息] 正在通过 server.js 注册自启动...
echo.

REM 调用 server.js 的启动安装命令
node server.js --install-startup

if %ERRORLEVEL% equ 0 (
    color 0B
    echo.
    echo [成功] 自启动注册成功！
    echo.
    echo HomePage 服务已注册为 Windows 启动项
    echo 计算机重启后将自动启动服务
    echo.
) else (
    color 0C
    echo.
    echo [错误] 自启动注册失败，退出码: %ERRORLEVEL%
    echo.
)

pause
exit /b %ERRORLEVEL%
