# XiaoLuo Code

<div align="center">
  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20AI%20code%20assistant%20logo%20with%20terminal%20icon%20and%20blue%20color%20scheme&image_size=square_hd" alt="XiaoLuo Code Logo" width="200" height="200">
  
  <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
    </a>
    <a href="https://github.com/lizhelan929822-eng/XiaoLuo-Code">
      <img src="https://img.shields.io/github/stars/lizhelan929822-eng/XiaoLuo-Code?style=social" alt="GitHub stars">
    </a>
    <a href="https://github.com/lizhelan929822-eng/XiaoLuo-Code/issues">
      <img src="https://img.shields.io/github/issues/lizhelan929822-eng/XiaoLuo-Code" alt="GitHub issues">
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/badge/Node.js-18.0%2B-brightgreen" alt="Node.js 18.0+">
    </a>
    <a href="https://github.com/lizhelan929822-eng/XiaoLuo-Code/releases">
      <img src="https://img.shields.io/github/v/release/lizhelan929822-eng/XiaoLuo-Code" alt="Version">
    </a>
  </div>
</div>

## 🎯 项目介绍

XiaoLuo Code 是一个功能强大的命令行AI编程工具，核心功能基于 claude-code-sourcemap，为开发者提供智能代码辅助和聊天功能。

### 🚀 版本 2.0.0 新特性
- **网关配置**：运行 `xiaoluo config` 或首次运行时自动打开配置网页
- **预设模型**：包含 MiniMax-M2.7 等多种模型选择
- **直接启动**：运行 `xiaoluo` 直接启动自主任务执行对话
- **配置完成后自动进入对话**：配置网页保存后自动启动对话


## ✨ 主要功能

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0;">
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h3 style="margin-top: 0; color: #333;">🤖 聊天模式</h3>
    <p style="margin-bottom: 0; color: #666;">与AI助手进行自然语言对话，获取编程帮助</p>
  </div>
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h3 style="margin-top: 0; color: #333;">✏️ 代码补全</h3>
    <p style="margin-bottom: 0; color: #666;">智能补全代码片段，提高编码效率</p>
  </div>
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h3 style="margin-top: 0; color: #333;">🔄 交互式REPL</h3>
    <p style="margin-bottom: 0; color: #666;">实时与AI助手交互，快速解决编程问题</p>
  </div>
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h3 style="margin-top: 0; color: #333;">🚀 自主任务执行</h3>
    <p style="margin-bottom: 0; color: #666;">AI自动执行编程任务，创建/删除文件、修改代码、自行测试修复错误</p>
  </div>
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h3 style="margin-top: 0; color: #333;">📦 自动部署</h3>
    <p style="margin-bottom: 0; color: #666;">智能分析项目类型，自动修复错误直到部署成功</p>
  </div>
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h3 style="margin-top: 0; color: #333;">🌐 Web对话界面</h3>
    <p style="margin-bottom: 0; color: #666;">基于claude-code-cli设计的现代化终端风格对话页面</p>
  </div>
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h3 style="margin-top: 0; color: #333;">🔧 配置管理</h3>
    <p style="margin-bottom: 0; color: #666;">轻松管理API密钥和其他设置</p>
  </div>
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h3 style="margin-top: 0; color: #333;">📱 多模型支持</h3>
    <p style="margin-bottom: 0; color: #666;">支持20+主流AI模型提供商，包括OpenAI、Anthropic、Google、Meta、Mistral、DeepSeek、智谱AI、月之暗面等</p>
  </div>
</div>

## 📋 系统要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- Git（用于克隆仓库）

## 🚀 安装方法

### 快速安装（推荐）

#### Windows (PowerShell)

```powershell
# 一键安装
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/lizhelan929822-eng/XiaoLuo-Code/main/install-windows.ps1" -OutFile "install-windows.ps1"; .\install-windows.ps1
```

#### macOS / Linux

```bash
# 一键安装
bash <(curl -s https://raw.githubusercontent.com/lizhelan929822-eng/XiaoLuo-Code/main/install.sh)
```

### 手动安装

#### 1. 克隆仓库

```bash
git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
cd XiaoLuo-Code
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 构建项目

```bash
npm run build
```

#### 4. 全局安装（可选）

```bash
# Windows：以管理员身份运行PowerShell
# macOS/Linux：使用 sudo npm link
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

**特性：**
- 自动打开配置网页
- 支持多种AI服务商选择
- 包含MiniMax-M2.7等多种模型
- 配置完成后自动启动对话

### 2. 直接启动自主任务执行对话

```bash
# 使用全局命令
xiaoluo

# 或使用本地命令
npm start
```

**特性：**
- 直接进入自主任务执行模式
- AI会自动执行您交给的任务
- 可以创建多个文件/文件夹
- 询问用户同意后删除文件
- 修改代码、自行测试、修复错误

### 3. 启动聊天模式

```bash
# 使用全局命令
xiaoluo chat

# 或使用本地命令
npm start chat
```

### 4. 代码补全

```bash
# 使用全局命令
xiaoluo complete

# 或使用本地命令
npm start complete
```

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

### 8. 播放音乐

```bash
# 使用全局命令
xiaoluo Music

# 或使用本地命令
npm start Music
```

**特性：**
- 随机播放Music文件夹中的音频文件
- 支持多种音频格式：mp3、wav、flac、ogg、m4a
- 自动根据操作系统选择合适的播放器

### 9. 部署命令

```bash
# 运行部署脚本（自动安装全局命令）
# Windows
./deploy-windows.ps1

# macOS / Linux
chmod +x deploy.sh && ./deploy.sh
```

**特性：**
- 自动安装全局命令
- 检查Node.js版本
- 创建Music文件夹
- 显示部署成功信息和使用说明

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
├── src/                # 源代码目录
│   ├── commands/       # 命令实现（40+ 个命令）
│   ├── tools/          # 工具实现（30+ 个工具）
│   ├── services/       # API、MCP、分析等服务
│   ├── utils/          # 工具函数
│   ├── context/        # React Context
│   ├── coordinator/    # 多 Agent 协调模式
│   ├── assistant/      # 助手模式（KAIROS）
│   ├── buddy/          # AI 伴侣 UI
│   ├── remote/         # 远程会话
│   ├── plugins/        # 插件系统
│   ├── skills/         # 技能系统
│   ├── voice/          # 语音交互
│   ├── vim/            # Vim 模式
│   ├── gateway/        # 网关服务和Web界面
│   ├── providers/      # AI提供商接口
│   └── main.tsx        # CLI 入口
├── user/               # 用户数据
├── install-*.sh        # 安装脚本
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript配置
└── README.md           # 项目说明
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

<div align="center">
  <p>享受编码的乐趣！🎉</p>
  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20terminal%20interface%20with%20AI%20assistant%20chat&image_size=landscape_16_9" alt="XiaoLuo Code Interface" width="600" height="338">
</div>
