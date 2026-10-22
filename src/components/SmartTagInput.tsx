import React, { useState, useRef, useEffect, useMemo } from "react";
import { Plus, X, Tag, Check, Sparkles } from "lucide-react";

interface SmartTagInputProps {
  tags: string[];
  onChange: (newTags: string[]) => void;
  allAvailableTags: string[]; // pool of all tags across the user's notebook
  placeholder?: string;
  theme?: 'light' | 'dark';
  badgeColor?: string;
}

export const SmartTagInput: React.FC<SmartTagInputProps> = ({
  tags,
  onChange,
  allAvailableTags,
  placeholder = "Aggiungi un tag (es. Cucina, Maniglie, Ufficio...)",
  theme = 'light',
  badgeColor = "bg-[#3A86FF]/15 text-[#3A86FF] border-[#3A86FF]",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute tag frequencies from allAvailableTags
  const tagCounts = useMemo(() => {
    const map: Record<string, number> = {};
    allAvailableTags.forEach((t) => {
      if (!t) return;
      const clean = t.trim();
      map[clean] = (map[clean] || 0) + 1;
    });
    return map;
  }, [allAvailableTags]);

  // Unique suggestions not already in tags
  const filteredSuggestions = useMemo(() => {
    const currentSet = new Set(tags.map((t) => t.toLowerCase()));
    const query = inputValue.toLowerCase().trim();

    const uniqueTags: string[] = Array.from(new Set(allAvailableTags.map((t) => t.trim()))).filter(
      (t): t is string => typeof t === "string" && t.length > 0 && !currentSet.has(t.toLowerCase())
    );

    if (!query) {
      // Return top 8 most frequent tags
      return uniqueTags
        .sort((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0))
        .slice(0, 8);
    }

    return uniqueTags
      .filter((t) => t.toLowerCase().includes(query))
      .sort((a, b) => {
        // Exact prefix match first, then frequency
        const aStarts = a.toLowerCase().startsWith(query);
        const bStarts = b.toLowerCase().startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return (tagCounts[b] || 0) - (tagCounts[a] || 0);
      })
      .slice(0, 8);
  }, [allAvailableTags, tags, inputValue, tagCounts]);

  const canCreateNew = useMemo(() => {
    const clean = inputValue.trim();
    if (!clean) return false;
    const exists = tags.some((t) => t.toLowerCase() === clean.toLowerCase());
    return !exists;
  }, [inputValue, tags]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim();
    if (!clean) return;
    if (tags.some((t) => t.toLowerCase() === clean.toLowerCase())) return;
    onChange([...tags, clean]);
    setInputValue("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveTag = (indexToRemove: number) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      const totalOptions = filteredSuggestions.length + (canCreateNew ? 1 : 0);
      if (totalOptions > 0) {
        setHighlightedIndex((prev) => (prev + 1) % totalOptions);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const totalOptions = filteredSuggestions.length + (canCreateNew ? 1 : 0);
      if (totalOptions > 0) {
        setHighlightedIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
      }
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (!isOpen && canCreateNew) {
        handleAddTag(inputValue);
        return;
      }
      if (highlightedIndex < filteredSuggestions.length) {
        handleAddTag(filteredSuggestions[highlightedIndex]);
      } else if (canCreateNew) {
        handleAddTag(inputValue);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      handleRemoveTag(tags.length - 1);
    }
  };

  const dropdownBg = theme === 'dark' ? 'bg-[#22201D] border-[#38332E] text-[#F7F4EB]' : 'bg-[#FFFDF7] border-[#1C1A17] text-[#1C1A17]';
  const itemHoverBg = theme === 'dark' ? 'hover:bg-[#2C2A26]' : 'hover:bg-[#FFD13B]/20';
  const itemActiveBg = theme === 'dark' ? 'bg-[#38332E]' : 'bg-[#FFD13B]/30';

  return (
    <div className="relative w-full space-y-2" ref={containerRef}>
      {/* Existing Tags Chips */}
      <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-hand font-bold border shadow-xs transition-transform hover:scale-105 ${badgeColor}`}
          >
            <span>#{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(idx)}
              className="p-0.5 rounded-full hover:bg-black/10 transition cursor-pointer"
              title="Rimuovi tag"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {tags.length === 0 && (
          <span className="text-[11px] opacity-60 font-hand italic">
            Nessun tag inserito. Scrivi sotto per aggiungerne uno con suggerimenti intelligenti.
          </span>
        )}
      </div>

      {/* Input Field with smart autocomplete */}
      <div className="relative">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setIsOpen(true);
                setHighlightedIndex(0);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border-2 font-hand focus:outline-none transition ${
                theme === 'dark'
                  ? 'bg-[#181716] border-[#38332E] text-[#F7F4EB] placeholder-[#8C827A]'
                  : 'bg-[#FFFDF7] border-[#1C1A17] text-[#1C1A17] placeholder-[#8C827A]'
              }`}
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleAddTag(inputValue)}
            disabled={!inputValue.trim()}
            className="px-3 py-1.5 rounded-xl border-2 border-[#1C1A17] bg-[#FFD13B] hover:bg-[#FFC01E] text-[#1C1A17] font-hand font-bold text-xs shadow-doodle-sm btn-doodle cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Aggiungi</span>
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && (filteredSuggestions.length > 0 || canCreateNew) && (
          <div
            className={`absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto rounded-xl border-2 shadow-doodle-lg z-50 p-1 text-xs animate-in fade-in-50 zoom-in-95 ${dropdownBg}`}
          >
            <div className="px-2.5 py-1 text-[10px] font-typewriter uppercase tracking-wider opacity-70 flex items-center justify-between border-b border-current/15 mb-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FFBE0B]" />
                <span>Suggeriti dal Taccuino</span>
              </span>
              <span className="text-[9px]">Usa ↑/↓ e Invio</span>
            </div>

            {filteredSuggestions.map((suggestion, idx) => {
              const isSelected = highlightedIndex === idx;
              const count = tagCounts[suggestion] || 0;

              return (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleAddTag(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition cursor-pointer ${
                    isSelected ? itemActiveBg : itemHoverBg
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-hand font-bold text-xs">#{suggestion}</span>
                  </div>
                  {count > 0 && (
                    <span className="font-typewriter text-[10px] opacity-60">
                      usato {count} {count === 1 ? "volta" : "volte"}
                    </span>
                  )}
                </button>
              );
            })}

            {canCreateNew && (
              <button
                type="button"
                onClick={() => handleAddTag(inputValue)}
                onMouseEnter={() => setHighlightedIndex(filteredSuggestions.length)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between border-t border-dashed border-current/20 mt-1 text-[#38B000] font-hand font-bold transition cursor-pointer ${
                  highlightedIndex === filteredSuggestions.length ? itemActiveBg : itemHoverBg
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crea nuovo tag "#{inputValue.trim()}"</span>
                </div>
                <span className="font-typewriter text-[10px] opacity-75">Nuovo</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
