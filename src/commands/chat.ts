import { Command } from 'commander';
import readline from 'readline';
import { configStore } from '../config/store';
import { getProvider } from '../providers';
import { logger } from '../utils/logger';
import { Message } from '../providers/base';

export function createChatCommand(): Command {
  const command = new Command('chat');

  command
    .description('与 AI 对话')
    .argument('[message]', '要发送的消息')
    .option('-s, --system <text>', '系统提示词')
    .action(async (message, options) => {
      if (!configStore.isConfigured()) {
        logger.error('尚未配置 API Key，请先运行 "xiaoluo config" 进行配置');
        process.exit(1);
      }

      const provider = getProvider();
      const messages: Message[] = [];

      if (options.system) {
        messages.push({ role: 'system', content: options.system });
      }

      if (message) {
        messages.push({ role: 'user', content: message });
        await chatOnce(provider, messages);
      } else {
        // Interactive mode
        await chatInteractive(provider, messages);
      }
    });

  return command;
}

async function chatOnce(provider: any, messages: Message[]): Promise<void> {
  try {
    logger.info('AI 正在思考...');
    const response = await provider.chat(messages);
    console.log('\n🤖 ' + response + '\n');
  } catch (error) {
    logger.error(`对话失败: ${error}`);
    process.exit(1);
  }
}

async function chatInteractive(provider: any, messages: Message[]): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n💬 XiaoLuo Code 交互式对话 (输入 "exit" 或 "quit" 退出)\n');

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  while (true) {
    const input = await question('👤 ');

    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log('\n👋 再见!\n');
      rl.close();
      break;
    }

    if (!input.trim()) continue;

    messages.push({ role: 'user', content: input });

    try {
      logger.info('AI 正在思考...');
      const response = await provider.chat(messages);
      messages.push({ role: 'assistant', content: response });
      console.log('\n🤖 ' + response + '\n');
    } catch (error) {
      logger.error(`对话失败: ${error}`);
    }
  }
}
