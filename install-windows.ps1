#!/usr/bin/env powershell

# XiaoLuo Code 一键安装脚本 (Windows)

# 颜色定义
$GREEN = "Green"
$YELLOW = "Yellow"
$RED = "Red"
$CYAN = "Cyan"
$WHITE = "White"

Write-Host "=== XiaoLuo Code 一键安装脚本 ===" -ForegroundColor $GREEN
Write-Host ""

# 1. 检查环境
Write-Host "1. 检查环境依赖..." -ForegroundColor $CYAN

# 检查 Node.js
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "错误: Node.js 未安装，请先安装 Node.js 18.0 或更高版本" -ForegroundColor $RED
    Write-Host "下载地址: https://nodejs.org/en/download/" -ForegroundColor $YELLOW
    exit 1
}

$nodeVersion = node -v
Write-Host "Node.js 版本: $nodeVersion" -ForegroundColor $GREEN

# 检查 npm
if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "错误: npm 未安装" -ForegroundColor $RED
    exit 1
}

# 检查 git
if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
    Write-Host "错误: git 未安装，请先安装 git" -ForegroundColor $RED
    exit 1
}

# 检查 Node.js 版本
$versionNumber = $nodeVersion -replace 'v', ''
$majorVersion = [int]($versionNumber -split '\.')[0]
if ($majorVersion -lt 18) {
    Write-Host "错误: Node.js 版本过低，请安装 18.0 或更高版本" -ForegroundColor $RED
    Write-Host "当前版本: $nodeVersion" -ForegroundColor $YELLOW
    exit 1
}

# 2. 检查项目目录
Write-Host ""
Write-Host "2. 检查项目目录..." -ForegroundColor $CYAN

$InstallDir = "XiaoLuo-Code"
$RepoUrl = "https://github.com/lizhelan929822-eng/XiaoLuo-Code.git"

if (Test-Path $InstallDir) {
    Write-Host "检测到 $InstallDir 目录已存在" -ForegroundColor $YELLOW
    Write-Host "选择操作:" -ForegroundColor $CYAN
    Write-Host "1) 删除旧目录并重新安装"
    Write-Host "2) 更新现有目录"
    Write-Host "3) 取消安装"
    
    $choice = Read-Host "请选择 (1/2/3)"
    
    switch ($choice) {
        "1" {
            Write-Host "删除旧目录..." -ForegroundColor $CYAN
            try {
                Remove-Item -Path $InstallDir -Recurse -Force -ErrorAction Stop
            } catch {
                Write-Host "错误: 删除旧目录失败" -ForegroundColor $RED
                Write-Host "提示: 请检查目录权限" -ForegroundColor $YELLOW
                exit 1
            }
            Write-Host "克隆项目仓库..." -ForegroundColor $CYAN
            git clone $RepoUrl $InstallDir
            if ($LASTEXITCODE -ne 0) {
                Write-Host "错误: 克隆仓库失败" -ForegroundColor $RED
                Write-Host "提示: 请检查网络连接" -ForegroundColor $YELLOW
                exit 1
            }
        }
        "2" {
            Write-Host "更新现有目录..." -ForegroundColor $CYAN
            Set-Location $InstallDir
            git fetch origin
            if ($LASTEXITCODE -ne 0) {
                Write-Host "错误: 拉取代码失败" -ForegroundColor $RED
                Write-Host "提示: 请检查网络连接" -ForegroundColor $YELLOW
                exit 1
            }
            git reset --hard origin/main
            if ($LASTEXITCODE -ne 0) {
                Write-Host "错误: 更新失败" -ForegroundColor $RED
                exit 1
            }
            Set-Location ..
        }
        "3" {
            Write-Host "安装已取消" -ForegroundColor $YELLOW
            exit 0
        }
        default {
            Write-Host "无效选择，安装已取消" -ForegroundColor $RED
            exit 1
        }
    }
} else {
    Write-Host "克隆项目仓库..." -ForegroundColor $CYAN
    git clone $RepoUrl $InstallDir
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误: 克隆仓库失败" -ForegroundColor $RED
        Write-Host "提示: 请检查网络连接" -ForegroundColor $YELLOW
        exit 1
    }
}

# 3. 进入项目目录
Set-Location $InstallDir

# 4. 安装依赖
Write-Host ""
Write-Host "3. 安装项目依赖..." -ForegroundColor $CYAN

# 清除npm缓存，避免依赖冲突
npm cache clean --force | Out-Null

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 安装依赖失败" -ForegroundColor $RED
    Write-Host "提示: 请检查网络连接或尝试使用淘宝镜像" -ForegroundColor $YELLOW
    Write-Host "命令: npm config set registry https://registry.npmmirror.com" -ForegroundColor $YELLOW
    exit 1
}

# 5. 构建项目
Write-Host ""
Write-Host "4. 构建项目..." -ForegroundColor $CYAN

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 构建项目失败" -ForegroundColor $RED
    Write-Host "提示: 请确保Node.js版本≥18.0" -ForegroundColor $YELLOW
    exit 1
}

# 6. 全局安装
Write-Host ""
Write-Host "5. 全局安装..." -ForegroundColor $CYAN

# 检测是否为管理员
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($isAdmin) {
    npm link
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误: 全局安装失败" -ForegroundColor $RED
        exit 1
    }
} else {
    Write-Host "配置用户级npm安装..." -ForegroundColor $CYAN
    npm config set prefix "$env:USERPROFILE\.npm-global"
    
    # 检查PATH是否已包含
    $pathEntry = "$env:USERPROFILE\.npm-global\bin"
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    
    if ($currentPath -notlike "*$pathEntry*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$pathEntry", "User")
        Write-Host "已添加到用户PATH，请重新打开终端" -ForegroundColor $YELLOW
    }
    
    npm link
    if ($LASTEXITCODE -ne 0) {
        Write-Host "警告: 全局安装可能需要管理员权限" -ForegroundColor $YELLOW
        Write-Host "或者尝试手动添加到PATH" -ForegroundColor $YELLOW
    }
}

# 完成
Write-Host ""
Write-Host "=== 安装完成 ===" -ForegroundColor $GREEN
Write-Host ""
Write-Host "使用方法:" -ForegroundColor $CYAN
Write-Host "  1. 配置 API Key: xiaoluo config" -ForegroundColor $WHITE
Write-Host "  2. 启动聊天模式: xiaoluo chat" -ForegroundColor $WHITE
Write-Host "  3. 启动自主任务执行: xiaoluo repl" -ForegroundColor $WHITE
Write-Host "  4. 自动部署项目: xiaoluo deploy" -ForegroundColor $WHITE
Write-Host "  5. 启动Web界面: xiaoluo gateway" -ForegroundColor $WHITE
Write-Host ""
Write-Host "如果提示找不到xiaoluo命令，请重新打开终端" -ForegroundColor $YELLOW
Write-Host ""
Write-Host "享受编码的乐趣！🎉" -ForegroundColor $GREEN
