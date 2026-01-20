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
  defaultValue?: string;
}

export function SearchBar({
  placeholder = 'Search problems, industries, or keywords...',
  className,
  autoFocus,
  onSearch,
  defaultValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 150);
  const { suggestions, isLoading, isReady, search } = useSearch();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length > 1 && isReady) {
      search(debouncedQuery, { limit: 5 });
    }
  }, [debouncedQuery, isReady, search]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (searchQuery.trim()) {
        setShowSuggestions(false);
        if (onSearch) {
          onSearch(searchQuery);
        } else {
          router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
      }
    },
    [onSearch, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
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
            setQuery(suggestion);
            handleSearch(suggestion);
          }}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}
