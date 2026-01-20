'use client';

import { useEffect, useState } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { IndustryGrid } from '@/components/industries/IndustryGrid';
import { StatsOverview } from '@/components/StatsOverview';
import { useDataStore } from '@/lib/stores/dataStore';
import type { ResearchIndex } from '@/lib/types/research';

export default function HomePage() {
  const { index, industries, isLoading, isInitialized } = useDataStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading || !isInitialized) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Industry Problem Research</h1>
          <p className="text-lg text-muted-foreground mb-8">Loading data...</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </main>
    );
  }

  const stats = index?.statistics || {
    totalProblems: 0,
    totalIndustries: industries.length,
    totalDomains: 0,
    totalFields: 0,
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Industry Problem Research</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Discover {stats.totalProblems.toLocaleString()} problems across{' '}
          {stats.totalIndustries} industries
        </p>

        <SearchBar
          placeholder="Search problems, industries, or keywords..."
          className="max-w-2xl mx-auto"
        />
      </section>

      {/* Quick Stats */}
      <section className="mb-12">
        <StatsOverview statistics={stats} />
      </section>

      {/* Industry Grid */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Browse by Industry</h2>
        {industries.length > 0 ? (
          <IndustryGrid industries={industries} />
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground mb-2">
              No industries found in research data.
            </p>
            <p className="text-sm text-muted-foreground">
              Add research data to the public/research-data folder to get
              started.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
