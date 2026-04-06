import type { AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS } from '../../services/analytics/index.js'
import { isEnvTruthy } from '../envUtils.js'
import { configAdapter } from '../../config/adapter.js'

export type APIProvider = 'firstParty' | 'bedrock' | 'vertex' | 'foundry' | 'custom'

export function getAPIProvider(): APIProvider {
  // 使用 XiaoLuo Code 的配置系统
  const provider = configAdapter.getProvider();
  
  // 映射到 claude-code-sourcemap 的提供商类型
  switch (provider) {
    case 'openai':
    case 'anthropic':
    case 'google':
      return 'firstParty';
    case 'bedrock':
      return 'bedrock';
    case 'vertex':
      return 'vertex';
    case 'foundry':
      return 'foundry';
    default:
      return 'custom';
  }
}

export function getAPIProviderForStatsig(): AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS {
  return getAPIProvider() as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS
}

/**
 * Check if ANTHROPIC_BASE_URL is a first-party Anthropic API URL.
 * Returns true if not set (default API) or points to api.anthropic.com
 * (or api-staging.anthropic.com for ant users).
 */
export function isFirstPartyAnthropicBaseUrl(): boolean {
  // 使用 XiaoLuo Code 的配置系统
  const baseUrl = configAdapter.getBaseUrl();
  if (!baseUrl) {
    return true
  }
  try {
    const host = new URL(baseUrl).host
    const allowedHosts = ['api.anthropic.com']
    if (process.env.USER_TYPE === 'ant') {
      allowedHosts.push('api-staging.anthropic.com')
    }
    return allowedHosts.includes(host)
  } catch {
    return false
  }
}
