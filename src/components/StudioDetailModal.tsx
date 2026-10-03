import React, { useState } from "react";
import {
  X,
  ExternalLink,
  Sparkles,
  Star,
  Globe,
  MapPin,
  Building2,
  Calendar,
  Save,
  Loader2,
  Trash2,
  RotateCcw,
  UserX,
  Check,
} from "lucide-react";
import { InstagramProfile } from "../types";

interface StudioDetailModalProps {
  profile: InstagramProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNotes: (id: string, notes: string, rating: number) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onResetProfileAnalysis: (id: string) => void;
  onMarkAsPrivate: (id: string) => void;
  theme?: 'light' | 'dark';
}

export const StudioDetailModal: React.FC<StudioDetailModalProps> = ({
  profile,
  isOpen,
  onClose,
  onUpdateNotes,
  onToggleFavorite,
  onDelete,
  onResetProfileAnalysis,
  onMarkAsPrivate,
  theme = 'light',
}) => {
  if (!isOpen || !profile) return null;

  const ai = profile.aiAnalysis;
  const studioName = ai?.displayName || profile.displayName || profile.username;

  const [notes, setNotes] = useState(profile.notes || "");
  const [rating, setRating] = useState(profile.rating || 0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveNotes = () => {
    onUpdateNotes(profile.id, notes, rating);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const modalBg = theme === 'dark' ? 'bg-[#22201D] text-[#F7F4EB] border-[#38332E]' : 'bg-[#FFFDF9] text-[#1C1A17] border-[#1C1A17]';
  const headerBg = theme === 'dark' ? 'bg-[#2C2A26] border-[#38332E]' : 'bg-[#F7F4EB] border-[#1C1A17]';
  const subBoxBg = theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#FFFDF7] border-[#1C1A17]';
  const inputBg = theme === 'dark' ? 'bg-[#181716] text-[#F7F4EB] border-[#38332E]' : 'bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div className={`${modalBg} rounded-2xl shadow-doodle-lg border-2 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] relative transition-colors`}>
        {/* Washi tape on modal top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-28 washi-tape-yellow rounded-xs -rotate-1 pointer-events-none z-20" />

        {/* Modal Header */}
        <div className={`px-6 py-4 border-b-2 flex items-start justify-between ${headerBg}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-typewriter text-xs opacity-75">@{profile.username}</span>
              {ai?.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-hand font-bold bg-[#FFD13B] text-[#1C1A17] border border-[#1C1A17]">
                  {ai.category}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold font-sans tracking-tight mt-1">
              {studioName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(profile.id)}
              className="p-1.5 opacity-50 hover:opacity-100 hover:text-[#FFB703] transition cursor-pointer"
              title={profile.isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
            >
              <Star
                className={`w-6 h-6 transition-transform hover:scale-125 ${
                  profile.isFavorite
                    ? "text-[#FFB703] fill-[#FFB703] opacity-100"
                    : ""
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl opacity-75 hover:opacity-100 hover:bg-black/10 border border-transparent hover:border-current transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Quick Links & Meta Bar */}
          <div className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border ${theme === 'dark' ? 'bg-[#2C2A26] border-[#38332E]' : 'bg-[#FFF9E6] border-[#1C1A17]'}`}>
            <div className="flex items-center gap-3">
              <a
                href={profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-hand font-bold text-sm text-[#FF5E8E] hover:underline"
              >
                <span>Instagram Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {ai?.website && (
                <a
                  href={ai.website.startsWith("http") ? ai.website : `https://${ai.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-hand font-bold text-sm text-[#3A86FF] hover:underline"
                >
                  <Globe className="w-3.5 h-3.5 text-[#3A86FF]" />
                  <span className="font-typewriter text-xs">{ai.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
            </div>

            {(ai?.locationCity || ai?.locationCountry) && (
              <a 
                href={ai.mapsLinks && ai.mapsLinks.length > 0 ? ai.mapsLinks[0] : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ai.displayName} ${ai.locationCity} ${ai.locationCountry}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                title={ai.locationStreet ? `${ai.locationStreet}, ${ai.locationCity}, ${ai.locationState || ai.locationRegion} ${ai.locationCountry}` : "Apri in Google Maps"}
                className={`flex items-center gap-1.5 font-typewriter text-xs px-2.5 py-1 rounded-lg border shadow-xs ${theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#FFF] border-[#1C1A17]'}`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
                <span>
                  {ai.locationCity ? `${ai.locationCity}, ` : ""}
                  <strong>{ai.locationCountry}</strong>
                  {ai.countryCode ? ` (${ai.countryCode})` : ""}
                </span>
              </a>
            )}
          </div>

          {/* Gemini AI Dossier */}
          {ai ? (
            <div className="space-y-4">
              {/* Visual Style & Language */}
              <div className={`p-4 rounded-xl border-2 space-y-1.5 shadow-doodle-sm ${subBoxBg}`}>
                <div className="flex items-center gap-1.5 font-hand font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-[#FFBE0B]" />
                  <span>Stile Visivo, Linguaggio & Ricerca Estetica</span>
                </div>
                <p className="leading-relaxed font-sans text-xs opacity-90">
                  {ai.visualStyle || "Nessun dettaglio visivo registrato."}
                </p>
              </div>

              {/* Description */}
              {ai.description && (
                <div className="space-y-1">
                  <span className="font-hand font-bold text-xs opacity-75 uppercase tracking-wide">
                    Sintesi dello studio
                  </span>
                  <p className={`leading-relaxed p-3 rounded-xl border opacity-90 ${theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#F7F4EB] border-[#E5DFD2]'}`}>
                    {ai.description}
                  </p>
                </div>
              )}

              {/* Key Specialties & Design Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ai.keySpecialties && ai.keySpecialties.length > 0 && (
                  <div className={`p-3 rounded-xl border ${subBoxBg}`}>
                    <span className="font-hand font-bold text-xs block mb-1.5">
                      Specialità Chiave
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {ai.keySpecialties.map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-hand font-bold bg-[#FF5E8E]/15 text-[#FF6B8B] border border-[#FF5E8E]"
                        >
                          #{spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {ai.designTags && ai.designTags.length > 0 && (
                  <div className={`p-3 rounded-xl border ${subBoxBg}`}>
                    <span className="font-hand font-bold text-xs block mb-1.5">
                      Tag Visivi & Settoriali
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {ai.designTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-hand font-bold bg-[#3A86FF]/15 text-[#60A5FA] border border-[#3A86FF]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`p-6 text-center rounded-xl border-2 border-dashed ${theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#F7F4EB] border-[#D6CEBF]'}`}>
              <Sparkles className="w-6 h-6 text-[#FFD13B] mx-auto mb-2" />
              <p className="font-hand font-bold text-base">Studio in attesa di analisi</p>
              <p className="text-xs opacity-75 mt-1 max-w-sm mx-auto">
                Esegui l'analisi con Gemini per scoprire la città, lo stile visivo e i tag settoriali.
              </p>
            </div>
          )}

          {/* Personal Notebook Notes & Rating Section */}
          <div className={`p-4 rounded-xl border-2 space-y-3 shadow-doodle-sm ${subBoxBg}`}>
            <div className="flex items-center justify-between">
              <span className="font-hand font-bold text-base">
                Appunti Personali & Valutazione (★)
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star === rating ? 0 : star)}
                    className="p-0.5 opacity-40 hover:opacity-100 hover:text-[#FFB703] transition cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating
                          ? "text-[#FFB703] fill-[#FFB703] opacity-100"
                          : ""
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Scrivi qui le tue note sul progetto, referenze, contatti o idee visive..."
              rows={3}
              className={`w-full p-3 rounded-lg border text-xs font-hand sm:text-sm focus:outline-none ${inputBg}`}
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] opacity-75 font-hand">
                {savedSuccess ? "✓ Note salvate con successo!" : "Salvataggio locale automatico nel taccuino"}
              </span>
              <button
                onClick={handleSaveNotes}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-hand font-bold text-sm bg-[#FFD13B] hover:bg-[#FFC01E] text-[#1C1A17] border-2 border-[#1C1A17] shadow-doodle-sm btn-doodle cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salva Appunti</span>
              </button>
            </div>
          </div>

          {/* Quick Management Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-current opacity-30">
            <div className="flex items-center gap-2 opacity-100">
              {profile.isAnalyzed && (
                <button
                  onClick={() => {
                    onResetProfileAnalysis(profile.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-hand font-bold text-[#FF7844] hover:bg-black/10 border border-current transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Rianalizza</span>
                </button>
              )}

              {profile.aiAnalysis?.category !== "Persona Privata / Amico" && (
                <button
                  onClick={() => {
                    onMarkAsPrivate(profile.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-hand font-bold opacity-75 hover:opacity-100 hover:text-[#E63946] hover:bg-black/10 border border-current transition cursor-pointer"
                >
                  <UserX className="w-3 h-3" />
                  <span>Segna Privato/Amico</span>
                </button>
              )}
            </div>

            <button
              onClick={() => {
                if (confirm(`Rimuovere @${profile.username} dal taccuino?`)) {
                  onDelete(profile.id);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-hand font-bold text-[#E63946] hover:bg-[#FEE2E2] border border-[#E63946] transition cursor-pointer opacity-100"
            >
              <Trash2 className="w-3 h-3" />
              <span>Elimina</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
