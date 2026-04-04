export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  abortSignal?: AbortSignal;
}

export interface CompleteOptions extends ChatOptions {
  language?: string;
}

export type StreamCallback = (chunk: string) => void | boolean; // return false to stop

export interface AIProvider {
  name: string;
  displayName: string;
  chat(messages: Message[], options?: ChatOptions): Promise<string>;
  chatStream(messages: Message[], onChunk: StreamCallback, options?: ChatOptions): Promise<string>;
  complete(prompt: string, options?: CompleteOptions): Promise<string>;
  listModels(): Promise<string[]>;
  validateKey(apiKey: string, baseUrl?: string): Promise<boolean>;
}

export interface ProviderInfo {
  id: string;
  name: string;
  models: string[];
  requiresBaseUrl: boolean;
  defaultModel: string;
  displayName?: string;
}
