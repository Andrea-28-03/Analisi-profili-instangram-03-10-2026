import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Table as TableIcon,
  LayoutGrid,
  MapPin,
  PieChart,
  Star,
  Sparkles,
  X,
  Network,
  RotateCcw,
  Building,
  UserX,
  Compass,
  Briefcase,
  Layers,
  GraduationCap,
  Camera,
  Palette,
  Brush,
  Video,
  Users,
  ChevronDown,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import {
  ViewMode,
  FilterStatus,
  FilterMacroEntity,
  GeoFilterType,
  FilterWorkSpaceMode,
  WorkSpaceMode,
} from "../types";
import { WORK_MODE_CONFIG } from "../utils/entityClassifier";

interface CategoryFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedMacroEntity: FilterMacroEntity;
  onMacroEntityChange: (macro: FilterMacroEntity) => void;
  macroCounts: Record<FilterMacroEntity, number>;
  noPrivate: boolean;
  onToggleNoPrivate: () => void;
  statusFilter: FilterStatus;
  onStatusFilterChange: (status: FilterStatus) => void;
  geoMode: GeoFilterType;
  onGeoModeChange: (mode: GeoFilterType) => void;
  selectedGeo: string;
  onGeoChange: (geo: string) => void;
  availableCities: { name: string; count: number }[];
  availableRegions: { name: string; count: number }[];
  selectedWorkMode: FilterWorkSpaceMode;
  onWorkModeChange: (mode: FilterWorkSpaceMode) => void;
  workModeCounts: Record<WorkSpaceMode, number>;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalFilteredCount: number;
  totalCount: number;
  theme?: 'light' | 'dark';
  onResetAllFilters: () => void;
  isAnyFilterActive: boolean;
  selectedTaxonomyCount?: number;
  isTaxonomyOpen?: boolean;
  onToggleTaxonomy?: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedMacroEntity,
  onMacroEntityChange,
  macroCounts,
  noPrivate,
  onToggleNoPrivate,
  statusFilter,
  onStatusFilterChange,
  geoMode,
  onGeoModeChange,
  selectedGeo,
  onGeoChange,
  availableCities,
  availableRegions,
  selectedWorkMode,
  onWorkModeChange,
  workModeCounts,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
  totalCount,
  theme = 'light',
  onResetAllFilters,
  isAnyFilterActive,
  selectedTaxonomyCount = 0,
  isTaxonomyOpen = true,
  onToggleTaxonomy,
}) => {
  // Dropdown states
  const [isGeoOpen, setIsGeoOpen] = useState(false);
  const [geoSearchQuery, setGeoSearchQuery] = useState("");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isWorkModeOpen, setIsWorkModeOpen] = useState(false);

  const geoDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const workModeDropdownRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (geoDropdownRef.current && !geoDropdownRef.current.contains(target)) {
        setIsGeoOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(target)) {
        setIsStatusOpen(false);
      }
      if (workModeDropdownRef.current && !workModeDropdownRef.current.contains(target)) {
        setIsWorkModeOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsGeoOpen(false);
        setIsStatusOpen(false);
        setIsWorkModeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isDark = theme === 'dark';

  // Contrast-optimized palettes (pure B&W / charcoal paper)
  const containerBg = isDark
    ? 'bg-[#181716]/95 border-[#44403C]'
    : 'bg-[#F7F4EB]/95 border-[#1C1A17]';
  const inputBg = isDark
    ? 'bg-[#22201D] text-[#F7F4EB] border-[#44403C] placeholder-[#A8A29E] focus:border-[#F7F4EB]'
    : 'bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17] placeholder-[#8C827A] focus:border-[#1C1A17]';
  const groupBg = isDark
    ? 'bg-[#22201D] border-[#44403C]'
    : 'bg-[#FFFDF7] border-[#1C1A17]';
  const popoverBg = isDark
    ? 'bg-[#22201D] text-[#F7F4EB] border-[#44403C] shadow-2xl'
    : 'bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17] shadow-xl';
  const itemHover = isDark ? 'hover:bg-[#2F2C28]' : 'hover:bg-[#F4EFE6]';

  const MACRO_TABS: { id: FilterMacroEntity; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "Tutti", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "studio", label: "Studi", icon: <span>📐</span> },
    { id: "azienda", label: "Aziende", icon: <span>🏢</span> },
    { id: "universita", label: "Università", icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: "fotografia", label: "Fotografia", icon: <Camera className="w-3.5 h-3.5" /> },
    { id: "illustrazione", label: "Illustrazione", icon: <Palette className="w-3.5 h-3.5" /> },
    { id: "artisti", label: "Artisti", icon: <Brush className="w-3.5 h-3.5" /> },
    { id: "creator", label: "Content Creator", icon: <Video className="w-3.5 h-3.5" /> },
    { id: "amici", label: "Amici Designer", icon: <Users className="w-3.5 h-3.5" /> },
  ];

  const currentGeoList = geoMode === "city" ? availableCities : availableRegions;
  const filteredGeoList = currentGeoList.filter((g) =>
    g.name.toLowerCase().includes(geoSearchQuery.toLowerCase().trim())
  );

  const getStatusLabel = (status: FilterStatus) => {
    switch (status) {
      case "analyzed":
        return "✨ Analizzati";
      case "pending":
        return "⏳ In attesa";
      case "favorites":
        return "★ Preferiti";
      default:
        return `Stato: Tutti (${totalCount})`;
    }
  };

  const getWorkModeLabel = (mode: FilterWorkSpaceMode) => {
    if (mode === "all") return "Spazi: Tutti";
    const cfg = WORK_MODE_CONFIG[mode as WorkSpaceMode];
    return cfg ? `${cfg.icon} ${cfg.label}` : "Spazi: Tutti";
  };

  return (
    <div
      className={`space-y-3 sticky top-0 z-30 ${containerBg} backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b-2 sm:border-b-0 mb-2 transition-colors`}
    >
      {/* Top Filter Bar Header Controls */}
      <div className="flex flex-col gap-2.5">
        {/* Row 1: Search Name + Dropdowns + Geo + Work Mode + View Switcher */}
        <div className="flex flex-wrap items-center gap-2 justify-between">
          {/* 1. Ricerca per nome / username */}
          <div className="relative flex-1 min-w-[210px] max-w-md">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#A8A29E]' : 'text-[#8C827A]'}`} />
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cerca per nome, studio, brand, @username, note..."
              className={`w-full pl-9 pr-8 py-2 text-xs font-hand font-bold border-2 rounded-xl shadow-doodle-sm focus:outline-none transition ${inputBg}`}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 opacity-70 hover:opacity-100 cursor-pointer"
                title="Cancella ricerca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters Group: Status Dropdown, Geo selector, Work Mode, View Modes */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 3. Accanto una tendina con tutti, analizzati, in attesa, preferiti (CUSTOM POPOVER) */}
            <div className="relative shrink-0" ref={statusDropdownRef}>
              <button
                type="button"
                id="status-filter-select"
                onClick={() => {
                  setIsStatusOpen(!isStatusOpen);
                  setIsGeoOpen(false);
                  setIsWorkModeOpen(false);
                }}
                className={`text-xs font-hand font-bold border-2 py-2 pl-3 pr-2.5 rounded-xl shadow-doodle-sm focus:outline-none cursor-pointer flex items-center gap-2 transition ${inputBg} ${
                  statusFilter !== 'all' ? (isDark ? 'border-[#FFD13B] text-[#FFD13B]' : 'border-[#1C1A17] bg-[#FFF4D9]') : ''
                }`}
                title="Filtra per stato di analisi o preferiti"
              >
                <span>{getStatusLabel(statusFilter)}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatusOpen && (
                <div
                  className={`absolute right-0 top-full mt-1.5 w-52 rounded-xl border-2 py-1.5 z-50 ${popoverBg} animate-in fade-in-50 zoom-in-95`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onStatusFilterChange("all");
                      setIsStatusOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-hand font-bold flex items-center justify-between cursor-pointer ${itemHover} ${
                      statusFilter === "all" ? (isDark ? "bg-[#38332E] text-white" : "bg-[#F3EFE6] font-bold") : ""
                    }`}
                  >
                    <span>Stato: Tutti ({totalCount})</span>
                    {statusFilter === "all" && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onStatusFilterChange("analyzed");
                      setIsStatusOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-hand font-bold flex items-center justify-between cursor-pointer ${itemHover} ${
                      statusFilter === "analyzed" ? (isDark ? "bg-[#38332E] text-white" : "bg-[#F3EFE6] font-bold") : ""
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>✨</span>
                      <span>Analizzati</span>
                    </span>
                    {statusFilter === "analyzed" && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onStatusFilterChange("pending");
                      setIsStatusOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-hand font-bold flex items-center justify-between cursor-pointer ${itemHover} ${
                      statusFilter === "pending" ? (isDark ? "bg-[#38332E] text-white" : "bg-[#F3EFE6] font-bold") : ""
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>⏳</span>
                      <span>In attesa</span>
                    </span>
                    {statusFilter === "pending" && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onStatusFilterChange("favorites");
                      setIsStatusOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-hand font-bold flex items-center justify-between cursor-pointer ${itemHover} ${
                      statusFilter === "favorites" ? (isDark ? "bg-[#38332E] text-white" : "bg-[#F3EFE6] font-bold") : ""
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-[#FFD13B] text-[#FFD13B]" />
                      <span>Preferiti</span>
                    </span>
                    {statusFilter === "favorites" && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* 4. Accanto il luogo: Sezione pulita con toggle [Città | Regione] + Custom Popover list (NO OS BUG) */}
            <div className="relative shrink-0 flex items-center gap-1.5" ref={geoDropdownRef}>
              {/* Clean segment toggle Città vs Regione */}
              <div
                className={`inline-flex items-center p-0.5 rounded-xl border-2 shadow-doodle-sm shrink-0 ${groupBg}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onGeoModeChange("city");
                    onGeoChange("all");
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-hand font-bold transition cursor-pointer ${
                    geoMode === "city"
                      ? isDark
                        ? "bg-[#F7F4EB] text-[#181716] shadow-xs"
                        : "bg-[#1C1A17] text-[#FFFDF7] shadow-xs"
                      : "opacity-75 hover:opacity-100"
                  }`}
                  title="Imposta filtro su Città"
                >
                  Città
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onGeoModeChange("region");
                    onGeoChange("all");
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-hand font-bold transition cursor-pointer ${
                    geoMode === "region"
                      ? isDark
                        ? "bg-[#F7F4EB] text-[#181716] shadow-xs"
                        : "bg-[#1C1A17] text-[#FFFDF7] shadow-xs"
                      : "opacity-75 hover:opacity-100"
                  }`}
                  title="Imposta filtro su Regione"
                >
                  Regione
                </button>
              </div>

              {/* Geo Dropdown Trigger Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsGeoOpen(!isGeoOpen);
                    setIsStatusOpen(false);
                    setIsWorkModeOpen(false);
                    setGeoSearchQuery("");
                  }}
                  className={`text-xs font-hand font-bold border-2 py-2 pl-3 pr-2.5 rounded-xl shadow-doodle-sm focus:outline-none cursor-pointer flex items-center gap-1.5 transition ${inputBg} ${
                    selectedGeo !== 'all' ? (isDark ? 'border-[#FFD13B] text-[#FFD13B]' : 'border-[#1C1A17] bg-[#FFF4D9]') : ''
                  }`}
                  title={`Seleziona ${geoMode === 'city' ? 'città' : 'regione'}`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span className="max-w-[130px] truncate">
                    {selectedGeo === "all"
                      ? geoMode === "city"
                        ? "Tutte le città"
                        : "Tutte le regioni"
                      : selectedGeo}
                  </span>
                  <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${isGeoOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Clear Selected Geo Quick Icon */}
                {selectedGeo !== "all" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onGeoChange("all");
                    }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#E63946] text-white flex items-center justify-center text-[10px] cursor-pointer shadow-xs hover:scale-110 transition"
                    title="Azzera filtro geografico"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}

                {/* Geo Floating Custom Menu */}
                {isGeoOpen && (
                  <div
                    className={`absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-64 rounded-xl border-2 p-2 z-50 ${popoverBg} animate-in fade-in-50 zoom-in-95`}
                  >
                    {/* Search inside Geo */}
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-60" />
                      <input
                        type="text"
                        autoFocus
                        value={geoSearchQuery}
                        onChange={(e) => setGeoSearchQuery(e.target.value)}
                        placeholder={`Cerca ${geoMode === 'city' ? 'città' : 'regione'}...`}
                        className={`w-full pl-8 pr-2 py-1 text-xs font-hand rounded-lg border-2 focus:outline-none ${inputBg}`}
                      />
                    </div>

                    {/* Reset Option: Tutte */}
                    <button
                      type="button"
                      onClick={() => {
                        onGeoChange("all");
                        setIsGeoOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-hand font-bold flex items-center justify-between cursor-pointer mb-1 ${itemHover} ${
                        selectedGeo === "all" ? (isDark ? "bg-[#38332E] text-white" : "bg-[#F3EFE6]") : ""
                      }`}
                    >
                      <span>📍 Tutte le {geoMode === 'city' ? 'città' : 'regioni'}</span>
                      {selectedGeo === "all" && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="h-px bg-current/15 my-1" />

                    {/* Scrollable Geo Options */}
                    <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
                      {filteredGeoList.length === 0 ? (
                        <p className="text-center py-3 text-xs opacity-60 font-hand">
                          Nessun luogo trovato.
                        </p>
                      ) : (
                        filteredGeoList.map((g) => {
                          const isSelected = selectedGeo === g.name;
                          return (
                            <button
                              key={g.name}
                              type="button"
                              onClick={() => {
                                onGeoChange(g.name);
                                setIsGeoOpen(false);
                              }}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-hand font-bold flex items-center justify-between cursor-pointer transition ${itemHover} ${
                                isSelected ? (isDark ? "bg-[#38332E] text-[#FFD13B]" : "bg-[#F3EFE6] text-[#1C1A17]") : ""
                              }`}
                            >
                              <span className="truncate pr-2">{g.name}</span>
                              <span
                                className={`text-[10px] font-typewriter px-1.5 py-0.2 rounded-md ${
                                  isSelected
                                    ? isDark
                                      ? "bg-[#FFD13B] text-[#181716]"
                                      : "bg-[#1C1A17] text-white"
                                    : "bg-black/10 opacity-75"
                                }`}
                              >
                                {g.count}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Accanto i diversi spazi e modalità (CUSTOM POPOVER) */}
            <div className="relative shrink-0" ref={workModeDropdownRef}>
              <button
                type="button"
                id="workmode-filter-select"
                onClick={() => {
                  setIsWorkModeOpen(!isWorkModeOpen);
                  setIsStatusOpen(false);
                  setIsGeoOpen(false);
                }}
                className={`text-xs font-hand font-bold border-2 py-2 pl-3 pr-2.5 rounded-xl shadow-doodle-sm focus:outline-none cursor-pointer flex items-center gap-1.5 transition ${inputBg} ${
                  selectedWorkMode !== 'all' ? (isDark ? 'border-[#FFD13B] text-[#FFD13B]' : 'border-[#1C1A17] bg-[#FFF4D9]') : ''
                }`}
                title="Filtra per spazio e modalità di lavoro"
              >
                <Briefcase className="w-3.5 h-3.5 opacity-80" />
                <span className="max-w-[130px] truncate">{getWorkModeLabel(selectedWorkMode)}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isWorkModeOpen ? 'rotate-180' : ''}`} />
              </button>

              {isWorkModeOpen && (
                <div
                  className={`absolute right-0 top-full mt-1.5 w-60 rounded-xl border-2 py-1.5 z-50 ${popoverBg} animate-in fade-in-50 zoom-in-95`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onWorkModeChange("all");
                      setIsWorkModeOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-hand font-bold flex items-center justify-between cursor-pointer ${itemHover} ${
                      selectedWorkMode === "all" ? (isDark ? "bg-[#38332E] text-white" : "bg-[#F3EFE6]") : ""
                    }`}
                  >
                    <span>Spazi & Modalità: Tutte</span>
                    {selectedWorkMode === "all" && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="h-px bg-current/15 my-1" />

                  {Object.entries(WORK_MODE_CONFIG).map(([key, config]) => {
                    const count = workModeCounts[key as WorkSpaceMode] || 0;
                    const isSelected = selectedWorkMode === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          onWorkModeChange(key as FilterWorkSpaceMode);
                          setIsWorkModeOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs font-hand font-bold flex items-center justify-between cursor-pointer ${itemHover} ${
                          isSelected ? (isDark ? "bg-[#38332E] text-[#FFD13B]" : "bg-[#F3EFE6] text-[#1C1A17]") : ""
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{config.icon}</span>
                          <span>{config.label}</span>
                        </span>
                        {count > 0 && (
                          <span className="text-[10px] font-typewriter opacity-70 ml-2">
                            ({count})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Toggle Taxonomy Bar Visibility Button */}
            {onToggleTaxonomy && (
              <button
                type="button"
                onClick={onToggleTaxonomy}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-hand font-bold border-2 shadow-doodle-sm transition cursor-pointer ${
                  isTaxonomyOpen
                    ? isDark
                      ? "bg-[#2F2C28] text-[#FFD13B] border-[#FFD13B]"
                      : "bg-[#FFF4D9] text-[#1C1A17] border-[#1C1A17]"
                    : inputBg
                }`}
                title="Mostra o nascondi il pannello Categorie e Sottocategorie"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Categorie & Tag</span>
                {selectedTaxonomyCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-md bg-[#FFD13B] text-[#1C1A17] text-[10px] font-typewriter font-bold">
                    {selectedTaxonomyCount}
                  </span>
                )}
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${isTaxonomyOpen ? 'rotate-180' : ''}`}
                />
              </button>
            )}

            {/* View Mode Switcher */}
            <div
              className={`inline-flex rounded-xl p-1 border-2 shadow-doodle-sm shrink-0 gap-1 ${groupBg}`}
            >
              <button
                id="view-table-btn"
                onClick={() => onViewModeChange("table")}
                title="Vista Tabella / Registro"
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "table"
                    ? isDark
                      ? "bg-[#F7F4EB] text-[#181716] shadow-sm font-bold"
                      : "bg-[#1C1A17] text-[#FFFDF7] shadow-sm font-bold"
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
                    ? isDark
                      ? "bg-[#F7F4EB] text-[#181716] shadow-sm font-bold"
                      : "bg-[#1C1A17] text-[#FFFDF7] shadow-sm font-bold"
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
                    ? isDark
                      ? "bg-[#F7F4EB] text-[#181716] shadow-sm font-bold"
                      : "bg-[#1C1A17] text-[#FFFDF7] shadow-sm font-bold"
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
                    ? isDark
                      ? "bg-[#F7F4EB] text-[#181716] shadow-sm font-bold"
                      : "bg-[#1C1A17] text-[#FFFDF7] shadow-sm font-bold"
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
                    ? isDark
                      ? "bg-[#F7F4EB] text-[#181716] shadow-sm font-bold"
                      : "bg-[#1C1A17] text-[#FFFDF7] shadow-sm font-bold"
                    : "opacity-75 hover:opacity-100"
                }`}
              >
                <PieChart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Macro Entity Tabs + Dedicated "No privati" Button */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {/* Segmented Macro Entity Tabs: Tutti, Studi, Aziende, Università, Fotografia, Illustrazione, Artisti, Content Creator, Amici Designer */}
          <div
            className={`inline-flex rounded-xl p-1 border-2 shadow-doodle-sm shrink-0 gap-1 overflow-x-auto no-scrollbar ${groupBg}`}
          >
            {MACRO_TABS.map((tab) => {
              const isSelected = selectedMacroEntity === tab.id;
              const count = macroCounts[tab.id] || 0;

              return (
                <button
                  key={tab.id}
                  id={`macro-tab-${tab.id}`}
                  onClick={() => onMacroEntityChange(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-hand font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? isDark
                        ? "bg-[#F7F4EB] text-[#181716] shadow-xs scale-102"
                        : "bg-[#1C1A17] text-[#FFFDF7] shadow-xs scale-102"
                      : isDark
                      ? "text-[#D6D3D1] hover:text-[#F7F4EB] hover:bg-white/5"
                      : "text-[#1C1A17] opacity-75 hover:opacity-100"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span
                    className={`font-typewriter text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                      isSelected
                        ? isDark
                          ? "bg-black/20 text-[#181716]"
                          : "bg-white/20 text-white"
                        : isDark
                        ? "bg-white/10 text-[#F7F4EB]"
                        : "bg-black/10"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Standalone Dedicated "No privati" button */}
          <button
            id="filter-no-private-standalone-btn"
            onClick={onToggleNoPrivate}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-hand font-bold border-2 shadow-doodle-sm btn-doodle cursor-pointer whitespace-nowrap transition-transform ${
              noPrivate
                ? "bg-[#E63946] text-white border-[#E63946] scale-105 shadow-md"
                : isDark
                ? "bg-[#22201D] text-[#F7F4EB] border-[#44403C] hover:border-[#E63946]"
                : "bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17] hover:border-[#E63946]"
            }`}
            title="Escludi i profili categorizzati come persona privata o amico"
          >
            <UserX className={`w-3.5 h-3.5 ${noPrivate ? "text-white" : "text-[#E63946]"}`} />
            <span>No privati</span>
            {noPrivate && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          </button>
        </div>
      </div>

      {/* Active Filter Summary Bar if any filter is applied */}
      {isAnyFilterActive && (
        <div className="flex items-center justify-between text-xs px-1 pt-1 border-t opacity-90">
          <div className="flex items-center gap-2 font-hand text-sm flex-wrap">
            <span className="w-2 h-2 rounded-full bg-[#FF7844]" />
            <span>
              Mostrando <strong className="font-typewriter text-xs">{totalFilteredCount}</strong> su{" "}
              {totalCount} profili
              {selectedMacroEntity !== "all" &&
                ` · ${MACRO_TABS.find((t) => t.id === selectedMacroEntity)?.label}`}
              {noPrivate && " · 🚫 No privati"}
              {selectedGeo !== "all" && ` · 📍 ${selectedGeo}`}
              {selectedWorkMode !== "all" && ` · ${WORK_MODE_CONFIG[selectedWorkMode]?.label}`}
              {statusFilter !== "all" && ` · Stato: ${statusFilter}`}
              {selectedTaxonomyCount > 0 && ` · Tag: ${selectedTaxonomyCount} selezionati`}
            </span>
          </div>
          <button
            onClick={onResetAllFilters}
            className="font-hand font-bold text-sm text-[#E63946] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Azzera tutti i filtri</span>
          </button>
        </div>
      )}
    </div>
  );
};
