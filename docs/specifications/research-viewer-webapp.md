# Research Viewer Web Application

**Version**: 1.0.0
**Status**: Design Specification
**Last Updated**: 2026-01-20

---

## Overview

A lightweight web application for viewing and searching industry problem research results stored locally in JSON format. This is a **read-only viewer** designed for research analysis and exploration.

---

## Design Principles

1. **Local-first**: All data loaded from local JSON files
2. **Zero backend**: Pure static site with client-side search
3. **Fast**: Instant search with client-side indexing
4. **Simple**: Minimal dependencies, easy to deploy
5. **Responsive**: Works on desktop, tablet, and mobile

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14+ (App Router) | Static export, fast, great DX |
| **Language** | TypeScript | Type safety with schema |
| **Styling** | Tailwind CSS | Rapid UI development |
| **Components** | shadcn/ui | Accessible, customizable |
| **Search** | FlexSearch | Fast client-side full-text search |
| **State** | Zustand | Lightweight state management |
| **Icons** | Lucide React | Consistent iconography |
| **Charts** | Recharts | Simple visualizations |

---

## Project Structure

```
research-viewer/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home/Search page
│   ├── industries/
│   │   ├── page.tsx                  # Industries list
│   │   └── [slug]/
│   │       ├── page.tsx              # Industry detail
│   │       └── [domain]/
│   │           └── page.tsx          # Domain detail
│   ├── problems/
│   │   ├── page.tsx                  # All problems list
│   │   └── [slug]/
│   │       └── page.tsx              # Problem detail
│   └── search/
│       └── page.tsx                  # Advanced search
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   ├── SearchFilters.tsx
│   │   └── SearchSuggestions.tsx
│   ├── problems/
│   │   ├── ProblemCard.tsx
│   │   ├── ProblemList.tsx
│   │   ├── ProblemDetail.tsx
│   │   ├── ProblemScores.tsx
│   │   ├── ProblemRelations.tsx
│   │   └── ProblemSources.tsx
│   ├── industries/
│   │   ├── IndustryCard.tsx
│   │   ├── IndustryGrid.tsx
│   │   └── IndustryStats.tsx
│   ├── charts/
│   │   ├── SeverityChart.tsx
│   │   ├── ImpactRadar.tsx
│   │   └── TrendChart.tsx
│   └── ui/
│       └── ... (shadcn components)
├── lib/
│   ├── data/
│   │   ├── loader.ts                 # Data loading utilities
│   │   ├── index.ts                  # Search index builder
│   │   └── cache.ts                  # Local caching
│   ├── search/
│   │   ├── engine.ts                 # FlexSearch setup
│   │   └── filters.ts                # Filter logic
│   ├── utils/
│   │   ├── slug.ts
│   │   ├── format.ts
│   │   └── scores.ts
│   └── types/
│       └── research.ts               # TypeScript types
├── public/
│   └── research-data/                # JSON data files
│       ├── index.json
│       └── industries/
│           └── ...
├── styles/
│   └── globals.css
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Core Features

### 1. Home Page / Quick Search

The landing page provides immediate access to search and overview statistics.

```tsx
// app/page.tsx
import { SearchBar } from '@/components/search/SearchBar';
import { IndustryGrid } from '@/components/industries/IndustryGrid';
import { StatsOverview } from '@/components/StatsOverview';

export default async function HomePage() {
  const index = await loadIndex();

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Industry Problem Research
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Discover {index.statistics.totalProblems.toLocaleString()} problems
          across {index.statistics.totalIndustries} industries
        </p>

        <SearchBar
          placeholder="Search problems, industries, or keywords..."
          className="max-w-2xl mx-auto"
        />
      </section>

      {/* Quick Stats */}
      <StatsOverview statistics={index.statistics} />

      {/* Industry Grid */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Browse by Industry</h2>
        <IndustryGrid industries={index.industries} />
      </section>
    </main>
  );
}
```

### 2. Search Functionality

#### Search Bar Component

```tsx
// components/search/SearchBar.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchSuggestions } from './SearchSuggestions';
import { useSearch } from '@/lib/hooks/useSearch';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
}

export function SearchBar({
  placeholder = 'Search...',
  className,
  autoFocus,
  onSearch
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 150);
  const { suggestions, isLoading } = useSearch(debouncedQuery);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  }, [onSearch, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-10 pr-10 h-12 text-lg"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showSuggestions && query.length > 1 && (
        <SearchSuggestions
          suggestions={suggestions}
          isLoading={isLoading}
          onSelect={(suggestion) => {
            handleSearch(suggestion);
          }}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}
