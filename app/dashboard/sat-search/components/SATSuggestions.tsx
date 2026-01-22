"use client";

import { Badge } from "@/components/ui/badge";

interface SATSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export function SATSuggestions({
  suggestions,
  onSuggestionClick,
}: SATSuggestionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        SUGERENCIAS
      </h2>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>
    </div>
  );
}
