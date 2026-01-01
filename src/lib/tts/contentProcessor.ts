import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';

/**
 * Extracts speakable text from markdown content, filtering out code blocks and tables
 * @param markdown - The markdown content to process
 * @returns Plain text suitable for text-to-speech
 */
export function extractSpeakableText(markdown: string): string {
  // Parse markdown to AST
  const tree = unified().use(remarkParse).parse(markdown);

  let speakableText = '';

  // Visit nodes and extract text, skipping code and tables
  visit(tree, (node: any) => {
    if (node.type === 'code' || node.type === 'inlineCode') {
      // Skip code blocks and inline code
      return 'skip';
    }

    if (node.type === 'table') {
      // Skip tables
      return 'skip';
    }

    if (node.type === 'text') {
      speakableText += node.value + ' ';
    }

    // Add pauses for structural elements
    if (node.type === 'paragraph') {
      speakableText += '. ';
    }

    if (node.type === 'heading') {
      speakableText += '. ';
    }
  });

  // Clean up extra whitespace and multiple periods
  return speakableText
    .replace(/\s+/g, ' ')
    .replace(/\.+\s*\.+/g, '.')
    .replace(/\s+\./g, '.')
    .replace(/\.\s+/g, '. ')
    .trim();
}

/**
 * Determines if content has enough text to be spoken
 * @param content - The markdown content to check
 * @returns True if content is worth speaking
 */
export function isSpeakable(content: string): boolean {
  const speakableText = extractSpeakableText(content);
  return speakableText.length > 10; // Minimum threshold
}

/**
 * Chunks long text into manageable segments for TTS API
 * @param text - The text to chunk
 * @param maxLength - Maximum length per chunk (default 5000)
 * @returns Array of text chunks
 */
export function chunkText(text: string, maxLength = 5000): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = text.split(/([.!?]\s+)/); // Split on sentence boundaries
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        // Single sentence longer than max, force split
        chunks.push(sentence.substring(0, maxLength));
        currentChunk = sentence.substring(maxLength);
      }
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((chunk) => chunk.length > 0);
}