```

#### Search Engine (FlexSearch)

```typescript
// lib/search/engine.ts
import FlexSearch from 'flexsearch';
import type { Problem, ResearchIndex } from '@/lib/types/research';

interface SearchDocument {
  id: string;
  title: string;
  description: string;
  summary: string;
  industry: string;
  industrySlug: string;
  domain: string;
  domainSlug: string;
  field: string;
  fieldSlug: string;
  tags: string;
  keywords: string;
  problemType: string;
  severity: number;
  tractability: number;
  impactScore: number;
}

class SearchEngine {
  private index: FlexSearch.Document<SearchDocument>;
  private problems: Map<string, Problem> = new Map();
  private initialized = false;

  constructor() {
    this.index = new FlexSearch.Document<SearchDocument>({
      document: {
        id: 'id',
        index: [
          'title',
          'description',
          'summary',
          'industry',
          'domain',
          'field',
          'tags',
          'keywords',
          'problemType'
        ],
        store: [
          'id',
          'title',
          'industry',
          'industrySlug',
          'domain',
          'domainSlug',
          'severity',
          'impactScore'
        ]
      },
      tokenize: 'forward',
      resolution: 9,
      cache: true
    });
  }

  async initialize(problems: Problem[]): Promise<void> {
    if (this.initialized) return;

    for (const problem of problems) {
      const doc: SearchDocument = {
        id: problem.id,
        title: problem.title,
        description: problem.description,
        summary: problem.summary || '',
        industry: problem.industry.name,
        industrySlug: problem.industry.slug,
        domain: problem.domain.name,
        domainSlug: problem.domain.slug,
        field: problem.field?.name || '',
        fieldSlug: problem.field?.slug || '',
        tags: problem.tags.join(' '),
        keywords: problem.keywords.join(' '),
        problemType: problem.problemType,
        severity: problem.severity.overall,
        tractability: problem.tractability.overall,
        impactScore: problem.impactScore
      };

      this.index.add(doc);
      this.problems.set(problem.id, problem);
    }

    this.initialized = true;
  }

