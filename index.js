#!/usr/bin/env node

/**
 * XiaoLuo Code 主入口文件
 * 集成 claude-code-sourcemap 的核心功能，同时保持 XiaoLuo Code 的配置系统和多模型支持
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 检查是否已配置
function checkConfig() {
  const configPath = path.join(__dirname, 'user', 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.apiKey && config.model && config.provider;
    } catch (error) {
      return false;
    }
  }
  return false;
}

// 显示欢迎信息
function showWelcome() {
  console.log('');
  console.log('=====================================');
  console.log('🤖 XiaoLuo Code v1.1.1');
  console.log('=====================================');
  console.log('');
  console.log('核心功能基于 claude-code-sourcemap');
  console.log('支持多模型配置和自动部署功能');
  console.log('');
}

// 显示帮助信息
function showHelp() {
  console.log('');
  console.log('📖 使用帮助:');
  console.log('');
  console.log('  xiaoluo                    # 启动 XiaoLuo Code');
  console.log('  xiaoluo deploy [prompt]    # 启动自动部署功能');
  console.log('  xiaoluo config             # 打开配置文件');
  console.log('  xiaoluo help               # 显示帮助信息');
  console.log('');
  console.log('🔧 配置文件:');
  console.log('');
  console.log('  配置文件位于: user/config.json');
  console.log('  请设置 API Key、模型和提供商等信息');
  console.log('');
  console.log('📡 支持的模型提供商:');
  console.log('');
  console.log('  - anthropic (Claude 模型)');
  console.log('  - openai (OpenAI 模型)');
  console.log('  - google (Google 模型)');
  console.log('  - aliyun (阿里云模型)');
  console.log('  - minimax (Minimax 模型)');
  console.log('  - siliconflow (SiliconFlow 模型)');
  console.log('');
}

// 主函数
async function main() {
  showWelcome();

  // 检查配置
  if (!checkConfig()) {
    console.log('🔧 首次运行，正在初始化配置...');
    console.log('');
    
    // 复制配置文件模板
    const configTemplate = {
      "apiKey": "",
      "model": "claude-3-opus-20240229",
      "provider": "anthropic",
      "baseUrl": "",
      "temperature": 0.7,
      "maxTokens": 4096
    };
    
    const userDir = path.join(__dirname, 'user');
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(userDir, 'config.json'),
      JSON.stringify(configTemplate, null, 2)
    );
    
    console.log('✅ 配置文件已创建，请编辑 user/config.json 文件设置 API Key 和模型配置');
    console.log('');
    showHelp();
    return;
  }

  // 启动 claude-code-sourcemap 的核心功能
  console.log('🚀 启动中...');
  console.log('');
  
  try {
    // 运行 claude-code-sourcemap 的 CLI
    const claudePath = path.join(__dirname, 'claude-code-sourcemap', 'package', 'cli.js');
    if (fs.existsSync(claudePath)) {
      // 设置环境变量
      const env = {
        ...process.env,
        XIAOLUO_CONFIG: path.join(__dirname, 'user', 'config.json')
      };
      
      // 传递命令行参数
      const args = process.argv.slice(2);
      
      // 启动子进程
      const child = spawn('node', [claudePath, ...args], {
        stdio: 'inherit',
        env: env
      });
      
      // 处理子进程退出
      child.on('exit', (code) => {
        if (code !== 0) {
          console.log(`\n❌ Claude Code 进程退出，退出码: ${code}`);
          console.log('');
          showHelp();
        }
      });
    } else {
      console.log('❌ 未找到 claude-code-sourcemap 核心文件');
      console.log('请确保已正确克隆 claude-code-sourcemap 仓库');
    }
  } catch (error) {
    console.log('❌ 启动失败:', error.message);
    console.log('');
    showHelp();
  }
}

// 检查命令行参数
const args = process.argv.slice(2);

if (args[0] === 'deploy') {
  // 处理部署命令
  console.log('🚀 启动自动部署功能...');
  console.log('');
  
  // 运行部署脚本
  const deployPath = path.join(__dirname, 'dist', 'commands', 'deploy.js');
  if (fs.existsSync(deployPath)) {
    const { execSync } = require('child_process');
    execSync(`node "${deployPath}" ${args.slice(1).join(' ')}`, {
      stdio: 'inherit'
    });
  } else {
    console.log('❌ 部署功能未找到');
    console.log('请先运行 npm run build 构建项目');
  }
} else if (args[0] === 'config') {
  // 处理配置命令
  console.log('🔧 配置管理功能...');
  console.log('');
  
  // 打开配置文件
  const configPath = path.join(__dirname, 'user', 'config.json');
  if (fs.existsSync(configPath)) {
    const { execSync } = require('child_process');
    if (process.platform === 'win32') {
      execSync(`notepad "${configPath}"`, { stdio: 'inherit' });
    } else if (process.platform === 'darwin') {
      execSync(`open "${configPath}"`, { stdio: 'inherit' });
    } else {
      execSync(`nano "${configPath}"`, { stdio: 'inherit' });
    }
  } else {
    console.log('❌ 配置文件未找到');
  }
} else if (args[0] === 'help') {
  // 显示帮助信息
  showWelcome();
  showHelp();
} else {
  // 启动主程序
  main();
}
