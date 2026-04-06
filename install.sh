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

# 检查目录是否已存在
echo ""
echo "2. 检查项目目录..."
if [ -d "XiaoLuo-Code" ]; then
    echo "检测到 XiaoLuo-Code 目录已存在"
    echo "选择操作:"
    echo "1) 删除旧目录并重新安装"
    echo "2) 更新现有目录"
    echo "3) 取消安装"
    read -p "请选择 (1/2/3): " choice
    
    case $choice in
        1)
            echo "删除旧目录..."
            rm -rf XiaoLuo-Code
            if [ $? -ne 0 ]; then
                echo "错误: 删除旧目录失败"
                exit 1
            fi
            echo "克隆项目仓库..."
            git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
            if [ $? -ne 0 ]; then
                echo "错误: 克隆仓库失败"
                exit 1
            fi
            ;;
        2)
            echo "更新现有目录..."
            cd XiaoLuo-Code
            git fetch origin
            git reset --hard origin/main
            if [ $? -ne 0 ]; then
                echo "错误: 更新失败"
                exit 1
            fi
            cd ..
            ;;
        3)
            echo "安装已取消"
            exit 0
            ;;
        *)
            echo "无效选择，安装已取消"
            exit 1
            ;;
    esac
else
    echo "克隆项目仓库..."
    git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
    if [ $? -ne 0 ]; then
        echo "错误: 克隆仓库失败"
        exit 1
    fi
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

# 检测用户类型，处理权限问题
if [ "$EUID" -eq 0 ]; then
    # Root用户
    npm link
    if [ $? -ne 0 ]; then
        echo "错误: 全局安装失败"
        exit 1
    fi
else
    # 普通用户，配置用户级npm前缀
    echo "配置用户级npm安装..."
    npm config set prefix ~/.npm-global
    
    # 检查PATH是否已包含
    if ! grep -q '~/.npm-global/bin' ~/.bashrc 2>/dev/null && ! grep -q '~/.npm-global/bin' ~/.zshrc 2>/dev/null; then
        # 添加到PATH
        if [ -f ~/.zshrc ]; then
            echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
            echo "已添加到 ~/.zshrc，请运行 'source ~/.zshrc' 或重新打开终端"
        elif [ -f ~/.bashrc ]; then
            echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
            echo "已添加到 ~/.bashrc，请运行 'source ~/.bashrc' 或重新打开终端"
        else
            echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
            echo "已添加到 ~/.profile，请运行 'source ~/.profile' 或重新打开终端"
        fi
    fi
    
    npm link
    if [ $? -ne 0 ]; then
        echo "警告: 全局安装可能需要管理员权限"
        echo "或者尝试手动添加到PATH"
    fi
fi

# 完成
echo ""
echo "=== 安装完成 ==="
echo ""
echo "使用方法:"
echo "  1. 配置 API Key: xiaoluo config"
echo "  2. 启动聊天模式: xiaoluo chat"
echo "  3. 启动自主任务执行: xiaoluo repl"
echo "  4. 自动部署项目: xiaoluo deploy"
echo "  5. 启动Web界面: xiaoluo gateway"
echo ""
echo "如果提示找不到xiaoluo命令，请重新打开终端或运行:"
echo "  export PATH=~/.npm-global/bin:\$PATH"
echo ""
