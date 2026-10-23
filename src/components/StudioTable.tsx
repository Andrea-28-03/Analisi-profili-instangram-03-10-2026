import React, { useState } from "react";
import {
  ExternalLink,
  Sparkles,
  Star,
  Loader2,
  Trash2,
  Globe,
  Info,
  ArrowUpDown,
  CheckCircle2,
  RotateCcw,
  UserX,
  Building,
  Compass,
  Zap,
} from "lucide-react";
import { InstagramProfile } from "../types";
import { ProfilePreview } from "./ProfilePreview";
import {
  classifyMacroEntity,
  classifyEntitySubType,
  MACRO_ENTITY_BADGE_MAP,
  COLLABORATION_RELATION_CONFIG,
} from "../utils/entityClassifier";

interface StudioTableProps {
  profiles: InstagramProfile[];
  onSelectProfile: (profile: InstagramProfile) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteProfile: (id: string) => void;
  onResetProfileAnalysis: (id: string) => void;
  onMarkAsPrivate: (id: string) => void;
  onAnalyzeSingle?: (id: string) => void;
  theme?: 'light' | 'dark';
}

type SortField = "username" | "name" | "kind" | "category" | "location" | "rating" | "status" | "contacts";

const AVATAR_COLORS = [
  "bg-[#FF5E8E]",
  "bg-[#FFBE0B]",
  "bg-[#38B000]",
  "bg-[#3A86FF]",
  "bg-[#FB8500]",
  "bg-[#8338EC]",
  "bg-[#00B4D8]",
];

