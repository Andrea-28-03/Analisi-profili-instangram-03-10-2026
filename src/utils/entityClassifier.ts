import { InstagramProfile, EntityKind, MacroEntity, WorkSpaceMode } from "../types";

export const STUDIO_SUBTYPES = [
  "Studio di Design & Branding",
  "Studio di Architettura & Spazi",
  "Studio di Interni & Exhibition",
  "Agenzia Creativa & Comunicazione",
  "Fonderia Tipografica (Type Foundry)",
  "Studio Digitale, UI/UX & Motion",
  "Freelancer / Designer Indipendente",
  "Atelier / Artigianato & Ceramica",
  "Collettivo Creativo & Ricerca",
  "Altro Studio",
];

export const AZIENDA_SUBTYPES = [
  "Brand di Arredo & Mobili",
  "Illuminazione & Light Design",
  "Design di Prodotto & Oggettistica",
  "Azienda Manifatturiera & Materiali",
  "Moda, Tessuti & Lifestyle",
  "Tech, Elettronica & Smart Devices",
  "Casa Editrice & Media di Design",
  "Showroom & Retail di Design",
  "Altra Azienda",
];

export interface TaxonomyCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  subCategories: { id: string; name: string }[];
}

export const DEFAULT_TAXONOMY_TREE: TaxonomyCategory[] = [
  {
    id: "interni-spazi",
    name: "Interni & Spazi",
    icon: "🏠",
    color: "#3A86FF",
    subCategories: [
      { id: "interni-ufficio", name: "Interni / Ufficio" },
      { id: "interni-casa", name: "Casa & Living" },
      { id: "cucina", name: "Cucina & Food Space" },
      { id: "bagno", name: "Bagno & Wellness" },
      { id: "maniglie", name: "Maniglie & Ferramenta" },
      { id: "hospitality", name: "Hospitality & Hotel" },
      { id: "retail-showroom", name: "Retail & Showroom" },
      { id: "exhibition-stand", name: "Exhibition & Allestimenti" },
    ],
  },
  {
    id: "prodotto-arredo",
    name: "Prodotto & Arredo",
    icon: "🪑",
    color: "#FB8500",
    subCategories: [
      { id: "sedute-divani", name: "Sedute & Divani" },
      { id: "tavoli-scrivanie", name: "Tavoli & Scrivanie" },
      { id: "illuminazione", name: "Illuminazione & Lampade" },
      { id: "oggetti-tavola", name: "Oggetti & Complementi" },
      { id: "materiali-superfici", name: "Materiali & Superfici" },
      { id: "ceramica-vetro", name: "Ceramica, Vetro & Artigianato" },
    ],
  },
  {
    id: "grafica-visivo",
    name: "Identità, Grafica & Tipografia",
    icon: "📐",
    color: "#8338EC",
    subCategories: [
      { id: "brand-identity", name: "Brand Identity & Loghi" },
      { id: "tipografia", name: "Tipografia & Fonderia" },
      { id: "editoria-libri", name: "Editoria & Riviste" },
      { id: "packaging", name: "Packaging & Packaging Design" },
      { id: "motion-3d", name: "Motion Design & 3D CGI" },
      { id: "ui-ux", name: "Digital, UI/UX & Web" },
    ],
  },
  {
    id: "arti-illustrazione",
    name: "Arti Visive & Illustrazione",
    icon: "🎨",
    color: "#FF5E8E",
    subCategories: [
      { id: "illustrazione-editoriale", name: "Illustrazione Editoriale" },
      { id: "fotografia-design", name: "Fotografia di Architettura & Oggetti" },
      { id: "arte-contemporanea", name: "Arte Contemporanea & Scultura" },
      { id: "set-design", name: "Set Design & Styling" },
      { id: "poster-art", name: "Poster Art & Stampa Serigrafica" },
    ],
  },
  {
    id: "musica-cultura",
    name: "Musica, Spettacolo & Cultura",
    icon: "🎵",
    color: "#38B000",
    subCategories: [
      { id: "musica-festival", name: "Musica, Festival & Clubbing" },
      { id: "teatro-scenografia", name: "Scenografia & Teatri" },
      { id: "musei-istituzioni", name: "Musei & Fondazioni" },
      { id: "cinema-video", name: "Video Production & Clip Musicali" },
      { id: "podcast-media", name: "Media, Radio & Podcast" },
    ],
  },
];

