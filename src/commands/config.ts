import { Command } from 'commander';
import { GatewayServer } from '../gateway/server';
import { configStore } from '../config/store';
import { logger } from '../utils/logger';
import { getProviderInfo } from '../providers';

export function createConfigCommand(): Command {
  const command = new Command('config');

  command
    .description('配置 XiaoLuo Code')
    .option('-s, --show', '显示当前配置')
    .option('-p, --provider <name>', '设置 AI 服务商')
    .option('-k, --key <key>', '设置 API Key')
    .option('-m, --model <model>', '设置模型')
    .action(async (options) => {
      if (options.show) {
        showCurrentConfig();
      } else if (options.key || options.provider || options.model) {
        await updateConfig(options);
      } else {
        // Open gateway for full configuration
        await openGateway();
      }
    });

  return command;
}

function showCurrentConfig(): void {
  const config = configStore.getAll();

  console.log('\n📋 当前配置:\n');
  console.log(`  服务商: ${config.provider}`);
  console.log(`  模型: ${config.model}`);
  console.log(`  API Key: ${config.apiKey ? config.apiKey.substring(0, 4) + '...' + config.apiKey.substring(config.apiKey.length - 4) : '未设置'}`);
  console.log(`  Base URL: ${config.baseUrl || '使用默认'}`);
  console.log(`  Temperature: ${config.temperature}`);
  console.log(`  Max Tokens: ${config.maxTokens}`);
  console.log('');

  if (!configStore.isConfigured()) {
    console.log('⚠️ 尚未配置 API Key，请运行 "xiaoluo config" 进行配置\n');
  }
}

async function updateConfig(options: any): Promise<void> {
  if (options.provider) {
    configStore.set('provider', options.provider);
    try {
      const info = getProviderInfo(options.provider);
      configStore.set('model', info.defaultModel);
      logger.success(`已设置服务商: ${info.name}`);
    } catch (error) {
      logger.error(`无效的服务商: ${options.provider}`);
      return;
    }
  }

  if (options.key) {
    configStore.set('apiKey', options.key);
    logger.success('已设置 API Key');
  }

  if (options.model) {
    configStore.set('model', options.model);
    logger.success(`已设置模型: ${options.model}`);
  }

  logger.info('配置已更新。运行 "xiaoluo config --show" 查看当前配置');
}

async function openGateway(): Promise<void> {
  if (!configStore.isConfigured()) {
    logger.info('首次启动配置向导...');
  } else {
    logger.info('打开配置页面...');
  }

  const server = new GatewayServer();
  await server.start();

  // Keep process running
  process.on('SIGINT', () => {
    server.stop();
    process.exit(0);
  });
}
