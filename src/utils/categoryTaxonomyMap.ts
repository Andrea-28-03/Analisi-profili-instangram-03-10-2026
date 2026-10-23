import { FilterMacroEntity, MacroEntity, InstagramProfile } from "../types";
import {
  DEFAULT_TAXONOMY_TREE,
  STUDIO_SUBTYPES,
  AZIENDA_SUBTYPES,
  UNIVERSITA_SUBTYPES,
  FOTOGRAFIA_SUBTYPES,
  ILLUSTRAZIONE_SUBTYPES,
  ARTISTI_SUBTYPES,
  TaxonomyCategory,
  classifyMacroEntity,
} from "./entityClassifier";

export interface MacroCategoryConfig {
  id: MacroEntity;
  label: string;
  singularLabel: string;
  icon: string;
  relevantCategoryIds: string[];
  subtypes: string[];
  subtypeTitle: string;
  suggestedTags: string[];
}

export const MACRO_CATEGORY_CONFIG: Record<MacroEntity, MacroCategoryConfig> = {
  studio: {
    id: "studio",
    label: "Studi",
    singularLabel: "Studio",
    icon: "📐",
    relevantCategoryIds: ["interni-spazi", "grafica-visivo", "stili-design", "stili-arte"],
    subtypes: STUDIO_SUBTYPES,
    subtypeTitle: "Tipi di Studio",
    suggestedTags: [
      "Brand Identity & Loghi",
      "Studio di Architettura & Spazi",
      "Design Minimalista",
      "Razionalista & Modernista",
      "Brutalista & Materico",
      "Stile Svizzero / Tipografico",
      "Design Critico & Speculativo",
      "Interni / Ufficio",
      "Tipografia & Fonderia",
      "Motion Design & 3D CGI",
      "Digital, UI/UX & Web",
      "Exhibition & Allestimenti",
    ],
  },
  azienda: {
    id: "azienda",
    label: "Aziende",
    singularLabel: "Azienda / Brand",
    icon: "🏢",
    relevantCategoryIds: ["prodotto-arredo", "interni-spazi", "stili-design"],
    subtypes: AZIENDA_SUBTYPES,
    subtypeTitle: "Tipi di Azienda & Brand",
    suggestedTags: [
      "Brand di Arredo & Mobili",
      "Illuminazione & Light Design",
      "Design di Prodotto & Oggettistica",
      "Design Minimalista",
      "Sedute & Divani",
      "Tavoli & Scrivanie",
      "Maniglie & Ferramenta",
      "Cucina & Food Space",
      "Bagno & Wellness",
      "Materiali & Superfici",
      "Circolare & Sostenibile",
      "Neo-Craft & Artigianale",
    ],
  },
  universita: {
    id: "universita",
    label: "Università",
    singularLabel: "Università / Istituzione",
    icon: "🎓",
    relevantCategoryIds: ["musica-cultura", "grafica-visivo", "stili-design"],
    subtypes: UNIVERSITA_SUBTYPES,
    subtypeTitle: "Tipi di Istituzione",
    suggestedTags: [
      "Accademia di Belle Arti",
      "Facoltà di Architettura & Spazi",
      "Facoltà di Design & Comunicazione",
      "Fondazione Culturale & Museo",
      "Design Education",
      "Ricerca Accademica",
      "Alta Formazione",
      "Scuola di Tipografia & Grafica",
      "FabLab & Laboratorio di Ricerca",
    ],
  },
  fotografia: {
    id: "fotografia",
    label: "Fotografia",
    singularLabel: "Fotografo / Studio Foto",
    icon: "📷",
    relevantCategoryIds: ["arti-illustrazione", "interni-spazi", "stili-design", "stili-arte"],
    subtypes: FOTOGRAFIA_SUBTYPES,
    subtypeTitle: "Ambiti Fotografici",
    suggestedTags: [
      "Fotografia di Architettura & Spazi",
      "Still Life di Prodotto & Oggetti",
      "Interior Shoot & Spazi",
      "Set Design & Styling",
      "Architecture Photography",
      "Design Minimalista",
      "Reportage Spazi & Paesaggio",
      "Luce Naturale",
    ],
  },
  illustrazione: {
    id: "illustrazione",
    label: "Illustrazione",
    singularLabel: "Illustratore / Visual Artist",
    icon: "🎨",
    relevantCategoryIds: ["arti-illustrazione", "grafica-visivo", "stili-arte", "stili-design"],
    subtypes: ILLUSTRAZIONE_SUBTYPES,
    subtypeTitle: "Ambiti Illustrazione",
    suggestedTags: [
      "Illustrazione Editoriale & Riviste",
      "Poster Art, Serigrafia & Risograph",
      "Pop Art & Street Art",
      "Futurismo & Dinamismo",
      "Surrealismo & Onirico",
      "Cover Art & Packaging",
      "Fumetto & Graphic Novel",
      "Pattern, Texture & Surface Design",
    ],
  },
  artisti: {
    id: "artisti",
    label: "Artisti",
    singularLabel: "Artista / Scultore",
    icon: "🖌️",
    relevantCategoryIds: ["arti-illustrazione", "stili-arte"],
    subtypes: ARTISTI_SUBTYPES,
    subtypeTitle: "Discipline Artistiche",
    suggestedTags: [
      "Scultura Contemporanea & Materica",
      "Installazioni Spaziali & Site-Specific",
      "Ceramica, Vetro & Atelier Artigianale",
      "Astrattismo Geometrico",
      "Concettuale & Spaziale",
      "Pittura & Tecniche Miste",
      "Arte Contemporanea & Scultura",
      "Informale & Materico",
    ],
  },
  creator: {
    id: "creator",
    label: "Content Creator",
    singularLabel: "Content Creator",
    icon: "🎬",
    relevantCategoryIds: ["musica-cultura", "grafica-visivo", "stili-design"],
    subtypes: [
      "Video Production & Clip Musicali",
      "Podcast & Radio Media",
      "Motion Design & 3D Creator",
      "Design Review & Storytelling",
      "Social Storytelling & Influencer",
    ],
    subtypeTitle: "Ambiti Media & Creator",
    suggestedTags: [
      "Video Production & Clip Musicali",
      "Media, Radio & Podcast",
      "Motion Design & 3D CGI",
      "Digital, UI/UX & Web",
      "Content Creation",
      "Social Storytelling",
    ],
  },
  amici: {
    id: "amici",
    label: "Amici Designer",
    singularLabel: "Amico / Contatto",
    icon: "👥",
    relevantCategoryIds: ["grafica-visivo", "interni-spazi", "stili-design"],
    subtypes: [
      "Freelancer / Designer Indipendente",
      "Studio Partner",
      "Art Director Indipendente",
      "Amico Designer",
      "Collaboratore",
    ],
    subtypeTitle: "Ruolo & Relazione",
    suggestedTags: [
      "Freelancer / Designer Indipendente",
      "Amico Designer",
      "Collaboratore",
      "Studio Partner",
      "Brand Identity & Loghi",
    ],
  },
  privato: {
    id: "privato",
    label: "Privato",
    singularLabel: "Persona Privata",
    icon: "👤",
    relevantCategoryIds: [],
    subtypes: ["Persona Privata", "Contatto Personale"],
    subtypeTitle: "Tipo Contatto",
    suggestedTags: ["Persona Privata", "Contatto Personale"],
  },
  altro: {
    id: "altro",
    label: "Altro",
    singularLabel: "Altra Entità",
    icon: "📦",
    relevantCategoryIds: ["musica-cultura", "interni-spazi"],
    subtypes: ["Altra Entità", "Collettivo Creativo"],
    subtypeTitle: "Tipologia",
    suggestedTags: ["Musei & Fondazioni", "Media, Radio & Podcast"],
  },
};

