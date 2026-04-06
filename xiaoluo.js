#!/usr/bin/env node

// XiaoLuo Code 启动脚本
// 基于 Claude Code 2.1.88

console.log('XiaoLuo Code 启动中...');

// 检查环境变量
if (!process.env.XIAOLUO_CONFIG) {
  process.env.XIAOLUO_CONFIG = './user/config.json';
}

// 检查配置文件是否存在
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// 处理Music命令
const args = process.argv.slice(2);
if (args.length > 0 && args[0] === 'Music') {
  console.log('正在播放Music文件夹中的随机音频...');
  
  const musicDir = path.join(process.cwd(), 'Music');
  
  // 检查Music文件夹是否存在
  if (!fs.existsSync(musicDir)) {
    console.error('Music文件夹不存在，请先创建Music文件夹并放入音频文件');
    process.exit(1);
  }
  
  // 读取Music文件夹中的音频文件
  const audioExtensions = ['.mp3', '.wav', '.flac', '.ogg', '.m4a'];
  const audioFiles = fs.readdirSync(musicDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return audioExtensions.includes(ext);
  });
  
  if (audioFiles.length === 0) {
    console.error('Music文件夹中没有音频文件');
    process.exit(1);
  }
  
  // 随机选择一个音频文件
  const randomIndex = Math.floor(Math.random() * audioFiles.length);
  const selectedFile = audioFiles[randomIndex];
  const filePath = path.join(musicDir, selectedFile);
  
  console.log(`正在播放: ${selectedFile}`);
  
  // 根据操作系统选择不同的播放器
  let playerCommand;
  let playerArgs;
  
  if (process.platform === 'win32') {
    // Windows
    playerCommand = 'cmd';
    playerArgs = ['/c', 'start', filePath];
  } else if (process.platform === 'darwin') {
    // macOS
    playerCommand = 'open';
    playerArgs = [filePath];
  } else {
    // Linux
    playerCommand = 'xdg-open';
    playerArgs = [filePath];
  }
  
  // 播放音频
  const playerProcess = spawn(playerCommand, playerArgs);
  
  playerProcess.on('error', (error) => {
    console.error('播放音频失败:', error);
    process.exit(1);
  });
  
  playerProcess.on('exit', (code) => {
    if (code === 0) {
      console.log('音频播放已启动');
    } else {
      console.error('播放音频失败，退出码:', code);
    }
    process.exit(code);
  });
  
  // 不需要return语句，因为process.exit()会终止进程
}

// 检查配置文件
const configPath = path.resolve(process.env.XIAOLUO_CONFIG);
if (!fs.existsSync(configPath)) {
  console.log('首次运行，创建默认配置文件...');
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify({
    apiKey: '',
    model: 'claude-3-opus-20240229',
    provider: 'anthropic'
  }, null, 2));
  console.log(`配置文件已创建: ${configPath}`);
  console.log('请编辑配置文件设置API Key');
  process.exit(0);
}

// 读取配置文件
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// 检查API Key
if (!config.apiKey && args.length > 0 && args[0] !== 'Music') {
  console.log('API Key 未设置，请编辑配置文件:', configPath);
  process.exit(0);
}

// 设置API Key环境变量
if (config.apiKey) {
  process.env.ANTHROPIC_API_KEY = config.apiKey;
}

// 运行Claude Code
const cliPath = path.join(process.cwd(), 'cli.js');

const claudeProcess = spawn('node', [cliPath, ...args], {
  stdio: 'inherit',
  env: process.env
});

claudeProcess.on('error', (error) => {
  console.error('启动Claude Code失败:', error);
  process.exit(1);
});

claudeProcess.on('exit', (code) => {
  process.exit(code);
});
