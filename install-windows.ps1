#!/usr/bin/env powershell

# XiaoLuo Code 一键安装脚本 (Windows)

Write-Host "=== XiaoLuo Code Installer ===" -ForegroundColor Green

# Check requirements
Write-Host "Checking requirements..." -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js not found. Install Node.js 18+ first." -ForegroundColor Red
    Write-Host "Download: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Git not found. Install git first." -ForegroundColor Red
    exit 1
}

# Clone repository
Write-Host "Cloning repository..." -ForegroundColor Cyan
if (Test-Path "XiaoLuo-Code") {
    Remove-Item "XiaoLuo-Code" -Recurse -Force
}
git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git

# Install
Set-Location "XiaoLuo-Code"
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "Building project..." -ForegroundColor Cyan
npm run build

# Global install
Write-Host "Installing globally..." -ForegroundColor Cyan
$npmPath = "C:\Users\$env:USERNAME\AppData\Roaming\npm"
$files = @(
    "$npmPath\xiaoluo.cmd",
    "$npmPath\xiaoluo.ps1",
    "$npmPath\node_modules\xiaoluo-code"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        Remove-Item $f -Recurse -Force -ErrorAction SilentlyContinue
    }
}

npm link --force

# 复制批处理文件到桌面
Write-Host "Creating desktop shortcut..." -ForegroundColor Cyan
try {
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $batchFile = "$PWD\xiaoluo.bat"
    
    if (Test-Path $batchFile) {
        Copy-Item -Path $batchFile -Destination "$desktopPath\xiaoluo.bat" -Force
        Write-Host "Desktop shortcut created: $desktopPath\xiaoluo.bat" -ForegroundColor Green
    } else {
        Write-Host "Warning: xiaoluo.bat not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Warning: Could not create desktop shortcut" -ForegroundColor Yellow
}

# 验证安装并刷新环境
Write-Host "Verifying installation..." -ForegroundColor Cyan
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# 尝试刷新文件关联
Write-Host "Refreshing file associations..." -ForegroundColor Cyan
try {
    $npmPath = "C:\Users\$env:USERNAME\AppData\Roaming\npm"
    $xiaoluoCmd = "$npmPath\xiaoluo.cmd"
    
    if (Test-Path $xiaoluoCmd) {
        Write-Host "xiaoluo.cmd found at: $xiaoluoCmd" -ForegroundColor Green
    } else {
        Write-Host "Warning: xiaoluo.cmd not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Warning: Could not verify file associations" -ForegroundColor Yellow
}

# Complete
Write-Host "" -ForegroundColor Green
Write-Host "=== Installation Complete ===" -ForegroundColor Green
Write-Host "" -ForegroundColor Cyan
Write-Host "Quick Start Methods:" -ForegroundColor Cyan
Write-Host "1. Double-click 'xiaoluo.bat' on your desktop" -ForegroundColor White
Write-Host "2. Or run in PowerShell: xiaoluo" -ForegroundColor White
Write-Host "3. Or navigate to XiaoLuo-Code and run: npm start" -ForegroundColor White
Write-Host "" -ForegroundColor Yellow
Write-Host "First time setup:" -ForegroundColor Yellow
Write-Host "Run 'xiaoluo config' to set your API Key" -ForegroundColor White
Write-Host "" -ForegroundColor Green
