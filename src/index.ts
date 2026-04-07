#!/usr/bin/env node

// 主入口文件
import { main } from './main.tsx';

// 启动应用
main().catch((error) => {
  console.error('启动失败:', error);
  process.exit(1);
});
