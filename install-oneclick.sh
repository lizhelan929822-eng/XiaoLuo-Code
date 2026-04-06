#!/bin/bash

# XiaoLuo Code 一键安装脚本 - 一行命令版

set -e

echo "=== XiaoLuo Code 一键安装脚本 ==="
echo ""
echo "正在安装 XiaoLuo Code..."
echo ""

# 检查Node.js是否安装
echo "1. 检查依赖..."
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装，请先安装 Node.js 18.0 或更高版本"
    echo "下载地址: https://nodejs.org/en/download/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "错误: npm 未安装"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "错误: git 未安装，请先安装 git"
    exit 1
fi

# 检查Node.js版本
node_version=$(node -v)
version_number=$(echo $node_version | sed 's/v//')
major_version=$(echo $version_number | cut -d. -f1)
if [ $major_version -lt 18 ]; then
    echo "错误: Node.js 版本过低，请安装 18.0 或更高版本"
    echo "当前版本: $node_version"
    exit 1
fi

echo "Node.js 版本: $node_version"
echo "npm 版本: $(npm -v)"
echo "git 版本: $(git --version)"

# 清理并克隆仓库
echo ""
echo "2. 克隆项目..."
if [ -d "XiaoLuo-Code" ]; then
    echo "清理已存在的目录..."
    rm -rf XiaoLuo-Code
fi

git clone --depth 1 https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
cd XiaoLuo-Code

# 安装依赖
echo ""
echo "3. 安装依赖..."
npm install --silent

# 构建项目
echo ""
echo "4. 构建项目..."
npm run build --silent

# 全局安装
echo ""
echo "5. 全局安装..."
echo "请输入密码以获取管理员权限..."
sudo npm link

# 修复权限
echo ""
echo "6. 修复权限..."
sudo chmod +x /usr/local/bin/xiaoluo
sudo chown -R $(whoami) /usr/local/lib/node_modules || true
sudo chown -R $(whoami) /usr/local/bin || true
sudo chown -R $(whoami) /usr/local/share || true

# 验证安装
echo ""
echo "7. 验证安装..."
if command -v xiaoluo &> /dev/null; then
    echo "✅ 安装成功！xiaoluo 命令已可用"
    echo ""
    echo "现在您可以运行以下命令:"
    echo "  xiaoluo config     - 配置 API Key"
    echo "  xiaoluo chat       - 启动聊天模式"
    echo "  xiaoluo repl       - 启动 REPL 模式"
    echo "  xiaoluo complete   - 代码补全"
    echo ""
    echo "享受编码的乐趣！"
else
    echo "❌ 安装失败: xiaoluo 命令不可用"
    echo ""
    echo "尝试手动修复:"
    echo "  sudo chmod +x /usr/local/bin/xiaoluo"
    echo "  xiaoluo --version"
    exit 1
fi
