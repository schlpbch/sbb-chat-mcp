/**
 * Environment configuration with validation
 *
 * This module centralizes all environment variable access and provides
 * type-safe configuration with runtime validation using Zod.
 *
 * Features:
 * - Runtime validation of all environment variables
 * - Type-safe access to configuration
 * - Helpful error messages for missing/invalid variables
 * - Support for both client and server contexts
 */

import { z } from 'zod';

export type Environment = 'dev' | 'staging';

/**
 * Environment variable schema with validation rules
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),

  // MCP Server Configuration (Public - accessible in browser)
  NEXT_PUBLIC_MCP_SERVER_URL_DEV: z.string().url().default('http://localhost:8080'),
  NEXT_PUBLIC_MCP_SERVER_URL_STAGING: z
    .string()
    .url()
    .default('https://journey-service-mcp-staging-jf43t3fcba-oa.a.run.app'),
  NEXT_PUBLIC_MCP_ENV: z.enum(['dev', 'staging']).default('staging'),

  // App URL (optional, for metadata)
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),

  // Google Cloud / Gemini API (Server-side only)
  GOOGLE_CLOUD_KEY: z
    .string()
    .min(1, 'GOOGLE_CLOUD_KEY is required for LLM functionality')
    .refine((val) => val.startsWith('AIza'), {
      message: 'GOOGLE_CLOUD_KEY must be a valid Google API key (starts with AIza)',
    }),

  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),

  // Resend Email Configuration (Server-side only, optional for feedback)
  RESEND_API_KEY: z
    .string()
    .min(1)
    .refine((val) => val.startsWith('re_'), {
      message: 'RESEND_API_KEY must be a valid Resend API key (starts with re_)',
    })
    .optional(),

  RESEND_FROM_EMAIL: z.string().email().optional().default('feedback@resend.dev'),
  FEEDBACK_EMAIL: z.string().email().optional(),
});

/**
 * Validated environment variables
 * Ensures all required variables are present and valid
 */
let cachedEnv: z.infer<typeof envSchema> | null = null;

/**
 * Validate and parse environment variables
 * Throws an error with helpful message if validation fails
 */
export function validateEnv(): z.infer<typeof envSchema> {
  if (cachedEnv) {
    return cachedEnv;
  }

  try {
    cachedEnv = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_MCP_SERVER_URL_DEV: process.env.NEXT_PUBLIC_MCP_SERVER_URL_DEV,
      NEXT_PUBLIC_MCP_SERVER_URL_STAGING:
        process.env.NEXT_PUBLIC_MCP_SERVER_URL_STAGING,
      NEXT_PUBLIC_MCP_ENV: process.env.NEXT_PUBLIC_MCP_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      GOOGLE_CLOUD_KEY: process.env.GOOGLE_CLOUD_KEY,
      GEMINI_MODEL: process.env.GEMINI_MODEL,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
      FEEDBACK_EMAIL: process.env.FEEDBACK_EMAIL,
    });

    return cachedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n');

      throw new Error(
        `❌ Environment validation failed!\n\n` +
          `Missing or invalid environment variables:\n${missingVars}\n\n` +
          `Please check your .env.local file and ensure all required variables are set.\n` +
          `See .env.example for reference.`
      );
    }
    throw error;
  }
}

/**
 * Type-safe environment variable access
 */
export const env = new Proxy({} as z.infer<typeof envSchema>, {
  get(_, prop: string) {
    const validatedEnv = validateEnv();
    return validatedEnv[prop as keyof typeof validatedEnv];
  },
});

// ============================================================================
// MCP Server Configuration (Backward Compatible API)
// ============================================================================

interface McpConfig {
  dev: string;
  staging: string;
  current: Environment;
}

/**
 * MCP Server configuration using validated environment variables
 */
export const mcpConfig: McpConfig = {
  get dev() {
    return env.NEXT_PUBLIC_MCP_SERVER_URL_DEV;
  },
  get staging() {
    return env.NEXT_PUBLIC_MCP_SERVER_URL_STAGING;
  },
  get current() {
    return env.NEXT_PUBLIC_MCP_ENV as Environment;
  },
};

/**
 * Get the current MCP server URL based on the configured environment
 */
export function getMcpServerUrl(): string {
  return env.NEXT_PUBLIC_MCP_ENV === 'dev'
    ? env.NEXT_PUBLIC_MCP_SERVER_URL_DEV
    : env.NEXT_PUBLIC_MCP_SERVER_URL_STAGING;
}

/**
 * Get MCP server URL for a specific environment
 */
export function getMcpServerUrlForEnv(environment: Environment): string {
  return environment === 'dev'
    ? env.NEXT_PUBLIC_MCP_SERVER_URL_DEV
    : env.NEXT_PUBLIC_MCP_SERVER_URL_STAGING;
}

/**
 * Check if running in development mode
 */
export function isDev(): boolean {
  return env.NEXT_PUBLIC_MCP_ENV === 'dev';
}

/**
 * Check if running in staging mode
 */
export function isStaging(): boolean {
  return env.NEXT_PUBLIC_MCP_ENV === 'staging';
}

/**
 * Get all available MCP server URLs
 */
export function getAllMcpServerUrls(): Record<Environment, string> {
  return {
    dev: env.NEXT_PUBLIC_MCP_SERVER_URL_DEV,
    staging: env.NEXT_PUBLIC_MCP_SERVER_URL_STAGING,
  };
}
