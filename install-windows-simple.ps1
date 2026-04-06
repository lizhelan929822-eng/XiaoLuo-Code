#!/usr/bin/env powershell

# XiaoLuo Code Simple Installation Script (Windows)

Write-Host "=== XiaoLuo Code Installation Script (Windows) ===" -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "1. Checking Node.js..." -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js not found. Please install Node.js 18.0+ first." -ForegroundColor Red
    Write-Host "Download: https://nodejs.org/en/download/" -ForegroundColor Yellow
    exit 1
}

$nodeVersion = node -v
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
