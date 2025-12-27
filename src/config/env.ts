/**
 * Environment configuration for MCP server URLs
 * 
 * This module centralizes all environment variable access and provides
 * type-safe configuration for different environments (dev, staging, production).
 */

export type Environment = 'dev' | 'staging';

interface McpConfig {
  dev: string;
  staging: string;
  current: Environment;
}

/**
 * MCP Server configuration
 * Reads from environment variables with fallback defaults
 * Works in both client and server contexts
 */
function getEnvVar(key: string, fallback: string): string {
  // Try to get from process.env (works in both client and server)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]!;
  }
  return fallback;
}

export const mcpConfig: McpConfig = {
  dev: getEnvVar('NEXT_PUBLIC_MCP_SERVER_URL_DEV', 'http://localhost:8080'),
  staging: getEnvVar(
    'NEXT_PUBLIC_MCP_SERVER_URL_STAGING',
    'https://journey-service-mcp-staging-jf43t3fcba-oa.a.run.app'
  ),
  current: (getEnvVar('NEXT_PUBLIC_MCP_ENV', 'staging') as Environment),
};

/**
 * Get the current MCP server URL based on the configured environment
 * Uses runtime environment variable access to work in server-side contexts
 */
export function getMcpServerUrl(): string {
  // Get fresh values at runtime to ensure server-side routes work
  const dev = getEnvVar('NEXT_PUBLIC_MCP_SERVER_URL_DEV', 'http://localhost:8080');
  const staging = getEnvVar(
    'NEXT_PUBLIC_MCP_SERVER_URL_STAGING',
    'https://journey-service-mcp-staging-jf43t3fcba-oa.a.run.app'
  );
  const current = getEnvVar('NEXT_PUBLIC_MCP_ENV', 'staging') as Environment;
  
  return current === 'dev' ? dev : staging;
}

/**
 * Get MCP server URL for a specific environment
 */
export function getMcpServerUrlForEnv(env: Environment): string {
  return mcpConfig[env];
}

/**
 * Check if running in development mode
 */
export function isDev(): boolean {
  return mcpConfig.current === 'dev';
}

/**
 * Check if running in staging mode
 */
export function isStaging(): boolean {
  return mcpConfig.current === 'staging';
}

/**
 * Get all available MCP server URLs
 */
export function getAllMcpServerUrls(): Record<Environment, string> {
  return {
    dev: mcpConfig.dev,
    staging: mcpConfig.staging,
  };
}
