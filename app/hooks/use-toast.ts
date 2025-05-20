"use client";

import { useCallback } from 'react';

// Simple hook toast (remplace une vraie lib comme sonner ou react-hot-toast)
export function useToast() {
  // On peut remplacer par une vraie lib de toast si besoin
  const toast = useCallback(({
    title,
    description,
    variant
  }: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
  }) => {
    if (typeof window !== 'undefined' && window?.alert) {
      window.alert(`${title}${description ? '\n' + description : ''}`);
    } else {
      // Fallback serveur ou test
      console.log(`[TOAST] ${title}${description ? ' - ' + description : ''}`);
    }
  }, []);

  return { toast };
} 