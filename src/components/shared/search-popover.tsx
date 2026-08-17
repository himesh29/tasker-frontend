"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchPopover({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");

  function handleClear() {
    setQuery("");
    onSearch("");
    setIsExpanded(false);
  }

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsExpanded(true)}
        className="flex-shrink-0"
      >
        <Search className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-nowrap min-w-0">
      <div className="relative flex items-center flex-1 min-w-[120px] sm:min-w-[200px]">
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          autoFocus
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          className="h-8 w-full pl-8 pr-8 text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              onSearch("");
            }}
            className="absolute right-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0"
        onClick={handleClear}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
