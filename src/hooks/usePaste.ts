import { useState, useEffect } from 'react';
import { getPasteById, incrementViewCount } from '@/lib/pasteStore';
import type { Paste } from '@/lib/types';

export function usePaste(id: string) {
  const [paste, setPaste] = useState<Paste | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPaste = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const paste = getPasteById(id);
        if (!paste) {
          throw new Error("Paste not found");
        }
        
        setPaste(paste);
        incrementViewCount(id);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load paste"));
      } finally {
        setIsLoading(false);
      }
    };

    loadPaste();
  }, [id]);

  return { paste, isLoading, error };
}
