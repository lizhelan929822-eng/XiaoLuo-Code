# 一键部署命令

## 原创一键部署命令

以下是针对不同系统的原创一键部署命令，只需复制粘贴到终端执行即可完成整个安装过程。

### 1. macOS / Linux

**命令**：
```bash
bash <(curl -s https://raw.githubusercontent.com/lizhelan929822-eng/XiaoLuo-Code/main/install.sh)
```

**执行过程**：
1. 自动下载并执行安装脚本
2. 检查Node.js和git安装情况
3. 克隆项目仓库
4. 安装依赖并构建项目
5. 全局安装工具

### 2. Windows (PowerShell)

**命令**：
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/lizhelan929822-eng/XiaoLuo-Code/main/install-windows.ps1" -OutFile "install-windows.ps1"; .\install-windows.ps1
```

**执行过程**：
1. 下载PowerShell安装脚本
2. 执行脚本检查环境
3. 克隆项目仓库
4. 安装依赖并构建项目
5. 全局安装工具

## 命令说明

### 工作原理

这些一键部署命令采用了以下设计：

1. **远程脚本执行**：通过curl或Invoke-WebRequest从GitHub仓库下载最新的安装脚本
2. **环境检测**：自动检查Node.js、npm和git的安装情况
3. **完整流程**：一键完成从克隆到安装的全部过程
4. **错误处理**：遇到问题时提供明确的错误信息
5. **跨平台支持**：针对不同系统提供专属命令

### 系统要求

- **Windows**：PowerShell 5.0+，Node.js 18.0+，git
- **macOS**：bash，Node.js 18.0+，git
- **Linux**：bash，Node.js 18.0+，git

### 注意事项

1. **权限问题**：
   - Windows：可能需要以管理员身份运行PowerShell
   - macOS/Linux：全局安装时可能需要sudo权限

2. **网络连接**：确保网络连接正常，能够访问GitHub

3. **防火墙**：如果使用了防火墙，请确保允许脚本执行和网络访问

4. **安装路径**：脚本会在当前目录创建XiaoLuo-Code文件夹并安装在其中

## 验证安装

安装完成后，可以通过以下命令验证安装是否成功：

```bash
# 查看版本信息
xiaoluo --version

# 查看帮助信息
xiaoluo --help
```

## 故障排除

### 常见问题

1. **命令执行失败**
   - 检查网络连接
   - 确保Node.js版本≥18.0
   - 尝试以管理员/root权限运行

2. **全局安装失败**
   - Windows：以管理员身份运行PowerShell
   - macOS/Linux：使用sudo执行命令

3. **脚本下载失败**
   - 检查网络连接
   - 尝试使用浏览器直接访问脚本URL

### 手动安装备选方案

如果一键命令执行失败，可以尝试手动安装：

```bash
# 1. 克隆仓库
git clone https://github.com/lizhelan929822-eng/XiaoLuo-Code.git

# 2. 进入目录
cd XiaoLuo-Code

# 3. 安装依赖
npm install

# 4. 构建项目
npm run build

# 5. 全局安装
npm link
```

## 卸载方法

如果需要卸载XiaoLuo Code：

```bash
# 1. 全局卸载
npm unlink xiaoluo

# 2. 删除项目目录
rm -rf XiaoLuo-Code
```

## 联系支持

如果遇到任何安装问题，请在GitHub仓库提交Issue获取帮助。