export const StudioTable: React.FC<StudioTableProps> = ({
  profiles,
  onSelectProfile,
  onToggleFavorite,
  onDeleteProfile,
  onResetProfileAnalysis,
  onMarkAsPrivate,
  onAnalyzeSingle,
  theme = 'light',
}) => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedProfiles = [...profiles].sort((a, b) => {
    let valA = "";
    let valB = "";

    switch (sortField) {
      case "username":
        valA = a.username;
        valB = b.username;
        break;
      case "name":
        valA = a.aiAnalysis?.displayName || a.displayName || a.username;
        valB = b.aiAnalysis?.displayName || b.displayName || b.username;
        break;
      case "kind":
        valA = `${classifyMacroEntity(a)} ${classifyEntitySubType(a)}`;
        valB = `${classifyMacroEntity(b)} ${classifyEntitySubType(b)}`;
        break;
      case "category":
        valA = a.aiAnalysis?.category || "ZZZ";
        valB = b.aiAnalysis?.category || "ZZZ";
        break;
      case "location":
        valA = `${a.aiAnalysis?.locationCountry || "ZZZ"} ${a.aiAnalysis?.locationCity || ""}`;
        valB = `${b.aiAnalysis?.locationCountry || "ZZZ"} ${b.aiAnalysis?.locationCity || ""}`;
        break;
      case "contacts": {
        const countA = (a.contactInfo?.relations?.length || 0) + (a.contactInfo?.taggedPeople?.length || 0);
        const countB = (b.contactInfo?.relations?.length || 0) + (b.contactInfo?.taggedPeople?.length || 0);
        return sortAsc ? countB - countA : countA - countB;
      }
      case "rating":
        return sortAsc ? (a.rating || 0) - (b.rating || 0) : (b.rating || 0) - (a.rating || 0);
      case "status":
        return sortAsc
          ? Number(a.isAnalyzed) - Number(b.isAnalyzed)
          : Number(b.isAnalyzed) - Number(a.isAnalyzed);
    }

    const cmp = valA.localeCompare(valB, "it", { sensitivity: "base" });
    return sortAsc ? cmp : -cmp;
  });

  const tableBg = theme === 'dark' ? 'bg-[#1E1C19] text-[#F7F4EB] border-[#44403C]' : 'bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17]';
  const headerBg = theme === 'dark' ? 'bg-[#282622] text-[#F7F4EB] border-[#44403C]' : 'bg-[#F3EFE6] text-[#1C1A17] border-[#1C1A17]';
  const rowHover = theme === 'dark' ? 'hover:bg-[#2A2724]' : 'hover:bg-[#FFF9E6]';
  const divider = theme === 'dark' ? 'divide-[#3E3A35]' : 'divide-[#EBE5D8]';

  if (profiles.length === 0) {
    return (
      <div className={`${tableBg} rounded-2xl border-2 border-dashed p-12 text-center shadow-doodle-sm`}>
        <p className="font-hand font-bold text-lg">Nessun profilo trovato nel taccuino con questi filtri.</p>
        <p className="font-sans text-xs opacity-75 mt-1">Prova a cambiare la ricerca, la divisione Studi/Aziende o la disciplina.</p>
      </div>
    );
  }

  return (
    <div className={`${tableBg} rounded-2xl border-2 shadow-doodle-sm overflow-hidden transition-colors`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className={`${headerBg} border-b-2 font-hand font-bold text-sm tracking-wide select-none`}>
              <th className="py-3 px-3 w-10 text-center">★</th>
              <th
                onClick={() => handleSort("username")}
                className="py-3 px-4 cursor-pointer opacity-85 hover:opacity-100 transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Profilo Studio / Brand</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort("kind")}
                className="py-3 px-4 cursor-pointer opacity-85 hover:opacity-100 transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Natura & Tipo</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort("contacts")}
                className="py-3 px-4 cursor-pointer opacity-85 hover:opacity-100 transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Contatti & Relazioni</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort("name")}
                className="py-3 px-4 cursor-pointer opacity-85 hover:opacity-100 transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Sito Ufficiale</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort("category")}
                className="py-3 px-4 cursor-pointer opacity-85 hover:opacity-100 transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Ambito Disciplinare</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort("location")}
                className="py-3 px-4 cursor-pointer opacity-85 hover:opacity-100 transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Sede & Mappa</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th className="py-3 px-4 min-w-[200px]">Linguaggio Visivo & Note</th>
              <th className="py-3 px-4">Tag & Focus</th>
              <th
                onClick={() => handleSort("status")}
                className="py-3 px-4 cursor-pointer opacity-85 hover:opacity-100 transition text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Stato AI</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${divider} font-sans`}>
            {sortedProfiles.map((profile, i) => {
              const ai = profile.aiAnalysis;
              const studioName = ai?.displayName || profile.displayName || profile.username;
              const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const macroEntity = classifyMacroEntity(profile);
              const macroBadge = MACRO_ENTITY_BADGE_MAP[macroEntity] || MACRO_ENTITY_BADGE_MAP.studio;
              const subType = classifyEntitySubType(profile);
              const relations = profile.contactInfo?.relations || [];
              const taggedPeople = profile.contactInfo?.taggedPeople || [];

              return (
                <tr
                  key={profile.id}
                  className={`${rowHover} transition-colors group cursor-pointer`}
                  onClick={() => onSelectProfile(profile)}
                >
                  {/* Favorite Star */}
                  <td
                    className="py-3 px-3 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(profile.id);
                    }}
                  >
                    <button
                      className="text-current opacity-40 hover:opacity-100 hover:text-[#FFB703] transition cursor-pointer"
                      title={profile.isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
                    >
                      <Star
                        className={`w-4 h-4 transition-transform hover:scale-125 ${
                          profile.isFavorite
                            ? "text-[#FFB703] fill-[#FFB703] opacity-100"
                            : ""
                        }`}
                      />
                    </button>
                  </td>

                  {/* Username & Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <ProfilePreview profile={profile}>
                        <div className={`w-8 h-8 rounded-lg ${avatarColor} border-2 border-current shadow-xs flex items-center justify-center font-hand font-bold text-sm text-white shrink-0 uppercase cursor-help`}>
                          {profile.username.slice(0, 2)}
                        </div>
                      </ProfilePreview>
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1.5">
                          <ProfilePreview profile={profile}>
                            <span className="truncate max-w-[150px] font-sans font-bold text-xs cursor-help hover:text-[#FF5E8E] transition-colors">
                              {studioName}
                            </span>
                          </ProfilePreview>
                          <a
                            href={profile.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-60 hover:opacity-100 hover:text-[#FF5E8E] transition"
                            title="Apri profilo su Instagram"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <span className="font-typewriter text-[11px] opacity-75">
                          @{profile.username}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Natura & Tipo (Tutte le Macro-Categorie) */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 font-hand font-bold text-xs">
                        <span className={`${macroBadge.colorClass} inline-flex items-center gap-1`}>
                          <span>{macroBadge.icon}</span>
                          <span>{macroBadge.label}</span>
                        </span>
                      </div>
                      <span className="text-[11px] font-sans opacity-75 truncate max-w-[150px]" title={subType}>
                        {subType}
                      </span>
                    </div>
                  </td>

                  {/* Contatti & Collaborazioni */}
                  <td className="py-3 px-4">
                    {relations.length > 0 || taggedPeople.length > 0 ? (
                      <div className="flex flex-col gap-1 max-w-[180px]">
                        {relations.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {relations.map((rel) => {
                              const cfg = COLLABORATION_RELATION_CONFIG[rel];
                              if (!cfg) return null;
                              return (
                                <span
                                  key={rel}
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md border text-[10px] font-hand font-bold ${cfg.badgeClass}`}
                                  title={cfg.description}
                                >
                                  <span>{cfg.icon}</span>
                                  <span>{cfg.shortLabel}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {taggedPeople.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center text-[10px] font-typewriter opacity-85">
                            {taggedPeople.slice(0, 2).map((person) => (
                              <span
                                key={person.id}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md border ${
                                  theme === 'dark'
                                    ? 'bg-[#282622] border-[#57534E] text-[#FFD13B]'
                                    : 'bg-[#FFF9E6] border-[#1C1A17]/40 text-[#1C1A17]'
                                }`}
                                title={`${person.name}${person.role ? ` (${person.role})` : ''}${person.note ? ` - ${person.note}` : ''}`}
                              >
                                <span>👤</span>
                                <span className="truncate max-w-[95px] font-bold">{person.name}</span>
                              </span>
                            ))}
                            {taggedPeople.length > 2 && (
                              <span className="text-[9px] opacity-60">+{taggedPeople.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] opacity-40 hover:opacity-90 font-hand transition">
                        + Aggiungi contatto
                      </span>
                    )}
                  </td>

                  {/* Sito Web */}
                  <td className="py-3 px-4">
                    {ai?.website ? (
                      <a
                        href={ai.website.startsWith("http") ? ai.website : `https://${ai.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 opacity-85 hover:opacity-100 hover:text-[#3A86FF] transition-colors font-typewriter text-[11px]"
                        title={ai.website}
                      >
                        <Globe className="w-3.5 h-3.5 text-[#3A86FF] shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {ai.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                        </span>
                      </a>
                    ) : (
                      <span className="text-[11px] opacity-40 font-typewriter">—</span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    {ai?.category ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-hand font-bold border ${theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#F3EFE6] border-[#1C1A17]'}`}>
                        {ai.category}
                      </span>
                    ) : (
                      <span className="text-[11px] opacity-50 font-hand">Non categorizzato</span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4">
                    {ai?.locationCity || ai?.locationCountry ? (
                      <a
                        href={ai.mapsLinks && ai.mapsLinks.length > 0 ? ai.mapsLinks[0] : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ai.displayName} ${ai.locationCity} ${ai.locationCountry}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title={ai.locationStreet ? `${ai.locationStreet}, ${ai.locationCity}, ${ai.locationState || ai.locationRegion} ${ai.locationCountry}` : "Apri in Google Maps"}
                        className="flex items-center gap-1.5 hover:text-[#FF5E8E] transition-colors"
                      >
                        {ai.countryCode && (
                          <span className={`px-1.5 py-0.2 rounded-md border text-[10px] font-typewriter font-bold ${theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#FFF9E6] border-[#1C1A17]'}`}>
                            {ai.countryCode}
                          </span>
                        )}
                        <span className="truncate max-w-[140px] text-xs opacity-90">
                          {ai.locationCity ? `${ai.locationCity}, ` : ""}
                          <strong className="font-medium">
                            {ai.locationCountry}
                          </strong>
                        </span>
                      </a>
                    ) : (
                      <span className="text-[11px] opacity-40 font-typewriter">—</span>
                    )}
                  </td>

                  {/* Visual Style */}
                  <td className="py-3 px-4 opacity-90">
                    {ai?.visualStyle ? (
                      <p className="line-clamp-2 text-xs leading-relaxed" title={ai.visualStyle}>
                        {ai.visualStyle}
                      </p>
                    ) : (
                      <span className="text-[11px] opacity-50 font-hand">In attesa di analisi</span>
                    )}
                  </td>

                  {/* Specialties & Tags */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {ai?.keySpecialties && ai.keySpecialties.length > 0 ? (
                        ai.keySpecialties.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.2 text-[10px] font-hand font-bold rounded-md border ${theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#FFF] border-[#1C1A17]'}`}
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] opacity-40 font-typewriter">—</span>
                      )}
                    </div>
                  </td>

                  {/* AI Status */}
                  <td className="py-3 px-4 text-center">
                    {profile.isAnalyzing ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-hand font-bold border ${
                        theme === 'dark'
                          ? 'bg-[#78350F]/40 text-[#FDE047] border-[#CA8A04]'
                          : 'bg-[#FFBE0B]/20 text-[#D97706] border-[#D97706]'
                      }`}>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>In corso...</span>
                      </span>
                    ) : profile.error ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-hand font-bold border ${
                        theme === 'dark'
                          ? 'bg-[#7F1D1D]/40 text-[#FCA5A5] border-[#EF4444]'
                          : 'bg-[#FEE2E2] text-[#E63946] border-[#E63946]'
                      }`}>
                        <span>Errore</span>
                      </span>
                    ) : profile.isAnalyzed ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-hand font-bold border ${
                        theme === 'dark'
                          ? 'bg-[#14532D]/40 text-[#86EFAC] border-[#22C55E]'
                          : 'bg-[#DCFCE7] text-[#166534] border-[#166534]'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Gemini ✓</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-hand border ${
                        theme === 'dark'
                          ? 'bg-[#2A2724] text-[#D6D3D1] border-[#44403C]'
                          : 'bg-[#F7F4EB] text-[#6B635B] border-[#D6CEBF]'
                      }`}>
                        Da fare ✎
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {!profile.isAnalyzed && onAnalyzeSingle && (
                        <button
                          onClick={() => onAnalyzeSingle(profile.id)}
                          disabled={profile.isAnalyzing}
                          className="p-1 rounded-lg text-[#1C1A17] dark:text-[#FFD13B] bg-[#FFD13B] dark:bg-[#FFD13B]/20 hover:scale-110 transition cursor-pointer"
                          title="Analizza questo profilo con Gemini API"
                        >
                          {profile.isAnalyzing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 fill-current" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => onSelectProfile(profile)}
                        className="p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/10 transition cursor-pointer"
                        title="Vedi scheda completa"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      {profile.isAnalyzed && (
                        <button
                          onClick={() => onResetProfileAnalysis(profile.id)}
                          className="p-1 rounded-lg opacity-70 hover:opacity-100 hover:text-[#FF7844] hover:bg-black/10 transition cursor-pointer"
                          title="Smarca e rianalizza"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {profile.aiAnalysis?.category !== "Persona Privata / Amico" && (
                        <button
                          onClick={() => onMarkAsPrivate(profile.id)}
                          className="p-1 rounded-lg opacity-70 hover:opacity-100 hover:text-[#E63946] hover:bg-black/10 transition cursor-pointer"
                          title="Imposta come Privato/Amico"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteProfile(profile.id)}
                        className="p-1 rounded-lg opacity-70 hover:opacity-100 hover:text-[#E63946] hover:bg-black/10 transition cursor-pointer"
                        title="Rimuovi dal taccuino"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
