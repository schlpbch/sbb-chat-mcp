# Swiss Travel Companion API

REST API for querying Swiss travel information powered by AI.

## Quick Start

### Base URL

```
http://localhost:3000/api/v1  (Development)
https://your-domain.com/api/v1  (Production)
```

### Endpoint

```
GET /query
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Natural language query |
| `format` | string | No | `text` | Response format: `text` or `markdown` |
| `lang` | string | No | `en` | Language: `en`, `de`, `fr`, `it`, `zh`, `hi` |

## Examples

### Basic Query (Plain Text)

```bash
curl "http://localhost:3000/api/v1/query?q=trains%20from%20Zurich%20to%20Bern"
```

**Response:**

```json
{
  "success": true,
  "query": "trains from Zurich to Bern",
  "response": "I found 3 direct trains from Zurich HB to Bern. The fastest option takes 56 minutes.",
  "format": "text",
  "language": "en",
  "timestamp": "2026-01-04T00:25:40Z",
  "processingTime": "1234ms"
}
```

### Markdown Format

```bash
curl "http://localhost:3000/api/v1/query?q=weather%20in%20Geneva&format=markdown"
```

**Response:**

```json
{
  "success": true,
  "query": "weather in Geneva",
  "response": "**Weather in Geneva**\n\nCurrent: 5°C, Partly cloudy\nForecast: Light rain expected",
  "format": "markdown",
  "language": "en",
  "timestamp": "2026-01-04T00:25:40Z",
  "processingTime": "987ms"
}
```

### Different Language

```bash
curl "http://localhost:3000/api/v1/query?q=Züge%20von%20Bern%20nach%20Luzern&lang=de"
```

**Response:**

```json
{
  "success": true,
  "query": "Züge von Bern nach Luzern",
  "response": "Ich habe 5 direkte Züge von Bern nach Luzern gefunden...",
  "format": "text",
  "language": "de",
  "timestamp": "2026-01-04T00:25:40Z",
  "processingTime": "1456ms"
}
```

## Integration Examples

### JavaScript (Fetch)

```javascript
async function querySwissTravel(query, format = 'text', lang = 'en') {
  const params = new URLSearchParams({ q: query, format, lang });
  const response = await fetch(`/api/v1/query?${params}`);
  const data = await response.json();
  
  if (data.success) {
    return data.response;
  } else {
    throw new Error(data.error);
  }
}

// Usage
const result = await querySwissTravel('trains from Zurich to Bern');
console.log(result);
```

### Python (requests)

```python
import requests

def query_swiss_travel(query, format='text', lang='en'):
    params = {'q': query, 'format': format, 'lang': lang}
    response = requests.get('http://localhost:3000/api/v1/query', params=params)
    data = response.json()
    
    if data['success']:
        return data['response']
    else:
        raise Exception(data['error'])

# Usage
result = query_swiss_travel('weather in Geneva', format='markdown')
print(result)
```

### HTML/JavaScript Widget

```html
<!DOCTYPE html>
<html>
<head>
  <title>Swiss Travel Widget</title>
</head>
<body>
  <div id="swiss-travel-widget">
    <input type="text" id="query" placeholder="Ask about Swiss travel...">
    <button onclick="search()">Search</button>
    <div id="result"></div>
  </div>

  <script>
    async function search() {
      const query = document.getElementById('query').value;
      const params = new URLSearchParams({ q: query, format: 'markdown' });
      
      const response = await fetch(`/api/v1/query?${params}`);
      const data = await response.json();
      
      if (data.success) {
        document.getElementById('result').innerHTML = marked.parse(data.response);
      } else {
        document.getElementById('result').textContent = 'Error: ' + data.error;
      }
    }
  </script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</body>
</html>
```

## Error Handling

### Missing Query Parameter

```bash
curl "http://localhost:3000/api/v1/query"
```

**Response (400):**

```json
{
  "success": false,
  "error": "Query parameter 'q' is required",
  "timestamp": "2026-01-04T00:25:40Z"
}
```

### Invalid Format

```bash
curl "http://localhost:3000/api/v1/query?q=test&format=json"
```

**Response (400):**

```json
{
  "success": false,
  "error": "Invalid format 'json'. Supported formats: text, markdown",
  "timestamp": "2026-01-04T00:25:40Z"
}
```

### Invalid Language

```bash
curl "http://localhost:3000/api/v1/query?q=test&lang=es"
```

**Response (400):**

```json
{
  "success": false,
  "error": "Invalid language 'es'. Supported languages: en, de, fr, it, zh, hi",
  "timestamp": "2026-01-04T00:25:40Z"
}
```

## Response Formats

### Plain Text (`format=text`)

- Strips all markdown formatting
- Returns clean, readable text
- Ideal for voice assistants, SMS, simple displays

### Markdown (`format=markdown`)

- Preserves markdown formatting
- Includes headers, bold, italic, links
- Ideal for rich text displays, documentation

## Supported Languages

| Code | Language | Example Query |
|------|----------|---------------|
| `en` | English | "trains from Zurich to Bern" |
| `de` | German | "Züge von Bern nach Luzern" |
| `fr` | French | "trains de Genève à Lausanne" |
| `it` | Italian | "treni da Lugano a Bellinzona" |
| `zh` | Chinese | "从苏黎世到伯尔尼的火车" |
| `hi` | Hindi | "ज्यूरिख से बर्न तक ट्रेन" |

## Rate Limiting

Currently, there is no rate limiting on this endpoint. This will be added in a future version.

**Recommended client-side limits:**

- Max 10 requests per minute
- Implement exponential backoff on errors

## Best Practices

1. **URL Encode Queries**: Always URL-encode the query parameter
2. **Handle Errors**: Check `success` field before using `response`
3. **Cache Results**: Cache common queries to reduce API calls
4. **Set Timeouts**: Implement 30-second timeout for requests
5. **Use Appropriate Format**: Choose `text` for simple displays, `markdown` for rich content

## OpenAPI Specification

Full OpenAPI 3.0 specification available at: [`docs/api/openapi.yaml`](./openapi.yaml)

## Support

For issues or questions, please open an issue on GitHub or contact support.
