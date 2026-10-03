import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  FileCode,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { parseInstagramData } from "../utils/instagramParser";
import { InstagramProfile } from "../types";
import { INITIAL_STUDIOS } from "../data/initialStudios";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newProfiles: InstagramProfile[], replace: boolean) => void;
  theme?: 'light' | 'dark';
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport, theme = 'light' }) => {
  const [activeTab, setActiveTab] = useState<"file" | "paste" | "guide">("file");
  const [pastedText, setPastedText] = useState("");
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessText = (content: string, fileName?: string) => {
    try {
      setErrorMsg(null);
      const parsed = parseInstagramData(content, fileName);
      if (parsed.length === 0) {
        setErrorMsg("Nessun profilo Instagram valido trovato nel contenuto inserito.");
        return;
      }
      setSuccessCount(parsed.length);
      setTimeout(() => {
        onImport(parsed, replaceExisting);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(`Errore durante l'elaborazione del file: ${err.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleProcessText(text, file.name);
    };
    reader.onerror = () => {
      setErrorMsg("Impossibile leggere il file selezionato.");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleProcessText(text, file.name);
    };
    reader.readAsText(file);
  };

  const handlePastedSubmit = () => {
    if (!pastedText.trim()) {
      setErrorMsg("Inserisci almeno un username o link Instagram.");
      return;
    }
    handleProcessText(pastedText);
  };

  const handleLoadSample = () => {
    onImport(INITIAL_STUDIOS, true);
    onClose();
  };

  const modalBg = theme === 'dark' ? 'bg-[#22201D] text-[#F7F4EB] border-[#38332E]' : 'bg-[#FFFDF9] text-[#1C1A17] border-[#1C1A17]';
  const headerBg = theme === 'dark' ? 'bg-[#2C2A26] border-[#38332E]' : 'bg-[#F7F4EB] border-[#1C1A17]';
  const subBoxBg = theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#FFFDF7] border-[#1C1A17]';
  const inputBg = theme === 'dark' ? 'bg-[#181716] text-[#F7F4EB] border-[#38332E]' : 'bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div className={`${modalBg} rounded-2xl shadow-doodle-lg border-2 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] relative transition-colors`}>
        {/* Washi tape header accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-28 washi-tape-pink rounded-xs rotate-1 pointer-events-none z-20" />

        {/* Header */}
        <div className={`px-6 py-4 border-b-2 flex items-center justify-between ${headerBg}`}>
          <div>
            <h2 className="text-xl font-bold font-sans">
              Aggiungi profili al taccuino
            </h2>
            <p className="text-xs opacity-75 mt-0.5 font-hand font-bold">
              Carica il file ufficiale di Instagram o incolla gli username da analizzare
            </p>
          </div>
          <button
            id="close-import-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl opacity-75 hover:opacity-100 hover:bg-black/10 border border-transparent hover:border-current transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className={`flex border-b-2 px-6 gap-3 text-xs font-hand font-bold pt-2 overflow-x-auto no-scrollbar ${subBoxBg}`}>
          <button
            id="tab-file-btn"
            onClick={() => {
              setActiveTab("file");
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-t-xl border-t-2 border-x-2 cursor-pointer transition ${
              activeTab === "file"
                ? `${modalBg} border-current -mb-[2px] font-bold text-sm`
                : "border-transparent opacity-75 hover:opacity-100"
            }`}
          >
            File Ufficiale (JSON / HTML)
          </button>
          <button
            id="tab-paste-btn"
            onClick={() => {
              setActiveTab("paste");
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-t-xl border-t-2 border-x-2 cursor-pointer transition ${
              activeTab === "paste"
                ? `${modalBg} border-current -mb-[2px] font-bold text-sm`
                : "border-transparent opacity-75 hover:opacity-100"
            }`}
          >
            Incolla Nomi & Handle
          </button>
          <button
            id="tab-guide-btn"
            onClick={() => {
              setActiveTab("guide");
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-t-xl border-t-2 border-x-2 cursor-pointer transition flex items-center gap-1.5 ${
              activeTab === "guide"
                ? `${modalBg} border-current -mb-[2px] font-bold text-sm`
                : "border-transparent opacity-75 hover:opacity-100"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guida Meta (1 minuto)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
          {errorMsg && (
            <div className="p-3 bg-[#FEE2E2] border-2 border-[#E63946] rounded-xl text-xs text-[#E63946] flex items-center gap-2 font-hand font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 bg-[#DCFCE7] border-2 border-[#166534] rounded-xl text-xs text-[#166534] flex items-center gap-2 font-hand font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Estratti con successo {successCount} profili! Salvataggio nel taccuino...
              </span>
            </div>
          )}

          {/* TAB 1: FILE DRAG & DROP */}
          {activeTab === "file" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                  dragOver
                    ? "border-[#E63946] bg-[#FFF3C4]/20"
                    : theme === 'dark' ? 'border-[#38332E] hover:bg-[#2C2A26] bg-[#181716]' : 'border-[#1C1A17] hover:bg-[#FFF9E6] bg-[#FFFDF7]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json,.html,.txt"
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-full bg-[#FFD13B] border-2 border-[#1C1A17] text-[#1C1A17] flex items-center justify-center shadow-doodle-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-base font-hand font-bold">
                    Trascina qui il file <code className="text-xs px-1.5 py-0.5 rounded border border-current text-[#E63946] font-typewriter">following.json</code>
                  </p>
                  <p className="text-xs opacity-75 mt-1 font-sans">
                    oppure clicca per selezionarlo dal computer (.json, .html, .txt)
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs opacity-70 font-typewriter">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Supporta l'export ufficiale di Instagram</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${subBoxBg}`}>
                <span className="font-hand font-bold text-sm block">Dove trovo questo file?</span>
                <p className="opacity-80">
                  Vai su Instagram &gt; Impostazioni &gt; Centro Gestione Account &gt; Le tue informazioni &gt; Scarica informazioni &gt; Seleziona "Persone che segui" in formato JSON.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: INCOLLA LISTA */}
          {activeTab === "paste" && (
            <div className="space-y-4">
              <p className="text-xs opacity-80">
                Incolla una lista di account Instagram (un handle per riga, es. <code className="font-typewriter text-[#FF5E8E]">@pentagramdesign</code> o link completi):
              </p>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={6}
                placeholder={`@pentagramdesign\n@spin_studio\n@snarkitecture\nhttps://instagram.com/kkaa_official`}
                className={`w-full p-3 border-2 rounded-xl font-typewriter text-xs focus:outline-none shadow-xs ${inputBg}`}
              />
              <button
                onClick={handlePastedSubmit}
                className="w-full py-2.5 rounded-xl bg-[#FFD13B] hover:bg-[#FFC01E] border-2 border-[#1C1A17] font-hand font-bold text-sm text-[#1C1A17] shadow-doodle-sm btn-doodle cursor-pointer"
              >
                Estrai e Aggiungi Profili al Taccuino ↗
              </button>
            </div>
          )}

          {/* TAB 3: GUIDA */}
          {activeTab === "guide" && (
            <div className={`space-y-3 p-4 rounded-xl border-2 ${subBoxBg}`}>
              <h3 className="font-hand font-bold text-base">Come scaricare i seguiti da Instagram in 3 passi:</h3>
              <ol className="list-decimal list-inside space-y-2 text-xs opacity-90">
                <li>Accedi al <strong>Centro gestione account</strong> di Meta su Instagram.</li>
                <li>Scegli <strong>Scarica le tue informazioni</strong> &gt; Scarica o trasferisci informazioni.</li>
                <li>Seleziona <strong>Tipi specifici di informazioni</strong> &gt; spunta solo <strong>"Follower e persone che segui"</strong>.</li>
                <li>Scegli intervallo temporale: <em>Sempre</em> e formato: <strong>JSON</strong>.</li>
                <li>In pochi minuti Instagram ti invierà lo zip: all'interno troverai <code className="font-typewriter px-1 border border-current">following.json</code>.</li>
              </ol>
            </div>
          )}

          {/* Replace toggle */}
          <div className="pt-3 border-t border-current opacity-30 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer font-hand font-bold text-xs opacity-100">
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="rounded border-current text-[#FFD13B] focus:ring-0"
              />
              <span>Sostituisci tutti i profili esistenti (invece di aggiungere)</span>
            </label>

            <button
              onClick={handleLoadSample}
              className="font-hand font-bold text-xs text-[#3A86FF] hover:underline cursor-pointer opacity-100"
            >
              Oppure carica i 15 studi di esempio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
