@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================================
REM HomePage 服务 - 停止脚本
REM ============================================================

title HomePage Server - Stopping...
color 0A

echo.
echo ============================================================
echo  HomePage 个人导航主页 - 停止服务
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

echo [信息] 正在停止 HomePage 服务...
echo.

REM 尝试通过 Node.js 停止（如果实现了）
node server.js --stop >nul 2>&1

REM 查找并杀死 node.exe 进程（如果上面的命令失败）
tasklist | find /i "node.exe" >nul
if %ERRORLEVEL% equ 0 (
    echo [信息] 正在终止 Node.js 进程...
    taskkill /f /im node.exe >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        color 0B
        echo [成功] HomePage 服务已停止
        echo.
    ) else (
        color 0C
        echo [错误] 无法停止服务
        echo.
    )
) else (
    color 0B
    echo [信息] HomePage 服务未在运行
    echo.
)

REM 检查是否还有 node.exe 进程
timeout /t 1 /nobreak >nul
tasklist | find /i "node.exe" >nul
if %ERRORLEVEL% neq 0 (
    color 0B
    echo [成功] 所有进程已清理
    echo.
)

pause
exit /b 0
