'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import { Language, translations } from '@/lib/i18n';
import { getMcpServerUrl } from '@/config/env';

interface PromptSchema {
 name: string;
 description?: string;
 arguments?: Array<{
 name: string;
 description?: string;
 required?: boolean;
 }>;
}

export default function PromptTestPage() {
 const params = useParams();
 const router = useRouter();
 const promptName = params.name as string;

 const [language, setLanguage] = useState<Language>('en');
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 const [prompt, setPrompt] = useState<PromptSchema | null>(null);
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
 async function loadPrompt() {
 try {
 const response = await fetch(
 `/api/mcp-proxy/prompts?server=${encodeURIComponent(mcpServerUrl)}`
 );
 if (response.ok) {
 const data = await response.json();
 const foundPrompt = data.prompts?.find(
 (p: PromptSchema) => p.name === promptName
 );
 if (foundPrompt) {
 setPrompt(foundPrompt);
 // Initialize inputs
 const initialInputs: Record<string, any> = {};
 foundPrompt.arguments?.forEach((arg: { name: string }) => {
 initialInputs[arg.name] = '';
 });
 setInputs(initialInputs);
 } else {
 setError('Prompt not found');
 }
 }
 } catch (err) {
 setError('Failed to load prompt');
 } finally {
 setLoading(false);
 }
 }
 loadPrompt();
 }, [promptName, mcpServerUrl]);

 const handleInputChange = (key: string, value: any) => {
 setInputs((prev) => ({ ...prev, [key]: value }));
 };

 const executePrompt = async () => {
 setExecuting(true);
 setError(null);
 setResult(null);

 try {
 // Filter out empty string values
 const filteredInputs = Object.fromEntries(
 Object.entries(inputs).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
 );

 // Use the proxy endpoint to avoid CORS issues
 const response = await fetch(
 `/api/mcp-proxy/prompts/${encodeURIComponent(promptName)}?server=${encodeURIComponent(mcpServerUrl)}`,
 {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ arguments: filteredInputs }),
 }
 );

 const data = await response.json();
 if (response.ok) {
 setResult(data);
 } else {
 setError(data.error || 'Prompt execution failed');
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
 <div className="text-sm text-gray-600">
 Loading...
 </div>
 </div>
 );
 }

 if (!prompt) {
 return (
 <div className="flex items-center justify-center h-screen bg-gray-50">
 <div className="text-center">
 <p className="text-red-600 mb-4">Prompt not found</p>
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
 <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
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
 className="text-sm text-blue-600 hover:underline mb-2"
 aria-label="Back to MCP Inspector"
 >
 ← Back to MCP Inspector
 </button>
 <h1 
 className="text-2xl font-bold text-gray-900 mb-1"
 id="prompt-title"
 >
 {promptName}
 </h1>
 {prompt.description && (
 <p className="text-sm text-gray-600">
 {prompt.description}
 </p>
 )}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* Input Form */}
 <section 
 className="bg-white rounded border border-gray-200 p-4"
 aria-labelledby="arguments-heading"
 >
 <h2 
 id="arguments-heading"
 className="text-lg font-semibold text-gray-900 mb-3"
 >
 Arguments
 </h2>

 {prompt.arguments && prompt.arguments.length > 0 ? (
 <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); executePrompt(); }}>
 {prompt.arguments.map((arg) => (
 <div key={arg.name}>
 <label 
 htmlFor={`arg-${arg.name}`}
 className="block text-sm font-medium text-gray-700 mb-1"
 >
 {arg.name}
 {arg.required && (
 <span className="text-red-600 ml-1">*</span>
 )}
 </label>
 <input
 id={`arg-${arg.name}`}
 name={arg.name}
 type="text"
 required={arg.required}
 aria-required={arg.required}
 aria-describedby={arg.description ? `arg-${arg.name}-desc` : undefined}
 value={inputs[arg.name] || ''}
 onChange={(e) =>
 handleInputChange(arg.name, e.target.value)
 }
 placeholder={arg.description || arg.name}
 className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
 />
 {arg.description && (
 <p 
 id={`arg-${arg.name}-desc`}
 className="text-xs text-gray-500 mt-1"
 >
 {arg.description}
 </p>
 )}
 </div>
 ))}
 <button
 type="submit"
 disabled={executing}
 className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
 aria-busy={executing}
 >
 {executing ? 'Executing...' : 'Execute Prompt'}
 </button>
 </form>
 ) : (
 <div>
 <p className="text-sm text-gray-500">
 No arguments required
 </p>
 <button
 onClick={executePrompt}
 disabled={executing}
 className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
 aria-busy={executing}
 >
 {executing ? 'Executing...' : 'Execute Prompt'}
 </button>
 </div>
 )}
 </section>

 {/* Results */}
 <section 
 className="bg-white rounded border border-gray-200 p-4"
 aria-labelledby="results-heading"
 aria-live="polite"
 aria-atomic="true"
 >
 <h2 
 id="results-heading"
 className="text-lg font-semibold text-gray-900 mb-3"
 >
 Results
 </h2>

 {error && (
 <div
 role="alert"
 aria-live="assertive"
 className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2 text-sm rounded mb-3"
 >
 {error}
 </div>
 )}

 {result ? (
 <div className="bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-96">
 <pre className="text-xs text-gray-800">
 {JSON.stringify(result, null, 2)}
 </pre>
 </div>
 ) : (
 <div className="text-center py-8 text-sm text-gray-500">
 Execute the prompt to see results
 </div>
 )}
 </section>
 </div>
 </div>
 </div>
 </div>
 );
}
