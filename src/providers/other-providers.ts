import { AIProvider, Message, ChatOptions, CompleteOptions, ProviderInfo, StreamCallback } from './base';

// Meta (Llama) 提供商
const META_PROVIDER_INFO: ProviderInfo = {
  id: 'meta',
  name: 'Meta',
  models: [
    // Llama 4 系列
    'llama-4-8b',
    'llama-4-70b',
    'llama-4-405b',
    // Llama 3.3 系列
    'llama-3.3-8b',
    'llama-3.3-70b',
    'llama-3.3-405b',
    // Llama 3.1 系列
    'llama-3.1-8b',
    'llama-3.1-70b',
    'llama-3.1-405b',
    // Llama 3 系列
    'llama-3-8b',
    'llama-3-70b',
    // Llama 2 系列
    'llama-2-7b',
    'llama-2-13b',
    'llama-2-70b',
  ],
  requiresBaseUrl: true,
  defaultModel: 'llama-3.1-70b',
};

export class MetaProvider implements AIProvider {
  name = 'meta';
  displayName = 'Meta';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || META_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.meta.ai/v1';

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
      throw new Error(`Meta API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error(`Meta API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.choices[0].message.content;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || META_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.meta.ai/v1';

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
      throw new Error(`Meta API error: ${response.status} - ${error}`);
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
    return META_PROVIDER_INFO.models;
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://api.meta.ai/v1') + '/models';
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

// Mistral AI 提供商
const MISTRAL_PROVIDER_INFO: ProviderInfo = {
  id: 'mistral',
  name: 'Mistral AI',
  models: [
    'mistral-7b',
    'mixtral-8x7b',
    'mixtral-8x22b',
    'mistral-large',
    'mistral-large-2',
  ],
  requiresBaseUrl: true,
  defaultModel: 'mistral-large-2',
};

export class MistralProvider implements AIProvider {
  name = 'mistral';
  displayName = 'Mistral AI';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || MISTRAL_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.mistral.ai/v1';

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
      throw new Error(`Mistral AI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error(`Mistral AI API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.choices[0].message.content;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || MISTRAL_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.mistral.ai/v1';

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
      throw new Error(`Mistral AI API error: ${response.status} - ${error}`);
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
    return MISTRAL_PROVIDER_INFO.models;
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://api.mistral.ai/v1') + '/models';
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

// xAI (Grok) 提供商
const XAI_PROVIDER_INFO: ProviderInfo = {
  id: 'xai',
  name: 'xAI',
  models: [
    'grok-3',
    'grok-4.1',
    'grok-4.2',
  ],
  requiresBaseUrl: true,
  defaultModel: 'grok-4.2',
};

export class XAIProvider implements AIProvider {
  name = 'xai';
  displayName = 'xAI';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || XAI_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.x.ai/v1';

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
      throw new Error(`xAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error(`xAI API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.choices[0].message.content;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || XAI_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.x.ai/v1';

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
      throw new Error(`xAI API error: ${response.status} - ${error}`);
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
    return XAI_PROVIDER_INFO.models;
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://api.x.ai/v1') + '/models';
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

// 字节跳动 (豆包) 提供商
const BYTEDANCE_PROVIDER_INFO: ProviderInfo = {
  id: 'bytedance',
  name: 'ByteDance',
  models: [
    'doubao-5.0',
    'doubao-pro-4.0',
    'doubao-4.0',
    'doubao-lite',
    'doubao-code',
  ],
  requiresBaseUrl: true,
  defaultModel: 'doubao-5.0',
};

export class ByteDanceProvider implements AIProvider {
  name = 'bytedance';
  displayName = 'ByteDance';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || BYTEDANCE_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://ark.cn-beijing.volces.com/api/v3';

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
      throw new Error(`ByteDance API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error(`ByteDance API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.choices[0].message.content;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || BYTEDANCE_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://ark.cn-beijing.volces.com/api/v3';

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
      throw new Error(`ByteDance API error: ${response.status} - ${error}`);
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
    return BYTEDANCE_PROVIDER_INFO.models;
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://ark.cn-beijing.volces.com/api/v3') + '/models';
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

// 百度 (文心一言) 提供商
const BAIDU_PROVIDER_INFO: ProviderInfo = {
  id: 'baidu',
  name: 'Baidu',
  models: [
    'ernie-5.0',
    'ernie-4.5',
    'ernie-4.0',
    'ernie-3.5',
    'ernie-4.5-vl',
  ],
  requiresBaseUrl: true,
  defaultModel: 'ernie-4.5',
};

export class BaiduProvider implements AIProvider {
  name = 'baidu';
  displayName = 'Baidu';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || BAIDU_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat';

    // 百度 API 需要特定格式
    const messagesFormat = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const response = await fetch(`${baseUrl}/${model}?access_token=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messagesFormat,
        temperature: options?.temperature ?? 0.7,
        max_output_tokens: options?.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Baidu API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (!data.result) {
      throw new Error(`Baidu API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.result;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    const fullResponse = await this.chat(messages, options);
    for (const char of fullResponse) {
      const shouldContinue = onChunk(char);
      if (shouldContinue === false) break;
      await new Promise(resolve => setTimeout(resolve, 3));
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
    return BAIDU_PROVIDER_INFO.models;
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      // 百度 API 验证需要获取 access token
      const response = await fetch(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey.split(':')[0]}&client_secret=${apiKey.split(':')[1]}`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// 智谱 AI 提供商
const ZHIPU_PROVIDER_INFO: ProviderInfo = {
  id: 'zhipu',
  name: 'Zhipu AI',
  models: [
    'glm-5',
    'glm-5v',
    'glm-4',
    'glm-4v',
    'zhipu-clear',
  ],
  requiresBaseUrl: true,
  defaultModel: 'glm-5',
};

export class ZhipuProvider implements AIProvider {
  name = 'zhipu';
  displayName = 'Zhipu AI';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || ZHIPU_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://open.bigmodel.cn/api/mt/v1';

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
      throw new Error(`Zhipu AI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error(`Zhipu AI API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.choices[0].message.content;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || ZHIPU_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://open.bigmodel.cn/api/mt/v1';

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
      throw new Error(`Zhipu AI API error: ${response.status} - ${error}`);
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
    return ZHIPU_PROVIDER_INFO.models;
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://open.bigmodel.cn/api/mt/v1') + '/models';
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

// 月之暗面 (Moonshot AI) 提供商
const MOONSHOT_PROVIDER_INFO: ProviderInfo = {
  id: 'moonshot',
  name: 'Moonshot AI',
  models: [
    'kimi-2.5',
    'kimi-2.0',
    'kimi-1.8',
    'kimi-k2',
  ],
  requiresBaseUrl: true,
  defaultModel: 'kimi-2.5',
};

export class MoonshotProvider implements AIProvider {
  name = 'moonshot';
  displayName = 'Moonshot AI';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || MOONSHOT_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.moonshot.cn/v1';

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
      throw new Error(`Moonshot AI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error(`Moonshot AI API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.choices[0].message.content;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || MOONSHOT_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.moonshot.cn/v1';

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
      throw new Error(`Moonshot AI API error: ${response.status} - ${error}`);
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
    return MOONSHOT_PROVIDER_INFO.models;
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://api.moonshot.cn/v1') + '/models';
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

// 深度求索 (DeepSeek) 提供商
const DEEPSEEK_PROVIDER_INFO: ProviderInfo = {
  id: 'deepseek',
  name: 'DeepSeek',
  models: [
    'deepseek-v4',
    'deepseek-v3',
    'deepseek-r1',
    'deepseek-coder',
    'deepseek-math',
  ],
  requiresBaseUrl: true,
  defaultModel: 'deepseek-v4',
};

export class DeepSeekProvider implements AIProvider {
  name = 'deepseek';
  displayName = 'DeepSeek';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || DEEPSEEK_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.deepseek.com/v1';

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
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error(`DeepSeek API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.choices[0].message.content;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || DEEPSEEK_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.deepseek.com/v1';

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
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
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
    return DEEPSEEK_PROVIDER_INFO.models;
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://api.deepseek.com/v1') + '/models';
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

// 科大讯飞 (星火大模型) 提供商
const IFlyTek_PROVIDER_INFO: ProviderInfo = {
  id: 'iflytek',
  name: 'iFlyTek',
  models: [
    'spark-4.0',
    'spark-3.5',
    'spark-3.0',
  ],
  requiresBaseUrl: true,
  defaultModel: 'spark-4.0',
};

export class IFlyTekProvider implements AIProvider {
  name = 'iflytek';
  displayName = 'iFlyTek';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || IFlyTek_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://spark-api.xf-yun.com/v3.5';

    // 科大讯飞 API 需要特定格式
    const messagesFormat = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messagesFormat,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`iFlyTek API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error(`iFlyTek API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.choices[0].message.content;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || IFlyTek_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://spark-api.xf-yun.com/v3.5';

    const controller = new AbortController();
    if (options?.abortSignal) {
      options.abortSignal.addEventListener('abort', () => controller.abort());
    }

    // 科大讯飞 API 需要特定格式
    const messagesFormat = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messagesFormat,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`iFlyTek API error: ${response.status} - ${error}`);
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
    return IFlyTek_PROVIDER_INFO.models;
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://spark-api.xf-yun.com/v3.5') + '/models';
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

// 腾讯 (混元大模型) 提供商
const TENCENT_PROVIDER_INFO: ProviderInfo = {
  id: 'tencent',
  name: 'Tencent',
  models: [
    'hunyuan',
    'hunyuan-text',
    'hunyuan-multimodal',
    'hunyuan-video',
  ],
  requiresBaseUrl: true,
  defaultModel: 'hunyuan',
};

export class TencentProvider implements AIProvider {
  name = 'tencent';
  displayName = 'Tencent';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || TENCENT_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.tencentcloud.com';

    // 腾讯 API 需要特定格式
    const response = await fetch(`${baseUrl}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Action: 'ChatCompletions',
        Version: '2024-08-01',
        Model: model,
        Messages: messages.map(m => ({
          Role: m.role === 'assistant' ? 'assistant' : 'user',
          Content: m.content,
        })),
        Temperature: options?.temperature ?? 0.7,
        MaxTokens: options?.maxTokens ?? 4096,
        APIKey: apiKey,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tencent API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (!data.Response || !data.Response.Choices || !data.Response.Choices[0]) {
      throw new Error(`Tencent API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.Response.Choices[0].Message.Content;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    const fullResponse = await this.chat(messages, options);
    for (const char of fullResponse) {
      const shouldContinue = onChunk(char);
      if (shouldContinue === false) break;
      await new Promise(resolve => setTimeout(resolve, 3));
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
    return TENCENT_PROVIDER_INFO.models;
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://api.tencentcloud.com') + '/';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Action: 'ListModels',
          Version: '2024-08-01',
          APIKey: apiKey,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// 华为 (盘古大模型) 提供商
const HUAWEI_PROVIDER_INFO: ProviderInfo = {
  id: 'huawei',
  name: 'Huawei',
  models: [
    'pangu-nlp',
    'pangu-multimodal',
    'pangu-science',
    'pangu-weather',
  ],
  requiresBaseUrl: true,
  defaultModel: 'pangu-nlp',
};

export class HuaweiProvider implements AIProvider {
  name = 'huawei';
  displayName = 'Huawei';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || HUAWEI_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://ark.cn-beijing.volces.com/api/v3';

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
      throw new Error(`Huawei API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error(`Huawei API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.choices[0].message.content;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || HUAWEI_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://ark.cn-beijing.volces.com/api/v3';

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
      throw new Error(`Huawei API error: ${response.status} - ${error}`);
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
    return HUAWEI_PROVIDER_INFO.models;
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://ark.cn-beijing.volces.com/api/v3') + '/models';
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

// 百川智能 提供商
const BAICHUAN_PROVIDER_INFO: ProviderInfo = {
  id: 'baichuan',
  name: 'Baichuan',
  models: [
    'baichuan-4.0-7b',
    'baichuan-4.0-13b',
    'baichuan-4.0-67b',
    'baichuan-3',
    'baichuan-2',
  ],
  requiresBaseUrl: true,
  defaultModel: 'baichuan-4.0-13b',
};

export class BaichuanProvider implements AIProvider {
  name = 'baichuan';
  displayName = 'Baichuan';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || BAICHUAN_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.baichuan-ai.com/v1';

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
      throw new Error(`Baichuan API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error(`Baichuan API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.choices[0].message.content;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || BAICHUAN_PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.baichuan-ai.com/v1';

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
      throw new Error(`Baichuan API error: ${response.status} - ${error}`);
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
    return BAICHUAN_PROVIDER_INFO.models;
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://api.baichuan-ai.com/v1') + '/models';
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

// 导出所有提供商信息
export { 
  META_PROVIDER_INFO as metaInfo,
  MISTRAL_PROVIDER_INFO as mistralInfo,
  XAI_PROVIDER_INFO as xaiInfo,
  BYTEDANCE_PROVIDER_INFO as bytedanceInfo,
  BAIDU_PROVIDER_INFO as baiduInfo,
  ZHIPU_PROVIDER_INFO as zhipuInfo,
  MOONSHOT_PROVIDER_INFO as moonshotInfo,
  DEEPSEEK_PROVIDER_INFO as deepseekInfo,
  IFlyTek_PROVIDER_INFO as iflytekInfo,
  TENCENT_PROVIDER_INFO as tencentInfo,
  HUAWEI_PROVIDER_INFO as huaweiInfo,
  BAICHUAN_PROVIDER_INFO as baichuanInfo
};
