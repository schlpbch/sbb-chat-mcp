'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import { translations } from '@/lib/i18n';
import { getMcpServerUrl } from '@/config/env';
import { useLanguage } from '@/hooks/useLanguage';

interface ResourceSchema {
 uri: string;
 name: string;
 description?: string;
 mimeType?: string;
}

export default function ResourceTestPage() {
 const params = useParams();
 const router = useRouter();
 const resourceUri = decodeURIComponent(params.uri as string);

 const [language, setLanguage] = useLanguage();
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 const [resource, setResource] = useState<ResourceSchema | null>(null);
 const [loading, setLoading] = useState(true);
 const [fetching, setFetching] = useState(false);
 const [content, setContent] = useState<any>(null);
 const [error, setError] = useState<string | null>(null);
 const [mcpServerUrl, setMcpServerUrl] = useState(getMcpServerUrl());

 const t = translations[language];

 useEffect(() => {
 const savedUrl = localStorage.getItem('mcpServerUrl');
 if (savedUrl) setMcpServerUrl(savedUrl);
 }, []);

 useEffect(() => {
 async function loadResource() {
 try {
 const response = await fetch(
 `/api/mcp-proxy/resources?server=${encodeURIComponent(mcpServerUrl)}`
 );
 if (response.ok) {
 const data = await response.json();
 const foundResource = data.resources?.find(
 (r: ResourceSchema) => r.uri === resourceUri
 );
 if (foundResource) {
 setResource(foundResource);
 } else {
 setError('Resource not found');
 }
 }
 } catch (err) {
 setError('Failed to load resource');
 } finally {
 setLoading(false);
 }
 }
 loadResource();
 }, [resourceUri, mcpServerUrl]);

 const fetchResource = async () => {
 setFetching(true);
 setError(null);
 setContent(null);

 try {
 // Use proxy route to avoid CORS issues
 const response = await fetch(
 `/api/mcp-proxy/resources/read?server=${encodeURIComponent(
 mcpServerUrl
 )}&uri=${encodeURIComponent(resourceUri)}`
 );

 // Get response text first to handle both JSON and error cases
 const text = await response.text();
 let data;

 try {
 data = JSON.parse(text);
 } catch (parseError) {
 // If JSON parsing fails, show the raw response
 setError(
 `Invalid JSON response (Status ${response.status}): ${text.substring(
 0,
 200
 )}${text.length > 200 ? '...' : ''}`
 );
 setFetching(false);
 return;
 }

 if (response.ok) {
 setContent(data);
 } else {
 // Detailed error message with status code and server response
 const errorMsg =
 data.error || data.message || 'Failed to fetch resource';
 setError(
 `Error ${response.status}: ${errorMsg}${
 data.details
 ? `\n\nDetails: ${JSON.stringify(data.details, null, 2)}`
 : ''
 }`
 );
 }
 } catch (err) {
 // Network or other errors
 if (err instanceof TypeError && err.message.includes('fetch')) {
 setError(
 `Network Error: Unable to connect to server. Please check:\n- Server URL: ${mcpServerUrl}\n- Network connection\n- CORS configuration`
 );
 } else {
 setError(
 `Error: ${
 err instanceof Error ? err.message : 'Unknown error'
 }\n\nStack: ${err instanceof Error ? err.stack : 'N/A'}`
 );
 }
 } finally {
 setFetching(false);
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-screen bg-gray-50">
 <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
 Loading...
 </div>
 </div>
 );
 }

 if (!resource) {
 return (
 <div className="flex items-center justify-center h-screen bg-gray-50">
 <div className="text-center">
 <p className="text-red-600 dark:text-red-400 mb-4 transition-colors">Resource not found</p>
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
 {resource.name}
 </h1>
 <code className="text-xs font-mono text-sbb-red bg-red-50 dark:text-red-300 dark:bg-red-900/30 px-2 py-1 rounded transition-colors">
 {resource.uri}
 </code>
 {resource.description && (
 <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 transition-colors">
 {resource.description}
 </p>
 )}
 </div>

 {/* Fetch Button */}
 <div className="mb-4">
 <button
 onClick={fetchResource}
 disabled={fetching}
 className="px-4 py-2 bg-sbb-red hover:bg-sbb-red-dark text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
 >
 {fetching ? 'Fetching...' : 'Fetch Resource'}
 </button>
 </div>

 {/* Error */}
 {error && (
 <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-200 px-4 py-3 rounded transition-colors">
 <h3 className="font-semibold mb-2">Error Details:</h3>
 <pre className="text-xs whitespace-pre-wrap font-mono overflow-x-auto">
 {error}
 </pre>
 </div>
 )}

 {/* Content */}
 {content ? (
 <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4 transition-colors">
 <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 transition-colors">
 Resource Content
 </h2>
 <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-auto max-h-96 transition-colors">
 <pre className="text-xs text-gray-800 dark:text-gray-200 font-mono">
 {JSON.stringify(content, null, 2)}
 </pre>
 </div>
 </div>
 ) : (
 <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-8 text-center transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Preview of &quot;{content.length > 20 ? content.substring(0, 20) + '...' : content}&quot;
          </p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
