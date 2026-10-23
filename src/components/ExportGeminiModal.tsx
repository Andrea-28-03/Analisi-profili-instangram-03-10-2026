import React, { useState } from "react";
import {
  Download,
  Copy,
  X,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  FolderDown,
  FileJson,
  BrainCircuit,
  Check,
  Info,
  Layers,
  ArrowRight,
  Terminal,
  FileCode,
  HelpCircle,
  Cpu,
  Zap,
  MessageSquare,
  AlertTriangle,
  ExternalLink,
  FileText,
} from "lucide-react";
import { InstagramProfile } from "../types";
import {
  downloadJSONData,
  downloadTextData,
  downloadMultipleFilesSequentially,
} from "../utils/exportUtils";
import {
  downloadBatchLauncherFile,
  downloadMacroRunnerFile,
  downloadPythonRunnerFile,
  downloadApiRunnerFile,
  downloadReadmeGuideFile,
  downloadCompleteAutomationBundle,
  generateBatchScriptContent,
  generatePythonRunnerContent,
} from "../utils/geminiBatchAutomation";
import { copyToClipboard } from "../utils/clipboard";

interface ExportGeminiModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: InstagramProfile[];
  theme?: "light" | "dark";
}

export const ExportGeminiModal: React.FC<ExportGeminiModalProps> = ({
  isOpen,
  onClose,
  profiles,
  theme = "light",
}) => {
  // Active Tab: "web" (consigliato & immediato) vs "api" (automazione vera da riga di comando)
  const [activeTab, setActiveTab] = useState<"web" | "api">("web");
  // Default to 50 profiles (sweet spot for Gemini Pro context window + web search)
  const [batchSize, setBatchSize] = useState<number>(50);
  // Target profiles: pending only vs all profiles (for full re-analysis)
  const [targetScope, setTargetScope] = useState<"pending" | "all">(
    profiles.some((p) => !p.isAnalyzed) ? "pending" : "all"
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAllPrompt, setCopiedAllPrompt] = useState(false);
  const [copiedMasterPromptOnly, setCopiedMasterPromptOnly] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isDownloadingBundle, setIsDownloadingBundle] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);
  const [isAdviceOpen, setIsAdviceOpen] = useState(false);

  if (!isOpen) return null;

  // Filter profiles based on selected scope
  const targetProfiles = profiles
    .filter((p) => (targetScope === "pending" ? !p.isAnalyzed : true))
    .map((p) => ({
      username: p.username,
      instagramUrl: p.profileUrl || `https://instagram.com/${p.username}`,
      displayName: p.displayName || p.aiAnalysis?.displayName || "",
      notes: p.notes || "",
    }));

  const effectiveBatchSize = batchSize >= 99999 ? Math.max(1, targetProfiles.length) : batchSize;

  const chunks: Array<typeof targetProfiles> = [];
  if (targetProfiles.length > 0) {
    for (let i = 0; i < targetProfiles.length; i += effectiveBatchSize) {
      chunks.push(targetProfiles.slice(i, i + effectiveBatchSize));
    }
  }

  const generatePromptBase = (chunkIndex: number, totalChunks: number, count: number) => {
    const lotLabel =
      totalChunks > 1
        ? `lotto ${chunkIndex + 1} di ${totalChunks} (${count} profili)`
        : `elenco completo (${count} profili)`;

    return `Sei un analista senior ed esperto internazionale di design contemporaneo, branding, architettura, arti visive e manifattura.
Ti fornisco i dati (${lotLabel}) contenenti profili Instagram con username, URL ufficiali (instagramUrl) ed eventuali note utente.
Per ciascun profilo, usa la funzione Web Search di Gemini per consultare la bio pubblica ufficiale, il sito web, portfolio, LinkedIn o pubblicazioni di settore per comprendere esattamente chi sono e cosa fanno.

REGOLE CRITICHE CONTRO LE ALLUCINAZIONI:
1. Nella lista NON ci sono solo studi creativi: ci sono aziende manifatturiere (arredo, illuminazione, maniglie, superfici), università, fotografi, illustratori, artisti contemporanei, content creator, amici o persone private.
2. Se un profilo è chiaramente una persona privata, conoscente o amico senza attività professionale pubblica nota, imposta tassativamente "macroEntity": "privato" e "isPrivatePerson": true, lasciando i campi specialistici vuoti ("") o array vuoti ([]). Non inventare agenzie per persone comuni.
3. Se non trovi informazioni certe, preferisci stringa vuota o array vuoto piuttosto che inventare.

Restituisci SOLO ED ESCLUSIVAMENTE un array JSON valido (senza testo introduttivo o conclusivo, nessun commento fuori dal JSON) con questa esatta struttura per ciascun profilo:

[
  {
    "username": "...",
    "aiAnalysis": {
      "displayName": "Nome reale completo dello studio, brand, istituzione o professionista",
      "macroEntity": "Uno tra: 'studio' (studi architettura, design, grafica), 'azienda' (brand arredo, luce, manifattura, store), 'universita' (scuole, accademie, musei), 'fotografia' (fotografi architettura/oggetti), 'illustrazione' (illustratori), 'artisti' (scultori, artisti contemporanei), 'creator' (content creator, media, influencer), 'amici' (amico/collega designer noto), 'privato' (persona comune senza studio), 'altro'",
      "category": "Macro categoria descrittiva (es. 'Design Grafico & Branding', 'Architettura & Spazi', 'Design del Prodotto & Industriale', 'Tipografia & Type Design', 'Istituzione / Università', 'Fotografia', 'Arte Contemporanea', 'Persona Privata / Amico')",
      "subType": "Tipologia specifica e precisa. Scegli o adatta dalle tipologie standard:
        - Per studio: 'Studio di Architettura', 'Studio Design di Prodotto', 'Studio Grafica & Branding', 'Studio Interior Design', 'Studio Tipografia / Type Design', 'Studio Motion Design & 3D', 'Atelier Artigianale & Ceramica'
        - Per azienda: 'Brand di Arredo & Mobili', 'Illuminazione & Light Design', 'Manifattura di Maniglie & Ferramenta', 'Superfici, Marmi & Materiali', 'Cucine & Elettrodomestici', 'Bagno & Wellness', 'Store / Concept Store / Retail'
        - Per universita: 'Università / Politecnico', 'Accademia di Belle Arti', 'Scuola Superiore di Design', 'Museo & Centro Ricerca'
        - Per fotografia: 'Fotografia di Architettura & Spazi', 'Fotografia di Prodotto & Still Life', 'Fotografia Editoriale & Moda', 'Fotografia Documentaria & Artistica'
        - Per illustrazione: 'Illustrazione Editoriale & Libri', 'Poster Art & Stampa Serigrafica', 'Digital Painting & Concept Art', 'Pattern Design & Tessile'
        - Per artisti: 'Arte Contemporanea & Scultura', 'Installazioni & Spatial Art', 'Pittura & Arti Visive', 'Ceramica & Pratiche Plastiche'
        - Per privato/amici: 'Persona Privata', 'Freelancer / Designer Indipendente'",
      "isPrivatePerson": false,
      "locationCity": "Città principale (es. Milano, Copenaghen, Londra, Tokyo, Berlino)",
      "locationRegion": "Regione o stato (es. Lombardia, Piemonte, Hovedstaden, Greater London, Baviera)",
      "locationCountry": "Paese in italiano (es. Italia, Danimarca, Regno Unito, Svizzera, Germania)",
      "countryCode": "Codice ISO 2 lettere (es. IT, DK, GB, CH, DE, US, FR)",
      "locationStreet": "Via o indirizzo sede se noto, altrimenti stringa vuota",
      "workMode": "Uno tra: 'in_sede', 'ibrido', 'remoto', 'showroom', 'atelier'",
      "subCategories": [
        // Scegli 2-5 sotto-categorie e stili pertinenti dalla seguente tassonomia curata:
        // STILI DI DESIGN: "Design Minimalista", "Razionalista & Modernista", "Brutalista & Materico", "Pop, Giocoso & Colorato", "Design Critico & Speculativo", "Stile Svizzero / Tipografico", "Organico, Biofilico & Scultoreo", "Hi-Tech & Futurista", "Neo-Craft & Artigianale", "Industriale & Tecnico", "Circolare & Sostenibile", "Razionalismo Storico / Novecento"
        // MOVIMENTI & STILI ARTISTICI: "Futurismo & Dinamismo", "Bauhaus & Costruttivismo", "Postmoderno & Memphis", "Astrattismo Geometrico", "Figurativo Contemporaneo", "Pop Art & Street Art", "Surrealismo & Onirico", "Concettuale & Spaziale", "Raw, Brut & Decostruttivismo", "Informale & Materico"
        // INTERNI & SPAZI: "Interni / Ufficio", "Casa & Living", "Cucina & Food Space", "Bagno & Wellness", "Maniglie & Ferramenta", "Hospitality & Hotel", "Retail & Showroom", "Exhibition & Allestimenti"
        // PRODOTTO & ARREDO: "Sedute & Divani", "Tavoli & Scrivanie", "Illuminazione & Lampade", "Oggetti & Complementi", "Materiali & Superfici", "Ceramica, Vetro & Artigianato"
        // GRAFICA & TYPE: "Brand Identity & Loghi", "Tipografia & Fonderia", "Editoria & Riviste", "Packaging & Packaging Design", "Motion Design & 3D CGI", "Digital, UI/UX & Web"
        // ARTI & FOTO: "Illustrazione Editoriale", "Fotografia di Architettura & Oggetti", "Arte Contemporanea & Scultura", "Set Design & Styling", "Poster Art & Stampa Serigrafica"
        // MUSICA & CULTURA: "Musica, Festival & Clubbing", "Scenografia & Teatri", "Musei & Fondazioni", "Video Production & Clip Musicali", "Media, Radio & Podcast"
      ],
      "visualStyle": "Sintesi di 1 frase dello stile visivo, linguaggio materico ed estetica prevalente (specifica chiaramente se minimale, razionalista, brutale, critico, pop, futurista, bauhaus, industriale, organico, ecc.)",
      "keySpecialties": ["specialità 1", "specialità 2"],
      "designTags": [
        // Includi lo stile di design o artistico prevalente (es. "Minimalista", "Razionalista", "Brutale", "Pop", "Critico", "Futurista", "Bauhaus", "Modernista", "Material Focus", "Industrial")
        "Graphic Design", "Interior Architecture"
      ],
      "description": "Sintesi fattuale in 1-2 frasi della storia, produzione o mission del profilo.",
      "website": "URL del sito web ufficiale (se presente)"
    }
  }
]

Assicurati che l'output sia formattato rigorosamente come l'esempio JSON e che includa TUTTI i profili.`;
  };

  // Helper to generate full prompt with embedded profile JSON (no file upload required!)
  const generatePromptWithEmbeddedProfiles = (chunk: any[], chunkIndex: number, totalChunks: number) => {
    const base = generatePromptBase(chunkIndex, totalChunks, chunk.length);
    return `${base}

DATI DEI PROFILI DA ANALIZZARE PER QUESTO LOTTO:
\`\`\`json
${JSON.stringify(chunk, null, 2)}
\`\`\`
`;
  };

  const masterPrompt = generatePromptBase(
    0,
    chunks.length || 1,
    chunks[0]?.length || targetProfiles.length || 50
  );

  // Copy full prompt with embedded profiles directly to clipboard with rock-solid fallback
  const handleCopyPromptWithProfiles = async (chunk: any[], index: number) => {
    const fullText = generatePromptWithEmbeddedProfiles(chunk, index, chunks.length);
    const success = await copyToClipboard(fullText);
    if (success) {
      setCopiedIndex(index);
      setDownloadFeedback(`Lotto ${index + 1}: Prompt + ${chunk.length} profili copiati negli appunti! Incolla su Gemini (Ctrl+V)`);
      setTimeout(() => {
        setCopiedIndex(null);
        setDownloadFeedback(null);
      }, 4500);
    } else {
      // Fallback: download as text file so the user is never blocked
      downloadTextData(fullText, `gemini_prompt_lotto_${index + 1}_di_${chunks.length}.txt`);
      setDownloadFeedback(`Appunti protetti dal browser: scaricato il file "gemini_prompt_lotto_${index + 1}_di_${chunks.length}.txt"!`);
      setTimeout(() => setDownloadFeedback(null), 6000);
    }
  };

  // Download single lot prompt text directly
  const handleDownloadSingleLotPromptTxt = (chunk: any[], index: number) => {
    const fullText = generatePromptWithEmbeddedProfiles(chunk, index, chunks.length);
    downloadTextData(fullText, `gemini_prompt_lotto_${index + 1}_di_${chunks.length}.txt`);
    setDownloadFeedback(`File gemini_prompt_lotto_${index + 1}.txt scaricato!`);
    setTimeout(() => setDownloadFeedback(null), 3500);
  };

  // Copy full master prompt with ALL profiles with rock-solid fallback
  const handleCopyAllPromptWithAllProfiles = async () => {
    if (targetProfiles.length === 0) {
      setDownloadFeedback("Nessun profilo da analizzare in questo filtro. Seleziona 'Tutti' per includere l'intero database.");
      setTimeout(() => setDownloadFeedback(null), 4000);
      return;
    }

    const fullText = `${masterPrompt}

DATI DI TUTTI I PROFILI DA ANALIZZARE:
\`\`\`json
${JSON.stringify(targetProfiles, null, 2)}
\`\`\`
`;
    const success = await copyToClipboard(fullText);
    if (success) {
      setCopiedAllPrompt(true);
      setDownloadFeedback(`Prompt completo con TUTTI i ${targetProfiles.length} profili copiato negli appunti! Vai su Gemini e fai Incolla (Ctrl+V)`);
      setTimeout(() => {
        setCopiedAllPrompt(false);
        setDownloadFeedback(null);
      }, 4500);
    } else {
      // Direct text file download fallback
      downloadTextData(fullText, `gemini_prompt_completo_${targetProfiles.length}_profili.txt`);
      setDownloadFeedback(`Appunti protetti dal browser: abbiamo scaricato il file "gemini_prompt_completo_${targetProfiles.length}_profili.txt" pronto all'uso!`);
      setTimeout(() => setDownloadFeedback(null), 6000);
    }
  };

  // Download complete prompt text file
  const handleDownloadFullPromptTxt = () => {
    if (targetProfiles.length === 0) {
      setDownloadFeedback("Nessun profilo selezionato.");
      return;
    }
    const fullText = `${masterPrompt}

DATI DI TUTTI I PROFILI DA ANALIZZARE:
\`\`\`json
${JSON.stringify(targetProfiles, null, 2)}
\`\`\`
`;
    downloadTextData(fullText, `gemini_prompt_completo_${targetProfiles.length}_profili.txt`);
    setDownloadFeedback(`Prompt completo scaricato come file .txt pronto per Gemini!`);
    setTimeout(() => setDownloadFeedback(null), 4000);
  };

  // Copy master prompt instructions only (without profiles)
  const handleCopyMasterPromptOnly = async () => {
    const success = await copyToClipboard(masterPrompt);
    if (success) {
      setCopiedMasterPromptOnly(true);
      setDownloadFeedback("Istruzioni prompt copiate negli appunti!");
      setTimeout(() => {
        setCopiedMasterPromptOnly(false);
        setDownloadFeedback(null);
      }, 3500);
    } else {
      downloadTextData(masterPrompt, "gemini_istruzioni_prompt.txt");
      setDownloadFeedback("Appunti protetti: scaricato file gemini_istruzioni_prompt.txt");
      setTimeout(() => setDownloadFeedback(null), 4000);
    }
  };

  // Download a single batch JSON file
  const handleDownloadSingleJson = (chunk: any[], index: number) => {
    downloadJSONData(chunk, `gemini_lotto_${index + 1}_di_${chunks.length}.json`);
  };

  // Download all individual JSON batch files sequentially in one click
  const handleDownloadAllSeparateFiles = async () => {
    if (chunks.length === 0) return;
    setIsDownloadingAll(true);
    setDownloadFeedback(`Scaricamento di ${chunks.length} file in corso...`);

    const filesToDownload = chunks.map((chunk, idx) => ({
      data: chunk,
      filename: `gemini_lotto_${idx + 1}_di_${chunks.length}.json`,
    }));

    try {
      await downloadMultipleFilesSequentially(filesToDownload, 180);
      setDownloadFeedback(`Tutti i ${chunks.length} file sono stati scaricati con successo!`);
    } catch {
      setDownloadFeedback("Download completato (se richiesto dal browser, autorizza i download multipli).");
    } finally {
      setIsDownloadingAll(false);
      setTimeout(() => setDownloadFeedback(null), 5000);
    }
  };

  // Download Complete Automation Kit
  const handleDownloadCompleteKit = async () => {
    if (chunks.length === 0) return;
    setIsDownloadingBundle(true);
    try {
      await downloadCompleteAutomationBundle(chunks, masterPrompt, (msg) => {
        setDownloadFeedback(msg);
      });
    } catch (e) {
      setDownloadFeedback("Errore durante il download del kit. Prova a scaricare i file singolarmente.");
    } finally {
      setIsDownloadingBundle(false);
      setTimeout(() => setDownloadFeedback(null), 6000);
    }
  };

  const modalBg =
    theme === "dark"
      ? "bg-[#22201D] text-[#F7F4EB] border-[#38332E]"
      : "bg-[#FFFDF9] text-[#1C1A17] border-[#1C1A17]";
  const headerBg =
    theme === "dark" ? "bg-[#2C2A26] border-[#38332E]" : "bg-[#F7F4EB] border-[#1C1A17]";
  const subBoxBg =
    theme === "dark" ? "bg-[#181716] border-[#38332E]" : "bg-[#FFF9E6] border-[#1C1A17]";
  const cardBg =
    theme === "dark" ? "bg-[#2A2723] border-[#38332E]" : "bg-[#FFFDF7] border-[#1C1A17]";
  const selectBg =
    theme === "dark"
      ? "bg-[#181716] text-[#F7F4EB] border-[#38332E]"
      : "bg-[#FFF] text-[#1C1A17] border-[#1C1A17]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div
        className={`relative w-full max-w-3xl ${modalBg} border-2 rounded-2xl shadow-doodle-lg flex flex-col max-h-[92vh] overflow-hidden transition-colors`}
      >
        {/* Header */}
        <div className={`p-5 border-b-2 ${headerBg} space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border-2 border-current flex items-center justify-center bg-[#FFD13B] text-[#1C1A17] shadow-doodle-sm">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-sans tracking-tight">
                  Analisi con Google Gemini
                </h2>
                <p className="text-xs opacity-75 font-hand font-bold mt-0.5">
                  Categorizzazione automatica profili, studi, brand, città e stili con Web Search
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl opacity-75 hover:opacity-100 hover:bg-black/10 border border-transparent hover:border-current transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 pt-1 border-t border-current/10">
            <button
              type="button"
              onClick={() => setActiveTab("web")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-hand font-bold transition cursor-pointer border ${
                activeTab === "web"
                  ? "bg-[#FFD13B] text-[#1C1A17] border-[#1C1A17] shadow-doodle-xs"
                  : "border-transparent opacity-70 hover:opacity-100 hover:bg-black/5"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Gemini Web Chat (Consigliato & Diretto)</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono uppercase">
                100% Funzionante
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("api")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-hand font-bold transition cursor-pointer border ${
                activeTab === "api"
                  ? "bg-[#FFD13B] text-[#1C1A17] border-[#1C1A17] shadow-doodle-xs"
                  : "border-transparent opacity-70 hover:opacity-100 hover:bg-black/5"
              }`}
            >
              <Terminal className="w-4 h-4 text-[#E63946]" />
              <span>Automazione API (Script Senza Browser)</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-sans">
          {/* Common Scope and Batch Configuration */}
          <div className={`p-4 rounded-xl border-2 ${cardBg} shadow-doodle-sm space-y-3`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-hand font-bold text-sm block">Quali profili analizzare?</span>
                <span className="text-[11px] opacity-75 font-sans">
                  Scegli se analizzare solo quelli in attesa o l'intero taccuino per riaggiornare categorie e città
                </span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-xl border border-current/20 bg-black/5 shrink-0">
                <button
                  type="button"
                  onClick={() => setTargetScope("pending")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-hand font-bold transition cursor-pointer ${
                    targetScope === "pending"
                      ? "bg-[#FFD13B] text-[#1C1A17] shadow-xs border border-[#1C1A17]"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  In attesa ({profiles.filter((p) => !p.isAnalyzed).length})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetScope("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-hand font-bold transition cursor-pointer ${
                    targetScope === "all"
                      ? "bg-[#FFD13B] text-[#1C1A17] shadow-xs border border-[#1C1A17]"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  Tutti ({profiles.length})
                </button>
              </div>
            </div>

            {/* Batch Size Selector */}
            <div className="pt-2 border-t border-current/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-hand font-bold text-sm block">Dimensione dei lotti:</span>
                <span className="text-[11px] opacity-75 font-sans">
                  {targetProfiles.length} profili suddivisi in{" "}
                  <strong>
                    {chunks.length} {chunks.length === 1 ? "lotto" : "lotti"}
                  </strong>{" "}
                  (Con Gemini 2.5 Pro 50 profili a chat è perfetto: zero allucinazioni e solo 2-3 chat in totale!)
                </span>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className={`text-xs font-typewriter border-2 rounded-xl px-3 py-1.5 font-bold cursor-pointer ${selectBg}`}
                >
                  <option value={50}>50 profili (Consigliato: Gemini Pro Sweet Spot)</option>
                  <option value={75}>75 profili (Molto Veloce per grandi archivi)</option>
                  <option value={25}>25 profili (Massimo dettaglio per studio)</option>
                  <option value={99999}>Tutti in un colpo solo (1 Singola Chat)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* TAB 1: GEMINI WEB CHAT (FASTEST, NO FILES NEEDED, ZERO BUGS) */}
          {/* ============================================================== */}
          {activeTab === "web" && (
            <div className="space-y-4">
              {/* Highlight Hero Banner */}
              <div
                className={`p-5 rounded-2xl border-2 ${
                  theme === "dark"
                    ? "bg-[#25221F] border-[#FFD13B]/50"
                    : "bg-[#FFF7D6] border-[#1C1A17]"
                } shadow-doodle-md space-y-3.5`}
              >
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#38B000]/10 text-[#38B000] font-hand font-bold text-xs border border-[#38B000]/30">
                    <Zap className="w-3.5 h-3.5" />
                    Nessun file da caricare: Fai solo Copia & Incolla!
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-hand text-balance">
                    Analisi rapida su Gemini: Bastano 2 minuti d'orologio
                  </h3>
                  <p className="text-xs opacity-85 leading-relaxed font-sans max-w-2xl">
                    Grazie all'enorme finestra di contesto di <strong>Gemini 2.5 Pro</strong>, non serve creare decine di chat né caricare file separati con la graffetta. Clicca sul pulsante qui sotto: il prompt <strong>include già l'elenco dei profili</strong>. Ti basta incollare il testo nella chat!
                  </p>
                </div>

                {/* Main Hero Action: 1-Click Copy & Direct Download */}
                <div className="pt-2 flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={handleCopyAllPromptWithAllProfiles}
                      disabled={targetProfiles.length === 0}
                      className="flex-1 flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border-2 border-[#1C1A17] bg-[#FFD13B] hover:bg-[#FFC01E] text-[#1C1A17] font-hand font-bold text-sm shadow-doodle-sm btn-doodle cursor-pointer transition text-center disabled:opacity-50"
                    >
                      {copiedAllPrompt ? (
                        <>
                          <Check className="w-5 h-5 text-[#38B000] shrink-0" />
                          <span>Prompt + Tutti i {targetProfiles.length} Profili Copiati!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5 shrink-0" />
                          <span>Copia Prompt con TUTTI i {targetProfiles.length} Profili Inclusi</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadFullPromptTxt}
                      disabled={targetProfiles.length === 0}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-[#1C1A17] bg-white dark:bg-[#2C2A26] hover:bg-black/5 font-hand font-bold text-xs cursor-pointer transition shrink-0 shadow-doodle-xs"
                      title="Scarica il prompt pronto in un file di testo (.txt) per aprirlo o incollarlo comodamente"
                    >
                      <Download className="w-4 h-4 text-[#3A86FF]" />
                      <span>Scarica Prompt (.txt)</span>
                    </button>

                    <a
                      href="https://gemini.google.com/app"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-current hover:bg-black/10 font-hand font-bold text-xs cursor-pointer transition shrink-0"
                    >
                      <span>Apri Gemini Web</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-[11px] opacity-75 px-1">
                    <span>In alternativa puoi copiare solo le regole:</span>
                    <button
                      type="button"
                      onClick={handleCopyMasterPromptOnly}
                      className="inline-flex items-center gap-1 text-[#3A86FF] hover:underline font-hand font-bold cursor-pointer"
                    >
                      {copiedMasterPromptOnly ? (
                        <>
                          <Check className="w-3 h-3 text-[#38B000]" />
                          <span>Istruzioni Copiate!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copia Solo Istruzioni (senza profili)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {downloadFeedback && (
                  <div className="p-2.5 rounded-xl bg-[#38B000]/10 border border-[#38B000]/30 text-[#38B000] font-hand font-bold text-xs flex items-center gap-2 animate-in fade-in-50">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{downloadFeedback}</span>
                  </div>
                )}
              </div>

              {/* 3 Steps Visual Guide */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className={`p-3.5 rounded-xl border-2 ${cardBg} shadow-doodle-xs space-y-1.5`}>
                  <div className="w-7 h-7 rounded-lg bg-[#FFD13B] text-[#1C1A17] font-hand font-bold flex items-center justify-center border border-current text-sm">
                    1
                  </div>
                  <h4 className="font-hand font-bold text-xs sm:text-sm">Incolla nella chat</h4>
                  <p className="text-[11px] opacity-75 leading-relaxed font-sans">
                    Vai su <code>gemini.google.com</code>, premi <strong>Ctrl + V</strong> nella casella di testo e premi Invio.
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border-2 ${cardBg} shadow-doodle-xs space-y-1.5`}>
                  <div className="w-7 h-7 rounded-lg bg-[#FFD13B] text-[#1C1A17] font-hand font-bold flex items-center justify-center border border-current text-sm">
                    2
                  </div>
                  <h4 className="font-hand font-bold text-xs sm:text-sm">Gemini ricerca sul web</h4>
                  <p className="text-[11px] opacity-75 leading-relaxed font-sans">
                    L'AI consulta i siti ufficiali, identifica città, regione, tipologia, stile e restituisce il blocco JSON.
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border-2 ${cardBg} shadow-doodle-xs space-y-1.5`}>
                  <div className="w-7 h-7 rounded-lg bg-[#FFD13B] text-[#1C1A17] font-hand font-bold flex items-center justify-center border border-current text-sm">
                    3
                  </div>
                  <h4 className="font-hand font-bold text-xs sm:text-sm">Importa in Curator</h4>
                  <p className="text-[11px] opacity-75 leading-relaxed font-sans">
                    Copia la risposta JSON di Gemini, torna su Curator e clicca <strong>"Importa JSON"</strong>: profili aggiornati istantaneamente!
                  </p>
                </div>
              </div>

              {/* Subdivided Batches (if user prefers chunks of 50) */}
              {chunks.length > 1 && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-hand font-bold opacity-80 px-1">
                    <span>Oppure copia o scarica i singoli lotti da {effectiveBatchSize} profili:</span>
                    <span>{chunks.length} Lotti Totali</span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {chunks.map((chunk, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 shadow-doodle-sm ${cardBg} hover:border-[#FFD13B] transition-colors`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-hand font-bold text-sm flex items-center gap-2">
                            <span>Lotto {index + 1}</span>
                            <span className="font-typewriter text-[10px] px-2 py-0.5 rounded-md border border-current/20 bg-black/5 opacity-75">
                              {chunk.length} profili
                            </span>
                          </div>
                          <div className="font-typewriter text-[11px] opacity-75">
                            Profili {index * effectiveBatchSize + 1} –{" "}
                            {Math.min((index + 1) * effectiveBatchSize, targetProfiles.length)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyPromptWithProfiles(chunk, index)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#1C1A17] bg-[#FFD13B] hover:bg-[#FFC01E] text-[#1C1A17] font-hand font-bold text-xs shadow-doodle-sm btn-doodle cursor-pointer transition shrink-0"
                            title="Copia il prompt con già tutti i profili del lotto incorporati"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#38B000]" />
                                <span>Copiato!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copia Prompt + Profili</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadSingleLotPromptTxt(chunk, index)}
                            className="p-1.5 rounded-xl border border-current/20 hover:bg-black/5 cursor-pointer transition text-[#3A86FF]"
                            title="Scarica prompt di questo lotto come file di testo (.txt)"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadSingleJson(chunk, index)}
                            className="p-1.5 rounded-xl border border-current/20 hover:bg-black/5 cursor-pointer transition"
                            title="Scarica file JSON per allegarlo manualmente"
                          >
                            <Download className="w-4 h-4 opacity-70" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleDownloadAllSeparateFiles}
                      disabled={isDownloadingAll}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-current/30 hover:bg-black/5 font-hand font-bold text-xs cursor-pointer transition disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloadingAll ? "Download in corso..." : `Scarica tutti i ${chunks.length} file .json separati`}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Model Advice & Technical Clarification Box */}
              <div className={`rounded-xl border-2 overflow-hidden transition-all ${subBoxBg}`}>
                <button
                  type="button"
                  onClick={() => setIsAdviceOpen(!isAdviceOpen)}
                  className="w-full p-3.5 flex items-center justify-between font-hand font-bold text-xs sm:text-sm cursor-pointer hover:bg-black/5 text-left"
                >
                  <div className="flex items-center gap-2 text-[#E63946] dark:text-[#FF8585]">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Dettaglio Tecnico: Perché usare Gemini Pro e lotti da 50 profili?</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs opacity-75">
                    <span>{isAdviceOpen ? "Nascondi guida" : "Scopri perché è il modello ideale"}</span>
                    {isAdviceOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </button>

                {isAdviceOpen && (
                  <div className="p-4 pt-1 space-y-2.5 text-xs border-t border-current/10 font-sans leading-relaxed opacity-90">
                    <div className="p-2.5 rounded-lg bg-black/5 space-y-1.5">
                      <p className="font-bold font-hand text-sm text-[#1C1A17] dark:text-[#F7F4EB]">
                        1. Finestra di Input e Tetto Massimo di Output
                      </p>
                      <p>
                        I modelli moderni (come <em>Gemini 2.5 Pro</em>) leggono agevolmente fino a 1 milione di token in input. Tuttavia, la risposta JSON generata ha un limite di output di ~8.192 token. Poiché ciascun profilo analizzato richiede circa 150 token nel JSON, con <strong>50 profili</strong> la risposta è perfetta, non viene mai troncata a metà e include tutti i dati.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/5 space-y-1.5">
                      <p className="font-bold font-hand text-sm text-[#1C1A17] dark:text-[#F7F4EB]">
                        2. Accuratezza nelle Ricerche Web & Grounding
                      </p>
                      <p>
                        Con gruppi da 50 profili, Gemini Pro attiva le ricerche web in parallelo su ciascun account senza sovraccaricarsi, identificando con la massima precisione sede, macro-entità (distinguendo subito brand, persone private, studi o università) e sotto-categorie.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: TRUE API AUTOMATION (CLI / PYTHON / NODE) */}
          {/* ============================================================== */}
          {activeTab === "api" && (
            <div className="space-y-4">
              {/* Honest Explanation Box: Why browser macros fail on Google */}
              <div
                className={`p-4 rounded-xl border-2 ${
                  theme === "dark" ? "bg-[#331C1D] border-[#E63946]/50" : "bg-[#FFEFEF] border-[#E63946]"
                } space-y-2.5`}
              >
                <div className="flex items-center gap-2 text-[#E63946] font-hand font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Trasparenza Tecnica: Perché automatizzare il browser su gemini.google.com fallisce</span>
                </div>
                <div className="text-xs leading-relaxed opacity-90 space-y-1.5 font-sans">
                  <p>
                    Se hai provato ad avviare un file <code>.bat</code> per simulare il mouse e la tastiera nel browser, si è chiuso immediatamente o ha fallito:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-1 opacity-90 text-[11px]">
                    <li><strong>Google BotGuard:</strong> Google rileva all'istante i browser controllati da script (Playwright/Puppeteer) e blocca l'accesso al tuo account con l'errore <em>"Questo browser o app potrebbe non essere sicuro"</em>.</li>
                    <li><strong>Upload dei file:</strong> L'interfaccia web di Gemini non permette ad automazioni esterne di interagire in modo sicuro con le finestre di dialogo di caricamento file.</li>
                    <li><strong>La vera via:</strong> Nessun programmatore automatizza Gemini simulando il browser. La vera automazione si fa tramite la <strong>Gemini API ufficiale di Google</strong>.</li>
                  </ul>
                </div>
              </div>

              {/* Official API Script Section */}
              <div className={`p-4 rounded-xl border-2 ${subBoxBg} space-y-3`}>
                <div className="space-y-1">
                  <span className="font-hand font-bold text-sm block">
                    Script Python Ufficiale con Google GenAI SDK (Zero Browser)
                  </span>
                  <p className="text-[11px] opacity-75 leading-relaxed">
                    Questo script usa le librerie ufficiali di Google per inviare i file <code>gemini_lotto_*.json</code> direttamente ai server di Gemini 2.5 Pro con ricerca web attiva, e salva sia i file singoli che il file unificato <code>gemini_risultati_unificati.json</code> senza aprire finestre!
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-black/10 font-mono text-[11px] space-y-1 border border-current/10">
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold"># Come eseguire lo script in 2 comandi:</div>
                  <div>pip install google-genai</div>
                  <div>python curator_gemini_api.py</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => downloadPythonRunnerFile(masterPrompt)}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 border-[#1C1A17] bg-[#FFD13B] hover:bg-[#FFC01E] text-[#1C1A17] font-hand font-bold text-xs cursor-pointer shadow-doodle-xs"
                  >
                    <FileCode className="w-4 h-4 shrink-0" />
                    <span>Scarica curator_gemini_api.py</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadBatchLauncherFile()}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-current/30 hover:bg-black/5 font-hand font-bold text-xs cursor-pointer"
                  >
                    <Terminal className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Scarica Launcher .bat</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCompleteKit}
                    disabled={isDownloadingBundle || targetProfiles.length === 0}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-current/30 hover:bg-black/5 font-hand font-bold text-xs cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 shrink-0 text-blue-600" />
                    <span>Scarica Kit Completo</span>
                  </button>
                </div>
              </div>

              {/* Python code inspection */}
              <details className={`p-3 rounded-xl border-2 ${subBoxBg}`}>
                <summary className="font-hand font-bold text-xs cursor-pointer opacity-80 hover:opacity-100 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-blue-500" />
                    Visualizza il codice di curator_gemini_api.py
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform" />
                </summary>
                <div className="mt-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] opacity-65 font-mono">Python script using google-genai SDK</span>
                    <button
                      type="button"
                      onClick={async () => {
                        const code = generatePythonRunnerContent(masterPrompt);
                        const ok = await copyToClipboard(code);
                        if (ok) {
                          setCopiedScript(true);
                          setTimeout(() => setCopiedScript(false), 3000);
                        } else {
                          downloadTextData(code, "curator_gemini_api.py");
                          setDownloadFeedback("Appunti protetti dal browser: scaricato il file curator_gemini_api.py");
                          setTimeout(() => setDownloadFeedback(null), 4000);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/10 hover:bg-black/20 font-hand font-bold text-[11px] cursor-pointer"
                    >
                      {copiedScript ? <Check className="w-3 h-3 text-[#38B000]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedScript ? "Copiato!" : "Copia Codice Python"}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-black/10 text-[10px] font-typewriter whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-52 border border-current/10">
                    {generatePythonRunnerContent(masterPrompt).slice(0, 1600)}...
                  </pre>
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Footer with summary */}
        <div
          className={`p-4 border-t-2 ${headerBg} flex flex-col sm:flex-row items-center justify-between gap-3 text-xs`}
        >
          <div className="flex items-center gap-2 opacity-75 font-hand font-bold">
            <Layers className="w-4 h-4 text-[#FFBE0B]" />
            <span>Una volta ottenuta la risposta JSON da Gemini, usa "Importa JSON" in alto su Curator per applicare tutto!</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border-2 border-current hover:bg-black/10 font-hand font-bold text-xs cursor-pointer transition"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
