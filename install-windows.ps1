#!/usr/bin/env powershell

# XiaoLuo Code One-click Installation Script (Windows)

param(
    [switch]$Help,
    [string]$Version,
    [switch]$NoGlobal,
    [string]$Directory,
    [switch]$Uninstall,
    [switch]$Verbose
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
    Write-Host "  --verbose           Show detailed logs"
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
$LogFile = "$InstallDir\install.log"
$ErrorActionPreference = "Stop"

# Create log directory
if (!(Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

# Ensure log directory exists
$LogDir = Split-Path $LogFile -Parent
if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# Write log
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $LogEntry
    if ($Verbose -or $Level -eq "ERROR" -or $Level -eq "WARNING") {
        if ($Level -eq "ERROR") {
            Write-Host $LogEntry -ForegroundColor Red
        } elseif ($Level -eq "WARNING") {
            Write-Host $LogEntry -ForegroundColor Yellow
        } else {
            Write-Host $LogEntry -ForegroundColor Cyan
        }
    }
}

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
    Write-Log "Admin privileges required" "WARNING"
    Write-Host "Requesting admin privileges..." -ForegroundColor Yellow
    $scriptPath = $MyInvocation.ScriptName
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File $scriptPath $($args -join ' ')" -Verb RunAs
    exit 0
}

# Uninstall function
function Uninstall-XiaoLuo {
    Write-Log "Starting to uninstall XiaoLuo Code" "INFO"
    
    # Check if globally installed
    $globalInstall = npm list -g --depth=0 | Select-String "xiaoluo-code"
    if ($globalInstall) {
        Write-Log "Global installation detected, uninstalling..." "INFO"
        npm uninstall -g xiaoluo-code
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Global uninstallation successful" "INFO"
        } else {
            Write-Log "Global uninstallation failed" "ERROR"
        }
    }
    
    # Clean local directory
    if (Test-Path $InstallDir) {
        Write-Log "Cleaning local installation directory..." "INFO"
        Remove-Item -Path $InstallDir -Recurse -Force
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Local directory cleaned successfully" "INFO"
        } else {
            Write-Log "Local directory cleaning failed" "ERROR"
        }
    }
    
    Write-Log "Uninstallation completed" "INFO"
    Write-Host "XiaoLuo Code has been successfully uninstalled" -ForegroundColor Green
    exit 0
}

# Main installation function
function Install-XiaoLuo {
    Write-Host "=== XiaoLuo Code One-click Installation Script (Windows) ===" -ForegroundColor Green
    Write-Host ""
    
    # 1. Check environment
    Write-Log "Checking environment dependencies..." "INFO"
    Write-Host "1. Checking environment dependencies..." -ForegroundColor Cyan
    
    # Check Node.js
    if (-not (Test-Command "node")) {
        Write-Log "Node.js not installed" "ERROR"
        Write-Host "Error: Node.js is not installed. Please install Node.js 18.0 or higher first." -ForegroundColor Red
        Write-Host "Download: https://nodejs.org/en/download/" -ForegroundColor Yellow
        exit 1
    }
    
    $nodeVersion = node -v
    Write-Log "Node.js version: $nodeVersion" "INFO"
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Check npm
    if (-not (Test-Command "npm")) {
        Write-Log "npm not installed" "ERROR"
        Write-Host "Error: npm is not installed" -ForegroundColor Red
        exit 1
    }
    
    # Check git
    if (-not (Test-Command "git")) {
        Write-Log "git not installed" "ERROR"
        Write-Host "Error: git is not installed. Please install git first." -ForegroundColor Red
        exit 1
    }
    
    # Check Node.js version
    $versionNumber = $nodeVersion -replace 'v', ''
    $majorVersion = [int]($versionNumber -split '\.')[0]
    if ($majorVersion -lt 18) {
        Write-Log "Node.js version too low: $nodeVersion" "ERROR"
        Write-Host "Error: Node.js version is too low. Please install version 18.0 or higher." -ForegroundColor Red
        Write-Host "Current version: $nodeVersion" -ForegroundColor Yellow
        exit 1
    }
    
    # 2. Clone repository
    Write-Log "Cloning project repository..." "INFO"
    Write-Host ""
    Write-Host "2. Cloning project repository..." -ForegroundColor Cyan
    
    if (Test-Path $InstallDir) {
        Write-Log "Directory already exists, cleaning..." "INFO"
        Remove-Item -Path $InstallDir -Recurse -Force
    }
    
    if ($Version) {
        Write-Log "Cloning specified version: $Version" "INFO"
        git clone --branch $Version $RepoUrl $InstallDir
    } else {
        Write-Log "Cloning latest version" "INFO"
        git clone $RepoUrl $InstallDir
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Repository cloning failed" "ERROR"
        Write-Host "Error: Failed to clone repository" -ForegroundColor Red
        exit 1
    }
    
    # 3. Enter project directory
    Set-Location $InstallDir
    
    # 4. Install dependencies
    Write-Log "Installing project dependencies..." "INFO"
    Write-Host ""
    Write-Host "3. Installing project dependencies..." -ForegroundColor Cyan
    
    # Clean npm cache
    Write-Log "Cleaning npm cache..." "INFO"
    npm cache clean --force 2>$null
    
    # Install dependencies
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Dependency installation failed" "ERROR"
        Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
        Write-Host "Please try running manually: npm install" -ForegroundColor Yellow
        exit 1
    }
    
    # 5. Build project
    Write-Log "Building project..." "INFO"
    Write-Host ""
    Write-Host "4. Building project..." -ForegroundColor Cyan
    
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Project build failed" "ERROR"
        Write-Host "Error: Failed to build project" -ForegroundColor Red
        Write-Host "Please check TypeScript configuration and dependencies" -ForegroundColor Yellow
        exit 1
    }
    
    # 6. Global installation
    if (-not $NoGlobal) {
        Write-Log "Global installation..." "INFO"
        Write-Host ""
        Write-Host "5. Global installation..." -ForegroundColor Cyan
        
        # Check admin privileges
        if (-not (Test-Admin)) {
            Write-Log "Admin privileges required for global installation" "WARNING"
            Request-Admin "--directory $InstallDir"
        }
        
        npm link
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Global installation failed" "WARNING"
            Write-Host "Warning: Global installation failed, may need admin privileges" -ForegroundColor Yellow
            Write-Host "Please try running this script as administrator" -ForegroundColor Yellow
            Write-Host "Or use --no-global parameter to skip global installation" -ForegroundColor Yellow
        } else {
            Write-Log "Global installation successful" "INFO"
            Write-Host "Global installation successful" -ForegroundColor Green
        }
    }
    
    # 7. Complete
    Write-Log "Installation completed" "INFO"
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
    
    Write-Host "Installation log saved to: $LogFile" -ForegroundColor Cyan
}

# Main logic
if ($Uninstall) {
    Uninstall-XiaoLuo
} else {
    Install-XiaoLuo
}
