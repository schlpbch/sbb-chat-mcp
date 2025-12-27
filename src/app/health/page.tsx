'use client';

import { useState, useEffect } from 'react';
import { getMcpServerUrl } from '@/config/env';
import type { Language } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';

interface McpHealthDetails {
 status: string;
 responseTime?: number;
 tools?: number;
 prompts?: number;
 resources?: number;
 serverUrl?: string;
 components?: Record<string, any>;
 error?: string;
 toolsList?: any[];
 promptsList?: any[];
 resourcesList?: any[];
}

interface HealthCheck {
 status: 'healthy' | 'degraded' | 'unhealthy';
 timestamp: string;
 checks: {
 mcp: McpHealthDetails;
 };
}

export default function HealthPage() {
 const [healthData, setHealthData] = useState<HealthCheck | null>(null);
 const [loading, setLoading] = useState(true);
 const [language, setLanguage] = useState<Language>('en');
 const [isMenuOpen, setIsMenuOpen] = useState(false);

 useEffect(() => {
 async function runHealthChecks() {
 setLoading(true);
 const mcpServerUrl = getMcpServerUrl();
 const checks: HealthCheck['checks'] = {
 mcp: { status: 'unknown', serverUrl: mcpServerUrl },
 };

 try {
 const mcpStart = Date.now();
 const [toolsRes, promptsRes, resourcesRes, healthRes] = await Promise.all([
 fetch(`/api/mcp-proxy/tools?server=${encodeURIComponent(mcpServerUrl)}`),
 fetch(`/api/mcp-proxy/prompts?server=${encodeURIComponent(mcpServerUrl)}`),
 fetch(`/api/mcp-proxy/resources?server=${encodeURIComponent(mcpServerUrl)}`),
 fetch(`${mcpServerUrl}/actuator/health`).catch(() => null),
 ]);

 checks.mcp.responseTime = Date.now() - mcpStart;

 if (toolsRes.ok) {
 const toolsData = await toolsRes.json();
 checks.mcp.tools = toolsData.tools?.length || 0;
 checks.mcp.toolsList = toolsData.tools || [];
 }

 if (promptsRes.ok) {
 const promptsData = await promptsRes.json();
 checks.mcp.prompts = promptsData.prompts?.length || 0;
 checks.mcp.promptsList = promptsData.prompts || [];
 }

 if (resourcesRes.ok) {
 const resourcesData = await resourcesRes.json();
 checks.mcp.resources = resourcesData.resources?.length || 0;
 checks.mcp.resourcesList = resourcesData.resources || [];
 }

 if (healthRes && healthRes.ok) {
 const healthData = await healthRes.json();
 checks.mcp.components = healthData.components || {};
 }

 if (checks.mcp.tools && checks.mcp.tools > 0) {
 checks.mcp.status = 'healthy';
 } else if (checks.mcp.tools === 0) {
 checks.mcp.status = 'degraded';
 checks.mcp.error = 'No tools available';
 } else {
 checks.mcp.status = 'unhealthy';
 checks.mcp.error = 'Failed to fetch MCP data';
 }
 } catch (error) {
 checks.mcp.status = 'unhealthy';
 checks.mcp.error = error instanceof Error ? error.message : 'Unknown error';
 }

 const overallStatus = checks.mcp.status === 'healthy' ? 'healthy' : checks.mcp.status === 'unhealthy' ? 'unhealthy' : 'degraded';

 setHealthData({
 status: overallStatus,
 timestamp: new Date().toISOString(),
 checks,
 });
 setLoading(false);
 }

 runHealthChecks();
 const interval = setInterval(runHealthChecks, 30000);
 return () => clearInterval(interval);
 }, []);

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'healthy': return 'text-green-600';
 case 'degraded': return 'text-yellow-600';
 case 'unhealthy': return 'text-red-600';
 default: return 'text-gray-600';
 }
 };

 const getStatusBg = (status: string) => {
 switch (status) {
 case 'healthy': return 'bg-green-100';
 case 'degraded': return 'bg-yellow-100';
 case 'unhealthy': return 'bg-red-100';
 default: return 'bg-gray-100';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'healthy':
 return (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 );
 case 'degraded':
 return (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
 </svg>
 );
 case 'unhealthy':
 return (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 );
 default:
 return (
 <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
 </svg>
 );
 }
 };

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
 <div className="max-w-5xl mx-auto">
 {/* Header */}
 <div className="mb-8">
 <h1 className="text-4xl font-bold text-gray-900 mb-2">
 System Health
 </h1>
 <p className="text-lg text-gray-600">
 Real-time monitoring of SBB Travel Assistant services
 </p>
 </div>

 {/* Overall Status Card */}
 {loading ? (
 <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 animate-pulse">
 <div className="h-24 bg-gray-200 rounded"></div>
 </div>
 ) : healthData ? (
 <div className={`rounded-2xl shadow-lg p-8 mb-6 border-2 ${
 healthData.status === 'healthy' ? 'border-green-500 bg-green-50' :
 healthData.status === 'degraded' ? 'border-yellow-500 bg-yellow-50' :
 'border-red-500 bg-red-50'
 }`}>
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-4">
 <div className={getStatusColor(healthData.status)}>
 {getStatusIcon(healthData.status)}
 </div>
 <div>
 <h2 className="text-2xl font-bold text-gray-900">
 System Status: <span className={getStatusColor(healthData.status)}>{healthData.status.toUpperCase()}</span>
 </h2>
 <p className="text-sm text-gray-600 mt-1">
 Last checked: {new Date(healthData.timestamp).toLocaleString()}
 </p>
 </div>
 </div>
 <div className="flex items-center space-x-2">
 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
 <span className="text-sm font-medium text-gray-700">Live</span>
 </div>
 </div>
 </div>
 ) : null}

 {/* MCP Server Details */}
 {healthData && (
 <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
 <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4">
 <h3 className="text-xl font-bold text-white flex items-center space-x-2">
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
 </svg>
 <span>MCP Server</span>
 </h3>
 </div>

 <div className="p-6 space-y-6">
 {/* Status Row */}
 <div className="flex items-center justify-between pb-4 border-b border-gray-200">
 <span className="text-sm font-medium text-gray-600">Connection Status</span>
 <div className="flex items-center space-x-2">
 <div className={getStatusColor(healthData.checks.mcp.status)}>
 {getStatusIcon(healthData.checks.mcp.status)}
 </div>
 <span className={`text-sm font-bold ${getStatusColor(healthData.checks.mcp.status)}`}>
 {healthData.checks.mcp.status.toUpperCase()}
 </span>
 </div>
 </div>

 {/* Metrics Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-gray-50 rounded-xl p-4">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-gray-600">Tools</span>
 <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
 </svg>
 </div>
 <p className="text-3xl font-bold text-gray-900 mt-2">
 {healthData.checks.mcp.tools ?? '—'}
 </p>
 </div>

 <div className="bg-gray-50 rounded-xl p-4">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-gray-600">Prompts</span>
 <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
 </svg>
 </div>
 <p className="text-3xl font-bold text-gray-900 mt-2">
 {healthData.checks.mcp.prompts ?? '—'}
 </p>
 </div>

 <div className="bg-gray-50 rounded-xl p-4">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-gray-600">Resources</span>
 <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
 </svg>
 </div>
 <p className="text-3xl font-bold text-gray-900 mt-2">
 {healthData.checks.mcp.resources ?? '—'}
 </p>
 </div>
 </div>

 {/* Response Time */}
 {healthData.checks.mcp.responseTime && (
 <div className="flex items-center justify-between pb-4 border-b border-gray-200">
 <span className="text-sm font-medium text-gray-600">Response Time</span>
 <span className="text-lg font-bold text-gray-900">
 {healthData.checks.mcp.responseTime}ms
 </span>
 </div>
 )}

 {/* Server URL */}
 {healthData.checks.mcp.serverUrl && (
 <div className="bg-gray-50 rounded-xl p-4">
 <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Server URL</span>
 <code className="block mt-2 text-sm text-gray-900 font-mono break-all">
 {healthData.checks.mcp.serverUrl}
 </code>
 </div>
 )}

 {/* Error Message */}
 {healthData.checks.mcp.error && (
 <div className="bg-red-50 border border-red-200 rounded-xl p-4">
 <div className="flex items-start space-x-3">
 <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <div>
 <h4 className="text-sm font-semibold text-red-800">Error</h4>
 <p className="text-sm text-red-700 mt-1">{healthData.checks.mcp.error}</p>
 </div>
 </div>
 </div>
 )}

 {/* Tools List */}
 {healthData.checks.mcp.toolsList && healthData.checks.mcp.toolsList.length > 0 && (
 <details className="group">
 <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-blue-600 flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
 <div className="flex items-center space-x-2">
 <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
 </svg>
 <span>Available Tools ({healthData.checks.mcp.toolsList.length})</span>
 </div>
 <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </summary>
 <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
 {healthData.checks.mcp.toolsList.map((tool: any, idx: number) => (
 <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h5 className="font-semibold text-gray-900">{tool.name}</h5>
 {tool.description && (
 <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
 )}
 </div>
 </div>
 {tool.inputSchema && (
 <details className="mt-2">
 <summary className="text-xs text-blue-600 cursor-pointer hover:underline">View Schema</summary>
 <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
 {JSON.stringify(tool.inputSchema, null, 2)}
 </pre>
 </details>
 )}
 </div>
 ))}
 </div>
 </details>
 )}

 {/* Prompts List */}
 {healthData.checks.mcp.promptsList && healthData.checks.mcp.promptsList.length > 0 && (
 <details className="group">
 <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-purple-600 flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
 <div className="flex items-center space-x-2">
 <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
 </svg>
 <span>Available Prompts ({healthData.checks.mcp.promptsList.length})</span>
 </div>
 <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </summary>
 <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
 {healthData.checks.mcp.promptsList.map((prompt: any, idx: number) => (
 <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
 <h5 className="font-semibold text-gray-900">{prompt.name}</h5>
 {prompt.description && (
 <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
 )}
 {prompt.arguments && prompt.arguments.length > 0 && (
 <div className="mt-2">
 <span className="text-xs font-medium text-gray-500">Arguments:</span>
 <div className="mt-1 flex flex-wrap gap-2">
 {prompt.arguments.map((arg: any, argIdx: number) => (
 <span key={argIdx} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
 {arg.name}{arg.required && '*'}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>
 ))}
 </div>
 </details>
 )}

 {/* Resources List */}
 {healthData.checks.mcp.resourcesList && healthData.checks.mcp.resourcesList.length > 0 && (
 <details className="group">
 <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-green-600 flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
 <div className="flex items-center space-x-2">
 <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
 </svg>
 <span>Available Resources ({healthData.checks.mcp.resourcesList.length})</span>
 </div>
 <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </summary>
 <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
 {healthData.checks.mcp.resourcesList.map((resource: any, idx: number) => (
 <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h5 className="font-semibold text-gray-900">{resource.name}</h5>
 {resource.description && (
 <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
 )}
 {resource.uri && (
 <code className="block mt-2 text-xs text-gray-600 font-mono">{resource.uri}</code>
 )}
 </div>
 </div>
 {resource.mimeType && (
 <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
 {resource.mimeType}
 </span>
 )}
 </div>
 ))}
 </div>
 </details>
 )}

 {/* Backend Components */}
 {healthData.checks.mcp.components && Object.keys(healthData.checks.mcp.components).length > 0 && (
 <details className="group">
 <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-blue-600 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
 <span>Backend Components ({Object.keys(healthData.checks.mcp.components).length})</span>
 <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </summary>
 <div className="mt-3 space-y-2">
 {Object.entries(healthData.checks.mcp.components).map(([key, value]: [string, any]) => (
 <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
 <span className="text-sm font-medium text-gray-700">{key}</span>
 <span className={`text-sm font-bold ${getStatusColor(value.status)}`}>
 {value.status}
 </span>
 </div>
 ))}
 </div>
 </details>
 )}
 </div>
 </div>
 )}

 {/* Refresh Button */}
 <div className="mt-8 flex justify-center">
 <button
 onClick={() => window.location.reload()}
 className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
 </svg>
 <span>Refresh Now</span>
 </button>
 </div>
 </div>
 </main>
 </div>
 );
}
