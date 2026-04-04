import { AIProvider, Message, ChatOptions, CompleteOptions, ProviderInfo, StreamCallback } from './base';

interface SiliconFlowResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const PROVIDER_INFO: ProviderInfo = {
  id: 'siliconflow',
  name: '硅基流动',
  models: [
    // Qwen 系列
    'Qwen/Qwen2.5-72B-Instruct',
    'Qwen/Qwen2.5-32B-Instruct',
    'Qwen/Qwen2.5-14B-Instruct',
    'Qwen/Qwen2.5-7B-Instruct',
    'Qwen/Qwen2.5-1.5B-Instruct',
    'Qwen/Qwen2.5-0.5B-Instruct',
    'Qwen/Qwen2-72B-Instruct',
    'Qwen/Qwen2-7B-Instruct',
    'Qwen/Qwen2-1.8B-Instruct',
    'Qwen/Qwen2-0.5B-Instruct',
    'Qwen/Qwen1.5-72B-Chat',
    'Qwen/Qwen1.5-14B-Chat',
    'Qwen/Qwen1.5-7B-Chat',
    'Qwen/Qwen1.5-1.8B-Chat',
    'Qwen/Qwen1.5-0.5B-Chat',
    // DeepSeek 系列
    'deepseek-ai/DeepSeek-V3',
    'deepseek-ai/DeepSeek-R1',
    'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B',
    'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
    'deepseek-ai/DeepSeek-R1-Distill-Llama-8B',
    'deepseek-ai/DeepSeek-V2.5',
    'deepseek-ai/DeepSeek-V2',
    'deepseek-ai/DeepSeek-Coder-V2-Instruct',
    'deepseek-ai/DeepSeek-Coder-V2',
    'deepseek-ai/DeepSeek-LLM-Chat',
    // Anthropic Claude 系列
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3-opus',
    'anthropic/claude-3-sonnet',
    'anthropic/claude-3-haiku',
    // Meta Llama 系列
    'meta-llama/Llama-3.1-70B-Instruct',
    'meta-llama/Llama-3.1-8B-Instruct',
    'meta-llama/Llama-3-70B-Chat',
    'meta-llama/Llama-3-8B-Chat',
    'meta-llama/Llama-2-70B-Chat',
    'meta-llama/Llama-2-13B-Chat',
    'meta-llama/Llama-2-7B-Chat',
    // Mistral 系列
    'mistralai/Mistral-Large-Instruct',
    'mistralai/Mistral-Nemo-Instruct',
    'mistralai/Mistral-7B-Instruct',
    'mistralai/Mixtral-8x22B-Instruct',
    'mistralai/Mixtral-8x7B-Instruct',
    // Google Gemma 系列
    'google/gemma2-27b-instruct',
    'google/gemma2-9b-instruct',
    'google/gemma-7b-instruct',
    'google/gemma-2b-instruct',
    // 其他开源模型
    'internlm2/internlm2-72b-chat',
    'internlm2/internlm2-20b-chat',
    'internlm2/internlm2-7b-chat',
    'THUDM/glm-4-9b-chat',
    'THUDM/glm-4-72b-chat',
    'THUDM/chatglm3-6b',
    '01-ai/Yi-1.5-34B-Chat',
    '01-ai/Yi-1.5-9B-Chat',
    '01-ai/Yi-1.5-6B-Chat',
    'WizardLM/WizardCoder-Python-34B-V1.1',
    'WizardLM/WizardMath-70B-V1.1',
    'openchat/openchat-7b',
    ' NousResearch/NousHermes-2-Mixtral-8x7B-DPO',
    'deepseek-ai/DeepSeek-V2-Lite-Chat',
    'baichuan-inc/Baichuan2-53B-Chat',
  ],
  requiresBaseUrl: true,
  defaultModel: 'Qwen/Qwen2.5-7B-Instruct',
};

export class SiliconFlowProvider implements AIProvider {
  name = 'siliconflow';
  displayName = '硅基流动';

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const { configStore } = await import('../config/store');
    const apiKey = configStore.get('apiKey');
    const model = configStore.get('model') || PROVIDER_INFO.defaultModel;
    let baseUrl = configStore.get('baseUrl');

    if (!baseUrl) {
      baseUrl = 'https://api.siliconflow.cn/v1';
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
      throw new Error(`SiliconFlow API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as SiliconFlowResponse;
    if (!data.choices || !data.choices[0]) {
      throw new Error(`SiliconFlow API error: Invalid response format - ${JSON.stringify(data).slice(0, 200)}`);
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
    const url = (baseUrl || 'https://api.siliconflow.cn/v1') + '/chat/completions';
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

export { PROVIDER_INFO as siliconFlowInfo };