export interface SubtypeGroup {
  groupTitle: string;
  items: string[];
}

/**
 * Returns tailored taxonomy groups and subtype options based on the active macro category filter.
 */
export function getTaxonomyForMacro(
  macro: FilterMacroEntity | MacroEntity | string,
  profiles: InstagramProfile[],
  filterOnlyRelevant: boolean = true
): {
  categories: TaxonomyCategory[];
  subtypeGroups: SubtypeGroup[];
  studioSubtypes: string[];
  aziendaSubtypes: string[];
  categoryTagsInProfiles: Set<string>;
} {
  // Collect all tags actually used by profiles that match this macro entity
  const categoryTagsInProfiles = new Set<string>();

  profiles.forEach((p) => {
    const pMacro = classifyMacroEntity(p);
    if (macro !== "all" && pMacro !== macro) return;

    const ai = p.aiAnalysis;
    if (!ai) return;

    ai.subCategories?.forEach((t) => t && categoryTagsInProfiles.add(t));
    ai.designTags?.forEach((t) => t && categoryTagsInProfiles.add(t));
    ai.keySpecialties?.forEach((t) => t && categoryTagsInProfiles.add(t));
    if (ai.subType) categoryTagsInProfiles.add(ai.subType);
  });

  if (macro === "all" || !filterOnlyRelevant) {
    return {
      categories: DEFAULT_TAXONOMY_TREE,
      subtypeGroups: [
        { groupTitle: "Tipi di Studio", items: STUDIO_SUBTYPES },
        { groupTitle: "Tipi di Azienda", items: AZIENDA_SUBTYPES },
        { groupTitle: "Istituzioni & Università", items: UNIVERSITA_SUBTYPES },
        { groupTitle: "Fotografia", items: FOTOGRAFIA_SUBTYPES },
        { groupTitle: "Illustrazione", items: ILLUSTRAZIONE_SUBTYPES },
        { groupTitle: "Artisti", items: ARTISTI_SUBTYPES },
      ],
      studioSubtypes: STUDIO_SUBTYPES,
      aziendaSubtypes: AZIENDA_SUBTYPES,
      categoryTagsInProfiles,
    };
  }

  const config = MACRO_CATEGORY_CONFIG[macro as MacroEntity];
  if (!config) {
    return {
      categories: DEFAULT_TAXONOMY_TREE,
      subtypeGroups: [
        { groupTitle: "Tipi di Studio", items: STUDIO_SUBTYPES },
        { groupTitle: "Tipi di Azienda", items: AZIENDA_SUBTYPES },
      ],
      studioSubtypes: STUDIO_SUBTYPES,
      aziendaSubtypes: AZIENDA_SUBTYPES,
      categoryTagsInProfiles,
    };
  }

  // Filter categories to only those strictly relevant to this macro entity
  const relevantCategories = DEFAULT_TAXONOMY_TREE.filter((cat) =>
    config.relevantCategoryIds.includes(cat.id)
  );

  const subtypeGroups: SubtypeGroup[] = [
    {
      groupTitle: config.subtypeTitle || "Tipologie",
      items: config.subtypes || [],
    },
  ];

  return {
    categories: relevantCategories,
    subtypeGroups,
    studioSubtypes: config.id === "studio" ? STUDIO_SUBTYPES : [],
    aziendaSubtypes: config.id === "azienda" ? AZIENDA_SUBTYPES : [],
    categoryTagsInProfiles,
  };
}