export const WORK_MODE_CONFIG: Record<
  WorkSpaceMode,
  { label: string; icon: string; description: string }
> = {
  in_sede: {
    label: "In sede",
    icon: "🏛️",
    description: "Presenza fisica con studio / sede operativa",
  },
  ibrido: {
    label: "Ibrido",
    icon: "🔄",
    description: "Modalità mista presenza e remoto",
  },
  remoto: {
    label: "Da remoto",
    icon: "💻",
    description: "Operativo online / remote practice",
  },
  showroom: {
    label: "Showroom",
    icon: "✨",
    description: "Spazio espositivo aperto al pubblico o su appuntamento",
  },
  atelier: {
    label: "Laboratorio / Atelier",
    icon: "🔨",
    description: "Laboratorio artigianale o atelier di produzione",
  },
};

/**
 * Classifies an Instagram profile into "studio", "azienda", or "altro"
 */
export function classifyEntityKind(profile: InstagramProfile): EntityKind {
  const ai = profile.aiAnalysis;
  if (!ai) {
    const lowerNotes = (profile.notes || "").toLowerCase();
    const lowerName = (profile.displayName || profile.username).toLowerCase();
    if (
      lowerNotes.includes("azienda") ||
      lowerNotes.includes("brand") ||
      lowerNotes.includes("produttore") ||
      lowerName.includes("lighting") ||
      lowerName.includes("furniture")
    ) {
      return "azienda";
    }
    return "studio";
  }

  if (ai.entityKind) {
    return ai.entityKind;
  }

  const category = (ai.category || "").toLowerCase();
  const studioType = (ai.studioType || "").toLowerCase();
  const desc = (ai.description || "").toLowerCase();

  if (category.includes("persona privata") || category.includes("amico")) {
    return "altro";
  }

  const aziendaKeywords = [
    "azienda",
    "brand",
    "produttore",
    "fabbrica",
    "manifattura",
    "illuminazione",
    "lampade",
    "arredo",
    "mobili",
    "marchio",
    "retail",
    "showroom",
    "e-commerce",
    "store",
  ];

  if (aziendaKeywords.some((kw) => studioType.includes(kw))) {
    return "azienda";
  }

  if (
    desc.includes("azienda") ||
    desc.includes("brand fondato") ||
    desc.includes("marchio di") ||
    desc.includes("produce")
  ) {
    return "azienda";
  }

  return "studio";
}

/**
 * Classifies an Instagram profile into the user's requested macro entities:
 * 'studio' | 'azienda' | 'universita' | 'fotografia' | 'illustrazione' | 'artisti' | 'creator' | 'amici' | 'privato' | 'altro'
 */
export function classifyMacroEntity(profile: InstagramProfile): MacroEntity {
  const ai = profile.aiAnalysis;

  if (ai?.macroEntity) {
    return ai.macroEntity;
  }

  if (profile.isPrivatePerson || ai?.isPrivatePerson) {
    return "privato";
  }

  const lowerCat = (ai?.category || "").toLowerCase();
  const lowerType = (ai?.studioType || "").toLowerCase();
  const lowerNotes = (profile.notes || "").toLowerCase();
  const lowerName = (ai?.displayName || profile.displayName || profile.username).toLowerCase();
  const lowerDesc = (ai?.description || "").toLowerCase();
  const allText = `${lowerCat} ${lowerType} ${lowerNotes} ${lowerName} ${lowerDesc}`;

  // Amici / Privati
  if (
    lowerCat.includes("persona privata") ||
    lowerCat.includes("amico") ||
    lowerNotes.includes("amico") ||
    lowerType.includes("personale") ||
    lowerNotes.includes("privato")
  ) {
    if (lowerNotes.includes("amico") || lowerCat.includes("amico")) {
      return "amici";
    }
    return "privato";
  }

  // Università / Accademie
  if (
    lowerCat.includes("università") ||
    lowerCat.includes("scuola") ||
    lowerCat.includes("istituz") ||
    lowerType.includes("universit") ||
    lowerType.includes("accademia") ||
    lowerType.includes("scuola") ||
    allText.includes("politecnico") ||
    allText.includes("iuav") ||
    allText.includes("faculty") ||
    allText.includes("university") ||
    allText.includes("ecole")
  ) {
    return "universita";
  }

  // Fotografia
  if (
    lowerCat.includes("fotograf") ||
    lowerType.includes("fotograf") ||
    allText.includes("photographer") ||
    allText.includes("architecture photo") ||
    allText.includes("fotografo")
  ) {
    return "fotografia";
  }

  // Illustrazione
  if (
    lowerCat.includes("illustraz") ||
    lowerType.includes("illustrat") ||
    allText.includes("illustrator") ||
    allText.includes("disegnatore") ||
    allText.includes("fumettista")
  ) {
    return "illustrazione";
  }

  // Artisti
  if (
    lowerCat.includes("artist") ||
    lowerType.includes("artist") ||
    allText.includes("scultore") ||
    allText.includes("pittore") ||
    allText.includes("contemporary artist")
  ) {
    return "artisti";
  }

  // Content Creator / Influencer
  if (
    lowerCat.includes("creator") ||
    lowerCat.includes("influencer") ||
    lowerType.includes("creator") ||
    allText.includes("content creator") ||
    allText.includes("youtuber") ||
    allText.includes("blogger")
  ) {
    return "creator";
  }

  // Aziende / Brand
  const baseKind = classifyEntityKind(profile);
  if (baseKind === "azienda") {
    return "azienda";
  }

  // Default: Studio
  return "studio";
}

