#!/usr/bin/env powershell

# XiaoLuo Code 一键安装脚本 (Windows)

Write-Host "=== XiaoLuo Code 一键安装脚本 ===" -ForegroundColor Green
Write-Host ""

# 检查Node.js是否安装
Write-Host "1. 检查Node.js安装情况..." -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "错误: Node.js 未安装，请先安装 Node.js 18.0 或更高版本" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/en/download/" -ForegroundColor Yellow
    exit 1
}

$nodeVersion = node -v
Write-Host "Node.js 版本: $nodeVersion" -ForegroundColor Green

# 检查npm是否安装
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "错误: npm 未安装" -ForegroundColor Red
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
Write-Host "  npm start" -ForegroundColor Yellow
Write-Host ""
