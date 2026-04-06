import { AIProvider, Message, ChatOptions, CompleteOptions, ProviderInfo, StreamCallback } from './base';

interface GoogleResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

const PROVIDER_INFO: ProviderInfo = {
  id: 'google',
  name: 'Google AI',
  models: [
    // Gemini 3.0 系列
    'gemini-3.0-pro',
    'gemini-3.0-ultra',
    // Gemini 3.1 系列
    'gemini-3.1-pro',
    'gemini-3.1-ultra',
    // Gemini 2.0 系列
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash-lite',
    // Gemini 1.5 系列
    'gemini-1.5-flash',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-001',
    'gemini-1.5-pro',
    'gemini-1.5-pro-002',
    'gemini-1.5-pro-001',
    'gemini-1.5-pro-experimental',
    // Gemini 1.0 系列
    'gemini-1.0-pro',
    'gemini-1.0-pro-001',
    'gemini-1.0-pro-experimental',
    'gemini-1.0-flash',
    'gemini-1.0-flash-001',
    'gemini-1.0-flash-experimental',
    'gemini-1.0-flash-lite',
    // Gemini Pro Vision (多模态)
    'gemini-pro-vision',
    // Gemma 系列
    'gemma-2b',
    'gemma-7b',
    'gemma-3-12b',
  ],
  requiresBaseUrl: false,
  defaultModel: 'gemini-2.0-flash',
};

export class GoogleProvider implements AIProvider {
  name = 'google';
  displayName = 'Google AI';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || PROVIDER_INFO.defaultModel;
    const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

    // Convert messages to Google format
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const systemInstruction = messages.find(m => m.role === 'system')?.content;

    const response = await fetch(`${baseUrl}/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 4096,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google AI API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as GoogleResponse;
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error(`Google AI API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.candidates[0].content.parts[0].text;
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
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export { PROVIDER_INFO as googleInfo };
