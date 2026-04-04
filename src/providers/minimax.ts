import { AIProvider, Message, ChatOptions, CompleteOptions, ProviderInfo, StreamCallback } from './base';

interface MiniMaxResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const PROVIDER_INFO: ProviderInfo = {
  id: 'minimax',
  name: 'MiniMax',
  models: [
    // ========== MiniMax Text 系列 (新一代) ==========
    'MiniMax-Text-01',                    // 新一代基座模型，支持超长上下文
    'MiniMax-Text-01-2025-04-15',        // Text-01 指定版本

    // ========== ABAB Chat 系列 ==========
    'abab6.5s-chat',                     // 增强版Chat模型
    'abab6.5-chat',                       // 标准Chat模型
    'abab5.5-chat',                       // 上一代Chat模型
    'abab5-chat',                         // 更早版本Chat模型

    // ========== MiniMax M 系列 (推理模型) ==========
    'MiniMax-M1',                         // 推理模型 M1
    'MiniMax-M2',                         // 推理模型 M2
    'MiniMax-M2B',                        // 推理模型 M2B

    // ========== 嵌入模型 (仅供参考，不用于对话) ==========
    // 'embo-01',                         # 嵌入模型，不支持chat
  ],
  requiresBaseUrl: true,
  defaultModel: 'MiniMax-Text-01',
};

// MiniMax API 地址
export const MINIMAX_CHINA_BASE_URL = 'https://api.minimax.chat/v1';
export const MINIMAX_GLOBAL_BASE_URL = 'https://api.minimax.io/v1';

export class MiniMaxProvider implements AIProvider {
  name = 'minimax';
  displayName = 'MiniMax';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || PROVIDER_INFO.defaultModel;
    let baseUrl = configStore.get('baseUrl');

    if (!baseUrl) {
      // 默认使用中国版
      baseUrl = MINIMAX_CHINA_BASE_URL;
    }

    const response = await fetch(`${baseUrl}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MiniMax API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as MiniMaxResponse;
    if (!data.choices || !data.choices[0]) {
      throw new Error(`MiniMax API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.choices[0].message.content;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    // MiniMax 不支持流式，先获取完整响应再分块发送
    const fullResponse = await this.chat(messages, options);
    // 模拟流式输出，每30ms发送一个字符
    for (const char of fullResponse) {
      const shouldContinue = onChunk(char);
      if (shouldContinue === false) break;
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    return fullResponse;
  }

  async complete(prompt: string, options?: CompleteOptions): Promise<string> {
    const messages: Message[] = [
      { role: 'user', content: prompt },
    ];
    return this.chat(messages, options);
  }

  async listModels(): Promise<string[]> {
    return PROVIDER_INFO.models;
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    const url = (baseUrl || MINIMAX_CHINA_BASE_URL) + '/text/chatcompletion_v2';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: PROVIDER_INFO.defaultModel,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 1,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export { PROVIDER_INFO as minimaxInfo };
