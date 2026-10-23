import { InstagramProfile, EntityKind, MacroEntity, WorkSpaceMode, CollaborationRelationType } from "../types";

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

export const UNIVERSITA_SUBTYPES = [
  "Accademia di Belle Arti",
  "Facoltà di Architettura & Spazi",
  "Facoltà di Design & Comunicazione",
  "Fondazione Culturale & Museo",
  "Scuola di Tipografia & Grafica",
  "Archivio Storico di Design",
  "FabLab & Laboratorio di Ricerca",
  "Altra Istituzione",
];

export const FOTOGRAFIA_SUBTYPES = [
  "Fotografia di Architettura & Spazi",
  "Still Life di Prodotto & Oggetti",
  "Interior Shoot & Spazi",
  "Fotografia di Moda & Styling",
  "Reportage Spazi & Paesaggio",
  "Altro Fotografo",
];

export const ILLUSTRAZIONE_SUBTYPES = [
  "Illustrazione Editoriale & Riviste",
  "Poster Art, Serigrafia & Risograph",
  "Cover Art & Packaging",
  "Fumetto & Graphic Novel",
  "Pattern, Texture & Surface Design",
  "Altro Illustratore",
];

export const ARTISTI_SUBTYPES = [
  "Scultura Contemporanea & Materica",
  "Installazioni Spaziali & Site-Specific",
  "Ceramica, Vetro & Atelier Artigianale",
  "Pittura & Tecniche Miste",
  "Arte Concettuale",
  "Altro Artista",
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
    id: "stili-design",
    name: "Stili & Filosofie di Design",
    icon: "✒️",
    color: "#E63946",
    subCategories: [
      { id: "stile-minimalista", name: "Design Minimalista" },
      { id: "stile-razionalista", name: "Razionalista & Modernista" },
      { id: "stile-brutalista", name: "Brutalista & Materico" },
      { id: "stile-pop", name: "Pop, Giocoso & Colorato" },
      { id: "stile-critico", name: "Design Critico & Speculativo" },
      { id: "stile-svizzero", name: "Stile Svizzero / Tipografico" },
      { id: "stile-organico", name: "Organico, Biofilico & Scultoreo" },
      { id: "stile-hitech", name: "Hi-Tech & Futurista" },
      { id: "stile-neocraft", name: "Neo-Craft & Artigianale" },
      { id: "stile-industriale", name: "Industriale & Tecnico" },
      { id: "stile-circolare", name: "Circolare & Sostenibile" },
      { id: "stile-razionalismo-storico", name: "Razionalismo Storico / Novecento" },
    ],
  },
  {
    id: "stili-arte",
    name: "Linguaggi & Movimenti Artistici",
    icon: "🖼️",
    color: "#FF5E8E",
    subCategories: [
      { id: "movimento-futurismo", name: "Futurismo & Dinamismo" },
      { id: "movimento-bauhaus", name: "Bauhaus & Costruttivismo" },
      { id: "movimento-postmoderno", name: "Postmoderno & Memphis" },
      { id: "movimento-astratto", name: "Astrattismo Geometrico" },
      { id: "movimento-figurativo", name: "Figurativo Contemporaneo" },
      { id: "movimento-popart", name: "Pop Art & Street Art" },
      { id: "movimento-surrealismo", name: "Surrealismo & Onirico" },
      { id: "movimento-concettuale", name: "Concettuale & Spaziale" },
      { id: "movimento-devisivo", name: "Raw, Brut & Decostruttivismo" },
      { id: "movimento-materico", name: "Informale & Materico" },
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

export const MACRO_ENTITY_BADGE_MAP: Record<
  MacroEntity,
  { label: string; icon: string; colorClass: string }
> = {
  studio: { label: "Studio", icon: "📐", colorClass: "text-[#3A86FF]" },
  azienda: { label: "Azienda", icon: "🏢", colorClass: "text-[#FB8500]" },
  universita: { label: "Università", icon: "🎓", colorClass: "text-[#8338EC]" },
  fotografia: { label: "Fotografia", icon: "📷", colorClass: "text-[#00B4D8]" },
  illustrazione: { label: "Illustrazione", icon: "🎨", colorClass: "text-[#FF5E8E]" },
  artisti: { label: "Artista", icon: "🖌️", colorClass: "text-[#38B000]" },
  creator: { label: "Creator", icon: "📹", colorClass: "text-[#FFBE0B]" },
  amici: { label: "Amico", icon: "👥", colorClass: "text-[#06D6A0]" },
  privato: { label: "Privato", icon: "👤", colorClass: "text-[#E63946]" },
  altro: { label: "Altro", icon: "✨", colorClass: "text-gray-400" },
};

export const COLLABORATION_RELATION_CONFIG: Record<
  CollaborationRelationType,
  { label: string; shortLabel: string; icon: string; colorClass: string; badgeClass: string; description: string }
> = {
  collaborated: {
    label: "Ci ho collaborato",
    shortLabel: "Collaborato",
    icon: "🤝",
    colorClass: "text-[#38B000]",
    badgeClass: "bg-[#38B000]/15 text-[#38B000] border-[#38B000]",
    description: "Progetto o collaborazione svolta insieme",
  },
  worked_for_them: {
    label: "Ho fatto un lavoro per loro",
    shortLabel: "Lavoro per loro",
    icon: "💼",
    colorClass: "text-[#3A86FF]",
    badgeClass: "bg-[#3A86FF]/15 text-[#3A86FF] border-[#3A86FF]",
    description: "Incarico professionale, consulenza o commissione per loro",
  },
  spoken_contact: {
    label: "Parlato con qualcuno dentro",
    shortLabel: "Contatto interno",
    icon: "💬",
    colorClass: "text-[#8338EC]",
    badgeClass: "bg-[#8338EC]/15 text-[#8338EC] border-[#8338EC]",
    description: "Ho parlato o sono in contatto con persone del team",
  },
  sent_portfolio: {
    label: "Portfolio / Candidatura inviata",
    shortLabel: "Portfolio inviato",
    icon: "📨",
    colorClass: "text-[#FB8500]",
    badgeClass: "bg-[#FB8500]/15 text-[#FB8500] border-[#FB8500]",
    description: "Inviato portfolio, presentazione o candidatura",
  },
  in_talks: {
    label: "In trattativa / Contatto attivo",
    shortLabel: "In trattativa",
    icon: "🔥",
    colorClass: "text-[#FF5E8E]",
    badgeClass: "bg-[#FF5E8E]/15 text-[#FF5E8E] border-[#FF5E8E]",
    description: "Dialogo aperto per possibile progetto o collaborazione",
  },
  known_personally: {
    label: "Conoscenza diretta / Incontrato",
    shortLabel: "Conosciuto",
    icon: "☕",
    colorClass: "text-[#00B4D8]",
    badgeClass: "bg-[#00B4D8]/15 text-[#00B4D8] border-[#00B4D8]",
    description: "Conosciuto di persona a eventi, mostre o tramite rete",
  },
};

/**
 * Resolves a normalized sub-type for a profile across all macro-entities
 */
export function classifyEntitySubType(profile: InstagramProfile): string {
  const ai = profile.aiAnalysis;
  const macro = classifyMacroEntity(profile);
  const rawType = (ai?.studioType || "").toLowerCase();
  const cat = (ai?.category || "").toLowerCase();
  const desc = (ai?.description || "").toLowerCase();
  const name = (ai?.displayName || profile.displayName || profile.username).toLowerCase();
  const spec = (ai?.keySpecialties || []).map((s) => s.toLowerCase()).join(" ");
  const allText = `${rawType} ${cat} ${desc} ${name} ${spec}`;

  // If explicit subType is set AND it matches the macro category (i.e. not a leftover "Studio..." on a University)
  if (ai?.subType && ai.subType.trim()) {
    const st = ai.subType.trim();
    const isGenericStudioLabel = st.toLowerCase().startsWith("studio");
    if (macro === "studio" || !isGenericStudioLabel) {
      return st;
    }
  }

  if (macro === "universita") {
    if (allText.includes("accademia") || allText.includes("belle arti") || allText.includes("brera")) {
      return "Accademia di Belle Arti";
    }
    if (allText.includes("museo") || allText.includes("fondazione") || allText.includes("triennale") || allText.includes("archivio")) {
      return "Fondazione Culturale & Museo";
    }
    if (allText.includes("scuola") || allText.includes("ied") || allText.includes("naba") || allText.includes("isia") || allText.includes("ecal")) {
      return "Scuola Superiore di Design";
    }
    if (allText.includes("architett")) {
      return "Facoltà di Architettura & Spazi";
    }
    if (allText.includes("politecnico") || allText.includes("iuav") || allText.includes("universit") || allText.includes("university")) {
      return "Università / Politecnico";
    }
    return "Università & Istituzione Formativa";
  }

  if (macro === "fotografia") {
    if (allText.includes("architett") || allText.includes("spazi") || allText.includes("interior")) {
      return "Fotografia di Architettura & Spazi";
    }
    if (allText.includes("still life") || allText.includes("prodotto") || allText.includes("oggett")) {
      return "Still Life di Prodotto & Oggetti";
    }
    if (allText.includes("moda") || allText.includes("fashion") || allText.includes("editoria")) {
      return "Fotografia di Moda & Styling";
    }
    return "Fotografia & Ricerca Visiva";
  }

  if (macro === "illustrazione") {
    if (allText.includes("poster") || allText.includes("serigraf") || allText.includes("risograph")) {
      return "Poster Art, Serigrafia & Risograph";
    }
    if (allText.includes("fumett") || allText.includes("graphic novel") || allText.includes("comic")) {
      return "Fumetto & Graphic Novel";
    }
    if (allText.includes("pattern") || allText.includes("surface") || allText.includes("tessil")) {
      return "Pattern, Texture & Surface Design";
    }
    return "Illustrazione Editoriale & Riviste";
  }

  if (macro === "artisti") {
    if (allText.includes("scultur") || allText.includes("sculpt") || allText.includes("materic")) {
      return "Scultura Contemporanea & Materica";
    }
    if (allText.includes("installaz") || allText.includes("site-specific") || allText.includes("spatial")) {
      return "Installazioni Spaziali & Site-Specific";
    }
    if (allText.includes("ceramic") || allText.includes("vetro")) {
      return "Ceramica, Vetro & Pratiche Plastiche";
    }
    return "Arte Contemporanea & Arti Visive";
  }

  if (macro === "creator") {
    if (allText.includes("magazine") || allText.includes("rivista") || allText.includes("media")) {
      return "Media, Rivista & Divulgazione";
    }
    return "Content Creator & Design Media";
  }

  if (macro === "amici") {
    return "Amico / Collega Designer";
  }

  if (macro === "privato") {
    return "Persona Privata";
  }

  if (macro === "azienda") {
    if (rawType.includes("luce") || rawType.includes("illuminazione") || spec.includes("light") || spec.includes("lampad")) {
      return "Illuminazione & Light Design";
    }
    if (rawType.includes("arredo") || rawType.includes("mobili") || spec.includes("furniture") || spec.includes("sedute")) {
      return "Brand di Arredo & Mobili";
    }
    if (rawType.includes("tavola") || rawType.includes("prodotto") || spec.includes("oggetti") || spec.includes("metalli")) {
      return "Design di Prodotto & Oggettistica";
    }
    if (rawType.includes("material") || rawType.includes("manifattur") || spec.includes("superfici") || allText.includes("manigli")) {
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

  if (macro === "studio") {
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

