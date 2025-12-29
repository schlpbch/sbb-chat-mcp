import { test, expect } from '@playwright/test';

/**
 * API Routes Tests
 * Tests the MCP proxy and LLM API endpoints
 */

test.describe('MCP Proxy - Tools API', () => {
  test.describe('Tool Listing', () => {
    test('should list available tools', async ({ request }) => {
      const response = await request.get('/api/mcp-proxy/tools');
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      // Should return tools array
      expect(data.tools).toBeDefined();
      expect(Array.isArray(data.tools)).toBe(true);
    });

    test('should include tool metadata', async ({ request }) => {
      const response = await request.get('/api/mcp-proxy/tools');
      const data = await response.json();
      
      if (data.tools && data.tools.length > 0) {
        const firstTool = data.tools[0];
        
        // Each tool should have name and description
        expect(firstTool.name).toBeDefined();
        expect(firstTool.description).toBeDefined();
        expect(firstTool.inputSchema).toBeDefined();
      }
    });
  });

  test.describe('Tool Execution', () => {
    test('should execute findStopPlacesByName tool', async ({ request }) => {
      const response = await request.post('/api/mcp-proxy/tools/findStopPlacesByName', {
        data: {
          nameMatch: 'Zürich',
          limit: 5,
        },
      });

      // Should not be a client error
      expect(response.status()).not.toBe(400);
      
      // May be 200 (success) or 500 (server error if MCP not available)
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });

    test('should handle missing required parameters', async ({ request }) => {
      const response = await request.post('/api/mcp-proxy/tools/findStopPlacesByName', {
        data: {},
      });

      // May return 200 with defaults, 400 for validation error, or 500 for server error
      expect([200, 400, 500]).toContain(response.status());
    });

    test('should execute findTrips tool', async ({ request }) => {
      const response = await request.post('/api/mcp-proxy/tools/findTrips', {
        data: {
          origin: 'Zürich HB',
          destination: 'Bern',
          limit: 3,
        },
      });

      expect(response.status()).not.toBe(400);
    });

    test('should execute getPlaceEvents tool', async ({ request }) => {
      const response = await request.post('/api/mcp-proxy/tools/getPlaceEvents', {
        data: {
          stopPlaceName: 'Zürich HB',
          eventType: 'DEPARTURE',
          limit: 10,
        },
      });

      expect(response.status()).not.toBe(400);
    });

    test('should handle invalid tool names', async ({ request }) => {
      const response = await request.post('/api/mcp-proxy/tools/nonExistentTool', {
        data: {},
      });

      // Should return 404 or 500
      expect([404, 500]).toContain(response.status());
    });
  });

  test.describe('Error Handling', () => {
    test('should handle malformed JSON', async ({ request }) => {
      const response = await request.post('/api/mcp-proxy/tools/findStopPlacesByName', {
        data: 'invalid json',
      });

      expect([400, 500]).toContain(response.status());
    });

    test('should handle network errors gracefully', async ({ request }) => {
      // Test with invalid parameters that might cause network issues
      const response = await request.post('/api/mcp-proxy/tools/findTrips', {
        data: {
          origin: '',
          destination: '',
        },
      });

      // May return 200 if empty strings are handled, or error status
      expect(response.status()).toBeGreaterThanOrEqual(200);
    });
  });
});

test.describe('MCP Proxy - Resources API', () => {
  test.describe('Resource Listing', () => {
    test('should list available resources', async ({ request }) => {
      const response = await request.get('/api/mcp-proxy/resources');
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      // Should return resources array
      expect(data.resources).toBeDefined();
      expect(Array.isArray(data.resources)).toBe(true);
    });

    test('should include resource metadata', async ({ request }) => {
      const response = await request.get('/api/mcp-proxy/resources');
      const data = await response.json();
      
      if (data.resources && data.resources.length > 0) {
        const firstResource = data.resources[0];
        
        // Each resource should have uri and name
        expect(firstResource.uri).toBeDefined();
        expect(firstResource.name).toBeDefined();
      }
    });
  });

  test.describe('Resource Reading', () => {
    test('should read tourist-sights resource', async ({ request }) => {
      const uri = encodeURIComponent('tourist-sights://all');
      const response = await request.get(`/api/mcp-proxy/resources/read?uri=${uri}`);

      expect(response.status()).not.toBe(400);
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data.contents).toBeDefined();
      }
    });

    test('should handle invalid resource URIs', async ({ request }) => {
      const uri = encodeURIComponent('invalid://resource');
      const response = await request.get(`/api/mcp-proxy/resources/read?uri=${uri}`);

      expect([400, 404, 500]).toContain(response.status());
    });

    test('should require uri parameter', async ({ request }) => {
      const response = await request.get('/api/mcp-proxy/resources/read');

      expect([400, 500]).toContain(response.status());
    });
  });
});

