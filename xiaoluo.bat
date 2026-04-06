@echo off
REM XiaoLuo Code - 快速启动脚本
REM 双击此文件即可启动XiaoLuo Code

echo.
echo ========================================
echo   XiaoLuo Code - 命令行 AI 编程助手
echo ========================================
echo.

REM 检查是否在项目目录中
if exist "package.json" (
    echo 检测到项目目录，使用npm start启动...
    echo.
    npm start
) else (
    echo 尝试从全局安装启动...
    echo.
    
    REM 尝试直接使用node运行
    where node >nul 2>nul
    if %ERRORLEVEL% neq 0 (
        echo 错误: 未找到Node.js，请先安装Node.js
        echo.
        pause
        exit /b 1
    )
    
    REM 尝试从npm全局目录运行
    set "NPM_GLOBAL=%APPDATA%\npm"
    set "XIAOLUO_PATH=%NPM_GLOBAL%\node_modules\xiaoluo-code\dist\index.js"
    
    if exist "%XIAOLUO_PATH%" (
        echo 使用全局安装启动...
        echo.
        node "%XIAOLUO_PATH%"
    ) else (
        echo.
        echo 错误: 未找到XiaoLuo Code安装
        echo.
        echo 请先运行安装脚本或手动安装:
        echo 1. 克隆项目: git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
        echo 2. 进入目录: cd XiaoLuo-Code
        echo 3. 安装依赖: npm install
        echo 4. 构建项目: npm run build
        echo 5. 全局安装: npm link
        echo.
        pause
        exit /b 1
    )
)
