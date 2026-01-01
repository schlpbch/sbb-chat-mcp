'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import { Language, translations } from '@/lib/i18n';
import { getToolDefaults } from '@/lib/toolDefaults';
import { getMcpServerUrl } from '@/config/env';

interface ToolSchema {
 name: string;
 description: string;
 inputSchema: {
 type: string;
 properties: Record<string, any>;
 required?: string[];
 };
}

export default function ToolTestPage() {
 const params = useParams();
 const router = useRouter();
 const toolName = params.name as string;

 const [language, setLanguage] = useState<Language>('en');
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 const [tool, setTool] = useState<ToolSchema | null>(null);
 const [loading, setLoading] = useState(true);
 const [executing, setExecuting] = useState(false);
 const [inputs, setInputs] = useState<Record<string, any>>({});
 const [result, setResult] = useState<any>(null);
 const [error, setError] = useState<string | null>(null);
 const [mcpServerUrl, setMcpServerUrl] = useState(getMcpServerUrl());

 const t = translations[language];

 useEffect(() => {
 const savedUrl = localStorage.getItem('mcpServerUrl');
 if (savedUrl) setMcpServerUrl(savedUrl);
 }, []);

 useEffect(() => {
 async function loadTool() {
 try {
 const response = await fetch(
 `/api/mcp-proxy/tools?server=${encodeURIComponent(mcpServerUrl)}`
 );
 if (response.ok) {
 const data = await response.json();
 const foundTool = data.tools?.find(
 (t: ToolSchema) => t.name === toolName
 );
 if (foundTool) {
 setTool(foundTool);
 // Initialize inputs with sensible defaults
 const defaults = getToolDefaults(toolName);
 const initialInputs: Record<string, any> = {};
 Object.keys(foundTool.inputSchema.properties || {}).forEach(
 (key) => {
 initialInputs[key] = defaults[key] ?? '';
 }
 );
 setInputs(initialInputs);
 } else {
 setError('Tool not found');
 }
 }
 } catch (err) {
 setError('Failed to load tool');
 } finally {
 setLoading(false);
 }
 }
 loadTool();
 }, [toolName, mcpServerUrl]);

 const handleInputChange = (key: string, value: any) => {
 setInputs((prev) => ({ ...prev, [key]: value }));
 };

 const executeTool = async () => {
 setExecuting(true);
 setError(null);
 setResult(null);

 try {
 // Filter out empty string values - the backend expects optional params to be omitted
 const filteredInputs = Object.fromEntries(
 Object.entries(inputs).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
 );

 // Use the proxy endpoint to avoid CORS issues
 const response = await fetch(
 `/api/mcp-proxy/tools/${encodeURIComponent(toolName)}?server=${encodeURIComponent(mcpServerUrl)}`,
 {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(filteredInputs),
 }
 );

 const data = await response.json();
 if (response.ok) {
 setResult(data);
 } else {
 setError(data.error || 'Tool execution failed');
 }
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Unknown error');
 } finally {
 setExecuting(false);
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-screen bg-gray-50">
 <div className="text-sm text-gray-600 dark:text-gray-400">
 Loading...
 </div>
 </div>
 );
 }

 if (!tool) {
 return (
 <div className="flex items-center justify-center h-screen bg-gray-50">
 <div className="text-center">
 <p className="text-red-600 dark:text-red-400 mb-4">Tool not found</p>
 <button
 onClick={() => router.push('/mcp-test')}
 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
 >
 Back to Inspector
 </button>
 </div>
 </div>
 );
 }

 return (
  <div className="flex flex-col h-screen w-screen overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
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
 <div className="max-w-4xl mx-auto">
 {/* Header */}
 <div className="mb-4">
 <button
  onClick={() => router.push('/mcp-test')}
  className="text-sm text-blue-600 hover:underline mb-2 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
 >
 ← Back to MCP Inspector
 </button>
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors">
 {tool.name}
 </h1>
  <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors">
 {tool.description}
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  {/* Input Form */}
  <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4 transition-colors">
  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 transition-colors">
 Input Parameters
 </h2>

 <div className="space-y-3">
 {Object.entries(tool.inputSchema.properties || {}).map(
 ([key, schema]: [string, any]) => (
 <div key={key}>
 <label
  htmlFor={`input-${key}`}
  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors"
 >
 {key}
 {tool.inputSchema.required?.includes(key) && (
 <span
  className="text-red-600 dark:text-red-400 ml-1 transition-colors"
 aria-label="required"
 >
 *
 </span>
 )}
 </label>
 <input
 id={`input-${key}`}
 type={schema.type === 'number' ? 'number' : 'text'}
 value={inputs[key] || ''}
 onChange={(e) => {
                    const value = schema.type === 'number' 
                      ? (e.target.value === '' ? '' : Number(e.target.value))
                      : e.target.value;
                    handleInputChange(key, value);
                  }}
 placeholder={schema.description || key}
 required={tool.inputSchema.required?.includes(key)}
 aria-describedby={
 schema.description ? `desc-${key}` : undefined
 }
  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
 />
 {schema.description && (
 <p
 id={`desc-${key}`}
  className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors"
 >
 {schema.description}
 </p>
 )}
 </div>
 )
 )}
 </div>

 <button
 onClick={executeTool}
 disabled={executing}
 aria-busy={executing}
 aria-label="Execute tool with provided parameters"
  className="w-full mt-4 px-4 py-2 bg-sbb-red hover:bg-sbb-red-dark text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition-all focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-md hover:shadow-lg"
 >
 {executing ? 'Executing...' : 'Execute Tool'}
 </button>
 </div>

  {/* Results */}
  <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4 transition-colors">
 <div className="flex items-center justify-between mb-3">
  <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
 Results
 </h2>
 {result && (
 <button
 onClick={(e) => {
 navigator.clipboard.writeText(
 JSON.stringify(result, null, 2)
 );
 // Visual feedback
 const btn = e.currentTarget;
 const originalText = btn.textContent;
 btn.textContent = '✓ Copied!';
 setTimeout(() => {
 btn.textContent = originalText || 'Copy JSON';
 }, 2000);
 }}
  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
 aria-label="Copy JSON result to clipboard"
 >
 Copy JSON
 </button>
 )}
 </div>

 {error && (
  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-200 px-3 py-2 text-sm rounded mb-3 transition-colors">
 {error}
 </div>
 )}

 {result ? (
  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-auto max-h-96 transition-colors">
  <pre className="text-xs text-gray-800 dark:text-gray-200 font-mono">
 {JSON.stringify(result, null, 2)}
 </pre>
 </div>
 ) : (
  <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400 transition-colors">
 Execute the tool to see results
 </div>
 )}
 </div>
 </div>

  {/* Schema Info */}
  <details className="mt-4 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4 transition-colors">
  <summary className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
 View Full Schema
 </summary>
  <div className="mt-3 bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 transition-colors">
  <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto font-mono">
 {JSON.stringify(tool.inputSchema, null, 2)}
 </pre>
 </div>
 </details>
 </div>
 </div>
 </div>
 );
}
