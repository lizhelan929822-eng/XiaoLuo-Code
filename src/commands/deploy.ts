import { Command } from 'commander';
import { configStore } from '../config/store';
import { getProvider } from '../providers';
import { logger } from '../utils/logger';
import { Message } from '../providers/base';
import fs from 'fs';
import path from 'path';
import * as readline from 'readline';
import * as tty from 'tty';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const LOGO = `
 ╔══════════════════════════════════════╗
 ║       XiaoLuo Deploy 自动部署       ║
 ╚══════════════════════════════════════╝`;

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const WHITE = '\x1b[37m';
const GRAY = '\x1b[90m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';

const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.cache', '.tmp', '.next', '.nuxt', 'vendor', 'target'];
const BINARY_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp', '.svg',
  '.mp3', '.mp4', '.wav', '.avi', '.mov', '.wmv', '.flv',
  '.zip', '.tar', '.gz', '.rar', '.7z',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.exe', '.dll', '.so', '.dylib',
  '.ttf', '.otf', '.woff', '.woff2', '.eot'
];

function isBinaryFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.includes(ext);
}

function readFileContent(filePath: string, maxSize: number = 30000): string | null {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > maxSize) {
      return '[文件过大，已截断]\n' + fs.readFileSync(filePath, 'utf-8').slice(0, maxSize);
    }
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function countFiles(dir: string): { files: number; dirs: number } {
  let files = 0;
  let dirs = 0;
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item.startsWith('.')) continue;
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!EXCLUDED_DIRS.includes(item)) {
          dirs++;
          const sub = countFiles(fullPath);
          files += sub.files;
          dirs += sub.dirs;
        }
      } else {
        files++;
      }
    }
  } catch {
    // ignore
  }
  return { files, dirs };
}

