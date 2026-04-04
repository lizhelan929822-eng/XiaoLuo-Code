import { AIProvider, ProviderInfo } from './base';
import { OpenAIProvider, openAIInfo } from './openai';
import { AnthropicProvider, anthropicInfo } from './anthropic';
import { MiniMaxProvider, minimaxInfo } from './minimax';
import { GoogleProvider, googleInfo } from './google';
import { AliyunProvider, aliyunInfo } from './aliyun';
import { SiliconFlowProvider, siliconFlowInfo } from './siliconflow';
import { configStore } from '../config/store';

export { AIProvider, Message, ChatOptions, CompleteOptions, ProviderInfo, StreamCallback } from './base';

const providers: Record<string, { instance: AIProvider; info: ProviderInfo }> = {
  openai: { instance: new OpenAIProvider(), info: openAIInfo },
  anthropic: { instance: new AnthropicProvider(), info: anthropicInfo },
  minimax: { instance: new MiniMaxProvider(), info: minimaxInfo },
  google: { instance: new GoogleProvider(), info: googleInfo },
  aliyun: { instance: new AliyunProvider(), info: aliyunInfo },
  siliconflow: { instance: new SiliconFlowProvider(), info: siliconFlowInfo },
};

export const providerList: ProviderInfo[] = Object.values(providers).map(p => p.info);

export function getProvider(name?: string): AIProvider {
  const providerName = name || configStore.get('provider');
  const provider = providers[providerName];
  if (!provider) {
    throw new Error(`Provider '${providerName}' not found. Available providers: ${Object.keys(providers).join(', ')}`);
  }
  return provider.instance;
}

export function getProviderInfo(name?: string): ProviderInfo {
  const providerName = name || configStore.get('provider');
  const provider = providers[providerName];
  if (!provider) {
    throw new Error(`Provider '${providerName}' not found`);
  }
  return provider.info;
}

export async function validateProviderConfig(provider: string, apiKey: string, baseUrl?: string): Promise<boolean> {
  const p = providers[provider];
  if (!p) return false;
  return p.instance.validateKey(apiKey, baseUrl);
}
