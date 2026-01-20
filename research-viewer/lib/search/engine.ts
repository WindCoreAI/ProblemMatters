'use client';

import FlexSearch from 'flexsearch';
import type { Problem } from '@/lib/types/research';

export interface SearchOptions {
  limit?: number;
  industry?: string;
  domain?: string;
  problemType?: string;
  problemTypes?: string[];
  minSeverity?: number;
  minImpact?: number;
  urgency?: string[];
  scope?: string[];
  sortBy?: 'relevance' | 'severity' | 'impact' | 'tractability';
}

export interface SearchResult {
  problem: Problem;
  score: number;
  matchedFields: string[];
}

class SearchEngine {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private index: any = null;
  private problems: Map<string, Problem> = new Map();
  private initialized = false;

  async initialize(problems: Problem[]): Promise<void> {
    if (this.initialized) return;

    // Use simple index for better compatibility
    this.index = new FlexSearch.Index({
      tokenize: 'forward',
      cache: true,
    });

    for (const problem of problems) {
      // Create searchable text from problem
      const searchText = [
        problem.title,
        problem.description,
        problem.summary || '',
        problem.industry.name,
        problem.domain.name,
        problem.field?.name || '',
        problem.tags.join(' '),
        problem.keywords.join(' '),
        problem.problemType,
      ].join(' ');

      this.index.add(problem.id, searchText);
      this.problems.set(problem.id, problem);
    }

    this.initialized = true;
  }

  search(query: string, options?: SearchOptions): SearchResult[] {
    if (!this.index || !this.initialized) {
      return [];
    }

    const resultIds = this.index.search(query, {
      limit: options?.limit || 50,
    });

    // Build results from IDs
    const matches: SearchResult[] = [];

    for (const id of resultIds) {
      const problem = this.problems.get(id as string);
      if (problem) {
        matches.push({
          problem,
          score: 1,
          matchedFields: ['text'],
        });
      }
    }

    // Apply filters
    let filtered = matches;

    if (options?.industry) {
      filtered = filtered.filter(
        (r) => r.problem.industry.slug === options.industry
      );
    }
    if (options?.domain) {
      filtered = filtered.filter(
        (r) => r.problem.domain.slug === options.domain
      );
    }
    if (options?.problemType) {
      filtered = filtered.filter(
        (r) => r.problem.problemType === options.problemType
      );
    }
    if (options?.problemTypes && options.problemTypes.length > 0) {
      filtered = filtered.filter((r) =>
        options.problemTypes!.includes(r.problem.problemType)
      );
    }
    if (options?.minSeverity !== undefined) {
      filtered = filtered.filter(
        (r) => r.problem.severity.overall >= options.minSeverity!
      );
    }
    if (options?.minImpact !== undefined) {
      filtered = filtered.filter(
        (r) => r.problem.impactScore >= options.minImpact!
      );
    }
    if (options?.urgency && options.urgency.length > 0) {
      filtered = filtered.filter((r) =>
        options.urgency!.includes(r.problem.urgency)
      );
    }
    if (options?.scope && options.scope.length > 0) {
      filtered = filtered.filter((r) =>
        options.scope!.includes(r.problem.scope)
      );
    }

    // Sort by relevance and impact
    filtered.sort((a, b) => {
      if (options?.sortBy === 'severity') {
        return b.problem.severity.overall - a.problem.severity.overall;
      }
      if (options?.sortBy === 'impact') {
        return b.problem.impactScore - a.problem.impactScore;
      }
      if (options?.sortBy === 'tractability') {
        return b.problem.tractability.overall - a.problem.tractability.overall;
      }
      // Default: impact score
      return b.problem.impactScore - a.problem.impactScore;
    });

    return filtered.slice(0, options?.limit || 50);
  }

  getSuggestions(query: string): string[] {
    if (!this.index || query.length < 2) return [];

    const resultIds = this.index.search(query, {
      limit: 10,
    });

    const suggestions = new Set<string>();

    for (const id of resultIds) {
      const problem = this.problems.get(id as string);
      if (problem) {
        suggestions.add(problem.industry.name);
        suggestions.add(problem.domain.name);
        if (problem.field) {
          suggestions.add(problem.field.name);
        }
      }
    }

    return Array.from(suggestions).slice(0, 8);
  }

  getProblemById(id: string): Problem | undefined {
    return this.problems.get(id);
  }

  getAllProblems(): Problem[] {
    return Array.from(this.problems.values());
  }

  isReady(): boolean {
    return this.initialized;
  }
}

// Singleton instance
export const searchEngine = new SearchEngine();
