import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Root, Heading, List, Strong, Emphasis, InlineCode, Table } from 'mdast';

export interface ParsedIntent {
  mainQuery: string;
  structuredData?: {
    date?: string;
    time?: string;
    preferences?: string[];
    comparisons?: Array<{ route: string; criteria: string }>;
  };
  queryType?: 'journey' | 'station' | 'weather' | 'comparison' | 'multi-part' | 'general';
  subQueries?: string[];
  hasMarkdown: boolean;
}

/**
 * Parse markdown-formatted user input to extract structured intent
 */
export function parseMarkdownIntent(markdown: string): ParsedIntent {
  if (!markdown || !markdown.trim()) {
    return {
      mainQuery: '',
      hasMarkdown: false,
    };
  }

  // Check if input contains markdown syntax
  const hasMarkdown = /[*_`#\-\[\]|]/.test(markdown);

  if (!hasMarkdown) {
    // Plain text - return as-is
    return {
      mainQuery: markdown.trim(),
      hasMarkdown: false,
      queryType: 'general',
    };
  }

  // Parse markdown to AST
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(markdown) as Root;

  // Extract intent from AST
  const intent: ParsedIntent = {
    mainQuery: markdown.trim(),
    hasMarkdown: true,
    structuredData: {},
  };

  // Walk the AST to extract structured data
  const headings: string[] = [];
  const lists: string[][] = [];
  const tables: Table[] = [];

  function walkNode(node: any) {
    if (node.type === 'heading') {
      const text = extractText(node);
      if (text) headings.push(text);
    } else if (node.type === 'list') {
      const items = node.children
        .map((item: any) => extractText(item))
        .filter(Boolean);
      if (items.length > 0) lists.push(items);
    } else if (node.type === 'table') {
      tables.push(node);
    }

    if (node.children) {
      node.children.forEach(walkNode);
    }
  }

  tree.children.forEach(walkNode);

  // Extract structured data from parsed elements
  extractDateTime(markdown, intent);
  extractPreferences(lists, intent);
  extractSubQueries(headings, lists, intent);
  extractComparisons(tables, intent);
  determineQueryType(intent, headings, lists, tables);

  return intent;
}

/**
 * Extract text content from a node
 */
function extractText(node: any): string {
  if (node.type === 'text') {
    return node.value;
  }
  if (node.type === 'inlineCode') {
    return node.value;
  }
  if (node.children) {
    return node.children.map(extractText).join('');
  }
  return '';
}

/**
 * Extract date and time information from the full text
 */
function extractDateTime(fullText: string, intent: ParsedIntent) {
  // Date patterns
  const datePatterns = [
    /\b(today|tomorrow|yesterday)\b/i,
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\b(\d{1,2}[\/\-\.]\d{1,2}(?:[\/\-\.]\d{2,4})?)\b/,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i,
  ];
  
  // Time patterns
  const timePatterns = [
    /\b(\d{1,2}:\d{2}(?:\s*[ap]m)?)\b/i,
    /\b(\d{1,2}\s*[ap]m)\b/i,
    /\bat\s+`?(\d{1,2}(?::\d{2})?(?:\s*[ap]m)?)`?/i,
  ];
  
  for (const pattern of datePatterns) {
    const match = fullText.match(pattern);
    if (match && !intent.structuredData!.date) {
      intent.structuredData!.date = match[1];
    }
  }
  
  for (const pattern of timePatterns) {
    const match = fullText.match(pattern);
    if (match && !intent.structuredData!.time) {
      intent.structuredData!.time = match[1];
    }
  }
}

/**
 * Extract preferences from lists
 */
function extractPreferences(lists: string[][], intent: ParsedIntent) {
  if (lists.length === 0) return;
  
  // Look for preference keywords
  const preferenceKeywords = [
    'prefer', 'preference', 'requirement', 'need', 'want', 'show', 'include',
    'direct', 'eco', 'fast', 'cheap', 'first class', 'second class'
  ];
  
  const preferences: string[] = [];
  
  for (const list of lists) {
    for (const item of list) {
      const lowerItem = item.toLowerCase();
      const hasPreferenceKeyword = preferenceKeywords.some(kw => lowerItem.includes(kw));
      
      if (hasPreferenceKeyword || list.length <= 5) {
        preferences.push(item);
      }
    }
  }
  
  if (preferences.length > 0) {
    intent.structuredData!.preferences = preferences;
  }
}

/**
 * Extract sub-queries from headings and numbered lists
 */
function extractSubQueries(headings: string[], lists: string[][], intent: ParsedIntent) {
  const subQueries: string[] = [];
  
  // Numbered lists often indicate multiple questions
  for (const list of lists) {
    if (list.length >= 2) {
      // Check if items look like questions
      const hasQuestions = list.some(item => 
        item.includes('?') || 
        /^(what|where|when|how|why|show|find|get)/i.test(item)
      );
      
      if (hasQuestions) {
        subQueries.push(...list);
      }
    }
  }
  
  if (subQueries.length > 0) {
    intent.subQueries = subQueries;
  }
}

/**
 * Extract comparison data from tables
 */
function extractComparisons(tables: Table[], intent: ParsedIntent) {
  if (tables.length === 0) return;
  
  const comparisons: Array<{ route: string; criteria: string }> = [];
  
  for (const table of tables) {
    if (table.children.length < 2) continue;
    
    const rows = table.children.slice(1); // Skip header
    
    for (const row of rows) {
      if (row.type === 'tableRow' && row.children.length >= 2) {
        const route = extractText(row.children[0]);
        const criteria = extractText(row.children[1]);
        
        if (route && criteria) {
          comparisons.push({ route, criteria });
        }
      }
    }
  }
  
  if (comparisons.length > 0) {
    intent.structuredData!.comparisons = comparisons;
  }
}

/**
 * Determine the query type based on extracted data
 */
function determineQueryType(
  intent: ParsedIntent,
  headings: string[],
  lists: string[][],
  tables: Table[]
) {
  if (intent.structuredData?.comparisons && intent.structuredData.comparisons.length > 0) {
    intent.queryType = 'comparison';
  } else if (intent.subQueries && intent.subQueries.length > 1) {
    intent.queryType = 'multi-part';
  } else if (/\b(train|trip|journey|connection|from|to)\b/i.test(intent.mainQuery)) {
    intent.queryType = 'journey';
  } else if (/weather|temperature|forecast/i.test(intent.mainQuery)) {
    intent.queryType = 'weather';
  } else if (/station|facility|platform|track/i.test(intent.mainQuery)) {
    intent.queryType = 'station';
  } else {
    intent.queryType = 'general';
  }
}
