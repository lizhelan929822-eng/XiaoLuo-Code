import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export interface AppConfig {
  version: string;
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

const defaultConfig: AppConfig = {
  version: '1.0.0',
  provider: 'minimax',
  apiKey: '',
  baseUrl: '',
  model: 'MiniMax-Text-01',
  temperature: 0.7,
  maxTokens: 4096,
};

class ConfigStore {
  private configDir: string;
  private configPath: string;

  constructor() {
    // 获取可执行文件所在目录（用于pkg打包后的可执行文件）
    // 开发模式下使用项目根目录
    const execPath = process.execPath || '';
    const isPacked = execPath.includes('app.asar') || !execPath.includes('node');

    if (isPacked) {
      // 打包后的可执行文件：放在可执行文件同级的user文件夹
      this.configDir = path.join(path.dirname(execPath), 'user');
    } else {
      // 开发模式：使用项目根目录下的user文件夹
      this.configDir = path.join(__dirname, '..', '..', 'user');
    }

    this.configPath = path.join(this.configDir, 'config.json');
  }

  private ensureConfigDir(): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  private loadConfig(): AppConfig {
    this.ensureConfigDir();
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        return { ...defaultConfig, ...JSON.parse(data) };
      }
    } catch (error) {
      logger.warn(`Failed to load config: ${error}`);
    }
    return { ...defaultConfig };
  }

  private saveConfig(config: AppConfig): void {
    this.ensureConfigDir();
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    const config = this.loadConfig();
    return config[key];
  }

  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    const config = this.loadConfig();
    config[key] = value;
    this.saveConfig(config);
  }

  getAll(): AppConfig {
    return this.loadConfig();
  }

  setAll(newConfig: Partial<AppConfig>): void {
    const config = this.loadConfig();
    Object.assign(config, newConfig);
    this.saveConfig(config);
  }

  isConfigured(): boolean {
    const config = this.loadConfig();
    return !!config.apiKey && config.apiKey.length > 0;
  }

  getConfigPath(): string {
    return this.configPath;
  }

  // 重置到初始状态
  reset(): void {
    if (fs.existsSync(this.configPath)) {
      fs.unlinkSync(this.configPath);
    }
    logger.info('配置已重置到初始状态');
  }
}

export const configStore = new ConfigStore();
