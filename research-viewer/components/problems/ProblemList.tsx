'use client';

import { ProblemCard } from './ProblemCard';
import type { Problem } from '@/lib/types/research';

interface ProblemListProps {
  problems: Problem[];
  variant?: 'grid' | 'list';
  showIndustry?: boolean;
}

export function ProblemList({
  problems,
  variant = 'grid',
  showIndustry = true,
}: ProblemListProps) {
  if (problems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No problems found</p>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-4">
        {problems.map((problem) => (
          <ProblemCard
            key={problem.id}
            problem={problem}
            variant="compact"
            showIndustry={showIndustry}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {problems.map((problem) => (
        <ProblemCard
          key={problem.id}
          problem={problem}
          showIndustry={showIndustry}
        />
      ))}
    </div>
  );
}
