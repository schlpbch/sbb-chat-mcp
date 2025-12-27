'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
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
}

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    api: { status: string; responseTime?: number; error?: string };
    data: { status: string; sights: number; resorts: number; error?: string };
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
      const startTime = Date.now();
      const mcpServerUrl = getMcpServerUrl();
      const checks: HealthCheck['checks'] = {
        api: { status: 'unknown' },
        data: { status: 'unknown', sights: 0, resorts: 0 },
        mcp: { status: 'unknown', serverUrl: mcpServerUrl },
      };

      // Check API endpoints
      try {
        const apiStart = Date.now();
        const [sightsRes, resortsRes] = await Promise.all([
          fetch('/api/mcp/sights'),
          fetch('/api/mcp/resorts'),
        ]);

        if (sightsRes.ok && resortsRes.ok) {
          checks.api.status = 'healthy';
          checks.api.responseTime = Date.now() - apiStart;

          // Check data
          const [sightsData, resortsData] = await Promise.all([
            sightsRes.json(),
            resortsRes.json(),
          ]);

          checks.data.sights = sightsData.sights?.length || 0;
          checks.data.resorts =
            resortsData.alpine_resorts_guide_enhanced?.resorts?.length ||
            resortsData.resorts?.length ||
            0;

          if (checks.data.sights > 0 && checks.data.resorts > 0) {
            checks.data.status = 'healthy';
          } else {
            checks.data.status = 'degraded';
            checks.data.error = 'Missing data';
          }
        } else {
          checks.api.status = 'unhealthy';
          checks.api.error = 'API request failed';
          checks.data.status = 'unhealthy';
          checks.data.error = 'Cannot fetch data';
        }
      } catch (error) {
        checks.api.status = 'unhealthy';
        checks.api.error =
          error instanceof Error ? error.message : 'Unknown error';
        checks.data.status = 'unhealthy';
        checks.data.error = 'API unavailable';
      }

      // Check MCP Server - fetch tools, prompts, resources, and backend health
      try {
        const mcpStart = Date.now();
        const [toolsRes, promptsRes, resourcesRes, healthRes] =
          await Promise.all([
            fetch(
              `/api/mcp-proxy/tools?server=${encodeURIComponent(mcpServerUrl)}`
            ),
            fetch(
              `/api/mcp-proxy/prompts?server=${encodeURIComponent(
                mcpServerUrl
              )}`
            ),
            fetch(
              `/api/mcp-proxy/resources?server=${encodeURIComponent(
                mcpServerUrl
              )}`
            ),
            fetch(`${mcpServerUrl}/actuator/health`).catch(() => null),
          ]);

        checks.mcp.responseTime = Date.now() - mcpStart;

        if (toolsRes.ok) {
          const toolsData = await toolsRes.json();
          checks.mcp.tools = toolsData.tools?.length || 0;
        }

        if (promptsRes.ok) {
          const promptsData = await promptsRes.json();
          checks.mcp.prompts = promptsData.prompts?.length || 0;
        }

        if (resourcesRes.ok) {
          const resourcesData = await resourcesRes.json();
          checks.mcp.resources = resourcesData.resources?.length || 0;
        }

        if (healthRes && healthRes.ok) {
          const healthData = await healthRes.json();
          checks.mcp.components = healthData.components || {};
        }

        // Determine status
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
        checks.mcp.error =
          error instanceof Error ? error.message : 'Unknown error';
      }

      // Determine overall status
      const overallStatus = Object.values(checks).every(
        (check) => check.status === 'healthy'
      )
        ? 'healthy'
        : Object.values(checks).some((check) => check.status === 'unhealthy')
        ? 'unhealthy'
        : 'degraded';

      setHealthData({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks,
      });
      setLoading(false);
    }

    runHealthChecks();
    // Refresh every 30 seconds
    const interval = setInterval(runHealthChecks, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'degraded':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'unhealthy':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case 'degraded':
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case 'unhealthy':
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Navbar */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      />

      {/* Menu */}
      <Menu
        language={language}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Health Dashboard
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              System status and diagnostics for SBB Chat MCP
            </p>
          </div>

        {/* Overall Status */}
        {loading ? (
          <Card className="mb-6 animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </CardContent>
          </Card>
        ) : healthData ? (
          <Card className="mb-6" shadow="xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`${getStatusColor(healthData.status)}`}>
                    {getStatusIcon(healthData.status)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                      Overall Status
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Last checked:{' '}
                      {new Date(healthData.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold uppercase ${getStatusBadge(
                    healthData.status
                  )}`}
                >
                  {healthData.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Individual Checks */}
        {healthData && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {/* API Health */}
            <Card hover>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span
                    className={getStatusColor(healthData.checks.api.status)}
                  >
                    {getStatusIcon(healthData.checks.api.status)}
                  </span>
                  API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Status
                    </span>
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        healthData.checks.api.status
                      )}`}
                    >
                      {healthData.checks.api.status}
                    </span>
                  </div>
                  {healthData.checks.api.responseTime && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Response Time
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {healthData.checks.api.responseTime}ms
                      </span>
                    </div>
                  )}
                  {healthData.checks.api.error && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 rounded text-xs text-red-600 dark:text-red-400">
                      {healthData.checks.api.error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Data Health */}
            <Card hover>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span
                    className={getStatusColor(healthData.checks.data.status)}
                  >
                    {getStatusIcon(healthData.checks.data.status)}
                  </span>
                  Data Integrity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Status
                    </span>
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        healthData.checks.data.status
                      )}`}
                    >
                      {healthData.checks.data.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Sights
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {healthData.checks.data.sights}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Resorts
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {healthData.checks.data.resorts}
                    </span>
                  </div>
                  {healthData.checks.data.error && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 rounded text-xs text-red-600 dark:text-red-400">
                      {healthData.checks.data.error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* MCP Server Health */}
            <Card hover>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span
                    className={getStatusColor(healthData.checks.mcp.status)}
                  >
                    {getStatusIcon(healthData.checks.mcp.status)}
                  </span>
                  MCP Server
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Status
                    </span>
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        healthData.checks.mcp.status
                      )}`}
                    >
                      {healthData.checks.mcp.status}
                    </span>
                  </div>
                  {healthData.checks.mcp.responseTime && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Response Time
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {healthData.checks.mcp.responseTime}ms
                      </span>
                    </div>
                  )}
                  {healthData.checks.mcp.tools !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Tools
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {healthData.checks.mcp.tools}
                      </span>
                    </div>
                  )}
                  {healthData.checks.mcp.prompts !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Prompts
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {healthData.checks.mcp.prompts}
                      </span>
                    </div>
                  )}
                  {healthData.checks.mcp.resources !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Resources
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {healthData.checks.mcp.resources}
                      </span>
                    </div>
                  )}
                  {healthData.checks.mcp.serverUrl && (
                    <div className="mt-2">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">
                        Server URL
                      </span>
                      <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded block break-all">
                        {healthData.checks.mcp.serverUrl}
                      </code>
                    </div>
                  )}

                  {/* Backend Components Health */}
                  {healthData.checks.mcp.components &&
                    Object.keys(healthData.checks.mcp.components).length >
                      0 && (
                      <details className="mt-3">
                        <summary className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer hover:text-blue-600">
                          Backend Components (
                          {Object.keys(healthData.checks.mcp.components).length}
                          )
                        </summary>
                        <div className="mt-2 space-y-1">
                          {Object.entries(healthData.checks.mcp.components).map(
                            ([key, value]: [string, any]) => (
                              <div
                                key={key}
                                className="flex justify-between items-center text-xs bg-neutral-50 dark:bg-neutral-900 px-2 py-1 rounded"
                              >
                                <span className="text-neutral-600 dark:text-neutral-400">
                                  {key}
                                </span>
                                <span
                                  className={`font-medium ${getStatusColor(
                                    value.status
                                  )}`}
                                >
                                  {value.status}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </details>
                    )}

                  {healthData.checks.mcp.error && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 rounded text-xs text-red-600 dark:text-red-400">
                      {healthData.checks.mcp.error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
          >
            Refresh Now
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
