import React, { useState, useEffect, useRef, useMemo } from "react";
import { Header } from "./components/Header";
import { CategoryFilter } from "./components/CategoryFilter";
import { TaxonomyFilterBar } from "./components/TaxonomyFilterBar";
import { StudioTable } from "./components/StudioTable";
import { StudioCard } from "./components/StudioCard";
import { StudioMap } from "./components/StudioMap";
import { StudioGraph } from "./components/StudioGraph";
import { StudioInsights } from "./components/StudioInsights";
import { ImportModal } from "./components/ImportModal";
import { StudioDetailModal } from "./components/StudioDetailModal";
import { ExportGeminiModal } from "./components/ExportGeminiModal";
import { AutoAnalysisQueueModal } from "./components/AutoAnalysisQueueModal";
import { ConfirmModal, ConfirmActionType } from "./components/ConfirmModal";
import { analyzeProfileOnline } from "./services/geminiOnlineService";
import {
  InstagramProfile,
  ViewMode,
  FilterStatus,
  FilterMacroEntity,
  MacroEntity,
  GeoFilterType,
  FilterWorkSpaceMode,
  WorkSpaceMode,
  EntityKind,
} from "./types";
import {
  classifyMacroEntity,
  classifyEntityKind,
  classifyEntitySubType,
  WORK_MODE_CONFIG,
} from "./utils/entityClassifier";
import { INITIAL_STUDIOS } from "./data/initialStudios";
import {
  Sparkles,
  Upload,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Check,
} from "lucide-react";

const STORAGE_KEY = "instadesign_profiles_v1";
const CUSTOM_CAT_KEY = "curator_custom_categories_v1";

