# XiaoLuo Code

## 项目介绍

XiaoLuo Code 是一个功能强大的命令行 AI 编程助手，帮助开发者快速编写、理解和优化代码。

### 主要功能

- **聊天模式**：与 AI 助手进行自然语言对话，获取编程帮助
- **代码补全**：智能补全代码片段，提高编码效率
- **交互式 REPL**：在命令行中与 AI 进行实时交互
- **多模型支持**：支持多种 AI 模型，包括 OpenAI、Anthropic、Google 等
- **配置管理**：方便的配置管理系统，支持多种 API Key 配置

## 部署方式

### 一键部署命令

#### macOS / Linux

```bash
bash <(curl -s https://raw.githubusercontent.com/lizhelan929822-eng/XiaoLuo-Code/main/install.sh)
```

#### Windows (PowerShell)

```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/lizhelan929822-eng/XiaoLuo-Code/main/install-windows.ps1" -OutFile "install-windows.ps1"; .\install-windows.ps1
```

### 手动安装

1. **克隆仓库**
   ```bash
   git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
   cd XiaoLuo-Code
   ```
2. **安装依赖**
   ```bash
   npm install
   ```
3. **构建项目**
   ```bash
   npm run build
   ```
4. **全局安装**
   ```bash
   npm link
   ```

## 系统要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- git（用于克隆仓库）

## 所有命令

### 1. 配置命令

```bash
# 配置 API Key
xiaoluo config

# 示例：配置 OpenAI API Key
xiaoluo config
# 然后按照提示输入 API Key
```

### 2. 启动！

```bash
# 启动
xiaoluo
```

### 3. 代码补全

```bash
# 启动代码补全模式
xiaoluo complete

# 示例：补全代码
xiaoluo complete
> 编写一个函数，计算斐波那契数列的第 n 项
```

### 4. 交互式 REPL 模式

```bash
# 启动 REPL 模式
xiaoluo repl

# 示例：在 REPL 中与 AI 交互
xiaoluo repl
> 什么是闭包？
> 如何优化 React 组件性能？
```

### 5. 停止服务

```bash
# 停止正在运行的服务
xiaoluo stop
```

### 6. 帮助命令

```bash
# 查看帮助信息
xiaoluo --help

# 查看版本信息
xiaoluo --version
```

## 配置说明

首次运行前需要配置 API Key：

1. 运行 `xiaoluo config` 命令
2. 按照提示选择 AI 模型提供商
3. 输入对应的 API Key
4. 配置完成后即可开始使用

## 项目结构

```
XiaoLuo-Code/
├── src/
│   ├── commands/      # 命令实现
│   ├── config/        # 配置管理
│   ├── gateway/       # 网关服务
│   ├── providers/     # AI 模型提供商
│   ├── utils/         # 工具函数
│   └── index.ts       # 主入口
├── dist/              # 构建输出
├── package.json       # 项目配置
├── tsconfig.json      # TypeScript 配置
├── install.sh         # macOS/Linux 安装脚本
├── install-windows.ps1 # Windows 安装脚本
└── README.md          # 项目说明
```

## 开发指南

### 开发模式

```bash
# 启动开发模式
npm run dev
```

### 构建项目

```bash
# 构建项目
npm run build
```

### 打包为可执行文件

```bash
# 构建并打包
npm run pkg
```

## 故障排除

### 常见问题

1. **依赖安装失败**
   - 清除 npm 缓存：`npm cache clean --force`
   - 重新安装依赖：`npm install`
2. **构建失败**
   - 确保 Node.js 版本 ≥ 18.0
   - 检查 TypeScript 配置
3. **全局安装失败**
   - Windows：以管理员身份运行 PowerShell
   - macOS/Linux：使用 sudo 权限
4. **API Key 配置问题**
   - 确保 API Key 正确且有效
   - 检查网络连接是否正常

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系

如有问题或建议，请在 GitHub 仓库提交 Issue。
