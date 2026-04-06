#!/usr/bin/env node

// XiaoLuo Code 启动脚本
// 基于 XiaoLuo Code 2.1.88

console.log('XiaoLuo Code 启动中...');

// 检查环境变量
if (!process.env.XIAOLUO_CONFIG) {
  process.env.XIAOLUO_CONFIG = './user/config.json';
}

// 检查配置文件是否存在
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { createServer } from 'http';
import open from 'open';

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

// 配置网页HTML
const configHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>XiaoLuo Code 配置</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      text-align: center;
      color: #333;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input, select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    button {
      background-color: #4CAF50;
      color: white;
      padding: 12px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      width: 100%;
    }
    button:hover {
      background-color: #45a049;
    }
    .message {
      margin-top: 20px;
      padding: 10px;
      border-radius: 4px;
    }
    .success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>XiaoLuo Code 配置</h1>
    <form id="configForm">
      <div class="form-group">
        <label for="apiKey">API Key</label>
        <input type="text" id="apiKey" placeholder="输入API Key">
      </div>
      <div class="form-group">
        <label for="provider">服务商</label>
        <select id="provider">
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="google">Google (DeepMind)</option>
          <option value="meta">Meta</option>
          <option value="mistral">Mistral AI</option>
          <option value="xai">xAI</option>
          <option value="bytedance">字节跳动</option>
          <option value="baidu">百度</option>
          <option value="aliyun">阿里云</option>
          <option value="zhiyuan">智谱 AI</option>
          <option value="moonshot">月之暗面 (Moonshot AI)</option>
          <option value="deepseek">深度求索 (DeepSeek)</option>
          <option value="iflytek">科大讯飞</option>
          <option value="tencent">腾讯</option>
          <option value="huawei">华为</option>
          <option value="baichuan">百川智能</option>
          <option value="01ai">零一万物</option>
          <option value="minimax">MiniMax</option>
          <option value="sensetime">商汤科技</option>
        </select>
      </div>
      <div class="form-group">
        <label for="model">模型</label>
        <select id="model">
          <!-- OpenAI -->
          <option value="gpt-3.5-turbo">OpenAI - GPT-3.5-turbo</option>
          <option value="gpt-4">OpenAI - GPT-4</option>
          <option value="gpt-4-turbo">OpenAI - GPT-4-turbo</option>
          <option value="gpt-4o">OpenAI - GPT-4o</option>
          <option value="gpt-4o-audio">OpenAI - GPT-4o-audio</option>
          <option value="gpt-5.2">OpenAI - GPT-5.2</option>
          <option value="gpt-5.4">OpenAI - GPT-5.4</option>
          <option value="gpt-5.4-thinking">OpenAI - GPT-5.4-Thinking</option>
          
          <!-- Anthropic -->
          <option value="claude-3-haiku">Anthropic - Claude 3 Haiku</option>
          <option value="claude-3-sonnet">Anthropic - Claude 3 Sonnet</option>
          <option value="claude-3-opus">Anthropic - Claude 3 Opus</option>
          <option value="claude-3.5-sonnet">Anthropic - Claude 3.5 Sonnet</option>
          <option value="claude-4-haiku">Anthropic - Claude 4 Haiku</option>
          <option value="claude-4-sonnet">Anthropic - Claude 4 Sonnet</option>
          <option value="claude-4-opus">Anthropic - Claude 4 Opus</option>
          <option value="claude-4.5-haiku">Anthropic - Claude 4.5 Haiku</option>
          <option value="claude-4.5-sonnet">Anthropic - Claude 4.5 Sonnet</option>
          <option value="claude-4.6-opus">Anthropic - Claude 4.6 Opus</option>
          
          <!-- Google (DeepMind) -->
          <option value="gemini-1.0-pro">Google - Gemini 1.0 Pro</option>
          <option value="gemini-1.0-ultra">Google - Gemini 1.0 Ultra</option>
          <option value="gemini-1.5-pro">Google - Gemini 1.5 Pro</option>
          <option value="gemini-1.5-ultra">Google - Gemini 1.5 Ultra</option>
          <option value="gemini-2.0-pro">Google - Gemini 2.0 Pro</option>
          <option value="gemini-2.0-ultra">Google - Gemini 2.0 Ultra</option>
          <option value="gemini-3.0-pro">Google - Gemini 3.0 Pro</option>
          <option value="gemini-3.0-ultra">Google - Gemini 3.0 Ultra</option>
          <option value="gemini-3.1-pro">Google - Gemini 3.1 Pro</option>
          <option value="gemini-3.1-ultra">Google - Gemini 3.1 Ultra</option>
          <option value="gemma-2b">Google - Gemma 2B</option>
          <option value="gemma-7b">Google - Gemma 7B</option>
          <option value="gemma-3-12b">Google - Gemma 3 12B</option>
          
          <!-- Meta -->
          <option value="llama-2-7b">Meta - Llama 2 (7B)</option>
          <option value="llama-2-13b">Meta - Llama 2 (13B)</option>
          <option value="llama-2-70b">Meta - Llama 2 (70B)</option>
          <option value="llama-3-8b">Meta - Llama 3 (8B)</option>
          <option value="llama-3-70b">Meta - Llama 3 (70B)</option>
          <option value="llama-3.1-8b">Meta - Llama 3.1 (8B)</option>
          <option value="llama-3.1-70b">Meta - Llama 3.1 (70B)</option>
          <option value="llama-3.1-405b">Meta - Llama 3.1 (405B)</option>
          <option value="llama-3.3">Meta - Llama 3.3</option>
          <option value="llama-4-8b">Meta - Llama 4 (8B)</option>
          <option value="llama-4-70b">Meta - Llama 4 (70B)</option>
          <option value="llama-4-405b">Meta - Llama 4 (405B)</option>
          
          <!-- Mistral AI -->
          <option value="mistral-7b">Mistral AI - Mistral 7B</option>
          <option value="mixtral-8x7b">Mistral AI - Mixtral 8x7B</option>
          <option value="mixtral-8x22b">Mistral AI - Mixtral 8x22B</option>
          <option value="mistral-large">Mistral AI - Mistral Large</option>
          <option value="mistral-large-2">Mistral AI - Mistral Large 2</option>
          
          <!-- xAI -->
          <option value="grok-3">xAI - Grok 3</option>
          <option value="grok-4.1">xAI - Grok 4.1</option>
          <option value="grok-4.2">xAI - Grok 4.2</option>
          
          <!-- 字节跳动 -->
          <option value="doubao-4.0">字节跳动 - 豆包大模型 4.0</option>
          <option value="doubao-pro-4.0">字节跳动 - 豆包 Pro 4.0</option>
          <option value="doubao-lite">字节跳动 - 豆包 Lite</option>
          <option value="doubao-code">字节跳动 - 豆包 Code</option>
          <option value="doubao-5.0">字节跳动 - 豆包大模型 5.0</option>
          
          <!-- 百度 -->
          <option value="ernie-3.5">百度 - 文心一言 ERNIE 3.5</option>
          <option value="ernie-4.0">百度 - 文心一言 ERNIE 4.0</option>
          <option value="ernie-4.5">百度 - 文心一言 ERNIE 4.5</option>
          <option value="ernie-5.0">百度 - 文心一言 ERNIE 5.0</option>
          <option value="ernie-4.5-vl">百度 - 文心一言 ERNIE-4.5-VL</option>
          
          <!-- 阿里云 -->
          <option value="qwen-2.5">阿里云 - 通义千问 Qwen 2.5</option>
          <option value="qwen-3">阿里云 - 通义千问 Qwen 3</option>
          <option value="qwen-3.5-max">阿里云 - 通义千问 Qwen 3.5 Max</option>
          <option value="qwen-3.5-plus">阿里云 - 通义千问 Qwen 3.5 Plus</option>
          <option value="qwen-3.5-lite">阿里云 - 通义千问 Qwen 3.5 Lite</option>
          <option value="qwen-3.5-flash">阿里云 - 通义千问 Qwen 3.5 Flash</option>
          <option value="qwen-vl">阿里云 - 通义千问 Qwen-VL</option>
          <option value="qwen-coder">阿里云 - 通义千问 Qwen-Coder</option>
          
          <!-- 智谱 AI -->
          <option value="glm-4">智谱 AI - GLM-4</option>
          <option value="glm-4v">智谱 AI - GLM-4V</option>
          <option value="glm-5">智谱 AI - GLM-5</option>
          <option value="glm-5v">智谱 AI - GLM-5V</option>
          <option value="zhiqian">智谱 AI - 智谱清言</option>
          
          <!-- 月之暗面 (Moonshot AI) -->
          <option value="kimi-1.8">月之暗面 - Kimi 1.8</option>
          <option value="kimi-2.0">月之暗面 - Kimi 2.0</option>
          <option value="kimi-2.5">月之暗面 - Kimi 2.5</option>
          <option value="kimi-k2">月之暗面 - Kimi K2</option>
          
          <!-- 深度求索 (DeepSeek) -->
          <option value="deepseek-v3">深度求索 - DeepSeek-V3</option>
          <option value="deepseek-v4">深度求索 - DeepSeek-V4</option>
          <option value="deepseek-r1">深度求索 - DeepSeek-R1</option>
          <option value="deepseek-coder">深度求索 - DeepSeek-Coder</option>
          <option value="deepseek-math">深度求索 - DeepSeek-Math</option>
          
          <!-- 科大讯飞 -->
          <option value="xinghuo-3.0">科大讯飞 - 星火大模型 3.0</option>
          <option value="xinghuo-3.5">科大讯飞 - 星火 3.5</option>
          <option value="xinghuo-4.0">科大讯飞 - 星火 4.0</option>
          
          <!-- 腾讯 -->
          <option value="hunyuan">腾讯 - 混元大模型 (Hunyuan)</option>
          <option value="hunyuan-text">腾讯 - 混元文本</option>
          <option value="hunyuan-multimodal">腾讯 - 混元多模态</option>
          <option value="hunyuan-video">腾讯 - 混元视频</option>
          
          <!-- 华为 -->
          <option value="pangu-nlp">华为 - 盘古大模型 NLP</option>
          <option value="pangu-multimodal">华为 - 盘古多模态</option>
          <option value="pangu-science">华为 - 盘古科学计算</option>
          <option value="pangu-weather">华为 - 盘古气象</option>
          
          <!-- 百川智能 -->
          <option value="baichuan-2">百川智能 - Baichuan 2</option>
          <option value="baichuan-3">百川智能 - Baichuan 3</option>
          <option value="baichuan-4.0-7b">百川智能 - 百川 4.0 (7B)</option>
          <option value="baichuan-4.0-13b">百川智能 - 百川 4.0 (13B)</option>
          <option value="baichuan-4.0-67b">百川智能 - 百川 4.0 (67B)</option>
          
          <!-- 零一万物 -->
          <option value="yi-6b">零一万物 - Yi-6B</option>
          <option value="yi-34b">零一万物 - Yi-34B</option>
          <option value="yi-large">零一万物 - Yi-Large</option>
          <option value="yi-1.5">零一万物 - Yi-1.5</option>
          
          <!-- MiniMax -->
          <option value="minimax-m2.7">MiniMax - MiniMax-M2.7</option>
          <option value="abab-5.0">MiniMax - ABAB 5.0</option>
          <option value="abab-6.0">MiniMax - ABAB 6.0</option>
          <option value="abab-6.5">MiniMax - ABAB 6.5</option>
          
          <!-- 商汤科技 -->
          <option value="sensenova-4.0">商汤科技 - 日日新 SenseNova 4.0</option>
          <option value="sensenova-5.0">商汤科技 - 日日新 SenseNova 5.0</option>
        </select>
      </div>
      <button type="submit">保存配置</button>
    </form>
    <div id="message" class="message" style="display: none;"></div>
  </div>
  <script>
    // 加载当前配置
    async function loadConfig() {
      try {
        const response = await fetch('/config');
        const config = await response.json();
        document.getElementById('apiKey').value = config.apiKey || '';
        document.getElementById('provider').value = config.provider || 'anthropic';
        document.getElementById('model').value = config.model || 'claude-3-opus-20240229';
      } catch (error) {
        console.error('加载配置失败:', error);
      }
    }

    // 保存配置
    document.getElementById('configForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const config = {
        apiKey: document.getElementById('apiKey').value,
        provider: document.getElementById('provider').value,
        model: document.getElementById('model').value
      };

      try {
        const response = await fetch('/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(config)
        });
        const result = await response.json();
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = result.message;
        messageDiv.className = 'message ' + (result.success ? 'success' : 'error');
        messageDiv.style.display = 'block';

        if (result.success) {
          // 配置成功后，3秒后关闭窗口并启动对话
          setTimeout(() => {
            window.close();
          }, 3000);
        }
      } catch (error) {
        console.error('保存配置失败:', error);
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = '保存配置失败';
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
      }
    });

    // 页面加载时加载配置
    loadConfig();
  </script>
