#!/usr/bin/env powershell

# XiaoLuo Code One-click Installation Script (Windows)

param(
    [switch]$Help,
    [string]$Version,
    [switch]$NoGlobal,
    [string]$Directory,
    [switch]$Uninstall
)

# Show help information
function Show-Help {
    Write-Host "XiaoLuo Code Installation Script (Windows)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\install-windows.ps1 [parameters]"
    Write-Host ""
    Write-Host "Parameters:"
    Write-Host "  --help              Show this help information"
    Write-Host "  --version version   Specify installation version"
    Write-Host "  --no-global         Skip global installation"
    Write-Host "  --directory path    Specify installation directory"
    Write-Host "  --uninstall         Uninstall XiaoLuo Code"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\install-windows.ps1              # Default installation"
    Write-Host "  .\install-windows.ps1 --no-global  # Skip global installation"
    Write-Host "  .\install-windows.ps1 --directory D:\XiaoLuo  # Specify directory"
    Write-Host "  .\install-windows.ps1 --uninstall  # Uninstall"
    exit 0
}

# Check parameters
if ($Help) {
    Show-Help
}

# Set variables
$RepoUrl = "https://github.com/lizhelan929822-eng/XiaoLuo-Code.git"
$DefaultInstallDir = "XiaoLuo-Code"
$InstallDir = if ($Directory) { $Directory } else { $DefaultInstallDir }
$ErrorActionPreference = "Stop"

# Check if command exists
function Test-Command {
    param(
        [string]$Command
    )
    return Get-Command $Command -ErrorAction SilentlyContinue
}

# Check admin privileges
function Test-Admin {
    $currentUser = New-Object Security.Principal.WindowsPrincipal $([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Request-Admin {
    Write-Host "Requesting admin privileges..." -ForegroundColor Yellow
    $scriptPath = $MyInvocation.ScriptName
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File $scriptPath $($args -join ' ')" -Verb RunAs
    exit 0
}

# Uninstall function
function Uninstall-XiaoLuo {
    Write-Host "Starting to uninstall XiaoLuo Code..." -ForegroundColor Cyan
    
    # Check if globally installed
    $globalInstall = npm list -g --depth=0 | Select-String "xiaoluo-code"
    if ($globalInstall) {
        Write-Host "Global installation detected, uninstalling..." -ForegroundColor Cyan
        npm uninstall -g xiaoluo-code
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Global uninstallation successful" -ForegroundColor Green
        } else {
            Write-Host "Global uninstallation failed" -ForegroundColor Red
        }
    }
    
    # Clean local directory
    if (Test-Path $InstallDir) {
        Write-Host "Cleaning local installation directory..." -ForegroundColor Cyan
        Remove-Item -Path $InstallDir -Recurse -Force
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Local directory cleaned successfully" -ForegroundColor Green
        } else {
            Write-Host "Local directory cleaning failed" -ForegroundColor Red
        }
    }
    
    Write-Host "Uninstallation completed" -ForegroundColor Green
    Write-Host "XiaoLuo Code has been successfully uninstalled" -ForegroundColor Green
    exit 0
}

# Main installation function
function Install-XiaoLuo {
    Write-Host "=== XiaoLuo Code One-click Installation Script (Windows) ===" -ForegroundColor Green
    Write-Host ""
    
    # 1. Check environment
    Write-Host "1. Checking environment dependencies..." -ForegroundColor Cyan
    
    # Check Node.js
    if (-not (Test-Command "node")) {
        Write-Host "Error: Node.js is not installed. Please install Node.js 18.0 or higher first." -ForegroundColor Red
        Write-Host "Download: https://nodejs.org/en/download/" -ForegroundColor Yellow
        exit 1
    }
    
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Check npm
    if (-not (Test-Command "npm")) {
        Write-Host "Error: npm is not installed" -ForegroundColor Red
        exit 1
    }
    
    # Check git
    if (-not (Test-Command "git")) {
        Write-Host "Error: git is not installed. Please install git first." -ForegroundColor Red
        exit 1
    }
    
    # Check Node.js version
    $versionNumber = $nodeVersion -replace 'v', ''
    $majorVersion = [int]($versionNumber -split '\.')[0]
    if ($majorVersion -lt 18) {
        Write-Host "Error: Node.js version is too low. Please install version 18.0 or higher." -ForegroundColor Red
        Write-Host "Current version: $nodeVersion" -ForegroundColor Yellow
        exit 1
    }
    
    # 2. Clone repository
    Write-Host ""
    Write-Host "2. Cloning project repository..." -ForegroundColor Cyan
    
    if (Test-Path $InstallDir) {
        Write-Host "Directory already exists, cleaning..." -ForegroundColor Yellow
        Remove-Item -Path $InstallDir -Recurse -Force
    }
    
    if ($Version) {
        Write-Host "Cloning specified version: $Version" -ForegroundColor Cyan
        git clone --branch $Version $RepoUrl $InstallDir
    } else {
        Write-Host "Cloning latest version" -ForegroundColor Cyan
        git clone $RepoUrl $InstallDir
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to clone repository" -ForegroundColor Red
        exit 1
    }
    
    # 3. Enter project directory
    Set-Location $InstallDir
    
    # 4. Install dependencies
    Write-Host ""
    Write-Host "3. Installing project dependencies..." -ForegroundColor Cyan
    
    # Clean npm cache (non-fatal)
    Write-Host "Cleaning npm cache..." -ForegroundColor Cyan
    try {
        npm cache clean --force 2>$null
    } catch {
        Write-Host "Warning: Failed to clean npm cache, continuing..." -ForegroundColor Yellow
    }
    
    # Install dependencies
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
            Write-Host "Please try running manually: npm install" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
        Write-Host "Please try running manually: npm install" -ForegroundColor Yellow
        exit 1
    }
    
    # 5. Build project
    Write-Host ""
    Write-Host "4. Building project..." -ForegroundColor Cyan
    
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to build project" -ForegroundColor Red
        Write-Host "Please check TypeScript configuration and dependencies" -ForegroundColor Yellow
        exit 1
    }
    
    # 6. Global installation
    if (-not $NoGlobal) {
        Write-Host ""
        Write-Host "5. Global installation..." -ForegroundColor Cyan
        
        # Check admin privileges
        if (-not (Test-Admin)) {
            Write-Host "Admin privileges required for global installation" -ForegroundColor Yellow
            Request-Admin "--directory $InstallDir"
        }
        
        npm link --force
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Warning: Global installation failed, may need admin privileges" -ForegroundColor Yellow
            Write-Host "Please try running this script as administrator" -ForegroundColor Yellow
            Write-Host "Or use --no-global parameter to skip global installation" -ForegroundColor Yellow
        } else {
            Write-Host "Global installation successful" -ForegroundColor Green
        }
    }
    
    # 7. Complete
    Write-Host ""
    Write-Host "=== Installation Completed ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Cyan
    
    if (-not $NoGlobal) {
        Write-Host "  1. Configure API Key: xiaoluo config" -ForegroundColor White
        Write-Host "  2. Start chat mode: xiaoluo" -ForegroundColor White
        Write-Host "  3. Start REPL mode: xiaoluo repl" -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host "If global installation failed, you can run using:" -ForegroundColor Yellow
    Write-Host "  cd $InstallDir" -ForegroundColor White
    Write-Host "  npm start" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Installation completed successfully!" -ForegroundColor Green
}

# Main logic
if ($Uninstall) {
    Uninstall-XiaoLuo
} else {
    Install-XiaoLuo
}
