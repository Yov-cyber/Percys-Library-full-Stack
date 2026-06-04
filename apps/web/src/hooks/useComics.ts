import { useState, useEffect, useCallback } from 'react';
import { Comic } from '../types';

export interface UseComicsFilters {
  q?: string;
  format?: 'cbz' | 'cbr' | 'pdf' | 'folder' | '';
  status?: 'all' | 'in-progress' | 'completed' | 'unread' | 'favorites';
  category?: string;
  sort?: 'lastReadAt' | 'title' | 'addedAt' | 'updatedAt' | 'progress';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export function useComics(initialFilters: UseComicsFilters = {}) {
  const [comics, setComics] = useState<Comic[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UseComicsFilters>({
    sort: 'updatedAt',
    order: 'desc',
    limit: 200,
    offset: 0,
    status: 'all',
    ...initialFilters
  });

  const fetchComics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, String(val));
        }
      });

      const response = await fetch(`/api/library?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch comics');
      
      const totalHeader = response.headers.get('X-Total-Count');
      if (totalHeader) {
        setTotalCount(parseInt(totalHeader, 10));
      }
      
      const data = await response.json();
      setComics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchComics();
  }, [fetchComics]);

  const addComic = async (files: File[] | File) => {
    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach((file) => formData.append('files', file));
    } else {
      formData.append('files', files);
    }
    
    const response = await fetch('/api/library/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload comic');
    const result = await response.json();
    await fetchComics();
    return result;
  };

  const toggleFavorite = async (comicId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/comics/${comicId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: !currentStatus }),
      });
      if (!response.ok) throw new Error('Failed to update favorite');
      
      // Optimistic update
      setComics(prev => prev.map(c => c.id === comicId ? { ...c, isFavorite: !currentStatus } : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      await fetchComics();
    }
  };

  const updateCategory = async (comicId: string, category: string | null) => {
    try {
      const response = await fetch(`/api/comics/${comicId}/category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      if (!response.ok) throw new Error('Failed to update category');
      
      // Optimistic update
      setComics(prev => prev.map(c => c.id === comicId ? { ...c, category: category } : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Category update failed');
      await fetchComics();
    }
  };

  const getRandomComic = async (scope: 'all' | 'unread' | 'in-progress' | 'favorites' = 'all'): Promise<Comic | null> => {
    try {
      const response = await fetch(`/api/comics/random?scope=${scope}`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  };

  const deleteComics = async (ids: string[]) => {
    try {
      const response = await fetch('/api/comics/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, op: 'delete' }),
      });
      if (!response.ok) throw new Error('Failed to delete comics');
      await fetchComics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return { 
    comics, 
    totalCount,
    loading, 
    error, 
    filters,
    setFilters,
    addComic, 
    toggleFavorite, 
    updateCategory,
    getRandomComic,
    deleteComics,
    refetch: fetchComics 
  };
}
