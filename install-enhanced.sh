#!/bin/bash

# XiaoLuo Code 一键安装脚本 (macOS/Linux) - 增强版

set -e

echo "=== XiaoLuo Code 一键安装脚本 (增强版) ==="
echo ""
echo "本脚本将确保您能够直接运行 xiaoluo 命令"
echo ""

# 检查Node.js是否安装
echo "1. 检查Node.js安装情况..."
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装，请先安装 Node.js 18.0 或更高版本"
    echo "下载地址: https://nodejs.org/en/download/"
    exit 1
fi

node_version=$(node -v)
echo "Node.js 版本: $node_version"

# 检查Node.js版本
version_number=$(echo $node_version | sed 's/v//')
major_version=$(echo $version_number | cut -d. -f1)
if [ $major_version -lt 18 ]; then
    echo "错误: Node.js 版本过低，请安装 18.0 或更高版本"
    echo "当前版本: $node_version"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: npm 未安装"
    exit 1
fi

# 检查git是否安装
if ! command -v git &> /dev/null; then
    echo "错误: git 未安装，请先安装 git"
    exit 1
fi

# 克隆仓库
echo ""
echo "2. 克隆项目仓库..."

# 检查目录是否存在
if [ -d "XiaoLuo-Code" ]; then
    echo "警告: XiaoLuo-Code 目录已存在"
    echo "正在清理目录..."
    rm -rf XiaoLuo-Code
fi

git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
if [ $? -ne 0 ]; then
    echo "错误: 克隆仓库失败"
    exit 1
fi

# 进入项目目录
cd XiaoLuo-Code

# 安装依赖
echo ""
echo "3. 安装项目依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "错误: 安装依赖失败"
    exit 1
fi

# 构建项目
echo ""
echo "4. 构建项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "错误: 构建项目失败"
    exit 1
fi

# 全局安装
echo ""
echo "5. 全局安装..."
echo "注意: 可能需要输入密码以获取管理员权限"
sudo npm link
if [ $? -ne 0 ]; then
    echo "警告: 全局安装失败"
    echo "正在尝试修复权限问题..."
    
    # 修复权限
    sudo chown -R $(whoami) /usr/local/lib/node_modules || true
    sudo chown -R $(whoami) /usr/local/bin || true
    sudo chown -R $(whoami) /usr/local/share || true
    
    # 再次尝试
    echo "再次尝试全局安装..."
    npm link
    if [ $? -ne 0 ]; then
        echo "错误: 全局安装仍然失败"
        echo "您可以使用本地命令运行: npm start"
        exit 1
    fi
fi

# 验证安装
echo ""
echo "6. 验证安装..."
if command -v xiaoluo &> /dev/null; then
    echo "✅ 安装成功！xiaoluo 命令已可用"
    xiaoluo --version
else
    echo "❌ 安装失败: xiaoluo 命令不可用"
    echo "尝试添加 npm 全局目录到 PATH..."
    
    # 检查 npm 全局目录
    npm_global=$(npm config get prefix)/bin
    if [ -f "$npm_global/xiaoluo" ]; then
        echo "发现 xiaoluo 命令在: $npm_global"
        echo "请将以下行添加到您的 ~/.bashrc 或 ~/.zshrc 文件中:"
        echo "export PATH=\"$npm_global:$PATH\""
        echo "然后运行: source ~/.bashrc 或 source ~/.zshrc"
    else
        echo "未找到 xiaoluo 命令"
        echo "您可以使用本地命令运行: npm start"
    fi
    exit 1
fi

# 完成
echo ""
echo "=== 安装完成 ==="
echo ""
echo "🎉 恭喜！XiaoLuo Code 已成功安装"
echo ""
echo "现在您可以直接运行以下命令:"
echo "  1. 配置 API Key: xiaoluo config"
echo "  2. 启动聊天模式: xiaoluo chat"
echo "  3. 启动 REPL 模式: xiaoluo repl"
echo ""
echo "享受编码的乐趣！"
echo ""
