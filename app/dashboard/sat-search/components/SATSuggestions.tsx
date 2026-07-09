'use client';

import { Badge } from '@/components/ui/badge';

interface SATSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export function SATSuggestions({ suggestions, onSuggestionClick }: SATSuggestionsProps) {
  return (
    <div data-tour="sat-search-suggestions" className="flex flex-col gap-3">
      <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
        SUGERENCIAS
      </h2>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Badge
            key={suggestion}
            variant="secondary"
            className="hover:bg-primary hover:text-primary-foreground cursor-pointer px-4 py-2 text-sm transition-colors"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>
    </div>
  );
}
