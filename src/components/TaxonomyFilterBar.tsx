import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  RotateCcw,
  Sparkles,
  Layers,
  Check,
  Tag,
  SlidersHorizontal,
  FolderOpen,
  Folder,
} from "lucide-react";
import {
  DEFAULT_TAXONOMY_TREE,
  STUDIO_SUBTYPES,
  AZIENDA_SUBTYPES,
  TaxonomyCategory,
} from "../utils/entityClassifier";
import { InstagramProfile } from "../types";

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
  isOpen = true,
  onToggleOpen,
}) => {
  // All categories open by default for immediate exploration
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "interni-spazi": true,
    "prodotto-arredo": true,
    "tipi-entita": true,
    "grafica-visivo": true,
    "arti-illustrazione": true,
    "musica-cultura": true,
    "custom-tags": true,
  });

  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  const isDark = theme === 'dark';

  // Calculate tag counts across all profiles
  const tagCounts = useMemo(() => {
    const map: Record<string, number> = {};
    profiles.forEach((p) => {
      const ai = p.aiAnalysis;
      if (!ai) return;

      if (ai.subCategories) {
        ai.subCategories.forEach((sc) => {
          map[sc] = (map[sc] || 0) + 1;
        });
      }

      if (ai.designTags) {
        ai.designTags.forEach((dt) => {
          map[dt] = (map[dt] || 0) + 1;
        });
      }

      if (ai.subType) {
        map[ai.subType] = (map[ai.subType] || 0) + 1;
      }
    });
    return map;
  }, [profiles]);

  // Dynamic list of user-created or unique extra tags from profiles that are not in default trees
  const discoveredExtraTags = useMemo(() => {
    const defaultTagSet = new Set<string>();
    DEFAULT_TAXONOMY_TREE.forEach((cat) => {
      cat.subCategories.forEach((sub) => defaultTagSet.add(sub.name));
    });
    STUDIO_SUBTYPES.forEach((st) => defaultTagSet.add(st));
    AZIENDA_SUBTYPES.forEach((at) => defaultTagSet.add(at));

    const extras = new Set<string>(customCategories);
    profiles.forEach((p) => {
      const ai = p.aiAnalysis;
      if (!ai) return;
      ai.subCategories?.forEach((t) => {
        if (!defaultTagSet.has(t)) extras.add(t);
      });
      ai.designTags?.forEach((t) => {
        if (!defaultTagSet.has(t)) extras.add(t);
      });
    });

    return Array.from(extras).filter(Boolean);
  }, [profiles, customCategories]);

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
    });
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

  // High-contrast B&W / Paper styling
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
      {/* Top Header of Taxonomy Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b-2 border-current/15">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-xs border-2 ${
              isDark
                ? 'bg-[#FFD13B] text-[#181716] border-[#FFD13B]'
                : 'bg-[#FFD13B] text-[#1C1A17] border-[#1C1A17]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-sans font-bold text-base tracking-tight ${headerText}`}>
                Filtro Categorie & Sotto-categorie
              </h3>
              <span
                className={`text-[11px] font-hand font-bold px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'bg-[#2A2724] text-[#F7F4EB] border-[#57534E]'
                    : 'bg-[#FFF4D9] text-[#1C1A17] border-[#1C1A17]'
                }`}
              >
                + Selezione cumulativa (si sommano)
              </span>
            </div>
            <p className="text-xs opacity-75 font-sans mt-0.5">
              Esplora macro e sotto-categorie: interni, casa, cucina, maniglie, arredo, tipi di studio/azienda, musica e altro.
            </p>
          </div>
        </div>

        {/* Action Controls & Active Badges */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
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
            <span>+ Aggiungi Categoria / Tag</span>
          </button>
        </div>
      </div>

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

      {/* New Tag Inline Input */}
      {isAddingTag && (
        <form
          onSubmit={handleCreateNewTag}
          className={`my-3 p-3.5 rounded-xl border-2 border-dashed flex items-center gap-2 flex-wrap animate-in fade-in-50 ${
            isDark
              ? 'border-[#FFD13B] bg-[#22201D] text-[#F7F4EB]'
              : 'border-[#FFBE0B] bg-[#FFF9E6] text-[#1C1A17]'
          }`}
        >
          <span className="font-hand font-bold text-xs flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FFBE0B]" />
            <span>Nome nuova macro/sotto-categoria:</span>
          </span>
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            placeholder="es. Cucina/Maniglie, Arredo/Tavoli, Musica, Allestimenti..."
            autoFocus
            className={`flex-1 min-w-[200px] px-3 py-1.5 text-xs font-hand rounded-lg border-2 focus:outline-none ${
              isDark
                ? 'bg-[#181716] text-[#F7F4EB] border-[#44403C] focus:border-[#FFD13B]'
                : 'bg-white text-[#1C1A17] border-[#1C1A17] focus:border-[#1C1A17]'
            }`}
          />
          <button
            type="submit"
            disabled={!newTagInput.trim()}
            className="px-3.5 py-1.5 rounded-lg border-2 border-[#1C1A17] bg-[#38B000] text-white font-hand font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
          >
            Aggiungi e Filtra
          </button>
          <button
            type="button"
            onClick={() => setIsAddingTag(false)}
            className="px-2.5 py-1.5 rounded-lg font-hand text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            Annulla
          </button>
        </form>
      )}

      {/* Mega Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-3">
        {/* Render Default Taxonomy Tree */}
        {DEFAULT_TAXONOMY_TREE.map((category) => {
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

              {/* Sub Categories Tags */}
              {isExpanded && (
                <div className="p-3 pt-1 border-t border-current/10 flex flex-wrap gap-1.5">
                  {category.subCategories.map((sub) => {
                    const isSelected = selectedTags.includes(sub.name);
                    const count = tagCounts[sub.name] || 0;

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

        {/* Tipi di Studio & Tipi di Azienda Category */}
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
                Tipi di Studio & Azienda
              </span>
              {[...STUDIO_SUBTYPES, ...AZIENDA_SUBTYPES].some((t) => selectedTags.includes(t)) && (
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
                {STUDIO_SUBTYPES.length + AZIENDA_SUBTYPES.length}
              </span>
              {expandedCategories["tipi-entita"] ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </button>

          {expandedCategories["tipi-entita"] && (
            <div className="p-3 pt-1 border-t border-current/10 space-y-2.5">
              <div>
                <span
                  className={`font-hand font-bold text-[11px] block mb-1 ${
                    isDark ? 'text-[#FFD13B]' : 'text-[#3A86FF]'
                  }`}
                >
                  📐 Tipi di Studio:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {STUDIO_SUBTYPES.map((st) => {
                    const isSelected = selectedTags.includes(st);
                    const count = tagCounts[st] || 0;
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

              <div>
                <span
                  className={`font-hand font-bold text-[11px] block mb-1 ${
                    isDark ? 'text-[#FB8500]' : 'text-[#FB8500]'
                  }`}
                >
                  🏢 Tipi di Azienda:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {AZIENDA_SUBTYPES.map((at) => {
                    const isSelected = selectedTags.includes(at);
                    const count = tagCounts[at] || 0;
                    return (
                      <button
                        key={at}
                        type="button"
                        onClick={() => onToggleTag(at)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-hand font-bold transition cursor-pointer border ${
                          isSelected
                            ? isDark
                              ? "bg-[#F7F4EB] text-[#181716] border-[#F7F4EB] font-bold"
                              : "bg-[#1C1A17] text-[#FFFDF7] border-[#1C1A17] font-bold"
                            : isDark
                            ? "bg-[#181716] text-[#E7E5E4] border-[#44403C] hover:border-[#F7F4EB] hover:text-[#F7F4EB]"
                            : "bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17]/30 hover:border-[#1C1A17] hover:bg-[#FFF4E8]"
                        }`}
                      >
                        {isSelected && (
                          <Check
                            className={`w-3 h-3 ${isDark ? 'text-[#181716]' : 'text-white'}`}
                          />
                        )}
                        <span>{at}</span>
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
            </div>
          )}
        </div>

        {/* Custom / Discovered Tags from Profiles */}
        {discoveredExtraTags.length > 0 && (
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
                  Tag & Categorie Extra
                </span>
                {discoveredExtraTags.some((t) => selectedTags.includes(t)) && (
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
                  {discoveredExtraTags.length}
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
                {discoveredExtraTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  const count = tagCounts[tag] || 0;
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
    </div>
  );
};
