import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  Sparkles,
  Star,
  Globe,
  MapPin,
  Save,
  Trash2,
  RotateCcw,
  UserX,
  Check,
  Briefcase,
  Layers,
  Edit3,
  Building,
  GraduationCap,
  Camera,
  Palette,
  Brush,
  Video,
  Users,
} from "lucide-react";
import { InstagramProfile, MacroEntity, WorkSpaceMode, AIStudioAnalysis } from "../types";
import {
  STUDIO_SUBTYPES,
  AZIENDA_SUBTYPES,
  WORK_MODE_CONFIG,
  classifyMacroEntity,
  classifyEntityKind,
  classifyEntitySubType,
} from "../utils/entityClassifier";
import { SmartTagInput } from "./SmartTagInput";

interface StudioDetailModalProps {
  profile: InstagramProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updated: InstagramProfile) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onResetProfileAnalysis: (id: string) => void;
  allNotebookTags: string[];
  theme?: 'light' | 'dark';
}

export const StudioDetailModal: React.FC<StudioDetailModalProps> = ({
  profile,
  isOpen,
  onClose,
  onUpdateProfile,
  onToggleFavorite,
  onDelete,
  onResetProfileAnalysis,
  allNotebookTags,
  theme = 'light',
}) => {
  if (!isOpen || !profile) return null;

  const currentAi = profile.aiAnalysis;

  // Form State for manual editing of all analysis fields
  const [displayName, setDisplayName] = useState(
    currentAi?.displayName || profile.displayName || profile.username
  );
  const [macroEntity, setMacroEntity] = useState<MacroEntity>(
    currentAi?.macroEntity || classifyMacroEntity(profile)
  );
  const [isPrivatePerson, setIsPrivatePerson] = useState<boolean>(
    profile.isPrivatePerson ?? currentAi?.isPrivatePerson ?? false
  );
  const [subType, setSubType] = useState<string>(
    currentAi?.subType || classifyEntitySubType(profile)
  );
  const [workMode, setWorkMode] = useState<WorkSpaceMode>(
    currentAi?.workMode || "in_sede"
  );
  const [locationCity, setLocationCity] = useState(currentAi?.locationCity || "");
  const [locationRegion, setLocationRegion] = useState(currentAi?.locationRegion || "");
  const [locationCountry, setLocationCountry] = useState(currentAi?.locationCountry || "");
  const [locationStreet, setLocationStreet] = useState(currentAi?.locationStreet || "");
  const [website, setWebsite] = useState(currentAi?.website || "");
  const [visualStyle, setVisualStyle] = useState(currentAi?.visualStyle || "");
  const [description, setDescription] = useState(currentAi?.description || "");
  const [notes, setNotes] = useState(profile.notes || "");
  const [rating, setRating] = useState(profile.rating || 0);

  // Tag arrays
  const [subCategories, setSubCategories] = useState<string[]>(
    currentAi?.subCategories || []
  );
  const [designTags, setDesignTags] = useState<string[]>(
    currentAi?.designTags || []
  );
  const [keySpecialties, setKeySpecialties] = useState<string[]>(
    currentAi?.keySpecialties || []
  );

  const [isEditingFull, setIsEditingFull] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if profile changes
  useEffect(() => {
    if (profile) {
      const ai = profile.aiAnalysis;
      setDisplayName(ai?.displayName || profile.displayName || profile.username);
      setMacroEntity(ai?.macroEntity || classifyMacroEntity(profile));
      setIsPrivatePerson(profile.isPrivatePerson ?? ai?.isPrivatePerson ?? false);
      setSubType(ai?.subType || classifyEntitySubType(profile));
      setWorkMode(ai?.workMode || "in_sede");
      setLocationCity(ai?.locationCity || "");
      setLocationRegion(ai?.locationRegion || "");
      setLocationCountry(ai?.locationCountry || "");
      setLocationStreet(ai?.locationStreet || "");
      setWebsite(ai?.website || "");
      setVisualStyle(ai?.visualStyle || "");
      setDescription(ai?.description || "");
      setNotes(profile.notes || "");
      setRating(profile.rating || 0);
      setSubCategories(ai?.subCategories || []);
      setDesignTags(ai?.designTags || []);
      setKeySpecialties(ai?.keySpecialties || []);
      setIsEditingFull(false);
    }
  }, [profile]);

  const handleSave = () => {
    const updatedAi: AIStudioAnalysis = {
      displayName,
      category:
        macroEntity === "azienda"
          ? "Brand / Azienda Design"
          : macroEntity === "universita"
          ? "Istituzione / Università / Scuola"
          : macroEntity === "fotografia"
          ? "Fotografia"
          : macroEntity === "illustrazione"
          ? "Illustrazione & Arti Visive"
          : macroEntity === "artisti"
          ? "Arte Contemporanea & Scultura"
          : macroEntity === "creator"
          ? "Content Creator / Influencer"
          : macroEntity === "amici" || isPrivatePerson
          ? "Persona Privata / Amico"
          : "Studio di Design & Architettura",
      entityKind: macroEntity === "azienda" ? "azienda" : macroEntity === "studio" ? "studio" : "altro",
      macroEntity,
      subType,
      studioType: subType,
      locationCity,
      locationRegion,
      locationCountry,
      locationStreet,
      countryCode: currentAi?.countryCode || (locationCountry.toLowerCase() === "italia" ? "IT" : ""),
      visualStyle,
      description,
      website,
      keySpecialties,
      designTags,
      subCategories,
      workMode,
      isPrivatePerson,
      analyzedAt: currentAi?.analyzedAt || new Date().toISOString(),
      mapsLinks: currentAi?.mapsLinks || [],
    };

    const updatedProfile: InstagramProfile = {
      ...profile,
      displayName,
      notes,
      rating,
      isPrivatePerson,
      isAnalyzed: true,
      aiAnalysis: updatedAi,
    };

    onUpdateProfile(updatedProfile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const modalBg = theme === 'dark' ? 'bg-[#22201D] text-[#F7F4EB] border-[#38332E]' : 'bg-[#FFFDF9] text-[#1C1A17] border-[#1C1A17]';
  const headerBg = theme === 'dark' ? 'bg-[#2C2A26] border-[#38332E]' : 'bg-[#F7F4EB] border-[#1C1A17]';
  const subBoxBg = theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#FFFDF7] border-[#1C1A17]';
  const inputBg = theme === 'dark' ? 'bg-[#181716] text-[#F7F4EB] border-[#38332E]' : 'bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17]';

  const MACRO_OPTIONS: { id: MacroEntity; label: string; icon: string }[] = [
    { id: "studio", label: "Studio di Design / Architettura", icon: "📐" },
    { id: "azienda", label: "Azienda / Brand di Prodotto", icon: "🏢" },
    { id: "universita", label: "Università / Istituzione", icon: "🎓" },
    { id: "fotografia", label: "Fotografia", icon: "📷" },
    { id: "illustrazione", label: "Illustrazione", icon: "🎨" },
    { id: "artisti", label: "Artista / Scultore", icon: "🖌️" },
    { id: "creator", label: "Content Creator / Media", icon: "📹" },
    { id: "amici", label: "Amico Designer", icon: "👥" },
    { id: "privato", label: "Persona Privata (Non studio)", icon: "👤" },
    { id: "altro", label: "Altro", icon: "✨" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div className={`${modalBg} rounded-2xl shadow-doodle-lg border-2 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] relative transition-colors`}>
        {/* Washi tape on modal top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-28 washi-tape-yellow rounded-xs -rotate-1 pointer-events-none z-20" />

        {/* Modal Header */}
        <div className={`px-5 py-4 border-b-2 flex items-start justify-between ${headerBg}`}>
          <div className="flex-1 mr-3">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-typewriter text-xs opacity-75">@{profile.username}</span>
              
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-hand font-bold bg-[#FFD13B] text-[#1C1A17] border border-[#1C1A17]">
                {MACRO_OPTIONS.find((m) => m.id === macroEntity)?.label || macroEntity}
              </span>

              {isPrivatePerson && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-hand font-bold bg-[#E63946] text-white">
                  🚫 Persona Privata / Amico
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight">
                {displayName}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditingFull(!isEditingFull)}
                className="p-1 rounded-lg hover:bg-black/10 transition cursor-pointer text-[#3A86FF]"
                title="Modifica manuale campi"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(profile.id)}
              className="p-1.5 opacity-60 hover:opacity-100 hover:text-[#FFB703] transition cursor-pointer"
              title={profile.isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
            >
              <Star
                className={`w-6 h-6 transition-transform hover:scale-125 ${
                  profile.isFavorite ? "text-[#FFB703] fill-[#FFB703] opacity-100" : ""
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Quick Links Bar */}
          <div className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border ${theme === 'dark' ? 'bg-[#2C2A26] border-[#38332E]' : 'bg-[#FFF9E6] border-[#1C1A17]'}`}>
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

              {website && (
                <a
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-hand font-bold text-sm text-[#3A86FF] hover:underline"
                >
                  <Globe className="w-3.5 h-3.5 text-[#3A86FF]" />
                  <span className="font-typewriter text-xs">{website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
            </div>

            {(locationCity || locationCountry) && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${displayName} ${locationCity} ${locationCountry}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 font-typewriter text-xs px-2.5 py-1 rounded-lg border shadow-xs ${theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#FFF] border-[#1C1A17]'}`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
                <span>
                  {locationCity ? `${locationCity}, ` : ""}
                  {locationRegion ? `${locationRegion}, ` : ""}
                  <strong>{locationCountry}</strong>
                </span>
              </a>
            )}
          </div>

          {/* Section 1: Classification & Macro Entity (Full manual edit) */}
          <div className={`p-4 rounded-xl border-2 space-y-3 shadow-doodle-sm ${subBoxBg}`}>
            <div className="flex items-center justify-between">
              <span className="font-hand font-bold text-sm flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#3A86FF]" />
                <span>Classificazione & Tipologia</span>
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer font-hand text-xs">
                <input
                  type="checkbox"
                  checked={isPrivatePerson}
                  onChange={(e) => setIsPrivatePerson(e.target.checked)}
                  className="rounded text-[#E63946] focus:ring-0"
                />
                <span className={isPrivatePerson ? "text-[#E63946] font-bold" : "opacity-75"}>
                  Segna come Privato / Amico
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-hand font-bold opacity-80 mb-1">
                  Macro Entità:
                </label>
                <select
                  value={macroEntity}
                  onChange={(e) => setMacroEntity(e.target.value as MacroEntity)}
                  className={`w-full p-2 rounded-xl border text-xs font-hand font-bold focus:outline-none cursor-pointer ${inputBg}`}
                >
                  {MACRO_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-hand font-bold opacity-80 mb-1">
                  Tipo Specifico / Settore:
                </label>
                <input
                  type="text"
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                  placeholder="es. Studio di Design & Branding, Brand di Arredo..."
                  className={`w-full p-2 rounded-xl border text-xs font-hand focus:outline-none ${inputBg}`}
                />
              </div>
            </div>

            {/* Geographical details & Space/Work Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-hand font-bold opacity-80 mb-1">
                  Città:
                </label>
                <input
                  type="text"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  placeholder="es. Milano, Rotterdam, Londra..."
                  className={`w-full p-2 rounded-xl border text-xs font-typewriter focus:outline-none ${inputBg}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-hand font-bold opacity-80 mb-1">
                  Regione / Stato:
                </label>
                <input
                  type="text"
                  value={locationRegion}
                  onChange={(e) => setLocationRegion(e.target.value)}
                  placeholder="es. Lombardia, Piemonte, Lazio..."
                  className={`w-full p-2 rounded-xl border text-xs font-typewriter focus:outline-none ${inputBg}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-hand font-bold opacity-80 mb-1">
                  Spazio & Modalità:
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as WorkSpaceMode)}
                  className={`w-full p-2 rounded-xl border text-xs font-hand font-bold focus:outline-none cursor-pointer ${inputBg}`}
                >
                  {Object.entries(WORK_MODE_CONFIG).map(([k, cfg]) => (
                    <option key={k} value={k}>
                      {cfg.icon} {cfg.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Cascading Taxonomy Sub-Categories with SMART Autocomplete */}
          <div className={`p-4 rounded-xl border-2 space-y-2.5 shadow-doodle-sm ${subBoxBg}`}>
            <div className="flex items-center justify-between">
              <span className="font-hand font-bold text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#FFBE0B]" />
                <span>Macro & Sotto-Categorie Settoriali (Tassonomia)</span>
              </span>
              <span className="text-[10px] font-typewriter opacity-60">
                es. Interni/Ufficio, Cucina, Maniglie, Musica...
              </span>
            </div>

            <SmartTagInput
              tags={subCategories}
              onChange={setSubCategories}
              allAvailableTags={allNotebookTags}
              placeholder="Digita per aggiungere (consiglia tag già presenti nel taccuino)..."
              theme={theme}
              badgeColor="bg-[#3A86FF]/15 text-[#3A86FF] border-[#3A86FF]"
            />
          </div>

          {/* Section 3: Tag Visivi & Settoriali */}
          <div className={`p-4 rounded-xl border-2 space-y-2.5 shadow-doodle-sm ${subBoxBg}`}>
            <div className="flex items-center justify-between">
              <span className="font-hand font-bold text-sm flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-[#8338EC]" />
                <span>Tag Visivi, Discipline & Specialità</span>
              </span>
            </div>

            <SmartTagInput
              tags={designTags}
              onChange={setDesignTags}
              allAvailableTags={allNotebookTags}
              placeholder="Aggiungi disciplina o tag visivo (es. Light Design, Packaging, Editorial)..."
              theme={theme}
              badgeColor="bg-[#8338EC]/15 text-[#8338EC] border-[#8338EC]"
            />
          </div>

          {/* Section 4: Visual Style, Description & Website (Editable) */}
          <div className={`p-4 rounded-xl border-2 space-y-3 shadow-doodle-sm ${subBoxBg}`}>
            <div>
              <label className="block text-[11px] font-hand font-bold opacity-80 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FFBE0B]" />
                <span>Stile Visivo, Linguaggio & Ricerca Estetica:</span>
              </label>
              <textarea
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                rows={2}
                placeholder="Descrivi l'estetica, colori, materiali, approccio visivo..."
                className={`w-full p-2.5 rounded-xl border text-xs font-sans leading-relaxed focus:outline-none ${inputBg}`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-hand font-bold opacity-80 mb-1">
                Sintesi e Descrizione Attività:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Breve sintesi dell'attività o del profilo..."
                className={`w-full p-2.5 rounded-xl border text-xs font-sans leading-relaxed focus:outline-none ${inputBg}`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-hand font-bold opacity-80 mb-1">
                  Sito Web Ufficiale:
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="es. studio.com"
                  className={`w-full p-2 rounded-xl border text-xs font-typewriter focus:outline-none ${inputBg}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-hand font-bold opacity-80 mb-1">
                  Paese:
                </label>
                <input
                  type="text"
                  value={locationCountry}
                  onChange={(e) => setLocationCountry(e.target.value)}
                  placeholder="es. Italia, Danimarca, Svizzera..."
                  className={`w-full p-2 rounded-xl border text-xs font-sans focus:outline-none ${inputBg}`}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Personal Notebook Notes & Rating */}
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
                        star <= rating ? "text-[#FFB703] fill-[#FFB703] opacity-100" : ""
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Scrivi qui le tue note sul progetto, referenze, contatti personali..."
              rows={3}
              className={`w-full p-3 rounded-lg border text-xs font-hand sm:text-sm focus:outline-none ${inputBg}`}
            />
          </div>

          {/* Save Bar */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] opacity-75 font-hand">
              {savedSuccess ? "✓ Modifiche salvate con successo!" : "Tutti i campi modificati saranno salvati nel taccuino locale"}
            </span>

            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-hand font-bold text-sm bg-[#FFD13B] hover:bg-[#FFC01E] text-[#1C1A17] border-2 border-[#1C1A17] shadow-doodle-sm btn-doodle cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salva Tutte le Modifiche</span>
            </button>
          </div>

          {/* Management Actions */}
          <div className={`pt-3 flex items-center justify-between border-t-2 ${theme === 'dark' ? 'border-[#38332E]' : 'border-[#E5DFD2]'}`}>
            <div className="flex items-center gap-2">
              {profile.isAnalyzed && (
                <button
                  onClick={() => {
                    onResetProfileAnalysis(profile.id);
                    onClose();
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-hand font-bold border-2 transition cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#2C2A26] border-[#E5DFD2] text-[#FF7844] hover:bg-[#38332E]'
                      : 'bg-[#FFF9E6] border-[#1C1A17] text-[#FF7844] hover:bg-[#FFF3C4]'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rianalizza Tratti</span>
                </button>
              )}
            </div>

            <button
              onClick={() => {
                onDelete(profile.id);
                onClose();
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-hand font-bold border-2 transition cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#2C2A26] border-[#E5DFD2] text-[#FF6B6B] hover:bg-[#38332E]'
                  : 'bg-[#FEE2E2] border-[#E63946] text-[#E63946] hover:bg-[#FCD3D3]'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Elimina</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
