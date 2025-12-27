/**
 * MCP Client for Journey Service
 * Connects to the MCP server via HTTP streaming to fetch tourist data
 * Uses Next.js API routes as a proxy to the backend MCP server
 */

export interface TouristAttraction {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  category: string;
  region: Record<string, string>;
  location: {
    latitude: number;
    longitude: number;
    nearestStation: {
      stopName: string;
      uicCode: string;
    };
  };
  media?: {
    imageUrl?: string;
    homepageUrl?: string;
  };
  vibe_tags?: string[];
  type: 'sight' | 'resort';
  visitorSupport?: {
    ageSuitability: {
      bestFor: string[];
    };
  };
  offers?: {
    railAway?: {
      title: Record<string, string>;
      description: Record<string, string>;
      category?: string;
      media?: {
        imageUrl?: string;
        homepageUrl?: string;
      };
    };
  };
}

export interface McpResponse {
  sights?: TouristAttraction[];
  resorts?: TouristAttraction[];
}

class McpClient {
  private connected = false;
  private serverUrl: string = '';

  /**
   * Initialize connection to MCP server
   * In this implementation, we use HTTP API routes that proxy to the backend MCP server
   * The actual MCP communication happens via HTTP streaming on the server side
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
   * Fetch sights from MCP server via HTTP API route
   * The API route handles MCP resource streaming
   */
  async getSights(): Promise<TouristAttraction[]> {
    try {
      const response = await fetch('/api/mcp/sights');
      if (!response.ok) throw new Error('Failed to fetch sights');
      const data = await response.json();
      const sights = data.sights || [];
      // Ensure each sight has type='sight' for filtering
      return sights.map((sight: TouristAttraction) => ({
        ...sight,
        type: 'sight' as const,
      }));
    } catch (error) {
      console.error('Error fetching sights:', error);
      return [];
    }
  }

  /**
   * Fetch resorts from MCP server via HTTP API route
   * The API route handles MCP resource streaming
   */
  async getResorts(): Promise<TouristAttraction[]> {
    try {
      const response = await fetch('/api/mcp/resorts');
      if (!response.ok) throw new Error('Failed to fetch resorts');
      const data = await response.json();
      // Handle nested structure: alpine_resorts_guide_enhanced.resorts
      const resorts = data.alpine_resorts_guide_enhanced?.resorts || data.resorts || [];
      // Ensure each resort has type='resort' for filtering
      return resorts.map((resort: TouristAttraction) => ({
        ...resort,
        type: 'resort' as const,
      }));
    } catch (error) {
      console.error('Error fetching resorts:', error);
      return [];
    }
  }

  /**
   * Fetch all attractions (sights + resorts) concurrently
   */
  async getAllAttractions(): Promise<TouristAttraction[]> {
    const [sights, resorts] = await Promise.all([
      this.getSights(),
      this.getResorts(),
    ]);
    return [...sights, ...resorts];
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

