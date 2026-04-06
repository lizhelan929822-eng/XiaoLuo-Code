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
          <option value="anthropic">Anthropic</option>
          <option value="openai">OpenAI</option>
          <option value="google">Google</option>
          <option value="minimax">MiniMax</option>
        </select>
      </div>
      <div class="form-group">
        <label for="model">模型</label>
        <select id="model">
          <option value="claude-3-opus-20240229">Claude 3 Opus</option>
          <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gemini-pro">Gemini Pro</option>
          <option value="MiniMax-M2.7">MiniMax-M2.7</option>
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
  
  // 运行Claude Code in REPL mode
  const cliPath = path.join(process.cwd(), 'cli.js');
  
  const claudeProcess = spawn('node', [cliPath, 'repl'], {
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
