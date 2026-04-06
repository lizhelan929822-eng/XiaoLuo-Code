#!/bin/bash

# XiaoLuo Code 部署脚本
# 用于安装全局命令并优化部署

echo "XiaoLuo Code 部署脚本"
echo "======================"

# 检查Node.js版本
NODE_VERSION=$(node --version)
echo "当前Node.js版本: $NODE_VERSION"

# 安装全局命令
echo "\n安装全局命令..."
npm link

# 检查是否安装成功
if command -v xiaoluo &> /dev/null; then
    echo "全局命令安装成功！"
    echo "可以使用 'xiaoluo' 命令启动XiaoLuo Code"
else
    echo "全局命令安装失败，请检查权限或手动运行 'npm link'"
    exit 1
fi

# 创建Music文件夹
echo "\n创建Music文件夹..."
mkdir -p Music

echo "\n部署完成！"
echo "======================"
echo "使用方法:"
echo "  xiaoluo              - 启动交互式会话"
echo "  xiaoluo --help       - 查看帮助信息"
echo "  xiaoluo --version    - 查看版本信息"
echo "  xiaoluo Music       - 播放Music文件夹中的随机音频"
echo "\n请将音频文件放入 Music 文件夹中"
