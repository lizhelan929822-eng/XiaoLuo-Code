#!/usr/bin/env pwsh

# XiaoLuo Code 部署脚本 (Windows版本)
# 用于安装全局命令并优化部署

Write-Host "XiaoLuo Code 部署脚本" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green

# 检查Node.js版本
$NODE_VERSION = node --version
Write-Host "当前Node.js版本: $NODE_VERSION"

# 安装全局命令
Write-Host "\n安装全局命令..." -ForegroundColor Yellow
npm link

# 检查是否安装成功
$xiaoluoCommand = Get-Command xiaoluo -ErrorAction SilentlyContinue
if ($xiaoluoCommand) {
    Write-Host "全局命令安装成功！" -ForegroundColor Green
    Write-Host "可以使用 'xiaoluo' 命令启动XiaoLuo Code" -ForegroundColor Green
} else {
    Write-Host "全局命令安装失败，请检查权限或手动运行 'npm link'" -ForegroundColor Red
    exit 1
}

# 创建Music文件夹
Write-Host "\n创建Music文件夹..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "Music" -Force

Write-Host "\n部署完成！" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host "使用方法:" -ForegroundColor Cyan
Write-Host "  xiaoluo              - 启动交互式会话" -ForegroundColor Cyan
Write-Host "  xiaoluo --help       - 查看帮助信息" -ForegroundColor Cyan
Write-Host "  xiaoluo --version    - 查看版本信息" -ForegroundColor Cyan
Write-Host "  xiaoluo Music       - 播放Music文件夹中的随机音频" -ForegroundColor Cyan
Write-Host "\n请将音频文件放入 Music 文件夹中" -ForegroundColor Yellow
