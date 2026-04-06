# XiaoLuo Code

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version: 1.1.1](https://img.shields.io/badge/Version-1.1.1-blue.svg)](https://github.com/lizhelan929822-eng/XiaoLuo-Code)

XiaoLuo Code 是一个功能强大的命令行AI编程工具，为开发者提供智能代码辅助和聊天功能。

## ✨ 主要功能

- 🤖 **聊天模式**：与AI助手进行自然语言对话，获取编程帮助
- ✏️ **代码补全**：智能补全代码片段，提高编码效率
- 🔄 **交互式REPL**：实时与AI助手交互，快速解决编程问题
- 📁 **文件拖放**：支持Windows和macOS系统的文件拖放功能，方便快速导入文件内容
- 🚀 **自动部署**：一键自动部署项目，智能修复错误直到成功
- 🔧 **配置管理**：轻松管理API密钥和其他设置
- 📱 **多模型支持**：支持20+主流AI模型提供商，包括OpenAI、Anthropic、Google、Meta、Mistral等

## 📋 系统要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- Git（用于克隆仓库）

## 🚀 安装方法

### 一行命令安装（推荐）

#### Windows (PowerShell)
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/lizhelan929822-eng/XiaoLuo-Code/main/install-windows.ps1" -OutFile "install-windows.ps1"; .\install-windows.ps1
```

#### macOS / Linux (bash)
```bash
curl -O https://raw.githubusercontent.com/lizhelan929822-eng/XiaoLuo-Code/main/install.sh && chmod +x install.sh && ./install.sh
```

### 手动安装

#### Windows

```powershell
# 克隆仓库
git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
cd XiaoLuo-Code

# 安装依赖
npm install

# 构建项目
npm run build

# 全局安装
npm link
```

#### macOS / Linux

```bash
# 克隆仓库
git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
cd XiaoLuo-Code

# 安装依赖
npm install

# 构建项目
npm run build

# 全局安装
npm link
```

## 🎯 使用方法

### 1. 配置 API Key

首次使用前，需要配置API密钥：

```bash
xiaoluo config
```

### 2. 启动代码编辑模式（默认）

```bash
# 直接启动 REPL 模式（推荐）
xiaoluo
```

### 3. 聊天模式

```bash
xiaoluo chat
```

### 4. 代码补全

```bash
xiaoluo complete "你的代码提示"
```

### 5. 自动部署项目

```bash
# 在当前目录部署
xiaoluo deploy

# 指定项目路径部署
xiaoluo deploy -p /path/to/your/project

# 直接指定部署需求
xiaoluo deploy -d "部署这个Node.js项目"
```

### 6. 停止服务

```bash
xiaoluo stop
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
│   │   ├── chat.ts        # 聊天命令
│   │   ├── complete.ts    # 代码补全命令
│   │   ├── config.ts      # 配置命令
│   │   ├── deploy.ts      # 自动部署命令
│   │   ├── repl.ts        # 交互式REPL命令
│   │   └── stop.ts        # 停止命令
│   ├── config/            # 配置管理
│   ├── gateway/           # 网关服务
│   ├── providers/         # AI提供商接口
│   ├── utils/             # 工具函数
│   └── index.ts           # 主入口
├── user/                  # 用户数据
├── install-windows.ps1    # Windows安装脚本
├── install.sh             # macOS/Linux安装脚本
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript配置
└── README.md              # 项目说明
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
