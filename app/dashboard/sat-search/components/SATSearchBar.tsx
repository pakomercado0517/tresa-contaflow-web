"use client";

import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SATSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isSearching?: boolean;
  disabledByLimit?: boolean;
  aiSearchesRemaining?: number | null;
  aiSearchesLimit?: number | null;
}

export function SATSearchBar({
  value,
  onChange,
  onSearch,
  isSearching = false,
  disabledByLimit = false,
  aiSearchesRemaining,
  aiSearchesLimit,
}: SATSearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isSearching && !disabledByLimit) {
      onSearch(value.trim());
    }
  };

  const isDisabled = isSearching || !value.trim() || disabledByLimit;

  return (
    <div className="flex w-full flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <div className="relative flex flex-1 items-center">
          <div className="absolute left-3 flex items-center">
            <Search className="size-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="EJ: Consultoría en desarrollo de software para fintech..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-12 pl-10 pr-4 text-base"
            disabled={isSearching}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          disabled={isDisabled}
        >
          <Sparkles className="size-4" />
          <Search className="size-4" />
          <span className="hidden sm:inline">Buscar con IA</span>
          <span className="sm:hidden">Buscar</span>
        </Button>
      </form>
      {aiSearchesLimit != null && (
        <p className="text-xs text-muted-foreground">
          {aiSearchesRemaining != null
            ? `${aiSearchesRemaining} búsquedas con IA restantes este mes`
            : "Búsquedas con IA ilimitadas"}
        </p>
      )}
    </div>
  );
}