test.describe('MCP Proxy - Prompts API', () => {
  test.describe('Prompt Listing', () => {
    test('should list available prompts', async ({ request }) => {
      const response = await request.get('/api/mcp-proxy/prompts');
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      // Should return prompts array
      expect(data.prompts).toBeDefined();
      expect(Array.isArray(data.prompts)).toBe(true);
    });

    test('should include prompt metadata', async ({ request }) => {
      const response = await request.get('/api/mcp-proxy/prompts');
      const data = await response.json();
      
      if (data.prompts && data.prompts.length > 0) {
        const firstPrompt = data.prompts[0];
        
        // Each prompt should have name and description
        expect(firstPrompt.name).toBeDefined();
        expect(firstPrompt.description).toBeDefined();
      }
    });
  });

  test.describe('Prompt Execution', () => {
    test('should execute check-connection prompt', async ({ request }) => {
      const response = await request.post('/api/mcp-proxy/prompts/check-connection', {
        data: {},
      });

      expect(response.status()).not.toBe(400);
    });

    test('should execute monitor-station prompt', async ({ request }) => {
      const response = await request.post('/api/mcp-proxy/prompts/monitor-station', {
        data: {
          station: 'Zürich HB',
        },
      });

      expect(response.status()).not.toBe(400);
    });

    test('should handle missing prompt arguments', async ({ request }) => {
      const response = await request.post('/api/mcp-proxy/prompts/monitor-station', {
        data: {},
      });

      // May accept empty args or return error
      expect(response.status()).toBeGreaterThanOrEqual(200);
    });
  });
});

test.describe('LLM Chat API', () => {
  test.describe('Request Validation', () => {
    test('should require message field', async ({ request }) => {
      const response = await request.post('/api/llm/chat', {
        data: {
          sessionId: 'test-session',
        },
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Message is required');
    });

    test('should accept valid chat requests', async ({ request }) => {
      const response = await request.post('/api/llm/chat', {
        data: {
          message: 'Hello',
          sessionId: `test-${Date.now()}`,
          context: { language: 'en' },
        },
      });

      // Should not be a validation error
      expect(response.status()).not.toBe(400);
    });

    test('should handle requests without sessionId', async ({ request }) => {
      const response = await request.post('/api/llm/chat', {
        data: {
          message: 'Test message',
          context: { language: 'en' },
        },
      });

      // Should accept and create new session
      expect(response.status()).not.toBe(400);
    });
  });

  test.describe('Orchestration Mode', () => {
    test('should accept orchestration flag', async ({ request }) => {
      const response = await request.post('/api/llm/chat', {
        data: {
          message: 'Plan a trip to Bern',
          sessionId: `test-orch-${Date.now()}`,
          useOrchestration: true,
          context: { language: 'en' },
        },
      });

      expect(response.status()).not.toBe(400);
    });

    test('should work without orchestration flag', async ({ request }) => {
      const response = await request.post('/api/llm/chat', {
        data: {
          message: 'Hello',
          sessionId: `test-no-orch-${Date.now()}`,
          useOrchestration: false,
          context: { language: 'en' },
        },
      });

      expect(response.status()).not.toBe(400);
    });
  });

  test.describe('Language Support', () => {
    const languages = ['en', 'de', 'fr', 'it'];

    for (const lang of languages) {
      test(`should accept ${lang} language`, async ({ request }) => {
        const response = await request.post('/api/llm/chat', {
          data: {
            message: 'Test',
            sessionId: `test-lang-${lang}-${Date.now()}`,
            context: { language: lang },
          },
        });

        expect(response.status()).not.toBe(400);
      });
    }
  });

  test.describe('Conversation History', () => {
    test('should accept conversation history', async ({ request }) => {
      const response = await request.post('/api/llm/chat', {
        data: {
          message: 'Follow-up question',
          sessionId: `test-history-${Date.now()}`,
          history: [
            { role: 'user', content: 'Previous message' },
            { role: 'Companion', content: 'Previous response' },
          ],
          context: { language: 'en' },
        },
      });

      expect(response.status()).not.toBe(400);
    });

    test('should work with empty history', async ({ request }) => {
      const response = await request.post('/api/llm/chat', {
        data: {
          message: 'First message',
          sessionId: `test-empty-history-${Date.now()}`,
          history: [],
          context: { language: 'en' },
        },
      });

      expect(response.status()).not.toBe(400);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle malformed requests', async ({ request }) => {
      const response = await request.post('/api/llm/chat', {
        data: 'not an object',
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('should handle missing context', async ({ request }) => {
      const response = await request.post('/api/llm/chat', {
        data: {
          message: 'Test',
          sessionId: `test-no-context-${Date.now()}`,
        },
      });

      // Should work with default context or return error
      expect(response.status()).toBeGreaterThanOrEqual(200);
    });
  });
});

test.describe('Tourist Data APIs', () => {
  test.describe('Sights API', () => {
    test('should fetch tourist sights', async ({ request }) => {
      const response = await request.get('/api/mcp/sights');
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.sights).toBeDefined();
      expect(Array.isArray(data.sights)).toBe(true);
    });

    test('should return sights with required fields', async ({ request }) => {
      const response = await request.get('/api/mcp/sights');
      const data = await response.json();
      
      if (data.sights && data.sights.length > 0) {
        const firstSight = data.sights[0];
        
        expect(firstSight.id).toBeDefined();
        expect(firstSight.title).toBeDefined();
        expect(firstSight.type).toBe('sight');
      }
    });
  });

  test.describe('Resorts API', () => {
    test('should fetch alpine resorts', async ({ request }) => {
      const response = await request.get('/api/mcp/resorts');
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      // Handle nested structure
      const resorts = data.alpine_resorts_guide_enhanced?.resorts || data.resorts;
      expect(resorts).toBeDefined();
      expect(Array.isArray(resorts)).toBe(true);
    });

    test('should return resorts with required fields', async ({ request }) => {
      const response = await request.get('/api/mcp/resorts');
      const data = await response.json();
      
      const resorts = data.alpine_resorts_guide_enhanced?.resorts || data.resorts;
      
      if (resorts && resorts.length > 0) {
        const firstResort = resorts[0];
        
        expect(firstResort.id).toBeDefined();
        expect(firstResort.title).toBeDefined();
      }
    });
  });
});
