import { AIProvider, Message, ChatOptions, CompleteOptions, ProviderInfo, StreamCallback } from './base';

interface AnthropicResponse {
  content: Array<{
    text: string;
  }>;
}

const PROVIDER_INFO: ProviderInfo = {
  id: 'anthropic',
  name: 'Anthropic',
  models: [
    // Claude 3.5 系列
    'claude-3-5-sonnet-latest',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20240620',
    'claude-3-5-haiku-latest',
    'claude-3-5-haiku-20241022',
    // Claude 3 Opus 系列
    'claude-3-opus-latest',
    'claude-3-opus-20240229',
    'claude-3-opus-20241120',
    // Claude 3 Sonnet 系列
    'claude-3-sonnet-latest',
    'claude-3-sonnet-20240229',
    'claude-3-sonnet-20240722',
    'claude-3-sonnet-20241022',
    // Claude 3 Haiku 系列
    'claude-3-haiku-latest',
    'claude-3-haiku-20240307',
    'claude-3-haiku-20240722',
    'claude-3-haiku-20241022',
  ],
  requiresBaseUrl: false,
  defaultModel: 'claude-3-5-sonnet-latest',
};

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  displayName = 'Anthropic';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || PROVIDER_INFO.defaultModel;
    const baseUrl = configStore.get('baseUrl') || 'https://api.anthropic.com/v1';

    // Convert messages to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        messages: chatMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        system: systemMessage?.content,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as AnthropicResponse;
    if (!data.content || !data.content[0]) {
      throw new Error(`Anthropic API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.content[0].text;
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
    return PROVIDER_INFO.models;
  }

  async validateKey(apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const url = (baseUrl || 'https://api.anthropic.com') + '/messages';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
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

export { PROVIDER_INFO as anthropicInfo };
