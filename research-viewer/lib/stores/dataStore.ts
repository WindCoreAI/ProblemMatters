'use client';

import { create } from 'zustand';
import type {
  ResearchIndex,
  Problem,
  IndustryReference,
  IndustryMetadata,
  DomainMetadata,
  FieldProblemsFile,
} from '@/lib/types/research';

interface DataStore {
  index: ResearchIndex | null;
  industries: IndustryReference[];
  problems: Problem[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  getIndustryBySlug: (slug: string) => IndustryReference | undefined;
  getProblemBySlug: (slug: string) => Problem | undefined;
  getProblemsByIndustry: (industrySlug: string) => Problem[];
  getProblemsByDomain: (industrySlug: string, domainSlug: string) => Problem[];
  getProblemsByField: (industrySlug: string, domainSlug: string, fieldSlug: string) => Problem[];
}

export const useDataStore = create<DataStore>((set, get) => ({
  index: null,
  industries: [],
  problems: [],
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    if (get().isInitialized || get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      // Load index
      const indexResponse = await fetch('/research-data/index.json');
      if (!indexResponse.ok) {
        throw new Error('Failed to load index');
      }
      const index: ResearchIndex = await indexResponse.json();

      // Load all problems
      const problems: Problem[] = [];

      for (const industry of index.industries) {
        try {
          // Load industry metadata
          const industryResponse = await fetch(
            `/research-data/industries/${industry.slug}/_metadata.json`
          );
          if (!industryResponse.ok) continue;

          const industryData: IndustryMetadata = await industryResponse.json();

          // Load problems for each domain from field files
          for (const domainRef of industryData.domains) {
            try {
              // Load domain metadata to get field list
              const domainResponse = await fetch(
                `/research-data/industries/${industry.slug}/${domainRef.slug}/_metadata.json`
              );

              if (domainResponse.ok) {
                const domainData: DomainMetadata = await domainResponse.json();

                // Load problems from field files (the canonical storage format)
                // Get field slugs from statistics.fieldProblems keys
                const fieldSlugs = domainData.statistics?.fieldProblems
                  ? Object.keys(domainData.statistics.fieldProblems)
                  : [];

                for (const fieldSlug of fieldSlugs) {
                  try {
                    const fieldResponse = await fetch(
                      `/research-data/industries/${industry.slug}/${domainRef.slug}/fields/${fieldSlug}.json`
                    );
                    if (fieldResponse.ok) {
                      const fieldData: FieldProblemsFile = await fieldResponse.json();
                      if (fieldData.problems) {
                        problems.push(...fieldData.problems);
                      }
                    }
                  } catch {
                    // Skip if field file doesn't exist
                  }
                }
              }
            } catch {
              // Skip if domain metadata doesn't exist
              continue;
            }
          }
        } catch {
          // Skip if industry metadata doesn't exist
          continue;
        }
      }

      set({
        index,
        industries: index.industries,
        problems,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
      });
    }
  },

  getIndustryBySlug: (slug: string) => {
    return get().industries.find((i) => i.slug === slug);
  },

  getProblemBySlug: (slug: string) => {
    return get().problems.find((p) => p.slug === slug);
  },

  getProblemsByIndustry: (industrySlug: string) => {
    return get().problems.filter((p) => p.industry.slug === industrySlug);
  },

  getProblemsByDomain: (industrySlug: string, domainSlug: string) => {
    return get().problems.filter(
      (p) => p.industry.slug === industrySlug && p.domain.slug === domainSlug
    );
  },

  getProblemsByField: (industrySlug: string, domainSlug: string, fieldSlug: string) => {
    return get().problems.filter(
      (p) =>
        p.industry.slug === industrySlug &&
        p.domain.slug === domainSlug &&
        p.field?.slug === fieldSlug
    );
  },
}));
