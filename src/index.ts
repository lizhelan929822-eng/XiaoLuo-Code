#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createConfigCommand } from './commands/config';
import { createChatCommand } from './commands/chat';
import { createCompleteCommand } from './commands/complete';
import { createReplCommand } from './commands/repl';
import { createStopCommand } from './commands/stop';
import { configStore } from './config/store';
import { logger } from './utils/logger';

const program = new Command();

program
  .name('xiaoluo')
  .description('XiaoLuo Code - 命令行 AI 编程助手')
  .version('1.0.0');

// Register commands
program.addCommand(createConfigCommand());
program.addCommand(createChatCommand());
program.addCommand(createCompleteCommand());
program.addCommand(createReplCommand());
program.addCommand(createStopCommand());

// Handle errors
program.on('commandError', (err) => {
  logger.error(err.message);
  process.exit(1);
});

// Parse arguments first to check if it's empty
const args = process.argv.slice(2);

// If no arguments provided, check config and start repl
if (args.length === 0) {
  if (!configStore.isConfigured()) {
    logger.error('尚未配置 API Key，请先运行 "xiaoluo config" 进行配置');
    console.log('\n运行 "xiaoluo config" 进行配置\n');
    process.exit(1);
  }

  // Inject 'repl' command and re-parse
  process.argv.push('repl');
  program.parse(process.argv);
} else {
  program.parse();
}