export default function App() {
  const [profiles, setProfiles] = useState<InstagramProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to read from localStorage:", e);
    }
    return INITIAL_STUDIOS;
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMacroEntity, setSelectedMacroEntity] = useState<FilterMacroEntity>("all");
  const [noPrivate, setNoPrivate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [geoMode, setGeoMode] = useState<GeoFilterType>("city");
  const [selectedGeo, setSelectedGeo] = useState<string>("all");
  const [selectedWorkMode, setSelectedWorkMode] = useState<FilterWorkSpaceMode>("all");
  
  // Bottom Cascading Taxonomy Multi-Select (Additive)
  const [selectedTaxonomyTags, setSelectedTaxonomyTags] = useState<string[]>([]);
  const [taxonomyMatchMode, setTaxonomyMatchMode] = useState<'or' | 'and'>('or');
  const [isTaxonomyOpen, setIsTaxonomyOpen] = useState(true);
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_CAT_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('curator_theme_v1') as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportGeminiModalOpen, setIsExportGeminiModalOpen] = useState(false);
  const [isAutoAnalysisModalOpen, setIsAutoAnalysisModalOpen] = useState(false);
  const [selectedProfileForDetail, setSelectedProfileForDetail] =
    useState<InstagramProfile | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    actionType: ConfirmActionType | null;
    targetName?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    actionType: null,
    onConfirm: () => {},
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync profiles to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, [profiles]);

  // Sync custom categories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_CAT_KEY, JSON.stringify(customCategories));
    } catch (e) {
      console.error("Failed to save custom categories:", e);
    }
  }, [customCategories]);

  // Theme Sync
  useEffect(() => {
    try {
      localStorage.setItem('curator_theme_v1', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    } catch (e) {
      console.error("Failed to save theme:", e);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  // Compute Macro Entity Counts
  const macroCounts = useMemo(() => {
    const counts: Record<FilterMacroEntity, number> = {
      all: profiles.length,
      studio: 0,
      azienda: 0,
      universita: 0,
      fotografia: 0,
      illustrazione: 0,
      artisti: 0,
      creator: 0,
      amici: 0,
    };

    profiles.forEach((p) => {
      const macro = classifyMacroEntity(p);
      if (macro in counts) {
        counts[macro as FilterMacroEntity] = (counts[macro as FilterMacroEntity] || 0) + 1;
      }
    });

    return counts;
  }, [profiles]);

  // Available Cities
  const availableCities = useMemo(() => {
    const map: Record<string, number> = {};
    profiles.forEach((p) => {
      const city = p.aiAnalysis?.locationCity;
      if (city && city.trim()) {
        map[city.trim()] = (map[city.trim()] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [profiles]);

  // Available Regions
  const availableRegions = useMemo(() => {
    const map: Record<string, number> = {};
    profiles.forEach((p) => {
      const reg = p.aiAnalysis?.locationRegion || p.aiAnalysis?.locationState;
      if (reg && reg.trim()) {
        map[reg.trim()] = (map[reg.trim()] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [profiles]);

  // Work Mode Counts
  const workModeCounts = useMemo(() => {
    const map: Record<WorkSpaceMode, number> = {
      in_sede: 0,
      ibrido: 0,
      remoto: 0,
      showroom: 0,
      atelier: 0,
    };
    profiles.forEach((p) => {
      const wm = p.aiAnalysis?.workMode;
      if (wm && wm in map) {
        map[wm] = (map[wm] || 0) + 1;
      }
    });
    return map;
  }, [profiles]);

  // All tags across entire notebook for smart autocomplete in StudioDetailModal
  const allNotebookTags = useMemo(() => {
    const set = new Set<string>();
    profiles.forEach((p) => {
      const ai = p.aiAnalysis;
      if (!ai) return;
      ai.subCategories?.forEach((t) => t && set.add(t));
      ai.designTags?.forEach((t) => t && set.add(t));
      ai.keySpecialties?.forEach((t) => t && set.add(t));
      if (ai.subType) set.add(ai.subType);
    });
    customCategories.forEach((t) => t && set.add(t));
    return Array.from(set);
  }, [profiles, customCategories]);

  // Pre-index profiles for ultra-fast filtering and searching (eliminates UI lag on large collections)
  const indexedProfiles = useMemo(() => {
    return profiles.map((p) => {
      const ai = p.aiAnalysis;
      const studioName = ai?.displayName || p.displayName || p.username;
      const macro = classifyMacroEntity(p);
      const isPrivate =
        p.isPrivatePerson === true ||
        ai?.isPrivatePerson === true ||
        macro === "privato" ||
        macro === "amici" ||
        ai?.category === "Persona Privata / Amico";

      const rawTags = [
        ...(ai?.subCategories || []),
        ...(ai?.designTags || []),
        ...(ai?.keySpecialties || []),
        ai?.subType,
        ai?.studioType,
        ai?.category,
      ].filter(Boolean) as string[];

      const tagSet = new Set<string>();
      const tagLowerList: string[] = [];
      rawTags.forEach((t) => {
        const clean = t.trim().toLowerCase();
        tagSet.add(clean);
        tagLowerList.push(clean);
      });

      const searchCorpus = [
        p.username,
        studioName,
        ai?.locationCity || "",
        ai?.locationRegion || ai?.locationState || "",
        ai?.locationCountry || "",
        ai?.visualStyle || "",
        ai?.description || "",
        p.notes || "",
        ...rawTags,
      ]
        .join(" ")
        .toLowerCase();

      return {
        profile: p,
        macro,
        isPrivate,
        searchCorpus,
        tagSet,
        tagLowerList,
      };
    });
  }, [profiles]);

  // Filtered Profiles (Blazing fast O(1) checks)
  const filteredProfiles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const hasSearch = q.length > 0;
    const lowerSelectedTags = selectedTaxonomyTags.map((t) => t.toLowerCase().trim());
    const hasTags = lowerSelectedTags.length > 0;

    return indexedProfiles
      .filter(({ profile: p, macro, isPrivate, searchCorpus, tagSet, tagLowerList }) => {
        const ai = p.aiAnalysis;

        // 1. Search Query (Fast single substring lookup)
        if (hasSearch && !searchCorpus.includes(q)) {
          return false;
        }

        // 2. Macro Entity Filter
        if (selectedMacroEntity !== "all" && macro !== selectedMacroEntity) {
          return false;
        }

        // 3. Dedicated "No privati" filter
        if (noPrivate && isPrivate) {
          return false;
        }

        // 4. Status Filter
        if (statusFilter === "analyzed" && !p.isAnalyzed) return false;
        if (statusFilter === "pending" && p.isAnalyzed) return false;
        if (statusFilter === "favorites" && !p.isFavorite) return false;

        // 5. Geo Filter (City vs Region)
        if (selectedGeo !== "all") {
          if (geoMode === "city") {
            if (ai?.locationCity !== selectedGeo) return false;
          } else {
            const region = ai?.locationRegion || ai?.locationState;
            if (region !== selectedGeo) return false;
          }
        }

        // 6. Work Space Mode Filter
        if (selectedWorkMode !== "all") {
          if (ai?.workMode !== selectedWorkMode) return false;
        }

        // 7. Additive Cascading Taxonomy Tags Filter
        if (hasTags) {
          if (taxonomyMatchMode === "or") {
            const hasAny = lowerSelectedTags.some(
              (sel) => tagSet.has(sel) || tagLowerList.some((pt) => pt.includes(sel) || sel.includes(pt))
            );
            if (!hasAny) return false;
          } else {
            const hasAll = lowerSelectedTags.every(
              (sel) => tagSet.has(sel) || tagLowerList.some((pt) => pt.includes(sel) || sel.includes(pt))
            );
            if (!hasAll) return false;
          }
        }

        return true;
      })
      .map((item) => item.profile);
  }, [
    indexedProfiles,
    searchQuery,
    selectedMacroEntity,
    noPrivate,
    statusFilter,
    geoMode,
    selectedGeo,
    selectedWorkMode,
    selectedTaxonomyTags,
    taxonomyMatchMode,
  ]);

  // Taxonomy Tag Handlers (Additive)
  const handleToggleTaxonomyTag = (tag: string) => {
    setSelectedTaxonomyTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearTaxonomyTags = () => {
    setSelectedTaxonomyTags([]);
  };

  const handleAddCustomCategory = (categoryName: string) => {
    if (!customCategories.includes(categoryName)) {
      setCustomCategories((prev) => [...prev, categoryName]);
      showToast(`Nuova categoria aggiunta: "${categoryName}"`);
    }
  };

  // Reset all filters
  const handleResetAllFilters = () => {
    setSearchQuery("");
    setSelectedMacroEntity("all");
    setNoPrivate(false);
    setStatusFilter("all");
    setSelectedGeo("all");
    setSelectedWorkMode("all");
    setSelectedTaxonomyTags([]);
  };

  const isAnyFilterActive =
    searchQuery.trim().length > 0 ||
    selectedMacroEntity !== "all" ||
    noPrivate ||
    statusFilter !== "all" ||
    selectedGeo !== "all" ||
    selectedWorkMode !== "all" ||
    selectedTaxonomyTags.length > 0;

  // Toggle favorite status
  const handleToggleFavorite = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
    if (selectedProfileForDetail?.id === id) {
      setSelectedProfileForDetail((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null
      );
    }
  };

  // Full manual update of profile from StudioDetailModal
  const handleUpdateProfile = (updatedProfile: InstagramProfile) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === updatedProfile.id ? updatedProfile : p))
    );
    if (selectedProfileForDetail?.id === updatedProfile.id) {
      setSelectedProfileForDetail(updatedProfile);
    }
    showToast(`Scheda aggiornata: "${updatedProfile.aiAnalysis?.displayName || updatedProfile.username}"`);
  };

  // Immediate update from online AI analysis (single or queue)
  const handleUpdateProfileAnalysis = (profileId: string, aiAnalysis: any) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === profileId
          ? {
              ...p,
              isAnalyzed: true,
              isAnalyzing: false,
              error: undefined,
              aiAnalysis,
            }
          : p
      )
    );
    if (selectedProfileForDetail?.id === profileId) {
      setSelectedProfileForDetail((prev) =>
        prev
          ? {
              ...prev,
              isAnalyzed: true,
              isAnalyzing: false,
              error: undefined,
              aiAnalysis,
            }
          : null
      );
    }
  };

  // Single profile 1-click online analysis
  const handleAnalyzeSingleProfile = async (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;

    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAnalyzing: true, error: undefined } : p))
    );
    showToast(`Analisi di @${profile.username} con Gemini in corso...`);

    const result = await analyzeProfileOnline({
      username: profile.username,
      profileUrl: profile.profileUrl,
      displayName: profile.displayName || profile.aiAnalysis?.displayName,
      notes: profile.notes,
    });

    if (result.success && result.aiAnalysis) {
      handleUpdateProfileAnalysis(id, result.aiAnalysis);
      showToast(`@${profile.username} analizzato con successo!`);
    } else {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                isAnalyzing: false,
                error: result.error || "Errore di analisi",
              }
            : p
        )
      );
      showToast(result.error || `Errore durante l'analisi di @${profile.username}`);
    }
  };

  // Delete profile
  const handleDeleteProfile = (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    const targetName = profile?.aiAnalysis?.displayName || profile?.displayName || profile?.username;
    setConfirmModalConfig({
      isOpen: true,
      actionType: "delete_profile",
      targetName: targetName ? `@${targetName}` : undefined,
      onConfirm: () => {
        setProfiles((prev) => prev.filter((p) => p.id !== id));
        showToast("Profilo rimosso dal taccuino.");
      },
    });
  };

  // Mark profile as Private/Friend (with centered confirmation modal)
  const handleMarkAsPrivate = (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    const targetName = profile?.aiAnalysis?.displayName || profile?.displayName || profile?.username;

    setConfirmModalConfig({
      isOpen: true,
      actionType: "mark_as_private",
      targetName: targetName ? `@${targetName}` : undefined,
      onConfirm: () => {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  isPrivatePerson: true,
                  isAnalyzed: true,
                  aiAnalysis: {
                    ...p.aiAnalysis,
                    displayName: p.displayName || p.username,
                    category: "Persona Privata / Amico",
                    macroEntity: "privato",
                    studioType: "Persona Privata",
                    isPrivatePerson: true,
                    locationCity: p.aiAnalysis?.locationCity || "",
                    locationCountry: p.aiAnalysis?.locationCountry || "",
                    countryCode: p.aiAnalysis?.countryCode || "",
                    visualStyle: "",
                    keySpecialties: [],
                    description: "Profilo personale o privato.",
                    analyzedAt: p.aiAnalysis?.analyzedAt || new Date().toISOString(),
                  },
                }
              : p
          )
        );
        if (selectedProfileForDetail?.id === id) {
          setSelectedProfileForDetail((prev) =>
            prev
              ? {
                  ...prev,
                  isPrivatePerson: true,
                  isAnalyzed: true,
                  aiAnalysis: {
                    ...prev.aiAnalysis,
                    displayName: prev.displayName || prev.username,
                    category: "Persona Privata / Amico",
                    macroEntity: "privato",
                    studioType: "Persona Privata",
                    isPrivatePerson: true,
                    locationCity: prev.aiAnalysis?.locationCity || "",
                    locationCountry: prev.aiAnalysis?.locationCountry || "",
                    countryCode: prev.aiAnalysis?.countryCode || "",
                    visualStyle: "",
                    keySpecialties: [],
                    description: "Profilo personale o privato.",
                    analyzedAt: prev.aiAnalysis?.analyzedAt || new Date().toISOString(),
                  },
                }
              : null
          );
        }
        showToast(`Profilo "${targetName || id}" contrassegnato come Privato/Amico`);
      },
    });
  };

  // Reset analysis for a single profile (with centered confirmation modal)
  const handleResetProfileAnalysis = (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    const targetName = profile?.aiAnalysis?.displayName || profile?.displayName || profile?.username;

    setConfirmModalConfig({
      isOpen: true,
      actionType: "reset_profile_analysis",
      targetName: targetName ? `@${targetName}` : undefined,
      onConfirm: () => {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  isAnalyzed: false,
                  aiAnalysis: undefined,
                  errorCode: undefined,
                  error: undefined,
                }
              : p
          )
        );
        if (selectedProfileForDetail?.id === id) {
          setSelectedProfileForDetail((prev) =>
            prev
              ? {
                  ...prev,
                  isAnalyzed: false,
                  aiAnalysis: undefined,
                  errorCode: undefined,
                  error: undefined,
                }
              : null
          );
        }
        showToast(`Analisi smarcata per "${targetName || id}". Pronto per nuova estrazione.`);
      },
    });
  };

  // Import profiles handler
  const handleImport = (newProfiles: InstagramProfile[], replace: boolean) => {
    if (replace) {
      setProfiles(newProfiles);
      showToast(`Importazione completata: ${newProfiles.length} profili caricati.`);
    } else {
      const existingUsernames = new Set(profiles.map((p) => p.username.toLowerCase()));
      const filtered = newProfiles.filter(
        (p) => !existingUsernames.has(p.username.toLowerCase())
      );
      setProfiles((prev) => [...prev, ...filtered]);
      showToast(`Aggiunti ${filtered.length} nuovi profili al taccuino.`);
    }
  };

  // Import Gemini Pro Offline JSON (Supports single unified file or multiple batch files selected at once)
  const handleImportGeminiPro = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readFileAsText = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = () => reject(new Error(`Errore di lettura del file ${file.name}`));
        reader.readAsText(file);
      });
    };

    try {
      const allRawItems: any[] = [];
      const fileCount = files.length;

      for (let i = 0; i < fileCount; i++) {
        const text = await readFileAsText(files[i]);
        try {
          const parsed = JSON.parse(text);
          let rawList: any[] = [];

          if (Array.isArray(parsed)) {
            if (parsed.length > 0 && Array.isArray(parsed[0])) {
              rawList = parsed.flat();
            } else {
              rawList = parsed;
            }
          } else if (parsed && typeof parsed === "object") {
            if (Array.isArray(parsed.results)) rawList = parsed.results;
            else if (Array.isArray(parsed.profiles)) rawList = parsed.profiles;
            else if (Array.isArray(parsed.profiliTotali)) rawList = parsed.profiliTotali;
            else if (Array.isArray(parsed.data)) rawList = parsed.data;
            else if (Array.isArray(parsed.lotti)) {
              rawList = parsed.lotti.flatMap((l: any) => l.profili || l.profiles || l.results || l);
            } else if (Array.isArray(parsed.batches)) {
              rawList = parsed.batches.flatMap((b: any) => b.profiles || b.results || b);
            } else if (parsed.username && parsed.aiAnalysis) {
              rawList = [parsed];
            }
          }
          allRawItems.push(...rawList);
        } catch (err) {
          console.warn(`File ${files[i].name} non e un JSON valido.`);
        }
      }

      if (allRawItems.length === 0) {
        showToast("Errore: nessun profilo analizzato trovato nei file JSON selezionati.");
        return;
      }

      setProfiles((prev) => {
        let updatedCount = 0;
        const updatedProfiles = prev.map((p) => {
          const importedMatch = allRawItems.find(
            (imp: any) =>
              imp.username?.toLowerCase() === p.username.toLowerCase() && imp.aiAnalysis
          );
          if (importedMatch) {
            updatedCount++;
            const impAi = importedMatch.aiAnalysis;
            return {
              ...p,
              isAnalyzed: true,
              isAnalyzing: false,
              isPrivatePerson: impAi.isPrivatePerson ?? false,
              error: undefined,
              errorCode: undefined,
              displayName: impAi.displayName || p.displayName,
              aiAnalysis: {
                displayName: impAi.displayName || "",
                macroEntity: impAi.macroEntity,
                category: impAi.category || "",
                subType: impAi.subType || impAi.studioType || "",
                studioType: impAi.studioType || impAi.subType || "",
                isPrivatePerson: impAi.isPrivatePerson ?? false,
                locationCity: impAi.locationCity || "",
                locationRegion: impAi.locationRegion || impAi.locationState || "",
                locationCountry: impAi.locationCountry || "",
                countryCode: impAi.countryCode || "",
                locationState: impAi.locationState || "",
                locationStreet: impAi.locationStreet || "",
                workMode: impAi.workMode || "in_sede",
                subCategories: Array.isArray(impAi.subCategories) ? impAi.subCategories : [],
                mapsLinks: Array.isArray(impAi.mapsLinks) ? impAi.mapsLinks : [],
                visualStyle: impAi.visualStyle || "",
                keySpecialties: Array.isArray(impAi.keySpecialties) ? impAi.keySpecialties : [],
                designTags: Array.isArray(impAi.designTags) ? impAi.designTags : [],
                description: impAi.description || "",
                website: impAi.website || "",
                analyzedAt: new Date().toISOString(),
              },
            };
          }
          return p;
        });
        showToast(
          `Importazione completata con successo! Aggiornati ${updatedCount} profili da ${fileCount} file.`
        );
        return updatedProfiles;
      });
    } catch (err: any) {
      showToast("Errore durante l'elaborazione dei file JSON.");
    } finally {
      e.target.value = "";
    }
  };

  // Reset to initial curated sample
  const handleResetToSample = () => {
    setConfirmModalConfig({
      isOpen: true,
      actionType: "reset_sample",
      onConfirm: () => {
        setProfiles(INITIAL_STUDIOS);
        showToast("Database ripristinato ai profili di esempio.");
      },
    });
  };

  const handleClearAnalyses = () => {
    setConfirmModalConfig({
      isOpen: true,
      actionType: "clear_analyses",
      onConfirm: () => {
        setProfiles((prev) =>
          prev.map((p) => ({
            ...p,
            isAnalyzed: false,
            aiAnalysis: undefined,
            errorCode: undefined,
            error: undefined,
          }))
        );
        showToast("Risultati delle analisi cancellati. Profili pronti per nuova analisi.");
      },
    });
  };

  const handleClearAllProfiles = () => {
    setConfirmModalConfig({
      isOpen: true,
      actionType: "clear_all",
      onConfirm: () => {
        setProfiles([]);
        showToast("Taccuino svuotato interamente.");
      },
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#181716] text-[#F7F4EB]' : 'bg-[#F7F4EB] text-[#1C1A17]'} font-sans flex flex-col selection:bg-[#FFD13B] selection:text-[#1C1A17] transition-colors`}>
      {/* App Header */}
      <Header
        profiles={profiles}
        onOpenImport={() => setIsImportModalOpen(true)}
        onResetToSample={handleResetToSample}
        onClearAnalyses={handleClearAnalyses}
        onClearAllProfiles={handleClearAllProfiles}
        onImportGeminiPro={handleImportGeminiPro}
        onOpenExportGemini={() => setIsExportGeminiModalOpen(true)}
        onOpenAutoAnalysis={() => setIsAutoAnalysisModalOpen(true)}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Top Filter Bar: Search, Macro Entity Tabs, No Privati, Status, Geo, Work Mode */}
        <CategoryFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedMacroEntity={selectedMacroEntity}
          onMacroEntityChange={setSelectedMacroEntity}
          macroCounts={macroCounts}
          noPrivate={noPrivate}
          onToggleNoPrivate={() => setNoPrivate((prev) => !prev)}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          geoMode={geoMode}
          onGeoModeChange={setGeoMode}
          selectedGeo={selectedGeo}
          onGeoChange={setSelectedGeo}
          availableCities={availableCities}
          availableRegions={availableRegions}
          selectedWorkMode={selectedWorkMode}
          onWorkModeChange={setSelectedWorkMode}
          workModeCounts={workModeCounts}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFilteredCount={filteredProfiles.length}
          totalCount={profiles.length}
          theme={theme}
          onResetAllFilters={handleResetAllFilters}
          isAnyFilterActive={isAnyFilterActive}
          selectedTaxonomyCount={selectedTaxonomyTags.length}
          isTaxonomyOpen={isTaxonomyOpen}
          onToggleTaxonomy={() => setIsTaxonomyOpen((prev) => !prev)}
        />

        {/* Prominent Cascading Multi-Select Taxonomy Filter Section ("Sotto tutto i filtri delle categorie...") */}
        <TaxonomyFilterBar
          isOpen={isTaxonomyOpen}
          onToggleOpen={() => setIsTaxonomyOpen((prev) => !prev)}
          selectedTags={selectedTaxonomyTags}
          onToggleTag={handleToggleTaxonomyTag}
          onClearTags={handleClearTaxonomyTags}
          profiles={profiles}
          theme={theme}
          matchMode={taxonomyMatchMode}
          onMatchModeChange={setTaxonomyMatchMode}
          customCategories={customCategories}
          onAddCustomCategory={handleAddCustomCategory}
          selectedMacroEntity={selectedMacroEntity}
          onMacroEntityChange={setSelectedMacroEntity}
        />


        {/* View Renderings */}
        {viewMode === "table" && (
          <StudioTable
            profiles={filteredProfiles}
            onSelectProfile={(profile) => setSelectedProfileForDetail(profile)}
            onToggleFavorite={handleToggleFavorite}
            onDeleteProfile={handleDeleteProfile}
            onResetProfileAnalysis={handleResetProfileAnalysis}
            onMarkAsPrivate={handleMarkAsPrivate}
            onAnalyzeSingle={handleAnalyzeSingleProfile}
            theme={theme}
          />
        )}

        {viewMode === "cards" && (
          <div>
            {filteredProfiles.length === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-[#22201D] text-[#A8A29E] border-[#38332E]' : 'bg-[#FFFDF7] text-[#6B635B] border-[#1C1A17]'} rounded-2xl border-2 border-dashed p-12 text-center shadow-doodle-sm`}>
                <p className={`font-hand font-bold text-lg ${theme === 'dark' ? 'text-[#F7F4EB]' : 'text-[#1C1A17]'}`}>
                  Nessun profilo trovato nel taccuino con i filtri selezionati.
                </p>
                <p className="font-sans text-xs opacity-75 mt-1">
                  Prova ad azzerare i filtri o la ricerca.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProfiles.map((profile) => (
                  <StudioCard
                    key={profile.id}
                    profile={profile}
                    onSelect={() => setSelectedProfileForDetail(profile)}
                    onToggleFavorite={() => handleToggleFavorite(profile.id)}
                    onResetProfileAnalysis={() => handleResetProfileAnalysis(profile.id)}
                    onMarkAsPrivate={() => handleMarkAsPrivate(profile.id)}
                    onAnalyzeSingle={() => handleAnalyzeSingleProfile(profile.id)}
                    theme={theme}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === "map" && (
          <StudioMap
            profiles={filteredProfiles}
            onSelectProfile={(profile) => setSelectedProfileForDetail(profile)}
            theme={theme}
          />
        )}

        {viewMode === "graph" && (
          <StudioGraph
            profiles={filteredProfiles}
            onSelectProfile={(profile) => setSelectedProfileForDetail(profile)}
            theme={theme}
          />
        )}

        {viewMode === "insights" && (
          <StudioInsights
            profiles={profiles}
            onFilterByCategory={(cat) => {
              handleToggleTaxonomyTag(cat);
              setViewMode("cards");
            }}
            onFilterByCountry={(country) => {
              setGeoMode("city");
              setSelectedGeo(country);
              setViewMode("cards");
            }}
            onFilterByEntityKind={(kind) => {
              setSelectedMacroEntity(kind as FilterMacroEntity);
              setViewMode("cards");
            }}
            onFilterBySubType={(subType) => {
              handleToggleTaxonomyTag(subType);
              setViewMode("cards");
            }}
            theme={theme}
          />
        )}
      </main>

      {/* Footer */}
      <footer className={`${theme === 'dark' ? 'bg-[#22201D] text-[#A8A29E] border-[#38332E]' : 'bg-[#FAF7F0] text-[#6B635B] border-[#1C1A17]'} border-t-2 py-6 mt-12 text-xs transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className={`flex items-center gap-2 font-hand font-bold text-sm ${theme === 'dark' ? 'text-[#F7F4EB]' : 'text-[#1C1A17]'}`}>
            <span>Curator AI · Taccuino di Design, Architettura & Imprese</span>
            <span className="text-[#E63946]">●</span>
            <span className="font-typewriter text-xs opacity-75">disegnato con pastelli e penna</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-hand font-bold opacity-80">
            <span>Esportazione rapida Excel (.xlsx) & CSV</span>
            <span>•</span>
            <span>Archivio locale sicuro</span>
          </div>
        </div>
      </footer>

      {/* Import / Meta Guide Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        theme={theme}
      />

      {/* Export Gemini Pro Modal */}
      <ExportGeminiModal
        isOpen={isExportGeminiModalOpen}
        onClose={() => setIsExportGeminiModalOpen(false)}
        profiles={profiles}
        theme={theme}
      />

      {/* Auto Online Analysis Queue Modal (Gemini Free) */}
      <AutoAnalysisQueueModal
        isOpen={isAutoAnalysisModalOpen}
        onClose={() => setIsAutoAnalysisModalOpen(false)}
        profiles={profiles}
        onUpdateProfileAnalysis={handleUpdateProfileAnalysis}
        isDark={theme === 'dark'}
      />

      {/* Studio Detail Modal with full manual editing and smart autocomplete */}
      <StudioDetailModal
        profile={selectedProfileForDetail}
        isOpen={selectedProfileForDetail !== null}
        onClose={() => setSelectedProfileForDetail(null)}
        onUpdateProfile={handleUpdateProfile}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDeleteProfile}
        onResetProfileAnalysis={handleResetProfileAnalysis}
        allNotebookTags={allNotebookTags}
        theme={theme}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        actionType={confirmModalConfig.actionType}
        targetName={confirmModalConfig.targetName}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.onConfirm}
        theme={theme}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in-50 slide-in-from-bottom-5">
          <div className={`flex items-center gap-2.5 py-3 px-4 rounded-2xl border-2 shadow-doodle-lg ${
            theme === 'dark'
              ? 'bg-[#22201D] text-[#F7F4EB] border-[#E5DFD2]'
              : 'bg-[#FFF9E6] text-[#1C1A17] border-[#1C1A17]'
          }`}>
            <Check className="w-4 h-4 text-[#38B000] shrink-0" />
            <span className="font-hand font-bold text-sm">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
