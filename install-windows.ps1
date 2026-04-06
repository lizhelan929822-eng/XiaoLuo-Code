# XiaoLuo Code Installation Script

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

# Complete
Write-Host "" -ForegroundColor Green
Write-Host "=== Installation Complete ===" -ForegroundColor Green
Write-Host "Use 'xiaoluo config' to set API Key" -ForegroundColor White
Write-Host "Use 'xiaoluo' to start chat mode" -ForegroundColor White
Write-Host "" -ForegroundColor Green
