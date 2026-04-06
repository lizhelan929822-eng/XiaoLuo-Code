import express, { Request, Response } from 'express';
import { Server } from 'http';
import open from 'open';
import { configStore, AppConfig } from '../config/store';
import { providerList, validateProviderConfig, getProvider } from '../providers';
import { Message } from '../providers/base';
import { logger } from '../utils/logger';

const GATEWAY_PORT = 3888;

export class GatewayServer {
  private app: express.Application;
  private server: Server | null = null;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static(__dirname + '/pages'));
  }

  private setupRoutes(): void {
    // Serve main page
    this.app.get('/', (req: Request, res: Response) => {
      res.sendFile(__dirname + '/pages/index.html');
    });

    // Serve chat page
    this.app.get('/chat', (req: Request, res: Response) => {
      res.sendFile(__dirname + '/pages/chat.html');
    });

    // Get current config
    this.app.get('/api/config', (req: Request, res: Response) => {
      const config = configStore.getAll();
      // Don't send actual API key, just mask it
      if (config.apiKey && config.apiKey.length > 8) {
        (config as any).apiKey = config.apiKey.substring(0, 4) + '...' + config.apiKey.substring(config.apiKey.length - 4);
      }
      res.json(config);
    });

    // Get provider list
    this.app.get('/api/providers', (req: Request, res: Response) => {
      res.json(providerList);
    });

    // Get models for a provider
    this.app.get('/api/models/:provider', (req: Request, res: Response) => {
      const provider = providerList.find(p => p.id === req.params.provider);
      if (provider) {
        res.json(provider.models);
      } else {
        res.status(404).json({ error: 'Provider not found' });
      }
    });

    // Save config
    this.app.post('/api/config', async (req: Request, res: Response) => {
      try {
        const { provider, apiKey, baseUrl, model, temperature, maxTokens } = req.body;

        if (!provider || !apiKey) {
          res.status(400).json({ error: 'Provider and API key are required' });
          return;
        }

        if (!model) {
          res.status(400).json({ error: 'Model name is required' });
          return;
        }

        // Validate the configuration
        const isValid = await validateProviderConfig(provider, apiKey, baseUrl);
        if (!isValid) {
          res.status(400).json({ error: 'Invalid API key or configuration' });
          return;
        }

        // Save configuration
        configStore.set('provider', provider);
        configStore.set('apiKey', apiKey);
        if (baseUrl) configStore.set('baseUrl', baseUrl);
        configStore.set('model', model);
        if (temperature !== undefined) configStore.set('temperature', temperature);
        if (maxTokens !== undefined) configStore.set('maxTokens', maxTokens);

        logger.success('Configuration saved successfully');
        res.json({ success: true });
      } catch (error) {
        logger.error(`Failed to save config: ${error}`);
        res.status(500).json({ error: 'Failed to save configuration' });
      }
    });

    // Test API connection
    this.app.post('/api/test', async (req: Request, res: Response) => {
      try {
        const { provider, apiKey, baseUrl, model } = req.body;

        if (!provider || !apiKey) {
          res.status(400).json({ error: 'Provider and API key are required' });
          return;
        }

        const isValid = await validateProviderConfig(provider, apiKey, baseUrl);
        res.json({ success: isValid, message: isValid ? 'Connection successful' : 'Connection failed' });
      } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error}` });
      }
    });

    // Verify API key
    this.app.post('/api/verify', async (req: Request, res: Response) => {
      try {
        const { provider, apiKey, baseUrl } = req.body;
        const isValid = await validateProviderConfig(provider, apiKey, baseUrl);
        res.json({ valid: isValid });
      } catch (error) {
        res.json({ valid: false });
      }
    });

    // Chat API
    this.app.post('/api/chat', async (req: Request, res: Response) => {
      try {
        const { message } = req.body;
        
        if (!message) {
          res.status(400).json({ error: 'Message is required' });
          return;
        }

        const provider = getProvider();
        const messages: Message[] = [{ role: 'user', content: message }];
        
        const response = await provider.chat(messages);
        res.json({ response });
      } catch (error) {
        logger.error(`Chat failed: ${error}`);
        res.status(500).json({ error: 'Chat failed' });
      }
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(GATEWAY_PORT, () => {
        logger.success(`Gateway server started on http://localhost:${GATEWAY_PORT}`);
        open(`http://localhost:${GATEWAY_PORT}`);
        resolve();
      });
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}
