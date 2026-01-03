/**
 * Response Synthesis Service
 *
 * Generates the final LLM response from plan execution results.
 * Builds prompts and synthesizes natural language responses.
 */

import { createModel } from '../../chatModes/modelFactory';
import { getLanguageName } from '../../types/language';
import type { PlanSummary } from '../../types/common';
import type { Language } from '@/lib/i18n';
import { PromptLoader } from '../../prompts/PromptLoader';

export class ResponseSynthesisService {
  /**
   * Synthesize final response from plan results
   *
   * @param message - Original user message
   * @param formattedResults - Formatted plan execution results
   * @param planSummary - Summary of plan execution
   * @param language - User's language preference
   * @param voiceEnabled - Whether voice output is enabled
   * @returns Generated response text
   */
  async synthesizeResponse(
    message: string,
    formattedResults: string,
    planSummary: PlanSummary,
    language: Language | string,
    voiceEnabled: boolean = false
  ): Promise<string> {
    const model = createModel(false);

    // Build prompt for LLM (use voice-friendly prompt if voice is enabled)
    const summaryPrompt = this.buildPrompt(
      message,
      formattedResults,
      planSummary,
      language,
      voiceEnabled
    );

    // Generate response
    const result = await model.generateContent(summaryPrompt);
    const response = result.response.text();

    return response;
  }

  /**
   * Build the LLM prompt from plan results
   *
   * @private
   */
  private buildPrompt(
    message: string,
    formattedResults: string,
    planSummary: PlanSummary,
    language: Language | string,
    voiceEnabled: boolean = false
  ): string {
    // Use voice-friendly prompt if voice is enabled
    const promptName = voiceEnabled
      ? 'orchestration-response-voice'
      : 'orchestration-response';

    console.log(`[ResponseSynthesisService] Using prompt: ${promptName}`);

    const template = PromptLoader.getPrompt('orchestration', promptName);

    if (!template) {
      console.warn(
        `[ResponseSynthesisService] ${promptName} prompt not found, using fallback`
      );
      return this.buildFallbackPrompt(
        message,
        formattedResults,
        planSummary,
        language,
        voiceEnabled
      );
    }

    // Substitute variables in template
    const languageName = getLanguageName(language);
    let result = template.template;

    const variables: Record<string, string> = {
      message,
      formattedResults,
      planSummary: JSON.stringify(planSummary, null, 2),
      language: languageName,
    };

    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(pattern, value || '');
    }

    return result;
  }

  /**
   * Fallback prompt if JSON loading fails
   *
   * @private
   */
  private buildFallbackPrompt(
    message: string,
    formattedResults: string,
    planSummary: PlanSummary,
    language: Language | string,
    voiceEnabled: boolean = false
  ): string {
    const languageName = getLanguageName(language);

    if (voiceEnabled) {
      return `You are a Swiss travel Companion. The user asked: "${message}"

I have gathered the following information for you:

${formattedResults}

Raw data summary:
${JSON.stringify(planSummary, null, 2)}

IMPORTANT: The user has voice output enabled. Generate a natural, conversational 2-4 sentence summary highlighting the key findings. The information will also be displayed as visual cards. Respond in ${languageName}.`;
    }

    return `You are a Swiss travel Companion. The user asked: "${message}"

I have gathered the following information for you:

${formattedResults}

Raw data summary:
${JSON.stringify(planSummary, null, 2)}

IMPORTANT: The information will be displayed as visual cards to the user. Do NOT repeat or summarize the trip details (times, stations, connections, etc.) in text form. Keep your response extremely brief - just a short greeting or acknowledgment if needed, or respond with an empty string. The cards will show all the details. Respond in ${languageName}.`;
  }
}
