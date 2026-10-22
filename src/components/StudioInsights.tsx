import React from "react";
import {
  PieChart,
  BarChart3,
  Sparkles,
  Globe2,
  Building,
  Layers,
  CheckCircle2,
  AlertCircle,
  Compass,
  Briefcase,
} from "lucide-react";
import { InstagramProfile, FilterEntityKind } from "../types";
import { classifyEntityKind, classifyEntitySubType } from "../utils/entityClassifier";

interface StudioInsightsProps {
  profiles: InstagramProfile[];
  onFilterByCategory: (cat: string) => void;
  onFilterByCountry: (country: string) => void;
  onFilterByEntityKind?: (kind: FilterEntityKind) => void;
  onFilterBySubType?: (subType: string) => void;
  theme?: 'light' | 'dark';
}

const CRAYON_BAR_COLORS = [
  "bg-[#FF5E8E]",
  "bg-[#3A86FF]",
  "bg-[#FFBE0B]",
  "bg-[#38B000]",
  "bg-[#FB8500]",
  "bg-[#8338EC]",
  "bg-[#00B4D8]",
  "bg-[#E63946]",
];

export const StudioInsights: React.FC<StudioInsightsProps> = ({
  profiles,
  onFilterByCategory,
  onFilterByCountry,
  onFilterByEntityKind,
  onFilterBySubType,
  theme = 'light',
}) => {
  const total = profiles.length;
  const analyzed = profiles.filter((p) => p.isAnalyzed).length;
  const pending = total - analyzed;
  const analyzedPercent = total > 0 ? Math.round((analyzed / total) * 100) : 0;

  // Studi vs Aziende metrics
  let studioTotal = 0;
  let aziendaTotal = 0;
  const studioTypeCounts: Record<string, number> = {};
  const aziendaTypeCounts: Record<string, number> = {};

  // Category & Country breakdown
  const categoryCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};

  profiles.forEach((p) => {
    const ai = p.aiAnalysis;
    const kind = classifyEntityKind(p);
    const subType = classifyEntitySubType(p);

    if (kind === "studio") {
      studioTotal++;
      studioTypeCounts[subType] = (studioTypeCounts[subType] || 0) + 1;
    } else if (kind === "azienda") {
      aziendaTotal++;
      aziendaTypeCounts[subType] = (aziendaTypeCounts[subType] || 0) + 1;
    }

    const cat = ai?.category || "Non analizzato";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    const country = ai?.locationCountry || "Sconosciuto";
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });

  const studioPercent = total > 0 ? Math.round((studioTotal / total) * 100) : 0;
  const aziendaPercent = total > 0 ? Math.round((aziendaTotal / total) * 100) : 0;

  const sortedStudioTypes = Object.entries(studioTypeCounts).sort((a, b) => b[1] - a[1]);
  const sortedAziendaTypes = Object.entries(aziendaTypeCounts).sort((a, b) => b[1] - a[1]);
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const sortedCountries = Object.entries(countryCounts)
    .filter(([c]) => c !== "Sconosciuto")
    .sort((a, b) => b[1] - a[1]);

  const cardBg = theme === 'dark' ? 'bg-[#22201D] text-[#F7F4EB] border-[#38332E]' : 'bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17]';
  const progressBg = theme === 'dark' ? 'bg-[#2C2A26] border-[#38332E]' : 'bg-[#EBE5D8] border-[#1C1A17]';
  const subBoxBg = theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#FFF9E6] border-[#E5DFD2]';

  return (
    <div className="space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Card 1: Studi vs Aziende Proportion */}
        <div 
          onClick={() => onFilterByEntityKind && onFilterByEntityKind("studio")}
          className={`${cardBg} rounded-2xl border-2 p-5 shadow-doodle-sm transition-all hover:scale-[1.01] cursor-pointer`}
          title="Clicca per visualizzare solo gli Studi"
        >
          <div className="flex items-center justify-between font-hand font-bold text-xs opacity-75 mb-1">
            <span className="uppercase tracking-wide">📐 Studi Creativi</span>
            <span className="font-typewriter text-xs text-[#3A86FF] font-bold">{studioPercent}%</span>
          </div>
          <div className="text-3xl font-typewriter font-bold text-[#3A86FF]">{studioTotal}</div>
          <p className="text-xs opacity-75 mt-3 font-hand">
            Studi di design, architettura, fonderie e freelance
          </p>
        </div>

        {/* Card 2: Aziende & Brand */}
        <div 
          onClick={() => onFilterByEntityKind && onFilterByEntityKind("azienda")}
          className={`${cardBg} rounded-2xl border-2 p-5 shadow-doodle-sm transition-all hover:scale-[1.01] cursor-pointer`}
          title="Clicca per visualizzare solo le Aziende"
        >
          <div className="flex items-center justify-between font-hand font-bold text-xs opacity-75 mb-1">
            <span className="uppercase tracking-wide">🏢 Aziende & Brand</span>
            <span className="font-typewriter text-xs text-[#FB8500] font-bold">{aziendaPercent}%</span>
          </div>
          <div className="text-3xl font-typewriter font-bold text-[#FB8500]">{aziendaTotal}</div>
          <p className="text-xs opacity-75 mt-3 font-hand">
            Brand di arredo, luce, oggettistica e manifatture
          </p>
        </div>

        {/* Card 3: Global Ecosystem */}
        <div className={`${cardBg} rounded-2xl border-2 p-5 shadow-doodle-sm transition-colors`}>
          <div className="flex items-center justify-between font-hand font-bold text-xs opacity-75 mb-1">
            <span className="uppercase tracking-wide">Mappa Geografica</span>
            <Globe2 className="w-4 h-4 text-[#38B000]" />
          </div>
          <div className="text-3xl font-typewriter font-bold">{sortedCountries.length}</div>
          <p className="text-xs opacity-75 mt-3 font-hand">
            Paesi e capitali internazionali del design
          </p>
        </div>

        {/* Card 4: AI Coverage */}
        <div className={`${cardBg} rounded-2xl border-2 p-5 shadow-doodle-sm transition-colors`}>
          <div className="flex items-center justify-between font-hand font-bold text-xs opacity-75 mb-1">
            <span className="uppercase tracking-wide">Analizzati AI</span>
            <Sparkles className="w-4 h-4 text-[#FFBE0B]" />
          </div>
          <div className="text-3xl font-typewriter font-bold">{analyzedPercent}%</div>
          <div className={`w-full ${progressBg} rounded-full h-2 mt-2 border overflow-hidden`}>
            <div
              className="bg-[#38B000] h-full rounded-full transition-all duration-500"
              style={{ width: `${analyzedPercent}%` }}
            />
          </div>
          <p className="text-xs opacity-75 mt-2 font-hand">
            {analyzed} su {total} profili catalogati
          </p>
        </div>
      </div>

      {/* Divisione Interna: Tipi di Studio vs Tipi di Azienda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipi di Studio */}
        <div className={`${cardBg} rounded-2xl border-2 p-6 shadow-doodle-sm transition-colors`}>
          <div className="flex items-center justify-between mb-4 border-b border-current opacity-20 pb-3">
            <h3 className="font-hand font-bold text-lg opacity-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#3A86FF] border border-current" />
              <span>Divisione Interna: Tipi di Studio (📐 {studioTotal})</span>
            </h3>
            <span className="text-xs font-hand opacity-75">clicca per filtrare</span>
          </div>

          {sortedStudioTypes.length === 0 ? (
            <p className="text-xs opacity-60 font-hand py-4 text-center">Nessun tipo di studio registrato.</p>
          ) : (
            <div className="space-y-3">
              {sortedStudioTypes.map(([type, count], index) => {
                const pct = studioTotal > 0 ? Math.round((count / studioTotal) * 100) : 0;
                return (
                  <div
                    key={type}
                    onClick={() => {
                      if (onFilterByEntityKind) onFilterByEntityKind("studio");
                      if (onFilterBySubType) onFilterBySubType(type);
                    }}
                    className="group cursor-pointer p-1.5 rounded-xl hover:bg-black/10 transition-colors"
                  >
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-hand font-bold text-sm group-hover:text-[#3A86FF] transition-colors">
                        {type}
                      </span>
                      <span className="font-typewriter text-xs opacity-75">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className={`w-full ${progressBg} rounded-full h-2.5 border overflow-hidden`}>
                      <div
                        className="h-full rounded-full bg-[#3A86FF] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tipi di Azienda */}
        <div className={`${cardBg} rounded-2xl border-2 p-6 shadow-doodle-sm transition-colors`}>
          <div className="flex items-center justify-between mb-4 border-b border-current opacity-20 pb-3">
            <h3 className="font-hand font-bold text-lg opacity-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FB8500] border border-current" />
              <span>Divisione Interna: Tipi di Azienda (🏢 {aziendaTotal})</span>
            </h3>
            <span className="text-xs font-hand opacity-75">clicca per filtrare</span>
          </div>

          {sortedAziendaTypes.length === 0 ? (
            <p className="text-xs opacity-60 font-hand py-4 text-center">Nessun tipo di azienda registrato.</p>
          ) : (
            <div className="space-y-3">
              {sortedAziendaTypes.map(([type, count], index) => {
                const pct = aziendaTotal > 0 ? Math.round((count / aziendaTotal) * 100) : 0;
                return (
                  <div
                    key={type}
                    onClick={() => {
                      if (onFilterByEntityKind) onFilterByEntityKind("azienda");
                      if (onFilterBySubType) onFilterBySubType(type);
                    }}
                    className="group cursor-pointer p-1.5 rounded-xl hover:bg-black/10 transition-colors"
                  >
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-hand font-bold text-sm group-hover:text-[#FB8500] transition-colors">
                        {type}
                      </span>
                      <span className="font-typewriter text-xs opacity-75">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className={`w-full ${progressBg} rounded-full h-2.5 border overflow-hidden`}>
                      <div
                        className="h-full rounded-full bg-[#FB8500] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Discipline & Poli Geografici */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories Bar Chart */}
        <div className={`${cardBg} rounded-2xl border-2 p-6 shadow-doodle-sm transition-colors`}>
          <div className="flex items-center justify-between mb-4 border-b border-current opacity-20 pb-3">
            <h3 className="font-hand font-bold text-lg opacity-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5E8E] border border-current" />
              <span>Distribuzione per Disciplina</span>
            </h3>
            <span className="text-xs font-hand opacity-75">clicca per filtrare</span>
          </div>

          <div className="space-y-3">
            {sortedCategories.map(([cat, count], index) => {
              const pct = Math.round((count / total) * 100);
              const colorClass = CRAYON_BAR_COLORS[index % CRAYON_BAR_COLORS.length];

              return (
                <div
                  key={cat}
                  onClick={() => onFilterByCategory(cat)}
                  className="group cursor-pointer p-1.5 rounded-xl hover:bg-black/10 transition-colors"
                >
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-hand font-bold text-sm group-hover:text-[#FF5E8E] transition-colors">
                      {cat}
                    </span>
                    <span className="font-typewriter text-xs opacity-75">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className={`w-full ${progressBg} rounded-full h-2.5 border overflow-hidden`}>
                    <div
                      className={`h-full rounded-full ${colorClass} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geographic Distribution Chart */}
        <div className={`${cardBg} rounded-2xl border-2 p-6 shadow-doodle-sm transition-colors`}>
          <div className="flex items-center justify-between mb-4 border-b border-current opacity-20 pb-3">
            <h3 className="font-hand font-bold text-lg opacity-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#38B000] border border-current" />
              <span>Poli Geografici (Paesi)</span>
            </h3>
            <span className="text-xs font-hand opacity-75">clicca per filtrare</span>
          </div>

          <div className="space-y-3">
            {sortedCountries.slice(0, 8).map(([country, count], index) => {
              const pct = Math.round((count / (analyzed || 1)) * 100);
              const colorClass = CRAYON_BAR_COLORS[(index + 2) % CRAYON_BAR_COLORS.length];

              return (
                <div
                  key={country}
                  onClick={() => onFilterByCountry(country)}
                  className="group cursor-pointer p-1.5 rounded-xl hover:bg-black/10 transition-colors"
                >
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-hand font-bold text-sm group-hover:text-[#38B000] transition-colors">
                      {country}
                    </span>
                    <span className="font-typewriter text-xs opacity-75">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className={`w-full ${progressBg} rounded-full h-2.5 border overflow-hidden`}>
                    <div
                      className={`h-full rounded-full ${colorClass} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
