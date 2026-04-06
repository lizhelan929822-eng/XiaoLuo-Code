#!/usr/bin/env powershell

<<<<<<< HEAD
# XiaoLuo Code Simple Installation Script (Windows)

Write-Host "=== XiaoLuo Code Installation Script (Windows) ===" -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "1. Checking Node.js..." -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js not found. Please install Node.js 18.0+ first." -ForegroundColor Red
    Write-Host "Download: https://nodejs.org/en/download/" -ForegroundColor Yellow
=======
# XiaoLuo Code 一键安装脚本 (Windows) - 简化版

Write-Host "=== XiaoLuo Code 一键安装脚本 ===" -ForegroundColor Green
Write-Host ""

# 检查Node.js是否安装
Write-Host "1. 检查Node.js安装情况..." -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "错误: Node.js 未安装，请先安装 Node.js 18.0 或更高版本" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/en/download/" -ForegroundColor Yellow
>>>>>>> trae/solo-agent-jSsOs4
    exit 1
}

$nodeVersion = node -v
<<<<<<< HEAD
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

# Check git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Git not found. Please install git first." -ForegroundColor Red
    exit 1
}

# Clone repository
Write-Host ""
Write-Host "2. Cloning repository..." -ForegroundColor Cyan
if (Test-Path "XiaoLuo-Code") {
    Write-Host "Removing existing XiaoLuo-Code directory..." -ForegroundColor Yellow
    Remove-Item -Path "XiaoLuo-Code" -Recurse -Force
}

git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to clone repository" -ForegroundColor Red
    exit 1
}

# Enter directory
Set-Location "XiaoLuo-Code"

# Install dependencies
Write-Host ""
Write-Host "3. Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Build project
Write-Host ""
Write-Host "4. Building project..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to build project" -ForegroundColor Red
    exit 1
}

# Global installation
Write-Host ""
Write-Host "5. Global installation..." -ForegroundColor Cyan

# Remove existing files
$npmGlobal = "C:\Users\$env:USERNAME\AppData\Roaming\npm"
$files = @(
    "$npmGlobal\xiaoluo.cmd",
    "$npmGlobal\xiaoluo.ps1",
    "$npmGlobal\node_modules\xiaoluo-code"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Removing $file..." -ForegroundColor Cyan
        Remove-Item -Path $file -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Try global install
npm link --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Global installation failed. Try running as administrator." -ForegroundColor Yellow
    Write-Host "You can still run XiaoLuo Code using: cd XiaoLuo-Code && npm start" -ForegroundColor White
} else {
    Write-Host "Global installation successful!" -ForegroundColor Green
}

# Complete
Write-Host ""
Write-Host "=== Installation Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Usage:"
Write-Host "  xiaoluo config     - Configure API Key"
Write-Host "  xiaoluo            - Start chat mode"
Write-Host "  xiaoluo repl       - Start REPL mode"
Write-Host ""
Write-Host "If global install failed:"
Write-Host "  cd XiaoLuo-Code"
Write-Host "  npm start"
Write-Host ""
Write-Host "Installation completed!" -ForegroundColor Green
=======
Write-Host "Node.js 版本: $nodeVersion" -ForegroundColor Green

# 检查npm是否安装
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "错误: npm 未安装" -ForegroundColor Red
    exit 1
}

# 检查git是否安装
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "错误: git 未安装，请先安装 git" -ForegroundColor Red
    exit 1
}

# 检查Node.js版本
$nodeVersion = node -v
$versionNumber = $nodeVersion -replace 'v', ''
$majorVersion = [int]($versionNumber -split '\.')[0]
if ($majorVersion -lt 18) {
    Write-Host "错误: Node.js 版本过低，请安装 18.0 或更高版本" -ForegroundColor Red
    Write-Host "当前版本: $nodeVersion" -ForegroundColor Yellow
    exit 1
}

# 克隆仓库
Write-Host ""
Write-Host "2. 克隆项目仓库..." -ForegroundColor Cyan
git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 克隆仓库失败" -ForegroundColor Red
    exit 1
}

# 进入项目目录
cd XiaoLuo-Code

# 安装依赖
Write-Host ""
Write-Host "3. 安装项目依赖..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 安装依赖失败" -ForegroundColor Red
    exit 1
}

# 构建项目
Write-Host ""
Write-Host "4. 构建项目..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 构建项目失败" -ForegroundColor Red
    exit 1
}

# 全局安装
Write-Host ""
Write-Host "5. 全局安装..." -ForegroundColor Cyan
npm link
if ($LASTEXITCODE -ne 0) {
    Write-Host "警告: 全局安装失败，可能需要管理员权限" -ForegroundColor Yellow
    Write-Host "请尝试以管理员身份运行此脚本" -ForegroundColor Yellow
}

# 完成
Write-Host ""
Write-Host "=== 安装完成 ===" -ForegroundColor Green
Write-Host ""
Write-Host "使用方法:"
Write-Host "  1. 配置 API Key: xiaoluo config"
Write-Host "  2. 启动聊天模式: xiaoluo chat"
Write-Host "  3. 启动 REPL 模式: xiaoluo repl"
Write-Host ""
Write-Host "如果全局安装失败，可以使用以下命令运行:"
Write-Host "  cd XiaoLuo-Code"
Write-Host "  npm start"
Write-Host ""
>>>>>>> trae/solo-agent-jSsOs4
