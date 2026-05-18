@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================================
REM HomePage 服务 - 状态检查脚本
REM ============================================================

title HomePage Server - Status...
color 0A

echo.
echo ============================================================
echo  HomePage 个人导航主页 - 服务状态
echo ============================================================
echo.

REM 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM 检查 Node.js
where /q node
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [错误] 未找到 Node.js
    echo.
    pause
    exit /b 1
)

echo [信息] 正在检查 HomePage 服务状态...
echo.

REM 调用 server.js 的状态检查命令
node server.js --runtime-status

if %ERRORLEVEL% equ 0 (
    color 0B
    echo.
    echo [信息] 状态检查完成
    echo.
) else (
    echo.
    echo [信息] 状态检查结束（可能服务未运行）
    echo.
)

REM 额外：检查 Node.js 进程
echo ============================================================
echo  Node.js 进程信息
echo ============================================================
echo.

tasklist | find /i "node.exe" >nul
if %ERRORLEVEL% equ 0 (
    echo [正在运行] Node.js 进程:
    tasklist | find /i "node"
    echo.
) else (
    echo [未运行] 没有检测到 Node.js 进程
    echo.
)

pause
exit /b 0
