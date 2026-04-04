import { AIProvider, Message, ChatOptions, CompleteOptions, ProviderInfo, StreamCallback } from './base';

interface AliyunResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const PROVIDER_INFO: ProviderInfo = {
  id: 'aliyun',
  name: '阿里云 (DashScope)',
  models: [
    // Qwen 通义千问 系列
    'qwen-long',           // 通义千问超长上下文版
    'qwen-max',            // 通义千问最强版本
    'qwen-max-longcontext', // 千问长上下文版
    'qwen-plus',           // 通义千问增强版
    'qwen-turbo',          // 通义千问轻量版
    'qwen-moe',            // Qwen MoE
    'qwen-moe-turbo',
    'qwen2',               // Qwen2 系列
    'qwen2-instruct',
    'qwen2-72b-instruct',
    'qwen2-57b-a14b-instruct',
    'qwen2-7b-instruct',
    'qwen2-1.5b-instruct',
    'qwen2-0.5b-instruct',
    'qwen2.5',             // Qwen2.5 系列
    'qwen2.5-72b-instruct',
    'qwen2.5-32b-instruct',
    'qwen2.5-14b-instruct',
    'qwen2.5-7b-instruct',
    'qwen2.5-3b-instruct',
    'qwen2.5-1.5b-instruct',
    'qwen2.5-0.5b-instruct',
    'qwen2.5-moe',         // Qwen2.5 MoE
    'qwen2.5-moe-57b-a14b-instruct',
    // 其他阿里模型
    'bailian-v2',          // 百练 V2
    'bailian-v1',
    'llama2',              // Llama2 系列
    'llama2-7b-chat-v1',
    'llama2-13b-chat-v1',
    'llama2-70b-chat-v1',
    'qwen-vl',             // Qwen 视觉语言模型
    'qwen-vl-plus',
    'qwen-vl-max',
    'qwen-audio',          // Qwen 音频模型
    'qwen-audio-turbo',
    // 通义万相 (图像生成)
    'wanx-v1',
    'wanx-v1.1',
    // CodeQwen
    'codeqwen1.5-7b-chat',
    'codeqwen1.5-7b',
  ],
  requiresBaseUrl: true,
  defaultModel: 'qwen-turbo',
};

export class AliyunProvider implements AIProvider {
  name = 'aliyun';
  displayName = '阿里云 (DashScope)';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || PROVIDER_INFO.defaultModel;
    let baseUrl = configStore.get('baseUrl');

    if (!baseUrl) {
      baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
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
      throw new Error(`DashScope API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as AliyunResponse;
    if (!data.choices || !data.choices[0]) {
      throw new Error(`DashScope API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
    }
    return data.choices[0].message.content;
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
    const url = (baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1') + '/chat/completions';
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

export { PROVIDER_INFO as aliyunInfo };
