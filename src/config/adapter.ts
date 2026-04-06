import { configStore } from './store';
import type { AppConfig } from './store';

/**
 * 配置适配器，将 XiaoLuo Code 的多模型配置系统适配到 claude-code-sourcemap
 */
export class ConfigAdapter {
  private static instance: ConfigAdapter;

  private constructor() {}

  static getInstance(): ConfigAdapter {
    if (!ConfigAdapter.instance) {
      ConfigAdapter.instance = new ConfigAdapter();
    }
    return ConfigAdapter.instance;
  }

  /**
   * 获取当前配置
   */
  getConfig(): AppConfig {
    return configStore.getAll();
  }

  /**
   * 获取API Key
   */
  getApiKey(): string {
    return configStore.get('apiKey');
  }

  /**
   * 获取模型名称
   */
  getModel(): string {
    return configStore.get('model');
  }

  /**
   * 获取提供商
   */
  getProvider(): string {
    return configStore.get('provider');
  }

  /**
   * 获取API基础URL
   */
  getBaseUrl(): string {
    return configStore.get('baseUrl');
  }

  /**
   * 获取温度设置
   */
  getTemperature(): number {
    return configStore.get('temperature');
  }

  /**
   * 获取最大令牌数
   */
  getMaxTokens(): number {
    return configStore.get('maxTokens');
  }

  /**
   * 检查是否已配置
   */
  isConfigured(): boolean {
    return configStore.isConfigured();
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<AppConfig>): void {
    configStore.setAll(config);
  }

  /**
   * 获取配置文件路径
   */
  getConfigPath(): string {
    return configStore.getConfigPath();
  }
}

export const configAdapter = ConfigAdapter.getInstance();
