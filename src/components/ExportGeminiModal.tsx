import React, { useState } from "react";
import { Download, Copy, X, CheckCircle2, ChevronRight, AlertCircle, Sparkles } from "lucide-react";
import { InstagramProfile } from "../types";
import { downloadJSONData } from "../utils/exportUtils";

interface ExportGeminiModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: InstagramProfile[];
  theme?: 'light' | 'dark';
}

export const ExportGeminiModal: React.FC<ExportGeminiModalProps> = ({ isOpen, onClose, profiles, theme = 'light' }) => {
  const [batchSize, setBatchSize] = useState(100);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const pendingProfiles = profiles
    .filter(p => !p.isAnalyzed)
    .map(p => ({
      username: p.username,
      instagramUrl: p.profileUrl || `https://instagram.com/${p.username}`,
      displayName: p.displayName || "",
      notes: p.notes || ""
    }));

  const chunks = [];
  for (let i = 0; i < pendingProfiles.length; i += batchSize) {
    chunks.push(pendingProfiles.slice(i, i + batchSize));
  }

  const generatePromptText = (chunkIndex: number) => {
    return `Sei un analista esperto nella classificazione e ricerca di account Instagram.
Ti sto allegando un file JSON (lotto ${chunkIndex + 1}) contenente un elenco di profili Instagram, inclusi i loro URL ufficiali (instagramUrl).
Per ciascun profilo, usa la funzione Web Search per trovare la sua reale bio pubblica, cercare il link al suo sito web ufficiale e il contesto (es. tramite Linktree, sito web o profili social correlati) per capire ESATTAMENTE chi sono e cosa fanno. Usa le informazioni trovate nel sito web, se presente, per un'analisi più precisa.

REGOLE CONTRO LE ALLUCINAZIONI (MOLTO IMPORTANTE):
Nella lista NON ci sono solo studi di design o artisti. Ci sono anche persone comuni, amici, istituzioni, università, ristoranti, influencer e brand generici.
Se un profilo è di un amico, un conoscente, una persona privata, o non trovi alcuna informazione pubblica rilevante, NON inventare professioni creative. Piuttosto lascia i campi vuoti (stringa vuota "") o usa la categoria "Persona Privata". Preferisco avere campi vuoti piuttosto che dati inventati. Non dedurre la professione solo dal nome.

Restituisci SOLO ED ESCLUSIVAMENTE un array JSON valido (nessun markdown, nessuna formattazione extra) con questa esatta struttura per ogni oggetto:

[
  {
    "username": "...",
    "aiAnalysis": {
      "displayName": "Nome reale completo o nome del brand. Se persona privata senza nome noto, lascia vuoto.",
      "category": "Una tra: 'Design & Arte', 'Persona Privata / Amico', 'Content Creator / Influencer', 'Brand / Negozio / Azienda', 'Istituzione / Università / Scuola', 'Musica & Spettacolo', 'Fotografia', 'Altro'",
      "studioType": "Specifica meglio (es. 'Profilo Personale', 'Agenzia Creativa', 'Università', 'Ristorante', 'Fashion Blogger'). Se incerto, lascia vuoto.",
      "locationCity": "Città principale (se pubblicamente indicata, altrimenti lascia vuoto)",
      "locationCountry": "Paese in italiano (se indicato, altrimenti lascia vuoto)",
      "countryCode": "Codice ISO 2 lettere (es. IT, US, GB) o vuoto",
      "locationState": "Stato/Regione (opzionale)",
      "locationRegion": "Regione (opzionale)",
      "locationStreet": "Via (opzionale)",
      "visualStyle": "Se è un brand/creativo descrivi lo stile in 1 frase. Se è un amico/istituzione, lascia vuoto.",
      "keySpecialties": ["tag1", "tag2"], // Array di max 3 tag descrittivi reali
      "designTags": ["Automotive"], // Array di tag specifici per il tipo di design. Scegli da un roster coerente: Light Design, Automotive, Product Design, Architecture, Interior Design, UI/UX, Graphic Design, 3D Modeling, Animation, Video Production, Illustration, Branding, Fashion, Photography, Art, CGI, VFX, Motion Graphics, Altro.
      "description": "Breve sintesi FATTUALE (1-2 frasi) di chi sono, basata SOLO sulle info trovate. Se non c'è nulla, lascia vuoto.",
      "website": "Sito web ufficiale (se presente)"
    }
  }
]

Assicurati che l'output sia formattato ESATTAMENTE come l'esempio JSON qui sopra. Non omettere assolutamente nessun profilo presente nel file JSON allegato.`;
  };

  const handleCopyAndDownload = (chunk: any[], index: number) => {
    const prompt = generatePromptText(index);
    navigator.clipboard.writeText(prompt);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 3000);

    downloadJSONData(chunk, `gemini_lotto_${index + 1}.json`);
  };

  const modalBg = theme === 'dark' ? 'bg-[#22201D] text-[#F7F4EB] border-[#38332E]' : 'bg-[#FFFDF9] text-[#1C1A17] border-[#1C1A17]';
  const headerBg = theme === 'dark' ? 'bg-[#2C2A26] border-[#38332E]' : 'bg-[#F7F4EB] border-[#1C1A17]';
  const subBoxBg = theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#FFF9E6] border-[#1C1A17]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div className={`relative w-full max-w-2xl ${modalBg} border-2 rounded-2xl shadow-doodle-lg flex flex-col max-h-[85vh] overflow-hidden transition-colors`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b-2 ${headerBg}`}>
          <div>
            <h2 className="text-xl font-bold font-sans">Analisi a Lotti con Gemini</h2>
            <p className="text-xs opacity-75 font-hand font-bold mt-0.5">Prepara i lotti per l'analisi offline</p>
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
          {pendingProfiles.length === 0 ? (
            <div className={`p-8 text-center rounded-2xl border-2 border-dashed ${subBoxBg}`}>
              <Sparkles className="w-8 h-8 text-[#FFBE0B] mx-auto mb-2" />
              <p className="font-hand font-bold text-lg">Tutti i profili sono già stati analizzati!</p>
              <p className="text-xs opacity-75 mt-1 font-sans">Non ci sono profili in attesa nel taccuino.</p>
            </div>
          ) : (
            <>
              <div className={`flex items-center justify-between p-3.5 rounded-xl border ${subBoxBg}`}>
                <div>
                  <span className="font-hand font-bold text-sm">Profili da analizzare:</span>
                  <span className="font-typewriter text-xs font-bold text-[#E63946] ml-2">{pendingProfiles.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-hand font-bold text-xs opacity-80">Dimensione lotto:</span>
                  <select
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    className={`text-xs font-typewriter border rounded-lg px-2 py-1 ${theme === 'dark' ? 'bg-[#181716] border-[#38332E]' : 'bg-[#FFF] border-[#1C1A17]'}`}
                  >
                    <option value={50}>50 profili</option>
                    <option value={100}>100 profili</option>
                    <option value={200}>200 profili</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {chunks.map((chunk, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 shadow-doodle-sm ${subBoxBg}`}
                  >
                    <div>
                      <div className="font-hand font-bold text-base">
                        Lotto {index + 1}
                      </div>
                      <div className="font-typewriter text-[11px] opacity-75">
                        {chunk.length} profili ({index * batchSize + 1} - {Math.min((index + 1) * batchSize, pendingProfiles.length)})
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyAndDownload(chunk, index)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-hand font-bold text-xs bg-[#FFD13B] hover:bg-[#FFC01E] border-2 border-[#1C1A17] shadow-xs btn-doodle cursor-pointer text-[#1C1A17]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{copiedIndex === index ? "Copiato & Scaricato!" : "Scarica & Copia Prompt"}</span>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
