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
 ║           XiaoLuo Code              ║
 ╚══════════════════════════════════════╝`;

// ANSI Colors
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const WHITE = '\x1b[37m';
const GRAY = '\x1b[90m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';

// 排除的目录
const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.cache', '.tmp', '.next', '.nuxt', 'vendor', 'target'];

// 二进制文件扩展名
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

function getFileTree(dir: string, depth: number, maxDepth: number): string[] {
  const result: string[] = [];
  if (depth > maxDepth) return result;

  try {
    const items = fs.readdirSync(dir).sort();
    for (const item of items) {
      if (item.startsWith('.')) continue;
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!EXCLUDED_DIRS.includes(item)) {
          result.push('  '.repeat(depth) + '[DIR] ' + item);
          result.push(...getFileTree(fullPath, depth + 1, maxDepth));
        }
      } else {
        const icon = isBinaryFile(item) ? '[BINARY]' : '[FILE]';
        result.push('  '.repeat(depth) + icon + ' ' + item);
      }
    }
  } catch {
    // ignore
  }
  return result;
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

function readAllProjectFiles(projectPath: string, maxFiles: number = 12): { files: Array<{path: string; content: string}>; unreadable: number } {
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

export function createReplCommand(): Command {
  const command = new Command('repl');

  command
    .description('启动交互式编程对话界面')
    .option('-p, --project <path>', '设置项目文件夹路径')
    .action(async (options) => {
      if (!configStore.isConfigured()) {
        logger.error('尚未配置 API Key，请先运行 "xiaoluo config" 进行配置');
        process.exit(1);
      }

      const projectPath = options.project || null;

      await startRepl(projectPath);
    });

  return command;
}

function printHeader(provider: string, model: string): void {
  console.log(CYAN + LOGO + RESET);
  console.log(DIM + 'Provider: ' + WHITE + provider + DIM + ' | Model: ' + WHITE + model + RESET + '\n');
}

function analyzeAndPrintProject(projectPath: string): void {
  try {
    const stat = fs.statSync(projectPath);
    if (!stat.isDirectory()) return;

    const { files, dirs } = countFiles(projectPath);
    const tree = getFileTree(projectPath, 0, 4);

    console.log(GRAY + 'Project: ' + WHITE + projectPath + RESET);
    console.log(GRAY + 'Files: ' + WHITE + files + DIM + ' | Folders: ' + WHITE + dirs + RESET + '\n');
    console.log(DIM + '--- File Tree ---' + RESET);
    tree.slice(0, 35).forEach(line => console.log('  ' + DIM + line + RESET));
    if (tree.length > 35) console.log('  ' + DIM + '... (' + (tree.length - 35) + ' more)' + RESET);
    console.log('');
  } catch {
    // ignore
  }
}

export async function startRepl(projectPath: string | null): Promise<void> {
  const provider = getProvider();
  const messages: Message[] = [];

  let currentResponse = '';
  let isStreaming = false;
  let shouldStop = false;

  // 设置终端为原始模式以捕获ESC键
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

  // 监听ESC键停止流式输出
  const escHandler = (buf: Buffer) => {
    const key = buf.toString();
    if (key === '\x1b' || key === '\x1b[') {
      // ESC按下
      shouldStop = true;
    }
  };
  process.stdin.on('data', escHandler);

  const printPrompt = () => {
    process.stdout.write('\x1b[2J\x1b[H');
    process.stdout.write(CYAN + LOGO + RESET + '\n');
    process.stdout.write(DIM + 'Provider: ' + WHITE + configStore.get('provider') + DIM + ' | Model: ' + WHITE + configStore.get('model') + RESET + '\n');
    if (projectPath) {
      process.stdout.write(DIM + 'Project: ' + WHITE + projectPath + RESET + '\n');
    }
    process.stdout.write('\n');
  };

  const printLine = (line: string) => {
    process.stdout.write(line + '\n');
  };

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(GREEN + '\n> ' + RESET, resolve);
    });
  };

  // 自主执行任务的函数
  const executeTask = async (userPrompt: string): Promise<void> => {
    let iteration = 0;
    const maxIterations = 5; // 减少最大轮次到5次
    let isFirstIteration = true;

    while (iteration < maxIterations) {
      iteration++;
      printLine(YELLOW + `\n=== 执行轮次 ${iteration}/${maxIterations} ===` + RESET);

      // 只有第一轮构建项目上下文，后续轮次直接使用对话历史
      let fullPrompt = userPrompt;
      if (isFirstIteration && projectPath) {
        fullPrompt = buildProjectContext(userPrompt, projectPath);
        isFirstIteration = false;
      }

      messages.push({ role: 'user', content: fullPrompt });

      printLine('');
      process.stdout.write(DIM + 'Thinking' + RESET);

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

        // 改进任务完成检测 - 检查是否有更多代码/命令要执行
        const hasMoreWork = /(继续|接下来|然后|还需要|待|下一步)/i.test(cleanResponse) && 
                           !/(完成|done|complete|成功|finish)/i.test(cleanResponse);
        
        // 检查是否只是说明性文字，没有更多代码操作
        const isJustSummary = !extractFileModifications(cleanResponse).length && 
                             !extractCommands(cleanResponse).length && 
                             /(完成|done|complete|成功|finish|总结|摘要)/i.test(cleanResponse);

        // 先处理文件操作
        const modifications = extractFileModifications(cleanResponse);
        for (const mod of modifications) {
          await applyModification(mod, projectPath);
        }

        // 执行命令
        const commands = extractCommands(cleanResponse);
        let hasErrors = false;
        const commandOutputs: string[] = [];

        for (const cmd of commands) {
          try {
            printLine('\n' + GREEN + '[Running] ' + WHITE + cmd + RESET);
            const { stdout, stderr } = await execPromise(cmd, {
              cwd: projectPath || process.cwd(),
              timeout: 120000
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

        // 打印执行摘要
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

        // 只有确实需要继续时才执行下一轮
        if (hasErrors || hasMoreWork) {
          let nextPrompt = '继续执行';
          if (commandOutputs.length > 0) {
            nextPrompt += '\n\n执行结果：\n' + commandOutputs.join('\n\n');
          }
          if (hasErrors) {
            nextPrompt += '\n\n请修复错误。';
          }
          userPrompt = nextPrompt;
          printLine(YELLOW + '\n继续执行...' + RESET);
          continue;
        }

        // 任务完成
        printLine(GREEN + '\n✅ 任务完成！' + RESET);
        break;

      } catch (error) {
        isStreaming = false;
        process.stdout.write('\n');
        printLine(RED + 'Error: ' + error + RESET + '\n');
        messages.pop();
        break;
      }
    }

    if (iteration >= maxIterations) {
      printLine(YELLOW + '\n⚠️ 已达到最大执行轮次，请手动检查结果。' + RESET);
    }
  };

  printPrompt();

  while (true) {
    const input = await question();

    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      cleanup();
      printLine('\n' + CYAN + 'Goodbye!' + RESET + '\n');
      rl.close();
      break;
    }

    if (input.toLowerCase() === 'clear') {
      currentResponse = '';
      printPrompt();
      continue;
    }

    const trimmedInput = input.trim();
    if (!trimmedInput) continue;

    // 处理Windows拖放时的引号
    let processedInput = trimmedInput;
    if (processedInput.startsWith('"') && processedInput.endsWith('"')) {
      processedInput = processedInput.substring(1, processedInput.length - 1);
    }
    if (processedInput.startsWith("'") && processedInput.endsWith("'")) {
      processedInput = processedInput.substring(1, processedInput.length - 1);
    }

    // 检查是否是切换项目文件夹
    if (fs.existsSync(processedInput) && fs.statSync(processedInput).isDirectory()) {
      projectPath = processedInput;
      printLine(DIM + '\nSwitching project to: ' + WHITE + processedInput + RESET);
      const { files, dirs } = countFiles(processedInput);
      if (files > 0 || dirs > 0) {
        analyzeAndPrintProject(processedInput);
      } else {
        printLine(DIM + '(Empty folder)' + RESET);
      }
      continue;
    }
    
    // 检查是否是文件拖放
    if (fs.existsSync(processedInput) && fs.statSync(processedInput).isFile()) {
      if (!projectPath) {
        projectPath = path.dirname(processedInput);
        printLine(DIM + '\nSwitching project to: ' + WHITE + projectPath + RESET);
        analyzeAndPrintProject(projectPath);
      }
    }
    
    // 必须先选择项目文件夹才能对话
    if (!projectPath) {
      printLine(RED + '\n⚠️ 请先选择项目文件夹！' + RESET);
      printLine(DIM + '  将文件夹拖入终端即可添加项目' + RESET);
      printLine(DIM + '  或输入项目文件夹路径后按回车' + RESET + '\n');
      continue;
    }

    // 如果是文件拖放，添加文件内容到上下文
    let finalInput = input;
    if (fs.existsSync(processedInput) && fs.statSync(processedInput).isFile()) {
      const fileContent = readFileContent(processedInput);
      if (fileContent) {
        const fileName = path.basename(processedInput);
        printLine(DIM + '\n[File Dropped] ' + WHITE + fileName + RESET);
        finalInput += '\n\n[File Content]\n' + fileContent;
      }
    }

    // 开始自主执行任务
    await executeTask(finalInput);
  }

  process.stdin.removeListener('data', escHandler);
  cleanup();
}

function buildProjectContext(userInput: string, projectPath: string): string {
  // 智能编程助手 - 自主完成任务
  const context = '<system>\n' +
    '你是一个专业的自主编程助手，能够完成从需求到实现的完整任务。\n' +
    '核心规则：\n' +
    '1. 任务执行流程：理解需求 → 制定计划 → 编写代码 → 测试验证 → 修复问题 → 完成\n' +
    '2. 可以创建多个文件和文件夹\n' +
    '3. 如需删除文件，使用：```delete 文件路径\n```，系统会询问用户确认\n' +
    '4. 创建/修改文件格式：```file:文件名\n代码内容\n```\n' +
    '5. 执行测试/命令用：```bash\n命令\n```\n' +
    '6. 所有文件会自动保存到 ' + projectPath + '\n' +
    '7. 如果测试失败，分析错误并修复，重新测试直到成功\n' +
    '8. 自主执行整个流程，直到任务完成\n' +
    '9. 最后用一个简短的摘要说明任务完成情况\n' +
    '</system>\n\n' +
    '<user>' + userInput + '</user>';

  return context;
}

interface FileModification {
  path: string;
  content: string;
  isDelete?: boolean;
  isNew?: boolean; // 是否为新文件（不存在同名文件）
}

function extractFileModifications(response: string): FileModification[] {
  const modifications: FileModification[] = [];
  const seen = new Set<string>();

  // 匹配所有代码块 ```...内容...```
  const codeBlockRegex = /```[\s\S]*?```/g;
  const blocks = response.match(codeBlockRegex) || [];

  for (const block of blocks) {
    // 去掉前后 ```
    let inner = block.slice(3, -3);

    // 删除标记 ```delete path```
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

    // 检测是否有语言标识符和文件路径在同一行
    // 例如: ```html src/app.js 或 ```html:src/app.js
    let filePath: string | null = null;
    let lang = '';

    const langFileMatch = firstLine.match(/^([a-zA-Z0-9]+)[\s:]+([^\s\n]+)$/);
    if (langFileMatch) {
      lang = langFileMatch[1];
      filePath = langFileMatch[2];
    }

    // file:/filename:/filepath: 前缀 ```file:path\ncontent```
    const filePrefixMatch = firstLine.match(/^(?:file|filename|filepath)[:\s]*([^\s\n]+)/i);
    if (filePrefixMatch) {
      filePath = filePrefixMatch[1];
      lang = '';
    }

    // 计算内容：去掉第一行（语言/路径）
    let content = '';
    if (filePath) {
      // 去掉第一行，使用剩余内容
      content = lines.slice(1).join('\n');
    } else if (lang) {
      // 去掉第一行（语言标识符）
      content = lines.slice(1).join('\n');
    } else {
      // 没有明确的语言或路径，使用全部内容
      content = inner;
    }

    content = content.trim();

    // 只有有内容时才保存
    if (content && content.length > 0) {
      // 确定文件路径
      if (!filePath) {
        // 推断扩展名
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

// 提取要执行的命令
interface CommandModification {
  command: string;
}

export function extractCommands(response: string): string[] {
  const commands: string[] = [];

  // Pattern: ```bash\ncommand\n``` or ```shell\ncommand\n```
  const regex = /```(?:bash|shell|sh|command)?\s*\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(response)) !== null) {
    const content = match[1].trim();
    // 分割多行命令
    const lines = content.split('\n').filter(line => line.trim());
    commands.push(...lines);
  }

  return commands;
}

// 生成唯一的文件路径，如果文件已存在则添加数字后缀
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
    // 使用项目文件夹作为基准目录
    let filePath = mod.path;
    if (projectPath) {
      // 如果是绝对路径，直接使用
      if (path.isAbsolute(mod.path)) {
        filePath = mod.path;
      } else {
        // 相对路径，连接到项目文件夹
        filePath = path.join(projectPath, mod.path);
      }
    }

    // 处理删除操作 - 需要用户确认
    if (mod.isDelete) {
      if (!fs.existsSync(filePath)) {
        process.stdout.write('\n' + YELLOW + '[File not found: ' + WHITE + filePath + YELLOW + ']' + RESET + '\n');
        return false;
      }

      // 显示确认提示
      process.stdout.write('\n' + RED + '[Confirm Delete?] ' + WHITE + filePath + RESET + '\n');
      process.stdout.write(YELLOW + '  > No  ' + RESET + '\n');
      process.stdout.write(DIM + '    Yes' + RESET + '\n');

      let selected = 0; // 0 = No, 1 = Yes
      const originalMode = (process.stdin as any).isRaw;

      return new Promise((resolve) => {
        const handleKey = (buf: Buffer) => {
          const key = buf.toString();
          if (key === '\x1b[B' || key === '\x1b[C') { // 下/右箭头
            selected = 1;
            process.stdout.write('\x1b[2A'); // 往上移2行
            process.stdout.write('\x1b[K');
            process.stdout.write(DIM + '    > ' + RESET + 'No  ' + RESET + '\n');
            process.stdout.write(GREEN + '  > Yes' + RESET + '\n');
          } else if (key === '\x1b[A' || key === '\x1b[D') { // 上/左箭头
            selected = 0;
            process.stdout.write('\x1b[2A'); // 往上移2行
            process.stdout.write('\x1b[K');
            process.stdout.write(YELLOW + '  > No  ' + RESET + '\n');
            process.stdout.write(DIM + '    Yes' + RESET + '\n');
          } else if (key === '\r' || key === '\n') { // 回车确认
            process.stdin.removeListener('data', handleKey);
            if (!originalMode) {
              (process.stdin as any).setRawMode?.(false);
            }

            process.stdout.write('\x1b[2A'); // 移到开头
            process.stdout.write('\x1b[K');

            if (selected === 1) {
              fs.unlinkSync(filePath!);
              process.stdout.write('\n' + YELLOW + '[Deleted: ' + WHITE + filePath + YELLOW + ']' + RESET + '\n');
              resolve(true);
            } else {
              process.stdout.write('\n' + DIM + '[Cancelled]' + RESET + '\n');
              resolve(false);
            }
          } else if (key === '\x03' || key === '\x1b') { // Ctrl+C 或 ESC
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

    // 检查文件是否存在，如存在则生成新名字
    const originalPath = filePath;
    filePath = getUniqueFilePath(filePath);
    // 记录是否为新文件（路径没变说明原文件不存在）
    mod.isNew = (filePath === originalPath);
    // 更新mod.path为实际保存的路径（用于显示）
    mod.path = path.relative(projectPath || '', filePath);

    fs.writeFileSync(filePath, mod.content);
    return true;
  } catch (error) {
    process.stdout.write('\n' + RED + '[Error: ' + mod.path + ' - ' + error + ']' + RESET + '\n');
    return false;
  }
}
