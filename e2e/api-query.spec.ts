import { test, expect } from '@playwright/test';

test.describe('API v1 Query Endpoint', () => {
  const baseURL = 'http://localhost:3000';

  test('should return successful response for basic query', async ({
    request,
  }) => {
    const response = await request.get(`${baseURL}/api/v1/query`, {
      params: {
        q: 'trains from Zurich to Bern',
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.query).toBe('trains from Zurich to Bern');
    expect(data.response).toBeTruthy();
    expect(data.format).toBe('text');
    expect(data.language).toBe('en');
    expect(data.timestamp).toBeTruthy();
    expect(data.processingTime).toBeTruthy();
  });

  test('should return markdown formatted response', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/v1/query`, {
      params: {
        q: 'weather in Geneva',
        format: 'markdown',
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.format).toBe('markdown');
    // Markdown response should contain the original formatting
    expect(data.response).toBeTruthy();
  });

  test('should return response in German', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/v1/query`, {
      params: {
        q: 'trains from Zurich to Bern',
        lang: 'de',
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.language).toBe('de');
    expect(data.response).toBeTruthy();
  });

  test('should handle cross-language query (English query, German response)', async ({
    request,
  }) => {
    const response = await request.get(`${baseURL}/api/v1/query`, {
      params: {
        q: 'trains from Zurich to Bern',
        lang: 'de',
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.query).toBe('trains from Zurich to Bern');
    expect(data.language).toBe('de');
  });

  test('should return 400 for missing query parameter', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/v1/query`);

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("Query parameter 'q' is required");
  });

  test('should return 400 for invalid format', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/v1/query`, {
      params: {
        q: 'test query',
        format: 'json',
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid format');
    expect(data.error).toContain('text, markdown');
  });

  test('should return 400 for invalid language', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/v1/query`, {
      params: {
        q: 'test query',
        lang: 'es',
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid language');
    expect(data.error).toContain('en, de, fr, it, zh, hi');
  });

  test('should handle URL-encoded queries', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/v1/query`, {
      params: {
        q: 'trains from Zürich to Bern',
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.query).toBe('trains from Zürich to Bern');
  });

  test('should include processing time in response', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/v1/query`, {
      params: {
        q: 'weather in Geneva',
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.processingTime).toMatch(/^\d+ms$/);
  });

  test('should support all 6 languages', async ({ request }) => {
    const languages = ['en', 'de', 'fr', 'it', 'zh', 'hi'];

    for (const lang of languages) {
      const response = await request.get(`${baseURL}/api/v1/query`, {
        params: {
          q: 'test query',
          lang,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.language).toBe(lang);
    }
  });
});
