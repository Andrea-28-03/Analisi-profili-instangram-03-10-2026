import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  ChevronDown,
  Settings,
  Trash2,
  Eraser,
  Database,
  PenTool,
  Bookmark,
  Sun,
  Moon,
} from "lucide-react";
import { InstagramProfile } from "../types";
import { exportToExcel, exportToCSV, copyToClipboardTSV, exportToJSON } from "../utils/exportUtils";
import { CrayonLogo } from "./CrayonLogo";
import { SketchbookMascot } from "./SketchbookMascot";

interface HeaderProps {
  profiles: InstagramProfile[];
  onOpenImport: () => void;
  onResetToSample: () => void;
  onClearAnalyses: () => void;
  onClearAllProfiles: () => void;
  onImportGeminiPro: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenExportGemini: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export const Header: React.FC<HeaderProps> = ({
  profiles,
  onOpenImport,
  onResetToSample,
  onClearAnalyses,
  onClearAllProfiles,
  onImportGeminiPro,
  onOpenExportGemini,
  theme,
  onThemeChange,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const totalCount = profiles.length;
  const analyzedCount = profiles.filter((p) => p.isAnalyzed).length;
  const pendingCount = totalCount - analyzedCount;
  const countriesCount = new Set(
    profiles.map((p) => p.aiAnalysis?.locationCountry).filter(Boolean)
  ).size;
  const favoritesCount = profiles.filter((p) => p.isFavorite).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyTSV = async () => {
    await copyToClipboardTSV(profiles);
    setCopiedNotification(true);
    setShowExportMenu(false);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const headerBg = theme === 'dark' ? 'bg-[#181716] text-[#F7F4EB] border-[#E5DFD2]' : 'bg-[#FAF7F0] text-[#1C1A17] border-[#1C1A17]';
  const btnBg = theme === 'dark' ? 'bg-[#22201D] text-[#F7F4EB] border-[#E5DFD2] hover:bg-[#2C2A26]' : 'bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17] hover:bg-[#FFF4D9]';
  const dropdownBg = theme === 'dark' ? 'bg-[#22201D] text-[#F7F4EB] border-[#E5DFD2]' : 'bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17]';

  return (
    <header className={`${headerBg} border-b-2 relative z-40 shadow-sm transition-colors`}>
      {/* Top playful notebook edge decorative dots */}
      <div className="h-1.5 w-full bg-repeating-linear-gradient flex items-center justify-around opacity-30 px-4">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-[#F7F4EB]' : 'bg-[#1C1A17]'} inline-block`} />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand & Companion Mascot */}
          <div className="flex items-center justify-between gap-3">
            <CrayonLogo />
            <div className="md:hidden">
              <SketchbookMascot totalCount={totalCount} curatedCount={favoritesCount} />
            </div>
          </div>

          {/* Actions & Companion */}
          <div className="flex items-center overflow-visible pb-1 md:pb-0 gap-2 sm:gap-3 w-full md:w-auto justify-end flex-wrap md:flex-nowrap">
            <div className="hidden md:block">
              <SketchbookMascot totalCount={totalCount} curatedCount={favoritesCount} />
            </div>

            {/* Import Button */}
            <button
              id="import-btn"
              onClick={onOpenImport}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium border-2 shadow-doodle-sm btn-doodle cursor-pointer whitespace-nowrap ${btnBg}`}
              title="Importa da file JSON di Instagram o incolla lista"
            >
              <Upload className="w-3.5 h-3.5 text-[#E63946]" />
              <span className="font-hand text-sm font-bold">Importa</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                id="export-dropdown-btn"
                onClick={() => {
                  setShowExportMenu(!showExportMenu);
                  setShowSettingsMenu(false);
                }}
                disabled={totalCount === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[#FFD13B] hover:bg-[#FFC01E] border-2 border-[#1C1A17] text-[#1C1A17] shadow-doodle-sm btn-doodle cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="font-hand text-sm font-bold">Esporta</span>
                <ChevronDown className="w-3 h-3 text-[#1C1A17]" />
              </button>

              {showExportMenu && (
                <div className={`absolute right-0 mt-2 w-60 rounded-xl shadow-doodle-lg border-2 py-2 z-50 text-xs animate-in fade-in-50 zoom-in-95 ${dropdownBg}`}>
                  <div className="px-3.5 py-1 text-[10px] font-typewriter uppercase tracking-wider opacity-80 border-b border-current mb-1 flex items-center justify-between">
                    <span>Formati Archivio</span>
                    <span className="text-[#38B000] font-bold">● pronto</span>
                  </div>

                  <button
                    id="export-excel-btn"
                    onClick={() => {
                      exportToExcel(profiles);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#FFD13B]/30 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#38B000]/15 border border-[#38B000] flex items-center justify-center text-[#2D9C5E] shrink-0">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold font-hand text-sm">Foglio Excel (.xlsx)</div>
                      <div className="text-[11px] opacity-75">
                        Formattato con link e stili
                      </div>
                    </div>
                  </button>

                  <button
                    id="export-csv-btn"
                    onClick={() => {
                      exportToCSV(profiles);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#FFD13B]/30 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#3A86FF]/15 border border-[#3A86FF] flex items-center justify-center text-[#0050C8] shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold font-hand text-sm">File CSV (UTF-8)</div>
                      <div className="text-[11px] opacity-75">
                        Per Google Sheets o Notion
                      </div>
                    </div>
                  </button>

                  <button
                    id="export-clipboard-btn"
                    onClick={handleCopyTSV}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#FFD13B]/30 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#FFBE0B]/20 border border-[#FB8500] flex items-center justify-center text-[#B7791F] shrink-0">
                      <Copy className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold font-hand text-sm">Copia per Fogli</div>
                      <div className="text-[11px] opacity-75">
                        Incolla direttamente con Ctrl+V
                      </div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-current opacity-20" />

                  <button
                    id="export-json-btn"
                    onClick={() => {
                      exportToJSON(profiles);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#FFD13B]/30 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#8338EC]/15 border border-[#8338EC] flex items-center justify-center text-[#5A189A] shrink-0">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold font-hand text-sm">Backup Taccuino (.json)</div>
                      <div className="text-[11px] opacity-75">
                        Archivio re-importabile
                      </div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-current opacity-20" />
                  <div className="px-3.5 py-1 text-[10px] font-typewriter uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#E63946]" />
                    <span>Gemini Batch Offline</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      onOpenExportGemini();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#FFD13B]/30 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 opacity-75" />
                    <div>
                      <div className="font-hand font-bold text-sm">Dividi per Lotti</div>
                      <div className="text-[11px] opacity-75">
                        Analisi esterna con Gemini Pro
                      </div>
                    </div>
                  </button>

                  <label className="w-full text-left px-3.5 py-2 hover:bg-[#FFD13B]/30 flex items-center gap-2.5 transition cursor-pointer">
                    <input 
                      type="file" 
                      accept=".json" 
                      className="hidden" 
                      onChange={(e) => {
                        onImportGeminiPro(e);
                        setShowExportMenu(false);
                      }} 
                    />
                    <Upload className="w-4 h-4 opacity-75" />
                    <div>
                      <div className="font-hand font-bold text-sm">Carica analisi (.json)</div>
                      <div className="text-[11px] opacity-75">
                        Importa lotti analizzati
                      </div>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Settings Dropdown */}
            <div className="relative" ref={settingsMenuRef}>
              <button
                onClick={() => {
                  setShowSettingsMenu(!showSettingsMenu);
                  setShowExportMenu(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border-2 shadow-doodle-sm btn-doodle cursor-pointer whitespace-nowrap ${btnBg}`}
                title="Opzioni e Temi"
              >
                <Settings className="w-3.5 h-3.5 opacity-80" />
                <span className="font-hand text-sm font-bold hidden sm:inline">Opzioni</span>
              </button>

              {showSettingsMenu && (
                <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-doodle-lg border-2 py-2 z-50 text-xs animate-in fade-in-50 zoom-in-95 ${dropdownBg}`}>
                  <div className="px-3.5 py-1 text-[10px] font-typewriter uppercase tracking-wider opacity-80 border-b border-current mb-1">
                    Aspetto & Temi
                  </div>

                  {/* Theme Switcher */}
                  <div className="px-3.5 py-2 flex items-center justify-between">
                    <span className="font-hand font-bold text-sm">Tema Taccuino</span>
                    <div className="inline-flex rounded-lg bg-black/10 p-0.5 border border-current">
                      <button
                        onClick={() => {
                          onThemeChange('light');
                          setShowSettingsMenu(false);
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-hand font-bold flex items-center gap-1 transition ${
                          theme === 'light' ? 'bg-[#FFD13B] text-[#1C1A17] shadow-xs' : 'opacity-70 hover:opacity-100'
                        }`}
                        title="Tema Chiaro: Carta da Disegno & Pastelli"
                      >
                        <Sun className="w-3 h-3" />
                        <span>Chiaro</span>
                      </button>
                      <button
                        onClick={() => {
                          onThemeChange('dark');
                          setShowSettingsMenu(false);
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-hand font-bold flex items-center gap-1 transition ${
                          theme === 'dark' ? 'bg-[#3A86FF] text-white shadow-xs' : 'opacity-70 hover:opacity-100'
                        }`}
                        title="Tema Scuro: Taccuino Notturno & Gessetti"
                      >
                        <Moon className="w-3 h-3" />
                        <span>Scuro</span>
                      </button>
                    </div>
                  </div>

                  <div className="my-1 border-t border-current opacity-20" />
                  <div className="px-3.5 py-1 text-[10px] font-typewriter uppercase tracking-wider opacity-80">
                    Gestione Dati
                  </div>
                  
                  <button
                    onClick={() => {
                      onClearAnalyses();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#FFD13B]/30 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Eraser className="w-4 h-4 text-[#FF7844]" />
                    <div>
                      <div className="font-hand font-bold text-sm">Cancella Tratti AI</div>
                      <div className="text-[11px] opacity-75">
                        Svuota le analisi per rifarle
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onClearAllProfiles();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-[#E63946] hover:bg-[#FEE2E2] flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-[#E63946]" />
                    <div>
                      <div className="font-hand font-bold text-sm text-[#E63946]">Strappa Pagine (Elimina Tutto)</div>
                      <div className="text-[11px] opacity-75">
                        Svuota interamente il database
                      </div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-current opacity-20" />

                  <button
                    onClick={() => {
                      onResetToSample();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#FFD13B]/30 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-[#3A86FF]" />
                    <div>
                      <div className="font-hand font-bold text-sm">Ripristina 15 Studi Esempio</div>
                      <div className="text-[11px] opacity-75">
                        Ricarica il set curato (Pentagram, Sagmeister...)
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Copied Notification Banner */}
        {copiedNotification && (
          <div className="mt-3 py-2 px-3.5 bg-[#FFF9E6] border-2 border-[#1C1A17] rounded-xl text-xs text-[#1C1A17] flex items-center gap-2 shadow-doodle-sm animate-bounce">
            <Check className="w-4 h-4 text-[#38B000]" />
            <span className="font-hand text-sm font-bold">
              Tabella copiata negli appunti! Ora puoi incollarla con Ctrl+V nel tuo foglio di calcolo.
            </span>
          </div>
        )}

        {/* Tactile Sketchbook Metrics Strip */}
        <div className={`mt-3.5 pt-2.5 border-t ${theme === 'dark' ? 'border-[#38332E]' : 'border-[#E5DFD2]'} flex items-center gap-5 sm:gap-8 text-xs opacity-90 overflow-x-auto no-scrollbar`}>
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E63946] border border-current" />
            <span className="font-typewriter text-lg font-bold">{totalCount}</span>
            <span className="font-hand text-sm font-bold">Profili</span>
          </div>

          <div className={`h-4 w-[1px] ${theme === 'dark' ? 'bg-[#38332E]' : 'bg-[#D6CEBF]'}`} />

          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38B000] border border-current" />
            <span className="font-typewriter text-lg font-bold">{analyzedCount}</span>
            <span className="font-hand text-sm font-bold">Analizzati</span>
          </div>

          {pendingCount > 0 && (
            <>
              <div className={`h-4 w-[1px] ${theme === 'dark' ? 'bg-[#38332E]' : 'bg-[#D6CEBF]'}`} />
              <div className="flex items-center gap-2 shrink-0 text-[#D97706]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBE0B] border border-current animate-pulse" />
                <span className="font-typewriter text-lg font-bold">{pendingCount}</span>
                <span className="font-hand text-sm font-bold">In attesa</span>
              </div>
            </>
          )}

          <div className={`h-4 w-[1px] ${theme === 'dark' ? 'bg-[#38332E]' : 'bg-[#D6CEBF]'}`} />

          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3A86FF] border border-current" />
            <span className="font-typewriter text-lg font-bold">{countriesCount}</span>
            <span className="font-hand text-sm font-bold">Paesi e Città</span>
          </div>

          <div className={`h-4 w-[1px] ${theme === 'dark' ? 'bg-[#38332E]' : 'bg-[#D6CEBF]'}`} />

          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E8E] border border-current" />
            <span className="font-typewriter text-lg font-bold">{favoritesCount}</span>
            <span className="font-hand text-sm font-bold">Preferiti ★</span>
          </div>
        </div>
      </div>
    </header>
  );
};
