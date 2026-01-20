'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useDataStore } from '@/lib/stores/dataStore';
import {
  PROBLEM_TYPES,
  URGENCY_LEVELS,
  SCOPE_LEVELS,
  countActiveFilters,
  type SearchFilters as SearchFiltersType,
} from '@/lib/search/filters';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onChange: (filters: SearchFiltersType) => void;
  resultCount: number;
}

export function SearchFilters({
  filters,
  onChange,
  resultCount,
}: SearchFiltersProps) {
  const { industries } = useDataStore();
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters);

  const activeFilterCount = countActiveFilters(filters);

  const updateFilter = <K extends keyof SearchFiltersType>(
    key: K,
    value: SearchFiltersType[K]
  ) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onChange(updated);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onChange({});
  };

  const toggleArrayFilter = <K extends 'problemTypes' | 'urgency' | 'scope'>(
    key: K,
    value: string
  ) => {
    const current = (localFilters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated.length > 0 ? (updated as SearchFiltersType[K]) : undefined);
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

      <div className="text-sm text-muted-foreground">{resultCount} results</div>

      <Accordion
        type="multiple"
        defaultValue={['industry', 'severity', 'type']}
      >
        {/* Industry Filter */}
        <AccordionItem value="industry">
          <AccordionTrigger>Industry</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {industries.map((industry) => (
                <label
                  key={industry.slug}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={filters.industry === industry.slug}
                    onCheckedChange={(checked) =>
                      updateFilter(
                        'industry',
                        checked ? industry.slug : undefined
                      )
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
            {filters.minSeverity && filters.minSeverity > 0 && (
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
              {PROBLEM_TYPES.map((type) => (
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
              {URGENCY_LEVELS.map((level) => (
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
              {SCOPE_LEVELS.map((scope) => (
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
