# XiaoLuo Code

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

XiaoLuo Code 是一个功能强大的命令行AI编程工具，核心功能基于 claude-code-sourcemap，为开发者提供智能代码辅助和聊天功能。

## ✨ 主要功能

- 🤖 **聊天模式**：与AI助手进行自然语言对话，获取编程帮助
- ✏️ **代码补全**：智能补全代码片段，提高编码效率
- 🔄 **交互式REPL**：实时与AI助手交互，快速解决编程问题
- 🚀 **自主任务执行**：AI自动执行编程任务，创建/删除文件、修改代码、自行测试修复错误
- 📦 **自动部署**：智能分析项目类型，自动修复错误直到部署成功
- 🌐 **Web对话界面**：基于claude-code-cli设计的现代化终端风格对话页面
- 🔧 **配置管理**：轻松管理API密钥和其他设置
- 📱 **多模型支持**：支持20+主流AI模型提供商，包括OpenAI、Anthropic、Google、Meta、Mistral、DeepSeek、智谱AI、月之暗面等

## 📋 系统要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- Git（用于克隆仓库）

## 🚀 安装方法

### Windows

#### 方法1：使用一键安装脚本（推荐）

```powershell
# 下载并运行安装脚本
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/lizhelan929822-eng/XiaoLuo-Code/main/install-windows.ps1" -OutFile "install-windows.ps1"

# 运行安装脚本
./install-windows.ps1
```

#### 方法2：手动安装

```powershell
# 克隆仓库
git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
cd XiaoLuo-Code

# 安装依赖
npm install

# 构建项目
npm run build

# 全局安装（可选）
npm link
```

### macOS / Linux

#### 方法1：使用安装脚本

```bash
# 下载并运行安装脚本
curl -O https://raw.githubusercontent.com/lizhelan929822-eng/XiaoLuo-Code/main/install.sh
chmod +x install.sh
./install.sh
```

#### 方法2：手动安装

```bash
# 克隆仓库
git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
cd XiaoLuo-Code

# 安装依赖
npm install

# 构建项目
npm run build

# 全局安装（可选）
npm link
```

## 🎯 使用方法

### 1. 配置 API Key

首次使用前，需要配置API密钥：

```bash
# 使用全局命令
xiaoluo config

# 或使用本地命令
npm start config
```

### 2. 启动聊天模式

```bash
# 使用全局命令
xiaoluo chat

# 或使用本地命令
npm start chat
```

### 3. 代码补全

```bash
# 使用全局命令
xiaoluo complete

# 或使用本地命令
npm start complete
```

### 4. 启动自主任务执行（REPL模式）

```bash
# 使用全局命令
xiaoluo repl

# 或使用本地命令
npm start repl
```

**特性：**
- AI会自动执行您交给的任务
- 可以创建多个文件/文件夹
- 询问用户同意后删除文件
- 修改代码、自行测试、修复错误

### 5. 自动部署项目

```bash
# 使用全局命令
xiaoluo deploy

# 或使用本地命令
npm start deploy

# 带部署提示
xiaoluo deploy -d "部署我的Node.js项目"
```

**特性：**
- 智能分析项目类型
- 自动执行部署命令
- 自动修复错误直到成功
- 部署后显示使用说明

### 6. 启动Web对话界面

```bash
# 使用全局命令
xiaoluo gateway

# 或使用本地命令
npm start gateway
```

然后在浏览器中访问 http://localhost:3888/chat

### 7. 停止服务

```bash
# 使用全局命令
xiaoluo stop

# 或使用本地命令
npm start stop
```

## 🔧 开发模式

对于开发者，可以使用开发模式运行：

```bash
npm run dev
```

这将使用 ts-node 直接运行 TypeScript 文件，无需先构建。

## 📦 打包为可执行文件

可以将项目打包为独立的可执行文件：

```bash
npm run pkg
```

生成的可执行文件将位于项目根目录。

## 🛠️ 项目结构

```
XiaoLuo-Code/
├── src/
│   ├── commands/          # 命令处理模块
│   │   ├── repl.ts     # 自主任务执行命令
│   │   ├── deploy.ts   # 自动部署命令
│   │   └── ...
│   ├── config/         # 配置管理
│   ├── gateway/        # 网关服务和Web界面
│   │   ├── server.ts  # Web服务器
│   │   └── pages/    # Web页面
│   ├── providers/      # AI提供商接口
│   │   ├── additional-providers.ts  # 额外的AI提供商
│   │   ├── other-providers.ts        # 其他AI提供商
│   │   └── index.ts                  # 提供商索引
│   ├── utils/         # 工具函数
│   └── index.ts      # 主入口
├── user/             # 用户数据
├── install-windows.ps1  # Windows安装脚本
├── install.sh         # macOS/Linux安装脚本
├── package.json       # 项目配置
├── tsconfig.json    # TypeScript配置
└── README.md        # 项目说明
```

## 🔍 故障排除

### 依赖安装失败

```bash
# 清除 npm 缓存
npm cache clean --force

# 重新安装依赖
npm install
```

### 构建失败

确保 Node.js 版本 >= 18.0，并且 TypeScript 已正确安装。

### 打包失败

如果 `npm run pkg` 失败，可能是因为 pkg 包的兼容性问题：

```bash
# 安装特定版本的 pkg
npm install pkg@5.8.1

# 重新打包
npm run pkg
```

### 全局安装失败

全局安装需要管理员/root权限：

- **Windows**：以管理员身份运行PowerShell
- **macOS/Linux**：使用 `sudo npm link`

### xiaoluo命令权限问题

如果遇到 `permission denied` 错误，安装脚本会自动处理权限问题。如仍有问题：

```bash
# 检查npm全局路径
npm config get prefix

# 配置用户级npm前缀
npm config set prefix ~/.npm-global

# 添加到PATH
export PATH=~/.npm-global/bin:$PATH
```

## 🤝 贡献指南

欢迎贡献代码！请按照以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues：[https://github.com/lizhelan929822-eng/XiaoLuo-Code/issues](https://github.com/lizhelan929822-eng/XiaoLuo-Code/issues)

---

**享受编码的乐趣！** 🎉
