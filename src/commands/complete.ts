import { Command } from 'commander';
import { configStore } from '../config/store';
import { getProvider } from '../providers';
import { logger } from '../utils/logger';

export function createCompleteCommand(): Command {
  const command = new Command('complete');

  command
    .description('代码补全')
    .argument('<prompt>', '代码补全描述或前缀')
    .option('-l, --language <lang>', '指定编程语言')
    .option('-t, --temperature <num>', '创造性温度', parseFloat)
    .action(async (prompt, options) => {
      if (!configStore.isConfigured()) {
        logger.error('尚未配置 API Key，请先运行 "xiaoluo config" 进行配置');
        process.exit(1);
      }

      const provider = getProvider();

      // Enhance prompt for code completion
      let enhancedPrompt = prompt;
      if (options.language) {
        enhancedPrompt = `请用 ${options.language} 语言完成以下代码:\n\n${prompt}`;
      } else {
        enhancedPrompt = `请完成以下代码:\n\n${prompt}`;
      }

      try {
        logger.info('正在生成代码补全...');

        const options2: any = {};
        if (options.temperature !== undefined) {
          options2.temperature = options.temperature;
        }

        const response = await provider.complete(enhancedPrompt, options2);
        console.log('\n📝 代码补全:\n');
        console.log(response);
        console.log('');
      } catch (error) {
        logger.error(`代码补全失败: ${error}`);
        process.exit(1);
      }
    });

  return command;
}
