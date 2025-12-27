import { useState, useEffect } from 'react';
import { mcpClient, type TouristAttraction } from '@/lib/mcp-client';

export function useAttractions() {
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        await mcpClient.connect();
        const data = await mcpClient.getAllAttractions();
        setAttractions(data);
        setError(null);
      } catch (err) {
        setError('Failed to load attractions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return { attractions, loading, error };
}
