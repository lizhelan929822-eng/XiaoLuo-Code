#!/bin/bash

# XiaoLuo Code 一键安装脚本 (macOS/Linux)

echo "=== XiaoLuo Code 一键安装脚本 ==="
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
npm link
if [ $? -ne 0 ]; then
    echo "警告: 全局安装失败，可能需要管理员权限"
    echo "请尝试使用 sudo 运行此脚本"
fi

# 完成
echo ""
echo "=== 安装完成 ==="
echo ""
echo "使用方法:"
echo "  1. 配置 API Key: xiaoluo config"
echo "  2. 启动聊天模式: xiaoluo chat"
echo "  3. 启动 REPL 模式: xiaoluo repl"
echo ""
echo "如果全局安装失败，可以使用以下命令运行:"
echo "  npm start"
echo ""
