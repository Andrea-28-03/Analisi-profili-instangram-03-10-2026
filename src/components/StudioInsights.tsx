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
} from "lucide-react";
import { InstagramProfile } from "../types";

interface StudioInsightsProps {
  profiles: InstagramProfile[];
  onFilterByCategory: (cat: string) => void;
  onFilterByCountry: (country: string) => void;
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
  theme = 'light',
}) => {
  const total = profiles.length;
  const analyzed = profiles.filter((p) => p.isAnalyzed).length;
  const pending = total - analyzed;
  const analyzedPercent = total > 0 ? Math.round((analyzed / total) * 100) : 0;

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  // Country breakdown
  const countryCounts: Record<string, number> = {};
  // Studio type breakdown
  const typeCounts: Record<string, number> = {};

  profiles.forEach((p) => {
    const ai = p.aiAnalysis;
    const cat = ai?.category || "Non analizzato";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    const country = ai?.locationCountry || "Sconosciuto";
    countryCounts[country] = (countryCounts[country] || 0) + 1;

    const type = ai?.studioType || "Da definire";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const sortedCountries = Object.entries(countryCounts)
    .filter(([c]) => c !== "Sconosciuto")
    .sort((a, b) => b[1] - a[1]);
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  const cardBg = theme === 'dark' ? 'bg-[#22201D] text-[#F7F4EB] border-[#38332E]' : 'bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17]';
  const progressBg = theme === 'dark' ? 'bg-[#2C2A26] border-[#38332E]' : 'bg-[#EBE5D8] border-[#1C1A17]';

  return (
    <div className="space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: AI Coverage */}
        <div className={`${cardBg} rounded-2xl border-2 p-5 shadow-doodle-sm transition-colors`}>
          <div className="flex items-center justify-between font-hand font-bold text-xs opacity-75 mb-1">
            <span className="uppercase tracking-wide">Copertura Analisi AI</span>
            <Sparkles className="w-4 h-4 text-[#FFBE0B]" />
          </div>
          <div className="text-3xl font-typewriter font-bold">{analyzedPercent}%</div>
          <div className={`w-full ${progressBg} rounded-full h-2.5 mt-3 border overflow-hidden`}>
            <div
              className="bg-[#38B000] h-full rounded-full transition-all duration-500"
              style={{ width: `${analyzedPercent}%` }}
            />
          </div>
          <p className="text-xs opacity-75 mt-2 font-hand">
            {analyzed} su {total} profili catalogati con città e stile visivo
          </p>
        </div>

        {/* Card 2: Global Ecosystem */}
        <div className={`${cardBg} rounded-2xl border-2 p-5 shadow-doodle-sm transition-colors`}>
          <div className="flex items-center justify-between font-hand font-bold text-xs opacity-75 mb-1">
            <span className="uppercase tracking-wide">Mappa Geografica</span>
            <Globe2 className="w-4 h-4 text-[#3A86FF]" />
          </div>
          <div className="text-3xl font-typewriter font-bold">{sortedCountries.length}</div>
          <p className="text-xs opacity-75 mt-5 font-hand">
            Regioni e capitali del design identificate nel taccuino
          </p>
        </div>

        {/* Card 3: Disciplines */}
        <div className={`${cardBg} rounded-2xl border-2 p-5 shadow-doodle-sm transition-colors`}>
          <div className="flex items-center justify-between font-hand font-bold text-xs opacity-75 mb-1">
            <span className="uppercase tracking-wide">Discipline & Settori</span>
            <Layers className="w-4 h-4 text-[#FF5E8E]" />
          </div>
          <div className="text-3xl font-typewriter font-bold">{sortedCategories.length}</div>
          <p className="text-xs opacity-75 mt-5 font-hand">
            Aree creative mappate (Branding, Tipografia, Architettura...)
          </p>
        </div>
      </div>

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
              <span className="w-3 h-3 rounded-full bg-[#3A86FF] border border-current" />
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
                    <span className="font-hand font-bold text-sm group-hover:text-[#3A86FF] transition-colors">
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
