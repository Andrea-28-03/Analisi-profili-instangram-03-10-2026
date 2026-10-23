import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Plus,
  X,
  RotateCcw,
  Sparkles,
  Layers,
  Check,
  Tag,
  SlidersHorizontal,
  Filter,
  Eye,
  EyeOff,
  BookOpen,
} from "lucide-react";
import {
  DEFAULT_TAXONOMY_TREE,
  STUDIO_SUBTYPES,
  AZIENDA_SUBTYPES,
  TaxonomyCategory,
  classifyMacroEntity,
} from "../utils/entityClassifier";
import { InstagramProfile, FilterMacroEntity, MacroEntity } from "../types";
import {
  getTaxonomyForMacro,
  MACRO_CATEGORY_CONFIG,
  getSuggestedTagsForMacro,
  getTopTagsForCategory,
  getAutocompleteSuggestions,
  SubtypeGroup,
  AutocompleteTagResult,
} from "../utils/categoryTaxonomyMap";

interface TaxonomyFilterBarProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
  profiles: InstagramProfile[];
  theme?: 'light' | 'dark';
  matchMode?: 'or' | 'and';
  onMatchModeChange?: (mode: 'or' | 'and') => void;
  customCategories?: string[];
  onAddCustomCategory?: (category: string) => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  selectedMacroEntity?: FilterMacroEntity;
  onMacroEntityChange?: (macro: FilterMacroEntity) => void;
}

