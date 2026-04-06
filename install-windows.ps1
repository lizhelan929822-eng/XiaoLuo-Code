<<<<<<< HEAD
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
=======
#!/usr/bin/env powershell

# XiaoLuo Code 一键安装脚本 (Windows) - 优化版

param(
    [switch]$Help,
    [string]$Version,
    [switch]$NoGlobal,
    [string]$Directory,
    [switch]$Uninstall,
    [switch]$Verbose
)

# 显示帮助信息
function Show-Help {
    Write-Host "XiaoLuo Code 安装脚本 (Windows)" -ForegroundColor Green
    Write-Host ""
    Write-Host "用法: .\install-windows.ps1 [参数]"
    Write-Host ""
    Write-Host "参数:"
    Write-Host "  --help              显示此帮助信息"
    Write-Host "  --version <版本>    指定安装版本"
    Write-Host "  --no-global         跳过全局安装"
    Write-Host "  --directory <路径>  指定安装目录"
    Write-Host "  --uninstall         卸载 XiaoLuo Code"
    Write-Host "  --verbose           显示详细日志"
    Write-Host ""
    Write-Host "示例:"
    Write-Host "  .\install-windows.ps1              # 默认安装"
    Write-Host "  .\install-windows.ps1 --no-global  # 不进行全局安装"
    Write-Host "  .\install-windows.ps1 --directory D:\XiaoLuo  # 指定安装目录"
    Write-Host "  .\install-windows.ps1 --uninstall  # 卸载"
    exit 0
}

# 检查参数
if ($Help) {
    Show-Help
}

# 设置变量
$RepoUrl = "https://github.com/lizhelan929822-eng/XiaoLuo-Code.git"
$DefaultInstallDir = "XiaoLuo-Code"
$InstallDir = if ($Directory) { $Directory } else { $DefaultInstallDir }
$LogFile = "$InstallDir\install.log"
$ErrorActionPreference = "Stop"

