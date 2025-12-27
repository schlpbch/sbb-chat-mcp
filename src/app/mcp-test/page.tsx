'use client';

import { useState, useEffect } from 'react';
import { Language, translations } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import { getMcpServerUrl } from '@/config/env';

interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

interface McpResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

interface McpPrompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

export default function McpTestPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [tools, setTools] = useState<McpTool[]>([]);
  const [resources, setResources] = useState<McpResource[]>([]);
  const [prompts, setPrompts] = useState<McpPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mcpServerUrl, setMcpServerUrl] = useState(getMcpServerUrl());
  const [activeTab, setActiveTab] = useState<'tools' | 'resources' | 'prompts'>(
    'tools'
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const t = translations[language];

  // Helper function to get a short summary from description
  const getShortDescription = (description: string): string => {
    if (!description) return '';
    // Take first sentence or first 100 chars, whichever is shorter
    const firstSentence = description.split(/[.!?]/)[0];
    const truncated = firstSentence.length > 100 
      ? firstSentence.substring(0, 100) + '...'
      : firstSentence;
    return truncated;
  };

  useEffect(() => {
    // Load MCP server URL from localStorage if available
    const savedUrl = localStorage.getItem('mcpServerUrl');
    if (savedUrl) {
      setMcpServerUrl(savedUrl);
    }
  }, []);

  useEffect(() => {
    async function fetchMcpData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch through proxy to avoid CORS
        const serverParam = `?server=${encodeURIComponent(mcpServerUrl)}`;

        const [toolsResponse, resourcesResponse, promptsResponse] =
          await Promise.all([
            fetch(`/api/mcp-proxy/tools${serverParam}`),
            fetch(`/api/mcp-proxy/resources${serverParam}`),
            fetch(`/api/mcp-proxy/prompts${serverParam}`),
          ]);

        if (toolsResponse.ok) {
          const toolsData = await toolsResponse.json();
          setTools(toolsData.tools || []);
        }

        if (resourcesResponse.ok) {
          const resourcesData = await resourcesResponse.json();
          setResources(resourcesData.resources || []);
        }

        if (promptsResponse.ok) {
          const promptsData = await promptsResponse.json();
          setPrompts(promptsData.prompts || []);
        }
      } catch (err) {
        setError(
          `Failed to fetch MCP data: ${
            err instanceof Error ? err.message : 'Unknown error'
          }`
        );
        console.error('Error fetching MCP data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMcpData();
  }, [mcpServerUrl]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      />

      <Menu
        language={language}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header - Simplified */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              MCP Inspector
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connected:{' '}
              <code className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">
                {mcpServerUrl}
              </code>
            </p>
          </div>

          {/* Error Display - Compact */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2 text-sm rounded">
              {error}
            </div>
          )}

          {/* Loading State - Minimal */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Loading...
              </div>
            </div>
          )}

          {/* Tabs - Compact */}
          {!loading && (
            <>
              <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('tools')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'tools'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Tools ({tools.length})
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'resources'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Resources ({resources.length})
                </button>
                <button
                  onClick={() => setActiveTab('prompts')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'prompts'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Prompts ({prompts.length})
                </button>
              </div>

              {/* Tools Tab - Two Column Grid */}
              {activeTab === 'tools' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {tools
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((tool, index) => {
                    const params = Object.entries(
                      tool.inputSchema.properties || {}
                    );
                    const requiredParams = tool.inputSchema.required || [];

                    return (
                      <a
                        key={index}
                        href={`/tools/${encodeURIComponent(tool.name)}`}
                        className="block bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-500 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {tool.name}
                              </h3>
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded whitespace-nowrap">
                                TOOL
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                              {getShortDescription(tool.description)}
                            </p>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400 shrink-0 mt-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>

                        {/* Parameters Summary */}
                        {params.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Parameters ({params.length}):
                              </span>
                              {requiredParams.length > 0 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {requiredParams.length} required
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {params
                                .slice(0, 6)
                                .map(([key, schema]: [string, any]) => (
                                  <span
                                    key={key}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                                      requiredParams.includes(key)
                                        ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                                  >
                                    <code className="font-mono">{key}</code>
                                    {schema.type && (
                                      <span className="text-xs opacity-60">
                                        : {schema.type}
                                      </span>
                                    )}
                                    {requiredParams.includes(key) && (
                                      <span className="text-red-600 dark:text-red-400">
                                        *
                                      </span>
                                    )}
                                  </span>
                                ))}
                              {params.length > 6 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5">
                                  +{params.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Full Schema - Collapsible */}
                        <details
                          className="mt-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <summary className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600">
                            View Full Schema
                          </summary>
                          <div className="mt-2 bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                            <pre className="text-xs overflow-x-auto text-gray-800 dark:text-gray-200">
                              {JSON.stringify(tool.inputSchema, null, 2)}
                            </pre>
                          </div>
                        </details>
                      </a>
                    );
                  })}
                  {tools.length === 0 && (
                    <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400 col-span-2">
                      No tools available
                    </div>
                  )}
                </div>
              )}

              {/* Resources Tab - Lightweight */}
              {activeTab === 'resources' && (
                <div className="space-y-3">
                  {resources.map((resource, index) => (
                    <a
                      key={index}
                      href={`/resources/${encodeURIComponent(resource.uri)}`}
                      className="block bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4 hover:border-green-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {resource.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                            RESOURCE
                          </span>
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                      <code className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded block mb-2">
                        {resource.uri}
                      </code>
                      {resource.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {resource.description}
                        </p>
                      )}
                    </a>
                  ))}
                  {resources.length === 0 && (
                    <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                      No resources available
                    </div>
                  )}
                </div>
              )}

              {/* Prompts Tab - Lightweight */}
              {activeTab === 'prompts' && (
                <div className="space-y-3">
                  {prompts.map((prompt, index) => (
                    <a
                      key={index}
                      href={`/prompts/${encodeURIComponent(prompt.name)}`}
                      className="block bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4 hover:border-purple-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {prompt.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">
                            PROMPT
                          </span>
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                      {prompt.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {prompt.description}
                        </p>
                      )}

                      {/* Arguments */}
                      {prompt.arguments && prompt.arguments.length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600">
                            {prompt.arguments.length} Argument
                            {prompt.arguments.length > 1 ? 's' : ''}
                          </summary>
                          <div className="mt-2 space-y-1">
                            {prompt.arguments.map((arg, argIndex) => (
                              <div
                                key={argIndex}
                                className="bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700"
                              >
                                <div className="flex items-center gap-2">
                                  <code className="font-mono text-xs text-blue-600 dark:text-blue-400">
                                    {arg.name}
                                  </code>
                                  {arg.required && (
                                    <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-1.5 py-0.5 rounded">
                                      required
                                    </span>
                                  )}
                                </div>
                                {arg.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {arg.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </a>
                  ))}
                  {prompts.length === 0 && (
                    <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                      No prompts available
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
