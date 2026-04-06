#!/usr/bin/env node

import { main } from './main';

// 启动 XiaoLuo Code 主程序
main().catch((error) => {
  console.error('启动失败:', error);
  process.exit(1);
});
