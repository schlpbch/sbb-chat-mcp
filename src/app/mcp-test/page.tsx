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
 const [activeTab, setActiveTab] = useState<'tools' | 'resources' | 'prompts'>('tools');
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');

 const t = translations[language];

 useEffect(() => {
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
 const serverParam = `?server=${encodeURIComponent(mcpServerUrl)}`;

 const [toolsResponse, resourcesResponse, promptsResponse] = await Promise.all([
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

 // Filter items based on search
 const filteredTools = tools.filter(tool =>
 tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 tool.description.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const filteredResources = resources.filter(resource =>
 resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 resource.uri.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const filteredPrompts = prompts.filter(prompt =>
 prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (prompt.description && prompt.description.toLowerCase().includes(searchQuery.toLowerCase()))
 );

 return (
 <div className="flex flex-col min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
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

 <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8 pb-12">
 <div className="max-w-7xl mx-auto">
 {/* Header */}
 <div className="mb-8">
 <h1 className="text-4xl font-bold text-gray-900 mb-2">
 MCP Inspector
 </h1>
 <p className="text-lg text-gray-600">
 Explore available tools, resources, and prompts
 </p>
 <code className="mt-2 inline-block text-sm bg-gray-200 px-3 py-1 rounded-lg text-gray-700">
 {mcpServerUrl}
 </code>
 </div>

 {/* Error Display */}
 {error && (
 <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
 <div className="flex items-start space-x-3">
 <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <div>
 <h4 className="text-sm font-semibold text-red-800">Error</h4>
 <p className="text-sm text-red-700 mt-1">{error}</p>
 </div>
 </div>
 </div>
 )}

 {/* Loading State */}
 {loading && (
 <div className="flex items-center justify-center py-16">
 <div className="text-center">
 <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
 <p className="text-gray-600">Loading MCP data...</p>
 </div>
 </div>
 )}

 {/* Main Content */}
 {!loading && (
 <>
 {/* Search Bar */}
 <div className="mb-6">
 <div className="relative">
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search tools, resources, or prompts..."
 className="w-full px-4 py-3 pl-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 />
 <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 </div>
 </div>

 {/* Tabs */}
 <div className="flex space-x-1 mb-6 bg-white p-1 rounded-xl border border-gray-200">
 <button
 onClick={() => setActiveTab('tools')}
 className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
 activeTab === 'tools'
 ? 'bg-blue-600 text-white shadow-lg'
 : 'text-gray-600 hover:bg-gray-100'
 }`}
 >
 <div className="flex items-center justify-center space-x-2">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
 </svg>
 <span>Tools ({filteredTools.length})</span>
 </div>
 </button>
 <button
 onClick={() => setActiveTab('resources')}
 className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
 activeTab === 'resources'
 ? 'bg-green-600 text-white shadow-lg'
 : 'text-gray-600 hover:bg-gray-100'
 }`}
 >
 <div className="flex items-center justify-center space-x-2">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
 </svg>
 <span>Resources ({filteredResources.length})</span>
 </div>
 </button>
 <button
 onClick={() => setActiveTab('prompts')}
 className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
 activeTab === 'prompts'
 ? 'bg-purple-600 text-white shadow-lg'
 : 'text-gray-600 hover:bg-gray-100'
 }`}
 >
 <div className="flex items-center justify-center space-x-2">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
 </svg>
 <span>Prompts ({filteredPrompts.length})</span>
 </div>
 </button>
 </div>

 {/* Tools Tab */}
 {activeTab === 'tools' && (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {filteredTools.sort((a, b) => a.name.localeCompare(b.name)).map((tool, index) => {
 const params = Object.entries(tool.inputSchema.properties || {});
 const requiredParams = tool.inputSchema.required || [];

 return (
 <div
 key={index}
 className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-500 hover:shadow-xl transition-all"
 >
 <div className="flex items-start justify-between mb-3">
 <div className="flex-1">
 <div className="flex items-center space-x-2 mb-2">
 <h3 className="text-lg font-bold text-gray-900">
 {tool.name}
 </h3>
 <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
 TOOL
 </span>
 </div>
 <p className="text-sm text-gray-600">
 {tool.description}
 </p>
 </div>
 </div>

 {params.length > 0 && (
 <div className="mt-4 pt-4 border-t border-gray-200">
 <div className="flex items-center justify-between mb-3">
 <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
 Parameters ({params.length})
 </span>
 {requiredParams.length > 0 && (
 <span className="text-xs text-red-600">
 {requiredParams.length} required
 </span>
 )}
 </div>
 <div className="flex flex-wrap gap-2">
 {params.map(([key, schema]: [string, any]) => (
 <span
 key={key}
 className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
 requiredParams.includes(key)
 ? 'bg-red-50 text-red-700 border border-red-200'
 : 'bg-gray-100 text-gray-700'
 }`}
 >
 <code className="font-mono">{key}</code>
 {schema.type && (
 <span className="opacity-60">: {schema.type}</span>
 )}
 {requiredParams.includes(key) && (
 <span className="text-red-600">*</span>
 )}
 </span>
 ))}
 </div>
 </div>
 )}

 <details className="mt-4">
 <summary className="text-xs font-semibold text-blue-600 cursor-pointer hover:underline">
 View Full Schema
 </summary>
 <pre className="mt-2 text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto border border-gray-200">
 {JSON.stringify(tool.inputSchema, null, 2)}
 </pre>
 </details>
 </div>
 );
 })}
 {filteredTools.length === 0 && (
 <div className="col-span-2 text-center py-16">
 <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <p className="text-gray-500">No tools found</p>
 </div>
 )}
 </div>
 )}

 {/* Resources Tab */}
 {activeTab === 'resources' && (
 <div className="space-y-4">
 {filteredResources.map((resource, index) => (
 <div
 key={index}
 className="bg-white rounded-xl border border-gray-200 p-6 hover:border-green-500 hover:shadow-xl transition-all"
 >
 <div className="flex items-start justify-between mb-3">
 <h3 className="text-lg font-bold text-gray-900">
 {resource.name}
 </h3>
 <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
 RESOURCE
 </span>
 </div>
 <code className="block text-sm font-mono text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-3">
 {resource.uri}
 </code>
 {resource.description && (
 <p className="text-sm text-gray-600">
 {resource.description}
 </p>
 )}
 {resource.mimeType && (
 <span className="inline-block mt-3 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
 {resource.mimeType}
 </span>
 )}
 </div>
 ))}
 {filteredResources.length === 0 && (
 <div className="text-center py-16">
 <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <p className="text-gray-500">No resources found</p>
 </div>
 )}
 </div>
 )}

 {/* Prompts Tab */}
 {activeTab === 'prompts' && (
 <div className="space-y-4">
 {filteredPrompts.map((prompt, index) => (
 <div
 key={index}
 className="bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-500 hover:shadow-xl transition-all"
 >
 <div className="flex items-start justify-between mb-3">
 <h3 className="text-lg font-bold text-gray-900">
 {prompt.name}
 </h3>
 <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
 PROMPT
 </span>
 </div>
 {prompt.description && (
 <p className="text-sm text-gray-600 mb-3">
 {prompt.description}
 </p>
 )}

 {prompt.arguments && prompt.arguments.length > 0 && (
 <div className="mt-4 pt-4 border-t border-gray-200">
 <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-3">
 Arguments ({prompt.arguments.length})
 </span>
 <div className="space-y-2">
 {prompt.arguments.map((arg, argIndex) => (
 <div
 key={argIndex}
 className="bg-gray-50 p-3 rounded-lg border border-gray-200"
 >
 <div className="flex items-center space-x-2 mb-1">
 <code className="font-mono text-sm text-purple-600">
 {arg.name}
 </code>
 {arg.required && (
 <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
 required
 </span>
 )}
 </div>
 {arg.description && (
 <p className="text-xs text-gray-600">
 {arg.description}
 </p>
 )}
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 ))}
 {filteredPrompts.length === 0 && (
 <div className="text-center py-16">
 <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <p className="text-gray-500">No prompts found</p>
 </div>
 )}
 </div>
 )}
 </>
 )}
 </div>
 </main>
 </div>
 );
}
