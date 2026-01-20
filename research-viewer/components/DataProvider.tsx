'use client';

import { useEffect } from 'react';
import { useDataStore } from '@/lib/stores/dataStore';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { initialize, isInitialized, isLoading } = useDataStore();

  useEffect(() => {
    if (!isInitialized && !isLoading) {
      initialize();
    }
  }, [initialize, isInitialized, isLoading]);

  return <>{children}</>;
}
