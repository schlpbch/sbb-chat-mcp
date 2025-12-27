/**
 * MCP Client for Journey Service
 * Connects to the MCP server via HTTP streaming to fetch tourist data
 * Uses Next.js API routes as a proxy to the backend MCP server
 */

class McpClient {
  private connected = false;
  private serverUrl: string = '';

  /**
   * Initialize connection to MCP server
   */
  async connect(serverUrl: string = 'http://localhost:3000') {
    if (this.connected) return;

    try {
      this.serverUrl = serverUrl;
      this.connected = true;
      console.log('MCP client initialized for HTTP streaming via:', serverUrl);
    } catch (error) {
      console.error('Failed to initialize MCP client:', error);
      throw error;
    }
  }

  /**
   * Cleanup - mark client as disconnected
   */
  async disconnect() {
    this.connected = false;
    console.log('MCP client disconnected');
  }
}

export const mcpClient = new McpClient();

