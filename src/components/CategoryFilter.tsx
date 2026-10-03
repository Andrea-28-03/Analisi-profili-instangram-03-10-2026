import React from "react";
import {
  Search,
  Filter,
  Table as TableIcon,
  LayoutGrid,
  MapPin,
  PieChart,
  Star,
  Sparkles,
  X,
  Network,
  RotateCcw,
} from "lucide-react";
import { ViewMode, FilterStatus } from "../types";

interface CategoryFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: { name: string; count: number }[];
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  countries: { name: string; count: number }[];
  statusFilter: FilterStatus;
  onStatusFilterChange: (status: FilterStatus) => void;
  hidePrivateProfiles: boolean;
  onHidePrivateProfilesChange: (hide: boolean) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalFilteredCount: number;
  totalCount: number;
  theme?: 'light' | 'dark';
}

// Crayon colors for categories
const CATEGORY_COLORS: Record<string, { bg: string; activeBg: string; text: string; border: string }> = {
  "Branding & Identity": { bg: "bg-[#FF5E8E]/15", activeBg: "bg-[#FF5E8E]", text: "text-[#C9184A]", border: "border-[#FF5E8E]" },
  "Design Grafico & Editoriale": { bg: "bg-[#FB8500]/15", activeBg: "bg-[#FB8500]", text: "text-[#C83E00]", border: "border-[#FB8500]" },
  "Architettura": { bg: "bg-[#38B000]/15", activeBg: "bg-[#38B000]", text: "text-[#1E6B00]", border: "border-[#38B000]" },
  "Design del Prodotto & Industriale": { bg: "bg-[#FFBE0B]/25", activeBg: "bg-[#FFBE0B]", text: "text-[#B7791F]", border: "border-[#FB8500]" },
  "Type Design & Caratteri": { bg: "bg-[#3A86FF]/15", activeBg: "bg-[#3A86FF]", text: "text-[#004BBE]", border: "border-[#3A86FF]" },
  "Motion & 3D Design": { bg: "bg-[#8338EC]/15", activeBg: "bg-[#8338EC]", text: "text-[#5A189A]", border: "border-[#8338EC]" },
  "Interior Design": { bg: "bg-[#06D6A0]/20", activeBg: "bg-[#06D6A0]", text: "text-[#007F5F]", border: "border-[#06D6A0]" },
  "Persona Privata / Amico": { bg: "bg-[#94A3B8]/20", activeBg: "bg-[#64748B]", text: "text-[#475569]", border: "border-[#64748B]" },
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedCountry,
  onCountryChange,
  countries,
  statusFilter,
  onStatusFilterChange,
  hidePrivateProfiles,
  onHidePrivateProfilesChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
  totalCount,
  theme = 'light',
}) => {
  const containerBg = theme === 'dark' ? 'bg-[#181716]/95 border-[#38332E]' : 'bg-[#F7F4EB]/95 border-[#1C1A17]';
  const inputBg = theme === 'dark' ? 'bg-[#22201D] text-[#F7F4EB] border-[#38332E] placeholder-[#8C827A]' : 'bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17] placeholder-[#8C827A]';
  const groupBg = theme === 'dark' ? 'bg-[#22201D] border-[#38332E]' : 'bg-[#FFFDF7] border-[#1C1A17]';

  return (
    <div className={`space-y-3.5 sticky top-0 z-30 ${containerBg} backdrop-blur-xs py-3.5 -mx-4 px-4 sm:mx-0 sm:px-0 border-b-2 sm:border-b-0 mb-2 transition-colors`}>
      {/* Top row: Search input, Country filter, Status Filter, View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Bar - Stylized as sketchbook pen input */}
        <div className="relative flex-1 w-full max-w-none lg:max-w-md">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cerca studio, @username, città, stile a pastelli..."
            className={`w-full pl-10 pr-9 py-2 text-xs border-2 rounded-xl shadow-doodle-sm focus:outline-none transition ${inputBg}`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 opacity-70 hover:opacity-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters & View Mode Group */}
        <div className="flex items-center overflow-x-auto pb-1 lg:pb-0 no-scrollbar gap-2 text-xs w-full lg:w-auto">
          {/* Country Selector */}
          <div className="relative shrink-0">
            <select
              id="country-filter-select"
              value={selectedCountry}
              onChange={(e) => onCountryChange(e.target.value)}
              className={`text-xs font-typewriter border-2 py-2 pl-3 pr-8 rounded-xl shadow-doodle-sm focus:outline-none cursor-pointer appearance-none ${inputBg}`}
            >
              <option value="all">📍 Sede: Tutte ({countries.reduce((acc, c) => acc + c.count, 0)})</option>
              {countries.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold opacity-80">
              ▼
            </div>
          </div>

          {/* Status Buttons in a tactile ink container */}
          <div className={`inline-flex rounded-xl p-1 border-2 shadow-doodle-sm shrink-0 gap-1 ${groupBg}`}>
            <button
              id="filter-all-btn"
              onClick={() => onStatusFilterChange("all")}
              className={`px-3 py-1 rounded-lg text-xs font-hand font-bold transition cursor-pointer ${
                statusFilter === "all"
                  ? theme === 'dark' ? 'bg-[#F7F4EB] text-[#181716]' : 'bg-[#1C1A17] text-[#FFFDF7]'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              Tutti
            </button>
            <button
              id="filter-analyzed-btn"
              onClick={() => onStatusFilterChange("analyzed")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-hand font-bold transition cursor-pointer ${
                statusFilter === "analyzed"
                  ? "bg-[#38B000] text-white"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#FFD13B]" />
              <span>Analizzati</span>
            </button>
            <button
              id="filter-pending-btn"
              onClick={() => onStatusFilterChange("pending")}
              className={`px-2.5 py-1 rounded-lg text-xs font-hand font-bold transition cursor-pointer ${
                statusFilter === "pending"
                  ? "bg-[#FFBE0B] text-[#1C1A17]"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              In attesa
            </button>
            <button
              id="filter-favorites-btn"
              onClick={() => onStatusFilterChange("favorites")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-hand font-bold transition cursor-pointer ${
                statusFilter === "favorites"
                  ? "bg-[#FF5E8E] text-white"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Preferiti</span>
            </button>
            <button
              id="filter-hide-private-btn"
              onClick={() => onHidePrivateProfilesChange(!hidePrivateProfiles)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-hand font-bold transition cursor-pointer ${
                hidePrivateProfiles
                  ? "bg-[#E63946] text-white"
                  : "opacity-75 hover:opacity-100"
              }`}
              title="Nascondi i profili contrassegnati come amici o privati"
            >
              <X className="w-3 h-3" />
              <span>No Privati</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className={`inline-flex rounded-xl p-1 border-2 shadow-doodle-sm shrink-0 gap-1 ${groupBg}`}>
            <button
              id="view-table-btn"
              onClick={() => onViewModeChange("table")}
              title="Vista Tabella / Registro"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#FFD13B] text-[#1C1A17] shadow-sm font-bold"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              id="view-cards-btn"
              onClick={() => onViewModeChange("cards")}
              title="Vista Schede / Cartoncini"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-[#FFD13B] text-[#1C1A17] shadow-sm font-bold"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-map-btn"
              onClick={() => onViewModeChange("map")}
              title="Vista Mappa Geografica"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "map"
                  ? "bg-[#FFD13B] text-[#1C1A17] shadow-sm font-bold"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <MapPin className="w-4 h-4" />
            </button>
            <button
              id="view-graph-btn"
              onClick={() => onViewModeChange("graph")}
              title="Vista Rete Visiva"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "graph"
                  ? "bg-[#FFD13B] text-[#1C1A17] shadow-sm font-bold"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <Network className="w-4 h-4" />
            </button>
            <button
              id="view-insights-btn"
              onClick={() => onViewModeChange("insights")}
              title="Vista Statistiche Taccuino"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "insights"
                  ? "bg-[#FFD13B] text-[#1C1A17] shadow-sm font-bold"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <PieChart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Crayon Category Swatches Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar text-xs">
        <button
          id="cat-pill-all"
          onClick={() => onCategoryChange("all")}
          className={`shrink-0 px-3.5 py-1.5 rounded-xl font-hand font-bold text-xs transition cursor-pointer border-2 shadow-doodle-sm btn-doodle ${
            selectedCategory === "all"
              ? theme === 'dark' ? 'bg-[#F7F4EB] text-[#181716] border-[#F7F4EB]' : 'bg-[#1C1A17] text-[#FFFDF7] border-[#1C1A17]'
              : theme === 'dark' ? 'bg-[#22201D] text-[#F7F4EB] border-[#38332E] hover:bg-[#2C2A26]' : 'bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17] hover:bg-[#FFF9E6]'
          }`}
        >
          <span>Tutte le discipline</span>
          <span className="font-typewriter text-[11px] opacity-80">({totalCount})</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name;

          return (
            <button
              key={cat.name}
              id={`cat-pill-${cat.name.replace(/\s+/g, "-").toLowerCase()}`}
              onClick={() => onCategoryChange(cat.name)}
              className={`shrink-0 px-3 py-1.5 rounded-xl font-hand font-bold text-xs transition cursor-pointer border-2 border-[#1C1A17] flex items-center gap-1.5 shadow-doodle-sm btn-doodle ${
                isSelected
                  ? "bg-[#FFD13B] text-[#1C1A17] -rotate-1 scale-105"
                  : theme === 'dark' ? 'bg-[#22201D] text-[#F7F4EB] border-[#38332E] hover:bg-[#2C2A26]' : 'bg-[#FFFDF7] text-[#1C1A17] hover:bg-white'
              }`}
            >
              <span>{cat.name}</span>
              <span className="font-typewriter text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 font-bold">
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter summary if filtered */}
      {(selectedCategory !== "all" || selectedCountry !== "all" || searchQuery || statusFilter !== "all" || hidePrivateProfiles) && (
        <div className="flex items-center justify-between text-xs px-1 pt-1 border-t opacity-90">
          <div className="flex items-center gap-2 font-hand text-sm">
            <span className="w-2 h-2 rounded-full bg-[#FF7844]" />
            <span>
              Mostrando <strong className="font-typewriter text-xs">{totalFilteredCount}</strong> su {totalCount} profili nel taccuino
            </span>
          </div>
          <button
            onClick={() => {
              onCategoryChange("all");
              onCountryChange("all");
              onSearchChange("");
              onStatusFilterChange("all");
              onHidePrivateProfilesChange(false);
            }}
            className="font-hand font-bold text-sm text-[#E63946] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Azzera filtri</span>
          </button>
        </div>
      )}
    </div>
  );
};
