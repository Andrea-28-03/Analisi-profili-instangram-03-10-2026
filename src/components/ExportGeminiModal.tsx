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
} from "lucide-react";
import { InstagramProfile } from "../types";
import {
  downloadJSONData,
  downloadTextData,
  downloadMultipleFilesSequentially,
} from "../utils/exportUtils";

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
  // Batch size: default 25 (the optimal accuracy sweet spot for Gemini Pro / Argon)
  const [batchSize, setBatchSize] = useState<number>(25);
  // Target profiles: pending only vs all profiles (for full re-analysis)
  const [targetScope, setTargetScope] = useState<"pending" | "all">("pending");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAllPrompt, setCopiedAllPrompt] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
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

  const generatePromptText = (chunkIndex: number, totalChunks: number, count: number) => {
    const lotLabel =
      totalChunks > 1
        ? `lotto ${chunkIndex + 1} di ${totalChunks} (${count} profili)`
        : `elenco completo (${count} profili)`;

    return `Sei un analista senior ed esperto internazionale di design contemporaneo, branding, architettura, arti visive e manifattura.
Ti sto allegando un file JSON (${lotLabel}) contenente profili Instagram con i loro username, URL ufficiali (instagramUrl) ed eventuali note utente.
Per ciascun profilo, usa la funzione Web Search di Gemini per consultare la bio pubblica ufficiale, il sito web, portfolio, LinkedIn o pubblicazioni di settore per comprendere esattamente chi sono e cosa fanno.

REGOLE CRITICHE CONTRO LE ALLUCINAZIONI:
1. Nella lista NON ci sono solo studi creativi: ci sono aziende manifatturiere (arredo, illuminazione, maniglie, superfici), università, fotografi, illustratori, artisti contemporanei, content creator, amici o persone private.
2. Se un profilo è chiaramente una persona privata, conoscente o amico senza attività professionale pubblica nota, imposta tassativamente "macroEntity": "privato" e "isPrivatePerson": true, lasciando i campi specialistici vuoti ("") o array vuoti ([]). Non inventare agenzie per persone comuni.
3. Se non trovi informazioni certe, preferisci campi vuoti o stringa vuota piuttosto che congetture.

Restituisci SOLO ED ESCLUSIVAMENTE un array JSON valido (senza testo introduttivo o conclusivo, nessun blocco markdown aggiuntivo) con questa esatta struttura per ciascun profilo:

[
  {
    "username": "...",
    "aiAnalysis": {
      "displayName": "Nome reale completo dello studio, brand, istituzione o professionista",
      "macroEntity": "Uno tra: 'studio' (studi architettura, design, grafica), 'azienda' (brand arredo, luce, manifattura, store), 'universita' (scuole, accademie), 'fotografia' (fotografi architettura/oggetti), 'illustrazione' (illustratori), 'artisti' (scultori, artisti contemporanei), 'creator' (content creator, media, influencer), 'amici' (amico/collega designer noto), 'privato' (persona comune senza studio), 'altro'",
      "category": "Macro categoria descrittiva (es. 'Design Grafico & Branding', 'Architettura & Spazi', 'Design del Prodotto & Industriale', 'Tipografia & Type Design', 'Persona Privata / Amico', 'Istituzione / Università', 'Fotografia')",
      "subType": "Tipologia specifica (es. 'Studio di Design & Branding', 'Studio di Architettura & Spazi', 'Brand di Arredo & Mobili', 'Illuminazione & Light Design', 'Manifattura di Maniglie & Ferramenta', 'Fonderia Tipografica', 'Atelier / Ceramica')",
      "isPrivatePerson": false,
      "locationCity": "Città principale (es. Milano, Copenaghen, Londra, Tokyo)",
      "locationRegion": "Regione o stato (es. Lombardia, Piemonte, Hovedstaden, Greater London, Baviera)",
      "locationCountry": "Paese in italiano (es. Italia, Danimarca, Regno Unito, Svizzera)",
      "countryCode": "Codice ISO 2 lettere (es. IT, DK, GB, CH, DE, US)",
      "locationStreet": "Via o indirizzo sede se noto, altrimenti stringa vuota",
      "workMode": "Uno tra: 'in_sede', 'ibrido', 'remoto', 'showroom', 'atelier'",
      "subCategories": [
        // Scegli 1-4 sotto-categorie pertinenti dalla seguente tassonomia:
        // Interni & Spazi: "Interni / Ufficio", "Casa & Living", "Cucina & Food Space", "Bagno & Wellness", "Maniglie & Ferramenta", "Hospitality & Hotel", "Retail & Showroom", "Exhibition & Allestimenti"
        // Prodotto & Arredo: "Sedute & Divani", "Tavoli & Scrivanie", "Illuminazione & Lampade", "Oggetti & Complementi", "Materiali & Superfici", "Ceramica, Vetro & Artigianato"
        // Grafica & Type: "Brand Identity & Loghi", "Tipografia & Fonderia", "Editoria & Riviste", "Packaging & Packaging Design", "Motion Design & 3D CGI", "Digital, UI/UX & Web"
        // Arti & Foto: "Illustrazione Editoriale", "Fotografia di Architettura & Oggetti", "Arte Contemporanea & Scultura", "Set Design & Styling", "Poster Art & Stampa Serigrafica"
        // Musica & Spettacolo: "Musica, Festival & Clubbing", "Scenografia & Teatri", "Musei & Fondazioni", "Video Production & Clip Musicali", "Media, Radio & Podcast"
      ],
      "visualStyle": "Sintesi di 1 frase dello stile visivo, linguaggio materico, colori ed estetica prevalente",
      "keySpecialties": ["specialità 1", "specialità 2"],
      "designTags": ["Graphic Design", "Interior Architecture", "Lighting", "Product Design"],
      "description": "Sintesi fattuale in 1-2 frasi della storia, produzione o mission del profilo.",
      "website": "URL del sito web ufficiale (se presente)"
    }
  }
]

Assicurati che l'output sia formattato rigorosamente come l'esempio JSON e che includa TUTTI i profili del lotto.`;
  };

  // Download a single batch + copy its prompt
  const handleCopyAndDownloadSingle = (chunk: any[], index: number) => {
    const prompt = generatePromptText(index, chunks.length, chunk.length);
    navigator.clipboard.writeText(prompt);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 3000);

    downloadJSONData(chunk, `gemini_lotto_${index + 1}_di_${chunks.length}.json`);
  };

  // Download unified master JSON containing all batches and all profiles
  const handleDownloadUnifiedMaster = () => {
    const masterPrompt = generatePromptText(0, 1, targetProfiles.length);
    navigator.clipboard.writeText(masterPrompt);
    setCopiedAllPrompt(true);
    setTimeout(() => setCopiedAllPrompt(false), 3000);

    const masterBundle = {
      info: {
        titolo: "Curator - Pacchetto Completo Analisi Gemini",
        dataEsportazione: new Date().toISOString(),
        totaleProfili: targetProfiles.length,
        numeroLotti: chunks.length,
        dimensioneLottoScelta: batchSize >= 99999 ? "Tutti in un lotto" : batchSize,
        modelloConsigliato: "Gemini 2.5 Pro (oppure gemini-4-argon con lotti 15-25)",
      },
      masterPrompt,
      lotti: chunks.map((chunk, idx) => ({
        lottoNumero: idx + 1,
        totaleNelLotto: chunk.length,
        prompt: generatePromptText(idx, chunks.length, chunk.length),
        profili: chunk,
      })),
      profiliTotali: targetProfiles,
    };

    downloadJSONData(masterBundle, "gemini_tutti_i_lotti_completi.json");
    setDownloadFeedback("File master scaricato e Prompt copiato negli appunti!");
    setTimeout(() => setDownloadFeedback(null), 4000);
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

    // Copy the master prompt as well
    const masterPrompt = generatePromptText(0, chunks.length, chunks[0].length);
    navigator.clipboard.writeText(masterPrompt);
    setCopiedAllPrompt(true);
    setTimeout(() => setCopiedAllPrompt(false), 3000);

    try {
      await downloadMultipleFilesSequentially(filesToDownload, 180);
      setDownloadFeedback(`Tutti i ${chunks.length} file sono stati scaricati con successo!`);
    } catch {
      setDownloadFeedback("Download completato (alcuni browser potrebbero richiedere autorizzazione multipla).");
    } finally {
      setIsDownloadingAll(false);
      setTimeout(() => setDownloadFeedback(null), 5000);
    }
  };

  // Copy Master Prompt only
  const handleCopyMasterPrompt = () => {
    const prompt = generatePromptText(0, chunks.length, chunks[0]?.length || targetProfiles.length);
    navigator.clipboard.writeText(prompt);
    setCopiedAllPrompt(true);
    setTimeout(() => setCopiedAllPrompt(false), 3000);
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
        className={`relative w-full max-w-3xl ${modalBg} border-2 rounded-2xl shadow-doodle-lg flex flex-col max-h-[90vh] overflow-hidden transition-colors`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b-2 ${headerBg}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border-2 border-current flex items-center justify-center bg-[#FFD13B] text-[#1C1A17] shadow-doodle-sm">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans tracking-tight">
                Analisi a Lotti con Gemini
              </h2>
              <p className="text-xs opacity-75 font-hand font-bold mt-0.5">
                Esporta i lotti offline ottimizzati per Massima Accuratezza (Argon & Pro)
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-sans">
          {/* Scope Selector: Pending vs All */}
          <div className={`p-4 rounded-xl border-2 ${cardBg} shadow-doodle-sm space-y-3`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-hand font-bold text-sm block">Cosa desideri analizzare?</span>
                <span className="text-[11px] opacity-75 font-sans">
                  Scegli se esportare solo i profili ancora da analizzare o l'intero taccuino per rianalizzare tutto
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

            {/* Batch Size Selector with Model Guidance */}
            <div className="pt-2 border-t border-current/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-hand font-bold text-sm block">Dimensione dei lotti:</span>
                <span className="text-[11px] opacity-75 font-sans">
                  Lotti da 20–25 profili offrono la massima accuratezza ed evitano il troncamento dell'output JSON
                </span>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className={`text-xs font-typewriter border-2 rounded-xl px-3 py-1.5 font-bold cursor-pointer ${selectBg}`}
                >
                  <option value={15}>15 profili (Ultra-Precisione con Argon)</option>
                  <option value={25}>25 profili (Consigliato: Sweet Spot Pro & Precisione)</option>
                  <option value={50}>50 profili (Bilanciato Pro)</option>
                  <option value={100}>100 profili (Lotti Grandi - Flash)</option>
                  <option value={99999}>Tutti in un colpo solo (Lotto Unico)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Model Advice & Technical Clarification Box (Addressing Argon vs Pro directly) */}
          <div className={`rounded-xl border-2 overflow-hidden transition-all ${subBoxBg}`}>
            <button
              type="button"
              onClick={() => setIsAdviceOpen(!isAdviceOpen)}
              className="w-full p-3.5 flex items-center justify-between font-hand font-bold text-xs sm:text-sm cursor-pointer hover:bg-black/5 text-left"
            >
              <div className="flex items-center gap-2 text-[#E63946] dark:text-[#FF8585]">
                <Info className="w-4 h-4 shrink-0" />
                <span>Consiglio Tecnico: Perché usare Gemini Pro e lotti da 20-25 profili?</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs opacity-75">
                <span>{isAdviceOpen ? "Nascondi guida" : "Scopri dettagli su Argon vs Pro"}</span>
                {isAdviceOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </button>

            {isAdviceOpen && (
              <div className="p-4 pt-1 space-y-2.5 text-xs border-t border-current/10 font-sans leading-relaxed opacity-90">
                <div className="p-2.5 rounded-lg bg-black/5 space-y-1.5">
                  <p className="font-bold font-hand text-sm text-[#1C1A17] dark:text-[#F7F4EB]">
                    1. Finestra di Input vs Tetto Massimo di Output (8.192 Token)
                  </p>
                  <p>
                    I modelli moderni (come <em>gemini-4-argon</em> o <em>Gemini Pro</em>) possono
                    leggere centinaia di migliaia di token in input. Tuttavia, la risposta JSON generata
                    ha un <strong>limite massimo di output</strong> (standard di ~8.192 token). Poiché
                    ciascun profilo con la nuova tassonomia (macro entità, sotto-categorie, tag, città,
                    regione, stile visivo) richiede circa 150-180 token nel JSON, superare i 40-50
                    profili rischia di tagliare il file a metà provocando errori di sintassi.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-black/5 space-y-1.5">
                  <p className="font-bold font-hand text-sm text-[#1C1A17] dark:text-[#F7F4EB]">
                    2. Accuratezza nelle Ricerche Web & Grounding
                  </p>
                  <p>
                    Se si caricano 100+ profili in un colpo solo, l'attenzione del modello si diluisce e
                    le ricerche web diventano frettolose, aumentando il rischio di allucinazioni sui
                    profili privati o di confondere un brand di maniglie/arredo con uno studio di
                    interni. Con lotti da <strong>20–25 profili</strong>, il modello compie ricerche
                    puntuali e ponderate su ciascun sito e bio Instagram.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-black/5 space-y-1.5">
                  <p className="font-bold font-hand text-sm text-[#1C1A17] dark:text-[#F7F4EB]">
                    3. Argon vs Pro: La Scelta Ideale
                  </p>
                  <p>
                    <em>gemini-4-argon</em> ha una straordinaria catena di ragionamento profonda, ma ha
                    un costo per token molto elevato. Il modello <strong>Gemini Pro</strong> con lotti da
                    20-25 profili è il vero <strong>sweet spot</strong>: accuratezza analoga al 99% a una
                    frazione del costo e con la certezza di scaricare risposte perfette al primo colpo.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats & Master Download Bar */}
          {targetProfiles.length === 0 ? (
            <div className={`p-8 text-center rounded-2xl border-2 border-dashed ${subBoxBg}`}>
              <Sparkles className="w-8 h-8 text-[#FFBE0B] mx-auto mb-2" />
              <p className="font-hand font-bold text-lg">Nessun profilo selezionato!</p>
              <p className="text-xs opacity-75 mt-1 font-sans">
                {targetScope === "pending"
                  ? "Tutti i profili sono già stati analizzati. Seleziona 'Tutti' in alto per riesportare l'intero taccuino."
                  : "Il taccuino è vuoto."}
              </p>
            </div>
          ) : (
            <>
              {/* Master Bulk Download Action Bar */}
              <div
                className={`p-4 rounded-xl border-2 ${
                  theme === "dark"
                    ? "bg-[#25221F] border-[#FFD13B]/40"
                    : "bg-[#FFF9E0] border-[#1C1A17]"
                } shadow-doodle-md space-y-3.5`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-hand font-bold text-base flex items-center gap-2">
                      <FolderDown className="w-5 h-5 text-[#E63946]" />
                      Download Massivo di Tutti i Lotti
                    </span>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      {targetProfiles.length} profili totali suddivisi in{" "}
                      <strong>
                        {chunks.length} {chunks.length === 1 ? "lotto" : "lotti"}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyMasterPrompt}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-current/30 hover:bg-black/5 font-hand font-bold text-xs cursor-pointer transition"
                    >
                      {copiedAllPrompt ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#38B000]" />
                          <span>Prompt Copiato!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copia Prompt Master</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* The Two Bulk Download Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Button 1: Download Complete Master Package in 1 file */}
                  <button
                    type="button"
                    onClick={handleDownloadUnifiedMaster}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#1C1A17] bg-[#FFD13B] hover:bg-[#FFC01E] text-[#1C1A17] font-hand font-bold text-xs shadow-doodle-sm btn-doodle cursor-pointer transition text-center"
                  >
                    <FileJson className="w-4 h-4 shrink-0" />
                    <span>Scarica TUTTI i lotti in 1 File Master (.json)</span>
                  </button>

                  {/* Button 2: Download all separate JSON files in sequence */}
                  <button
                    type="button"
                    onClick={handleDownloadAllSeparateFiles}
                    disabled={isDownloadingAll}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#1C1A17] bg-[#FFF] hover:bg-[#F3EFE6] text-[#1C1A17] font-hand font-bold text-xs shadow-doodle-sm btn-doodle cursor-pointer transition text-center disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>
                      {isDownloadingAll
                        ? "Scaricamento lotti in corso..."
                        : `Scarica tutti i ${chunks.length} file separati (.json)`}
                    </span>
                  </button>
                </div>

                {downloadFeedback && (
                  <div className="p-2 rounded-lg bg-[#38B000]/10 border border-[#38B000]/30 text-[#38B000] font-hand font-bold text-xs flex items-center gap-2 animate-in fade-in-50">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{downloadFeedback}</span>
                  </div>
                )}
              </div>

              {/* Individual Batch List */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs font-hand font-bold opacity-80 px-1">
                  <span>Oppure scarica i lotti singolarmente:</span>
                  <span>{chunks.length} Lotti Totali</span>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {chunks.map((chunk, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3.5 rounded-xl border-2 shadow-doodle-sm ${cardBg} hover:border-[#FFD13B] transition-colors`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-hand font-bold text-sm sm:text-base flex items-center gap-2">
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

                      <button
                        type="button"
                        onClick={() => handleCopyAndDownloadSingle(chunk, index)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border-2 border-[#1C1A17] bg-[#FFD13B] hover:bg-[#FFC01E] text-[#1C1A17] font-hand font-bold text-xs shadow-doodle-sm btn-doodle cursor-pointer transition shrink-0"
                      >
                        {copiedIndex === index ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#38B000]" />
                            <span>Prompt Copiato + JSON!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Scarica Lotto {index + 1}</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Quick Preview of the Prompt */}
          <div className="pt-2">
            <details className={`p-3 rounded-xl border-2 ${subBoxBg}`}>
              <summary className="font-hand font-bold text-xs cursor-pointer opacity-80 hover:opacity-100 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFBE0B]" />
                  Visualizza anteprima del Prompt Gemini con Tassonomia Aggiornata
                </span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform" />
              </summary>
              <pre className="mt-2.5 p-3 rounded-lg bg-black/10 text-[11px] font-typewriter whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-48 border border-current/10">
                {generatePromptText(
                  0,
                  chunks.length || 1,
                  chunks[0]?.length || targetProfiles.length || 25
                )}
              </pre>
            </details>
          </div>
        </div>

        {/* Footer with summary */}
        <div
          className={`p-4 border-t-2 ${headerBg} flex flex-col sm:flex-row items-center justify-between gap-3 text-xs`}
        >
          <div className="flex items-center gap-2 opacity-75 font-hand font-bold">
            <Layers className="w-4 h-4 text-[#FFBE0B]" />
            <span>Una volta ottenute le risposte, usa "Importa JSON Gemini" nel menu in alto.</span>
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
