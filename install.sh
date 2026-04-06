#!/bin/bash

# XiaoLuo Code 一键安装脚本 (macOS/Linux)

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== XiaoLuo Code 一键安装脚本 ===${NC}"
echo ""

# 检查Node.js是否安装
echo -e "${CYAN}1. 检查Node.js安装情况...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装，请先安装 Node.js 18.0 或更高版本${NC}"
    echo -e "${YELLOW}下载地址: https://nodejs.org/en/download/${NC}"
    exit 1
fi

node_version=$(node -v)
echo -e "${GREEN}Node.js 版本: $node_version${NC}"

# 检查Node.js版本
version_number=$(echo $node_version | sed 's/v//')
major_version=$(echo $version_number | cut -d. -f1)
if [ $major_version -lt 18 ]; then
    echo -e "${RED}错误: Node.js 版本过低，请安装 18.0 或更高版本${NC}"
    echo -e "${YELLOW}当前版本: $node_version${NC}"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: npm 未安装${NC}"
    exit 1
fi

# 检查git是否安装
if ! command -v git &> /dev/null; then
    echo -e "${RED}错误: git 未安装，请先安装 git${NC}"
    exit 1
fi

# 检查目录是否已存在
echo ""
echo -e "${CYAN}2. 检查项目目录...${NC}"
if [ -d "XiaoLuo-Code" ]; then
    echo -e "${YELLOW}检测到 XiaoLuo-Code 目录已存在${NC}"
    echo -e "${CYAN}选择操作:${NC}"
    echo "1) 删除旧目录并重新安装"
    echo "2) 更新现有目录"
    echo "3) 取消安装"
    
    # 安全读取用户输入
    read -p "请选择 (1/2/3): " choice
    
    case $choice in
        1)
            echo -e "${CYAN}删除旧目录...${NC}"
            rm -rf XiaoLuo-Code
            if [ $? -ne 0 ]; then
                echo -e "${RED}错误: 删除旧目录失败${NC}"
                echo -e "${YELLOW}提示: 请检查目录权限${NC}"
                exit 1
            fi
            echo -e "${CYAN}克隆项目仓库...${NC}"
            git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
            if [ $? -ne 0 ]; then
                echo -e "${RED}错误: 克隆仓库失败${NC}"
                echo -e "${YELLOW}提示: 请检查网络连接${NC}"
                exit 1
            fi
            ;;
        2)
            echo -e "${CYAN}更新现有目录...${NC}"
            cd XiaoLuo-Code
            git fetch origin
            if [ $? -ne 0 ]; then
                echo -e "${RED}错误: 拉取代码失败${NC}"
                echo -e "${YELLOW}提示: 请检查网络连接${NC}"
                exit 1
            fi
            git reset --hard origin/main
            if [ $? -ne 0 ]; then
                echo -e "${RED}错误: 更新失败${NC}"
                exit 1
            fi
            cd ..
            ;;
        3)
            echo -e "${YELLOW}安装已取消${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}无效选择，安装已取消${NC}"
            exit 1
            ;;
    esac
else
    echo -e "${CYAN}克隆项目仓库...${NC}"
    git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
    if [ $? -ne 0 ]; then
        echo -e "${RED}错误: 克隆仓库失败${NC}"
        echo -e "${YELLOW}提示: 请检查网络连接${NC}"
        exit 1
    fi
fi

# 进入项目目录
cd XiaoLuo-Code

# 安装依赖
echo ""
echo -e "${CYAN}3. 安装项目依赖...${NC}"

# 清除npm缓存，避免依赖冲突
npm cache clean --force &> /dev/null

npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 安装依赖失败${NC}"
    echo -e "${YELLOW}提示: 请检查网络连接或尝试使用淘宝镜像${NC}"
    echo -e "${YELLOW}命令: npm config set registry https://registry.npmmirror.com${NC}"
    exit 1
fi

# 构建项目
echo ""
echo -e "${CYAN}4. 构建项目...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 构建项目失败${NC}"
    echo -e "${YELLOW}提示: 请确保Node.js版本≥18.0${NC}"
    exit 1
fi

# 全局安装
echo ""
echo -e "${CYAN}5. 全局安装...${NC}"

# 检测用户类型，处理权限问题
if [ "$EUID" -eq 0 ]; then
    # Root用户
    npm link
    if [ $? -ne 0 ]; then
        echo -e "${RED}错误: 全局安装失败${NC}"
        exit 1
    fi
else
    # 普通用户，配置用户级npm前缀
    echo -e "${YELLOW}配置用户级npm安装...${NC}"
    npm config set prefix ~/.npm-global
    
    # 检查PATH是否已包含
    if ! grep -q '~/.npm-global/bin' ~/.bashrc 2>/dev/null && ! grep -q '~/.npm-global/bin' ~/.zshrc 2>/dev/null; then
        # 添加到PATH
        if [ -f ~/.zshrc ]; then
            echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
            echo -e "${GREEN}已添加到 ~/.zshrc，请运行 'source ~/.zshrc' 或重新打开终端${NC}"
        elif [ -f ~/.bashrc ]; then
            echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
            echo -e "${GREEN}已添加到 ~/.bashrc，请运行 'source ~/.bashrc' 或重新打开终端${NC}"
        else
            echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
            echo -e "${GREEN}已添加到 ~/.profile，请运行 'source ~/.profile' 或重新打开终端${NC}"
        fi
    fi
    
    npm link
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}警告: 全局安装可能需要管理员权限${NC}"
        echo -e "${YELLOW}或者尝试手动添加到PATH${NC}"
    fi
fi

# 完成
echo ""
echo -e "${GREEN}=== 安装完成 ===${NC}"
echo ""
echo -e "${CYAN}使用方法:${NC}"
echo -e "  ${GREEN}1. 配置 API Key: ${NC}xiaoluo config"
echo -e "  ${GREEN}2. 启动聊天模式: ${NC}xiaoluo chat"
echo -e "  ${GREEN}3. 启动自主任务执行: ${NC}xiaoluo repl"
echo -e "  ${GREEN}4. 自动部署项目: ${NC}xiaoluo deploy"
echo -e "  ${GREEN}5. 启动Web界面: ${NC}xiaoluo gateway"
echo ""
echo -e "${YELLOW}如果提示找不到xiaoluo命令，请重新打开终端或运行:${NC}"
echo -e "  ${GREEN}export PATH=~/.npm-global/bin:\$PATH${NC}"
echo ""
echo -e "${GREEN}享受编码的乐趣！🎉${NC}"
