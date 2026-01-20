'use client';

import { useEffect, useState } from 'react';
import { ProblemList } from '@/components/problems/ProblemList';
import { useDataStore } from '@/lib/stores/dataStore';
import { sortProblems } from '@/lib/search/filters';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Problem } from '@/lib/types/research';

export default function ProblemsPage() {
  const { problems, isLoading, isInitialized } = useDataStore();
  const [sortBy, setSortBy] = useState<
    'impact' | 'severity' | 'tractability' | 'newest'
  >('impact');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortedProblems, setSortedProblems] = useState<Problem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (problems.length > 0) {
      setSortedProblems(sortProblems(problems, sortBy));
    }
  }, [problems, sortBy]);

  if (!mounted || isLoading || !isInitialized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Problems</h1>
          <p className="text-muted-foreground">Loading...</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Problems</h1>
        <p className="text-muted-foreground">
          Browse {problems.length.toLocaleString()} discovered problems
        </p>
      </header>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(
                  value as 'impact' | 'severity' | 'tractability' | 'newest'
                )
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="impact">Impact Score</SelectItem>
                <SelectItem value="severity">Severity</SelectItem>
                <SelectItem value="tractability">Tractability</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('grid')}
          >
            Grid
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Problems */}
      {sortedProblems.length > 0 ? (
        <ProblemList problems={sortedProblems} variant={view} />
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground mb-2">No problems found.</p>
          <p className="text-sm text-muted-foreground">
            Add research data to the public/research-data folder to get started.
          </p>
        </div>
      )}
    </div>
  );
}
