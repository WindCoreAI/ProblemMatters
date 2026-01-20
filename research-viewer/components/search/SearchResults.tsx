'use client';

import { ProblemCard } from '@/components/problems/ProblemCard';
import type { Problem } from '@/lib/types/research';

interface SearchResultsProps {
  results: Problem[];
  isLoading: boolean;
  query: string;
}

export function SearchResults({
  results,
  isLoading,
  query,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Enter a search term to find problems
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-2">
          No results found for &quot;{query}&quot;
        </p>
        <p className="text-sm text-muted-foreground">
          Try different keywords or adjust your filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} variant="compact" />
      ))}
    </div>
  );
}