export const TaxonomyFilterBar: React.FC<TaxonomyFilterBarProps> = ({
  selectedTags,
  onToggleTag,
  onClearTags,
  profiles,
  theme = 'light',
  matchMode = 'or',
  onMatchModeChange,
  customCategories = [],
  onAddCustomCategory,
  isOpen,
  onToggleOpen,
  selectedMacroEntity = 'all',
  onMacroEntityChange,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isTaxonomyExpanded = isOpen !== undefined ? isOpen : internalExpanded;
  const toggleTaxonomyExpanded = () => {
    if (onToggleOpen) {
      onToggleOpen();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  };

  // Filter taxonomy by the active Category to keep the view focused
  const [filterByActiveCategory, setFilterByActiveCategory] = useState(true);

  // Toggle between compact mode (only tags with >0 results) vs all predefined options
  const [showAllPredefined, setShowAllPredefined] = useState(false);

  // Expanded categories state
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "interni-spazi": true,
    "prodotto-arredo": true,
    "tipi-entita": true,
    "grafica-visivo": true,
    "stili-design": true,
    "stili-arte": true,
    "arti-illustrazione": true,
    "musica-cultura": true,
    "custom-tags": true,
    "suggeriti-categoria": true,
  });

  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  const isDark = theme === 'dark';

  // Get current active macro category configuration if one is selected
  const activeMacroConfig =
    selectedMacroEntity !== "all"
      ? MACRO_CATEGORY_CONFIG[selectedMacroEntity as MacroEntity]
      : null;

  // Filtered taxonomy groups based on selected category
  const {
    categories: displayCategories,
    subtypeGroups,
    studioSubtypes,
    aziendaSubtypes,
    categoryTagsInProfiles,
  } = useMemo(() => {
    return getTaxonomyForMacro(
      selectedMacroEntity,
      profiles,
      filterByActiveCategory && selectedMacroEntity !== "all"
    );
  }, [selectedMacroEntity, profiles, filterByActiveCategory]);

  // Suggested tags specific to this category
  const categorySuggestedTags = useMemo(() => {
    if (selectedMacroEntity === "all") return [];
    return getSuggestedTagsForMacro(selectedMacroEntity as MacroEntity, profiles);
  }, [selectedMacroEntity, profiles]);

  // Calculate tag counts across the entire notebook AND specifically for the active macro entity
  const { totalTagCounts, macroTagCounts } = useMemo(() => {
    const totalMap: Record<string, number> = {};
    const macroMap: Record<string, number> = {};

    profiles.forEach((p) => {
      const isCurrentMacro =
        selectedMacroEntity === "all" ||
        classifyMacroEntity(p) === selectedMacroEntity;

      const ai = p.aiAnalysis;
      if (!ai) return;

      const profileAllTags = [
        ...(ai.subCategories || []),
        ...(ai.designTags || []),
        ...(ai.keySpecialties || []),
        ai.subType,
      ].filter(Boolean) as string[];

      profileAllTags.forEach((t) => {
        const clean = t.trim();
        totalMap[clean] = (totalMap[clean] || 0) + 1;
        if (isCurrentMacro) {
          macroMap[clean] = (macroMap[clean] || 0) + 1;
        }
      });
    });

    return { totalTagCounts: totalMap, macroTagCounts: macroMap };
  }, [profiles, selectedMacroEntity]);

  // Discovered extra tags tailored to the current view
  const discoveredExtraTags = useMemo(() => {
    const defaultTagSet = new Set<string>();
    DEFAULT_TAXONOMY_TREE.forEach((cat) => {
      cat.subCategories.forEach((sub) => defaultTagSet.add(sub.name));
    });
    STUDIO_SUBTYPES.forEach((st) => defaultTagSet.add(st));
    AZIENDA_SUBTYPES.forEach((at) => defaultTagSet.add(at));

    const extras = new Set<string>();

    profiles.forEach((p) => {
      // If filtering by category, only pull discovered tags from profiles of this category
      if (
        filterByActiveCategory &&
        selectedMacroEntity !== "all" &&
        classifyMacroEntity(p) !== selectedMacroEntity
      ) {
        return;
      }

      const ai = p.aiAnalysis;
      if (!ai) return;
      ai.subCategories?.forEach((t) => {
        if (!defaultTagSet.has(t)) extras.add(t);
      });
      ai.designTags?.forEach((t) => {
        if (!defaultTagSet.has(t)) extras.add(t);
      });
    });

    // Also include user-created custom tags
    customCategories.forEach((ct) => extras.add(ct));

    return Array.from(extras).filter(Boolean);
  }, [profiles, customCategories, filterByActiveCategory, selectedMacroEntity]);

  // Strict zero-count pruning OR Show All Predefined mode
  const prunedCategories = useMemo(() => {
    return displayCategories
      .map((category) => {
        const visibleSubs = category.subCategories.filter((sub) => {
          if (showAllPredefined) return true;
          const count =
            selectedMacroEntity === "all"
              ? totalTagCounts[sub.name] || 0
              : macroTagCounts[sub.name] || 0;
          return count > 0 || selectedTags.includes(sub.name);
        });
        return {
          ...category,
          subCategories: visibleSubs,
        };
      })
      .filter((category) => category.subCategories.length > 0);
  }, [displayCategories, totalTagCounts, macroTagCounts, selectedMacroEntity, selectedTags, showAllPredefined]);

  // Subtype groups pruned or shown in full
  const visibleSubtypeGroups = useMemo(() => {
    return (subtypeGroups || [])
      .map((grp) => {
        const visibleItems = grp.items.filter((item) => {
          if (showAllPredefined) return true;
          const count =
            selectedMacroEntity === "all"
              ? totalTagCounts[item] || 0
              : macroTagCounts[item] || 0;
          return count > 0 || selectedTags.includes(item);
        });
        return {
          ...grp,
          items: visibleItems,
        };
      })
      .filter((grp) => grp.items.length > 0);
  }, [subtypeGroups, totalTagCounts, macroTagCounts, selectedMacroEntity, selectedTags, showAllPredefined]);

  // Strict zero-count pruning for discovered extra tags
  const visibleDiscoveredExtraTags = useMemo(() => {
    return discoveredExtraTags.filter((tag) => {
      const count =
        selectedMacroEntity === "all"
          ? totalTagCounts[tag] || 0
          : macroTagCounts[tag] || 0;
      return count > 0 || selectedTags.includes(tag);
    });
  }, [discoveredExtraTags, totalTagCounts, macroTagCounts, selectedMacroEntity, selectedTags]);

  // Strict zero-count pruning for suggested tags in active category
  const visibleCategorySuggestedTags = useMemo(() => {
    return categorySuggestedTags.filter((tag) => {
      if (showAllPredefined) return true;
      const count =
        selectedMacroEntity === "all"
          ? totalTagCounts[tag] || 0
          : macroTagCounts[tag] || 0;
      return count > 0 || selectedTags.includes(tag);
    });
  }, [categorySuggestedTags, totalTagCounts, macroTagCounts, selectedMacroEntity, selectedTags, showAllPredefined]);

  // Top tags actually present in the current category for quick pills
  const topCategoryTags = useMemo(() => {
    return getTopTagsForCategory(selectedMacroEntity, profiles, 8);
  }, [selectedMacroEntity, profiles]);

  // Autocomplete suggestions as user types
  const autocompleteSuggestions = useMemo(() => {
    return getAutocompleteSuggestions(
      newTagInput,
      selectedMacroEntity,
      profiles,
      customCategories,
      8
    );
  }, [newTagInput, selectedMacroEntity, profiles, customCategories]);

  // Total count of predefined options
  const totalPredefinedCount = useMemo(() => {
    const catsTotal = displayCategories.reduce((acc, c) => acc + c.subCategories.length, 0);
    const subsTotal = (subtypeGroups || []).reduce((acc, g) => acc + g.items.length, 0);
    return catsTotal + subsTotal;
  }, [displayCategories, subtypeGroups]);

  const hasSubtypes = visibleSubtypeGroups.length > 0;

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleExpandAll = () => {
    setExpandedCategories({
      "interni-spazi": true,
      "prodotto-arredo": true,
      "tipi-entita": true,
      "grafica-visivo": true,
      "arti-illustrazione": true,
      "musica-cultura": true,
      "custom-tags": true,
      "suggeriti-categoria": true,
    });
  };

  const handleCollapseAll = () => {
    setExpandedCategories({
      "interni-spazi": false,
      "prodotto-arredo": false,
      "tipi-entita": false,
      "grafica-visivo": false,
      "arti-illustrazione": false,
      "musica-cultura": false,
      "custom-tags": false,
      "suggeriti-categoria": false,
    });
  };

  const handleSelectTagSuggestion = (tagName: string) => {
    const clean = tagName.trim();
    if (!clean) return;
    if (onAddCustomCategory && !customCategories.includes(clean)) {
      onAddCustomCategory(clean);
    }
    onToggleTag(clean);
    setNewTagInput("");
    setIsAddingTag(false);
  };

  const handleCreateNewTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagInput.trim();
    if (!clean) return;
    if (onAddCustomCategory) {
      onAddCustomCategory(clean);
    }
    onToggleTag(clean);
    setNewTagInput("");
    setIsAddingTag(false);
  };

  // High-contrast styling
  const containerBg = isDark
    ? 'bg-[#181716] border-[#44403C] text-[#F7F4EB]'
    : 'bg-[#FFFDF7] border-[#1C1A17] text-[#1C1A17]';
  const cardBg = isDark
    ? 'bg-[#22201D] border-[#44403C] text-[#F7F4EB]'
    : 'bg-[#FAF7F0] border-[#1C1A17] text-[#1C1A17]';
  const headerText = isDark ? 'text-[#F7F4EB]' : 'text-[#1C1A17]';

  return (
    <div
      className={`rounded-2xl border-2 p-4 sm:p-5 shadow-doodle-sm transition-colors ${containerBg}`}
    >
      {/* Top Header of Taxonomy Section - Clickable to expand/collapse */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isTaxonomyExpanded ? 'pb-3.5 border-b-2 border-current/15' : ''}`}>
        <div
          onClick={toggleTaxonomyExpanded}
          className="flex items-center gap-2.5 cursor-pointer select-none group flex-1"
          title={isTaxonomyExpanded ? "Clicca qui per compattare la lista dei filtri" : "Clicca qui per espandere la lista dei filtri"}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-xs border-2 transition-transform group-hover:scale-105 ${
              isDark
                ? 'bg-[#FFD13B] text-[#181716] border-[#FFD13B]'
                : 'bg-[#FFD13B] text-[#1C1A17] border-[#1C1A17]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-sans font-bold text-base tracking-tight group-hover:text-[#FF8500] transition-colors flex items-center gap-1.5 ${headerText}`}>
                <span>Tag & Sotto-categorie</span>
                <span className="p-0.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition">
                  {isTaxonomyExpanded ? (
                    <ChevronUp className="w-4 h-4 opacity-75" />
                  ) : (
                    <ChevronDown className="w-4 h-4 opacity-75" />
                  )}
                </span>
              </h3>

              {/* Dynamic Category Context Badge */}
              {selectedMacroEntity !== "all" && activeMacroConfig && (
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-hand font-bold border ${
                    filterByActiveCategory
                      ? isDark
                        ? "bg-[#FFD13B]/20 text-[#FFD13B] border-[#FFD13B]"
                        : "bg-[#FFF4D9] text-[#1C1A17] border-[#1C1A17]"
                      : "opacity-60 border-current/30"
                  }`}
                >
                  <span>{activeMacroConfig.icon}</span>
                  <span>Solo tag per: {activeMacroConfig.label}</span>
                </div>
              )}

              <span
                className={`text-[11px] font-hand font-bold px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'bg-[#2A2724] text-[#F7F4EB] border-[#57534E]'
                    : 'bg-[#FFF4D9] text-[#1C1A17] border-[#1C1A17]'
                }`}
              >
                + Cumulativo
              </span>

              {selectedTags.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-typewriter font-bold bg-[#FFD13B] text-[#1C1A17] border border-[#1C1A17]">
                  {selectedTags.length} {selectedTags.length === 1 ? 'filtro attivo' : 'filtri attivi'}
                </span>
              )}
            </div>

            <p className="text-xs opacity-75 font-sans mt-0.5">
              {!isTaxonomyExpanded
                ? "Filtri compattati · Clicca qui per espandere la lista di tutti i tag."
                : selectedMacroEntity !== "all" && filterByActiveCategory && activeMacroConfig
                ? `Mostrando solo i tag pertinenti a "${activeMacroConfig.label}" per un'interfaccia compatta e ordinata (clicca qui per compattare).`
                : "Esplora e seleziona i tag per filtrare i profili archiviati nel taccuino (clicca qui per compattare)."}
            </p>
          </div>
        </div>

        {/* Action Controls & Active Badges */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Toggle Expand / Collapse Button */}
          <button
            type="button"
            onClick={toggleTaxonomyExpanded}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-hand font-bold border-2 transition cursor-pointer shadow-doodle-xs ${
              !isTaxonomyExpanded
                ? isDark
                  ? "bg-[#FFD13B] text-[#181716] border-[#FFD13B] hover:bg-[#FFC01E]"
                  : "bg-[#1C1A17] text-white border-[#1C1A17] hover:bg-black"
                : isDark
                ? "border-[#44403C] hover:bg-[#2F2C28] text-[#E7E5E4]"
                : "border-[#1C1A17]/30 hover:bg-[#F3EFE6] text-[#1C1A17]"
            }`}
            title={isTaxonomyExpanded ? "Compatta la lista dei filtri" : "Espandi la lista dei filtri"}
          >
            {isTaxonomyExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Compatta filtri</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Espandi filtri</span>
              </>
            )}
          </button>

          {isTaxonomyExpanded && (
            <>
              {/* Toggle All Predefined Options (Catalogo completo stili & tipologie) */}
          <button
            type="button"
            onClick={() => setShowAllPredefined((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-hand font-bold border transition cursor-pointer ${
              showAllPredefined
                ? isDark
                  ? "bg-[#FFD13B] text-[#181716] border-[#FFD13B]"
                  : "bg-[#FFD13B] text-[#1C1A17] border-[#1C1A17]"
                : isDark
                ? "border-[#44403C] hover:bg-[#2F2C28] text-[#E7E5E4]"
                : "border-[#1C1A17]/30 hover:bg-[#F3EFE6] text-[#1C1A17]"
            }`}
            title={
              showAllPredefined
                ? "Mostra solo le opzioni presenti nei profili"
                : `Mostra tutte le ${totalPredefinedCount} opzioni e stili predefiniti`
            }
          >
            {showAllPredefined ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Tutte le opzioni ({totalPredefinedCount})</span>
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                <span>Mostra tutte le opzioni ({totalPredefinedCount})</span>
              </>
            )}
          </button>

          {/* Toggle Category Filtering vs Show All Tags */}
          {selectedMacroEntity !== "all" && (
            <button
              type="button"
              onClick={() => setFilterByActiveCategory((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-hand font-bold border transition cursor-pointer ${
                filterByActiveCategory
                  ? isDark
                    ? "bg-[#2F2C28] text-[#FFD13B] border-[#FFD13B]"
                    : "bg-[#FFF4D9] text-[#1C1A17] border-[#1C1A17]"
                  : isDark
                  ? "border-[#44403C] hover:bg-[#2F2C28] text-[#E7E5E4]"
                  : "border-[#1C1A17]/30 hover:bg-[#F3EFE6] text-[#1C1A17]"
              }`}
              title={
                filterByActiveCategory
                  ? "Mostra tutti i tag del taccuino invece di quelli della categoria"
                  : "Riduci la vista ai soli tag pertinenti alla categoria selezionata"
              }
            >
              {filterByActiveCategory ? (
                <>
                  <Filter className="w-3.5 h-3.5 text-[#FFD13B]" />
                  <span>Tag Categoria Attiva</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Mostra tutti i tag</span>
                </>
              )}
            </button>
          )}

          {/* Espandi / Comprimi Tutte */}
          <div className="inline-flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={handleExpandAll}
              className={`px-2 py-1 rounded-lg text-xs font-hand font-bold border transition cursor-pointer ${
                isDark
                  ? 'border-[#44403C] hover:bg-[#2F2C28] text-[#E7E5E4]'
                  : 'border-[#1C1A17]/30 hover:bg-[#F3EFE6] text-[#1C1A17]'
              }`}
              title="Espandi tutte le macro-categorie"
            >
              Espandi tutte
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className={`px-2 py-1 rounded-lg text-xs font-hand font-bold border transition cursor-pointer ${
                isDark
                  ? 'border-[#44403C] hover:bg-[#2F2C28] text-[#E7E5E4]'
                  : 'border-[#1C1A17]/30 hover:bg-[#F3EFE6] text-[#1C1A17]'
              }`}
              title="Comprimi tutte le macro-categorie"
            >
              Comprimi tutte
            </button>
          </div>

          {onMatchModeChange && selectedTags.length > 1 && (
            <div
              className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${
                isDark ? 'border-[#44403C] bg-[#22201D]' : 'border-[#1C1A17]/30 bg-[#FFFDF7]'
              }`}
            >
              <span className="font-hand font-bold text-[11px] opacity-75 px-1">Logica:</span>
              <button
                type="button"
                onClick={() => onMatchModeChange('or')}
                className={`px-2 py-0.5 rounded-lg font-hand font-bold text-xs transition cursor-pointer ${
                  matchMode === 'or'
                    ? isDark
                      ? 'bg-[#F7F4EB] text-[#181716] font-bold'
                      : 'bg-[#1C1A17] text-[#FFFDF7] font-bold'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title="Mostra profili che hanno ALMENO UNO dei tag selezionati"
              >
                Almeno uno (OR)
              </button>
              <button
                type="button"
                onClick={() => onMatchModeChange('and')}
                className={`px-2 py-0.5 rounded-lg font-hand font-bold text-xs transition cursor-pointer ${
                  matchMode === 'and'
                    ? isDark
                      ? 'bg-[#F7F4EB] text-[#181716] font-bold'
                      : 'bg-[#1C1A17] text-[#FFFDF7] font-bold'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title="Mostra solo profili che possiedono TUTTI i tag selezionati contemporaneamente"
              >
                Tutti insieme (AND)
              </button>
            </div>
          )}

          {selectedTags.length > 0 && (
            <button
              onClick={onClearTags}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#E63946] bg-[#E63946]/10 text-[#E63946] font-hand font-bold text-xs shadow-doodle-sm btn-doodle cursor-pointer hover:bg-[#E63946]/20 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Azzera {selectedTags.length} tag</span>
            </button>
          )}

          {/* Quick Create Custom Tag Button */}
          <button
            onClick={() => setIsAddingTag(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-hand font-bold text-xs shadow-doodle-sm btn-doodle cursor-pointer transition ${
              isDark
                ? 'bg-[#FFD13B] text-[#181716] border-[#FFD13B] hover:bg-[#FFC01E]'
                : 'bg-[#FFD13B] text-[#1C1A17] border-[#1C1A17] hover:bg-[#FFC01E]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Aggiungi Tag</span>
          </button>
            </>
          )}

          {!isTaxonomyExpanded && selectedTags.length > 0 && (
            <button
              onClick={onClearTags}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#E63946] bg-[#E63946]/10 text-[#E63946] font-hand font-bold text-xs shadow-doodle-sm btn-doodle cursor-pointer hover:bg-[#E63946]/20 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Azzera {selectedTags.length} tag</span>
            </button>
          )}
        </div>
      </div>

      {/* If collapsed but tags are active, show active tags summary strip */}
      {!isTaxonomyExpanded && selectedTags.length > 0 && (
        <div className="pt-3 mt-3 border-t border-current/10 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-hand font-bold text-xs flex items-center gap-1 opacity-75">
              <Tag className="w-3.5 h-3.5 text-[#FF7844]" />
              <span>Filtri attivi:</span>
            </span>
            {selectedTags.map((t) => (
              <button
                key={t}
                onClick={() => onToggleTag(t)}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-hand font-bold border transition cursor-pointer ${
                  isDark
                    ? 'bg-[#FFD13B] text-[#181716] border-[#FFD13B]'
                    : 'bg-[#1C1A17] text-white border-[#1C1A17]'
                }`}
                title="Clicca per rimuovere questo filtro"
              >
                <span>{t}</span>
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>

          <button
            onClick={onClearTags}
            className="text-xs font-hand font-bold underline opacity-60 hover:opacity-100 hover:text-[#E63946] transition cursor-pointer"
          >
            Azzera tutti ({selectedTags.length})
          </button>
        </div>
      )}

      {isTaxonomyExpanded && (
        <>
          {/* Active Selected Tags Bar */}
      {selectedTags.length > 0 && (
        <div
          className={`py-2 px-3 my-3 rounded-xl border-2 flex items-center gap-2 flex-wrap ${
            isDark
              ? 'bg-[#22201D] border-[#FFD13B]/40'
              : 'bg-[#FFF9E6] border-[#FFD13B]'
          }`}
        >
          <span className="font-hand font-bold text-xs flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-[#FF7844]" />
            <span>Filtri attivi ({selectedTags.length}):</span>
          </span>
          {selectedTags.map((t) => (
            <span
              key={t}
              onClick={() => onToggleTag(t)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-hand font-bold border-2 shadow-xs cursor-pointer transition group ${
                isDark
                  ? 'bg-[#F7F4EB] text-[#181716] border-[#F7F4EB] hover:bg-[#E63946] hover:text-white hover:border-[#E63946]'
                  : 'bg-[#FFD13B] text-[#1C1A17] border-[#1C1A17] hover:bg-[#E63946] hover:text-white hover:border-[#E63946]'
              }`}
              title="Clicca per rimuovere questo filtro"
            >
              <span>{t}</span>
              <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
            </span>
          ))}
        </div>
      )}

      {/* Quick Suggested Tags Pill Cloud for active category (only show tags with results) */}
      {selectedMacroEntity !== "all" && visibleCategorySuggestedTags.length > 0 && (
        <div
          className={`p-2.5 my-2.5 rounded-xl border-2 transition ${
            isDark ? 'bg-[#22201D] border-[#44403C]' : 'bg-[#FFFBF0] border-[#1C1A17]/30'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-hand font-bold text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFBE0B]" />
              <span>Tag Consigliati per {activeMacroConfig?.label}:</span>
            </span>
            <span className="text-[10px] font-typewriter opacity-60">
              Clicca per attivare/disattivare rapidamente
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {visibleCategorySuggestedTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              const count =
                selectedMacroEntity === "all"
                  ? totalTagCounts[tag] || 0
                  : macroTagCounts[tag] || 0;

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggleTag(tag)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-hand font-bold transition cursor-pointer border shadow-xs ${
                    isSelected
                      ? isDark
                        ? "bg-[#F7F4EB] text-[#181716] border-[#F7F4EB] font-bold scale-102"
                        : "bg-[#1C1A17] text-[#FFFDF7] border-[#1C1A17] font-bold scale-102"
                      : isDark
                      ? "bg-[#181716] text-[#E7E5E4] border-[#44403C] hover:border-[#FFD13B] hover:text-[#FFD13B]"
                      : "bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17]/30 hover:border-[#1C1A17] hover:bg-[#FFF4D9]"
                  }`}
                >
                  {isSelected && (
                    <Check className={`w-3 h-3 ${isDark ? 'text-[#181716]' : 'text-white'}`} />
                  )}
                  <span>{tag}</span>
                  {count > 0 && (
                    <span className="font-typewriter text-[10px] px-1 py-0.2 rounded-md bg-black/10 font-bold">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* New Tag Inline Input with Top Recommendations and Autocomplete Dropdown */}
      {isAddingTag && (
        <div
          className={`my-3 p-3.5 rounded-xl border-2 border-dashed flex flex-col gap-2.5 animate-in fade-in-50 ${
            isDark
              ? 'border-[#FFD13B] bg-[#22201D] text-[#F7F4EB]'
              : 'border-[#FFBE0B] bg-[#FFF9E6] text-[#1C1A17]'
          }`}
        >
          {/* Quick pills of top tags in this category */}
          {topCategoryTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pb-1 border-b border-current/10">
              <span className="font-hand font-bold text-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#FFBE0B]" />
                <span>Consigliati per {activeMacroConfig?.label || 'questa categoria'}:</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {topCategoryTags.map(({ tag, count }) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        onToggleTag(tag);
                        setIsAddingTag(false);
                        setNewTagInput("");
                      }}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-hand font-bold border transition cursor-pointer ${
                        isSelected
                          ? isDark
                            ? "bg-[#FFD13B] text-[#181716] border-[#FFD13B]"
                            : "bg-[#1C1A17] text-white border-[#1C1A17]"
                          : isDark
                          ? "bg-[#181716] text-[#E7E5E4] border-[#44403C] hover:border-[#FFD13B]"
                          : "bg-white text-[#1C1A17] border-[#1C1A17]/30 hover:border-[#1C1A17]"
                      }`}
                    >
                      <span>{tag}</span>
                      {count > 0 && (
                        <span className="font-typewriter text-[9px] opacity-75">
                          ({count})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form and Autocomplete Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                autocompleteSuggestions.length > 0 &&
                autocompleteSuggestions[selectedSuggestionIndex]
              ) {
                handleSelectTagSuggestion(autocompleteSuggestions[selectedSuggestionIndex].name);
              } else {
                handleCreateNewTag(e);
              }
            }}
            className="relative flex items-center gap-2 flex-wrap"
          >
            <span className="font-hand font-bold text-xs flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#FF7844]" />
              <span>Cerca o crea tag:</span>
            </span>

            <div className="relative flex-1 min-w-[220px]">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => {
                  setNewTagInput(e.target.value);
                  setSelectedSuggestionIndex(0);
                }}
                onKeyDown={(e) => {
                  if (autocompleteSuggestions.length > 0) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setSelectedSuggestionIndex((prev) => (prev + 1) % autocompleteSuggestions.length);
                      return;
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setSelectedSuggestionIndex(
                        (prev) => (prev - 1 + autocompleteSuggestions.length) % autocompleteSuggestions.length
                      );
                      return;
                    }
                    if (e.key === "Enter" && autocompleteSuggestions[selectedSuggestionIndex]) {
                      e.preventDefault();
                      handleSelectTagSuggestion(autocompleteSuggestions[selectedSuggestionIndex].name);
                      return;
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setIsAddingTag(false);
                      return;
                    }
                  }
                }}
                placeholder="es. Minimalista, Razionalista, Maniglie, Cucina, Futurismo..."
                autoFocus
                className={`w-full px-3 py-1.5 text-xs font-hand rounded-lg border-2 focus:outline-none ${
                  isDark
                    ? 'bg-[#181716] text-[#F7F4EB] border-[#44403C] focus:border-[#FFD13B]'
                    : 'bg-white text-[#1C1A17] border-[#1C1A17] focus:border-[#1C1A17]'
                }`}
              />

              {/* Interactive Autocomplete Dropdown */}
              {newTagInput.trim().length > 0 && autocompleteSuggestions.length > 0 && (
                <div
                  className={`absolute top-full left-0 right-0 mt-1.5 z-40 rounded-xl border-2 shadow-doodle p-1.5 max-h-64 overflow-y-auto animate-in fade-in-50 ${
                    isDark
                      ? 'bg-[#201E1B] border-[#FFD13B] text-[#F7F4EB]'
                      : 'bg-[#FFFDF7] border-[#1C1A17] text-[#1C1A17]'
                  }`}
                >
                  <div className="px-2 py-1 text-[10px] font-typewriter uppercase tracking-wider opacity-60 flex justify-between border-b border-current/10 mb-1">
                    <span>Suggerimenti ({autocompleteSuggestions.length})</span>
                    <span>↑↓ per scegliere, Invio per applicare</span>
                  </div>

                  <div className="space-y-0.5">
                    {autocompleteSuggestions.map((item, idx) => {
                      const isHighlighted = idx === selectedSuggestionIndex;
                      return (
                        <div
                          key={item.name}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectTagSuggestion(item.name);
                          }}
                          onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                          className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 text-xs cursor-pointer transition ${
                            isHighlighted
                              ? isDark
                                ? 'bg-[#FFD13B] text-[#181716] font-bold'
                                : 'bg-[#FFD13B] text-[#1C1A17] font-bold'
                              : isDark
                              ? 'hover:bg-white/10'
                              : 'hover:bg-black/5'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Tag className="w-3 h-3 shrink-0 opacity-70" />
                            <span className="truncate">{item.name}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-md border font-hand ${
                                isHighlighted ? 'border-current opacity-90' : 'opacity-65 border-current/20'
                              }`}
                            >
                              {item.category}
                            </span>
                            {item.count > 0 ? (
                              <span
                                className={`font-typewriter text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                                  isHighlighted ? 'bg-black/20' : 'bg-black/10'
                                }`}
                              >
                                {item.count} {item.count === 1 ? 'profilo' : 'profili'}
                              </span>
                            ) : (
                              <span className="text-[9px] opacity-60 font-typewriter italic">
                                Predefinito
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!newTagInput.trim()}
              className="px-3.5 py-1.5 rounded-lg border-2 border-[#1C1A17] bg-[#38B000] text-white font-hand font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
            >
              Aggiungi e Filtra
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingTag(false);
                setNewTagInput("");
              }}
              className="px-2.5 py-1.5 rounded-lg font-hand text-xs opacity-70 hover:opacity-100 cursor-pointer"
            >
              Annulla
            </button>
          </form>
        </div>
      )}

      {/* Streamlined Categories Grid: Shows only relevant categories with >0 items, eliminating visual bloat */}
      {prunedCategories.length === 0 && !hasSubtypes && visibleDiscoveredExtraTags.length === 0 ? (
        <div
          className={`my-3 p-5 text-center rounded-xl border-2 border-dashed transition ${
            isDark
              ? 'border-[#44403C] bg-[#22201D]/60 text-[#D6D3D1]'
              : 'border-[#1C1A17]/30 bg-[#FAF7F0] text-[#6B635B]'
          }`}
        >
          <p className="font-hand font-bold text-sm mb-1 text-current">
            Nessun tag con risultati archiviati per {activeMacroConfig ? `"${activeMacroConfig.label}"` : "questa vista"}
          </p>
          <p className="text-xs font-sans opacity-75 max-w-md mx-auto">
            I tag con 0 profili sono stati nascosti per mantenere l'interfaccia veloce e ordinata. I tag compariranno automaticamente appena analizzi i profili o ne crei uno nuovo.
          </p>
          <button
            type="button"
            onClick={() => setIsAddingTag(true)}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-hand font-bold text-xs bg-[#FFD13B] text-[#1C1A17] border-2 border-[#1C1A17] shadow-xs cursor-pointer hover:bg-[#FFC01E]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Crea Primo Tag Personalizzato</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {/* Render relevant Taxonomy Categories with count > 0 */}
          {prunedCategories.map((category) => {
            const isExpanded = !!expandedCategories[category.id];
            const activeCountInCat = category.subCategories.filter((sc) =>
              selectedTags.includes(sc.name)
            ).length;

            return (
              <div
                key={category.id}
                className={`rounded-xl border-2 overflow-hidden shadow-xs transition ${cardBg}`}
              >
                {/* Category Header Bar */}
                <button
                  type="button"
                  onClick={() => toggleCategoryExpand(category.id)}
                  className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition cursor-pointer ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{category.icon}</span>
                    <span className="font-hand font-bold text-sm truncate">
                      {category.name}
                    </span>
                    {activeCountInCat > 0 && (
                      <span
                        className={`px-2 py-0.2 rounded-md text-[10px] font-typewriter font-bold ${
                          isDark
                            ? 'bg-[#FFD13B] text-[#181716]'
                            : 'bg-[#FFD13B] text-[#1C1A17] border border-[#1C1A17]'
                        }`}
                      >
                        {activeCountInCat} attivi
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 opacity-70">
                    <span className="text-[11px] font-typewriter opacity-60">
                      {category.subCategories.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Sub Categories Tags (Strictly count > 0 or selected) */}
                {isExpanded && (
                  <div className="p-3 pt-1 border-t border-current/10 flex flex-wrap gap-1.5">
                    {category.subCategories.map((sub) => {
                      const isSelected = selectedTags.includes(sub.name);
                      const count =
                        selectedMacroEntity === "all"
                          ? totalTagCounts[sub.name] || 0
                          : macroTagCounts[sub.name] || 0;

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => onToggleTag(sub.name)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-hand font-bold transition cursor-pointer border shadow-xs ${
                            isSelected
                              ? isDark
                               ? "bg-[#F7F4EB] text-[#181716] border-[#F7F4EB] font-bold scale-102"
                                : "bg-[#1C1A17] text-[#FFFDF7] border-[#1C1A17] font-bold scale-102"
                              : isDark
                              ? "bg-[#181716] text-[#E7E5E4] border-[#44403C] hover:border-[#F7F4EB] hover:text-[#F7F4EB] hover:bg-[#2A2724]"
                              : "bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17]/30 hover:border-[#1C1A17] hover:bg-[#FFF4D9]"
                          }`}
                        >
                          {isSelected && (
                            <Check
                              className={`w-3 h-3 ${isDark ? 'text-[#181716]' : 'text-white'}`}
                            />
                          )}
                          <span>{sub.name}</span>
                          {count > 0 && (
                            <span
                              className={`font-typewriter text-[10px] px-1 py-0.2 rounded-md font-bold ${
                                isSelected
                                  ? isDark
                                    ? "bg-black/20 text-[#181716]"
                                    : "bg-white/20 text-white"
                                  : isDark
                                  ? "bg-white/10 text-[#F7F4EB]"
                                  : "bg-black/10 text-[#1C1A17]"
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Subtypes Category: Dynamic for all macro entities (Studi, Aziende, Università, Fotografia, Illustrazione, Artisti, etc.) */}
          {hasSubtypes && (
            <div className={`rounded-xl border-2 overflow-hidden shadow-xs transition ${cardBg}`}>
              <button
                type="button"
                onClick={() => toggleCategoryExpand("tipi-entita")}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition cursor-pointer ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">🏛️</span>
                  <span className="font-hand font-bold text-sm truncate">
                    {selectedMacroEntity !== "all" && activeMacroConfig
                      ? `${activeMacroConfig.subtypeTitle || "Tipologie"} (${activeMacroConfig.label})`
                      : "Tipologie di Entità & Studi"}
                  </span>
                  {visibleSubtypeGroups.some((grp) =>
                    grp.items.some((t) => selectedTags.includes(t))
                  ) && (
                    <span
                      className={`px-2 py-0.2 rounded-md text-[10px] font-typewriter font-bold ${
                        isDark
                          ? 'bg-[#FFD13B] text-[#181716]'
                          : 'bg-[#FFD13B] text-[#1C1A17] border border-[#1C1A17]'
                      }`}
                    >
                      attivi
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 opacity-70">
                  <span className="text-[11px] font-typewriter opacity-60">
                    {visibleSubtypeGroups.reduce((acc, g) => acc + g.items.length, 0)}
                  </span>
                  {expandedCategories["tipi-entita"] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>

              {expandedCategories["tipi-entita"] && (
                <div className="p-3 pt-1 border-t border-current/10 space-y-3">
                  {visibleSubtypeGroups.map((grp, grpIdx) => (
                    <div key={grp.groupTitle || grpIdx} className="space-y-1.5">
                      <span
                        className={`font-hand font-bold text-[11px] block ${
                          isDark ? 'text-[#FFD13B]' : 'text-[#3A86FF]'
                        }`}
                      >
                        📌 {grp.groupTitle}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {grp.items.map((st) => {
                          const isSelected = selectedTags.includes(st);
                          const count =
                            selectedMacroEntity === "all"
                              ? totalTagCounts[st] || 0
                              : macroTagCounts[st] || 0;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => onToggleTag(st)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-hand font-bold transition cursor-pointer border ${
                                isSelected
                                  ? isDark
                                    ? "bg-[#F7F4EB] text-[#181716] border-[#F7F4EB] font-bold"
                                    : "bg-[#1C1A17] text-[#FFFDF7] border-[#1C1A17] font-bold"
                                  : isDark
                                  ? "bg-[#181716] text-[#E7E5E4] border-[#44403C] hover:border-[#F7F4EB] hover:text-[#F7F4EB]"
                                  : "bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17]/30 hover:border-[#1C1A17] hover:bg-[#EBF3FF]"
                              }`}
                            >
                              {isSelected && (
                                <Check
                                  className={`w-3 h-3 ${isDark ? 'text-[#181716]' : 'text-white'}`}
                                />
                              )}
                              <span>{st}</span>
                              {count > 0 && (
                                <span className="font-typewriter text-[9px] px-1 rounded-sm bg-black/10 font-bold">
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Custom / Discovered Extra Tags with count > 0 */}
          {visibleDiscoveredExtraTags.length > 0 && (
            <div className={`rounded-xl border-2 overflow-hidden shadow-xs transition ${cardBg}`}>
              <button
                type="button"
                onClick={() => toggleCategoryExpand("custom-tags")}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition cursor-pointer ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">🏷️</span>
                  <span className="font-hand font-bold text-sm truncate">
                    Tag Extra & Personalizzati
                  </span>
                  {visibleDiscoveredExtraTags.some((t) => selectedTags.includes(t)) && (
                    <span
                      className={`px-2 py-0.2 rounded-md text-[10px] font-typewriter font-bold ${
                        isDark
                          ? 'bg-[#FFD13B] text-[#181716]'
                          : 'bg-[#FFD13B] text-[#1C1A17] border border-[#1C1A17]'
                      }`}
                    >
                      attivi
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 opacity-70">
                  <span className="text-[11px] font-typewriter opacity-60">
                    {visibleDiscoveredExtraTags.length}
                  </span>
                  {expandedCategories["custom-tags"] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>

              {expandedCategories["custom-tags"] && (
                <div className="p-3 pt-1 border-t border-current/10 flex flex-wrap gap-1.5">
                  {visibleDiscoveredExtraTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    const count =
                      selectedMacroEntity === "all"
                        ? totalTagCounts[tag] || 0
                        : macroTagCounts[tag] || 0;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => onToggleTag(tag)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-hand font-bold transition cursor-pointer border shadow-xs ${
                          isSelected
                            ? isDark
                              ? "bg-[#F7F4EB] text-[#181716] border-[#F7F4EB] font-bold"
                              : "bg-[#1C1A17] text-[#FFFDF7] border-[#1C1A17] font-bold"
                            : isDark
                            ? "bg-[#181716] text-[#E7E5E4] border-[#44403C] hover:border-[#F7F4EB] hover:text-[#F7F4EB]"
                            : "bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17]/30 hover:border-[#1C1A17] hover:bg-[#FFF4D9]"
                        }`}
                      >
                        {isSelected && (
                          <Check
                            className={`w-3 h-3 ${isDark ? 'text-[#181716]' : 'text-white'}`}
                          />
                        )}
                        <span>{tag}</span>
                        {count > 0 && (
                          <span className="font-typewriter text-[10px] px-1 rounded-md bg-black/10 font-bold">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
};
