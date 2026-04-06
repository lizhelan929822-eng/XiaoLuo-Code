#!/usr/bin/env node

// 简化的入口文件
console.log('XiaoLuo Code 启动中...');

// 检查环境变量
if (!process.env.XIAOLUO_CONFIG) {
  process.env.XIAOLUO_CONFIG = './user/config.json';
}

// 检查配置文件是否存在
const fs = require('fs');
const path = require('path');

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

// 显示帮助信息
console.log('\nXiaoLuo Code 命令行AI编程工具');
console.log('==================================');
console.log('已加载配置:', configPath);
console.log('当前模型:', config.model);
console.log('当前提供商:', config.provider);
console.log('\n可用命令:');
console.log('  xiaoluo chat      - 启动聊天模式');
console.log('  xiaoluo config    - 配置API Key');
console.log('  xiaoluo complete  - 代码补全');
console.log('  xiaoluo repl      - 启动自主任务执行');
console.log('  xiaoluo deploy    - 自动部署项目');
console.log('  xiaoluo gateway   - 启动Web界面');
console.log('  xiaoluo stop      - 停止服务');
console.log('\n注意: 当前为简化模式，部分功能可能不可用');
console.log('完整功能需要成功构建项目');

// 处理命令行参数
const args = process.argv.slice(2);
if (args.length > 0) {
  const command = args[0];
  console.log('\n执行命令:', command);
  
  switch (command) {
    case 'config':
      console.log('请编辑配置文件:', configPath);
      break;
    case 'chat':
      console.log('聊天模式启动中...');
      console.log('提示: 由于缺少依赖，聊天功能暂时不可用');
      break;
    case 'complete':
      console.log('代码补全功能启动中...');
      console.log('提示: 由于缺少依赖，代码补全功能暂时不可用');
      break;
    case 'repl':
      console.log('自主任务执行启动中...');
      console.log('提示: 由于缺少依赖，自主任务执行功能暂时不可用');
      break;
    case 'deploy':
      console.log('自动部署功能启动中...');
      console.log('提示: 由于缺少依赖，自动部署功能暂时不可用');
      break;
    case 'gateway':
      console.log('Web界面启动中...');
      console.log('提示: 由于缺少依赖，Web界面功能暂时不可用');
      break;
    case 'stop':
      console.log('服务停止中...');
      console.log('提示: 由于缺少依赖，停止服务功能暂时不可用');
      break;
    default:
      console.log('未知命令:', command);
      break;
  }
} else {
  console.log('\n请指定命令，例如: xiaoluo chat');
}