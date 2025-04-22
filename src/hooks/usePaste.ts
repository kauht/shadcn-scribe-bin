import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Paste } from '@/lib/types';

export function usePaste(id: string | undefined) {
  const [paste, setPaste] = useState<Paste | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load paste data
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setError(new Error("No paste ID provided"));
      return;
    }

    let isMounted = true;

    const loadPaste = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get paste from API
        const pasteData = await api.getPasteById(id);
        
        if (!pasteData) {
          throw new Error("Paste not found or has expired");
        }
        
        // Only update state if component is still mounted
        if (isMounted) {
          setPaste(pasteData);
        }
      } catch (err) {
        console.error("Error loading paste:", err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to load paste"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPaste();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Function to verify password
  const verifyPassword = useCallback(async (password: string): Promise<boolean> => {
    if (!id) return false;
    return await api.checkPassword(id, password);
  }, [id]);
  
  // Function to increment view count
  const incrementViews = useCallback(async () => {
    if (id && paste) {
      await api.incrementViewCount(id);
    }
  }, [id, paste]);

  return { 
    paste, 
    isLoading, 
    error, 
    checkPassword: verifyPassword,
    incrementViewCount: incrementViews 
  };
}