  search(query: string, options?: SearchOptions): SearchResult[] {
    const results = this.index.search(query, {
      limit: options?.limit || 50,
      enrich: true
    });

    // Flatten and deduplicate results from different fields
    const seen = new Set<string>();
    const matches: SearchResult[] = [];

    for (const fieldResult of results) {
      for (const item of fieldResult.result) {
        if (!seen.has(item.id as string)) {
          seen.add(item.id as string);
          const problem = this.problems.get(item.id as string);
          if (problem) {
            matches.push({
              problem,
              score: 1, // FlexSearch doesn't expose scores in document mode
              matchedFields: [fieldResult.field]
            });
          }
        }
      }
    }

    // Apply filters
    let filtered = matches;

    if (options?.industry) {
      filtered = filtered.filter(
        r => r.problem.industry.slug === options.industry
      );
    }
    if (options?.domain) {
      filtered = filtered.filter(
        r => r.problem.domain.slug === options.domain
      );
    }
    if (options?.problemType) {
      filtered = filtered.filter(
        r => r.problem.problemType === options.problemType
      );
    }
    if (options?.minSeverity !== undefined) {
      filtered = filtered.filter(
        r => r.problem.severity.overall >= options.minSeverity!
      );
    }
    if (options?.minImpact !== undefined) {
      filtered = filtered.filter(
        r => r.problem.impactScore >= options.minImpact!
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
    if (query.length < 2) return [];

    const results = this.index.search(query, {
      limit: 10,
      suggest: true
    });

    const suggestions = new Set<string>();

    for (const fieldResult of results) {
      for (const item of fieldResult.result) {
        const problem = this.problems.get(item.id as string);
        if (problem) {
          // Add industry and domain as suggestions
          suggestions.add(problem.industry.name);
          suggestions.add(problem.domain.name);
          if (problem.field) {
            suggestions.add(problem.field.name);
          }
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
}

interface SearchOptions {
  limit?: number;
  industry?: string;
  domain?: string;
  problemType?: string;
  minSeverity?: number;
  minImpact?: number;
  sortBy?: 'relevance' | 'severity' | 'impact' | 'tractability';
}

interface SearchResult {
  problem: Problem;
  score: number;
  matchedFields: string[];
}

// Singleton instance
export const searchEngine = new SearchEngine();
```

### 3. Search Results Page

```tsx
// app/search/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { searchEngine } from '@/lib/search/engine';
import type { Problem } from '@/lib/types/research';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Problem[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      const searchResults = searchEngine.search(query, {
        ...filters,
        limit: 100
      });
      setResults(searchResults.map(r => r.problem));
      setIsLoading(false);
    }
  }, [query, filters]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchBar
          placeholder="Search problems..."
          autoFocus
          className="max-w-2xl"
        />
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="w-64 flex-shrink-0">
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
                {results.length} results for "{query}"
              </p>
            </div>
          )}

          <SearchResults
            results={results}
            isLoading={isLoading}
            query={query}
          />
        </main>
      </div>
    </div>
  );
}
```

### 4. Search Filters Component

```tsx
// components/search/SearchFilters.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useDataStore } from '@/lib/stores/dataStore';

export interface SearchFilters {
  industry?: string;
  domain?: string;
  problemTypes?: string[];
  minSeverity?: number;
  maxTractability?: number;
  urgency?: string[];
  scope?: string[];
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  resultCount: number;
}

const PROBLEM_TYPES = [
  { value: 'technical', label: 'Technical' },
  { value: 'process', label: 'Process' },
  { value: 'resource', label: 'Resource' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'coordination', label: 'Coordination' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'market', label: 'Market' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'social', label: 'Social' },
  { value: 'ethical', label: 'Ethical' }
];

const URGENCY_LEVELS = [
  { value: 'critical', label: 'Critical', color: 'destructive' },
  { value: 'high', label: 'High', color: 'warning' },
  { value: 'medium', label: 'Medium', color: 'secondary' },
  { value: 'low', label: 'Low', color: 'outline' }
];

const SCOPE_LEVELS = [
  { value: 'global', label: 'Global' },
  { value: 'industry', label: 'Industry-wide' },
  { value: 'organization', label: 'Organization' },
  { value: 'team', label: 'Team' },
  { value: 'individual', label: 'Individual' }
];

export function SearchFilters({
  filters,
  onChange,
  resultCount
}: SearchFiltersProps) {
  const { industries } = useDataStore();
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const activeFilterCount = Object.values(filters).filter(
    v => v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onChange(updated);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onChange({});
  };

  const toggleArrayFilter = (
    key: 'problemTypes' | 'urgency' | 'scope',
    value: string
  ) => {
    const current = localFilters[key] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated.length > 0 ? updated : undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        {resultCount} results
      </div>

      <Accordion type="multiple" defaultValue={['industry', 'severity', 'type']}>
        {/* Industry Filter */}
        <AccordionItem value="industry">
          <AccordionTrigger>Industry</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {industries.map(industry => (
                <label
                  key={industry.slug}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={filters.industry === industry.slug}
                    onCheckedChange={(checked) =>
                      updateFilter('industry', checked ? industry.slug : undefined)
                    }
                  />
                  <span className="text-sm">{industry.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {industry.problemCount}
                  </Badge>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Severity Filter */}
        <AccordionItem value="severity">
          <AccordionTrigger>
            Minimum Severity
            {filters.minSeverity && (
              <Badge variant="secondary" className="ml-2">
                {filters.minSeverity}+
              </Badge>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-2 py-4">
              <Slider
                value={[filters.minSeverity || 0]}
                min={0}
                max={10}
                step={1}
                onValueChange={([value]) =>
                  updateFilter('minSeverity', value > 0 ? value : undefined)
                }
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Problem Type Filter */}
        <AccordionItem value="type">
          <AccordionTrigger>Problem Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {PROBLEM_TYPES.map(type => (
                <label
                  key={type.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={filters.problemTypes?.includes(type.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter('problemTypes', type.value)
                    }
                  />
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Urgency Filter */}
        <AccordionItem value="urgency">
          <AccordionTrigger>Urgency</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {URGENCY_LEVELS.map(level => (
                <Badge
                  key={level.value}
                  variant={
                    filters.urgency?.includes(level.value)
                      ? 'default'
                      : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('urgency', level.value)}
                >
                  {level.label}
                </Badge>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Scope Filter */}
        <AccordionItem value="scope">
          <AccordionTrigger>Scope</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {SCOPE_LEVELS.map(scope => (
                <label
                  key={scope.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={filters.scope?.includes(scope.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter('scope', scope.value)
                    }
                  />
                  <span className="text-sm">{scope.label}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
```

### 5. Problem Card Component

```tsx
// components/problems/ProblemCard.tsx
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Target,
  Users,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import type { Problem } from '@/lib/types/research';
import { cn } from '@/lib/utils';

interface ProblemCardProps {
  problem: Problem;
  variant?: 'default' | 'compact';
  showIndustry?: boolean;
}

export function ProblemCard({
  problem,
  variant = 'default',
  showIndustry = true
}: ProblemCardProps) {
  const severityColor = getSeverityColor(problem.severity.overall);
  const urgencyColor = getUrgencyColor(problem.urgency);

  if (variant === 'compact') {
    return (
      <Link href={`/problems/${problem.slug}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{problem.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span>{problem.industry.name}</span>
                  <span>/</span>
                  <span>{problem.domain.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={urgencyColor}>{problem.urgency}</Badge>
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold',
                    severityColor
                  )}
                >
                  {problem.severity.overall.toFixed(0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/problems/${problem.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {showIndustry && (
                <div className="text-sm text-muted-foreground mb-1">
                  {problem.industry.name} / {problem.domain.name}
                </div>
              )}
              <CardTitle className="text-lg leading-tight">
                {problem.title}
              </CardTitle>
            </div>
            <Badge variant={urgencyColor} className="flex-shrink-0">
              {problem.urgency}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {problem.summary || problem.description}
          </p>

          {/* Scores */}
          <div className="grid grid-cols-3 gap-4">
            <ScoreIndicator
              icon={AlertTriangle}
              label="Severity"
              value={problem.severity.overall}
              color={severityColor}
            />
            <ScoreIndicator
              icon={Target}
              label="Tractability"
              value={problem.tractability.overall}
              color="bg-blue-500"
            />
            <ScoreIndicator
              icon={TrendingUp}
              label="Impact"
              value={problem.impactScore / 10}
              color="bg-purple-500"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {problem.tags.slice(0, 4).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {problem.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{problem.tags.length - 4}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Badge variant="outline">{problem.problemType}</Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              View details <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ScoreIndicator({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
        <Icon className="h-3 w-3" />
        <span>{label}</span>
      </div>
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full', color)}
          style={{ width: `${value * 10}%` }}
        />
      </div>
      <div className="text-sm font-medium mt-1">{value.toFixed(1)}</div>
    </div>
  );
}

function getSeverityColor(severity: number): string {
  if (severity >= 8) return 'bg-red-500';
  if (severity >= 6) return 'bg-orange-500';
  if (severity >= 4) return 'bg-yellow-500';
  return 'bg-green-500';
}

function getUrgencyColor(urgency: string): 'destructive' | 'warning' | 'secondary' | 'outline' {
  switch (urgency) {
    case 'critical': return 'destructive';
    case 'high': return 'warning';
    case 'medium': return 'secondary';
    default: return 'outline';
  }
}
```

### 6. Problem Detail Page

```tsx
// app/problems/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProblemScores } from '@/components/problems/ProblemScores';
import { ProblemRelations } from '@/components/problems/ProblemRelations';
import { ProblemSources } from '@/components/problems/ProblemSources';
import { SolutionGaps } from '@/components/problems/SolutionGaps';
import { ImpactRadar } from '@/components/charts/ImpactRadar';
import { loadProblemBySlug } from '@/lib/data/loader';
import {
  AlertTriangle,
  Target,
  Eye,
  TrendingUp,
  Users,
  Link2,
  BookOpen,
  Lightbulb,
  ExternalLink
} from 'lucide-react';

interface ProblemPageProps {
  params: { slug: string };
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const problem = await loadProblemBySlug(params.slug);

  if (!problem) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <ol className="flex items-center gap-2">
          <li><a href="/" className="hover:underline">Home</a></li>
          <li>/</li>
          <li>
            <a
              href={`/industries/${problem.industry.slug}`}
              className="hover:underline"
            >
              {problem.industry.name}
            </a>
          </li>
          <li>/</li>
          <li>
            <a
              href={`/industries/${problem.industry.slug}/${problem.domain.slug}`}
              className="hover:underline"
            >
              {problem.domain.name}
            </a>
          </li>
          <li>/</li>
          <li className="text-foreground">{problem.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold">{problem.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={getUrgencyVariant(problem.urgency)}>
              {problem.urgency} urgency
            </Badge>
            <Badge variant="outline">{problem.scope}</Badge>
          </div>
        </div>

        <p className="text-lg text-muted-foreground mb-4">
          {problem.summary || problem.description.slice(0, 300)}
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge>{problem.problemType}</Badge>
          {problem.problemSubtypes?.map(subtype => (
            <Badge key={subtype} variant="secondary">{subtype}</Badge>
          ))}
        </div>
      </header>

      {/* Score Cards */}
      <ProblemScores problem={problem} className="mb-8" />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="causes">Root Causes</TabsTrigger>
              <TabsTrigger value="consequences">Consequences</TabsTrigger>
              <TabsTrigger value="solutions">Solutions</TabsTrigger>
              <TabsTrigger value="gaps">Gaps</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose prose-sm max-w-none">
                    <p>{problem.description}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="causes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Root Causes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {problem.rootCauses.map((cause, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Badge
                          variant={
                            cause.contributionLevel === 'primary'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="mt-0.5"
                        >
                          {cause.contributionLevel}
                        </Badge>
                        <div>
                          <p>{cause.description}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {cause.category}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consequences" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Consequences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {problem.consequences.map((consequence, i) => (
                      <li key={i} className="border-l-2 border-muted pl-4">
                        <p>{consequence.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{consequence.type}</Badge>
                          <Badge variant="secondary">{consequence.timeframe}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="solutions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Existing Solutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {problem.existingSolutions.map((solution, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{solution.name}</h4>
                          <Badge>{solution.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {solution.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>
                            Effectiveness:{' '}
                            <strong>{solution.effectiveness}/10</strong>
                          </span>
                          <Badge variant="secondary">{solution.adoption}</Badge>
                        </div>
                        {solution.limitations && solution.limitations.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground mb-1">
                              Limitations:
                            </p>
                            <ul className="text-xs list-disc list-inside">
                              {solution.limitations.map((l, j) => (
                                <li key={j}>{l}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {solution.url && (
                          <a
                            href={solution.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary mt-2 hover:underline"
                          >
                            Learn more <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gaps" className="mt-4">
              <SolutionGaps gaps={problem.solutionGaps} />
            </TabsContent>
          </Tabs>

          {/* Stakeholders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Stakeholders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {problem.stakeholders.map((stakeholder, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{stakeholder.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Interest: {stakeholder.interest} |
                        Influence: {stakeholder.influence}
                      </span>
                    </div>
                    <p className="text-sm">{stakeholder.description}</p>
                    {stakeholder.examples && (
                      <p className="text-xs text-muted-foreground mt-1">
                        e.g., {stakeholder.examples.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sources */}
          <ProblemSources sources={problem.sources} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Impact Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ImpactRadar problem={problem} />
            </CardContent>
          </Card>

          {/* Related Problems */}
          <ProblemRelations relations={problem.relatedProblems} />

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maturity</span>
                <Badge variant="outline">{problem.maturity}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence</span>
                <span>{(problem.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verification</span>
                <Badge variant="secondary">{problem.verificationStatus}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{new Date(problem.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {problem.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function getUrgencyVariant(urgency: string) {
  switch (urgency) {
    case 'critical': return 'destructive' as const;
    case 'high': return 'warning' as const;
    default: return 'secondary' as const;
  }
}
```

### 7. Industry Browse Page

```tsx
// app/industries/page.tsx
import { IndustryCard } from '@/components/industries/IndustryCard';
import { loadIndex } from '@/lib/data/loader';

export default async function IndustriesPage() {
  const index = await loadIndex();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Industries</h1>
        <p className="text-muted-foreground">
          Explore {index.statistics.totalProblems.toLocaleString()} problems
          across {index.statistics.totalIndustries} industries
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {index.industries.map(industry => (
          <IndustryCard key={industry.id} industry={industry} />
        ))}
      </div>
    </div>
  );
}
```

```tsx
// components/industries/IndustryCard.tsx
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import type { IndustryReference } from '@/lib/types/research';
import { getIndustryIcon } from '@/lib/utils/icons';

interface IndustryCardProps {
  industry: IndustryReference;
}

export function IndustryCard({ industry }: IndustryCardProps) {
  const Icon = getIndustryIcon(industry.slug);

  return (
    <Link href={`/industries/${industry.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">{industry.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">
                {industry.domainCount} domains
              </div>
              <div className="font-medium">
                {industry.problemCount.toLocaleString()} problems
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

---

## Data Loading

### Static Data Loading

```typescript
// lib/data/loader.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  ResearchIndex,
  IndustryMetadata,
  Problem
} from '@/lib/types/research';

const DATA_PATH = process.env.DATA_PATH || './public/research-data';

export async function loadIndex(): Promise<ResearchIndex> {
  const filePath = path.join(process.cwd(), DATA_PATH, 'index.json');
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

export async function loadIndustry(slug: string): Promise<IndustryMetadata | null> {
  try {
    const filePath = path.join(
      process.cwd(),
      DATA_PATH,
      'industries',
      slug,
      '_metadata.json'
    );
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function loadProblems(
  industrySlug: string,
  domainSlug?: string
): Promise<Problem[]> {
  const basePath = path.join(
    process.cwd(),
    DATA_PATH,
    'industries',
    industrySlug
  );

  if (domainSlug) {
    const filePath = path.join(basePath, domainSlug, 'problems.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return data.problems || [];
  }

  // Load all problems for industry
  const industry = await loadIndustry(industrySlug);
  if (!industry) return [];

  const problems: Problem[] = [];
  for (const domain of industry.domains) {
    const domainProblems = await loadProblems(industrySlug, domain.slug);
    problems.push(...domainProblems);
  }

  return problems;
}

export async function loadAllProblems(): Promise<Problem[]> {
  const index = await loadIndex();
  const problems: Problem[] = [];

  for (const industry of index.industries) {
    const industryProblems = await loadProblems(industry.slug);
    problems.push(...industryProblems);
  }

  return problems;
}

export async function loadProblemBySlug(slug: string): Promise<Problem | null> {
  const allProblems = await loadAllProblems();
  return allProblems.find(p => p.slug === slug) || null;
}

export async function loadProblemById(id: string): Promise<Problem | null> {
  const allProblems = await loadAllProblems();
  return allProblems.find(p => p.id === id) || null;
}
```

### Client-Side Data Store

```typescript
// lib/stores/dataStore.ts
import { create } from 'zustand';
import type { ResearchIndex, Problem, IndustryReference } from '@/lib/types/research';
import { searchEngine } from '@/lib/search/engine';

interface DataStore {
  index: ResearchIndex | null;
  industries: IndustryReference[];
  problems: Problem[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  searchProblems: (query: string) => Problem[];
}

export const useDataStore = create<DataStore>((set, get) => ({
  index: null,
  industries: [],
  problems: [],
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true, error: null });

    try {
      // Load index
      const indexResponse = await fetch('/research-data/index.json');
      const index: ResearchIndex = await indexResponse.json();

      // Load all problems
      const problems: Problem[] = [];
      for (const industry of index.industries) {
        const industryResponse = await fetch(
          `/research-data/industries/${industry.slug}/_metadata.json`
        );
        const industryData = await industryResponse.json();

        for (const domain of industryData.domains) {
          const problemsResponse = await fetch(
            `/research-data/industries/${industry.slug}/${domain.slug}/problems.json`
          );
          const problemsData = await problemsResponse.json();
          problems.push(...(problemsData.problems || []));
        }
      }

      // Initialize search engine
      await searchEngine.initialize(problems);

      set({
        index,
        industries: index.industries,
        problems,
        isLoading: false,
        isInitialized: true
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      });
    }
  },

  searchProblems: (query: string) => {
    const results = searchEngine.search(query);
    return results.map(r => r.problem);
  }
}));
```

---

## Deployment

### Static Export Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Ensure data files are included
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./public/research-data/**/*']
    }
  }
};

module.exports = nextConfig;
```

### Build Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build && next export",
    "serve": "npx serve out",
    "validate-data": "tsx scripts/validate-data.ts",
    "build-search-index": "tsx scripts/build-search-index.ts"
  }
}
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
      try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }

    # Cache JSON data
    location ~* \.json$ {
      expires 1h;
      add_header Cache-Control "public";
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
  }
}
```

---

## Performance Optimizations

1. **Static Generation**: All pages pre-rendered at build time
2. **Client-side Search**: FlexSearch provides instant results
3. **Lazy Loading**: Components loaded on demand
4. **Image Optimization**: Next.js image handling
5. **Caching**: Aggressive caching for JSON data files
6. **Code Splitting**: Automatic chunk splitting by Next.js

---

## Accessibility

- Full keyboard navigation
- ARIA labels on interactive elements
- Focus management for modals/dialogs
- Color contrast compliance (WCAG 2.1 AA)
- Screen reader friendly content structure
- Reduced motion support

---

## Future Enhancements

1. **Offline Support**: Service worker for offline viewing
2. **Export Features**: Download problems as PDF/CSV
3. **Comparison View**: Compare multiple problems side-by-side
4. **Bookmarks**: Save problems for later
5. **Notes**: Add personal annotations
6. **Sharing**: Share problem links with preview cards
7. **Dark Mode**: Theme switching support
8. **Keyboard Shortcuts**: Power user navigation
