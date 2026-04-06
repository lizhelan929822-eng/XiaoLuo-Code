import { AIProvider, Message, ChatOptions, CompleteOptions, ProviderInfo, StreamCallback } from './base';

// 零一万物 提供商 - 完整实现
export class ZeroOneProvider implements AIProvider {
  name = 'zeroone';
  displayName = 'ZeroOne';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || 'yi-1.5';
    const baseUrl = configStore.get('baseUrl') || 'https://api.01.ai/v1';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ZeroOne API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error(`ZeroOne API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.choices[0].message.content;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || 'yi-1.5';
    const baseUrl = configStore.get('baseUrl') || 'https://api.01.ai/v1';

    const controller = new AbortController();
    if (options?.abortSignal) {
      options.abortSignal.addEventListener('abort', () => controller.abort());
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ZeroOne API error: ${response.status} - ${error}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                const shouldContinue = onChunk(content);
                if (shouldContinue === false) {
                  controller.abort();
                  return fullContent;
                }
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullContent;
  }

  async complete(prompt: string, options?: CompleteOptions): Promise<string> {
    const messages: Message[] = [
      { role: 'user', content: prompt },
    ];
    return this.chat(messages, options);
  }

  async listModels(): Promise<string[]> {
    return [
      'yi-1.5',
      'yi-large',
      'yi-34b',
      'yi-6b',
    ];
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://api.01.ai/v1') + '/models';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// 商汤科技 (SenseNova) 提供商
export class SenseNovaProvider implements AIProvider {
  name = 'sensenova';
  displayName = 'SenseNova';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || 'sensenova-5.0';
    const baseUrl = configStore.get('baseUrl') || 'https://api.sensenova.cn/v1';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SenseNova API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error(`SenseNova API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.choices[0].message.content;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || 'sensenova-5.0';
    const baseUrl = configStore.get('baseUrl') || 'https://api.sensenova.cn/v1';

    const controller = new AbortController();
    if (options?.abortSignal) {
      options.abortSignal.addEventListener('abort', () => controller.abort());
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SenseNova API error: ${response.status} - ${error}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                const shouldContinue = onChunk(content);
                if (shouldContinue === false) {
                  controller.abort();
                  return fullContent;
                }
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullContent;
  }

  async complete(prompt: string, options?: CompleteOptions): Promise<string> {
    const messages: Message[] = [
      { role: 'user', content: prompt },
    ];
    return this.chat(messages, options);
  }

  async listModels(): Promise<string[]> {
    return [
      'sensenova-5.0',
      'sensenova-4.0',
    ];
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://api.sensenova.cn/v1') + '/models';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// 提供商信息
export const providerInfos = {
  zeroone: {
    id: 'zeroone',
    name: 'ZeroOne',
    models: [
      'yi-1.5',
      'yi-large',
      'yi-34b',
      'yi-6b',
    ],
    requiresBaseUrl: true,
    defaultModel: 'yi-1.5',
  },
  sensenova: {
    id: 'sensenova',
    name: 'SenseNova',
    models: [
      'sensenova-5.0',
      'sensenova-4.0',
    ],
    requiresBaseUrl: true,
    defaultModel: 'sensenova-5.0',
  },
};
