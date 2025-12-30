/**
 * Response Synthesis Service
 *
 * Generates the final LLM response from plan execution results.
 * Builds prompts and synthesizes natural language responses.
 */

import { createModel } from '../../chatModes/modelFactory';

export class ResponseSynthesisService {
  /**
   * Synthesize final response from plan results
   *
   * @param message - Original user message
   * @param formattedResults - Formatted plan execution results
   * @param planSummary - Summary of plan execution
   * @param language - User's language preference
   * @returns Generated response text
   */
  async synthesizeResponse(
    message: string,
    formattedResults: string,
    planSummary: any,
    language: string
  ): Promise<string> {
    const model = createModel(false);

    // Build prompt for LLM
    const summaryPrompt = this.buildPrompt(
      message,
      formattedResults,
      planSummary,
      language
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
    planSummary: any,
    language: string
  ): string {
    const { PromptLoader } = require('../../prompts/PromptLoader');
    const template = PromptLoader.getPrompt(
      'orchestration',
      'orchestration-response'
    );

    if (!template) {
      console.warn(
        '[ResponseSynthesisService] Orchestration prompt not found, using fallback'
      );
      return this.buildFallbackPrompt(
        message,
        formattedResults,
        planSummary,
        language
      );
    }

    // Substitute variables in template
    const languageName = this.getLanguageName(language);
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
    planSummary: any,
    language: string
  ): string {
    const languageName = this.getLanguageName(language);

    return `You are a Swiss travel Companion. The user asked: "${message}"

I have gathered the following information for you:

${formattedResults}

Raw data summary:
${JSON.stringify(planSummary, null, 2)}

IMPORTANT: The information will be displayed as visual cards to the user. Do NOT repeat or summarize the trip details (times, stations, connections, etc.) in text form. Keep your response extremely brief - just a short greeting or acknowledgment if needed, or respond with an empty string. The cards will show all the details. Respond in ${languageName}.`;
  }

  /**
   * Get language name from code
   *
   * @private
   */
  private getLanguageName(language: string): string {
    switch (language) {
      case 'de':
        return 'German';
      case 'fr':
        return 'French';
      case 'it':
        return 'Italian';
      case 'zh':
        return 'Simplified Chinese';
      case 'hi':
        return 'Hindi';
      default:
        return 'English';
    }
  }
}
