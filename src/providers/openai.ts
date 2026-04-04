import { AIProvider, Message, ChatOptions, CompleteOptions, ProviderInfo, StreamCallback } from './base';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const PROVIDER_INFO: ProviderInfo = {
  id: 'openai',
  name: 'OpenAI',
  models: [
    // GPT-4o 系列
    'gpt-4o',
    'gpt-4o-2024-05-13',
    'gpt-4o-2024-08-06',
    'gpt-4o-2024-11-20',
    'gpt-4o-mini',
    'gpt-4o-mini-2024-07-18',
    // GPT-4 Turbo 系列
    'gpt-4-turbo',
    'gpt-4-turbo-2024-04-09',
    'gpt-4-turbo-2024-07-18',
    // GPT-4 系列
    'gpt-4',
    'gpt-4-0613',
    'gpt-4-32k',
    'gpt-4-32k-0613',
    // GPT-3.5 Turbo 系列
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
    'gpt-3.5-turbo-0613',
    'gpt-3.5-turbo-1106',
    'gpt-3.5-turbo-0125',
  ],
  requiresBaseUrl: false,
  defaultModel: 'gpt-4o-mini',
};

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  displayName = 'OpenAI';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.openai.com/v1';

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
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as OpenAIResponse;
    if (!data.choices || !data.choices[0]) {
      throw new Error(`OpenAI API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.choices[0].message.content;
  }

  async chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.openai.com/v1';

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
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
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
    return PROVIDER_INFO.models;
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://api.openai.com/v1') + '/models';
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

export { PROVIDER_INFO as openAIInfo };