/**
 * Returns suggested tags for a profile's specific macro entity (for quick tagging in modal)
 */
export function getSuggestedTagsForMacro(
  macro: MacroEntity,
  profiles?: InstagramProfile[]
): string[] {
  const config = MACRO_CATEGORY_CONFIG[macro];
  const baseSuggested = config?.suggestedTags || [];

  if (!profiles) return baseSuggested;

  const tagCounts: Record<string, number> = {};
  profiles.forEach((p) => {
    if (classifyMacroEntity(p) !== macro) return;
    const ai = p.aiAnalysis;
    if (!ai) return;

    ai.subCategories?.forEach((t) => {
      if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
    ai.designTags?.forEach((t) => {
      if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });

  const popularFromProfiles = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t)
    .slice(0, 10);

  const combined = Array.from(new Set([...baseSuggested, ...popularFromProfiles]));
  return combined.slice(0, 14);
}

/**
 * Returns the top tags actually present in the current category profiles (for quick pills above the tag input)
 */
export function getTopTagsForCategory(
  macro: FilterMacroEntity | MacroEntity | string,
  profiles: InstagramProfile[],
  limit = 8
): { tag: string; count: number }[] {
  const counts: Record<string, number> = {};

  profiles.forEach((p) => {
    if (macro !== "all" && classifyMacroEntity(p) !== macro) return;
    const ai = p.aiAnalysis;
    if (!ai) return;

    const all = [
      ...(ai.subCategories || []),
      ...(ai.designTags || []),
      ...(ai.keySpecialties || []),
      ai.subType,
    ].filter(Boolean) as string[];

    all.forEach((t) => {
      const clean = t.trim();
      counts[clean] = (counts[clean] || 0) + 1;
    });
  });

  const sorted = Object.entries(counts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));

  // If no profiles have tags yet in this category, return suggested tags with count 0
  if (sorted.length === 0 && macro !== "all") {
    const config = MACRO_CATEGORY_CONFIG[macro as MacroEntity];
    if (config) {
      return config.suggestedTags.slice(0, limit).map((tag) => ({ tag, count: 0 }));
    }
  }

  return sorted;
}

export interface AutocompleteTagResult {
  name: string;
  category: string;
  count: number;
  totalCount: number;
  isPredefined: boolean;
}

/**
 * Generates fuzzy / autocompletion suggestions as the user types in the tag filter input.
 */
export function getAutocompleteSuggestions(
  query: string,
  activeMacro: FilterMacroEntity | MacroEntity | string,
  profiles: InstagramProfile[],
  customCategories: string[] = [],
  maxResults = 9
): AutocompleteTagResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // 1. Calculate counts
  const macroCounts: Record<string, number> = {};
  const totalCounts: Record<string, number> = {};
  const tagOrigin: Record<string, string> = {};

  // Index DEFAULT_TAXONOMY_TREE
  DEFAULT_TAXONOMY_TREE.forEach((cat) => {
    cat.subCategories.forEach((sub) => {
      tagOrigin[sub.name] = cat.name;
    });
  });

  // Index Subtypes
  Object.values(MACRO_CATEGORY_CONFIG).forEach((config) => {
    config.subtypes.forEach((st) => {
      if (!tagOrigin[st]) tagOrigin[st] = config.subtypeTitle;
    });
  });

  // Collect from profiles
  profiles.forEach((p) => {
    const isCurrentMacro = activeMacro === "all" || classifyMacroEntity(p) === activeMacro;
    const ai = p.aiAnalysis;
    if (!ai) return;

    const all = [
      ...(ai.subCategories || []),
      ...(ai.designTags || []),
      ...(ai.keySpecialties || []),
      ai.subType,
    ].filter(Boolean) as string[];

    all.forEach((t) => {
      const clean = t.trim();
      totalCounts[clean] = (totalCounts[clean] || 0) + 1;
      if (isCurrentMacro) {
        macroCounts[clean] = (macroCounts[clean] || 0) + 1;
      }
      if (!tagOrigin[clean]) {
        tagOrigin[clean] = "Tag Taccuino";
      }
    });
  });

  // Add custom tags
  customCategories.forEach((ct) => {
    if (!tagOrigin[ct]) tagOrigin[ct] = "Tag Personalizzato";
  });

  // Gather unique tag pool
  const allCandidates = Array.from(
    new Set([
      ...Object.keys(tagOrigin),
      ...Object.keys(totalCounts),
      ...customCategories,
    ])
  );

  // Filter candidates matching query
  const matches = allCandidates
    .filter((name) => name.toLowerCase().includes(q))
    .map((name) => {
      const lower = name.toLowerCase();
      const count = activeMacro === "all" ? totalCounts[name] || 0 : macroCounts[name] || 0;
      const totalCount = totalCounts[name] || 0;
      const isExact = lower === q;
      const startsWith = lower.startsWith(q);

      return {
        name,
        category: tagOrigin[name] || "Tag",
        count,
        totalCount,
        isPredefined: !!tagOrigin[name] && tagOrigin[name] !== "Tag Taccuino",
        isExact,
        startsWith,
      };
    });

  // Sort by relevance:
  // 1. Exact match
  // 2. Starts with query
  // 3. Profiles count in this category
  // 4. Total count
  matches.sort((a, b) => {
    if (a.isExact !== b.isExact) return a.isExact ? -1 : 1;
    if (a.startsWith !== b.startsWith) return a.startsWith ? -1 : 1;
    if (a.count !== b.count) return b.count - a.count;
    if (a.totalCount !== b.totalCount) return b.totalCount - a.totalCount;
    return a.name.localeCompare(b.name);
  });

  return matches.slice(0, maxResults).map(({ name, category, count, totalCount, isPredefined }) => ({
    name,
    category,
    count,
    totalCount,
    isPredefined,
  }));
}

