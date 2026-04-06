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
if (!config.apiKey) {
  console.log('API Key 未设置，请编辑配置文件:', configPath);
  process.exit(0);
}

// 设置API Key环境变量
process.env.ANTHROPIC_API_KEY = config.apiKey;

// 运行Claude Code
const cliPath = path.join(process.cwd(), 'cli.js');

const args = process.argv.slice(2);
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
