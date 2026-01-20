'use client';

import { useEffect, useState } from 'react';
import { IndustryGrid } from '@/components/industries/IndustryGrid';
import { useDataStore } from '@/lib/stores/dataStore';

export default function IndustriesPage() {
  const { index, industries, isLoading, isInitialized } = useDataStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading || !isInitialized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Industries</h1>
          <p className="text-muted-foreground">Loading...</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const stats = index?.statistics;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Industries</h1>
        <p className="text-muted-foreground">
          Explore {stats?.totalProblems?.toLocaleString() || 0} problems across{' '}
          {stats?.totalIndustries || industries.length} industries
        </p>
      </header>

      <IndustryGrid industries={industries} />
    </div>
  );
}
