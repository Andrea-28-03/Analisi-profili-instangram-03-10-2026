import React, { useState, useEffect, useMemo } from "react";
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
  Copy,
  FileJson,
  Plus,
  UserPlus,
  Mail,
  Phone,
  Handshake,
  AtSign,
} from "lucide-react";
import {
  InstagramProfile,
  MacroEntity,
  WorkSpaceMode,
  AIStudioAnalysis,
  CollaborationRelationType,
  InternalTaggedContact,
  ContactCollaborationInfo,
} from "../types";
import {
  STUDIO_SUBTYPES,
  AZIENDA_SUBTYPES,
  WORK_MODE_CONFIG,
  COLLABORATION_RELATION_CONFIG,
  classifyMacroEntity,
  classifyEntityKind,
  classifyEntitySubType,
} from "../utils/entityClassifier";
import {
  MACRO_CATEGORY_CONFIG,
  getSuggestedTagsForMacro,
} from "../utils/categoryTaxonomyMap";
import { SmartTagInput } from "./SmartTagInput";
import { copyToClipboard } from "../utils/clipboard";

interface StudioDetailModalProps {
  profile: InstagramProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updated: InstagramProfile) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onResetProfileAnalysis: (id: string) => void;
  allNotebookTags: string[];
  allProfiles?: InstagramProfile[];
  onSelectProfileById?: (profile: InstagramProfile) => void;
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
  allProfiles = [],
  onSelectProfileById,
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
    classifyEntitySubType(profile)
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

  // Contact & Collaborations State
  const [contactRelations, setContactRelations] = useState<CollaborationRelationType[]>(
    profile.contactInfo?.relations || []
  );
  const [taggedPeople, setTaggedPeople] = useState<InternalTaggedContact[]>(
    profile.contactInfo?.taggedPeople || []
  );
  const [collaborationNotes, setCollaborationNotes] = useState<string>(
    profile.contactInfo?.collaborationNotes || ""
  );
  const [directEmail, setDirectEmail] = useState<string>(
    profile.contactInfo?.directEmail || ""
  );
  const [phoneOrWhatsapp, setPhoneOrWhatsapp] = useState<string>(
    profile.contactInfo?.phoneOrWhatsapp || ""
  );

  // New internal person form state
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonRole, setNewPersonRole] = useState("");
  const [newPersonHandle, setNewPersonHandle] = useState("");
  const [newPersonNote, setNewPersonNote] = useState("");
  const [newPersonLinkedId, setNewPersonLinkedId] = useState<string | undefined>(undefined);
  const [showPersonSuggestions, setShowPersonSuggestions] = useState(false);

  const [isEditingFull, setIsEditingFull] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldName: string) => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2200);
    }
  };

  // Sync state if profile changes
  useEffect(() => {
    if (profile) {
      const ai = profile.aiAnalysis;
      setDisplayName(ai?.displayName || profile.displayName || profile.username);
      setMacroEntity(ai?.macroEntity || classifyMacroEntity(profile));
      setIsPrivatePerson(profile.isPrivatePerson ?? ai?.isPrivatePerson ?? false);
      setSubType(classifyEntitySubType(profile));
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
      setContactRelations(profile.contactInfo?.relations || []);
      setTaggedPeople(profile.contactInfo?.taggedPeople || []);
      setCollaborationNotes(profile.contactInfo?.collaborationNotes || "");
      setDirectEmail(profile.contactInfo?.directEmail || "");
      setPhoneOrWhatsapp(profile.contactInfo?.phoneOrWhatsapp || "");
      setNewPersonName("");
      setNewPersonRole("");
      setNewPersonHandle("");
      setNewPersonNote("");
      setNewPersonLinkedId(undefined);
      setIsEditingFull(false);
    }
  }, [profile]);

  // Autocomplete matching profiles in notebook when typing a person's name or @username
  const matchingNotebookProfiles = useMemo(() => {
    const query = (newPersonName || newPersonHandle).toLowerCase().replace(/^@/, "").trim();
    if (!query || query.length < 2) return [];
    return allProfiles
      .filter((p) => {
        if (p.id === profile.id) return false;
        const pName = (p.aiAnalysis?.displayName || p.displayName || "").toLowerCase();
        const pUser = p.username.toLowerCase();
        return pName.includes(query) || pUser.includes(query);
      })
      .slice(0, 6);
  }, [newPersonName, newPersonHandle, allProfiles, profile.id]);

  // Dynamic suggested tags that adapt automatically when macroEntity changes
  const categorySuggestedTags = useMemo(() => {
    return getSuggestedTagsForMacro(macroEntity);
  }, [macroEntity]);

  // Prioritize tags relevant to the currently selected category in the autocomplete pool
  const categorySpecificTags = useMemo(() => {
    const config = MACRO_CATEGORY_CONFIG[macroEntity];
    const suggested = config?.suggestedTags || [];
    return Array.from(new Set([...suggested, ...allNotebookTags]));
  }, [macroEntity, allNotebookTags]);

  const buildUpdatedProfile = (
    overrideContact?: Partial<ContactCollaborationInfo>
  ): InstagramProfile => {
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
      webSources: currentAi?.webSources,
      isPartialWebData: currentAi?.isPartialWebData,
    };

    const updatedContactInfo: ContactCollaborationInfo = {
      relations: overrideContact?.relations ?? contactRelations,
      taggedPeople: overrideContact?.taggedPeople ?? taggedPeople,
      collaborationNotes: overrideContact?.collaborationNotes ?? collaborationNotes,
      directEmail: overrideContact?.directEmail ?? directEmail,
      phoneOrWhatsapp: overrideContact?.phoneOrWhatsapp ?? phoneOrWhatsapp,
      lastContactDate: new Date().toISOString(),
    };

    return {
      ...profile,
      displayName,
      notes,
      rating,
      isPrivatePerson,
      isAnalyzed: true,
      aiAnalysis: updatedAi,
      contactInfo: updatedContactInfo,
    };
  };

  const handleSave = () => {
    const updatedProfile = buildUpdatedProfile();
    onUpdateProfile(updatedProfile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleToggleRelation = (rel: CollaborationRelationType) => {
    const next = contactRelations.includes(rel)
      ? contactRelations.filter((r) => r !== rel)
      : [...contactRelations, rel];
    setContactRelations(next);
    // Immediately persist so clicking a badge feels instant
    onUpdateProfile(buildUpdatedProfile({ relations: next }));
  };

  const handleAddTaggedPerson = () => {
    const cleanName = newPersonName.trim() || newPersonHandle.trim();
    if (!cleanName) return;

    const newContact: InternalTaggedContact = {
      id: `person_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      role: newPersonRole.trim() || undefined,
      handleOrEmail: newPersonHandle.trim() || undefined,
      linkedProfileId: newPersonLinkedId,
      note: newPersonNote.trim() || undefined,
    };

    const nextPeople = [...taggedPeople, newContact];
    // Automatically enable "spoken_contact" if not already set and user tags a person inside
    const nextRelations =
      contactRelations.length === 0
        ? (["spoken_contact"] as CollaborationRelationType[])
        : contactRelations;

    setTaggedPeople(nextPeople);
    if (contactRelations.length === 0) {
      setContactRelations(nextRelations);
    }

    setNewPersonName("");
    setNewPersonRole("");
    setNewPersonHandle("");
    setNewPersonNote("");
    setNewPersonLinkedId(undefined);
    setShowPersonSuggestions(false);

    onUpdateProfile(
      buildUpdatedProfile({
        taggedPeople: nextPeople,
        relations: nextRelations,
      })
    );
  };

  const handleRemoveTaggedPerson = (personId: string) => {
    const nextPeople = taggedPeople.filter((p) => p.id !== personId);
    setTaggedPeople(nextPeople);
    onUpdateProfile(buildUpdatedProfile({ taggedPeople: nextPeople }));
  };

  const isDark = theme === 'dark';
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
              <div className="inline-flex items-center gap-1">
                <span className="font-typewriter text-xs opacity-75">@{profile.username}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(`@${profile.username}`, 'username')}
                  className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-black/10 transition cursor-pointer"
                  title={copiedField === 'username' ? 'Copiato!' : 'Copia @username'}
                >
                  {copiedField === 'username' ? (
                    <Check className="w-3 h-3 text-[#38B000]" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              
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
            <div className="flex items-center gap-4 flex-wrap">
              <div className="inline-flex items-center gap-1.5">
                <a
                  href={profile.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-hand font-bold text-sm text-[#FF5E8E] hover:underline"
                >
                  <span>Instagram Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(profile.profileUrl, 'instagram')}
                  className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-black/10 transition cursor-pointer"
                  title={copiedField === 'instagram' ? 'Link copiato!' : 'Copia link Instagram'}
                >
                  {copiedField === 'instagram' ? (
                    <Check className="w-3 h-3 text-[#38B000]" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              {website && (
                <div className="inline-flex items-center gap-1.5">
                  <a
                    href={website.startsWith("http") ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-hand font-bold text-sm text-[#3A86FF] hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#3A86FF]" />
                    <span className="font-typewriter text-xs">{website.replace(/^https?:\/\//, "")}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(website, 'website')}
                    className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-black/10 transition cursor-pointer"
                    title={copiedField === 'website' ? 'URL copiato!' : 'Copia link sito'}
                  >
                    {copiedField === 'website' ? (
                      <Check className="w-3 h-3 text-[#38B000]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleCopy(JSON.stringify(profile, null, 2), 'json')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-current/20 hover:bg-black/5 font-hand font-bold text-xs cursor-pointer transition shrink-0"
                title="Copia dati del profilo in formato JSON"
              >
                {copiedField === 'json' ? (
                  <>
                    <Check className="w-3 h-3 text-[#38B000]" />
                    <span className="text-[#38B000]">JSON Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copia JSON</span>
                  </>
                )}
              </button>

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
              allAvailableTags={categorySpecificTags}
              placeholder="Digita per aggiungere (consiglia tag già presenti nel taccuino)..."
              theme={theme}
              badgeColor="bg-[#3A86FF]/15 text-[#3A86FF] border-[#3A86FF]"
            />

            {/* Quick-add chips dynamically adapted to the active category (e.g. Studi, Aziende, Università...) */}
            {categorySuggestedTags.length > 0 && (
              <div className="pt-2 border-t border-current/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1 text-[11px] font-hand font-bold opacity-80">
                    <Sparkles className="w-3 h-3 text-[#FFBE0B]" />
                    <span>Tag consigliati per {MACRO_CATEGORY_CONFIG[macroEntity]?.singularLabel || macroEntity}:</span>
                  </span>
                  <span className="text-[10px] font-typewriter opacity-60">1-click per aggiungere</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {categorySuggestedTags.map((st) => {
                    const isAlreadyAdded = subCategories.includes(st) || designTags.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          if (isAlreadyAdded) {
                            setSubCategories(subCategories.filter((t) => t !== st));
                          } else {
                            setSubCategories([...subCategories, st]);
                          }
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-hand font-bold border transition cursor-pointer flex items-center gap-1 ${
                          isAlreadyAdded
                            ? isDark
                              ? "bg-[#3A86FF] text-white border-[#3A86FF]"
                              : "bg-[#3A86FF] text-white border-[#3A86FF]"
                            : isDark
                            ? "bg-[#181716] text-[#D6D3D1] border-[#44403C] hover:border-[#FFD13B] hover:text-[#FFD13B]"
                            : "bg-white text-[#1C1A17] border-[#1C1A17]/30 hover:border-[#1C1A17] hover:bg-[#FFF4D9]"
                        }`}
                        title={isAlreadyAdded ? `Rimuovi "${st}"` : `Aggiungi "${st}"`}
                      >
                        {isAlreadyAdded ? (
                          <Check className="w-2.5 h-2.5" />
                        ) : (
                          <Plus className="w-2.5 h-2.5 opacity-60" />
                        )}
                        <span>{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
              allAvailableTags={categorySpecificTags}
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

            {/* Real-time Web Intelligence Sources */}
            {profile.aiAnalysis?.webSources && profile.aiAnalysis.webSources.length > 0 && (
              <div className="pt-2.5 mt-2 border-t border-current/10 flex items-center justify-between gap-2 flex-wrap text-[11px] font-typewriter">
                <span className="flex items-center gap-1.5 opacity-85">
                  <Globe className="w-3.5 h-3.5 text-[#3A86FF]" />
                  <span>Fonti web verificate: {profile.aiAnalysis.webSources.join(' · ')}</span>
                </span>
                {profile.aiAnalysis?.isPartialWebData && (
                  <span className="text-[10px] opacity-70 italic">
                    (Dati parziali integrati con AI)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Section 5: CONTATTI, COLLABORAZIONI & PERSONE INTERNE */}
          <div className={`p-4 rounded-xl border-2 space-y-3.5 shadow-doodle-sm ${subBoxBg}`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-hand font-bold text-base flex items-center gap-2">
                <Handshake className="w-4 h-4 text-[#38B000]" />
                <span>Contatti, Collaborazioni & Persone all'Interno</span>
              </span>
              <span className="text-[10px] font-typewriter opacity-65">
                Traccia lavori svolti, contatti diretti e chi conosci dentro
              </span>
            </div>

            {/* 1. Multi-select Relationship Status Pills */}
            <div>
              <label className="block text-[11px] font-hand font-bold opacity-80 mb-1.5">
                Che rapporto o contatto hai con questa realtà? (clicca per attivare/disattivare):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(COLLABORATION_RELATION_CONFIG) as [
                  CollaborationRelationType,
                  typeof COLLABORATION_RELATION_CONFIG[CollaborationRelationType]
                ][]).map(([relKey, cfg]) => {
                  const isActive = contactRelations.includes(relKey);
                  return (
                    <button
                      key={relKey}
                      type="button"
                      onClick={() => handleToggleRelation(relKey)}
                      title={cfg.description}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-hand font-bold border-2 transition cursor-pointer ${
                        isActive
                          ? `${cfg.badgeClass} shadow-xs scale-102`
                          : isDark
                          ? "bg-[#22201D] text-[#A8A29E] border-[#38332E] hover:border-[#F7F4EB] hover:text-[#F7F4EB]"
                          : "bg-white text-[#6B635B] border-[#D6CEBF] hover:border-[#1C1A17] hover:text-[#1C1A17]"
                      }`}
                    >
                      <span>{cfg.icon}</span>
                      <span>{cfg.label}</span>
                      {isActive && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Tagged People Inside the Organization */}
            <div className={`p-3 rounded-xl border space-y-2.5 ${isDark ? 'bg-[#22201D] border-[#38332E]' : 'bg-[#FAF7F0] border-[#E5DFD2]'}`}>
              <div className="flex items-center justify-between">
                <span className="font-hand font-bold text-xs flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#3A86FF]" />
                  <span>Persone di riferimento / Conoscenti all'interno ({taggedPeople.length})</span>
                </span>
                <span className="text-[10px] font-typewriter opacity-60">
                  Tagga chi lavora o studia qui
                </span>
              </div>

              {/* Existing tagged people list */}
              {taggedPeople.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {taggedPeople.map((person) => {
                    const linkedProf = person.linkedProfileId
                      ? allProfiles.find((p) => p.id === person.linkedProfileId)
                      : person.handleOrEmail
                      ? allProfiles.find(
                          (p) =>
                            p.username.toLowerCase() ===
                            person.handleOrEmail!.replace(/^@/, "").toLowerCase()
                        )
                      : undefined;

                    return (
                      <div
                        key={person.id}
                        className={`p-2.5 rounded-xl border flex items-start justify-between gap-2 ${
                          isDark ? "bg-[#181716] border-[#44403C]" : "bg-white border-[#1C1A17]"
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-sans font-bold text-xs truncate">
                              👤 {person.name}
                            </span>
                            {person.role && (
                              <span className="px-1.5 py-0.2 rounded bg-[#3A86FF]/15 text-[#3A86FF] font-hand font-bold text-[10px]">
                                {person.role}
                              </span>
                            )}
                          </div>
                          {person.handleOrEmail && (
                            <div className="flex items-center gap-1.5 text-[11px] font-typewriter opacity-80">
                              <span>{person.handleOrEmail}</span>
                              {linkedProf && onSelectProfileById && (
                                <button
                                  type="button"
                                  onClick={() => onSelectProfileById(linkedProf)}
                                  className="text-[10px] font-hand font-bold text-[#FF5E8E] hover:underline cursor-pointer"
                                  title="Apri scheda profilo nel taccuino"
                                >
                                  (Apri scheda ↗)
                                </button>
                              )}
                            </div>
                          )}
                          {person.note && (
                            <p className="text-[11px] opacity-75 italic leading-snug pt-0.5">
                              "{person.note}"
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTaggedPerson(person.id)}
                          className="p-1 opacity-50 hover:opacity-100 hover:text-[#E63946] transition cursor-pointer shrink-0"
                          title="Rimuovi persona"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add new person form with notebook autocomplete */}
              <div className="pt-1 space-y-2 relative">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={newPersonName}
                      onFocus={() => setShowPersonSuggestions(true)}
                      onChange={(e) => {
                        setNewPersonName(e.target.value);
                        setShowPersonSuggestions(true);
                      }}
                      placeholder="Nome o @account..."
                      className={`w-full p-2 rounded-lg border text-xs font-sans focus:outline-none ${inputBg}`}
                    />
                  </div>
                  <input
                    type="text"
                    value={newPersonRole}
                    onChange={(e) => setNewPersonRole(e.target.value)}
                    placeholder="Ruolo (es. Art Director, Docente)..."
                    className={`w-full p-2 rounded-lg border text-xs font-sans focus:outline-none ${inputBg}`}
                  />
                  <input
                    type="text"
                    value={newPersonHandle}
                    onFocus={() => setShowPersonSuggestions(true)}
                    onChange={(e) => {
                      setNewPersonHandle(e.target.value);
                      setShowPersonSuggestions(true);
                    }}
                    placeholder="@instagram o email..."
                    className={`w-full p-2 rounded-lg border text-xs font-typewriter focus:outline-none ${inputBg}`}
                  />
                </div>

                {/* Live Autocomplete from Notebook Profiles */}
                {showPersonSuggestions && matchingNotebookProfiles.length > 0 && (
                  <div
                    className={`p-2 rounded-xl border-2 space-y-1 shadow-lg ${
                      isDark ? "bg-[#181716] border-[#FFD13B]" : "bg-[#FFFDF7] border-[#1C1A17]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-hand font-bold opacity-75 px-1">
                      <span>Profili nel taccuino collegabili:</span>
                      <button
                        type="button"
                        onClick={() => setShowPersonSuggestions(false)}
                        className="hover:underline cursor-pointer"
                      >
                        Chiudi
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {matchingNotebookProfiles.map((mp) => (
                        <button
                          key={mp.id}
                          type="button"
                          onClick={() => {
                            setNewPersonName(mp.aiAnalysis?.displayName || mp.displayName || mp.username);
                            setNewPersonHandle(`@${mp.username}`);
                            setNewPersonLinkedId(mp.id);
                            setShowPersonSuggestions(false);
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-hand font-bold border transition cursor-pointer ${
                            isDark
                              ? "bg-[#25221E] border-[#44403C] hover:border-[#FFD13B] text-[#F7F4EB]"
                              : "bg-[#FFF9E6] border-[#1C1A17] hover:bg-[#FFD13B] text-[#1C1A17]"
                          }`}
                        >
                          <span>👤 {mp.aiAnalysis?.displayName || mp.displayName || mp.username}</span>
                          <span className="font-typewriter text-[10px] opacity-70">@{mp.username}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPersonNote}
                    onChange={(e) => setNewPersonNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTaggedPerson();
                      }
                    }}
                    placeholder="Nota (es. Conosciuto al workshop, mandato portfolio)..."
                    className={`flex-1 p-2 rounded-lg border text-xs font-sans focus:outline-none ${inputBg}`}
                  />
                  <button
                    type="button"
                    onClick={handleAddTaggedPerson}
                    disabled={!newPersonName.trim() && !newPersonHandle.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-hand font-bold bg-[#38B000] text-white border border-[#1C1A17] hover:bg-[#2E9300] disabled:opacity-40 transition cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Tagga Persona</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Direct Contact Details & Collaboration History Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-hand font-bold opacity-80 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#3A86FF]" />
                  <span>Email Diretta / HR / Contatto:</span>
                </label>
                <input
                  type="text"
                  value={directEmail}
                  onChange={(e) => setDirectEmail(e.target.value)}
                  placeholder="es. jobs@studio.it, nome@azienda.com..."
                  className={`w-full p-2 rounded-xl border text-xs font-typewriter focus:outline-none ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-hand font-bold opacity-80 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#38B000]" />
                  <span>Telefono / WhatsApp / Riferimento:</span>
                </label>
                <input
                  type="text"
                  value={phoneOrWhatsapp}
                  onChange={(e) => setPhoneOrWhatsapp(e.target.value)}
                  placeholder="es. +39 340..., Ufficio Stampa..."
                  className={`w-full p-2 rounded-xl border text-xs font-typewriter focus:outline-none ${inputBg}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-hand font-bold opacity-80 mb-1">
                Storico Collaborazioni, Lavori Svolti o Conversazioni Avute:
              </label>
              <textarea
                value={collaborationNotes}
                onChange={(e) => setCollaborationNotes(e.target.value)}
                rows={2}
                placeholder="Descrivi se ci hai collaborato, che lavoro hai fatto per loro, conversazioni avute..."
                className={`w-full p-2.5 rounded-xl border text-xs font-sans leading-relaxed focus:outline-none ${inputBg}`}
              />
            </div>
          </div>

          {/* Section 6: Personal Notebook Notes & Rating */}
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
