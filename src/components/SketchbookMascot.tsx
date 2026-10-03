import React, { useState } from 'react';
import { Sparkles, MessageCircle, X } from 'lucide-react';

interface SketchbookMascotProps {
  totalCount: number;
  curatedCount: number;
}

const QUOTES = [
  "Ciao! Ho organizzato tutti gli studi nel taccuino con penna e pastelli a cera! 🖍️",
  "💡 Consiglio da designer: Prova la vista Rete o Mappa per esplorare le connessioni visive!",
  "🎨 I colori a cera ti aiutano a riconoscere subito Branding, Architettura, Tipo e Motion!",
  "✏️ Tratto a penna stilografica e carta calda: molto più ispirante per lavorare!",
  "📦 Puoi scaricare tutto in Excel (.xlsx) per il tuo archivio personale in un lampo!",
  "✨ 'La semplicità è l'apice della sofisticazione' — sfoglia gli studi e lasciati ispirare!"
];

export const SketchbookMascot: React.FC<SketchbookMascotProps> = ({ totalCount, curatedCount }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [isWaving, setIsWaving] = useState(false);

  const handleNextQuote = () => {
    setIsWaving(true);
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    setTimeout(() => setIsWaving(false), 600);
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Speech Bubble */}
      {isOpen && (
        <div 
          onClick={handleNextQuote}
          className="cursor-pointer group hidden sm:flex items-center gap-2 bg-[#FFFDF7] border-2 border-[#1C1A17] py-1.5 px-3 rounded-xl shadow-doodle-sm mr-2.5 max-w-[260px] md:max-w-[320px] transition-transform hover:-translate-y-0.5"
          title="Clicca per un altro pensiero d'ispirazione!"
        >
          <div className="w-2 h-2 rounded-full bg-[#FF5E8E] shrink-0 animate-pulse" />
          <p className="text-[12px] font-hand text-[#1C1A17] leading-snug line-clamp-2 select-none">
            {QUOTES[quoteIndex]}
          </p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="text-[#8C827A] hover:text-[#1C1A17] p-0.5 ml-1 shrink-0"
            title="Nascondi fumetto"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Naive Hand-Drawn Character Button */}
      <button
        onClick={handleNextQuote}
        className={`relative group bg-[#FFFDF7] border-2 border-[#1C1A17] p-1 rounded-full shadow-doodle-sm hover:shadow-doodle transition-all duration-200 cursor-pointer ${
          isWaving ? '-rotate-6 scale-105' : 'hover:rotate-3'
        }`}
        title="Il compagno illustrato del taccuino (Clicca per salutare!)"
      >
        {/* SVG Naive Character drawn with ink & crayon fills */}
        <svg 
          width="42" 
          height="42" 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          {/* Crayon smudge halo behind */}
          <circle cx="50" cy="50" r="46" fill="#FDE047" fillOpacity="0.45" />

          {/* Waving Arm / Curly Wiggly hand */}
          <path
            d="M68 58 C78 50, 85 40, 80 28 C76 20, 86 16, 88 12"
            stroke="#1C1A17"
            strokeWidth="3.5"
            strokeLinecap="round"
            className={isWaving ? "animate-bounce" : ""}
          />
          {/* Hand 4 naive fingers */}
          <circle cx="89" cy="11" r="5" fill="#FDBA74" stroke="#1C1A17" strokeWidth="2.5" />
          <path d="M85 8 L84 4 M88 7 L90 3 M92 9 L96 6" stroke="#1C1A17" strokeWidth="2" strokeLinecap="round" />

          {/* Body / Yellow Shirt */}
          <path
            d="M30 68 C32 60, 40 56, 50 56 C60 56, 68 60, 70 68 L68 96 C56 98, 44 98, 32 96 Z"
            fill="#FACC15"
            stroke="#1C1A17"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Blue Tie */}
          <polygon
            points="50,60 54,67 52,86 50,89 48,86 46,67"
            fill="#2563EB"
            stroke="#1C1A17"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Head & Neck */}
          <rect x="45" y="48" width="10" height="10" fill="#FDBA74" stroke="#1C1A17" strokeWidth="2" />
          <ellipse
            cx="50"
            cy="36"
            rx="19"
            ry="22"
            fill="#FED7AA"
            stroke="#1C1A17"
            strokeWidth="3"
          />

          {/* Crayon Pink Cheeks */}
          <circle cx="39" cy="40" r="4" fill="#FF5E8E" fillOpacity="0.6" />
          <circle cx="61" cy="40" r="4" fill="#FF5E8E" fillOpacity="0.6" />

          {/* Curly Hair with crayon texture */}
          <path
            d="M33 28 C30 20, 40 14, 50 14 C60 14, 70 18, 67 28 C64 24, 58 22, 50 23 C42 22, 36 25, 33 28 Z"
            fill="#78350F"
            stroke="#1C1A17"
            strokeWidth="2.5"
          />
          {/* Hair Bun / Curl */}
          <circle cx="68" cy="24" r="8" fill="#78350F" stroke="#1C1A17" strokeWidth="2.5" />
          <circle cx="68" cy="24" r="4" fill="#92400E" />

          {/* Eyes (naive dots) */}
          <ellipse cx="44" cy="32" rx="2" ry="2.5" fill="#1C1A17" />
          <ellipse cx="56" cy="32" rx="2" ry="2.5" fill="#1C1A17" />

          {/* Eyebrows (loose sketchy marks) */}
          <path d="M40 27 Q44 26 47 28" stroke="#1C1A17" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M53 28 Q56 26 60 27" stroke="#1C1A17" strokeWidth="2.5" strokeLinecap="round" />

          {/* Nose (L shaped naive line) */}
          <path d="M50 31 L50 38 L53 38" stroke="#1C1A17" strokeWidth="2.2" strokeLinecap="round" />

          {/* Mustache */}
          <path
            d="M44 42 C47 40, 50 44, 50 44 C50 44, 53 40, 56 42"
            stroke="#1C1A17"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Smile */}
          <path
            d="M46 47 Q50 50 54 47"
            stroke="#1C1A17"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Small floating crayon dot */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E63946] border border-[#1C1A17] rounded-full flex items-center justify-center text-[7px] font-bold text-white">
          ★
        </span>
      </button>
    </div>
  );
};