/**
 * Resolves a normalized sub-type for a profile
 */
export function classifyEntitySubType(profile: InstagramProfile): string {
  const ai = profile.aiAnalysis;
  if (ai?.subType && ai.subType.trim()) {
    return ai.subType;
  }

  const kind = classifyEntityKind(profile);
  const rawType = (ai?.studioType || "").toLowerCase();
  const cat = (ai?.category || "").toLowerCase();
  const spec = (ai?.keySpecialties || []).map((s) => s.toLowerCase()).join(" ");

  if (kind === "azienda") {
    if (rawType.includes("luce") || rawType.includes("illuminazione") || spec.includes("light") || spec.includes("lampad")) {
      return "Illuminazione & Light Design";
    }
    if (rawType.includes("arredo") || rawType.includes("mobili") || spec.includes("furniture") || spec.includes("sedute")) {
      return "Brand di Arredo & Mobili";
    }
    if (rawType.includes("tavola") || rawType.includes("prodotto") || spec.includes("oggetti") || spec.includes("metalli")) {
      return "Design di Prodotto & Oggettistica";
    }
    if (rawType.includes("material") || rawType.includes("manifattur") || spec.includes("superfici")) {
      return "Azienda Manifatturiera & Materiali";
    }
    if (rawType.includes("moda") || rawType.includes("fashion") || spec.includes("tessuti")) {
      return "Moda, Tessuti & Lifestyle";
    }
    if (rawType.includes("tech") || rawType.includes("elettronica") || spec.includes("software")) {
      return "Tech, Elettronica & Smart Devices";
    }
    if (rawType.includes("edit") || rawType.includes("media") || rawType.includes("magazine")) {
      return "Casa Editrice & Media di Design";
    }
    return ai?.studioType || "Brand di Design";
  }

  if (kind === "studio") {
    if (rawType.includes("architett") || cat.includes("architett")) {
      return "Studio di Architettura & Spazi";
    }
    if (rawType.includes("tipo") || rawType.includes("fonderia") || cat.includes("tipo")) {
      return "Fonderia Tipografica (Type Foundry)";
    }
    if (rawType.includes("agenzia")) {
      return "Agenzia Creativa & Comunicazione";
    }
    if (rawType.includes("freelance") || rawType.includes("singolo") || rawType.includes("artista")) {
      return "Freelancer / Designer Indipendente";
    }
    if (rawType.includes("digitale") || cat.includes("digitale") || rawType.includes("motion") || spec.includes("motion")) {
      return "Studio Digitale, UI/UX & Motion";
    }
    if (rawType.includes("atelier") || rawType.includes("ceramica") || rawType.includes("artigian")) {
      return "Atelier / Artigianato & Ceramica";
    }
    if (rawType.includes("interni") || cat.includes("interior")) {
      return "Studio di Interni & Exhibition";
    }
    return "Studio di Design & Branding";
  }

  return "Persona Privata / Altro";
}