function readAllProjectFiles(projectPath: string, maxFiles: number = 15): { files: Array<{path: string; content: string}>; unreadable: number } {
  const result: Array<{path: string; content: string}> = [];
  let unreadable = 0;

  function traverse(dir: string, depth: number) {
    if (depth > 5 || result.length >= maxFiles) return;

    try {
      const items = fs.readdirSync(dir).sort();
      for (const item of items) {
        if (item.startsWith('.')) continue;
        if (result.length >= maxFiles) return;

        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!EXCLUDED_DIRS.includes(item)) {
            traverse(fullPath, depth + 1);
          }
        } else if (!isBinaryFile(item)) {
          const content = readFileContent(fullPath);
          if (content) {
            result.push({ path: path.relative(projectPath, fullPath), content });
          } else {
            unreadable++;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  traverse(projectPath, 0);
  return { files: result, unreadable };
}

interface FileModification {
  path: string;
  content: string;
  isDelete?: boolean;
  isNew?: boolean;
}

function extractFileModifications(response: string): FileModification[] {
  const modifications: FileModification[] = [];
  const seen = new Set<string>();

  const codeBlockRegex = /```[\s\S]*?```/g;
  const blocks = response.match(codeBlockRegex) || [];

  for (const block of blocks) {
    let inner = block.slice(3, -3);

    if (inner.toLowerCase().startsWith('delete')) {
      const filePath = inner.slice(6).trim();
      if (filePath && !seen.has(filePath)) {
        seen.add(filePath);
        modifications.push({ path: filePath, content: '', isDelete: true });
      }
      continue;
    }

    const lines = inner.split('\n');
    let firstLine = lines[0].trim();

    let filePath: string | null = null;
    let lang = '';

    const langFileMatch = firstLine.match(/^([a-zA-Z0-9]+)[\s:]+([^\s\n]+)$/);
    if (langFileMatch) {
      lang = langFileMatch[1];
      filePath = langFileMatch[2];
    }

    const filePrefixMatch = firstLine.match(/^(?:file|filename|filepath)[:\s]*([^\s\n]+)/i);
    if (filePrefixMatch) {
      filePath = filePrefixMatch[1];
      lang = '';
    }

    let content = '';
    if (filePath) {
      content = lines.slice(1).join('\n');
    } else if (lang) {
      content = lines.slice(1).join('\n');
    } else {
      content = inner;
    }

    content = content.trim();

    if (content && content.length > 0) {
      if (!filePath) {
        const langMap: Record<string, string> = {
          'js': 'js', 'javascript': 'js', 'ts': 'ts', 'typescript': 'ts',
          'jsx': 'jsx', 'tsx': 'tsx', 'py': 'py', 'python': 'py',
          'html': 'html', 'htm': 'html', 'css': 'css', 'scss': 'css', 'sass': 'css',
          'json': 'json', 'md': 'md', 'markdown': 'md', 'go': 'go', 'rs': 'rs',
          'rust': 'rs', 'java': 'java', 'cpp': 'cpp', 'c': 'c', 'h': 'h',
          'sh': 'sh', 'bash': 'sh', 'shell': 'sh', 'terminal': 'sh',
          'sql': 'sql', 'yaml': 'yaml', 'yml': 'yml', 'xml': 'xml', 'svg': 'svg',
          'vue': 'vue', 'rb': 'rb', 'ruby': 'rb', 'php': 'php', 'swift': 'swift',
          'kt': 'kt', 'kotlin': 'kt', 'cxx': 'cpp', 'hpp': 'hpp'
        };

        const ext = langMap[lang.toLowerCase()] || 'txt';
        filePath = 'main.' + ext;
      }

      if (!seen.has(filePath)) {
        seen.add(filePath);
        modifications.push({ path: filePath, content });
      }
    }
  }

  return modifications;
}

function extractCommands(response: string): string[] {
  const commands: string[] = [];
  const regex = /```(?:bash|shell|sh|command)?\s*\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(response)) !== null) {
    const content = match[1].trim();
    const lines = content.split('\n').filter(line => line.trim());
    commands.push(...lines);
  }
  return commands;
}

function getUniqueFilePath(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return filePath;
  }

  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);

  let counter = 1;
  let newPath;
  do {
    newPath = path.join(dir, `${base}_${counter}${ext}`);
    counter++;
  } while (fs.existsSync(newPath));

  return newPath;
}

async function applyModification(mod: FileModification, projectPath: string | null): Promise<boolean> {
  if (!mod.path) return false;

  try {
    let filePath = mod.path;
    if (projectPath) {
      if (path.isAbsolute(mod.path)) {
        filePath = mod.path;
      } else {
        filePath = path.join(projectPath, mod.path);
      }
    }

    if (mod.isDelete) {
      if (!fs.existsSync(filePath)) {
        process.stdout.write('\n' + YELLOW + '[File not found: ' + WHITE + filePath + YELLOW + ']' + RESET + '\n');
        return false;
      }

      process.stdout.write('\n' + RED + '[Confirm Delete?] ' + WHITE + filePath + RESET + '\n');
      process.stdout.write(YELLOW + '  > No  ' + RESET + '\n');
      process.stdout.write(DIM + '    Yes' + RESET + '\n');

      let selected = 0;
      const originalMode = (process.stdin as any).isRaw;

      return new Promise((resolve) => {
        const handleKey = (buf: Buffer) => {
          const key = buf.toString();
          if (key === '\x1b[B' || key === '\x1b[C') {
            selected = 1;
            process.stdout.write('\x1b[2A');
            process.stdout.write('\x1b[K');
            process.stdout.write(DIM + '    > ' + RESET + 'No  ' + RESET + '\n');
            process.stdout.write(GREEN + '  > Yes' + RESET + '\n');
          } else if (key === '\x1b[A' || key === '\x1b[D') {
            selected = 0;
            process.stdout.write('\x1b[2A');
            process.stdout.write('\x1b[K');
            process.stdout.write(YELLOW + '  > No  ' + RESET + '\n');
            process.stdout.write(DIM + '    Yes' + RESET + '\n');
          } else if (key === '\r' || key === '\n') {
            process.stdin.removeListener('data', handleKey);
            if (!originalMode) {
              (process.stdin as any).setRawMode?.(false);
            }

            process.stdout.write('\x1b[2A');
            process.stdout.write('\x1b[K');

            if (selected === 1) {
              fs.unlinkSync(filePath!);
              process.stdout.write('\n' + YELLOW + '[Deleted: ' + WHITE + filePath + YELLOW + ']' + RESET + '\n');
              resolve(true);
            } else {
              process.stdout.write('\n' + DIM + '[Cancelled]' + RESET + '\n');
              resolve(false);
            }
          } else if (key === '\x03' || key === '\x1b') {
            process.stdin.removeListener('data', handleKey);
            if (!originalMode) {
              (process.stdin as any).setRawMode?.(false);
            }
            process.stdout.write('\n' + DIM + '[Cancelled]' + RESET + '\n');
            resolve(false);
          }
        };

        (process.stdin as any).setRawMode?.(true);
        process.stdin.on('data', handleKey);
      });
    }

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const originalPath = filePath;
    filePath = getUniqueFilePath(filePath);
    mod.isNew = (filePath === originalPath);
    mod.path = path.relative(projectPath || '', filePath);

    fs.writeFileSync(filePath, mod.content);
    return true;
  } catch (error) {
    process.stdout.write('\n' + RED + '[Error: ' + mod.path + ' - ' + error + ']' + RESET + '\n');
    return false;
  }
}

function buildDeployContext(userPrompt: string, projectPath: string): string {
  const { files } = readAllProjectFiles(projectPath, 20);
  
  let projectFilesContext = '';
  if (files.length > 0) {
    projectFilesContext = '\n\n当前项目文件内容：\n';
    for (const file of files) {
      projectFilesContext += `\n=== ${file.path} ===\n${file.content}\n`;
    }
  }

  const context = '<system>\n' +
    '你是一个专业的项目部署工程师。你的任务是分析项目并完成完整部署。\n' +
    '部署流程：\n' +
    '1. 分析项目结构，识别项目类型（Node.js/Python/Java/Go等）\n' +
    '2. 检查环境要求（Node.js/Python版本等）\n' +
    '3. 安装依赖\n' +
    '4. 执行构建/编译\n' +
    '5. 运行项目并测试\n' +
    '6. 如果遇到错误，分析并修复，然后重试\n' +
    '7. 持续执行直到部署成功，除非遇到不可修复的错误\n' +
    '8. 部署成功后，提供详细的使用说明和启动命令\n' +
    '核心规则：\n' +
    '- 可以创建/修改/删除文件（删除需要用户确认）\n' +
    '- 执行命令用：```bash\n命令\n```\n' +
    '- 创建/修改文件用：```file:文件名\n内容\n```\n' +
    '- 每轮执行后总结当前状态，决定下一步\n' +
    '- 必须持续尝试直到部署成功\n' +
    '- 如果遇到不可修复的错误，清晰说明原因\n' +
    '- 部署成功后，给出完整的使用说明和启动命令\n' +
    '</system>\n\n' +
    '<user>\n' +
    '项目路径：' + projectPath + '\n' +
    '部署需求：' + userPrompt + projectFilesContext + '\n' +
    '请开始部署。\n' +
    '</user>';

  return context;
}

export async function startDeploy(deployPrompt: string, projectPath: string): Promise<void> {
  const provider = getProvider();
  const messages: Message[] = [];

  let currentResponse = '';
  let isStreaming = false;
  let shouldStop = false;

  const isRaw = (process.stdin as any).isRaw;
  if (!isRaw) {
    (process.stdin as any).setRawMode?.(true);
  }

  const cleanup = () => {
    if (!isRaw) {
      (process.stdin as any).setRawMode?.(false);
    }
    process.stdin.pause?.();
  };

  const escHandler = (buf: Buffer) => {
    const key = buf.toString();
    if (key === '\x1b' || key === '\x1b[') {
      shouldStop = true;
    }
  };
  process.stdin.on('data', escHandler);

  const printLine = (line: string) => {
    process.stdout.write(line + '\n');
  };

  console.log(CYAN + LOGO + RESET);
  console.log(DIM + 'Project: ' + WHITE + projectPath + RESET + '\n');

  const { files, dirs } = countFiles(projectPath);
  console.log(GRAY + 'Files: ' + WHITE + files + DIM + ' | Folders: ' + WHITE + dirs + RESET + '\n');

  let iteration = 0;
  const maxIterations = 30;
  let isFirstIteration = true;
  let deploySuccess = false;
  let finalInstructions = '';

  while (iteration < maxIterations && !deploySuccess) {
    iteration++;
    printLine(YELLOW + `\n=== 部署轮次 ${iteration}/${maxIterations} ===` + RESET);

    let fullPrompt = deployPrompt;
    if (isFirstIteration) {
      fullPrompt = buildDeployContext(deployPrompt, projectPath);
      isFirstIteration = false;
    }

    messages.push({ role: 'user', content: fullPrompt });

    printLine('');
    process.stdout.write(DIM + 'Analyzing' + RESET);

    currentResponse = '';
    isStreaming = true;
    shouldStop = false;
    let lastCleanLength = 0;

    try {
      const onChunk = (chunk: string): boolean => {
        if (shouldStop) {
          return false;
        }
        currentResponse += chunk;
        const clean = currentResponse.replace(/<think>[\s\S]*?<\/think>/gi, '');
        const newContent = clean.slice(lastCleanLength);
        lastCleanLength = clean.length;
        if (newContent) {
          process.stdout.write(newContent);
        }
        return !shouldStop;
      };

      const fullResponse = await provider.chatStream(messages, onChunk);

      let cleanResponse = fullResponse
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .trim();

      isStreaming = false;

      process.stdout.write('\r' + ' '.repeat(50) + '\r');
      process.stdout.write('\x1b[2K');

      const hasMoreWork = /(继续|接下来|然后|还需要|待|下一步)/i.test(cleanResponse) && 
                         !/(部署成功|部署完成|deploy.*success|deploy.*complete)/i.test(cleanResponse);
      
      deploySuccess = /(部署成功|部署完成|deploy.*success|deploy.*complete)/i.test(cleanResponse) && 
                     !/(继续|接下来|还有)/i.test(cleanResponse);

      if (deploySuccess) {
        finalInstructions = cleanResponse;
      }

      const modifications = extractFileModifications(cleanResponse);
      for (const mod of modifications) {
        await applyModification(mod, projectPath);
      }

      const commands = extractCommands(cleanResponse);
      let hasErrors = false;
      const commandOutputs: string[] = [];

      for (const cmd of commands) {
        try {
          printLine('\n' + GREEN + '[Running] ' + WHITE + cmd + RESET);
          const { stdout, stderr } = await execPromise(cmd, {
            cwd: projectPath,
            timeout: 300000
          });
          if (stdout) {
            printLine(DIM + stdout + RESET);
            commandOutputs.push(`Command: ${cmd}\nSTDOUT: ${stdout}`);
          }
          if (stderr) {
            printLine(YELLOW + stderr + RESET);
            commandOutputs.push(`Command: ${cmd}\nSTDERR: ${stderr}`);
            hasErrors = true;
          }
          printLine(GREEN + '[Done] ' + cmd + RESET);
        } catch (error: any) {
          printLine(RED + '[Error] ' + error.message + RESET);
          commandOutputs.push(`Command: ${cmd}\nERROR: ${error.message}`);
          hasErrors = true;
        }
      }

      messages.push({ role: 'assistant', content: cleanResponse });

      printLine('');
      if (modifications.length > 0) {
        for (const mod of modifications) {
          if (mod.isDelete) {
            printLine(RED + '[删除] ' + WHITE + mod.path + RESET);
          } else {
            const isNew = mod.isNew !== false;
            const color = isNew ? CYAN : YELLOW;
            const label = isNew ? '[新增]' : '[修改]';
            printLine(color + label + ' ' + WHITE + mod.path + RESET);
          }
        }
      }

      if (deploySuccess) {
        printLine(GREEN + '\n🎉 部署成功！' + RESET);
        printLine('\n' + BOLD + '使用说明：' + RESET);
        printLine(finalInstructions);
        break;
      }

      if (hasErrors || hasMoreWork) {
        let nextPrompt = '继续部署';
        if (commandOutputs.length > 0) {
          nextPrompt += '\n\n执行结果：\n' + commandOutputs.join('\n\n');
        }
        if (hasErrors) {
          nextPrompt += '\n\n请分析错误并修复后继续。';
        }
        deployPrompt = nextPrompt;
        printLine(YELLOW + '\n继续部署...' + RESET);
        continue;
      }

      break;

    } catch (error) {
      isStreaming = false;
      process.stdout.write('\n');
      printLine(RED + 'Error: ' + error + RESET + '\n');
      messages.pop();
      break;
    }
  }

  if (iteration >= maxIterations && !deploySuccess) {
    printLine(YELLOW + '\n⚠️ 已达到最大部署轮次，请手动检查。' + RESET);
  }

  process.stdin.removeListener('data', escHandler);
  cleanup();
}

export function createDeployCommand(): Command {
  const command = new Command('deploy');

  command
    .description('自动部署项目')
    .option('-p, --project <path>', '项目文件夹路径')
    .action(async (options) => {
      if (!configStore.isConfigured()) {
        logger.error('尚未配置 API Key，请先运行 "xiaoluo config" 进行配置');
        process.exit(1);
      }

      let projectPath = options.project || process.cwd();
      
      if (!fs.existsSync(projectPath) || !fs.statSync(projectPath).isDirectory()) {
        logger.error('项目路径无效或不存在');
        process.exit(1);
      }

      projectPath = path.resolve(projectPath);

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question(GREEN + '请描述部署需求（直接回车使用默认部署）：' + RESET, async (answer) => {
        rl.close();
        const deployPrompt = answer.trim() || '分析项目并完成完整部署';
        await startDeploy(deployPrompt, projectPath);
      });
    });

  return command;
}