# 创建日志目录
if (!(Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

# 写入日志
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

# 检查命令是否存在
function Test-Command {
    param(
        [string]$Command
    )
    return Get-Command $Command -ErrorAction SilentlyContinue
}

# 检查并提升权限
function Test-Admin {
    $currentUser = New-Object Security.Principal.WindowsPrincipal $([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Request-Admin {
    Write-Log "需要管理员权限" "WARNING"
    Write-Host "正在请求管理员权限..." -ForegroundColor Yellow
    $scriptPath = $MyInvocation.ScriptName
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File $scriptPath $($args -join ' ')" -Verb RunAs
    exit 0
}

# 卸载函数
function Uninstall-XiaoLuo {
    Write-Log "开始卸载 XiaoLuo Code" "INFO"
    
    # 检查是否全局安装
    $globalInstall = npm list -g --depth=0 | Select-String "xiaoluo-code"
    if ($globalInstall) {
        Write-Log "检测到全局安装，正在卸载..." "INFO"
        npm uninstall -g xiaoluo-code
        if ($LASTEXITCODE -eq 0) {
            Write-Log "全局卸载成功" "INFO"
        } else {
            Write-Log "全局卸载失败" "ERROR"
        }
    }
    
    # 清理本地目录
    if (Test-Path $InstallDir) {
        Write-Log "清理本地安装目录..." "INFO"
        Remove-Item -Path $InstallDir -Recurse -Force
        if ($LASTEXITCODE -eq 0) {
            Write-Log "本地目录清理成功" "INFO"
        } else {
            Write-Log "本地目录清理失败" "ERROR"
        }
    }
    
    Write-Log "卸载完成" "INFO"
    Write-Host "XiaoLuo Code 已成功卸载" -ForegroundColor Green
    exit 0
}

# 主安装函数
function Install-XiaoLuo {
    Write-Host "=== XiaoLuo Code 一键安装脚本 (优化版) ===" -ForegroundColor Green
    Write-Host ""
    
    # 1. 检查环境
    Write-Log "检查环境依赖..." "INFO"
    Write-Host "1. 检查环境依赖..." -ForegroundColor Cyan
    
    # 检查 Node.js
    if (-not (Test-Command "node")) {
        Write-Log "Node.js 未安装" "ERROR"
        Write-Host "错误: Node.js 未安装，请先安装 Node.js 18.0 或更高版本" -ForegroundColor Red
        Write-Host "下载地址: https://nodejs.org/en/download/" -ForegroundColor Yellow
        exit 1
    }
    
    $nodeVersion = node -v
    Write-Log "Node.js 版本: $nodeVersion" "INFO"
    Write-Host "Node.js 版本: $nodeVersion" -ForegroundColor Green
    
    # 检查 npm
    if (-not (Test-Command "npm")) {
        Write-Log "npm 未安装" "ERROR"
        Write-Host "错误: npm 未安装" -ForegroundColor Red
        exit 1
    }
    
    # 检查 git
    if (-not (Test-Command "git")) {
        Write-Log "git 未安装" "ERROR"
        Write-Host "错误: git 未安装，请先安装 git" -ForegroundColor Red
        exit 1
    }
    
    # 检查 Node.js 版本
    $versionNumber = $nodeVersion -replace 'v', ''
    $majorVersion = [int]($versionNumber -split '\.')[0]
    if ($majorVersion -lt 18) {
        Write-Log "Node.js 版本过低: $nodeVersion" "ERROR"
        Write-Host "错误: Node.js 版本过低，请安装 18.0 或更高版本" -ForegroundColor Red
        Write-Host "当前版本: $nodeVersion" -ForegroundColor Yellow
        exit 1
    }
    
    # 2. 克隆仓库
    Write-Log "克隆项目仓库..." "INFO"
    Write-Host ""
    Write-Host "2. 克隆项目仓库..." -ForegroundColor Cyan
    
    if (Test-Path $InstallDir) {
        Write-Log "目录已存在，清理中..." "INFO"
        Remove-Item -Path $InstallDir -Recurse -Force
    }
    
    if ($Version) {
        Write-Log "克隆指定版本: $Version" "INFO"
        git clone --branch $Version $RepoUrl $InstallDir
    } else {
        Write-Log "克隆最新版本" "INFO"
        git clone $RepoUrl $InstallDir
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Log "克隆仓库失败" "ERROR"
        Write-Host "错误: 克隆仓库失败" -ForegroundColor Red
        exit 1
    }
    
    # 3. 进入项目目录
    Set-Location $InstallDir
    
    # 4. 安装依赖
    Write-Log "安装项目依赖..." "INFO"
    Write-Host ""
    Write-Host "3. 安装项目依赖..." -ForegroundColor Cyan
    
    # 清理 npm 缓存
    Write-Log "清理 npm 缓存..." "INFO"
    npm cache clean --force 2>$null
    
    # 安装依赖
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Log "安装依赖失败" "ERROR"
        Write-Host "错误: 安装依赖失败" -ForegroundColor Red
        Write-Host "请尝试手动运行: npm install" -ForegroundColor Yellow
        exit 1
    }
    
    # 5. 构建项目
    Write-Log "构建项目..." "INFO"
    Write-Host ""
    Write-Host "4. 构建项目..." -ForegroundColor Cyan
    
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Log "构建项目失败" "ERROR"
        Write-Host "错误: 构建项目失败" -ForegroundColor Red
        Write-Host "请检查 TypeScript 配置和依赖是否正确" -ForegroundColor Yellow
        exit 1
    }
    
    # 6. 全局安装
    if (-not $NoGlobal) {
        Write-Log "全局安装..." "INFO"
        Write-Host ""
        Write-Host "5. 全局安装..." -ForegroundColor Cyan
        
        # 检查管理员权限
        if (-not (Test-Admin)) {
            Write-Log "需要管理员权限进行全局安装" "WARNING"
            Request-Admin "--directory $InstallDir"
        }
        
        npm link
        if ($LASTEXITCODE -ne 0) {
            Write-Log "全局安装失败" "WARNING"
            Write-Host "警告: 全局安装失败，可能需要管理员权限" -ForegroundColor Yellow
            Write-Host "请尝试以管理员身份运行此脚本" -ForegroundColor Yellow
            Write-Host "或使用 --no-global 参数跳过全局安装" -ForegroundColor Yellow
        } else {
            Write-Log "全局安装成功" "INFO"
            Write-Host "全局安装成功" -ForegroundColor Green
        }
    }
    
    # 7. 完成
    Write-Log "安装完成" "INFO"
    Write-Host ""
    Write-Host "=== 安装完成 ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "使用方法:" -ForegroundColor Cyan
    
    if (-not $NoGlobal) {
        Write-Host "  1. 配置 API Key: xiaoluo config" -ForegroundColor White
        Write-Host "  2. 启动聊天模式: xiaoluo chat" -ForegroundColor White
        Write-Host "  3. 启动 REPL 模式: xiaoluo repl" -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host "如果全局安装失败，可以使用以下命令运行:" -ForegroundColor Yellow
    Write-Host "  cd $InstallDir" -ForegroundColor White
    Write-Host "  npm start" -ForegroundColor White
    Write-Host ""
    
    Write-Host "安装日志已保存到: $LogFile" -ForegroundColor Cyan
}

# 主逻辑
if ($Uninstall) {
    Uninstall-XiaoLuo
} else {
    Install-XiaoLuo
}
>>>>>>> trae/solo-agent-jSsOs4
