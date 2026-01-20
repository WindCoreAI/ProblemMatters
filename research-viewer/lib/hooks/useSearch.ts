'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchEngine, type SearchOptions, type SearchResult } from '@/lib/search/engine';
import { useDataStore } from '@/lib/stores/dataStore';

export interface UseSearchResult {
  results: SearchResult[];
  suggestions: string[];
  isLoading: boolean;
  isReady: boolean;
  search: (query: string, options?: SearchOptions) => void;
}

export function useSearch(initialQuery?: string): UseSearchResult {
  const { problems, isInitialized, initialize } = useDataStore();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Initialize data store and search engine
  useEffect(() => {
    const init = async () => {
      if (!isInitialized) {
        await initialize();
      }
    };
    init();
  }, [isInitialized, initialize]);

  // Initialize search engine when problems are loaded
  useEffect(() => {
    const initSearch = async () => {
      if (problems.length > 0 && !searchEngine.isReady()) {
        await searchEngine.initialize(problems);
        setIsReady(true);
      } else if (searchEngine.isReady()) {
        setIsReady(true);
      }
    };
    initSearch();
  }, [problems]);

  // Perform initial search if query provided
  useEffect(() => {
    if (isReady && initialQuery) {
      search(initialQuery);
    }
  }, [isReady, initialQuery]);

  const search = useCallback(
    (query: string, options?: SearchOptions) => {
      if (!isReady || !query.trim()) {
        setResults([]);
        setSuggestions([]);
        return;
      }

      setIsLoading(true);

      try {
        const searchResults = searchEngine.search(query, options);
        setResults(searchResults);

        const searchSuggestions = searchEngine.getSuggestions(query);
        setSuggestions(searchSuggestions);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [isReady]
  );

  return {
    results,
    suggestions,
    isLoading,
    isReady,
    search,
  };
}
