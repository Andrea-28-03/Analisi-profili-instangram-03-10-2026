export type EntityKind = "studio" | "azienda" | "altro";

export type MacroEntity =
  | "studio"
  | "azienda"
  | "universita"
  | "fotografia"
  | "illustrazione"
  | "artisti"
  | "creator"
  | "amici"
  | "privato"
  | "altro";

export type FilterMacroEntity =
  | "all"
  | "studio"
  | "azienda"
  | "universita"
  | "fotografia"
  | "illustrazione"
  | "artisti"
  | "creator"
  | "amici";

export type WorkSpaceMode =
  | "in_sede"
  | "ibrido"
  | "remoto"
  | "showroom"
  | "atelier";

export type FilterWorkSpaceMode = "all" | WorkSpaceMode;

export type GeoFilterType = "city" | "region";

export interface AIStudioAnalysis {
  displayName: string;
  category: string;
  entityKind?: EntityKind; // legacy compatibility: "studio" | "azienda" | "altro"
  macroEntity?: MacroEntity; // New granular macro division
  subType?: string; // Specific sub-type (e.g. "Studio di Design", "Brand di Arredo", "Fonderia Tipografica")
  studioType: string;
  locationCity: string;
  locationCountry: string;
  countryCode: string;
  locationState?: string;
  locationRegion?: string;
  locationStreet?: string;
  mapsLinks?: string[];
  visualStyle: string;
  keySpecialties: string[];
  designTags?: string[]; // E.g., Light Design, Automotive, Architecture...
  subCategories?: string[]; // Hierarchical taxonomy sub-categories (e.g. "Interni/Ufficio", "Casa/Cucina", "Maniglie", "Musica")
  workMode?: WorkSpaceMode; // In sede, Ibrido, Remoto, Showroom, Atelier
  isPrivatePerson?: boolean; // Flag if friend / private individual
  description: string;
  website?: string;
  analyzedAt: string;
}

export interface InstagramProfile {
  id: string;
  username: string;
  displayName?: string;
  profileUrl: string;
  followedAt?: string;
  notes?: string;
  rating?: number; // 1 to 5 stars
  isFavorite?: boolean;
  isAnalyzed: boolean;
  isAnalyzing?: boolean;
  isPrivatePerson?: boolean;
  error?: string;
  errorCode?: string;
  aiAnalysis?: AIStudioAnalysis;
}

export type ViewMode = "table" | "cards" | "map" | "insights" | "graph";

export type FilterCategory = "all" | string;
export type FilterStatus = "all" | "analyzed" | "pending" | "favorites";
export type FilterEntityKind = "all" | "studio" | "azienda";
