import type { Problem, ProblemType, Urgency, ProblemScope } from '@/lib/types/research';

export interface SearchFilters {
  industry?: string;
  domain?: string;
  problemTypes?: ProblemType[];
  minSeverity?: number;
  maxTractability?: number;
  urgency?: Urgency[];
  scope?: ProblemScope[];
}

export const PROBLEM_TYPES: Array<{ value: ProblemType; label: string }> = [
  { value: 'technical', label: 'Technical' },
  { value: 'process', label: 'Process' },
  { value: 'resource', label: 'Resource' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'coordination', label: 'Coordination' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'market', label: 'Market' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'social', label: 'Social' },
  { value: 'ethical', label: 'Ethical' },
];

export const URGENCY_LEVELS: Array<{
  value: Urgency;
  label: string;
  color: string;
}> = [
  { value: 'critical', label: 'Critical', color: 'destructive' },
  { value: 'high', label: 'High', color: 'warning' },
  { value: 'medium', label: 'Medium', color: 'secondary' },
  { value: 'low', label: 'Low', color: 'outline' },
];

export const SCOPE_LEVELS: Array<{ value: ProblemScope; label: string }> = [
  { value: 'global', label: 'Global' },
  { value: 'industry', label: 'Industry-wide' },
  { value: 'organization', label: 'Organization' },
  { value: 'team', label: 'Team' },
  { value: 'individual', label: 'Individual' },
];

export function filterProblems(
  problems: Problem[],
  filters: SearchFilters
): Problem[] {
  return problems.filter((problem) => {
    if (filters.industry && problem.industry.slug !== filters.industry) {
      return false;
    }

    if (filters.domain && problem.domain.slug !== filters.domain) {
      return false;
    }

    if (
      filters.problemTypes &&
      filters.problemTypes.length > 0 &&
      !filters.problemTypes.includes(problem.problemType)
    ) {
      return false;
    }

    if (
      filters.minSeverity !== undefined &&
      problem.severity.overall < filters.minSeverity
    ) {
      return false;
    }

    if (
      filters.maxTractability !== undefined &&
      problem.tractability.overall > filters.maxTractability
    ) {
      return false;
    }

    if (
      filters.urgency &&
      filters.urgency.length > 0 &&
      !filters.urgency.includes(problem.urgency)
    ) {
      return false;
    }

    if (
      filters.scope &&
      filters.scope.length > 0 &&
      !filters.scope.includes(problem.scope)
    ) {
      return false;
    }

    return true;
  });
}

export function countActiveFilters(filters: SearchFilters): number {
  let count = 0;

  if (filters.industry) count++;
  if (filters.domain) count++;
  if (filters.problemTypes && filters.problemTypes.length > 0) count++;
  if (filters.minSeverity !== undefined && filters.minSeverity > 0) count++;
  if (filters.maxTractability !== undefined && filters.maxTractability < 10)
    count++;
  if (filters.urgency && filters.urgency.length > 0) count++;
  if (filters.scope && filters.scope.length > 0) count++;

  return count;
}

export function sortProblems(
  problems: Problem[],
  sortBy: 'severity' | 'impact' | 'tractability' | 'newest' = 'impact'
): Problem[] {
  return [...problems].sort((a, b) => {
    switch (sortBy) {
      case 'severity':
        return b.severity.overall - a.severity.overall;
      case 'tractability':
        return b.tractability.overall - a.tractability.overall;
      case 'newest':
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case 'impact':
      default:
        return b.impactScore - a.impactScore;
    }
  });
}
