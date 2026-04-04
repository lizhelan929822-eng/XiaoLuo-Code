import { Command } from 'commander';

export function createStopCommand(): Command {
  const command = new Command('stop');

  command
    .description('关闭 XiaoLuo Code')
    .action(() => {
      console.log('👋 XiaoLuo Code 已关闭');
      process.exit(0);
    });

  return command;
}
