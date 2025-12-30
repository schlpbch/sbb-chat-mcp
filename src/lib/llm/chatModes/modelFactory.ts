/**
 * Model Factory - Creates Gemini model instances
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { MCP_FUNCTION_DEFINITIONS } from '../functionDefinitions';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_CLOUD_KEY!);

/**
 * Create a Gemini model with optional function calling
 */
export function createModel(enableFunctionCalling: boolean = true) {
  const modelConfig: any = {
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  };

  if (enableFunctionCalling) {
    modelConfig.tools = [
      {
        functionDeclarations: MCP_FUNCTION_DEFINITIONS,
      },
    ];
  }

  return genAI.getGenerativeModel(modelConfig);
}
