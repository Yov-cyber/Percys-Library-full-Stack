import { useState, useEffect, useCallback } from 'react';
import { Comic } from '../types';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tookMs, setTookMs] = useState(0);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setTookMs(0);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=10`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data.results || []);
      setTookMs(data.tookMs || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      search(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query, search]);

  return { query, setQuery, results, loading, error, tookMs, searchNow: () => search(query) };
}
