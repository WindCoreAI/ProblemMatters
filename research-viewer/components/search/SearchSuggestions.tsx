'use client';

import { Search, TrendingUp } from 'lucide-react';

interface SearchSuggestionsProps {
  suggestions: string[];
  isLoading: boolean;
  onSelect: (suggestion: string) => void;
  onClose: () => void;
}

export function SearchSuggestions({
  suggestions,
  isLoading,
  onSelect,
}: SearchSuggestionsProps) {
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50">
        <div className="p-4 text-center text-muted-foreground">
          Searching...
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50">
      <div className="p-2">
        <p className="px-2 py-1 text-xs text-muted-foreground font-medium">
          Suggestions
        </p>
        <ul className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <li key={index}>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-md hover:bg-muted transition-colors"
                onClick={() => onSelect(suggestion)}
              >
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{suggestion}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t px-4 py-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Search className="h-3 w-3" />
          Press Enter to search
        </p>
      </div>
    </div>
  );
}