</body>
</html>
`;

// 处理配置命令或未配置的情况
if (args.length > 0 && args[0] === 'config' || !fs.existsSync(configPath)) {
  console.log('打开配置网页...');
  
  // 创建临时配置文件（如果不存在）
  if (!fs.existsSync(configPath)) {
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify({
      apiKey: '',
      model: 'claude-3-opus-20240229',
      provider: 'anthropic'
    }, null, 2));
  }
  
  // 创建HTTP服务器
  const server = createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(configHtml);
    } else if (req.url === '/config') {
      // 读取配置文件
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(config));
    } else if (req.url === '/save' && req.method === 'POST') {
      // 保存配置
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const config = JSON.parse(body);
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: '配置保存成功！正在启动对话...' }));
          
          // 配置完成后，启动自主任务执行对话
          setTimeout(() => {
            server.close();
            startREPL();
          }, 3000);
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: '保存配置失败' }));
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  
  // 启动服务器
  const PORT = 3888;
  server.listen(PORT, () => {
    console.log(`配置网页已启动: http://localhost:${PORT}`);
    open(`http://localhost:${PORT}`);
  });
  
  // 不需要return语句，因为服务器会持续运行
} else {
  // 直接启动自主任务执行对话
  startREPL();
}

// 启动REPL模式
function startREPL() {
  // 读取配置文件
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // 设置API Key环境变量
  if (config.apiKey) {
    process.env.ANTHROPIC_API_KEY = config.apiKey;
  }
  
  // 设置模型和服务商环境变量
  if (config.model) {
    process.env.MODEL = config.model;
  }
  if (config.provider) {
    process.env.PROVIDER = config.provider;
  }
  
  // 运行Claude Code in REPL mode
  // 获取脚本所在目录
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const cliPath = path.join(scriptDir, 'cli.js');
  
  const claudeProcess = spawn('node', [cliPath, 'repl', `--model=${config.model || 'claude-3-opus-20240229'}`, `--provider=${config.provider || 'anthropic'}`], {
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
}
