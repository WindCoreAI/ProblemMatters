'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearch } from '@/lib/hooks/useSearch';
import type { SearchFilters as SearchFiltersType } from '@/lib/search/filters';
import type { Problem } from '@/lib/types/research';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Problem[]>([]);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const { isLoading, isReady, search } = useSearch();

  useEffect(() => {
    if (query && isReady) {
      search(query, {
        ...filters,
        limit: 100,
      });
    }
  }, [query, filters, isReady, search]);

  // Update results when search completes
  const { results: searchResults } = useSearch(query);

  useEffect(() => {
    if (searchResults.length > 0) {
      setResults(searchResults.map((r) => r.problem));
    } else if (!query) {
      setResults([]);
    }
  }, [searchResults, query]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Problems</h1>
        <SearchBar
          placeholder="Search problems..."
          autoFocus
          className="max-w-2xl"
          defaultValue={query}
        />
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <SearchFilters
            filters={filters}
            onChange={setFilters}
            resultCount={results.length}
          />
        </aside>

        {/* Results */}
        <main className="flex-1">
          {query && (
            <div className="mb-4">
              <p className="text-muted-foreground">
                {results.length} results for &quot;{query}&quot;
              </p>
            </div>
          )}

          <SearchResults results={results} isLoading={isLoading} query={query} />
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-muted rounded-lg max-w-2xl mb-8" />
            <div className="flex gap-8">
              <div className="w-64 h-96 bg-muted rounded-lg hidden lg:block" />
              <div className="flex-1 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
