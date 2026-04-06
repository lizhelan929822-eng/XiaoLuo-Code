import { AIProvider, ProviderInfo } from './base';
import { OpenAIProvider, openAIInfo } from './openai';
import { AnthropicProvider, anthropicInfo } from './anthropic';
import { MiniMaxProvider, minimaxInfo } from './minimax';
import { GoogleProvider, googleInfo } from './google';
import { AliyunProvider, aliyunInfo } from './aliyun';
import { SiliconFlowProvider, siliconFlowInfo } from './siliconflow';

// 导入新的提供商
import { MetaProvider } from './other-providers';
import { MistralProvider } from './other-providers';
import { XAIProvider } from './other-providers';
import { ByteDanceProvider } from './other-providers';
import { BaiduProvider } from './other-providers';
import { ZhipuProvider } from './other-providers';
import { MoonshotProvider } from './other-providers';
import { DeepSeekProvider } from './other-providers';
import { IFlyTekProvider } from './other-providers';
import { TencentProvider } from './other-providers';
import { HuaweiProvider } from './other-providers';
import { BaichuanProvider } from './other-providers';
import { ZeroOneProvider, SenseNovaProvider } from './additional-providers';

import { configStore } from '../config/store';

export { AIProvider, Message, ChatOptions, CompleteOptions, ProviderInfo, StreamCallback } from './base';

const providers: Record<string, { instance: AIProvider; info: ProviderInfo }> = {
  openai: { instance: new OpenAIProvider(), info: openAIInfo },
  anthropic: { instance: new AnthropicProvider(), info: anthropicInfo },
  minimax: { instance: new MiniMaxProvider(), info: minimaxInfo },
  google: { instance: new GoogleProvider(), info: googleInfo },
  aliyun: { instance: new AliyunProvider(), info: aliyunInfo },
  siliconflow: { instance: new SiliconFlowProvider(), info: siliconFlowInfo },
  // 新添加的提供商
  meta: { 
    instance: new MetaProvider(), 
    info: {
      id: 'meta',
      name: 'Meta',
      models: [
        'llama-4-8b', 'llama-4-70b', 'llama-4-405b',
        'llama-3.3-8b', 'llama-3.3-70b', 'llama-3.3-405b',
        'llama-3.1-8b', 'llama-3.1-70b', 'llama-3.1-405b',
        'llama-3-8b', 'llama-3-70b',
        'llama-2-7b', 'llama-2-13b', 'llama-2-70b'
      ],
      requiresBaseUrl: true,
      defaultModel: 'llama-3.1-70b'
    }
  },
  mistral: { 
    instance: new MistralProvider(), 
    info: {
      id: 'mistral',
      name: 'Mistral AI',
      models: ['mistral-7b', 'mixtral-8x7b', 'mixtral-8x22b', 'mistral-large', 'mistral-large-2'],
      requiresBaseUrl: true,
      defaultModel: 'mistral-large-2'
    }
  },
  xai: { 
    instance: new XAIProvider(), 
    info: {
      id: 'xai',
      name: 'xAI',
      models: ['grok-3', 'grok-4.1', 'grok-4.2'],
      requiresBaseUrl: true,
      defaultModel: 'grok-4.2'
    }
  },
  bytedance: { 
    instance: new ByteDanceProvider(), 
    info: {
      id: 'bytedance',
      name: 'ByteDance',
      models: ['doubao-5.0', 'doubao-pro-4.0', 'doubao-4.0', 'doubao-lite', 'doubao-code'],
      requiresBaseUrl: true,
      defaultModel: 'doubao-5.0'
    }
  },
  baidu: { 
    instance: new BaiduProvider(), 
    info: {
      id: 'baidu',
      name: 'Baidu',
      models: ['ernie-5.0', 'ernie-4.5', 'ernie-4.0', 'ernie-3.5', 'ernie-4.5-vl'],
      requiresBaseUrl: true,
      defaultModel: 'ernie-4.5'
    }
  },
  zhipu: { 
    instance: new ZhipuProvider(), 
    info: {
      id: 'zhipu',
      name: 'Zhipu AI',
      models: ['glm-5', 'glm-5v', 'glm-4', 'glm-4v', 'zhipu-clear'],
      requiresBaseUrl: true,
      defaultModel: 'glm-5'
    }
  },
  moonshot: { 
    instance: new MoonshotProvider(), 
    info: {
      id: 'moonshot',
      name: 'Moonshot AI',
      models: ['kimi-2.5', 'kimi-2.0', 'kimi-1.8', 'kimi-k2'],
      requiresBaseUrl: true,
      defaultModel: 'kimi-2.5'
    }
  },
  deepseek: { 
    instance: new DeepSeekProvider(), 
    info: {
      id: 'deepseek',
      name: 'DeepSeek',
      models: ['deepseek-v4', 'deepseek-v3', 'deepseek-r1', 'deepseek-coder', 'deepseek-math'],
      requiresBaseUrl: true,
      defaultModel: 'deepseek-v4'
    }
  },
  iflytek: { 
    instance: new IFlyTekProvider(), 
    info: {
      id: 'iflytek',
      name: 'iFlyTek',
      models: ['spark-4.0', 'spark-3.5', 'spark-3.0'],
      requiresBaseUrl: true,
      defaultModel: 'spark-4.0'
    }
  },
  tencent: { 
    instance: new TencentProvider(), 
    info: {
      id: 'tencent',
      name: 'Tencent',
      models: ['hunyuan', 'hunyuan-text', 'hunyuan-multimodal', 'hunyuan-video'],
      requiresBaseUrl: true,
      defaultModel: 'hunyuan'
    }
  },
  huawei: { 
    instance: new HuaweiProvider(), 
    info: {
      id: 'huawei',
      name: 'Huawei',
      models: ['pangu-nlp', 'pangu-multimodal', 'pangu-science', 'pangu-weather'],
      requiresBaseUrl: true,
      defaultModel: 'pangu-nlp'
    }
  },
  baichuan: { 
    instance: new BaichuanProvider(), 
    info: {
      id: 'baichuan',
      name: 'Baichuan',
      models: ['baichuan-4.0-7b', 'baichuan-4.0-13b', 'baichuan-4.0-67b', 'baichuan-3', 'baichuan-2'],
      requiresBaseUrl: true,
      defaultModel: 'baichuan-4.0-13b'
    }
  },
  zeroone: { 
    instance: new ZeroOneProvider(), 
    info: {
      id: 'zeroone',
      name: 'ZeroOne',
      models: ['yi-1.5', 'yi-large', 'yi-34b', 'yi-6b'],
      requiresBaseUrl: true,
      defaultModel: 'yi-1.5'
    }
  },
  sensenova: { 
    instance: new SenseNovaProvider(), 
    info: {
      id: 'sensenova',
      name: 'SenseNova',
      models: ['sensenova-5.0', 'sensenova-4.0'],
      requiresBaseUrl: true,
      defaultModel: 'sensenova-5.0'
    }
  },
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
