# 部署指南

## 系统要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

## 安装步骤

### 1. 克隆仓库

```bash
git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git
cd XiaoLuo-Code
```

### 2. 安装依赖

```bash
npm install
```

### 3. 构建项目

```bash
npm run build
```

## 各系统部署命令

### Windows

#### 直接运行

```powershell
# 安装依赖
npm install

# 构建项目
npm run build

# 运行工具
npm start

# 或直接使用开发模式
npm run dev
```

#### 打包为可执行文件

```powershell
# 构建并打包
npm run pkg

# 运行生成的可执行文件
./xiaoluo-code.exe
```

#### 全局安装

```powershell
# 构建项目
npm run build

# 全局安装
npm link

# 现在可以在任何位置使用 xiaoluo 命令
xiaoluo
```

### macOS

#### 直接运行

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 运行工具
npm start

# 或直接使用开发模式
npm run dev
```

#### 打包为可执行文件

```bash
# 构建并打包
npm run pkg

# 运行生成的可执行文件
./xiaoluo-code
```

#### 全局安装

```bash
# 构建项目
npm run build

# 全局安装
npm link

# 现在可以在任何位置使用 xiaoluo 命令
xiaoluo
```

### Linux

#### 直接运行

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 运行工具
npm start

# 或直接使用开发模式
npm run dev
```

#### 打包为可执行文件

```bash
# 构建并打包
npm run pkg

# 运行生成的可执行文件
./xiaoluo-code
```

#### 全局安装

```bash
# 构建项目
npm run build

# 全局安装
npm link

# 现在可以在任何位置使用 xiaoluo 命令
xiaoluo
```

## 配置说明

首次运行前需要配置 API Key：

```bash
# 运行配置命令
xiaoluo config

# 或使用 npm 脚本
npm start config
```

## 常用命令

```bash
# 配置 API Key
xiaoluo config

# 启动聊天模式
xiaoluo chat

# 代码补全
xiaoluo complete

# 启动交互式 REPL 模式
xiaoluo repl

# 停止服务
xiaoluo stop
```

## 故障排除

### 依赖安装失败

如果遇到依赖安装失败，可以尝试：

```bash
# 清除 npm 缓存
npm cache clean --force

# 重新安装依赖
npm install
```

### 构建失败

确保 Node.js 版本 >= 18.0，并且 TypeScript 已正确安装。

### 打包失败

如果 `npm run pkg` 失败，可能是因为 pkg 包的兼容性问题，可以尝试：

```bash
# 安装特定版本的 pkg
npm install pkg@5.8.1

# 重新打包
npm run pkg
```

## 开发模式

对于开发者，可以使用开发模式运行：

```bash
npm run dev
```

这将使用 ts-node 直接运行 TypeScript 文件，无需先构建。