import React, { useState } from "react";
import {
  ExternalLink,
  Sparkles,
  Star,
  MapPin,
  Globe,
  Loader2,
  Bookmark,
  RotateCcw,
  UserX,
  Copy,
  Check,
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
import { copyToClipboard } from "../utils/clipboard";

interface StudioCardProps {
  profile: InstagramProfile;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onResetProfileAnalysis: () => void;
  onMarkAsPrivate: () => void;
  onAnalyzeSingle?: () => void;
  theme?: 'light' | 'dark';
}

const TAPE_COLORS = [
  "washi-tape-yellow",
  "washi-tape-pink",
  "washi-tape-blue",
];

export const StudioCard: React.FC<StudioCardProps> = ({
  profile,
  onSelect,
  onToggleFavorite,
  onResetProfileAnalysis,
  onMarkAsPrivate,
  onAnalyzeSingle,
  theme = 'light',
}) => {
  const [copiedHandle, setCopiedHandle] = useState(false);
  const ai = profile.aiAnalysis;
  const studioName = ai?.displayName || profile.displayName || profile.username;
  const macro = classifyMacroEntity(profile);
  const macroBadge = MACRO_ENTITY_BADGE_MAP[macro] || MACRO_ENTITY_BADGE_MAP.studio;
  const subType = classifyEntitySubType(profile);
  const contact = profile.contactInfo;
  const hasContactRelations = (contact?.relations?.length || 0) > 0;
  const hasTaggedPeople = (contact?.taggedPeople?.length || 0) > 0;

  const tapeIndex = Math.abs(profile.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % TAPE_COLORS.length;
  const tapeClass = TAPE_COLORS[tapeIndex];

  const cardBg = theme === 'dark' ? 'bg-[#201E1B] text-[#F7F4EB] border-[#44403C]' : 'bg-[#FFFDF9] text-[#1C1A17] border-[#1C1A17]';
  const subBoxBg = theme === 'dark' ? 'bg-[#282622] border-[#44403C]' : 'bg-[#FFF9E6] border-[#E5DFD2]';

  return (
    <div
      onClick={onSelect}
      className={`${cardBg} rounded-2xl border-2 p-5 shadow-doodle-sm hover:shadow-doodle transition-all flex flex-col justify-between group cursor-pointer relative overflow-visible`}
    >
      {/* Washi Tape Strip at card top */}
      <div 
        className={`absolute -top-2.5 left-1/2 -translate-x-1/2 h-4 w-20 ${tapeClass} rounded-xs transform -rotate-1 pointer-events-none z-10`}
        aria-hidden="true"
      />

      {/* Top row: Category, Location & Favorite */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {ai?.category ? (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-hand font-bold border ${theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#FFF] border-[#1C1A17]'}`}>
                {ai.category}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-hand opacity-60 bg-black/10 border border-current">
                Non categorizzato
              </span>
            )}

            {(ai?.locationCity || ai?.locationCountry) && (
              <a
                href={ai.mapsLinks && ai.mapsLinks.length > 0 ? ai.mapsLinks[0] : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ai.displayName} ${ai.locationCity} ${ai.locationCountry}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-typewriter border transition-colors ${theme === 'dark' ? 'bg-[#181716] border-[#38332E] hover:bg-[#38332E]' : 'bg-[#FFF9E6] border-[#1C1A17] hover:bg-[#FFD13B]'}`}
                title={ai.locationStreet ? `${ai.locationStreet}, ${ai.locationCity}, ${ai.locationState || ai.locationRegion} ${ai.locationCountry}` : "Apri in Google Maps"}
              >
                <MapPin className="w-2.5 h-2.5 text-[#E63946] shrink-0" />
                <span className="truncate max-w-[120px]">
                  {ai.locationCity ? `${ai.locationCity}, ` : ""}
                  {ai.countryCode || ai.locationCountry}
                </span>
              </a>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="p-1 opacity-50 hover:opacity-100 hover:text-[#FFB703] transition cursor-pointer"
            title={profile.isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
          >
            <Star
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                profile.isFavorite
                  ? "text-[#FFB703] fill-[#FFB703] opacity-100"
                  : ""
              }`}
            />
          </button>
        </div>

        {/* Entity Kind & Sub-Type Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-hand font-bold mb-2">
          <span className={`${macroBadge.color} inline-flex items-center gap-1 shrink-0`}>
            <span>{macroBadge.icon}</span>
            <span>{macroBadge.label}</span>
          </span>
          <span className="opacity-40 font-normal">·</span>
          <span className="font-sans font-medium text-[11px] opacity-80 truncate">{subType}</span>
        </div>

        {/* Studio / Brand Name & Handle */}
        <div className="mb-3">
          <ProfilePreview profile={profile}>
            <h3 className="font-bold text-lg leading-snug group-hover:text-[#FF5E8E] transition-colors inline-block cursor-help font-sans">
              {studioName}
            </h3>
          </ProfilePreview>
          <div className="flex items-center gap-1.5 mt-0.5">
            <ProfilePreview profile={profile}>
              <span className="text-xs font-typewriter opacity-75 cursor-help hover:opacity-100 transition-colors">
                @{profile.username}
              </span>
            </ProfilePreview>
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                const ok = await copyToClipboard(`@${profile.username}`);
                if (ok) {
                  setCopiedHandle(true);
                  setTimeout(() => setCopiedHandle(false), 2000);
                }
              }}
              className="opacity-50 hover:opacity-100 p-0.5 rounded hover:bg-black/10 transition cursor-pointer"
              title={copiedHandle ? "Copiato negli appunti!" : "Copia @username"}
            >
              {copiedHandle ? (
                <Check className="w-3 h-3 text-[#38B000]" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
            <a
              href={profile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="opacity-60 hover:opacity-100 hover:text-[#FF5E8E] transition inline-flex items-center gap-0.5 text-xs"
              title="Apri su Instagram"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
            {ai?.website && (
              <a
                href={ai.website.startsWith("http") ? ai.website : `https://${ai.website}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="opacity-75 hover:opacity-100 hover:text-[#3A86FF] transition inline-flex items-center gap-1 text-xs"
                title="Sito web ufficiale"
              >
                <Globe className="w-3 h-3" />
                <span className="truncate max-w-[90px] font-typewriter">{ai.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
          </div>
        </div>

        {/* Contact & Collaborations Strip (if present) */}
        {(hasContactRelations || hasTaggedPeople) && (
          <div className={`mb-3 p-2.5 rounded-xl border space-y-1.5 ${theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#F3EFE6]/70 border-[#D6CEBF]'}`}>
            {hasContactRelations && (
              <div className="flex flex-wrap gap-1">
                {contact!.relations.map((rel) => {
                  const cfg = COLLABORATION_RELATION_CONFIG[rel];
                  if (!cfg) return null;
                  return (
                    <span
                      key={rel}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-hand font-bold border ${cfg.badgeClass}`}
                    >
                      <span>{cfg.icon}</span>
                      <span>{cfg.shortLabel}</span>
                    </span>
                  );
                })}
              </div>
            )}
            {hasTaggedPeople && (
              <div className="flex flex-wrap gap-1">
                {contact!.taggedPeople.map((person) => (
                  <span
                    key={person.id}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-sans font-medium border ${
                      theme === 'dark'
                        ? 'bg-[#25221E] text-[#F7F4EB] border-[#44403C]'
                        : 'bg-[#FFFDF9] text-[#1C1A17] border-[#1C1A17]/40'
                    }`}
                  >
                    <span>👤</span>
                    <span className="font-bold">{person.name}</span>
                    {person.role && <span className="opacity-70">({person.role})</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Visual Style & Description */}
        {ai ? (
          <div className="space-y-2 mb-3">
            {ai.visualStyle && (
              <div className={`p-3 rounded-xl border text-xs leading-relaxed ${subBoxBg}`}>
                <span className="block font-hand font-bold text-xs opacity-80 mb-0.5 uppercase tracking-wide">
                  Linguaggio visivo & stile
                </span>
                <p className="line-clamp-2 text-xs font-sans">{ai.visualStyle}</p>
              </div>
            )}

            {ai.description && (
              <p className="text-xs opacity-90 line-clamp-2 leading-relaxed">
                {ai.description}
              </p>
            )}

            {/* Specialties */}
            {ai.keySpecialties && ai.keySpecialties.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {ai.keySpecialties.slice(0, 4).map((spec, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded-md text-[11px] border font-hand font-bold ${theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#FFF] border-[#1C1A17]'}`}
                  >
                    #{spec}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={`p-4 rounded-xl border-2 border-dashed text-center text-xs my-3 ${theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#F7F4EB] border-[#D6CEBF]'}`}>
            <p className="font-hand font-bold text-sm">Profilo non ancora analizzato</p>
            <p className="text-[11px] mt-0.5 opacity-75 mb-2.5">
              In attesa di classificazione (Studio/Azienda, stile, città e tag).
            </p>
            {onAnalyzeSingle && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAnalyzeSingle();
                }}
                disabled={profile.isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hand font-bold bg-[#FFD13B] text-[#1C1A17] border border-[#1C1A17] shadow-xs hover:scale-102 transition cursor-pointer"
              >
                {profile.isAnalyzing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 fill-current" />
                )}
                <span>{profile.isAnalyzing ? "Analisi in corso..." : "Analizza ora con Gemini"}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar: Action & Status */}
      <div className={`pt-3 border-t ${theme === 'dark' ? 'border-[#38332E]' : 'border-[#EBE5D8]'} flex items-center justify-between text-xs mt-auto`}>
        <div>
          {profile.isAnalyzing ? (
            <span className="inline-flex items-center gap-1.5 text-[#D97706] font-medium text-[11px]">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="truncate max-w-[130px] font-hand text-xs font-bold">Analisi in corso...</span>
            </span>
          ) : profile.error ? (
            <span className="inline-flex items-center gap-1 text-[#E63946] font-medium text-[11px]">
              <span className="truncate max-w-[120px] font-hand font-bold">Errore: {profile.error}</span>
            </span>
          ) : profile.isAnalyzed ? (
            <span className="inline-flex items-center gap-1 text-xs text-[#2D9C5E] font-hand font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#38B000]" />
              <span>Gemini OK</span>
            </span>
          ) : (
            <span className="text-[11px] opacity-60 font-hand">Da analizzare</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {profile.aiAnalysis?.category !== "Persona Privata / Amico" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsPrivate();
              }}
              className="inline-flex items-center p-1.5 rounded-lg text-xs opacity-70 hover:opacity-100 hover:text-[#E63946] hover:bg-black/10 border border-current transition cursor-pointer"
              title="Segna come Amico / Privato"
            >
              <UserX className="w-3.5 h-3.5" />
            </button>
          )}

          {profile.isAnalyzed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResetProfileAnalysis();
              }}
              className="inline-flex items-center p-1.5 rounded-lg text-xs opacity-70 hover:opacity-100 hover:text-[#FF7844] hover:bg-black/10 border border-current transition cursor-pointer"
              title="Rianalizza profilo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-hand font-bold text-[#1C1A17] bg-[#FFD13B] hover:bg-[#FFC01E] border-2 border-[#1C1A17] shadow-doodle-sm btn-doodle cursor-pointer"
          >
            <span>Dettagli ↗</span>
          </button>
        </div>
      </div>
    </div>
  );
};
