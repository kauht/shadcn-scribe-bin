import { useState, useEffect } from 'react';
import { getPasteById, incrementViewCount, checkPassword } from '@/lib/pasteStore';
import type { Paste } from '@/lib/types';

export function usePaste(id: string | undefined) {
  const [paste, setPaste] = useState<Paste | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip if no ID is provided
    if (!id) {
      setIsLoading(false);
      setError(new Error("No paste ID provided"));
      return;
    }

    const loadPaste = () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get paste from storage
        const pasteData = getPasteById(id);
        
        if (!pasteData) {
          throw new Error("Paste not found or has expired");
        }
        
        // Set paste data
        setPaste(pasteData);
      } catch (err) {
        console.error("Error loading paste:", err);
        setError(err instanceof Error ? err : new Error("Failed to load paste"));
      } finally {
        setIsLoading(false);
      }
    };

    loadPaste();
  }, [id]);

  // Function to verify password
  const verifyPassword = (password: string): boolean => {
    if (!id) return false;
    return checkPassword(id, password);
  };
  
  // Function to increment view count
  const incrementViews = () => {
    if (id) {
      incrementViewCount(id);
    }
  };

  return { 
    paste, 
    isLoading, 
    error, 
    checkPassword: verifyPassword,
    incrementViewCount: incrementViews 
  };
}
